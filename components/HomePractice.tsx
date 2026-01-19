import React, { useState, useMemo } from 'react';
import { Question } from '../types';
import { IconCheck, IconPlay } from './Icons';
import { saveMistake, updateUserStats } from '../services/storage';

// ==========================================
// 核心语料库 (DATA BANKS - Expanded with Notes)
// ==========================================

// 1. 实验室/商务名词 (Nouns)
const LAB_NOUNS = [
  // Original
  { word: "pipette", meaning: "移液枪", context: "used for measuring small liquid volumes" },
  { word: "centrifuge", meaning: "离心机", context: "used to separate fluids" },
  { word: "reagent", meaning: "试剂", context: "chemical used in reactions" },
  { word: "calibration", meaning: "校准", context: "ensuring instrument accuracy" },
  { word: "deviation", meaning: "偏差", context: "difference from the standard" },
  { word: "contamination", meaning: "污染", context: "unwanted foreign matter" },
  { word: "SOP", meaning: "标准作业程序", context: "Standard Operating Procedure" },
  { word: "audit", meaning: "审计", context: "official inspection" },
  { word: "batch", meaning: "批次", context: "a specific group of produced items" },
  // From Notes
  { word: "situation", meaning: "情况/局势", context: "what is happening" },
  { word: "reservation", meaning: "预定", context: "booking a room or table" },
  { word: "confirmation", meaning: "确认函/确认", context: "proof of booking" },
  { word: "flu", meaning: "流感", context: "viral infection" },
  { word: "recovery", meaning: "恢复", context: "getting data or health back" },
  { word: "waitress", meaning: "女服务员", context: "woman serving food" },
  { word: "deadline", meaning: "截止日期", context: "time limit" }
];

// 2. 动词 (Verbs)
const ACTION_VERBS = [
  // Original
  { word: "verify", meaning: "核实", past: "verified" },
  { word: "conduct", meaning: "进行", past: "conducted" },
  { word: "investigate", meaning: "调查", past: "investigated" },
  { word: "maintain", meaning: "维护", past: "maintained" },
  { word: "submit", meaning: "提交", past: "submitted" },
  // From Notes
  { word: "recover", meaning: "恢复(数据/健康)", past: "recovered" },
  { word: "upgrade", meaning: "升级", past: "upgraded" },
  { word: "expect", meaning: "期待/预计", past: "expected" },
  { word: "confirm", meaning: "确认", past: "confirmed" },
  { word: "re-run", meaning: "重新运行(测试)", past: "re-ran" },
  { word: "assist", meaning: "协助", past: "assisted" },
  { word: "inform", meaning: "通知", past: "informed" }
];

// 3. 句型模板 (Sentence Templates)
const SENTENCE_PATTERNS = [
  { en: "Please find the attached report.", cn: "请查收附件中的报告。", type: "Email" },
  { en: "The results show no signs of contamination.", cn: "结果显示没有污染迹象。", type: "Lab Reporting" },
  { en: "Please ensure all instruments are calibrated.", cn: "请确保所有仪器都已校准。", type: "Instruction" },
  // From Notes
  { en: "I would recommend you to go to the training center.", cn: "我建议你去培训中心。", type: "Suggestion" },
  { en: "Could you please grab the glass of water for me?", cn: "能帮我拿杯水吗？", type: "Request" },
  { en: "There seems to be a delay with your order.", cn: "你的订单似乎延误了。", type: "Travel/Admin" },
  { en: "Please assist to feedback to the site.", cn: "请协助反馈给站点。", type: "Email" },
  { en: "We would need to re-run the IHC test.", cn: "我们需要重新运行IHC测试。", type: "Lab Work" },
  { en: "The tissue sections were wrongly placed.", cn: "组织切片放置错误。", type: "Lab Error" },
  { en: "I am calling in sick to my boss.", cn: "我正在打电话给老板请病假。", type: "Work Life" },
  { en: "Could you help me recover the data?", cn: "你能帮我恢复数据吗？", type: "IT/Lab" }
];

// 4. 每日主题轮换
const TOPIC_SCHEDULE = [
  "General Business & Greetings",
  "Lab Operations & Equipment",
  "Email Writing & Correspondence",
  "Meetings & Conference Calls",
  "Safety & Quality Control (QC)"
];

// ==========================================
// 固定题库 (FIXED SETS FOR SPECIFIC DAYS)
// ==========================================

const DAY_2_FIXED: Question[] = [
  { id: 'd2_1', type: 'choice', category: 'Grammar', prompt: 'I ______ working on this project now.', options: ['am', 'is', 'are', 'be'], correctAnswer: 'am', explanation: 'be doing (正在做)。I 后面接 am。' },
  { id: 'd2_2', type: 'choice', category: 'Grammar', prompt: 'She ______ have money.', options: ["don't", "doesn't", "isn't", "not"], correctAnswer: "doesn't", explanation: '实义动词(have)的否定形式需要助动词。第三人称单数用 doesn\'t。' },
  { id: 'd2_3', type: 'choice', category: 'Vocab', prompt: 'The water is free. It is ______.', options: ['complimentary', 'expensive', 'comment', 'casual'], correctAnswer: 'complimentary', explanation: 'Complimentary = Free (免费/赠送的)。' },
  { id: 'd2_4', type: 'ordering', category: 'Request', prompt: '连词成句：你能帮我拿下那杯水吗？', options: ['grab', 'please', 'Could', 'you', 'glass', 'the'], correctAnswer: 'Could you please grab the glass', explanation: 'Grab (抓取/拿)。Could you please...?' },
  { id: 'd2_5', type: 'choice', category: 'Politeness', prompt: 'Instead of "I want you to go...", a more polite way is:', options: ['I would recommend you to go...', 'You must go...', 'Go now...', 'I say go...'], correctAnswer: 'I would recommend you to go...', explanation: 'Using "would recommend" is softer and more professional.' },
  { id: 'd2_6', type: 'translate', category: 'Email', prompt: 'Translate: "请查收附件中的 HGRAC 总结。"', correctAnswer: 'Please find the HGRAC summary attached.', explanation: 'Standard email phrase: Please find... attached.' },
  { id: 'd2_7', type: 'choice', category: 'Vocab', prompt: 'I like to wear ______ clothes, not fancy ones.', options: ['casual', 'formal', 'uniform', 'impatient'], correctAnswer: 'casual', explanation: 'Casual (休闲的) vs Fancy (精致/花哨的)。' },
  { id: 'd2_8', type: 'choice', category: 'Vocab', prompt: 'Do you have any ______ on this proposal?', options: ['comments', 'commands', 'commons', 'cements'], correctAnswer: 'comments', explanation: 'Comment (评论/意见)。' },
  { id: 'd2_9', type: 'ordering', category: 'Phrase', prompt: '连词成句：我会选蔬菜。', options: ['go', 'I', 'will', 'with', 'vegetable', 'the'], correctAnswer: 'I will go with the vegetable', explanation: 'Go with = Choose/Select (选择)。' },
  { id: 'd2_10', type: 'choice', category: 'Vocab', prompt: 'The child is very ______. He cannot wait.', options: ['impatient', 'patient', 'important', 'impact'], correctAnswer: 'impatient', explanation: 'Impatient (不耐烦的)。' },
  { id: 'd2_11', type: 'translate', category: 'Email', prompt: 'Translate: "我们的处理计划还没有改变。"', correctAnswer: 'Our disposal plan has not yet been changed.', explanation: 'Disposal plan (处置计划)。Not yet (尚未)。' },
  { id: 'd2_12', type: 'choice', category: 'Email', prompt: 'Regarding the samples, please let me know if you need any ______ information.', options: ['further', 'farther', 'future', 'father'], correctAnswer: 'further', explanation: 'Further information (进一步的信息)。' },
  { id: 'd2_13', type: 'choice', category: 'Grammar', prompt: 'I ______ recommend (=suggest) this method.', options: ['would', 'will', 'did', 'do'], correctAnswer: 'would', explanation: 'Would recommend (委婉建议)。' },
  { id: 'd2_14', type: 'choice', category: 'Vocab', prompt: 'Which word means "working on a project"?', options: ['Doing tasks for it', 'Stopping it', 'Watching it', 'Hating it'], correctAnswer: 'Doing tasks for it', explanation: 'Working on = Processing/Handling.' },
  { id: 'd2_15', type: 'translate', category: 'Email', prompt: 'Translate: "我们将提供数据直到12月30日。"', correctAnswer: 'We will provide the data until December 30.', explanation: 'Provide (提供)。' }
];

const DAY_3_FIXED: Question[] = [
  { id: 'd3_1', type: 'choice', category: 'Health', prompt: 'I am ______ in sick today.', options: ['calling', 'shouting', 'telling', 'saying'], correctAnswer: 'calling', explanation: 'Call in sick (打电话请病假)。' },
  { id: 'd3_2', type: 'choice', category: 'Health', prompt: 'She is coming ______ with a cold.', options: ['down', 'up', 'out', 'in'], correctAnswer: 'down', explanation: 'Come down with (病倒/染上病)。' },
  { id: 'd3_3', type: 'choice', category: 'Vocab', prompt: 'Could you help me ______ the data from the hard drive?', options: ['recover', 'cover', 'discover', 'uncover'], correctAnswer: 'recover', explanation: 'Recover (恢复数据/恢复健康)。' },
  { id: 'd3_4', type: 'ordering', category: 'Work', prompt: '连词成句：你想明天请一天假吗？', options: ['take', 'to', 'Do', 'want', 'you', 'day', 'off', 'a'], correctAnswer: 'Do you want to take a day off', explanation: 'Take a day off (请一天假)。' },
  { id: 'd3_5', type: 'choice', category: 'Grammar', prompt: 'She ______ hoping to be happy every day.', options: ['was', 'is', 'did', 'does'], correctAnswer: 'was', explanation: 'She was hoping (她原本希望...)。' },
  { id: 'd3_6', type: 'translate', category: 'Email', prompt: 'Translate: "请见下方的关键更新。"', correctAnswer: 'Please see below for the key updates.', explanation: 'Please see below (请见下方)。' },
  { id: 'd3_7', type: 'choice', category: 'Email', prompt: 'SOP Update: Effective ______: 2025-12-12.', options: ['Date', 'Day', 'Time', 'Year'], correctAnswer: 'Date', explanation: 'Effective Date (生效日期)。' },
  { id: 'd3_8', type: 'choice', category: 'Lab', prompt: 'The Testing Team is ______ a two-person review.', options: ['conducting', 'making', 'doing', 'working'], correctAnswer: 'conducting', explanation: 'Conduct a review (进行审查)。' },
  { id: 'd3_9', type: 'choice', category: 'Email', prompt: 'Mock Data Upload: To be ______ once access is granted.', options: ['initiated', 'initial', 'started', 'start'], correctAnswer: 'initiated', explanation: 'Initiated (启动/开始)，比 started 更正式。' },
  { id: 'd3_10', type: 'ordering', category: 'Email', prompt: '连词成句：SOP的已发布版本在附件里。', options: ['The', 'released', 'version', 'attached', 'is'], correctAnswer: 'The released version is attached', explanation: 'Released version (发布版本)。' },
  { id: 'd3_11', type: 'choice', category: 'Lab', prompt: 'Please ensure volumes are recorded as ______ (e.g., 1, 2, 3).', options: ['integers', 'decimals', 'fractions', 'letters'], correctAnswer: 'integers', explanation: 'Integers (整数)。' },
  { id: 'd3_12', type: 'translate', category: 'Email', prompt: 'Translate: "如有任何问题，请随时联系。" (Use "reach out")', correctAnswer: 'Please feel free to reach out with any questions.', explanation: 'Reach out = Contact.' },
  { id: 'd3_13', type: 'choice', category: 'Lab', prompt: 'Mock Data Reconciliation: ______ feedback from JNJ.', options: ['Pending', 'Waiting', 'Stopping', 'Holding'], correctAnswer: 'Pending', explanation: 'Pending (待定/等待...)。' },
  { id: 'd3_14', type: 'choice', category: 'Vocab', prompt: 'It is ______ to go to sleep early.', options: ['important', 'impossible', 'impatient', 'impact'], correctAnswer: 'important', explanation: 'It is important to... (做...很重要)。' },
  { id: 'd3_15', type: 'translate', category: 'Phrase', prompt: 'Translate: "其实，她很伤心。" (Use "Actually")', correctAnswer: 'Actually, she is sad.', explanation: 'Actually (其实/实际上)。' }
];

