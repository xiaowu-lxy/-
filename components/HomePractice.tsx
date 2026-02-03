import React, { useState, useMemo, useEffect } from 'react';
import { Question } from '../types';
import { IconCheck, IconPlay, IconRefresh } from './Icons';
import { saveMistake, updateUserStats, getDayProgress, saveDayProgress, getLastActiveDay, saveLastActiveDay } from '../services/storage';

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
  { word: "deadline", meaning: "截止日期", context: "time limit" },
  { word: "priority", meaning: "优先级", context: "importance level" },
  { word: "alternative", meaning: "替代方案", context: "another choice" },
  { word: "schedule", meaning: "日程安排", context: "timetable" }
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
  { word: "inform", meaning: "通知", past: "informed" },
  { word: "clarify", meaning: "澄清", past: "clarified" },
  { word: "expedite", meaning: "加急/加快", past: "expedited" },
  { word: "postpone", meaning: "推迟", past: "postponed" }
];

// 3. 句型模板 (Sentence Templates) - EXPANDED FOR FUTURE DAYS
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
  { en: "Could you help me recover the data?", cn: "你能帮我恢复数据吗？", type: "IT/Lab" },
  // New Additions for Long-term Practice
  { en: "Please let me know if you need further information.", cn: "如需更多信息请告知我。", type: "Email" },
  { en: "We apologize for the delay in processing your request.", cn: "对于处理您请求的延误，我们深表歉意。", type: "Email" },
  { en: "Could you please clarify the second point?", cn: "你能澄清一下第二点吗？", type: "Meeting" },
  { en: "I will get back to you by the end of the day.", cn: "我会在今天结束前回复你。", type: "Email" },
  { en: "Please expedite the testing process.", cn: "请加快测试流程。", type: "Lab Work" },
  { en: "It turned out to be a software issue.", cn: "结果发现是软件问题。", type: "IT/Lab" },
  { en: "The machine has been acting up lately.", cn: "机器最近老出毛病。", type: "Lab Work" },
  { en: "Please be advised that the schedule has changed.", cn: "请注意日程已更改。", type: "Email" }
];

// 4. 每日主题轮换
const TOPIC_SCHEDULE = [
  "General Business & Greetings",
  "Lab Operations & Equipment",
  "Email Writing & Correspondence",
  "Meetings & Conference Calls",
  "Safety & Quality Control (QC)",
  "Travel & Casual Conversation",
  "IT & Computer Issues",
  "Advanced Email Patterns",
  "Urgency & Problem Solving",
  "Scheduling & Follow-ups"
];

// ==========================================
// 固定题库 (FIXED SETS) - SHIFTED FOR 5 DAYS
// ==========================================

// 原 Day 2 -> 现 Day 1
const DAY_1_FIXED: Question[] = [
  { id: 'd1_1', type: 'choice', category: 'Grammar', prompt: 'I ______ working on this project now.', options: ['am', 'is', 'are', 'be'], correctAnswer: 'am', explanation: 'be doing (正在做)。I 后面接 am。' },
  { id: 'd1_2', type: 'choice', category: 'Grammar', prompt: 'She ______ have money.', options: ["don't", "doesn't", "isn't", "not"], correctAnswer: "doesn't", explanation: '实义动词(have)的否定形式需要助动词。第三人称单数用 doesn\'t。' },
  { id: 'd1_3', type: 'choice', category: 'Vocab', prompt: 'The water is free. It is ______.', options: ['complimentary', 'expensive', 'comment', 'casual'], correctAnswer: 'complimentary', explanation: 'Complimentary = Free (免费/赠送的)。' },
  { id: 'd1_4', type: 'ordering', category: 'Request', prompt: '连词成句：你能帮我拿下那杯水吗？', options: ['grab', 'please', 'Could', 'you', 'glass', 'the'], correctAnswer: 'Could you please grab the glass', explanation: 'Grab (抓取/拿)。Could you please...?' },
  { id: 'd1_5', type: 'choice', category: 'Politeness', prompt: 'Instead of "I want you to go...", a more polite way is:', options: ['I would recommend you to go...', 'You must go...', 'Go now...', 'I say go...'], correctAnswer: 'I would recommend you to go...', explanation: 'Using "would recommend" is softer and more professional.' },
  { id: 'd1_6', type: 'translate', category: 'Email', prompt: 'Translate: "请查收附件中的 HGRAC 总结。"', correctAnswer: 'Please find the HGRAC summary attached.', explanation: 'Standard email phrase: Please find... attached.' },
  { id: 'd1_7', type: 'choice', category: 'Vocab', prompt: 'I like to wear ______ clothes, not fancy ones.', options: ['casual', 'formal', 'uniform', 'impatient'], correctAnswer: 'casual', explanation: 'Casual (休闲的) vs Fancy (精致/花哨的)。' },
  { id: 'd1_8', type: 'choice', category: 'Vocab', prompt: 'Do you have any ______ on this proposal?', options: ['comments', 'commands', 'commons', 'cements'], correctAnswer: 'comments', explanation: 'Comment (评论/意见)。' },
  { id: 'd1_9', type: 'ordering', category: 'Phrase', prompt: '连词成句：我会选蔬菜。', options: ['go', 'I', 'will', 'with', 'vegetable', 'the'], correctAnswer: 'I will go with the vegetable', explanation: 'Go with = Choose/Select (选择)。' },
  { id: 'd1_10', type: 'choice', category: 'Vocab', prompt: 'The child is very ______. He cannot wait.', options: ['impatient', 'patient', 'important', 'impact'], correctAnswer: 'impatient', explanation: 'Impatient (不耐烦的)。' },
  { id: 'd1_11', type: 'translate', category: 'Email', prompt: 'Translate: "我们的处理计划还没有改变。"', correctAnswer: 'Our disposal plan has not yet been changed.', explanation: 'Disposal plan (处置计划)。Not yet (尚未)。' },
  { id: 'd1_12', type: 'choice', category: 'Email', prompt: 'Regarding the samples, please let me know if you need any ______ information.', options: ['further', 'farther', 'future', 'father'], correctAnswer: 'further', explanation: 'Further information (进一步的信息)。' },
  { id: 'd1_13', type: 'choice', category: 'Grammar', prompt: 'I ______ recommend (=suggest) this method.', options: ['would', 'will', 'did', 'do'], correctAnswer: 'would', explanation: 'Would recommend (委婉建议)。' },
  { id: 'd1_14', type: 'choice', category: 'Vocab', prompt: 'Which word means "working on a project"?', options: ['Doing tasks for it', 'Stopping it', 'Watching it', 'Hating it'], correctAnswer: 'Doing tasks for it', explanation: 'Working on = Processing/Handling.' },
  { id: 'd1_15', type: 'translate', category: 'Email', prompt: 'Translate: "我们将提供数据直到12月30日。"', correctAnswer: 'We will provide the data until December 30.', explanation: 'Provide (提供)。' }
];

