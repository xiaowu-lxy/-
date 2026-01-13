import React, { useState } from 'react';
import { Question } from '../types';
import { IconCheck, IconPlay } from './Icons';

// 模拟今日的题目数据 (Realistic Lab Scenario Data)
const TODAY_QUESTIONS: Question[] = [
  {
    id: 'q1',
    type: 'choice',
    category: 'Listening & Vocab',
    prompt: '【听力词组辨析】实验中试剂用完了，同事说："We are ______ ethanol, can you order more?"',
    options: [
      "running out of",
      "running into",
      "running away with",
      "running over"
    ],
    correctAnswer: "running out of",
    explanation: "词组: Run out of (用完/耗尽)。Video Point: 实验室常用于表达耗材短缺。"
  },
  {
    id: 'q2',
    type: 'ordering',
    category: 'Sentence Building',
    prompt: '【造句练习】利用词组 "look into" (调查/研究) 连词成句：',
    options: ["deviation", "will", "I", "look", "the", "into", "immediately"],
    correctAnswer: "I will look into the deviation immediately",
    explanation: "语序: Subject (I) + will + Verb Phrase (look into) + Object (the deviation) + Adverb."
  },
  {
    id: 'q3',
    type: 'choice',
    category: 'Email Tone',
    prompt: 'Which sentence is the most professional way to ask for a status update on the pH test?',
    options: [
      "Is the pH test done yet?",
      "I want the pH results now.",
      "Could you please provide an update on the status of the pH testing?",
      "Why is the pH test late?"
    ],
    correctAnswer: "Could you please provide an update on the status of the pH testing?",
    explanation: "Option 3 is polite (Could you please), specific (status of pH testing), and follows standard business etiquette."
  },
  {
    id: 'q4',
    type: 'ordering',
    category: 'Grammar',
    prompt: 'Rearrange the words to form a correct sentence:',
    options: ["attached", "Please", "report", "find", "the", "QC"],
    correctAnswer: "Please find the QC report attached",
    explanation: "Standard phrase: 'Please find [object] attached' or 'Please find attached [object]'."
  },
  {
    id: 'q5',
    type: 'translate',
    category: 'Meeting',
    prompt: 'Translate to English: "我们需要重新校准这台离心机。"',
    correctAnswer: "We need to recalibrate this centrifuge.",
    explanation: "Key terms: Recalibrate (重新校准), Centrifuge (离心机)."
  },
  {
    id: 'q6',
    type: 'choice',
    category: 'Lab Vocab',
    prompt: 'The experimental results showed a significant ______ from the expected values.',
    options: [
      "deviation",
      "devotion",
      "derivation",
      "division"
    ],
    correctAnswer: "deviation",
    explanation: "Deviation (偏差) is a critical term in Quality Control (QC) to describe results that differ from the standard."
  },
  {
    id: 'q7',
    type: 'ordering',
    category: 'Email Closing',
    prompt: 'Sort the words to form a polite email closing:',
    options: ["look", "forward", "to", "hearing", "from", "you", "I"],
    correctAnswer: "I look forward to hearing from you",
    explanation: "A standard, professional way to end an email when you expect a reply."
  },
  {
    id: 'q8',
    type: 'choice',
    category: 'Phrasal Verbs',
    prompt: 'The safety inspection has been ______ until next Monday due to the holiday.',
    options: [
      "put off",
      "put on",
      "put in",
      "put out"
    ],
    correctAnswer: "put off",
    explanation: "'Put off' means to postpone or delay. 'Put on' means to wear clothes/PPE."
  },
  {
    id: 'q9',
    type: 'translate',
    category: 'Safety',
    prompt: 'Translate to English: "请在进入实验室前穿上你的实验服。"',
    correctAnswer: "Please put on your lab coat before entering the laboratory.",
    explanation: "Key terms: Put on (穿上), Lab coat (实验服), Enter (进入)."
  },
  {
    id: 'q10',
    type: 'choice',
    category: 'Grammar',
    prompt: 'I ______ the QC report to the manager five minutes ago.',
    options: [
      "sent",
      "have sent",
      "send",
      "sending"
    ],
    correctAnswer: "sent",
    explanation: "Use Past Simple ('sent') because a specific past time ('five minutes ago') is mentioned. 'Have sent' is for indefinite past."
  },
  {
    id: 'q11',
    type: 'ordering',
    category: 'Polite Request',
    prompt: 'Form a polite request to a colleague:',
    options: ["mind", "Would", "checking", "data", "you", "the"],
    correctAnswer: "Would you mind checking the data",
    explanation: "'Would you mind' is always followed by the -ing form (gerund) of the verb."
  },
  {
    id: 'q12',
    type: 'choice',
    category: 'Lab Equipment',
    prompt: 'We need to place the petri dishes in the ______ for 24 hours to let the bacteria grow.',
    options: [
      "incubator",
      "calculator",
      "elevator",
      "escalator"
    ],
    correctAnswer: "incubator",
    explanation: "Incubator (培养箱) is used to maintain optimal conditions for cell or microbial growth."
  },
  {
    id: 'q13',
    type: 'choice',
    category: 'Meeting Phrases',
    prompt: 'Colleague: "I think we should double-check the raw data." You agree strongly:',
    options: [
      "I couldn't agree more.",
      "I don't think so.",
      "Maybe you are right.",
      "I agree a little."
    ],
    correctAnswer: "I couldn't agree more.",
    explanation: "'I couldn't agree more' is a common idiom meaning you agree 100%."
  },
  {
    id: 'q14',
    type: 'ordering',
    category: 'Email Apology',
    prompt: 'Rearrange to form a formal apology:',
    options: ["apologize", "We", "the", "for", "delay", "sincerely"],
    correctAnswer: "We sincerely apologize for the delay",
    explanation: "A standard formal apology structure in business emails."
  },
  {
    id: 'q15',
    type: 'choice',
    category: 'Prepositions',
    prompt: 'The Standard Operating Procedure (SOP) consists ______ five main steps.',
    options: [
      "of",
      "in",
      "at",
      "on"
    ],
    correctAnswer: "of",
    explanation: "The correct phrase is 'consist of' (由...组成)."
  }
];