const DAY_4_FIXED: Question[] = [
  { id: 'd4_1', type: 'choice', category: 'Travel', prompt: 'I would like to make a ______ for 6 people.', options: ['reservation', 'preservation', 'observation', 'conservation'], correctAnswer: 'reservation', explanation: 'Make a reservation (预定)。' },
  { id: 'd4_2', type: 'choice', category: 'Grammar', prompt: 'He ______ be Tom\'s father. They look exactly alike!', options: ['must', 'can', 'should', 'need'], correctAnswer: 'must', explanation: 'Must be (表示肯定的推测)。' },
  { id: 'd4_3', type: 'choice', category: 'Grammar', prompt: 'There ______ to be a delay with your order.', options: ['seems', 'looks', 'sees', 'watches'], correctAnswer: 'seems', explanation: 'There seems to be... (看起来好像有...)。' },
  { id: 'd4_4', type: 'choice', category: 'Vocab', prompt: 'The hotel is full. It is ______.', options: ['overbooked', 'overcooked', 'overlooked', 'overworked'], correctAnswer: 'overbooked', explanation: 'Overbooked (超售/订满了)。' },
  { id: 'd4_5', type: 'ordering', category: 'Email', prompt: '连词成句：特此通知，对于样品PSCR...', options: ['inform', 'Just', 'to', 'for', 'sample', 'PSCR'], correctAnswer: 'Just to inform for sample PSCR', explanation: 'Just to inform (特此通知/告知)，常用邮件开场。' },
  { id: 'd4_6', type: 'choice', category: 'Lab Error', prompt: 'The tissue sections were ______ placed.', options: ['wrongly', 'badly', 'mistake', 'false'], correctAnswer: 'wrongly', explanation: 'Wrongly placed (放错位置)。' },
  { id: 'd4_7', type: 'choice', category: 'Email', prompt: '______, we would need to re-run the IHC test.', options: ['As such', 'So that', 'Because', 'But'], correctAnswer: 'As such', explanation: 'As such (因此/正因如此)，正式的 So。' },
  { id: 'd4_8', type: 'choice', category: 'Lab', prompt: 'We need to ______ the test using spare slides.', options: ['re-run', 're-do', 're-make', 're-play'], correctAnswer: 're-run', explanation: 'Re-run a test (重新运行测试)。' },
  { id: 'd4_9', type: 'translate', category: 'Email', prompt: 'Translate: "请协助反馈给站点。" (Use "assist")', correctAnswer: 'Please assist to feedback to the site.', explanation: 'Please assist to... (请协助做...)。' },
  { id: 'd4_10', type: 'choice', category: 'Admin', prompt: 'Please ______ them to double-check the protocol.', options: ['remind', 'remember', 'remain', 'remove'], correctAnswer: 'remind', explanation: 'Remind (提醒)。' },
  { id: 'd4_11', type: 'choice', category: 'Travel', prompt: 'I\'d like to ______ now. (At a hotel desk)', options: ['check in', 'check out', 'check up', 'check on'], correctAnswer: 'check in', explanation: 'Check in (办理入住)。' },
  { id: 'd4_12', type: 'ordering', category: 'Grammar', prompt: '连词成句：你看起来有点累。', options: ['look', 'You', 'little', 'a', 'tired'], correctAnswer: 'You look a little tired', explanation: 'Look + adj (看起来...)。' },
  { id: 'd4_13', type: 'choice', category: 'Vocab', prompt: 'If you ______ others, they will help you.', options: ['respect', 'inspect', 'expect', 'suspect'], correctAnswer: 'respect', explanation: 'Respect (尊重)。' },
  { id: 'd4_14', type: 'choice', category: 'Email', prompt: 'Please ______ that the tissue sections are placed correctly.', options: ['ensure', 'sure', 'insure', 'assure'], correctAnswer: 'ensure', explanation: 'Ensure (确保)。' },
  { id: 'd4_15', type: 'translate', category: 'Vocab', prompt: 'Translate: "不幸的是" (beginning with U)', correctAnswer: 'Unfortunately', explanation: 'Unfortunately (不幸的是/遗憾的是)。' }
];


