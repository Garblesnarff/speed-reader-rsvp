import React, { useEffect, useRef } from 'react';

interface ContextWindowProps {
  words: string[];
  currentIndex: number;
  isOpen: boolean;
}

const ContextWindow: React.FC<ContextWindowProps> = ({ words, currentIndex, isOpen }) => {
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

  if (!isOpen) return null;

  return (
    <div className="w-full bg-gray-900 border-t border-gray-800 h-48 sm:h-64 transition-all duration-300 ease-in-out flex flex-col">
      <div className="px-4 py-2 bg-gray-950 border-b border-gray-800 text-xs text-gray-500 font-mono flex justify-between uppercase tracking-wider">
        <span>Context View</span>
        <span>Word {currentIndex + 1} / {words.length}</span>
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
            className += "bg-red-900/50 text-white font-bold shadow-[0_0_10px_rgba(239,68,68,0.2)] scale-105 inline-block";
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
              {word}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default ContextWindow;