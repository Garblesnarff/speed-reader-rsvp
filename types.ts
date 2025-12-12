export enum AppMode {
  INPUT = 'INPUT',
  READER = 'READER',
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
