import React, { useState } from 'react';
import { BookOpen, Play, LayoutDashboard } from 'lucide-react';

interface InputViewProps {
  onStart: (text: string) => void;
  onOpenDashboard: () => void;
  initialText?: string;
}

const DEFAULT_TEXT = `Welcome to SpeedRead Pro. 

This application uses the RSVP (Rapid Serial Visual Presentation) method to help you read faster. 

The average person reads at about 200-250 words per minute. With this method, you can easily double or triple that speed by eliminating eye movements required to scan across a page.

Simply paste your text here, click start, and focus on the red letter in the center of the screen. Adjust the speed using the slider below. Good luck!`;

const InputView: React.FC<InputViewProps> = ({ onStart, onOpenDashboard, initialText }) => {
  const [text, setText] = useState(initialText || DEFAULT_TEXT);

  const handleSubmit = () => {
    if (text.trim().length > 0) {
      onStart(text);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 max-w-4xl mx-auto w-full relative">
      <button 
        onClick={onOpenDashboard}
        className="absolute top-6 right-6 flex items-center gap-2 px-4 py-2 rounded-full bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700 transition-colors text-sm font-medium"
      >
        <LayoutDashboard size={16} />
        Dashboard
      </button>

      <div className="flex items-center gap-3 mb-8">
        <BookOpen className="w-10 h-10 text-red-500" />
        <h1 className="text-4xl font-bold tracking-tight text-white">SpeedRead Pro</h1>
      </div>
      
      <div className="w-full bg-gray-900/50 rounded-xl p-1 border border-gray-800 shadow-2xl backdrop-blur-sm">
        <textarea
          className="w-full h-96 bg-gray-950 text-gray-300 p-6 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-red-500/50 text-lg leading-relaxed placeholder-gray-700"
          placeholder="Paste your text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={!text.trim()}
        className="mt-8 group relative inline-flex items-center gap-3 px-8 py-4 bg-red-600 hover:bg-red-500 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-full font-semibold text-lg transition-all duration-200 shadow-lg shadow-red-900/20 hover:shadow-red-500/30 hover:-translate-y-0.5 active:translate-y-0"
      >
        <span>Start Reading</span>
        <Play className="w-5 h-5 fill-current" />
      </button>
    </div>
  );
};

export default InputView;
