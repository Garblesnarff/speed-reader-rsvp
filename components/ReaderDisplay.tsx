import React from 'react';
import { getORPSplit, getBionicLength } from '../utils/rsvpUtils';

interface ReaderDisplayProps {
  word: string;
  isBionicMode: boolean;
}

const BionicFragment: React.FC<{ text: string }> = ({ text }) => {
  // We need to handle cases where the 'text' might be multiple words (Chunk Mode)
  // or a partial word. 
  // Simple heuristic: split by space, apply bionic calc to each part.
  
  const parts = text.split(/(\s+)/); // Keep delimiters
  
  return (
    <>
      {parts.map((part, i) => {
        if (!part.trim()) return <span key={i}>{part}</span>; // Whitespace
        
        // Calculate split point
        const split = getBionicLength(part);
        const boldPart = part.slice(0, split);
        const normalPart = part.slice(split);
        
        return (
          <span key={i}>
            <span className="font-bold text-white">{boldPart}</span>
            <span className="opacity-70">{normalPart}</span>
          </span>
        );
      })}
    </>
  );
};

const ReaderDisplay: React.FC<ReaderDisplayProps> = ({ word, isBionicMode }) => {
  const [start, pivot, end] = getORPSplit(word);

  return (
    <div className="relative flex items-center justify-center w-full h-64 overflow-hidden select-none">
      {/* 
        Optical Recognition Point (ORP) Layout 
        We use a flex container where the left and right parts take up equal remaining space (flex-1),
        ensuring the 'pivot' element remains dead center of the parent.
      */}
      <div className="flex items-baseline w-full max-w-5xl px-4">
        {/* Left part of the word */}
        <div className="flex-1 text-right whitespace-nowrap">
          <span className="text-4xl sm:text-6xl md:text-7xl font-mono text-gray-200">
            {isBionicMode ? <BionicFragment text={start} /> : start}
          </span>
        </div>

        {/* Pivot Character */}
        <div className="flex-none px-0.5 sm:px-1">
          <span className="text-4xl sm:text-6xl md:text-7xl font-mono font-bold text-red-500">
            {pivot}
          </span>
        </div>

        {/* Right part of the word */}
        <div className="flex-1 text-left whitespace-nowrap">
          <span className="text-4xl sm:text-6xl md:text-7xl font-mono text-gray-200">
            {isBionicMode ? <BionicFragment text={end} /> : end}
          </span>
        </div>
      </div>

      {/* Optional: Guide Lines for focusing */}
      <div className="absolute top-0 bottom-0 left-1/2 w-px bg-gray-800/30 transform -translate-x-1/2 pointer-events-none" />
      <div className="absolute left-0 right-0 top-1/2 h-px bg-gray-800/30 transform -translate-y-1/2 pointer-events-none" />
    </div>
  );
};

export default ReaderDisplay;