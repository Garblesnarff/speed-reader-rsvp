import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import InputView from './components/InputView';
import ReaderDisplay from './components/ReaderDisplay';
import Controls from './components/Controls';
import ContextWindow from './components/ContextWindow';
import SettingsModal from './components/SettingsModal';
import { parseTextToWords, calculateWordDelay, calculateChunkDelay } from './utils/rsvpUtils';
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

  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isChunkMode, setIsChunkMode] = useState<boolean>(false);
  const [chunkSize, setChunkSize] = useState<number>(2);
  const [isBionicMode, setIsBionicMode] = useState<boolean>(false);

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
      setIsPlaying(false);
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
      // Determine effective chunk size
      const currentChunkSize = isChunkMode ? chunkSize : 1;
      
      // Get the current word(s) to determine delay
      const chunkWords = words.slice(currentIndex, currentIndex + currentChunkSize);
      
      // If we are at the end and have fewer words than chunk size, that's fine, calculateChunkDelay handles it.
      let delay = 0;
      if (isChunkMode) {
        delay = calculateChunkDelay(chunkWords, wpm);
      } else {
        // Fallback to single word precise calc
        delay = calculateWordDelay(words[currentIndex], wpm);
      }

      timeoutRef.current = setTimeout(() => {
        setCurrentIndex(prev => {
          const nextIndex = prev + currentChunkSize;
          if (nextIndex >= words.length) {
            setIsPlaying(false);
            // Ensure we don't go out of bounds, but sitting at words.length is fine (shows nothing or completion state)
            // Actually, let's clamp to words.length - 1 if we want to show the last word, 
            // but usually stopping means we are done. 
            // Let's cap at words.length so ContextWindow knows we are done.
            return Math.min(nextIndex, words.length); 
          }
          return nextIndex;
        });
      }, delay);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isPlaying, currentIndex, words, wpm, isChunkMode, chunkSize]);

  // Handle Seek
  const handleSeek = (percent: number) => {
    if (words.length === 0) return;
    const newIndex = Math.floor((percent / 100) * (words.length - 1));
    setCurrentIndex(newIndex);
  };

  const progress = words.length > 0 
    ? (Math.min(currentIndex, words.length - 1) / (words.length - 1)) * 100 
    : 0;

  // Compute displayed text based on mode
  const getDisplayedText = () => {
    if (currentIndex >= words.length) return "Done";
    
    if (isChunkMode) {
      return words.slice(currentIndex, currentIndex + chunkSize).join(' ');
    }
    return words[currentIndex];
  };

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
          {Math.min(currentIndex + 1, words.length)} / {words.length}
        </div>
      </header>

      {/* Main Reader Area */}
      <main className="flex-1 flex flex-col relative z-10">
        <div className="flex-1 flex items-center justify-center">
          {words.length > 0 && (
            <ReaderDisplay 
              word={getDisplayedText()} 
              isBionicMode={isBionicMode}
            />
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
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
          
          <ContextWindow 
            words={words}
            currentIndex={currentIndex}
            isOpen={isContextOpen}
            elapsedTime={elapsedTime}
            isBionicMode={isBionicMode}
          />
        </div>
      </main>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isChunkMode={isChunkMode}
        onToggleChunkMode={() => setIsChunkMode(!isChunkMode)}
        chunkSize={chunkSize}
        onChunkSizeChange={setChunkSize}
        isBionicMode={isBionicMode}
        onToggleBionicMode={() => setIsBionicMode(!isBionicMode)}
      />

      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-900/50 via-gray-950 to-gray-950"></div>
    </div>
  );
};

export default App;