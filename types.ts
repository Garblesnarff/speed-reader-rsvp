export enum AppMode {
  INPUT = 'INPUT',
  READER = 'READER',
  DASHBOARD = 'DASHBOARD',
}

export enum FocusMode {
  DEFAULT = 'DEFAULT',
  MINIMAL = 'MINIMAL',
  ZEN = 'ZEN',
  INTENSE = 'INTENSE',
}

export interface ReaderSettings {
  wpm: number;
  chunkSize: number;
  isChunkMode: boolean;
  focusMode: FocusMode;
}

export interface ReadingSession {
  id: string;
  timestamp: number;
  wordCount: number;
  wpm: number;
  durationSeconds: number;
  snippet: string; // First few words for identification
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface QuizResult {
  score: number;
  total: number;
}