// 原 Day 3 -> 现 Day 2
const DAY_2_FIXED: Question[] = [
  { id: 'd2_1', type: 'choice', category: 'Health', prompt: 'I am ______ in sick today.', options: ['calling', 'shouting', 'telling', 'saying'], correctAnswer: 'calling', explanation: 'Call in sick (打电话请病假)。' },
  { id: 'd2_2', type: 'choice', category: 'Health', prompt: 'She is coming ______ with a cold.', options: ['down', 'up', 'out', 'in'], correctAnswer: 'down', explanation: 'Come down with (病倒/染上病)。' },
  { id: 'd2_3', type: 'choice', category: 'Vocab', prompt: 'Could you help me ______ the data from the hard drive?', options: ['recover', 'cover', 'discover', 'uncover'], correctAnswer: 'recover', explanation: 'Recover (恢复数据/恢复健康)。' },
  { id: 'd2_4', type: 'ordering', category: 'Work', prompt: '连词成句：你想明天请一天假吗？', options: ['take', 'to', 'Do', 'want', 'you', 'day', 'off', 'a'], correctAnswer: 'Do you want to take a day off', explanation: 'Take a day off (请一天假)。' },
  { id: 'd2_5', type: 'choice', category: 'Grammar', prompt: 'She ______ hoping to be happy every day.', options: ['was', 'is', 'did', 'does'], correctAnswer: 'was', explanation: 'She was hoping (她原本希望...)。' },
  { id: 'd2_6', type: 'translate', category: 'Email', prompt: 'Translate: "请见下方的关键更新。"', correctAnswer: 'Please see below for the key updates.', explanation: 'Please see below (请见下方)。' },
  { id: 'd2_7', type: 'choice', category: 'Email', prompt: 'SOP Update: Effective ______: 2025-12-12.', options: ['Date', 'Day', 'Time', 'Year'], correctAnswer: 'Date', explanation: 'Effective Date (生效日期)。' },
  { id: 'd2_8', type: 'choice', category: 'Lab', prompt: 'The Testing Team is ______ a two-person review.', options: ['conducting', 'making', 'doing', 'working'], correctAnswer: 'conducting', explanation: 'Conduct a review (进行审查)。' },
  { id: 'd2_9', type: 'choice', category: 'Email', prompt: 'Mock Data Upload: To be ______ once access is granted.', options: ['initiated', 'initial', 'started', 'start'], correctAnswer: 'initiated', explanation: 'Initiated (启动/开始)，比 started 更正式。' },
  { id: 'd2_10', type: 'ordering', category: 'Email', prompt: '连词成句：SOP的已发布版本在附件里。', options: ['The', 'released', 'version', 'attached', 'is'], correctAnswer: 'The released version is attached', explanation: 'Released version (发布版本)。' },
  { id: 'd2_11', type: 'choice', category: 'Lab', prompt: 'Please ensure volumes are recorded as ______ (e.g., 1, 2, 3).', options: ['integers', 'decimals', 'fractions', 'letters'], correctAnswer: 'integers', explanation: 'Integers (整数)。' },
  { id: 'd2_12', type: 'translate', category: 'Email', prompt: 'Translate: "如有任何问题，请随时联系。" (Use "reach out")', correctAnswer: 'Please feel free to reach out with any questions.', explanation: 'Reach out = Contact.' },
  { id: 'd2_13', type: 'choice', category: 'Lab', prompt: 'Mock Data Reconciliation: ______ feedback from JNJ.', options: ['Pending', 'Waiting', 'Stopping', 'Holding'], correctAnswer: 'Pending', explanation: 'Pending (待定/等待...)。' },
  { id: 'd2_14', type: 'choice', category: 'Vocab', prompt: 'It is ______ to go to sleep early.', options: ['important', 'impossible', 'impatient', 'impact'], correctAnswer: 'important', explanation: 'It is important to... (做...很重要)。' },
  { id: 'd2_15', type: 'translate', category: 'Phrase', prompt: 'Translate: "其实，她很伤心。" (Use "Actually")', correctAnswer: 'Actually, she is sad.', explanation: 'Actually (其实/实际上)。' }
];

// 原 Day 4 -> 现 Day 3
const DAY_3_FIXED: Question[] = [
  { id: 'd3_1', type: 'choice', category: 'Travel', prompt: 'I would like to make a ______ for 6 people.', options: ['reservation', 'preservation', 'observation', 'conservation'], correctAnswer: 'reservation', explanation: 'Make a reservation (预定)。' },
  { id: 'd3_2', type: 'choice', category: 'Grammar', prompt: 'He ______ be Tom\'s father. They look exactly alike!', options: ['must', 'can', 'should', 'need'], correctAnswer: 'must', explanation: 'Must be (表示肯定的推测)。' },
  { id: 'd3_3', type: 'choice', category: 'Grammar', prompt: 'There ______ to be a delay with your order.', options: ['seems', 'looks', 'sees', 'watches'], correctAnswer: 'seems', explanation: 'There seems to be... (看起来好像有...)。' },
  { id: 'd3_4', type: 'choice', category: 'Vocab', prompt: 'The hotel is full. It is ______.', options: ['overbooked', 'overcooked', 'overlooked', 'overworked'], correctAnswer: 'overbooked', explanation: 'Overbooked (超售/订满了)。' },
  { id: 'd3_5', type: 'ordering', category: 'Email', prompt: '连词成句：特此通知，对于样品PSCR...', options: ['inform', 'Just', 'to', 'for', 'sample', 'PSCR'], correctAnswer: 'Just to inform for sample PSCR', explanation: 'Just to inform (特此通知/告知)，常用邮件开场。' },
  { id: 'd3_6', type: 'choice', category: 'Lab Error', prompt: 'The tissue sections were ______ placed.', options: ['wrongly', 'badly', 'mistake', 'false'], correctAnswer: 'wrongly', explanation: 'Wrongly placed (放错位置)。' },
  { id: 'd3_7', type: 'choice', category: 'Email', prompt: '______, we would need to re-run the IHC test.', options: ['As such', 'So that', 'Because', 'But'], correctAnswer: 'As such', explanation: 'As such (因此/正因如此)，正式的 So。' },
  { id: 'd3_8', type: 'choice', category: 'Lab', prompt: 'We need to ______ the test using spare slides.', options: ['re-run', 're-do', 're-make', 're-play'], correctAnswer: 're-run', explanation: 'Re-run a test (重新运行测试)。' },
  { id: 'd3_9', type: 'translate', category: 'Email', prompt: 'Translate: "请协助反馈给站点。" (Use "assist")', correctAnswer: 'Please assist to feedback to the site.', explanation: 'Please assist to... (请协助做...)。' },
  { id: 'd3_10', type: 'choice', category: 'Admin', prompt: 'Please ______ them to double-check the protocol.', options: ['remind', 'remember', 'remain', 'remove'], correctAnswer: 'remind', explanation: 'Remind (提醒)。' },
  { id: 'd3_11', type: 'choice', category: 'Travel', prompt: 'I\'d like to ______ now. (At a hotel desk)', options: ['check in', 'check out', 'check up', 'check on'], correctAnswer: 'check in', explanation: 'Check in (办理入住)。' },
  { id: 'd3_12', type: 'ordering', category: 'Grammar', prompt: '连词成句：你看起来有点累。', options: ['look', 'You', 'little', 'a', 'tired'], correctAnswer: 'You look a little tired', explanation: 'Look + adj (看起来...)。' },
  { id: 'd3_13', type: 'choice', category: 'Vocab', prompt: 'If you ______ others, they will help you.', options: ['respect', 'inspect', 'expect', 'suspect'], correctAnswer: 'respect', explanation: 'Respect (尊重)。' },
  { id: 'd3_14', type: 'choice', category: 'Email', prompt: 'Please ______ that the tissue sections are placed correctly.', options: ['ensure', 'sure', 'insure', 'assure'], correctAnswer: 'ensure', explanation: 'Ensure (确保)。' },
  { id: 'd3_15', type: 'translate', category: 'Vocab', prompt: 'Translate: "不幸的是" (beginning with U)', correctAnswer: 'Unfortunately', explanation: 'Unfortunately (不幸的是/遗憾的是)。' }
];

// 原 Day 5 -> 现 Day 4
const DAY_4_FIXED: Question[] = [
  { id: 'd4_1', type: 'choice', category: 'Phrase', prompt: 'Could you come and ______ the project?', options: ['take a look at', 'watch at', 'see at', 'look'], correctAnswer: 'take a look at', explanation: 'Take a look at (看一看/检查)。' },
  { id: 'd4_2', type: 'ordering', category: 'Grammar', prompt: '连词成句：我会给我朋友雇一个助手。', options: ['assistant', 'will', 'an', 'I', 'hire', 'friend', 'my'], correctAnswer: 'I will hire my friend an assistant', explanation: 'Hire sb sth (双宾语结构：给某人雇佣某物/人)。' },
  { id: 'd4_3', type: 'choice', category: 'Phrase', prompt: 'I can ______ with your homework.', options: ['give you a hand', 'give you a leg', 'give you a head', 'give you a foot'], correctAnswer: 'give you a hand', explanation: 'Give sb a hand with sth (帮某人一把)。' },
  { id: 'd4_4', type: 'choice', category: 'Business', prompt: 'We need to ______ costs down.', options: ['keep', 'stay', 'make', 'do'], correctAnswer: 'keep', explanation: 'Keep costs down (控制成本/保持低成本)。' },
  { id: 'd4_5', type: 'choice', category: 'Vocab', prompt: 'That price sounds ______.', options: ['reasonable', 'reason', 'reasoning', 'reasonably'], correctAnswer: 'reasonable', explanation: 'Reasonable (合理的)。' },
  { id: 'd4_6', type: 'ordering', category: 'Email', prompt: '连词成句：我写邮件是为了与您分享文件。', options: ['writing', 'you', 'to', 'share', 'the', 'I', 'document', 'with', 'am'], correctAnswer: 'I am writing to share with you the document', explanation: '邮件常用开场白：I am writing to share with you...' },
  { id: 'd4_7', type: 'choice', category: 'Email', prompt: 'Jane is now ______ this project.', options: ['in charge of', 'in charge with', 'on charge of', 'at charge of'], correctAnswer: 'in charge of', explanation: 'In charge of (负责)。' },
  { id: 'd4_8', type: 'choice', category: 'Email', prompt: 'The attached file is ______.', options: ['for your review', 'for your looking', 'for your view', 'for your seeing'], correctAnswer: 'for your review', explanation: 'For your review (供您审阅)。' },
  { id: 'd4_9', type: 'ordering', category: 'Email', prompt: '连词成句：能不能请团队花点时间过目？', options: ['go', 'moment', 'the', 'through', 'take', 'it', 'a', 'team', 'Could', 'to'], correctAnswer: 'Could the team take a moment to go through it', explanation: 'Take a moment to go through it (花点时间过目/浏览)。' },
  { id: 'd4_10', type: 'translate', category: 'Email', prompt: 'Translate: "请注意，部分内容需要更新。"', correctAnswer: 'Please kindly note that sections are to be updated.', explanation: 'Please kindly note that... (请注意...); be to be updated (需要被更新)。' },
  { id: 'd4_11', type: 'translate', category: 'Email', prompt: 'Translate: "您的反馈在1月5日前将受到极大感激。"', correctAnswer: 'Your input would be greatly appreciated by Jan 5th.', explanation: 'Input (反馈/意见); would be greatly appreciated (将不胜感激)。' },
  { id: 'd4_12', type: 'translate', category: 'Homework', prompt: 'Translate: "这份SOP需要你的团队更新联系信息。"', correctAnswer: 'The SOP needs to be updated with contact information by your team.', explanation: 'Update with... (用...更新)。' },
  { id: 'd4_13', type: 'choice', category: 'Homework', prompt: '______, we confirmed this date last week.', options: ['If you remember', 'If you forget', 'As you know', 'However'], correctAnswer: 'If you remember', explanation: 'If you remember (如果您还记得/唤起记忆)。' },
  { id: 'd4_14', type: 'ordering', category: 'Greeting', prompt: '连词成句：我想把你的新助手介绍给你。', options: ['your', 'introduce', 'I', 'like', 'to', 'you', 'new', 'to', 'would', 'assistant'], correctAnswer: 'I would like to introduce you to your new assistant', explanation: 'Introduce sb to sb (介绍某人给某人)。' },
  { id: 'd4_15', type: 'choice', category: 'Phrase', prompt: '______ we go to the cinema?', options: ['What if', 'How if', 'Why if', 'When if'], correctAnswer: 'What if', explanation: 'What if... (如果...怎么样/提议)。' }
];

// 原 Day 6 -> 现 Day 5
const DAY_5_FIXED: Question[] = [
  // 1. Suffix -ist
  { id: 'd5_1', type: 'choice', category: 'Suffix', prompt: 'Which suffix is used for "Scientist"?', options: ['-ist', '-or', '-er', '-ian'], correctAnswer: '-ist', explanation: 'Science -> Scientist. (-ist 表示专家/从业者)' },
  // 2. Suffix -or
  { id: 'd5_2', type: 'choice', category: 'Suffix', prompt: 'Which suffix is used for "Act__"?', options: ['-or', '-er', '-ist', '-ur'], correctAnswer: '-or', explanation: 'Act -> Actor. (-or 常用于拉丁词源职业)' },
  // 3. Hire vs Here
  { id: 'd5_3', type: 'choice', category: 'Vocab', prompt: 'Please come ______ and sign the contract.', options: ['here', 'hire', 'hear', 'hair'], correctAnswer: 'here', explanation: 'Here (这里) vs Hire (雇佣)。' },
  // 4. Object Clause (Grammar)
  { id: 'd5_4', type: 'choice', category: 'Grammar', prompt: 'I wonder ______.', options: ['what cutting in line is', 'what is cutting in line', 'what cutting in line', 'what is it'], correctAnswer: 'what cutting in line is', explanation: '宾语从句用陈述语序：Question word + Subject + Verb.' },
  // 5. Take time
  { id: 'd5_5', type: 'ordering', category: 'Grammar', prompt: '连词成句：不敢相信这花了我们要2个小时。', options: ['took', 'us', 'believe', 'hours', 'it', 'I', "can't", '2'], correctAnswer: "I can't believe it took us 2 hours", explanation: 'It takes sb time to do sth.' },
  // 6. Be going to
  { id: 'd5_6', type: 'choice', category: 'Grammar', prompt: 'She ______ tell us a wonderful lesson.', options: ['is going to', 'going to', 'go to', 'will going to'], correctAnswer: 'is going to', explanation: 'be going to do (将来时)。' },
  // 7. Phrase: Cut in line
  { id: 'd5_7', type: 'translate', category: 'Phrase', prompt: 'Translate: "请不要插队。"', correctAnswer: ['Please do not cut in line.', "Please don't cut in line."], explanation: 'Cut in line (插队). "Don\'t" and "Do not" are both acceptable.' },
  // 8. Phrase: Calm down
  { id: 'd5_8', type: 'choice', category: 'Phrase', prompt: 'He is angry. Tell him to ______.', options: ['calm down', 'come down', 'cut down', 'count down'], correctAnswer: 'calm down', explanation: 'Calm down (冷静/放松)。' },
  // 9. Preposition: In (Time)
  { id: 'd5_9', type: 'choice', category: 'Grammar', prompt: 'We will arrive ______ a few hours.', options: ['in', 'at', 'on', 'for'], correctAnswer: 'in', explanation: 'in + 时间段 (表示...时间以后)。' },
  // 10. Phrase: That's it
  { id: 'd5_10', type: 'choice', category: 'Phrase', prompt: 'When you want someone to stop behaving badly, you can shout: "______"', options: ['That\'s it!', 'That is good!', 'This is it!', 'It is that!'], correctAnswer: "That's it!", explanation: '"That\'s it!" 在此语境下表示“够了/适可而止/停下”。' },
  // 11. Vocab: Course
  { id: 'd5_11', type: 'choice', category: 'Vocab', prompt: 'They are playing at the golf ______.', options: ['course', 'curse', 'cause', 'case'], correctAnswer: 'course', explanation: 'Golf course (高尔夫球场)。' },
  // 12. Exaggeration
  { id: 'd5_12', type: 'choice', category: 'Phrase', prompt: 'The line is very long. You say: "It must be ______!"', options: ['a mile long', 'a meter long', 'an inch long', 'a foot long'], correctAnswer: 'a mile long', explanation: 'A mile long (夸张用法：非常长)。' },
  // 13. Greeting
  { id: 'd5_13', type: 'translate', category: 'Greeting', prompt: 'Translate: "今天冷吗？" (Use "chilly")', correctAnswer: 'Is it chilly today?', explanation: 'Chilly (寒冷的)。' },
  // 14. Vocab: Upset
  { id: 'd5_14', type: 'choice', category: 'Emotion', prompt: 'Don\'t get ______. It happens all the time.', options: ['upset', 'up', 'upper', 'set'], correctAnswer: 'upset', explanation: 'Get upset (难过/心烦)。' },
  // 15. Vocab: Get = Arrive
  { id: 'd5_15', type: 'ordering', category: 'Grammar', prompt: '连词成句：我到家时会给你打电话。', options: ['call', 'you', 'when', 'I', 'get', 'home', 'will', 'I'], correctAnswer: 'I will call you when I get home', explanation: 'Get home = Arrive home.' }
];

// Day 6 (New Content based on Notes)
const DAY_6_FIXED: Question[] = [
  // 1. Grammar: If conditional (Future/Modal)
  { id: 'd6_1', type: 'choice', category: 'Grammar', prompt: 'If I have dinner at 5 pm, I ______ eat snacks around 8 pm.', options: ['might', 'am', 'did', 'had'], correctAnswer: 'might', explanation: '主将情/从现: Main clause uses modal verb (might/can/will) for future possibility.' },
  // 2. Grammar: Future Negative
  { id: 'd6_2', type: 'choice', category: 'Grammar', prompt: 'Tonight I had dinner at 6:30, so I ______ eat anything later.', options: ['won\'t', 'don\'t', 'didn\'t', 'haven\'t'], correctAnswer: 'won\'t', explanation: 'won\'t = will not. Future intention.' },
  // 3. Vocab: Road Trip
  { id: 'd6_3', type: 'choice', category: 'Vocab', prompt: 'Road trips are really ______ and interesting.', options: ['fun', 'fan', 'fin', 'fund'], correctAnswer: 'fun', explanation: 'Road trips are fun.' },
  // 4. Vocab: Packed
  { id: 'd6_4', type: 'choice', category: 'Vocab', prompt: 'The car is ______ with luggage.', options: ['packed', 'packing', 'pack', 'packs'], correctAnswer: 'packed', explanation: 'be packed = full of things. (被动语态)' },
  // 5. Phrase: Fill up
  { id: 'd6_5', type: 'choice', category: 'Phrase', prompt: 'Did you ______ the tank?', options: ['fill up', 'feel up', 'fall up', 'full up'], correctAnswer: 'fill up', explanation: 'Fill up the tank (加满油)。' },
  // 6. Phrase: Bases covered
  { id: 'd6_6', type: 'ordering', category: 'Phrase', prompt: '连词成句：我们已经准备好各方面了。', options: ['have', 'We', 'got', 'bases', 'all', 'the', 'covered'], correctAnswer: 'We have got all the bases covered', explanation: 'Get all the bases covered = Be fully prepared.' },
  // 7. Phrase: Get going
  { id: 'd6_7', type: 'choice', category: 'Phrase', prompt: 'It is late. Let\'s ______.', options: ['get going', 'get go', 'getting go', 'got going'], correctAnswer: 'get going', explanation: 'Get going = Start moving / Leave.' },
  // 8. Phrase: Pit stop
  { id: 'd6_8', type: 'choice', category: 'Phrase', prompt: 'I need a break. Could we make a ______?', options: ['pit stop', 'pot stop', 'bit stop', 'pat stop'], correctAnswer: 'pit stop', explanation: 'Pit stop = A short stop for rest/fuel (refers to racing).' },
  // 9. Pronunciation: /t/
  { id: 'd6_9', type: 'choice', category: 'Pronunciation', prompt: 'How is "-ed" pronounced in "worked"?', options: ['/t/', '/d/', '/id/'], correctAnswer: '/t/', explanation: 'After unvoiced sounds (k, p, s, f...), -ed sounds like /t/.' },
  // 10. Pronunciation: /d/
  { id: 'd6_10', type: 'choice', category: 'Pronunciation', prompt: 'How is "-ed" pronounced in "played"?', options: ['/d/', '/t/', '/id/'], correctAnswer: '/d/', explanation: 'After vowels or voiced sounds (l, n, m...), -ed sounds like /d/.' },
  // 11. Pronunciation: /id/
  { id: 'd6_11', type: 'choice', category: 'Pronunciation', prompt: 'How is "-ed" pronounced in "wanted"?', options: ['/id/', '/t/', '/d/'], correctAnswer: '/id/', explanation: 'After "t" or "d", -ed sounds like /id/.' },
  // 12. Grammar: Ordering If
  { id: 'd6_12', type: 'ordering', category: 'Grammar', prompt: '连词成句：如果我在12:30吃午饭，我可能不吃东西。', options: ['If', 'I', 'have', 'lunch', 'may', 'not', 'eat'], correctAnswer: 'If I have lunch I may not eat', explanation: 'If clause + Main clause.' },
  // 13. Vocab: Period
  { id: 'd6_13', type: 'choice', category: 'Vocab', prompt: 'You don\'t eat any food for a long ______.', options: ['period', 'time', 'hour', 'moment'], correctAnswer: 'period', explanation: 'For a long period (of time).' },
  // 14. Clause: That
  { id: 'd6_14', type: 'choice', category: 'Grammar', prompt: 'You\'re sure ______ we\'re not forgetting anything.', options: ['that', 'what', 'which', 'where'], correctAnswer: 'that', explanation: 'I am sure that... (宾语从句).' },
  // 15. Translation
  { id: 'd6_15', type: 'translate', category: 'Phrase', prompt: 'Translate: "让我们出发吧。" (Use "get going")', correctAnswer: 'Let\'s get going.', explanation: 'Let\'s get going.' }
];