const HomePractice: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [orderingState, setOrderingState] = useState<string[]>([]);
  const [translateInput, setTranslateInput] = useState('');

  const currentQ = TODAY_QUESTIONS[currentIndex];
  const progress = ((currentIndex) / TODAY_QUESTIONS.length) * 100;

  const handleChoiceSubmit = (option: string) => {
    if (feedback) return;
    setSelectedOption(option);
    if (option === currentQ.correctAnswer) {
      setFeedback('correct');
    } else {
      setFeedback('wrong');
    }
  };

  const handleOrderClick = (word: string) => {
    if (feedback) return;
    setOrderingState([...orderingState, word]);
  };

  const handleOrderReset = () => {
    setOrderingState([]);
    setFeedback(null);
  };

  const checkOrder = () => {
    const sentence = orderingState.join(' ');
    if (sentence === currentQ.correctAnswer) {
      setFeedback('correct');
    } else {
      setFeedback('wrong');
    }
  };

  const checkTranslate = () => {
    // Simple check for demo (case insensitive inclusion of keywords)
    const keywords = (currentQ.correctAnswer as string).toLowerCase().split(' ').filter(w => w.length > 3);
    const input = translateInput.toLowerCase();
    const isCloseEnough = keywords.every(k => input.includes(k));
    
    if (isCloseEnough) {
      setFeedback('correct');
    } else {
      setFeedback('wrong');
    }
  };

  const nextQuestion = () => {
    if (currentIndex < TODAY_QUESTIONS.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setFeedback(null);
      setSelectedOption(null);
      setOrderingState([]);
      setTranslateInput('');
    } else {
      setCompleted(true);
    }
  };

  if (completed) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6 animate-fade-in">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <IconCheck className="w-12 h-12 text-wechat" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">今日打卡成功！</h2>
        <p className="text-slate-500 mb-8">连续坚持 16 天，完成 {TODAY_QUESTIONS.length} 道强化训练。</p>
        <button className="w-full bg-wechat text-white py-3 rounded-lg font-bold shadow-sm">
          分享成就 (生成海报)
        </button>
      </div>
    );
  }

  return (
    <div className="pb-24">
      {/* Header Progress */}
      <div className="bg-white p-4 sticky top-0 z-10 border-b border-slate-100">
        <div className="flex justify-between text-xs text-slate-500 mb-2">
          <span>今日练习</span>
          <span>{currentIndex + 1} / {TODAY_QUESTIONS.length}</span>
        </div>
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-wechat transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Question Card */}
      <div className="p-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 min-h-[400px] flex flex-col">
          
          <div className="mb-6">
            <span className="inline-block px-2 py-1 bg-slate-100 text-slate-500 text-[10px] rounded font-bold uppercase tracking-wide mb-2">
              {currentQ.category} • {currentQ.type.toUpperCase()}
            </span>
            <h3 className="text-lg font-bold text-slate-800 leading-snug">
              {currentQ.prompt}
            </h3>
          </div>

          {/* Render Question Types */}
          <div className="flex-1">
            
            {/* CHOICE */}
            {currentQ.type === 'choice' && (
              <div className="space-y-3">
                {currentQ.options?.map((opt, idx) => {
                  let btnClass = "w-full text-left p-4 rounded-lg border text-sm transition-all ";
                  if (feedback === 'correct' && opt === currentQ.correctAnswer) {
                    btnClass += "bg-green-50 border-green-500 text-green-700 font-medium";
                  } else if (feedback === 'wrong' && opt === selectedOption) {
                    btnClass += "bg-red-50 border-red-200 text-red-600";
                  } else {
                    btnClass += "bg-white border-slate-200 hover:bg-slate-50 text-slate-700";
                  }
                  
                  return (
                    <button 
                      key={idx} 
                      onClick={() => handleChoiceSubmit(opt)}
                      disabled={!!feedback}
                      className={btnClass}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            )}

            {/* ORDERING */}
            {currentQ.type === 'ordering' && (
              <div className="flex flex-col gap-4">
                 <div className="min-h-[60px] p-3 bg-slate-50 rounded-lg border border-dashed border-slate-300 flex flex-wrap gap-2 items-center">
                    {orderingState.length === 0 && <span className="text-slate-400 text-sm">点击下方单词组句...</span>}
                    {orderingState.map((word, i) => (
                      <span key={i} className="px-3 py-1.5 bg-white border border-slate-200 rounded shadow-sm text-sm font-medium animate-pop-in">
                        {word}
                      </span>
                    ))}
                 </div>
                 <div className="flex flex-wrap gap-2">
                    {currentQ.options?.filter(w => !orderingState.includes(w)).map((word, i) => (
                       <button
                         key={i}
                         onClick={() => handleOrderClick(word)}
                         className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 text-sm shadow-sm active:scale-95 transition-transform"
                       >
                         {word}
                       </button>
                    ))}
                 </div>
                 {!feedback && orderingState.length > 0 && (
                   <div className="flex gap-2 mt-2">
                     <button onClick={handleOrderReset} className="flex-1 py-2 text-slate-500 text-sm">重置</button>
                     <button onClick={checkOrder} className="flex-1 py-2 bg-slate-800 text-white rounded-lg text-sm">确认</button>
                   </div>
                 )}
              </div>
            )}

            {/* TRANSLATE */}
            {currentQ.type === 'translate' && (
              <div className="flex flex-col gap-4">
                <textarea
                  value={translateInput}
                  onChange={(e) => setTranslateInput(e.target.value)}
                  placeholder="Type your translation here..."
                  disabled={!!feedback}
                  className="w-full h-32 p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-wechat outline-none resize-none"
                />
                {!feedback && (
                  <button onClick={checkTranslate} disabled={!translateInput} className="w-full py-3 bg-wechat text-white rounded-lg font-bold disabled:opacity-50">
                    提交答案
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Feedback Section */}
          {feedback && (
            <div className={`mt-6 p-4 rounded-lg text-sm ${feedback === 'correct' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              <div className="flex items-center gap-2 font-bold mb-1">
                 {feedback === 'correct' ? <IconCheck className="w-4 h-4" /> : <span className="text-lg">×</span>}
                 {feedback === 'correct' ? '回答正确!' : '继续加油!'}
              </div>
              <p className="opacity-90 leading-relaxed">
                <span className="font-semibold block mb-1 text-xs uppercase opacity-70">解析 (Explanation):</span>
                {currentQ.explanation}
              </p>
              {feedback === 'wrong' && (
                 <div className="mt-2 text-xs font-mono bg-white/50 p-2 rounded">
                    Correct: {Array.isArray(currentQ.correctAnswer) ? currentQ.correctAnswer[0] : currentQ.correctAnswer}
                 </div>
              )}
            </div>
          )}
        </div>

        {/* Next Button */}
        {feedback && (
          <button 
            onClick={nextQuestion}
            className="w-full mt-4 bg-slate-900 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-slate-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {currentIndex < TODAY_QUESTIONS.length - 1 ? '下一题' : '完成今日练习'}
            <IconPlay className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default HomePractice;