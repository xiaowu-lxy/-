import React, { useState } from 'react';
import { IconCheck, IconSend } from './Icons';

const UserProfile: React.FC = () => {
  const [questionText, setQuestionText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => {
        setQuestionText('');
        setSubmitted(false);
    }, 3000);
  };

  const handleShareApp = () => {
      const url = window.location.href;
      navigator.clipboard.writeText(`Hi Penny, 这是你的专属英语演练场链接：\n${url}\n请点击打开，然后选择“添加到主屏幕”方便每天打卡练习。`);
      alert('应用链接已复制！\n请去微信粘贴发送给 Penny。');
  };

  return (
    <div className="pb-24">
       {/* Header Card */}
       <div className="bg-white p-6 pb-10 border-b border-slate-100">
          <div className="flex items-center gap-4 mb-6">
             <div className="w-16 h-16 bg-slate-200 rounded-full overflow-hidden border-2 border-white shadow-lg">
                <img src="https://picsum.photos/200" alt="Avatar" className="w-full h-full object-cover" />
             </div>
             <div>
                <h2 className="text-xl font-bold text-slate-800">Penny</h2>
                <p className="text-xs text-slate-500">实验室技术员 • Lv.3</p>
             </div>
          </div>
          
          <div className="flex justify-around">
             <div className="text-center">
                <p className="text-2xl font-bold text-slate-800">15</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">连续打卡 (天)</p>
             </div>
             <div className="text-center">
                <p className="text-2xl font-bold text-slate-800">42</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">掌握单词</p>
             </div>
             <div className="text-center">
                <p className="text-2xl font-bold text-slate-800">8</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">完成作业</p>
             </div>
          </div>
       </div>

       {/* Action List */}
       <div className="p-4 -mt-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden mb-6">
              <div className="p-4 border-b border-slate-50 flex justify-between items-center">
                 <h3 className="font-bold text-slate-800 text-sm">向老师提问 / 交作业</h3>
              </div>
              <div className="p-4">
                 {submitted ? (
                     <div className="text-center py-8 text-green-600 bg-green-50 rounded-lg">
                        <IconCheck className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-sm font-bold">提交成功！</p>
                        <p className="text-xs mt-1 opacity-80">老师会尽快回复到你的邮箱。</p>
                     </div>
                 ) : (
                     <>
                        <textarea 
                            value={questionText}
                            onChange={e => setQuestionText(e.target.value)}
                            placeholder="Penny, 今天的邮件草稿或者遇到的问题可以在这里发给我..."
                            className="w-full h-32 p-3 bg-slate-50 rounded-lg border-none text-sm resize-none focus:ring-1 focus:ring-slate-200 outline-none mb-3"
                        />
                        <button 
                            onClick={handleSubmit}
                            disabled={!questionText}
                            className="w-full bg-wechat text-white py-3 rounded-lg font-bold text-sm shadow-sm disabled:opacity-50"
                        >
                            发送给老师
                        </button>
                     </>
                 )}
              </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
             <button 
                onClick={handleShareApp}
                className="w-full p-4 text-left text-sm text-slate-700 flex justify-between items-center active:bg-slate-50"
             >
                <div className="flex items-center gap-2">
                    <IconSend className="w-4 h-4 text-wechat" />
                    <span>分享应用给 Penny</span>
                </div>
                <span className="text-slate-300">›</span>
             </button>
             <div className="h-[1px] bg-slate-50 mx-4"></div>
             <button className="w-full p-4 text-left text-sm text-slate-700 flex justify-between items-center active:bg-slate-50">
                <span>学习计划设置</span>
                <span className="text-slate-300">›</span>
             </button>
          </div>
       </div>
    </div>
  );
};

export default UserProfile;