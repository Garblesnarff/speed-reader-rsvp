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
  // Removing punctuation for length check usually feels better, but raw length is fine too.
  if (word.length > 12) {
    delay *= 1.2;
  }

  return delay;
};

/**
 * Splits a word into three parts for Optical Recognition Point (ORP) display:
 * [start, pivot, end]
 * Example: "Reader" -> ["Rea", "d", "er"]
 */
export const getORPSplit = (word: string): [string, string, string] => {
  if (!word) return ["", "", ""];
  
  const length = word.length;
  // Calculate pivot index. 
  // Slightly left of center often feels better, but pure center is standard RSVP.
  // Formula: Math.floor((length - 1) / 2) is common, or just length/2.
  // Requirement says: Math.floor(word.length / 2)
  const pivotIndex = Math.floor((length - 1) / 2); // adjusted slightly to favor left-center for even words like 'four' -> 'o'

  const start = word.slice(0, pivotIndex);
  const pivot = word[pivotIndex];
  const end = word.slice(pivotIndex + 1);

  return [start, pivot, end];
};