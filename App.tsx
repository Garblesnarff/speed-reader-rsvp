import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import InputView from './components/InputView';
import ReaderDisplay from './components/ReaderDisplay';
import Controls from './components/Controls';
import ContextWindow from './components/ContextWindow';
import { parseTextToWords, calculateWordDelay } from './utils/rsvpUtils';
import { AppMode } from './types';

const App: React.FC = () => {
  // --- State ---
  const [mode, setMode] = useState<AppMode>(AppMode.INPUT);
  const [inputText, setInputText] = useState<string>("");
  const [words, setWords] = useState<string[]>([]);
  
  // Reader State
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [wpm, setWpm] = useState<number>(300);
  const [isContextOpen, setIsContextOpen] = useState<boolean>(true);
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  // Refs for timing
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- Logic ---

  const handleStart = (text: string) => {
    const parsed = parseTextToWords(text);
    if (parsed.length > 0) {
      setInputText(text);
      setWords(parsed);
      setCurrentIndex(0);
      setMode(AppMode.READER);
      setIsPlaying(false); // Let user start manually, or auto-start if preferred
      setElapsedTime(0);
    }
  };

  const handleBackToInput = () => {
    setIsPlaying(false);
    setMode(AppMode.INPUT);
    setElapsedTime(0);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setElapsedTime(0);
  };

  // Timer Logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying]);

  // The main RSVP Loop
  useEffect(() => {
    if (isPlaying && currentIndex < words.length) {
      const currentWord = words[currentIndex];
      const delay = calculateWordDelay(currentWord, wpm);

      timeoutRef.current = setTimeout(() => {
        setCurrentIndex(prev => {
          if (prev + 1 >= words.length) {
            setIsPlaying(false);
            return prev; // Stop at the end
          }
          return prev + 1;
        });
      }, delay);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isPlaying, currentIndex, words, wpm]);

  // Handle Seek
  const handleSeek = (percent: number) => {
    if (words.length === 0) return;
    const newIndex = Math.floor((percent / 100) * (words.length - 1));
    setCurrentIndex(newIndex);
  };

  const progress = words.length > 0 
    ? (currentIndex / (words.length - 1)) * 100 
    : 0;

  // --- Render ---

  if (mode === AppMode.INPUT) {
    return <InputView onStart={handleStart} initialText={inputText} />;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white overflow-hidden relative">
      
      {/* Header */}
      <header className="flex-none p-4 flex justify-between items-center z-20">
        <button 
          onClick={handleBackToInput}
          className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm font-medium uppercase tracking-wide"
        >
          <ArrowLeft size={18} />
          Edit Text
        </button>
        <div className="text-gray-700 text-xs font-mono">
          {currentIndex + 1} / {words.length}
        </div>
      </header>

      {/* Main Reader Area */}
      <main className="flex-1 flex flex-col relative z-10">
        <div className="flex-1 flex items-center justify-center">
          {words.length > 0 && (
            <ReaderDisplay word={words[currentIndex]} />
          )}
        </div>
        
        {/* Fixed Bottom Section */}
        <div className="flex-none w-full">
          <Controls 
            isPlaying={isPlaying}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
            wpm={wpm}
            onWpmChange={setWpm}
            progress={progress}
            onSeek={handleSeek}
            onRestart={handleRestart}
            isContextOpen={isContextOpen}
            onToggleContext={() => setIsContextOpen(!isContextOpen)}
          />
          
          <ContextWindow 
            words={words}
            currentIndex={currentIndex}
            isOpen={isContextOpen}
            elapsedTime={elapsedTime}
          />
        </div>
      </main>

      {/* Background Ambience (Optional) */}
      <div className="absolute inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-900/50 via-gray-950 to-gray-950"></div>
    </div>
  );
};

export default App;