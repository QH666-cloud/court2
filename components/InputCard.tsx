import React from 'react';
import { LitigantData } from '../types';

interface InputCardProps {
  title: string;
  roleTitle: string;
  icon: string;
  data: LitigantData;
  onChange: (field: keyof LitigantData, value: string) => void;
  readOnly?: boolean;
  isActiveUser?: boolean;
}

export const InputCard: React.FC<InputCardProps> = ({
  title,
  roleTitle,
  icon,
  data,
  onChange,
  readOnly = false,
  isActiveUser = false
}) => {
  const containerClass = readOnly 
    ? "opacity-80 scale-95 origin-top" 
    : "ring-4 ring-orange-200 shadow-2xl scale-100 z-10";
    
  const bgClass = readOnly ? "bg-slate-50" : "bg-white";

  return (
    <div className={`w-full transition-all duration-500 ${containerClass} rounded-3xl overflow-hidden border-2 border-orange-100 ${bgClass}`}>
      <div className={`${readOnly ? 'bg-slate-200 text-slate-500' : 'bg-orange-500 text-white'} p-4 flex items-center justify-between transition-colors duration-500`}>
        <div>
          <h2 className="text-lg md:text-xl font-bold font-serif">{title}</h2>
          <p className="text-xs opacity-90 font-bold uppercase tracking-wider">
            {readOnly ? '对方正在输入...' : '请填写你的陈述'}
          </p>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
      
      <div className="p-6 space-y-4">
        {/* Name Input */}
        <div>
          <label className="block text-slate-500 text-xs font-bold mb-1 uppercase">昵称</label>
          <input
            type="text"
            value={data.name}
            onChange={(e) => onChange('name', e.target.value)}
            disabled={readOnly}
            placeholder={readOnly ? "等待对方输入..." : "你的名字"}
            className={`w-full p-3 rounded-xl border ${readOnly ? 'bg-slate-100 border-transparent text-slate-500' : 'bg-slate-50 border-slate-200 focus:ring-2 focus:ring-orange-400'} outline-none transition`}
          />
        </div>

        {/* Story Input */}
        <div>
          <label className="block text-slate-500 text-xs font-bold mb-1 uppercase">事情经过</label>
          <textarea
            value={data.story}
            onChange={(e) => onChange('story', e.target.value)}
            disabled={readOnly}
            rows={5}
            placeholder={readOnly ? "等待对方输入..." : "发生了什么？"}
            className={`w-full p-3 rounded-xl border ${readOnly ? 'bg-slate-100 border-transparent text-slate-500' : 'bg-slate-50 border-slate-200 focus:ring-2 focus:ring-orange-400'} outline-none transition resize-none`}
          />
        </div>

        {/* Grievance Input */}
        <div>
          <label className="block text-slate-500 text-xs font-bold mb-1 uppercase">委屈点</label>
          <textarea
            value={data.grievance}
            onChange={(e) => onChange('grievance', e.target.value)}
            disabled={readOnly}
            rows={3}
            placeholder={readOnly ? "等待对方输入..." : "你为什么难过？"}
            className={`w-full p-3 rounded-xl border ${readOnly ? 'bg-slate-100 border-transparent text-slate-500' : 'bg-slate-50 border-slate-200 focus:ring-2 focus:ring-orange-400'} outline-none transition resize-none`}
          />
        </div>
      </div>
      
      {readOnly && (
        <div className="p-2 bg-slate-100 text-center text-xs text-slate-400 font-mono border-t border-slate-200">
          REALTIME SYNC ACTIVE
        </div>
      )}
    </div>
  );
};
