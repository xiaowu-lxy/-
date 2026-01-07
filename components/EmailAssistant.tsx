import React, { useState } from 'react';
import { generateEmailRefinement, generateReplyDraft } from '../services/gemini';
import { IconSend, IconSparkles, IconMail } from './Icons';

type Mode = 'polish' | 'reply';

const EmailAssistant: React.FC = () => {
  const [mode, setMode] = useState<Mode>('polish');
  
  // Polish Mode State
  const [context, setContext] = useState('');
  const [draft, setDraft] = useState('');
  
  // Reply Mode State
  const [incomingEmail, setIncomingEmail] = useState('');
  const [replyPoints, setReplyPoints] = useState('');

  // Common State
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setResult('');
    
    try {
      if (mode === 'polish') {
        if (!draft.trim()) return;
        const response = await generateEmailRefinement(draft, context);
        setResult(response);
      } else {
        if (!incomingEmail.trim() || !replyPoints.trim()) return;
        const response = await generateReplyDraft(incomingEmail, replyPoints);
        setResult(response);
      }
    } catch (e) {
      console.error(e);
      setResult('发生错误，请重试。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto h-full flex flex-col gap-4 p-4 pb-24">
      
      {/* Tab Switcher */}
      <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-100 flex">
        <button 
          onClick={() => { setMode('polish'); setResult(''); }}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
            mode === 'polish' 
              ? 'bg-wechat text-white shadow-sm' 
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          润色草稿
        </button>
        <button 
          onClick={() => { setMode('reply'); setResult(''); }}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
            mode === 'reply' 
              ? 'bg-wechat text-white shadow-sm' 
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          辅助回复
        </button>
      </div>

      <div className="bg-white p-5 rounded-xl shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
          {mode === 'polish' ? <IconSend className="w-5 h-5 text-wechat" /> : <IconMail className="w-5 h-5 text-wechat" />}
          {mode === 'polish' ? '邮件润色 (Polishing)' : '智能回复 (Smart Reply)'}
        </h2>
        <p className="text-slate-500 text-xs mb-4">
          {mode === 'polish' 
            ? '输入您的草稿，我帮您修改为专业的商务英语。' 
            : '粘贴收到的邮件并列出回复要点，我帮您生成完整回复。'}
        </p>

        <div className="flex flex-col gap-4">
          
          {mode === 'polish' ? (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">背景描述 (可选)</label>
                <input
                  type="text"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="例如：回复客户关于样品延期的问题..."
                  className="w-full p-3 rounded-lg bg-slate-50 border-none focus:ring-1 focus:ring-wechat outline-none text-sm text-slate-800"
                />
              </div>
              <div className="flex-1 flex flex-col">
                <label className="block text-xs font-medium text-slate-500 mb-1">您的草稿</label>
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Hi, sample is late because machine broke. Sorry..."
                  className="w-full min-h-[120px] p-3 rounded-lg bg-slate-50 border-none focus:ring-1 focus:ring-wechat outline-none resize-none font-mono text-sm text-slate-800"
                />
              </div>
            </>
          ) : (
            <>
               <div className="flex-1 flex flex-col">
                <label className="block text-xs font-medium text-slate-500 mb-1">收到的邮件 (Incoming Email)</label>
                <textarea
                  value={incomingEmail}
                  onChange={(e) => setIncomingEmail(e.target.value)}
                  placeholder="粘贴对方发来的英文邮件内容..."
                  className="w-full min-h-[100px] p-3 rounded-lg bg-slate-50 border-none focus:ring-1 focus:ring-wechat outline-none resize-none font-mono text-sm text-slate-600"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">回复要点 (Key Points)</label>
                <textarea
                  value={replyPoints}
                  onChange={(e) => setReplyPoints(e.target.value)}
                  placeholder="- 感谢来信&#10;- 确认收到样品&#10;- 测试结果下周一出&#10;- 询问是否需要加急"
                  className="w-full min-h-[80px] p-3 rounded-lg bg-slate-50 border-none focus:ring-1 focus:ring-wechat outline-none resize-none text-sm text-slate-800"
                />
              </div>
            </>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading || (mode === 'polish' ? !draft : (!incomingEmail || !replyPoints))}
            className="w-full bg-wechat hover:bg-wechat-dark text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-transform"
          >
            {loading ? (
              <span>AI 思考中...</span>
            ) : (
              <>
                <IconSparkles className="w-5 h-5" />
                {mode === 'polish' ? '一键优化' : '生成回复'}
              </>
            )}
          </button>
        </div>
      </div>

      {result && (
        <div className="bg-white p-5 rounded-xl shadow-sm animate-fade-in mb-4">
          <label className="block text-xs font-medium text-wechat mb-2 font-bold uppercase tracking-wider">AI 建议</label>
          <div className="prose prose-slate prose-sm max-w-none">
            <div className="whitespace-pre-wrap font-sans text-slate-800 leading-relaxed text-sm" dangerouslySetInnerHTML={{ 
              __html: result
                .replace(/^## (.*$)/gim, '<h3 class="text-sm font-bold text-slate-900 mt-4 mb-2">$1</h3>')
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailAssistant;