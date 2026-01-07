import React, { useState, useEffect } from 'react';
import { generateVocabCards } from '../services/gemini';
import { VocabCard } from '../types';
import { IconBook } from './Icons';

const TOPICS = [
  "质量控制 (QC)",
  "设备维护 (Maintenance)",
  "样品管理 (Logistics)",
  "客户沟通 (Meetings)",
  "安全流程 (Safety)",
  "常用邮件语 (Email)"
];

const VocabLab: React.FC = () => {
  const [cards, setCards] = useState<VocabCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(TOPICS[0]);

  const loadCards = async (topic: string) => {
    setLoading(true);
    const newCards = await generateVocabCards(topic);
    setCards(newCards);
    setLoading(false);
  };

  useEffect(() => {
    loadCards(selectedTopic);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Initial load

  const handleTopicChange = (topic: string) => {
    setSelectedTopic(topic);
    loadCards(topic);
  };

  return (
    <div className="max-w-md mx-auto p-4 pb-24">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <IconBook className="w-6 h-6 text-wechat" />
          实验室词汇库
        </h2>
        <p className="text-slate-500 text-xs mt-1">工作场景高频词汇中英对照</p>
      </div>
        
      <div className="flex overflow-x-auto gap-2 pb-4 mb-2 scrollbar-hide -mx-4 px-4">
        {TOPICS.map((topic) => (
          <button
            key={topic}
            onClick={() => handleTopicChange(topic)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-medium transition-all ${
              selectedTopic === topic
                ? 'bg-wechat text-white shadow-md'
                : 'bg-white text-slate-600 border border-slate-100'
            }`}
          >
            {topic}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col gap-4">
           {[1, 2, 3].map((i) => (
             <div key={i} className="h-48 bg-white rounded-xl animate-pulse"></div>
           ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {cards.length > 0 ? cards.map((card, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-50 overflow-hidden flex flex-col">
              <div className="bg-wechat/5 p-4 border-b border-wechat/10 flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-bold text-slate-800">{card.term}</h3>
                    <p className="text-wechat font-medium text-sm mt-0.5">{card.translation}</p>
                </div>
                <span className="px-2 py-1 bg-white rounded text-[10px] text-slate-400 border border-slate-100">
                  {card.context}
                </span>
              </div>
              <div className="p-4 flex flex-col gap-3">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Definition</p>
                  <p className="text-slate-600 text-sm leading-snug">{card.definition}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Example</p>
                  <p className="text-slate-700 italic text-sm">"{card.example}"</p>
                </div>
              </div>
            </div>
          )) : (
            <div className="text-center py-12 text-slate-400 text-sm">
              暂无词汇，请尝试切换主题。
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VocabLab;