// ==========================================
// 题目生成引擎 (GENERATOR ENGINE)
// ==========================================

// 伪随机数生成器 (Pseudo-Random Number Generator)
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

function getRandomItem<T>(array: T[], seed: number): T {
  const index = Math.floor(seededRandom(seed) * array.length);
  return array[index];
}

const generateDailyQuestions = (day: number): Question[] => {
  
  // 1. 优先检查是否有固定题库 (Day 2, 3, 4)
  if (day === 2) return DAY_2_FIXED;
  if (day === 3) return DAY_3_FIXED;
  if (day === 4) return DAY_4_FIXED;

  // 2. 如果没有固定题库，则使用算法生成
  const questions: Question[] = [];
  const baseSeed = day * 1000;

  // --- Part 1: Vocabulary (5 Questions) ---
  for (let i = 0; i < 5; i++) {
    const seed = baseSeed + i;
    const isLabVocab = seededRandom(seed) > 0.4; // 60% chance of Lab vocab
    
    if (isLabVocab) {
      const target = getRandomItem(LAB_NOUNS, seed);
      const distractors = LAB_NOUNS
        .filter(n => n.word !== target.word)
        .sort(() => 0.5 - seededRandom(seed + 1))
        .slice(0, 3)
        .map(n => n.word);
      const options = [target.word, ...distractors].sort(() => 0.5 - seededRandom(seed + 2));

      questions.push({
        id: `d${day}_q${i}`,
        type: 'choice',
        category: 'Vocabulary',
        prompt: `Select the correct word for: "${target.meaning}" (${target.context})`,
        options: options,
        correctAnswer: target.word,
        explanation: `${target.word}: ${target.meaning}.`
      });
    } else {
      const target = getRandomItem(ACTION_VERBS, seed);
      const tense = seededRandom(seed) > 0.5 ? 'past' : 'present';
      
      questions.push({
        id: `d${day}_q${i}`,
        type: 'choice',
        category: 'Grammar',
        prompt: tense === 'past' 
          ? `Yesterday, we ______ the new equipment.` 
          : `We need to ______ the data carefully.`,
        options: [target.word, target.past, `${target.word}ing`, `to ${target.word}`].sort(() => 0.5 - seededRandom(seed)),
        correctAnswer: tense === 'past' ? target.past : target.word,
        explanation: tense === 'past' ? "Use Past Simple for finished actions." : "Use infinitive after 'need to'."
      });
    }
  }

  // --- Part 2: Sentence Ordering (5 Questions) ---
  for (let i = 5; i < 10; i++) {
    const seed = baseSeed + i;
    const target = getRandomItem(SENTENCE_PATTERNS, seed);
    const words = target.en.split(' ').map(w => w.replace(/[.,?]/g, ''));
    const shuffled = [...words].sort(() => 0.5 - seededRandom(seed));

    questions.push({
      id: `d${day}_q${i}`,
      type: 'ordering',
      category: target.type,
      prompt: `连词成句：${target.cn}`,
      options: shuffled,
      correctAnswer: target.en.replace(/[.,?]/g, ''),
      explanation: `Correct order: "${target.en}"`
    });
  }

  // --- Part 3: Translation & Situational (5 Questions) ---
  for (let i = 10; i < 15; i++) {
    const seed = baseSeed + i;
    const type = seededRandom(seed);

    if (type < 0.4) {
      const target = getRandomItem(SENTENCE_PATTERNS, seed + 100);
      questions.push({
        id: `d${day}_q${i}`,
        type: 'translate',
        category: 'Translation',
        prompt: `Translate: "${target.cn}"`,
        correctAnswer: target.en,
        explanation: target.en
      });
    } else if (type < 0.7) {
      const prepQ = [
        { q: "I am responsible ______ quality control.", a: "for", opts: ["for", "of", "to", "in"] },
        { q: "The meeting is scheduled ______ 3 PM.", a: "at", opts: ["at", "on", "in", "by"] },
        { q: "We look forward ______ meeting you.", a: "to", opts: ["to", "for", "with", "at"] },
        { q: "Please refer ______ the manual.", a: "to", opts: ["to", "on", "in", "at"] },
        { q: "The samples consists ______ water and oil.", a: "of", opts: ["of", "in", "by", "for"] },
        { q: "There seems ______ be a delay.", a: "to", opts: ["to", "of", "in", "for"] } // Added from notes
      ];
      const q = getRandomItem(prepQ, seed);
      questions.push({
        id: `d${day}_q${i}`,
        type: 'choice',
        category: 'Prepositions',
        prompt: q.q,
        options: q.opts,
        correctAnswer: q.a,
        explanation: "Fixed preposition/grammar structure."
      });
    } else {
      const situations = [
        { q: "Someone says 'How do you do?', you reply:", a: "How do you do?", opts: ["Fine, thanks.", "How do you do?", "Nice to meet you.", "Good."] },
        { q: "Ending a formal email:", a: "Best regards,", opts: ["Love,", "Best regards,", "Thx,", "See ya,"] },
        { q: "Answering the lab phone:", a: "Lab, Penny speaking.", opts: ["Hello, who is this?", "Lab, Penny speaking.", "I am Penny.", "Speak."] },
        { q: "You want to re-run a test. You say:", a: "We need to re-run the test.", opts: ["We need to re-run the test.", "Do it again.", "Test again.", "Make test."] }
      ];
      const q = getRandomItem(situations, seed);
      questions.push({
        id: `d${day}_q${i}`,
        type: 'choice',
        category: 'Social/Situational',
        prompt: q.q,
        options: q.opts,
        correctAnswer: q.a,
        explanation: "Standard business/lab etiquette."
      });
    }
  }

  return questions;
};


