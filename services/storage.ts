import { Question, UserStats } from '../types';

const KEYS = {
  MISTAKES: 'lab_lingua_mistakes',
  STATS: 'lab_lingua_stats',
  PROGRESS: 'lab_lingua_progress', // New key for progress
};

export interface MistakeRecord {
  id: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  date: string;
  title: string;
}

export interface PracticeProgress {
  day: number;
  index: number;
}

export const getMistakes = (): MistakeRecord[] => {
  try {
    const data = localStorage.getItem(KEYS.MISTAKES);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveMistake = (question: Question, userAns: string, title: string) => {
  try {
    const mistakes = getMistakes();
    // Avoid duplicates for the same question ID
    if (mistakes.some(m => m.id === question.id)) return;

    const newMistake: MistakeRecord = {
      id: question.id,
      question: question.prompt,
      userAnswer: userAns,
      correctAnswer: Array.isArray(question.correctAnswer) ? question.correctAnswer[0] : question.correctAnswer,
      date: new Date().toLocaleDateString(),
      title: title
    };

    const updated = [newMistake, ...mistakes].slice(0, 50); // Keep last 50 mistakes
    localStorage.setItem(KEYS.MISTAKES, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save mistake", e);
  }
};

export const getUserStats = (): UserStats => {
  try {
    const data = localStorage.getItem(KEYS.STATS);
    if (data) return JSON.parse(data);
  } catch {}
  
  return {
    streakDays: 1,
    totalPracticed: 0,
    mistakesCount: 0
  };
};

export const updateUserStats = (questionsCount: number) => {
  try {
    const stats = getUserStats();
    
    // Simple streak logic (check if last update was yesterday)
    // For demo simplicity, we just increment if it's a new session
    const lastLogin = localStorage.getItem('last_login_date');
    const today = new Date().toDateString();
    
    if (lastLogin !== today) {
      stats.streakDays += 1;
      localStorage.setItem('last_login_date', today);
    }

    stats.totalPracticed += questionsCount;
    stats.mistakesCount = getMistakes().length;

    localStorage.setItem(KEYS.STATS, JSON.stringify(stats));
    return stats;
  } catch (e) {
    console.error("Failed to update stats", e);
    return getUserStats();
  }
};

// --- New Progress Functions ---

export const savePracticeProgress = (day: number, index: number) => {
  try {
    const progress: PracticeProgress = { day, index };
    localStorage.setItem(KEYS.PROGRESS, JSON.stringify(progress));
  } catch (e) {
    console.error("Failed to save progress", e);
  }
};

export const getPracticeProgress = (): PracticeProgress => {
  try {
    const data = localStorage.getItem(KEYS.PROGRESS);
    if (data) {
      return JSON.parse(data);
    }
  } catch {}
  // Default to Day 1, Index 0 if no save found
  return { day: 1, index: 0 };
};