// Day 7 (New Content based on Notes)
const DAY_7_FIXED: Question[] = [
  { id: 'd7_1', type: 'choice', category: 'Grammar', prompt: 'She ______ eaten snacks. (Surely she did)', options: ['must have', 'should have', 'can have', 'will have'], correctAnswer: 'must have', explanation: 'Must have done: 表示对过去事情的肯定推测。' },
  { id: 'd7_2', type: 'choice', category: 'Vocab', prompt: 'Her bank account was ______.', options: ['frozen', 'froze', 'freeze', 'freezing'], correctAnswer: 'frozen', explanation: 'Be frozen: 被冻结 (被动语态 be + past participle)。' },
  { id: 'd7_3', type: 'choice', category: 'Phrase', prompt: 'My computer is ______ again. It is not working properly.', options: ['acting up', 'acting down', 'acting out', 'acting in'], correctAnswer: 'acting up', explanation: 'Act up: (机器)出毛病，不正常运作。' },
  { id: 'd7_4', type: 'choice', category: 'Phrase', prompt: 'I hope my PC won\'t ______ any viruses.', options: ['pick up', 'pick out', 'pick in', 'pick off'], correctAnswer: 'pick up', explanation: 'Pick up a virus: 染上病毒。' },
  { id: 'd7_5', type: 'choice', category: 'Grammar', prompt: 'We don\'t have ______ time to finish this.', options: ['much', 'many', 'a few', 'lots'], correctAnswer: 'much', explanation: 'Much: 修饰不可数名词 (time)，常用于否定句。' },
  { id: 'd7_6', type: 'choice', category: 'Grammar', prompt: 'There are ______ emails in my inbox.', options: ['many', 'much', 'a little', 'any'], correctAnswer: 'many', explanation: 'Many: 修饰可数名词复数 (emails)。' },
  { id: 'd7_7', type: 'choice', category: 'Phrase', prompt: 'It ______ that I don\'t need to work today.', options: ['turned out', 'turned on', 'turned in', 'turned off'], correctAnswer: 'turned out', explanation: 'Turn out: 结果是/原来是。' },
  { id: 'd7_8', type: 'choice', category: 'Vocab', prompt: 'I am quickly ______ the document.', options: ['browsing', 'browser', 'browsed', 'browse'], correctAnswer: 'browsing', explanation: 'Browse: 浏览/快速查看。' },
  { id: 'd7_9', type: 'choice', category: 'Grammar', prompt: 'This pen is mine. That one is ______.', options: ['yours', 'your', 'you', 'yours pen'], correctAnswer: 'yours', explanation: 'Yours = Your pen (名词性物主代词)。' },
  { id: 'd7_10', type: 'choice', category: 'Phrase', prompt: 'Keep your antivirus software ______.', options: ['up to date', 'up to time', 'up to day', 'out of date'], correctAnswer: 'up to date', explanation: 'Up to date: 最新的/跟上时代的。' },
  { id: 'd7_11', type: 'choice', category: 'Vocab', prompt: 'It is ______ noisy here.', options: ['quite', 'quiet', 'quit', 'quick'], correctAnswer: 'quite', explanation: 'Quite: 相当/非常。Quiet: 安静。' },
  { id: 'd7_12', type: 'ordering', category: 'Phrase', prompt: '连词成句：你能帮我看看这台电脑吗？', options: ['take', 'help', 'Could', 'you', 'me', 'a', 'look', 'at', 'this', 'PC'], correctAnswer: 'Could you help me take a look at this PC', explanation: 'Take a look at: 看一看/检查。' },
  { id: 'd7_13', type: 'translate', category: 'Phrase', prompt: 'Translate: "稍等一下。" (Use "second")', correctAnswer: 'Just a second.', explanation: 'Just a second.' },
  { id: 'd7_14', type: 'choice', category: 'Vocab', prompt: 'I back up my data ______.', options: ['regularly', 'regular', 'regulation', 'regulates'], correctAnswer: 'regularly', explanation: 'Regularly: 定期地/有规律地。' },
  { id: 'd7_15', type: 'choice', category: 'Phrase', prompt: '______, he was just tired, not sick.', options: ['In fact', 'Infect', 'In effect', 'Factor'], correctAnswer: 'In fact', explanation: 'In fact: 事实上。Infect: 感染。' }
];

