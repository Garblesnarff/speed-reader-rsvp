import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import InputView from './components/InputView';
import ReaderDisplay from './components/ReaderDisplay';
import Controls from './components/Controls';
import ContextWindow from './components/ContextWindow';
import SettingsModal from './components/SettingsModal';
import Dashboard from './components/Dashboard';
import QuizModal from './components/QuizModal';
import { parseTextToWords, calculateWordDelay, calculateChunkDelay } from './utils/rsvpUtils';
import { saveSession } from './utils/storage';
import { generateQuiz } from './utils/ai';
import { AppMode, FocusMode, QuizQuestion } from './types';

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
  const [sessionStartTime, setSessionStartTime] = useState<number>(0);

  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isChunkMode, setIsChunkMode] = useState<boolean>(false);
  const [chunkSize, setChunkSize] = useState<number>(2);
  const [isBionicMode, setIsBionicMode] = useState<boolean>(false);
  const [isPeripheralMode, setIsPeripheralMode] = useState<boolean>(false);
  const [focusMode, setFocusMode] = useState<FocusMode>(FocusMode.DEFAULT);

  // Quiz State
  const [isQuizOpen, setIsQuizOpen] = useState<boolean>(false);
  const [quizLoading, setQuizLoading] = useState<boolean>(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);

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
      setSessionStartTime(Date.now());
    }
  };

  const saveCurrentSession = () => {
    if (words.length === 0 || elapsedTime < 5) return; // Ignore very short sessions
    saveSession({
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      wordCount: Math.min(currentIndex, words.length),
      wpm: wpm,
      durationSeconds: elapsedTime,
      snippet: words.slice(0, 5).join(' ') + '...'
    });
  };

  const handleBackToInput = () => {
    setIsPlaying(false);
    saveCurrentSession();
    setMode(AppMode.INPUT);
    setElapsedTime(0);
  };

  const handleRestart = () => {
    saveCurrentSession(); // Save the run before restarting
    setCurrentIndex(0);
    setElapsedTime(0);
    setSessionStartTime(Date.now());
  };

  const handleStartQuiz = async () => {
    setIsPlaying(false);
    setIsQuizOpen(true);
    if (quizQuestions.length === 0) {
      setQuizLoading(true);
      const questions = await generateQuiz(inputText);
      setQuizQuestions(questions);
      setQuizLoading(false);
    }
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

  // --- Display Text Helpers ---
  const currentChunkSize = isChunkMode ? chunkSize : 1;

  const getDisplayedText = () => {
    if (currentIndex >= words.length) return "Done";
    return words.slice(currentIndex, currentIndex + currentChunkSize).join(' ');
  };

  const getPrevText = () => {
    if (!isPeripheralMode) return undefined;
    const start = currentIndex - currentChunkSize;
    if (start < 0) return undefined;
    return words.slice(start, currentIndex).join(' ');
  };

  const getNextText = () => {
    if (!isPeripheralMode) return undefined;
    const start = currentIndex + currentChunkSize;
    if (start >= words.length) return undefined;
    const end = start + currentChunkSize;
    return words.slice(start, end).join(' ');
  };

  // --- Visual & Theme Logic ---

  const getContainerClasses = () => {
    switch (focusMode) {
      case FocusMode.ZEN:
        return "bg-slate-950 text-slate-100";
      case FocusMode.INTENSE:
        return "bg-black text-white";
      case FocusMode.MINIMAL:
        return "bg-gray-950 text-gray-200";
      default: // DEFAULT
        return "bg-gray-950 text-white";
    }
  };

  const getBackgroundElement = () => {
    if (focusMode === FocusMode.MINIMAL || focusMode === FocusMode.INTENSE) {
      return null;
    }
    if (focusMode === FocusMode.ZEN) {
      return (
         <div className="absolute inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-teal-900/20 via-slate-950 to-slate-950"></div>
      )
    }
    // Default
    return (
      <div className="absolute inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-900/50 via-gray-950 to-gray-950"></div>
    );
  };

  const isMinimalAutoHidden = focusMode === FocusMode.MINIMAL && isPlaying;

  // --- Render ---

  if (mode === AppMode.DASHBOARD) {
    return <Dashboard onBack={() => setMode(AppMode.INPUT)} />;
  }

  if (mode === AppMode.INPUT) {
    return (
      <InputView 
        onStart={handleStart} 
        initialText={inputText} 
        onOpenDashboard={() => setMode(AppMode.DASHBOARD)}
      />
    );
  }

  return (
    <div className={`flex flex-col h-screen overflow-hidden relative group transition-colors duration-500 ${getContainerClasses()}`}>
      
      {/* Header */}
      <header className={`flex-none p-4 flex justify-between items-center z-20 transition-all duration-500 ${isMinimalAutoHidden ? 'opacity-0 group-hover:opacity-100 -translate-y-4 group-hover:translate-y-0' : 'opacity-100'}`}>
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
              prevWord={getPrevText()}
              nextWord={getNextText()}
            />
          )}
        </div>
        
        {/* Fixed Bottom Section */}
        <div className={`flex-none w-full transition-all duration-500 ${isMinimalAutoHidden ? 'opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0' : 'opacity-100'}`}>
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
            wordsLeft={Math.max(0, words.length - currentIndex)}
            onStartQuiz={handleStartQuiz}
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

      {/* Modals */}
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isChunkMode={isChunkMode}
        onToggleChunkMode={() => setIsChunkMode(!isChunkMode)}
        chunkSize={chunkSize}
        onChunkSizeChange={setChunkSize}
        isBionicMode={isBionicMode}
        onToggleBionicMode={() => setIsBionicMode(!isBionicMode)}
        focusMode={focusMode}
        onFocusModeChange={setFocusMode}
        isPeripheralMode={isPeripheralMode}
        onTogglePeripheralMode={() => setIsPeripheralMode(!isPeripheralMode)}
      />

      <QuizModal 
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        questions={quizQuestions}
        isLoading={quizLoading}
      />

      {/* Background Ambience */}
      {getBackgroundElement()}
    </div>
  );
};

export default App;
