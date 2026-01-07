export enum View {
  HOME = 'HOME',       // 今日练习
  LISTENING = 'LISTENING', // 听力课堂 (New)
  REVIEW = 'REVIEW',   // 题库与复习
  LIBRARY = 'LIBRARY', // 素材库
  PROFILE = 'PROFILE', // 我的
}

export interface NavItem {
  id: View;
  label: string;
  icon: string;
}

// 题目类型
export type QuestionType = 'choice' | 'ordering' | 'translate' | 'speaking';

export interface Question {
  id: string;
  type: QuestionType;
  category: string; // e.g., 'Email', 'Meeting', 'Vocab'
  prompt: string;
  options?: string[]; // For choice
  correctAnswer: string | string[];
  explanation?: string; // 解析
  userAnswer?: string;
  isCorrect?: boolean;
}

// 素材类型
export type MaterialCategory = 'email' | 'meeting' | 'vocab' | 'note';

export interface Material {
  id: string;
  category: MaterialCategory;
  title: string;
  content: string;
  tags: string[];
  date: string;
}

export interface UserStats {
  streakDays: number;
  totalPracticed: number;
  mistakesCount: number;
}

export interface VocabCard {
  term: string;
  translation: string;
  definition: string;
  example: string;
  context: string;
}

export interface ListeningLesson {
  id: string;
  bvid: string;
  page: number; // Bilibili P number
  title: string;
  description: string;
  duration: string;
  questions: Question[];
}