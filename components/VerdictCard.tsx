import React from 'react';
import { VerdictData, LitigantData } from '../types';

interface VerdictCardProps {
  verdict: VerdictData;
  plaintiff: LitigantData;
  defendant: LitigantData;
  onReset: () => void;
}

export const VerdictCard: React.FC<VerdictCardProps> = ({ verdict, plaintiff, defendant, onReset }) => {
  return (
    <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-orange-200 mb-12 animate-fadeIn">
      {/* Header */}
      <div className="bg-slate-800 p-8 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="relative z-10">
          <span className="text-6xl block mb-2">🧑‍⚖️😺</span>
          <h2 className="text-3xl md:text-4xl font-bold text-orange-100 font-serif">猫猫法庭最终判决</h2>
          <p className="text-slate-400 mt-2">案件已归档</p>
        </div>
      </div>

      <div className="p-6 md:p-10 space-y-8">
        
        {/* Summary */}
        <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
          <h3 className="text-orange-800 font-bold uppercase tracking-wide text-sm mb-2">案情摘要</h3>
          <p className="text-slate-700 italic text-lg leading-relaxed">"{verdict.summary}"</p>
        </div>

        {/* Fault Meter */}
        <div className="space-y-4">
          <h3 className="text-center text-slate-800 font-bold text-xl">责任判定 (Fault-o-Meter)</h3>
          <div className="flex items-center justify-between text-sm font-bold text-slate-500 mb-1">
            <span>{plaintiff.name} ({verdict.plaintiffFaultScore}%)</span>
            <span>{defendant.name} ({verdict.defendantFaultScore}%)</span>
          </div>
          <div className="h-6 w-full bg-slate-200 rounded-full overflow-hidden flex shadow-inner">
            <div 
              className="h-full bg-rose-500 flex items-center justify-center text-white text-xs transition-all duration-1000"
              style={{ width: `${verdict.plaintiffFaultScore}%` }}
            >
            </div>
            <div 
              className="h-full bg-blue-500 flex items-center justify-center text-white text-xs transition-all duration-1000"
              style={{ width: `${verdict.defendantFaultScore}%` }}
            >
            </div>
          </div>
          <p className="text-center text-xs text-slate-400">
            * 红色代表 {plaintiff.name} 的责任，蓝色代表 {defendant.name} 的责任
          </p>
        </div>

        {/* The Verdict */}
        <div className="prose prose-orange max-w-none">
          <h3 className="text-2xl font-bold text-slate-800 border-b-2 border-orange-200 pb-2">法官陈词</h3>
          <p className="whitespace-pre-line text-slate-700 leading-relaxed text-lg">
            {verdict.verdictReasoning}
          </p>
        </div>

        {/* Advice Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100">
            <h4 className="font-bold text-rose-800 mb-3">给 {plaintiff.name} 的建议 🍬</h4>
            <p className="text-slate-700">{verdict.plaintiffAdvice}</p>
          </div>
          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
            <h4 className="font-bold text-blue-800 mb-3">给 {defendant.name} 的建议 🐟</h4>
            <p className="text-slate-700">{verdict.defendantAdvice}</p>
          </div>
        </div>

        {/* Ritual */}
        <div className="bg-yellow-100 p-8 rounded-2xl border-2 border-yellow-300 text-center relative">
          <span className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-4xl bg-white rounded-full p-2 border-2 border-yellow-300 shadow-sm">🤝</span>
          <h3 className="text-yellow-800 font-bold text-lg mt-2 mb-2 uppercase">和解仪式</h3>
          <p className="text-2xl font-serif text-slate-800 font-bold">{verdict.reconciliationRitual}</p>
        </div>

        <div className="text-center pt-8">
          <button
            onClick={onReset}
            className="px-8 py-4 bg-slate-800 text-orange-50 font-bold rounded-xl hover:bg-slate-900 transition shadow-lg"
          >
            退出法庭 (Close Case)
          </button>
        </div>
      </div>
    </div>
  );
};