// Day 8 (Extended Practice: Email Phrases & Sentences)
const DAY_8_FIXED: Question[] = [
  { id: 'd8_1', type: 'choice', category: 'Email', prompt: 'We apologize for any ______ caused.', options: ['inconvenience', 'convenience', 'troublesome', 'bad'], correctAnswer: 'inconvenience', explanation: 'Apologize for any inconvenience caused (为造成的不便道歉)。' },
  { id: 'd8_2', type: 'ordering', category: 'Email', prompt: '连词成句：我写这封信是为了跟进上次的会议。', options: ['follow', 'up', 'on', 'I', 'am', 'writing', 'to', 'our', 'last', 'meeting'], correctAnswer: 'I am writing to follow up on our last meeting', explanation: 'I am writing to follow up on... (我写信是为了跟进...)。' },
  { id: 'd8_3', type: 'choice', category: 'Email', prompt: 'Please feel free to ______ if you have questions.', options: ['reach out', 'reach in', 'reach up', 'touch'], correctAnswer: 'reach out', explanation: 'Reach out = Contact (联系)。' },
  { id: 'd8_4', type: 'translate', category: 'Email', prompt: 'Translate: "请查收附件中的发票。"', correctAnswer: 'Please find the attached invoice.', explanation: 'Please find the attached... (请查收附件...)。' },
  { id: 'd8_5', type: 'ordering', category: 'Email', prompt: '连词成句：如果您能在这件事上协助我们，我们将不胜感激。', options: ['appreciate', 'it', 'if', 'you', 'could', 'assist', 'us', 'We', 'would'], correctAnswer: 'We would appreciate it if you could assist us', explanation: 'We would appreciate it if... (如果您能...我们将不胜感激)。' },
  { id: 'd8_6', type: 'choice', category: 'Email', prompt: 'I look forward to ______ you.', options: ['meeting', 'meet', 'met', 'will meet'], correctAnswer: 'meeting', explanation: 'Look forward to doing sth (期待做某事，to是介词)。' },
  { id: 'd8_7', type: 'ordering', category: 'Email', prompt: '连词成句：请告诉我您什么时候有空。', options: ['me', 'know', 'when', 'you', 'are', 'available', 'Please', 'let'], correctAnswer: 'Please let me know when you are available', explanation: 'Please let me know... (请告诉我...)。' },
  { id: 'd8_8', type: 'choice', category: 'Email', prompt: 'Please keep me ______ the loop.', options: ['in', 'on', 'at', 'with'], correctAnswer: 'in', explanation: 'Keep someone in the loop (让某人随时知情/在圈子里)。' },
  { id: 'd8_9', type: 'translate', category: 'Email', prompt: 'Translate: "谢谢您的迅速回复。" (Use "prompt")', correctAnswer: 'Thank you for your prompt reply.', explanation: 'Prompt reply (迅速的回复)。' },
  { id: 'd8_10', type: 'ordering', category: 'Email', prompt: '连词成句：很抱歉没有早点回复您。', options: ['getting', 'back', 'to', 'you', 'sooner', 'Sorry', 'for', 'not'], correctAnswer: 'Sorry for not getting back to you sooner', explanation: 'Sorry for not doing sth (抱歉没做某事)。' },
  { id: 'd8_11', type: 'choice', category: 'Email', prompt: 'I am writing to ______ about the order status.', options: ['inquire', 'require', 'acquire', 'question'], correctAnswer: 'inquire', explanation: 'Inquire about (询问/查询)。' },
  { id: 'd8_12', type: 'choice', category: 'Email', prompt: 'Please ______ me on that email.', options: ['CC', 'BB', 'DD', 'TO'], correctAnswer: 'CC', explanation: 'CC (Carbon Copy, 抄送)。' },
  { id: 'd8_13', type: 'ordering', category: 'Meeting', prompt: '连词成句：我们要不安排个会议过一下细节？', options: ['schedule', 'a', 'meeting', 'to', 'go', 'over', 'details', 'Shall', 'we'], correctAnswer: 'Shall we schedule a meeting to go over details', explanation: 'Go over details (过一遍细节)。' },
  { id: 'd8_14', type: 'translate', category: 'Email', prompt: 'Translate: "如果有任何进一步的问题，请联系我。"', correctAnswer: 'If you have any further questions, please contact me.', explanation: 'Further questions (进一步的问题)。' },
  { id: 'd8_15', type: 'choice', category: 'Email', prompt: 'Formal closing: "Best ______,"', options: ['Regards', 'Regard', 'Wishes', 'Bye'], correctAnswer: 'Regards', explanation: 'Best Regards (诚挚的问候)。' }
];

// Day 9 (Urgent Situations & Clarification)
const DAY_9_FIXED: Question[] = [
  { id: 'd9_1', type: 'choice', category: 'Email', prompt: 'Please ______ this order as it is urgent.', options: ['expedite', 'slow', 'stop', 'delay'], correctAnswer: 'expedite', explanation: 'Expedite (加速/加急)。' },
  { id: 'd9_2', type: 'ordering', category: 'Email', prompt: '连词成句：我写信是想澄清一下测试结果。', options: ['clarify', 'the', 'test', 'results', 'to', 'writing', 'am', 'I'], correctAnswer: 'I am writing to clarify the test results', explanation: 'I am writing to clarify... (我写信是为了澄清...)。' },
  { id: 'd9_3', type: 'choice', category: 'Phrase', prompt: 'The machine started ______ up right before the deadline.', options: ['acting', 'working', 'doing', 'going'], correctAnswer: 'acting', explanation: 'Act up (出毛病)。Recalling from Day 7.' },
  { id: 'd9_4', type: 'translate', category: 'Email', prompt: 'Translate: "请尽快回复。" (Use "convenience")', correctAnswer: 'Please reply at your earliest convenience.', explanation: 'At your earliest convenience (尽早/方便时尽快)。' },
  { id: 'd9_5', type: 'choice', category: 'Email', prompt: 'This matter is of high ______.', options: ['priority', 'prior', 'primary', 'prime'], correctAnswer: 'priority', explanation: 'High priority (高优先级)。' },
  { id: 'd9_6', type: 'ordering', category: 'Email', prompt: '连词成句：很抱歉回复晚了。', options: ['for', 'the', 'delayed', 'response', 'Apologies'], correctAnswer: 'Apologies for the delayed response', explanation: 'Apologies for... (为...道歉)。' },
  { id: 'd9_7', type: 'choice', category: 'Grammar', prompt: 'I ______ have checked the schedule earlier. (Regret)', options: ['should', 'must', 'can', 'will'], correctAnswer: 'should', explanation: 'Should have done (本应该做某事而没做，表示后悔)。' },
  { id: 'd9_8', type: 'choice', category: 'Phrase', prompt: 'It ______ out to be a simple error.', options: ['turned', 'moved', 'looked', 'took'], correctAnswer: 'turned', explanation: 'Turn out (结果是)。Recalling from Day 7.' },
  { id: 'd9_9', type: 'translate', category: 'Email', prompt: 'Translate: "请告知是否有任何更新。"', correctAnswer: 'Please let me know if there are any updates.', explanation: 'Please let me know if... (请告知是否...)。' },
  { id: 'd9_10', type: 'ordering', category: 'Meeting', prompt: '连词成句：我们可以把会议推迟到明天吗？', options: ['meeting', 'postpone', 'the', 'Can', 'tomorrow', 'we', 'to'], correctAnswer: 'Can we postpone the meeting to tomorrow', explanation: 'Postpone (推迟)。' },
  { id: 'd9_11', type: 'choice', category: 'Email', prompt: 'Please find the ______ document.', options: ['attached', 'attaching', 'attach', 'attachment'], correctAnswer: 'attached', explanation: 'Attached document (附件文档/被附上的文档)。' },
  { id: 'd9_12', type: 'choice', category: 'Vocab', prompt: 'Do you have an ______ solution?', options: ['alternative', 'alter', 'alternate', 'native'], correctAnswer: 'alternative', explanation: 'Alternative (替代的/备选的)。' },
  { id: 'd9_13', type: 'translate', category: 'Meeting', prompt: 'Translate: "我想确认一下我的预定。"', correctAnswer: 'I would like to confirm my reservation.', explanation: 'Confirm reservation (确认预定)。' },
  { id: 'd9_14', type: 'ordering', category: 'Grammar', prompt: '连词成句：如果我知道，我就告诉你了。', options: ['known', 'I', 'would', 'have', 'told', 'you', 'Had', 'I'], correctAnswer: 'Had I known I would have told you', explanation: 'Had I known = If I had known (虚拟语气倒装)。' },
  { id: 'd9_15', type: 'choice', category: 'Email', prompt: 'I hope this email ______ you well.', options: ['finds', 'looks', 'sees', 'gets'], correctAnswer: 'finds', explanation: 'I hope this email finds you well (希望您一切都好，常用邮件开场)。' }
];

