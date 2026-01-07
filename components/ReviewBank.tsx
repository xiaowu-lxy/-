import React, { useState } from 'react';
import { IconList, IconRefresh, IconSend } from './Icons';

const ReviewBank: React.FC = () => {
  const [tab, setTab] = useState<'history' | 'mistakes'>('mistakes');

  const MOCK_MISTAKES = [
    { id: 1, title: 'Email Opening', date: 'Yesterday', q: '...ask for a status update...', userAns: 'I want results now.', correct: 'Could you please provide an update...' },
    { id: 2, title: 'Equipment Vocab', date: '3 days ago', q: 'Translate: 离心机', userAns: 'Spinner', correct: 'Centrifuge' },
    { id: 3, title: 'Phrase Usage', date: '4 days ago', q: 'We are ______ ethanol.', userAns: 'running into', correct: 'running out of' },
  ];

  const handleShareReport = () => {
    // Generate a text report
    const header = `【Penny的学习周报】\n📅 日期: ${new Date().toLocaleDateString()}\n❌ 本周错题: ${MOCK_MISTAKES.length}个\n------------------\n`;
    const body = MOCK_MISTAKES.map((m, i) => {
        return `${i+1}. [${m.title}]\n❓ ${m.q}\n❎ 误: ${m.userAns}\n✅ 正: ${m.correct}`;
    }).join('\n\n');
    const footer = `\n------------------\n请老师指点！💪`;

    const fullReport = header + body + footer;

    // Copy to clipboard
    navigator.clipboard.writeText(fullReport).then(() => {
        alert('学习报告已复制！\n请直接在微信粘贴发送给老师。');
    }).catch(err => {
        console.error('Failed to copy: ', err);
        alert('复制失败，请手动截图发送。');
    });
  };

  return (
    <div className="pb-24">
       <div className="bg-white sticky top-0 z-10 border-b border-slate-200">
          <div className="flex">
            <button 
              onClick={() => setTab('mistakes')}
              className={`flex-1 py-3 text-sm font-bold relative ${tab === 'mistakes' ? 'text-wechat' : 'text-slate-500'}`}
            >
              错题本
              {tab === 'mistakes' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-wechat rounded-full"></div>}
            </button>
            <button 
               onClick={() => setTab('history')}
               className={`flex-1 py-3 text-sm font-bold relative ${tab === 'history' ? 'text-wechat' : 'text-slate-500'}`}
            >
              历史记录
              {tab === 'history' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-wechat rounded-full"></div>}
            </button>
          </div>
       </div>

       <div className="p-4 flex flex-col gap-3">
          {tab === 'mistakes' && (
            <>
               {/* Summary & Share Card */}
               <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-4 rounded-xl text-white shadow-lg mb-2">
                  <div className="flex justify-between items-start mb-4">
                      <div>
                          <h2 className="font-bold text-lg">本周待攻克</h2>
                          <p className="text-slate-400 text-xs">累积错题 {MOCK_MISTAKES.length} 道</p>
                      </div>
                      <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                          <span className="text-xl">📉</span>
                      </div>
                  </div>
                  <button 
                    onClick={handleShareReport}
                    className="w-full bg-wechat hover:bg-wechat-dark text-white py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    <IconSend className="w-4 h-4" />
                    一键发送报告给老师
                  </button>
               </div>

               <div className="bg-orange-50 p-3 rounded-lg flex items-center gap-3 mb-2">
                  <div className="bg-orange-100 p-2 rounded-full text-orange-600">
                    <IconRefresh className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-orange-800">AI 复习建议</h4>
                    <p className="text-[10px] text-orange-600">你最近在“词组搭配”方面错误率较高。</p>
                  </div>
               </div>

               {MOCK_MISTAKES.map(item => (
                 <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-[10px] font-bold bg-red-50 text-red-600 px-1.5 py-0.5 rounded">WRONG</span>
                       <span className="text-[10px] text-slate-400">{item.date}</span>
                    </div>
                    <h4 className="font-medium text-slate-800 text-sm mb-1">{item.title}</h4>
                    <p className="text-xs text-slate-500 mb-2 truncate">{item.q}</p>
                    <div className="space-y-1">
                        <div className="bg-red-50 p-2 rounded text-xs text-red-800 font-mono flex gap-2">
                           <span className="opacity-50 select-none">YOU:</span> {item.userAns}
                        </div>
                        <div className="bg-green-50 p-2 rounded text-xs text-green-800 font-mono flex gap-2">
                           <span className="opacity-50 select-none">ANS:</span> {item.correct}
                        </div>
                    </div>
                 </div>
               ))}
            </>
          )}

          {tab === 'history' && (
             <div className="text-center py-10 text-slate-400 text-sm">
                <IconList className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p>暂无更多历史记录</p>
             </div>
          )}
       </div>
    </div>
  );
};

export default ReviewBank;