import React, { useState, useEffect, useRef } from 'react';
import { AppStep, CaseState, LitigantData, VerdictData, SyncMessage } from './types';
import { getJudgeVerdict } from './services/geminiService';
import { InputCard } from './components/InputCard';
import { VerdictCard } from './components/VerdictCard';
import { LoginCard } from './components/LoginCard';
import Peer, { DataConnection } from 'peerjs';

const INITIAL_LITIGANT: LitigantData = { name: '', story: '', grievance: '' };

// Generate Peer IDs based on Room Name to make them predictable
const getPeerId = (roomId: string, role: 'PLAINTIFF' | 'DEFENDANT') => {
  // Simple sanitation
  const cleanRoom = roomId.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  return `cat-court-${cleanRoom}-${role.toLowerCase()}`;
};

const App: React.FC = () => {
  const [state, setState] = useState<CaseState>({
    step: AppStep.LOGIN,
    plaintiff: { ...INITIAL_LITIGANT },
    defendant: { ...INITIAL_LITIGANT },
    verdict: null,
    error: null,
    roomId: '',
    role: null,
    isConnected: false
  });

  const peerRef = useRef<Peer | null>(null);
  const connRef = useRef<DataConnection | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (peerRef.current) peerRef.current.destroy();
    };
  }, []);

  // --- P2P Logic ---

  const handleJoinRoom = (roomId: string, role: 'PLAINTIFF' | 'DEFENDANT') => {
    setState(prev => ({ ...prev, roomId, role, error: null }));

    const myId = getPeerId(roomId, role);
    const targetId = getPeerId(roomId, role === 'PLAINTIFF' ? 'DEFENDANT' : 'PLAINTIFF');

    console.log(`Initializing Peer: ${myId}`);

    const peer = new Peer(myId);
    peerRef.current = peer;

    peer.on('open', (id) => {
      console.log('My Peer ID is: ' + id);
      
      if (role === 'PLAINTIFF') {
        // Plaintiff waits for connection
        peer.on('connection', (conn) => {
           setupConnection(conn);
        });
      } else {
        // Defendant initiates connection
        console.log(`Connecting to: ${targetId}`);
        const conn = peer.connect(targetId);
        setupConnection(conn);
      }
    });

    peer.on('error', (err) => {
      console.error(err);
      let errorMsg = "Connection Error.";
      if (err.type === 'unavailable-id') {
        errorMsg = "该房间/角色已被占用 (Room ID taken).";
        if (role === 'PLAINTIFF') errorMsg += " 尝试换个房间号，或者对方已经是原告了。";
        if (role === 'DEFENDANT') errorMsg += " 请检查原告是否已创建房间，或尝试换个房间号。";
      }
      setState(prev => ({ ...prev, error: errorMsg, isConnected: false }));
    });
  };

  const setupConnection = (conn: DataConnection) => {
    conn.on('open', () => {
      console.log("Connected to peer!");
      connRef.current = conn;
      setState(prev => ({ ...prev, isConnected: true, step: AppStep.COURT_SESSION }));
      
      // Send initial state to sync
      sendSyncMessage({ 
        type: 'SYNC_DATA', 
        payload: { 
          role: state.role!, // we know role is set here
          data: state.role === 'PLAINTIFF' ? state.plaintiff : state.defendant 
        } 
      });
    });

    conn.on('data', (data: any) => {
      handleIncomingMessage(data as SyncMessage);
    });

    conn.on('close', () => {
      alert("对方已断开连接 (Peer disconnected)");
      setState(prev => ({ ...prev, isConnected: false }));
    });
    
    conn.on('error', (err) => {
      console.error("Connection Error", err);
    });
  };

  const sendSyncMessage = (msg: SyncMessage) => {
    if (connRef.current && connRef.current.open) {
      connRef.current.send(msg);
    }
  };

  const handleIncomingMessage = (msg: SyncMessage) => {
    if (msg.type === 'SYNC_DATA') {
      const { role, data } = msg.payload;
      setState(prev => ({
        ...prev,
        [role.toLowerCase()]: data
      }));
    } else if (msg.type === 'SYNC_VERDICT') {
      setState(prev => ({
        ...prev,
        verdict: msg.payload,
        step: AppStep.VERDICT
      }));
    } else if (msg.type === 'TRIGGER_JUDGEMENT_START') {
       setState(prev => ({ ...prev, step: AppStep.JUDGING }));
    }
  };

  // --- Input Handlers ---

  const handleDataChange = (field: keyof LitigantData, value: string) => {
    if (!state.role) return;
    
    const myRoleKey = state.role === 'PLAINTIFF' ? 'plaintiff' : 'defendant';
    const newData = { ...state[myRoleKey], [field]: value };
    
    // Update local state
    setState(prev => ({
      ...prev,
      [myRoleKey]: newData
    }));

    // Broadcast to peer
    sendSyncMessage({
      type: 'SYNC_DATA',
      payload: { role: state.role, data: newData }
    });
  };

  const handleSubmitJudgement = async () => {
    if (!state.plaintiff.name || !state.plaintiff.story || !state.defendant.name || !state.defendant.story) {
       alert("请等待双方都填写完毕 (Both sides must finish)");
       return;
    }

    setState(prev => ({ ...prev, step: AppStep.JUDGING }));
    sendSyncMessage({ type: 'TRIGGER_JUDGEMENT_START' });

    try {
      // Only the person who clicked needs to call API, then sync result
      const verdict = await getJudgeVerdict(state.plaintiff, state.defendant);
      
      setState(prev => ({ ...prev, verdict, step: AppStep.VERDICT }));
      sendSyncMessage({ type: 'SYNC_VERDICT', payload: verdict });
      
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        step: AppStep.COURT_SESSION, 
        error: error.message 
      }));
    }
  };

  const handleReset = () => {
    if (peerRef.current) peerRef.current.destroy();
    window.location.reload();
  };

  // --- Render ---

  // Vercel Key Error
  if (state.error === "Missing API Key") {
    return (
      <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center p-4">
        <div className="max-w-xl w-full bg-white rounded-2xl shadow-2xl p-8 border-l-8 border-red-500">
           <h1 className="text-2xl font-bold text-red-600 mb-4">配置缺失</h1>
           <p className="text-slate-700 mb-4">请在Vercel后台配置 <code>API_KEY</code> 环境变量。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0] flex flex-col items-center py-8 px-4 md:px-8">
      
      {/* Navbar */}
      <div className="w-full max-w-6xl flex justify-between items-center mb-8 px-4">
        <div className="flex items-center gap-2">
            <span className="text-3xl">🐱</span>
            <span className="font-bold text-orange-900 font-serif text-xl">猫猫法庭</span>
        </div>
        {state.roomId && (
          <div className="flex gap-2">
            <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-bold border border-orange-200">
              Room: {state.roomId}
            </span>
            {state.isConnected ? (
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold border border-green-200">
                ● 已连接
              </span>
            ) : (
              state.step !== AppStep.LOGIN && (
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold border border-yellow-200 animate-pulse">
                  ● 等待连接...
                </span>
              )
            )}
          </div>
        )}
      </div>

      {/* Main Area */}
      <div className="w-full flex justify-center flex-grow">
        
        {state.step === AppStep.LOGIN && (
          <LoginCard 
            onJoin={handleJoinRoom} 
            isConnecting={!!state.role && !state.isConnected && !state.error} // Simple connecting check
            error={state.error}
          />
        )}

        {state.step === AppStep.COURT_SESSION && (
          <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
             {/* Left Column: Plaintiff */}
             <div className="relative">
               <InputCard 
                 title="原告席"
                 roleTitle="Plaintiff"
                 icon="😿"
                 data={state.plaintiff}
                 onChange={(f, v) => state.role === 'PLAINTIFF' && handleDataChange(f, v)}
                 readOnly={state.role !== 'PLAINTIFF'}
                 isActiveUser={state.role === 'PLAINTIFF'}
               />
             </div>

             {/* Right Column: Defendant */}
             <div className="relative">
               <InputCard 
                 title="被告席"
                 roleTitle="Defendant"
                 icon="😼"
                 data={state.defendant}
                 onChange={(f, v) => state.role === 'DEFENDANT' && handleDataChange(f, v)}
                 readOnly={state.role !== 'DEFENDANT'}
                 isActiveUser={state.role === 'DEFENDANT'}
               />
             </div>

             {/* Submit Action Area */}
             <div className="md:col-span-2 flex justify-center mt-8 pb-12">
                <button
                  onClick={handleSubmitJudgement}
                  disabled={!state.isConnected}
                  className="bg-orange-600 hover:bg-orange-700 disabled:bg-slate-300 text-white text-xl font-bold py-4 px-12 rounded-full shadow-xl transition-transform hover:scale-105 active:scale-95 flex items-center gap-3"
                >
                  <span>⚖️</span>
                  请求判决 (Submit to Judge)
                </button>
             </div>
          </div>
        )}

        {state.step === AppStep.JUDGING && (
          <div className="text-center mt-20">
            <div className="text-8xl animate-bounce mb-8">⚖️</div>
            <h2 className="text-3xl font-bold text-slate-800 mb-4">法庭正在审理中...</h2>
            <p className="text-slate-500">猫猫法官正在同步思考 (Synchronized Thinking)...</p>
          </div>
        )}

        {state.step === AppStep.VERDICT && state.verdict && (
          <VerdictCard 
            verdict={state.verdict}
            plaintiff={state.plaintiff}
            defendant={state.defendant}
            onReset={handleReset}
          />
        )}
      </div>

      {state.error && state.step !== AppStep.LOGIN && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-full shadow-lg font-bold">
           ⚠️ {state.error}
        </div>
      )}

    </div>
  );
};

export default App;
