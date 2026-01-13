import React, { useState } from 'react';
import { ListeningLesson } from '../types';
import { IconPlay, IconChevronRight } from './Icons';

// 这个 BVID 是用户提供的视频: BV1w7411g7jn
const BVID = 'BV1w7411g7jn';

const LESSONS: ListeningLesson[] = [
  {
    id: 'l1',
    bvid: BVID,
    page: 1, // P1 in Bilibili
    title: 'Lesson 1: Introduction & Greetings',
    description: '学习商务场合的初次见面与基本问候语。',
    duration: '12:00',
    questions: [
      {
        id: 'l1q1',
        type: 'choice',
        category: 'Listening',
        prompt: 'According to the video, what is the most polite way to introduce yourself in a formal meeting?',
        options: ['Hi, I am Penny.', 'My name is Penny.', 'Let me introduce myself, I am Penny.', 'Good morning, I am Penny from the Lab.'],
        correctAnswer: 'Let me introduce myself, I am Penny.',
        explanation: 'In formal business settings, using complete phrases like "Let me introduce myself" shows professionalism.'
      },
      {
        id: 'l1q2',
        type: 'ordering',
        category: 'Listening',
        prompt: 'Order the words to form the greeting heard in the video:',
        options: ['pleasure', 'It', 'a', 'is', 'meet', 'to', 'you'],
        correctAnswer: 'It is a pleasure to meet you',
        explanation: 'Standard formal greeting.'
      }
    ]
  },
  {
    id: 'l2',
    bvid: BVID,
    page: 2, // P2 in Bilibili
    title: 'Lesson 2: Small Talk Strategies',
    description: '掌握打破僵局(Ice-breaking)的闲聊技巧。',
    duration: '15:30',
    questions: [
      {
        id: 'l2q1',
        type: 'choice',
        category: 'Listening',
        prompt: 'Which topic does the speaker suggest avoiding during business small talk?',
        options: ['Weather', 'Politics', 'Sports', 'Traffic'],
        correctAnswer: 'Politics',
        explanation: 'Politics and religion are generally considered sensitive topics for business small talk.'
      }
    ]
  },
  {
    id: 'l3',
    bvid: BVID,
    page: 3, // P3 in Bilibili
    title: 'Lesson 3: Making Requests',
    description: '如何礼貌地提出工作要求。',
    duration: '14:20',
    questions: [
       {
        id: 'l3q1',
        type: 'choice',
        category: 'Listening',
        prompt: 'What modal verb is recommended to make a request sound softer?',
        options: ['Must', 'Could', 'Have to', 'Need'],
        correctAnswer: 'Could',
        explanation: '"Could" or "Would" softens the request compared to "Must" or "Need".'
      }
    ]
  }
];

