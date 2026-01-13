import React, { useState } from 'react';
import { Material } from '../types';
import { IconFolder, IconChevronRight } from './Icons';
import EmailAssistant from './EmailAssistant'; // Reuse the AI tool inside the library

const MOCK_MATERIALS: Material[] = [
  { id: '1', category: 'email', title: '回复客户：样品延期', content: 'Professional apology template...', tags: ['Delay', 'Client'], date: '2023-10-24' },
  { id: '2', category: 'meeting', title: '晨会：汇报进度', content: 'As for the overnight batch...', tags: ['Daily', 'Status'], date: '2023-10-23' },
  { id: '3', category: 'vocab', title: 'QC 常用词汇表 (Top 10)', content: 'Deviation, Calibration...', tags: ['QC', 'Basic'], date: '2023-10-20' },
];

const MaterialLibrary: React.FC = () => {
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [showAITool, setShowAITool] = useState(false);

  if (showAITool) {
    return (
       <div className="h-full bg-slate-50">
          <div className="bg-white p-3 border-b border-slate-200 flex items-center sticky top-0 z-10">
             <button onClick={() => setShowAITool(false)} className="text-sm text-slate-500 flex items-center gap-1">
               <span className="text-lg">‹</span> 返回
             </button>
             <span className="ml-auto font-bold text-slate-800 text-sm">AI 写作助手</span>
          </div>
          <EmailAssistant />
       </div>
    )
  }

  if (selectedMaterial) {
      return (
        <div className="bg-white min-h-screen">
           <div className="p-4 border-b border-slate-100 flex items-center sticky top-0 bg-white z-10">
              <button onClick={() => setSelectedMaterial(null)} className="text-2xl text-slate-400 mr-4">‹</button>
              <h2 className="font-bold text-slate-800">{selectedMaterial.title}</h2>
           </div>
           <div className="p-6">
              <div className="flex gap-2 mb-6">
                 {selectedMaterial.tags.map(tag => (
                   <span key={tag} className="px-2 py-1 bg-slate-100 text-slate-500 text-[10px] rounded">{tag}</span>
                 ))}
              </div>
              <p className="text-slate-600 text-sm leading-7 whitespace-pre-wrap">{selectedMaterial.content}</p>
           </div>
        </div>
      );
  }

  return (
    <div className="pb-24 p-4">
       <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Penny的专属语料库</h2>
            <p className="text-xs text-slate-500 mt-1">随时查阅你的“职场外挂”</p>
          </div>
          <button 
            onClick={() => setShowAITool(true)}
            className="bg-slate-900 text-white text-xs px-3 py-2 rounded-lg font-bold shadow-sm"
          >
            + 新建/AI生成
          </button>
       </div>

       <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
             <IconFolder className="w-6 h-6 text-blue-500 mb-2" />
             <h3 className="font-bold text-slate-700 text-sm">金牌邮件</h3>
             <p className="text-[10px] text-slate-400">12 篇存档</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
             <IconFolder className="w-6 h-6 text-purple-500 mb-2" />
             <h3 className="font-bold text-slate-700 text-sm">会议万能句</h3>
             <p className="text-[10px] text-slate-400">8 个场景</p>
          </div>
       </div>

       <h3 className="text-sm font-bold text-slate-800 mb-3 ml-1">最近添加</h3>
       <div className="flex flex-col gap-3">
          {MOCK_MATERIALS.map(item => (
            <div 
              key={item.id} 
              onClick={() => setSelectedMaterial(item)}
              className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between active:scale-[0.99] transition-transform"
            >
               <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold uppercase
                    ${item.category === 'email' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}
                  `}>
                    {item.category.substring(0,2)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{item.title}</h4>
                    <p className="text-[10px] text-slate-400">{item.date} • {item.tags.join(', ')}</p>
                  </div>
               </div>
               <IconChevronRight className="w-4 h-4 text-slate-300" />
            </div>
          ))}
       </div>
    </div>
  );
};

export default MaterialLibrary;