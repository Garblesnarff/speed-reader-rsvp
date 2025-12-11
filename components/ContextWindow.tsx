import React, { useEffect, useRef } from 'react';
import { getBionicLength } from '../utils/rsvpUtils';

interface ContextWindowProps {
  words: string[];
  currentIndex: number;
  isOpen: boolean;
  elapsedTime: number;
  isBionicMode: boolean;
}

const ContextWindow: React.FC<ContextWindowProps> = ({ words, currentIndex, isOpen, elapsedTime, isBionicMode }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeWordRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // Only scroll if open and playing (or index changed)
    if (isOpen && activeWordRef.current) {
      activeWordRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center'
      });
    }
  }, [currentIndex, isOpen]);

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const renderWord = (word: string) => {
    if (!isBionicMode) return word;

    const split = getBionicLength(word);
    const boldPart = word.slice(0, split);
    const normalPart = word.slice(split);
    
    return (
      <>
        <span className="font-bold text-gray-100">{boldPart}</span>
        <span className="opacity-80">{normalPart}</span>
      </>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="w-full bg-gray-900 border-t border-gray-800 h-48 sm:h-64 transition-all duration-300 ease-in-out flex flex-col">
      <div className="px-4 py-2 bg-gray-950 border-b border-gray-800 text-xs text-gray-500 font-mono flex justify-between uppercase tracking-wider">
        <span>Context View</span>
        <div className="flex gap-3">
          <span title="Elapsed Time" className="text-gray-300">{formatTime(elapsedTime)}</span>
          <span className="text-gray-700">|</span>
          <span>Word {currentIndex + 1} / {words.length}</span>
        </div>
      </div>
      
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto p-6 text-lg leading-loose text-justify font-serif custom-scrollbar"
      >
        {words.map((word, index) => {
          let className = "mx-1 px-1 rounded transition-colors duration-200 ";
          
          if (index < currentIndex) {
            // Past words
            className += "text-gray-600";
          } else if (index === currentIndex) {
            // Current word
            className += "bg-red-900/50 text-white shadow-[0_0_10px_rgba(239,68,68,0.2)] scale-105 inline-block";
            // Note: We don't apply extra bold to the container here if bionic is on, 
            // because bionic handles internal bolding. But current word usually deserves focus.
            // Let's keep the current word container styling but maybe not override internal bionic styles.
            if (!isBionicMode) className += " font-bold"; 
          } else {
            // Future words
            className += "text-gray-400";
          }

          return (
            <span 
              key={index} 
              ref={index === currentIndex ? activeWordRef : null}
              className={className}
            >
              {renderWord(word)}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default ContextWindow;