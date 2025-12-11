/**
 * Splits raw text into an array of words, preserving punctuation attached to the word.
 */
export const parseTextToWords = (text: string): string[] => {
  if (!text) return [];
  // Split by whitespace, filter out empty strings
  return text.trim().split(/\s+/).filter(w => w.length > 0);
};

/**
 * Calculates the display duration for a given word based on WPM and linguistic features.
 */
export const calculateWordDelay = (word: string, wpm: number): number => {
  const baseDelay = 60000 / wpm;
  let delay = baseDelay;

  // Punctuation Logic
  const lastChar = word.slice(-1);
  if (lastChar === ',') {
    delay *= 1.5;
  } else if (['.', '?', '!', ';', ':'].includes(lastChar)) {
    delay *= 2.0;
  }

  // Long Word Logic
  if (word.length > 12) {
    delay *= 1.2;
  }

  return delay;
};

/**
 * Calculates the total duration for a chunk of words.
 * It sums the individual delays for each word in the chunk.
 */
export const calculateChunkDelay = (words: string[], wpm: number): number => {
  if (!words || words.length === 0) return 60000 / wpm;
  
  let totalDelay = 0;
  words.forEach(word => {
    totalDelay += calculateWordDelay(word, wpm);
  });
  
  // Slightly reduce total delay for chunks to maintain flow, 
  // as the brain processes groups faster than individual serial presentation
  return totalDelay * 0.95; 
};

/**
 * Splits a word (or chunk) into three parts for Optical Recognition Point (ORP) display:
 * [start, pivot, end]
 * Example: "Reader" -> ["Rea", "d", "er"]
 */
export const getORPSplit = (text: string): [string, string, string] => {
  if (!text) return ["", "", ""];
  
  const length = text.length;
  let pivotIndex = Math.floor((length - 1) / 2);

  // Correction for spaces: 
  // If the calculated pivot is a space (common in multi-word chunks),
  // shift right to the next character so we anchor on a letter.
  if (text[pivotIndex] === ' ') {
    pivotIndex++;
  }
  
  // Safety check if shift pushed us out of bounds (trailing space case, unlikely due to trim)
  if (pivotIndex >= length) {
    pivotIndex = length - 1;
  }

  const start = text.slice(0, pivotIndex);
  const pivot = text[pivotIndex];
  const end = text.slice(pivotIndex + 1);

  return [start, pivot, end];
};

/**
 * Determines the number of characters to bold for Bionic Reading based on word length.
 */
export const getBionicLength = (word: string): number => {
  const len = word.length;
  if (len === 0) return 0;
  // Bold 1 char for short words, roughly 40% for longer ones
  if (len <= 3) return 1;
  return Math.ceil(len * 0.4);
};
