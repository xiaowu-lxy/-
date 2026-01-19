import { Question, UserStats } from '../types';

const KEYS = {
  MISTAKES: 'lab_lingua_mistakes',
  STATS: 'lab_lingua_stats',
  PROGRESS_MAP: 'lab_lingua_progress_map', // Changed: store a map of day -> index
  LAST_DAY: 'lab_lingua_last_day' // Changed: store the last visited day
};

export interface MistakeRecord {
  id: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  date: string;
  title: string;
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

// --- Updated Progress Functions (Per Day) ---

export const getDayProgress = (day: number): number => {
  try {
    const map = JSON.parse(localStorage.getItem(KEYS.PROGRESS_MAP) || '{}');
    return typeof map[day] === 'number' ? map[day] : 0;
  } catch {
    return 0;
  }
};

export const saveDayProgress = (day: number, index: number) => {
  try {
    const map = JSON.parse(localStorage.getItem(KEYS.PROGRESS_MAP) || '{}');
    map[day] = index;
    localStorage.setItem(KEYS.PROGRESS_MAP, JSON.stringify(map));
  } catch (e) {
    console.error("Failed to save progress", e);
  }
};

export const getLastActiveDay = (): number => {
  try {
    const day = localStorage.getItem(KEYS.LAST_DAY);
    return day ? parseInt(day) : 1;
  } catch {
    return 1;
  }
};

export const saveLastActiveDay = (day: number) => {
  localStorage.setItem(KEYS.LAST_DAY, day.toString());
};
