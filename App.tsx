import React, { useState, useEffect } from 'react';
import { AppStep, CaseState, LitigantData, VerdictData } from './types';
import { getJudgeVerdict } from './services/geminiService';
import { InputCard } from './components/InputCard';
import { VerdictCard } from './components/VerdictCard';

// Helper to encode/decode state for sharing via URL
const encodeState = (data: LitigantData): string => {
  try {
    const json = JSON.stringify(data);
    return btoa(encodeURIComponent(json));
  } catch (e) {
    console.error("Encoding error", e);
    return "";
  }
};

const decodeState = (str: string): LitigantData | null => {
  try {
    const json = decodeURIComponent(atob(str));
    return JSON.parse(json);
  } catch (e) {
    console.error("Decoding error", e);
    return null;
  }
};

const INITIAL_LITIGANT: LitigantData = { name: '', story: '', grievance: '' };

const App: React.FC = () => {
  const [state, setState] = useState<CaseState>({
    step: AppStep.LANDING,
    plaintiff: { ...INITIAL_LITIGANT },
    defendant: { ...INITIAL_LITIGANT },
    verdict: null,
    error: null,
  });

  // Check URL on load for shared case data
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#/share/')) {
      const encodedData = hash.replace('#/share/', '');
      const decodedPlaintiff = decodeState(encodedData);
      if (decodedPlaintiff) {
        setState(prev => ({
          ...prev,
          plaintiff: decodedPlaintiff,
          step: AppStep.DEFENDANT_INPUT
        }));
        // Clean URL
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
  }, []);

  const handleStart = () => {
    setState(prev => ({ ...prev, step: AppStep.PLAINTIFF_INPUT }));
  };

  const updatePlaintiff = (field: keyof LitigantData, value: string) => {
    setState(prev => ({
      ...prev,
      plaintiff: { ...prev.plaintiff, [field]: value }
    }));
  };

  const updateDefendant = (field: keyof LitigantData, value: string) => {
    setState(prev => ({
      ...prev,
      defendant: { ...prev.defendant, [field]: value }
    }));
  };

  const handlePlaintiffSubmit = () => {
    setState(prev => ({ ...prev, step: AppStep.SHARE_WAIT }));
  };

  const handleDefendantSubmit = async () => {
    setState(prev => ({ ...prev, step: AppStep.JUDGING }));
    try {
      const verdict = await getJudgeVerdict(state.plaintiff, state.defendant);
      setState(prev => ({ ...prev, verdict, step: AppStep.VERDICT }));
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        step: AppStep.DEFENDANT_INPUT, 
        error: error.message || "Something went wrong" 
      }));
    }
  };

  const copyShareLink = () => {
    const encoded = encodeState(state.plaintiff);
    const url = `${window.location.origin}${window.location.pathname}#/share/${encoded}`;
    navigator.clipboard.writeText(url).then(() => {
      alert("链接已复制！发送给对方，让他在他的设备上填写。");
    }).catch(() => {
      alert("复制失败，请手动复制地址栏（如果是通过地址栏传递的话）");
    });
  };

  const continueOnSameDevice = () => {
     setState(prev => ({ ...prev, step: AppStep.DEFENDANT_INPUT }));
  };

  const handleReset = () => {
    setState({
      step: AppStep.LANDING,
      plaintiff: { ...INITIAL_LITIGANT },
      defendant: { ...INITIAL_LITIGANT },
      verdict: null,
      error: null
    });
    window.location.hash = '';
  };

  // Render Helpers
  const renderContent = () => {
    switch (state.step) {
      case AppStep.LANDING:
        return (
          <div className="text-center space-y-8 max-w-2xl mx-auto px-6">
            <div className="mb-8 relative inline-block">
              <div className="absolute inset-0 bg-orange-200 rounded-full blur-2xl opacity-50 animate-pulse"></div>
              <img 
                src="https://picsum.photos/seed/catjudge1/300/300" 
                alt="Cat Judge" 
                className="w-48 h-48 md:w-64 md:h-64 rounded-full border-8 border-white shadow-2xl mx-auto relative z-10 object-cover"
              />
              <div className="absolute -bottom-4 -right-4 text-6xl">⚖️</div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-orange-900 font-serif tracking-tight">
              猫猫法庭
            </h1>
            <p className="text-xl text-orange-800/80 font-medium">
              Cat Court: 公正、可爱、绝不偏袒（除非你有小鱼干）
            </p>
            
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-orange-100 text-left space-y-4">
              <h3 className="font-bold text-lg text-orange-900">📝 如何使用：</h3>
              <ul className="space-y-2 text-slate-700">
                <li className="flex items-start"><span className="mr-2">1.</span> <span>一方（原告）先陈述自己的委屈。</span></li>
                <li className="flex items-start"><span className="mr-2">2.</span> <span>将“传票”（链接）发给另一方，或者直接递交设备。</span></li>
                <li className="flex items-start"><span className="mr-2">3.</span> <span>另一方（被告）进行陈述。</span></li>
                <li className="flex items-start"><span className="mr-2">4.</span> <span>猫猫法官 AI 进行裁决并给出和解方案。</span></li>
              </ul>
            </div>

            <button 
              onClick={handleStart}
              className="bg-orange-600 hover:bg-orange-700 text-white text-xl font-bold py-4 px-12 rounded-full shadow-xl transition-transform hover:scale-105 active:scale-95"
            >
              👩‍⚖️ 开庭 (Start Case)
            </button>
          </div>
        );

      case AppStep.PLAINTIFF_INPUT:
        return (
          <InputCard
            title="原告陈述"
            role="原告 (Plaintiff)"
            icon="😿"
            data={state.plaintiff}
            onChange={updatePlaintiff}
            onSubmit={handlePlaintiffSubmit}
          />
        );

      case AppStep.SHARE_WAIT:
        return (
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl p-8 text-center space-y-8 border-2 border-orange-100">
            <div className="text-6xl">📨</div>
            <h2 className="text-3xl font-bold text-slate-800">提交成功！</h2>
            <p className="text-slate-600">现在，我们需要听听另一方的说法。</p>
            
            <div className="grid gap-4">
              <button 
                onClick={copyShareLink}
                className="w-full py-4 bg-blue-50 text-blue-600 font-bold rounded-xl border-2 border-blue-100 hover:bg-blue-100 transition flex items-center justify-center gap-2"
              >
                <span>🔗</span> 复制链接发送给对方 (远程)
              </button>
              
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-4 text-slate-400 text-sm">或者</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              <button 
                onClick={continueOnSameDevice}
                className="w-full py-4 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition shadow-md"
              >
                📱 把设备递给对方 (当面)
              </button>
            </div>
            
            <p className="text-xs text-slate-400 mt-4">
              注意：如果使用链接分享，请确保生成的链接没有被截断（如果故事太长，建议使用当面模式）。
            </p>
          </div>
        );

      case AppStep.DEFENDANT_INPUT:
        return (
          <InputCard
            title="被告陈述"
            role="被告 (Defendant)"
            icon="😼"
            data={state.defendant}
            onChange={updateDefendant}
            onSubmit={handleDefendantSubmit}
            isSubmitting={false}
          />
        );

      case AppStep.JUDGING:
        return (
          <div className="text-center max-w-lg mx-auto">
            <div className="mb-8 relative">
              <div className="w-48 h-48 mx-auto bg-orange-100 rounded-full flex items-center justify-center animate-bounce">
                <span className="text-8xl">⚖️</span>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-4">法庭正在审理中...</h2>
            <p className="text-slate-500 animate-pulse">猫猫法官正在阅读卷宗，分析谁偷吃了更多的小鱼干...</p>
            <div className="mt-8 flex justify-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        );

      case AppStep.VERDICT:
        return state.verdict ? (
          <VerdictCard 
            verdict={state.verdict} 
            plaintiff={state.plaintiff}
            defendant={state.defendant}
            onReset={handleReset}
          />
        ) : null;
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8F0] flex flex-col items-center py-12 px-4 md:px-8">
      {/* Navbar/Header Small */}
      {state.step !== AppStep.LANDING && (
        <div className="w-full max-w-4xl flex justify-between items-center mb-8 px-4">
          <div className="flex items-center gap-2 cursor-pointer" onClick={handleReset}>
             <span className="text-2xl">🐱</span>
             <span className="font-bold text-orange-900 font-serif hidden md:block">猫猫法庭</span>
          </div>
          <div className="text-sm font-bold text-orange-400 bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
             {state.step === AppStep.PLAINTIFF_INPUT && '步骤 1/3'}
             {state.step === AppStep.DEFENDANT_INPUT && '步骤 2/3'}
             {state.step === AppStep.JUDGING && '审理中'}
             {state.step === AppStep.VERDICT && '最终判决'}
          </div>
        </div>
      )}

      {/* Error Banner */}
      {state.error && (
         <div className="max-w-md w-full bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded shadow-md" role="alert">
            <p className="font-bold">Error</p>
            <p>{state.error}</p>
            <button 
              onClick={() => setState(s => ({ ...s, error: null }))}
              className="mt-2 text-sm underline"
            >
              Dismiss
            </button>
         </div>
      )}

      {/* Main Content Area */}
      <div className="w-full flex justify-center">
        {renderContent()}
      </div>

      {/* Footer */}
      <footer className="mt-auto pt-12 text-center text-slate-400 text-sm">
        <p>© {new Date().getFullYear()} 猫猫法庭 | Powered by Gemini 2.5</p>
      </footer>
    </div>
  );
};

export default App;