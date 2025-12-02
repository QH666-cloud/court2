import React from 'react';
import { LitigantData } from '../types';

interface InputCardProps {
  title: string;
  role: '原告 (Plaintiff)' | '被告 (Defendant)';
  icon: string;
  data: LitigantData;
  onChange: (field: keyof LitigantData, value: string) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export const InputCard: React.FC<InputCardProps> = ({
  title,
  role,
  icon,
  data,
  onChange,
  onSubmit,
  isSubmitting = false
}) => {
  const isComplete = data.name.trim() && data.story.trim() && data.grievance.trim();

  return (
    <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl overflow-hidden border-2 border-orange-100">
      <div className="bg-orange-500 p-6 flex items-center justify-between text-white">
        <div>
          <h2 className="text-2xl font-bold font-serif">{title}</h2>
          <p className="text-orange-100 text-sm font-bold uppercase tracking-wider">{role}</p>
        </div>
        <div className="text-5xl">{icon}</div>
      </div>
      
      <div className="p-8 space-y-6">
        {/* Name Input */}
        <div>
          <label className="block text-slate-600 font-bold mb-2">你的名字 / 昵称</label>
          <input
            type="text"
            value={data.name}
            onChange={(e) => onChange('name', e.target.value)}
            placeholder="例如：大笨蛋, 小仙女..."
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none transition"
          />
        </div>

        {/* Story Input */}
        <div>
          <label className="block text-slate-600 font-bold mb-2">发生了什么争吵？(事情经过)</label>
          <textarea
            value={data.story}
            onChange={(e) => onChange('story', e.target.value)}
            placeholder="请详细描述事情的经过..."
            rows={5}
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none transition resize-none"
          />
        </div>

        {/* Grievance Input */}
        <div>
          <label className="block text-slate-600 font-bold mb-2">你最委屈/生气点在哪里？</label>
          <textarea
            value={data.grievance}
            onChange={(e) => onChange('grievance', e.target.value)}
            placeholder="例如：我觉得他不尊重我的意见..."
            rows={3}
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none transition resize-none"
          />
        </div>

        <button
          onClick={onSubmit}
          disabled={!isComplete || isSubmitting}
          className={`w-full py-4 rounded-xl font-bold text-lg shadow-md transition-all transform hover:scale-[1.02] active:scale-[0.98]
            ${isComplete && !isSubmitting 
              ? 'bg-orange-600 hover:bg-orange-700 text-white cursor-pointer' 
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
        >
          {isSubmitting ? '提交中...' : '提交陈述 (Meow Submit)'}
        </button>
      </div>
    </div>
  );
};