const ListeningCenter: React.FC = () => {
  const [activeLesson, setActiveLesson] = useState<ListeningLesson | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, boolean>>({});

  const handleLessonSelect = (lesson: ListeningLesson) => {
    setActiveLesson(lesson);
    setAnswers({});
    setResults({});
  };

  const handleChoiceSelect = (qId: string, option: string) => {
    if (results[qId] !== undefined) return; // Prevent changing after check
    setAnswers(prev => ({ ...prev, [qId]: option }));
  };

  const checkAnswer = (qId: string, correct: string | string[]) => {
    const userAns = answers[qId];
    if (!userAns) return;
    const isCorrect = userAns === correct;
    setResults(prev => ({ ...prev, [qId]: isCorrect }));
  };

  // Ordering logic helpers
  const [orderingState, setOrderingState] = useState<string[]>([]);
  const handleOrderClick = (word: string) => setOrderingState(prev => [...prev, word]);
  const handleOrderReset = () => setOrderingState([]);
  const checkOrder = (qId: string, correct: string | string[]) => {
     const sentence = orderingState.join(' ');
     const isCorrect = sentence === correct;
     setResults(prev => ({ ...prev, [qId]: isCorrect }));
  };


  // Player View
  if (activeLesson) {
    return (
      <div className="pb-24 bg-white min-h-screen">
        {/* Video Player Area */}
        <div className="sticky top-0 z-20 bg-black w-full aspect-video shadow-lg">
           <iframe
              src={`//player.bilibili.com/player.html?bvid=${activeLesson.bvid}&page=${activeLesson.page}&high_quality=1&danmaku=0`}
              className="w-full h-full"
              scrolling="no"
              frameBorder="0"
              allowFullScreen
              referrerPolicy="no-referrer"
              title="Bilibili Video"
           ></iframe>
        </div>

        <div className="p-4">
           <button 
             onClick={() => setActiveLesson(null)}
             className="text-xs text-slate-500 mb-4 flex items-center gap-1"
           >
             ‹ 返回课程列表
           </button>
           
           <h2 className="text-lg font-bold text-slate-800 mb-1">{activeLesson.title}</h2>
           <p className="text-xs text-slate-500 mb-6">{activeLesson.description}</p>

           <h3 className="text-sm font-bold text-slate-800 border-l-4 border-wechat pl-2 mb-4">课后练习</h3>
           
           <div className="flex flex-col gap-6">
              {activeLesson.questions.map((q, idx) => {
                 const isAnswered = results[q.id] !== undefined;
                 const isCorrect = results[q.id] === true;
                 
                 return (
                    <div key={q.id} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Question {idx + 1}</span>
                       <p className="text-sm font-medium text-slate-800 mt-1 mb-3">{q.prompt}</p>
                       
                       {/* Choice Type */}
                       {q.type === 'choice' && (
                          <div className="flex flex-col gap-2">
                             {q.options?.map(opt => {
                                let btnClass = "text-left text-sm p-3 rounded-lg border transition-colors ";
                                if (isAnswered) {
                                   if (opt === q.correctAnswer) btnClass += "bg-green-100 border-green-500 text-green-800";
                                   else if (opt === answers[q.id]) btnClass += "bg-red-50 border-red-200 text-red-800";
                                   else btnClass += "bg-white border-slate-200 opacity-50";
                                } else {
                                   btnClass += answers[q.id] === opt 
                                     ? "bg-wechat text-white border-wechat"
                                     : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100";
                                }
                                return (
                                   <button 
                                     key={opt}
                                     onClick={() => handleChoiceSelect(q.id, opt)}
                                     disabled={isAnswered}
                                     className={btnClass}
                                   >
                                      {opt}
                                   </button>
                                )
                             })}
                             {!isAnswered && answers[q.id] && (
                                <button 
                                  onClick={() => checkAnswer(q.id, q.correctAnswer)}
                                  className="mt-2 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg"
                                >
                                  Check Answer
                                </button>
                             )}
                          </div>
                       )}

                       {/* Ordering Type */}
                       {q.type === 'ordering' && (
                         <div className="flex flex-col gap-3">
                            <div className="min-h-[40px] p-2 bg-white border border-slate-200 rounded flex flex-wrap gap-2">
                               {isAnswered ? (
                                  // Show final result sentence
                                  <span className={isCorrect ? "text-green-700 font-medium" : "text-red-600"}>
                                    {orderingState.join(' ')}
                                  </span>
                               ) : (
                                  orderingState.map((w, i) => <span key={i} className="px-2 py-1 bg-slate-100 rounded text-xs">{w}</span>)
                               )}
                            </div>
                            {!isAnswered && (
                                <div className="flex flex-wrap gap-2">
                                  {q.options?.filter(w => !orderingState.includes(w)).map((word, i) => (
                                      <button key={i} onClick={() => handleOrderClick(word)} className="px-3 py-2 bg-white border border-slate-200 rounded text-xs shadow-sm">
                                        {word}
                                      </button>
                                  ))}
                                </div>
                            )}
                            {!isAnswered && orderingState.length > 0 && (
                               <div className="flex gap-2">
                                 <button onClick={handleOrderReset} className="text-xs text-slate-500 underline">Reset</button>
                                 <button onClick={() => checkOrder(q.id, q.correctAnswer)} className="flex-1 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg">Check</button>
                               </div>
                            )}
                         </div>
                       )}

                       {/* Explanation */}
                       {isAnswered && (
                          <div className={`mt-3 text-xs p-3 rounded ${isCorrect ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                             <p className="font-bold mb-1">{isCorrect ? 'Correct!' : 'Incorrect'}</p>
                             <p>{q.explanation}</p>
                          </div>
                       )}
                    </div>
                 )
              })}
           </div>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div className="pb-24 p-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">Video Class</h2>
        <p className="text-xs text-slate-500 mt-1">视频跟练：商务英语基础 (Source: Bilibili)</p>
      </div>

      <div className="flex flex-col gap-3">
        {LESSONS.map((lesson, idx) => (
           <div 
             key={lesson.id}
             onClick={() => handleLessonSelect(lesson)}
             className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex gap-4 active:scale-[0.99] transition-transform cursor-pointer group"
           >
             <div className="w-20 h-16 bg-slate-800 rounded-lg flex items-center justify-center text-white relative overflow-hidden shrink-0">
                <IconPlay className="w-8 h-8 opacity-80 group-hover:scale-110 transition-transform" />
                <span className="absolute bottom-1 right-1 text-[8px] bg-black/50 px-1 rounded">{lesson.duration}</span>
             </div>
             <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-slate-800 text-sm truncate pr-2">{lesson.title}</h3>
                  {idx === 0 && <span className="text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold">NEW</span>}
                </div>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{lesson.description}</p>
                <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-400">
                   <span>Bilibili P{lesson.page}</span>
                   <span>•</span>
                   <span>{lesson.questions.length} Questions</span>
                </div>
             </div>
             <div className="flex items-center justify-center">
                <IconChevronRight className="w-5 h-5 text-slate-300" />
             </div>
           </div>
        ))}
        
        <div className="p-8 text-center opacity-50">
           <p className="text-xs text-slate-400">更多课程持续更新中...</p>
        </div>
      </div>
    </div>
  );
};

export default ListeningCenter;