// Day 10 (Scheduling & Confirmations)
const DAY_10_FIXED: Question[] = [
  { id: 'd10_1', type: 'choice', category: 'Email', prompt: 'I am writing to ______ receipt of your email.', options: ['acknowledge', 'knowledge', 'know', 'admit'], correctAnswer: 'acknowledge', explanation: 'Acknowledge receipt (确认收到)。' },
  { id: 'd10_2', type: 'ordering', category: 'Meeting', prompt: '连词成句：周二下午2点对你合适吗？', options: ['Tuesday', 'work', 'Does', 'for', 'you', '2pm'], correctAnswer: 'Does 2pm Tuesday work for you', explanation: 'Does ... work for you? (时间对你合适吗？)' },
  { id: 'd10_3', type: 'choice', category: 'Phrase', prompt: 'I\'m afraid I can\'t ______ it to the meeting.', options: ['make', 'do', 'get', 'take'], correctAnswer: 'make', explanation: 'Make it (赶上/出席)。' },
  { id: 'd10_4', type: 'translate', category: 'Email', prompt: 'Translate: "我们将调查此事。" (Use "look into")', correctAnswer: 'We will look into this matter.', explanation: 'Look into (调查/研究)。' },
  { id: 'd10_5', type: 'choice', category: 'Email', prompt: 'Further ______ our conversation, here is the plan.', options: ['to', 'of', 'with', 'at'], correctAnswer: 'to', explanation: 'Further to (继...之后/跟进...)。' },
  { id: 'd10_6', type: 'ordering', category: 'Email', prompt: '连词成句：请随时通知我进度。', options: ['Please', 'me', 'keep', 'posted', 'on', 'progress', 'the'], correctAnswer: 'Please keep me posted on the progress', explanation: 'Keep me posted (随时通知我)。' },
  { id: 'd10_7', type: 'choice', category: 'Vocab', prompt: 'What is the ______ for this project?', options: ['deadline', 'dead line', 'finish', 'end'], correctAnswer: 'deadline', explanation: 'Deadline (截止日期)。' },
  { id: 'd10_8', type: 'choice', category: 'Email', prompt: 'We regret to ______ you that the sample is lost.', options: ['inform', 'information', 'say', 'tell'], correctAnswer: 'inform', explanation: 'Regret to inform you (很遗憾地通知您)。' },
  { id: 'd10_9', type: 'translate', category: 'Phrase', prompt: 'Translate: "以防万一。" (Use "case")', correctAnswer: 'Just in case.', explanation: 'Just in case.' },
  { id: 'd10_10', type: 'ordering', category: 'Email', prompt: '连词成句：我很乐意安排一次电话会议。', options: ['be', 'happy', 'to', 'arrange', 'a', 'call', 'I', 'would'], correctAnswer: 'I would be happy to arrange a call', explanation: 'I would be happy to... (我很乐意...)。' },
  { id: 'd10_11', type: 'choice', category: 'Grammar', prompt: 'You ______ better check the SOP first.', options: ['had', 'have', 'should', 'would'], correctAnswer: 'had', explanation: 'Had better (最好/应该)。' },
  { id: 'd10_12', type: 'choice', category: 'Email', prompt: 'Please ______ the attached file for details.', options: ['see', 'look', 'watch', 'view'], correctAnswer: 'see', explanation: 'See attached (参阅附件)。' },
  { id: 'd10_13', type: 'translate', category: 'Email', prompt: 'Translate: "期待很快收到您的来信。"', correctAnswer: 'Look forward to hearing from you soon.', explanation: 'Look forward to hearing from you.' },
  { id: 'd10_14', type: 'choice', category: 'Vocab', prompt: 'Is the data ______?', options: ['accurate', 'accuracy', 'act', 'sure'], correctAnswer: 'accurate', explanation: 'Accurate (准确的)。' },
  { id: 'd10_15', type: 'choice', category: 'Phrase', prompt: 'Let\'s ______ up next week.', options: ['catch', 'match', 'patch', 'fetch'], correctAnswer: 'catch', explanation: 'Catch up (碰头/叙旧/跟进)。' }
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
  
  // 1. 优先检查是否有固定题库 (Day 1 - 10)
  if (day === 1) return DAY_1_FIXED;
  if (day === 2) return DAY_2_FIXED;
  if (day === 3) return DAY_3_FIXED;
  if (day === 4) return DAY_4_FIXED;
  if (day === 5) return DAY_5_FIXED;
  if (day === 6) return DAY_6_FIXED;
  if (day === 7) return DAY_7_FIXED;
  if (day === 8) return DAY_8_FIXED;
  if (day === 9) return DAY_9_FIXED;
  if (day === 10) return DAY_10_FIXED;

  // 2. 如果没有固定题库（Day 0 或 Day > 10），则使用算法生成
  // Day 0: Warm-up (Random)
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
  // 1. Restore last active day on load
  const [currentDay, setCurrentDay] = useState(() => getLastActiveDay());
  
  // 2. Restore progress SPECIFIC to that day
  const [currentIndex, setCurrentIndex] = useState(() => getDayProgress(getLastActiveDay()));
  const [retryCount, setRetryCount] = useState(0);

  const [completed, setCompleted] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [orderingState, setOrderingState] = useState<string[]>([]);
  const [translateInput, setTranslateInput] = useState('');
  
  // Generate questions for the current day
  const currentQuestions = useMemo(() => {
    const questions = generateDailyQuestions(currentDay);
    // Shuffle options for ALL questions to prevent "Answer is always A" pattern
    // This runs whenever currentDay changes OR retryCount changes (forcing a reshuffle)
    return questions.map(q => {
        const newQ = { ...q }; // Shallow copy
        if (newQ.options) {
            // Random shuffle using Math.random() for unpredictability
            newQ.options = [...newQ.options].sort(() => Math.random() - 0.5);
        }
        return newQ;
    });
  }, [currentDay, retryCount]);
  
  const currentQ = currentQuestions[currentIndex];
  
  // Check if we restored a completed state
  useEffect(() => {
    if (currentIndex >= currentQuestions.length && !completed) {
      setCompleted(true);
    }
  }, [currentIndex, currentQuestions.length, completed]);

  // Auto-save progress whenever day or index changes
  useEffect(() => {
    saveDayProgress(currentDay, currentIndex);
    saveLastActiveDay(currentDay);
  }, [currentDay, currentIndex]);

  const progress = Math.min(((currentIndex) / currentQuestions.length) * 100, 100);
  const dailyTopic = currentDay === 0 ? "Warm-up / Review" : TOPIC_SCHEDULE[(currentDay - 1) % TOPIC_SCHEDULE.length];

  // --- FIX: Handle Day Change Logic ---
  const handleDayChange = (day: number) => {
    // Allow day 0 (Warm-up)
    if (day < 0 || day > 100) return;
    
    // 1. Save current day state before leaving (redundant due to useEffect, but safe)
    saveLastActiveDay(day);

    // 2. Retrieve progress for the NEW day
    const savedIndexForNewDay = getDayProgress(day);

    // 3. Update State
    setCurrentDay(day);
    setCurrentIndex(savedIndexForNewDay);
    
    // 4. Reset UI state
    setCompleted(false);
    resetQuestionState();
    setRetryCount(0); // Reset shuffle
  };

  const handleRestartDay = () => {
    setCurrentIndex(0);
    setCompleted(false);
    resetQuestionState();
    saveDayProgress(currentDay, 0); // Force save reset
    setRetryCount(c => c + 1); // Trigger option reshuffle
  };

  // Direct reset, no confirmation dialog to prevent issues
  const confirmRestart = () => {
    handleRestartDay();
  };

  const resetQuestionState = () => {
    setFeedback(null);
    setSelectedOption(null);
    setOrderingState([]);
    setTranslateInput('');
  };

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
  
  // NEW FUNCTION: REMOVE WORD ON CLICK
  const handleRemoveWord = (index: number) => {
    if (feedback) return;
    const newOrder = [...orderingState];
    newOrder.splice(index, 1);
    setOrderingState(newOrder);
  };

  const handleOrderReset = () => {
    setOrderingState([]);
    setFeedback(null);
  };

  const checkOrder = () => {
    const sentence = orderingState.join(' ');
    // Lenient check
    const cleanUser = sentence.toLowerCase().replace(/[^a-z ]/g, '');
    
    // Normalize correct answer(s) into an array
    const answers = Array.isArray(currentQ.correctAnswer) 
        ? currentQ.correctAnswer 
        : [currentQ.correctAnswer];
    
    // Check if user input matches ANY correct answer variant
    const isCorrect = answers.some(ans => {
        const cleanAns = ans.toLowerCase().replace(/[^a-z ]/g, '');
        return cleanUser === cleanAns;
    });
    
    if (isCorrect) {
      setFeedback('correct');
    } else {
      setFeedback('wrong');
      saveMistake(currentQ, sentence, `Day ${currentDay}: ${currentQ.category}`);
    }
  };

  const checkTranslate = () => {
    // 1. Strict Normalization (ignores spaces and punctuation)
    const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanUser = normalize(translateInput);
    
    // Support multiple correct answers (e.g. "Do not" vs "Don't")
    const answers = Array.isArray(currentQ.correctAnswer) 
        ? currentQ.correctAnswer 
        : [currentQ.correctAnswer];

    let isCorrect = false;

    for (const ans of answers) {
        const cleanAns = normalize(ans);
        
        // A. Strict Match
        if (cleanUser === cleanAns) {
            isCorrect = true;
            break;
        }

        // B. Fuzzy Matching (fallback)
        const fuzzyUser = translateInput.toLowerCase().replace(/[^a-z ]/g, '').split(/\s+/).filter(Boolean);
        const fuzzyAns = ans.toLowerCase().replace(/[^a-z ]/g, '').split(/\s+/).filter(Boolean);
        
        const matches = fuzzyAns.filter(w => fuzzyUser.includes(w)).length;
        // Require 70% overlap for fuzzy match
        if (matches / fuzzyAns.length > 0.7) {
           isCorrect = true;
           break;
        }
    }

    if (isCorrect) {
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
      // We also update index to length so it persists as "done"
      setCurrentIndex(currentIndex + 1);
    }
  };

  // Helper to count word occurrences for ordering logic
  const getUsedCounts = () => {
    const counts: Record<string, number> = {};
    orderingState.forEach(w => {
        counts[w] = (counts[w] || 0) + 1;
    });
    return counts;
  };

  if (completed || currentIndex >= currentQuestions.length) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6 animate-fade-in">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <IconCheck className="w-12 h-12 text-wechat" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
            {currentDay === 0 ? "Warm-up 完成！" : `Day ${currentDay} 完成！`}
        </h2>
        <p className="text-slate-500 mb-8">今日打卡成功！结果已自动保存。</p>
        <button 
          onClick={handleRestartDay}
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

  // Guard against invalid index (e.g. if questions array shrank for some reason)
  if (!currentQ) return null;

  return (
    <div className="pb-24">
      {/* 顶部天数切换栏 */}
      <div className="bg-white border-b border-slate-200 p-4 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center justify-between mb-2">
            <button 
                onClick={() => handleDayChange(currentDay - 1)}
                disabled={currentDay <= 0}
                className="text-slate-400 disabled:opacity-30 p-2 hover:bg-slate-50 rounded-full transition-colors"
                title="Previous Day"
            >
                <span className="text-xl">◀</span>
            </button>
            <div className="text-center">
                <h2 className="text-lg font-bold text-slate-800">
                    {currentDay === 0 ? "Day 0: Warm-up" : `Day ${currentDay}`}
                </h2>
                <p className="text-[10px] text-wechat font-bold uppercase tracking-wider">{dailyTopic}</p>
            </div>
            <button 
                onClick={() => handleDayChange(currentDay + 1)}
                disabled={currentDay >= 100}
                className="text-slate-400 disabled:opacity-30 p-2 hover:bg-slate-50 rounded-full transition-colors"
                title="Next Day"
            >
                <span className="text-xl">▶</span>
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
          
          <div className="mb-6 flex justify-between items-start">
            <div>
                <span className="inline-block px-2 py-1 bg-slate-100 text-slate-500 text-[10px] rounded font-bold uppercase tracking-wide mb-2">
                {currentQ.category} • {currentQ.type.toUpperCase()}
                </span>
                <h3 className="text-lg font-bold text-slate-800 leading-snug">
                {currentQ.prompt}
                </h3>
            </div>
            <button 
                onClick={confirmRestart}
                className="p-2 text-slate-300 hover:text-wechat transition-colors"
                title="重新开始"
            >
                <IconRefresh className="w-5 h-5" />
            </button>
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
                    {orderingState.length === 0 && <span className="text-slate-400 text-sm">点击下方单词组句，点击上方单词可撤回...</span>}
                    {orderingState.map((word, i) => (
                      <button 
                        key={i} 
                        onClick={() => handleRemoveWord(i)}
                        className="px-3 py-1.5 bg-white border border-slate-200 rounded shadow-sm text-sm font-medium animate-pop-in hover:bg-red-50 hover:border-red-200 transition-colors"
                        title="点击撤回"
                      >
                        {word}
                      </button>
                    ))}
                 </div>
                 <div className="flex flex-wrap gap-2">
                    {/* Render logic: Count instances to handle duplicate words */}
                    {(() => {
                        const usedCounts = getUsedCounts();
                        return currentQ.options?.map((word, i) => {
                           let isUsed = false;
                           if ((usedCounts[word] || 0) > 0) {
                               isUsed = true;
                               usedCounts[word]--; // Mutate local count to hide the correct number of instances
                           }
                           
                           if (isUsed) return null; // Don't render used buttons

                           return (
                               <button
                                 key={i}
                                 onClick={() => handleOrderClick(word)}
                                 className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 text-sm shadow-sm active:scale-95 transition-transform"
                               >
                                 {word}
                               </button>
                           );
                        });
                    })()}
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