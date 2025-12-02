import React, { useState } from 'react';

interface LoginCardProps {
  onJoin: (roomId: string, role: 'PLAINTIFF' | 'DEFENDANT') => void;
  isConnecting: boolean;
  error?: string | null;
}

export const LoginCard: React.FC<LoginCardProps> = ({ onJoin, isConnecting, error }) => {
  const [roomId, setRoomId] = useState('');

  const handleJoin = (role: 'PLAINTIFF' | 'DEFENDANT') => {
    if (!roomId.trim()) {
      alert("请输入房间号 (Please enter a Room ID)");
      return;
    }
    onJoin(roomId.trim(), role);
  };

  return (
    <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl overflow-hidden border-2 border-orange-100 p-8 text-center animate-fadeIn">
      
      <div className="mb-8">
        <div className="w-32 h-32 mx-auto bg-orange-100 rounded-full flex items-center justify-center text-6xl shadow-inner mb-4">
          🏛️
        </div>
        <h1 className="text-3xl font-bold text-orange-900 font-serif mb-2">进入法庭</h1>
        <p className="text-slate-500">请输入相同的房间号以连接彼此</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-left text-slate-700 font-bold mb-2 ml-1">房间号 / 案件暗号</label>
          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="例如: love123"
            className="w-full p-4 text-center text-xl tracking-widest bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-orange-100 focus:border-orange-400 outline-none transition"
            disabled={isConnecting}
          />
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
            {error}
          </div>
        )}

        {isConnecting ? (
          <div className="py-8 text-orange-600 font-bold animate-pulse">
            正在连接法庭专线... (Connecting...)
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => handleJoin('PLAINTIFF')}
              className="p-6 rounded-xl border-2 border-orange-100 hover:border-orange-500 hover:bg-orange-50 transition group"
            >
              <span className="text-4xl block mb-2 group-hover:scale-110 transition-transform">😿</span>
              <div className="font-bold text-orange-900">我是原告</div>
              <div className="text-xs text-orange-600/70 mt-1">创建房间 (Create Room)</div>
            </button>

            <button
              onClick={() => handleJoin('DEFENDANT')}
              className="p-6 rounded-xl border-2 border-orange-100 hover:border-blue-500 hover:bg-blue-50 transition group"
            >
              <span className="text-4xl block mb-2 group-hover:scale-110 transition-transform">😼</span>
              <div className="font-bold text-slate-900">我是被告</div>
              <div className="text-xs text-slate-500 mt-1">加入房间 (Join Room)</div>
            </button>
          </div>
        )}
        
        <p className="text-xs text-slate-400 mt-4">
          * 请确保双方输入完全一致的房间号。原告先点击创建，被告再点击加入。
        </p>
      </div>
    </div>
  );
};