// ==========================================
// COMPONENT
// ==========================================

const HomePractice: React.FC = () => {
  const [currentDay, setCurrentDay] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [orderingState, setOrderingState] = useState<string[]>([]);
  const [translateInput, setTranslateInput] = useState('');
  
  // Generate questions for the current day
  const currentQuestions = useMemo(() => generateDailyQuestions(currentDay), [currentDay]);
  const currentQ = currentQuestions[currentIndex];
  const progress = ((currentIndex) / currentQuestions.length) * 100;
  
  // Get Topic Name
  const dailyTopic = TOPIC_SCHEDULE[(currentDay - 1) % TOPIC_SCHEDULE.length];

  const handleDayChange = (day: number) => {
    if (day < 1 || day > 100) return;
    setCurrentDay(day);
    setCurrentIndex(0);
    setCompleted(false);
    resetQuestionState();
  };

  const resetQuestionState = () => {
    setFeedback(null);
    setSelectedOption(null);
    setOrderingState([]);
    setTranslateInput('');
  };

  // ----------------------------------------------------------------
  // LOGIC UPDATED TO SAVE MISTAKES
  // ----------------------------------------------------------------
  const handleChoiceSubmit = (option: string) => {
    if (feedback) return;
    setSelectedOption(option);
    if (option === currentQ.correctAnswer) {
      setFeedback('correct');
    } else {
      setFeedback('wrong');
      saveMistake(currentQ, option, `Day ${currentDay}: ${currentQ.category}`);
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
    // Lenient check
    const cleanUser = sentence.toLowerCase().replace(/[^a-z ]/g, '');
    const cleanAns = (currentQ.correctAnswer as string).toLowerCase().replace(/[^a-z ]/g, '');
    
    if (cleanUser === cleanAns) {
      setFeedback('correct');
    } else {
      setFeedback('wrong');
      saveMistake(currentQ, sentence, `Day ${currentDay}: ${currentQ.category}`);
    }
  };

  const checkTranslate = () => {
    const cleanUser = translateInput.toLowerCase().replace(/[^a-z ]/g, '');
    const cleanAns = (currentQ.correctAnswer as string).toLowerCase().replace(/[^a-z ]/g, '');
    
    const ansWords = cleanAns.split(' ');
    const userWords = cleanUser.split(' ');
    const matches = ansWords.filter(w => userWords.includes(w)).length;

    if (matches / ansWords.length > 0.6) {
      setFeedback('correct');
    } else {
      setFeedback('wrong');
      saveMistake(currentQ, translateInput, `Day ${currentDay}: ${currentQ.category}`);
    }
  };

  const nextQuestion = () => {
    if (currentIndex < currentQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      resetQuestionState();
    } else {
      setCompleted(true);
      // Update stats on completion
      updateUserStats(currentQuestions.length);
    }
  };

  if (completed) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6 animate-fade-in">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <IconCheck className="w-12 h-12 text-wechat" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Day {currentDay} 完成！</h2>
        <p className="text-slate-500 mb-8">今日打卡成功！结果已自动保存。</p>
        <button 
          onClick={() => handleDayChange(currentDay)}
          className="w-full bg-slate-100 text-slate-700 py-3 rounded-lg font-bold shadow-sm mb-3"
        >
          再练一次
        </button>
        <button 
            onClick={() => handleDayChange(currentDay + 1)}
            className="w-full bg-wechat text-white py-3 rounded-lg font-bold shadow-sm"
        >
            进入下一天 (Day {currentDay + 1})
        </button>
      </div>
    );
  }

  return (
    <div className="pb-24">
      {/* 顶部天数切换栏 */}
      <div className="bg-white border-b border-slate-200 p-4 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center justify-between mb-2">
            <button 
                onClick={() => handleDayChange(currentDay - 1)}
                disabled={currentDay <= 1}
                className="text-slate-400 disabled:opacity-30 p-2"
            >
                ◀
            </button>
            <div className="text-center">
                <h2 className="text-lg font-bold text-slate-800">Day {currentDay}</h2>
                <p className="text-[10px] text-wechat font-bold uppercase tracking-wider">{dailyTopic}</p>
            </div>
            <button 
                onClick={() => handleDayChange(currentDay + 1)}
                disabled={currentDay >= 100}
                className="text-slate-400 disabled:opacity-30 p-2"
            >
                ▶
            </button>
        </div>
        
        {/* Progress Bar */}
        <div className="flex items-center gap-3">
             <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-wechat transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                ></div>
             </div>
             <span className="text-xs text-slate-400 font-mono w-10 text-right">{currentIndex + 1}/15</span>
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
              {feedback === 'wrong' && currentQ.type !== 'choice' && (
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
            {currentIndex < currentQuestions.length - 1 ? '下一题' : '完成今日练习'}
            <IconPlay className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default HomePractice;