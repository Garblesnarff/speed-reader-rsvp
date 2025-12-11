export enum AppMode {
  INPUT = 'INPUT',
  READER = 'READER',
}

export interface ReaderSettings {
  wpm: number;
  chunkSize: number;
  isChunkMode: boolean;
}
