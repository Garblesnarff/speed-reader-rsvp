import React from 'react';
import { getORPSplit, getBionicLength } from '../utils/rsvpUtils';

interface ReaderDisplayProps {
  word: string;
  isBionicMode: boolean;
  prevWord?: string;
  nextWord?: string;
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
            <span className="font-bold text-white/90">{boldPart}</span>
            <span className="opacity-70">{normalPart}</span>
          </span>
        );
      })}
    </>
  );
};

// Helper to render text with Bionic mode check, reusable for peripheral words
const RenderText: React.FC<{ text: string, isBionic: boolean }> = ({ text, isBionic }) => {
  if (isBionic) {
    return <BionicFragment text={text} />;
  }
  return <>{text}</>;
};

const ReaderDisplay: React.FC<ReaderDisplayProps> = ({ word, isBionicMode, prevWord, nextWord }) => {
  const [start, pivot, end] = getORPSplit(word);

  return (
    <div className="relative flex items-center justify-center w-full h-64 overflow-hidden select-none">
      {/* 
        Optical Recognition Point (ORP) Layout 
        We use a flex container where the left and right parts take up equal remaining space (flex-1),
        ensuring the 'pivot' element remains dead center of the parent.
      */}
      <div className="flex items-baseline w-full max-w-7xl px-4">
        
        {/* LEFT SIDE: Previous Word (Optional) + Start of Current */}
        <div className="flex-1 flex justify-end items-baseline gap-12 sm:gap-16 text-right whitespace-nowrap overflow-hidden">
          {/* Ghost Previous Word */}
          {prevWord && (
            <span className="hidden md:inline-block text-3xl sm:text-5xl md:text-6xl font-mono text-gray-500/20 blur-[1px]">
               <RenderText text={prevWord} isBionic={isBionicMode} />
            </span>
          )}
          
          {/* Main Word Start */}
          <span className="text-4xl sm:text-6xl md:text-7xl font-mono text-gray-200">
             <RenderText text={start} isBionic={isBionicMode} />
          </span>
        </div>

        {/* CENTER: Pivot Character */}
        <div className="flex-none px-0.5 sm:px-1 z-10">
          <span className="text-4xl sm:text-6xl md:text-7xl font-mono font-bold text-red-500">
            {pivot}
          </span>
        </div>

        {/* RIGHT SIDE: End of Current + Next Word (Optional) */}
        <div className="flex-1 flex justify-start items-baseline gap-12 sm:gap-16 text-left whitespace-nowrap overflow-hidden">
          {/* Main Word End */}
          <span className="text-4xl sm:text-6xl md:text-7xl font-mono text-gray-200">
            <RenderText text={end} isBionic={isBionicMode} />
          </span>
          
          {/* Ghost Next Word */}
          {nextWord && (
             <span className="hidden md:inline-block text-3xl sm:text-5xl md:text-6xl font-mono text-gray-500/20 blur-[1px]">
                <RenderText text={nextWord} isBionic={isBionicMode} />
             </span>
          )}
        </div>
      </div>

      {/* Guide Lines for focusing */}
      <div className="absolute top-0 bottom-0 left-1/2 w-px bg-gray-800/20 transform -translate-x-1/2 pointer-events-none" />
      <div className="absolute left-0 right-0 top-1/2 h-px bg-gray-800/20 transform -translate-y-1/2 pointer-events-none" />
    </div>
  );
};

export default ReaderDisplay;