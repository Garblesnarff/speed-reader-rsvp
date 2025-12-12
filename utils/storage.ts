import { ReadingSession } from '../types';

const STORAGE_KEY = 'speedread_pro_history';

export const saveSession = (session: ReadingSession) => {
  try {
    const existing = getHistory();
    const updated = [session, ...existing].slice(0, 100); // Keep last 100 sessions
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save session", e);
  }
};

export const getHistory = (): ReadingSession[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const getStats = () => {
  const history = getHistory();
  
  if (history.length === 0) {
    return {
      totalWords: 0,
      totalSessions: 0,
      avgWpm: 0,
      currentStreak: 0,
      bestStreak: 0,
    };
  }

  const totalWords = history.reduce((acc, curr) => acc + curr.wordCount, 0);
  const totalSessions = history.length;
  const avgWpm = Math.round(history.reduce((acc, curr) => acc + curr.wpm, 0) / totalSessions);

  // Calculate Streak (consecutive days)
  // Sort by date descending
  const sortedDates = history
    .map(s => new Date(s.timestamp).setHours(0,0,0,0))
    .sort((a, b) => b - a);
  
  // Remove duplicates
  const uniqueDates = [...new Set(sortedDates)];

  let currentStreak = 0;
  const today = new Date().setHours(0,0,0,0);
  const yesterday = today - 86400000;

  // Check if user read today or yesterday to keep streak alive
  if (uniqueDates.length > 0 && (uniqueDates[0] === today || uniqueDates[0] === yesterday)) {
    currentStreak = 1;
    let prevDate = uniqueDates[0];
    
    for (let i = 1; i < uniqueDates.length; i++) {
      if (prevDate - uniqueDates[i] === 86400000) { // Difference is exactly one day
        currentStreak++;
        prevDate = uniqueDates[i];
      } else {
        break;
      }
    }
  }

  return {
    totalWords,
    totalSessions,
    avgWpm,
    currentStreak,
  };
};
