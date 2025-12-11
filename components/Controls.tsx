import React from 'react';
import { Play, Pause, RotateCcw, PanelBottomClose, PanelBottomOpen, Settings } from 'lucide-react';

interface ControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  wpm: number;
  onWpmChange: (val: number) => void;
  progress: number; // 0 to 100
  onSeek: (val: number) => void;
  onRestart: () => void;
  isContextOpen: boolean;
  onToggleContext: () => void;
  onOpenSettings: () => void;
}

const Controls: React.FC<ControlsProps> = ({
  isPlaying,
  onTogglePlay,
  wpm,
  onWpmChange,
  progress,
  onSeek,
  onRestart,
  isContextOpen,
  onToggleContext,
  onOpenSettings
}) => {
  return (
    <div className="w-full max-w-3xl mx-auto px-6 py-6 bg-gray-900/80 backdrop-blur-md rounded-t-2xl border-t border-gray-800 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.5)]">
      
      {/* Progress Bar */}
      <div className="mb-6 relative group">
        <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-100 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <input
          type="range"
          min="0"
          max="100"
          step="0.1"
          value={progress}
          onChange={(e) => onSeek(parseFloat(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          aria-label="Seek progress"
        />
        <div className="flex justify-between mt-2 text-xs text-gray-500 font-mono">
          <span>Start</span>
          <span>{Math.round(progress)}%</span>
          <span>End</span>
        </div>
      </div>

      {/* Main Controls Row */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Playback Buttons */}
        <div className="flex items-center gap-4">
          <button 
            onClick={onRestart}
            className="p-3 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            title="Restart"
          >
            <RotateCcw size={20} />
          </button>
          
          <button
            onClick={onTogglePlay}
            className="flex items-center justify-center w-14 h-14 bg-white text-gray-950 rounded-full hover:bg-gray-200 transition-transform active:scale-95 shadow-lg shadow-white/10"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
          </button>
        </div>

        {/* Speed Slider */}
        <div className="flex-1 w-full md:w-auto flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Speed</label>
            <span className="text-sm font-mono font-bold text-red-400">{wpm} <span className="text-gray-500">WPM</span></span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-600 font-mono">100</span>
            <input
              type="range"
              min="100"
              max="1000"
              step="10"
              value={wpm}
              onChange={(e) => onWpmChange(parseInt(e.target.value))}
              className="flex-1 h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-red-500 hover:accent-red-400"
            />
            <span className="text-xs text-gray-600 font-mono">1000</span>
          </div>
        </div>

        {/* Right Tools */}
        <div className="flex items-center gap-2">
           <button
            onClick={onOpenSettings}
            className="p-3 rounded-xl border border-transparent text-gray-400 hover:bg-gray-800 hover:text-white transition-all"
            title="Settings"
          >
            <Settings size={20} />
          </button>
          
          <button
            onClick={onToggleContext}
            className={`p-3 rounded-xl border transition-all ${
              isContextOpen 
                ? 'bg-red-500/10 border-red-500/50 text-red-400' 
                : 'bg-gray-800 border-transparent text-gray-400 hover:bg-gray-700'
            }`}
            title="Toggle Context Window"
          >
            {isContextOpen ? <PanelBottomOpen size={20} /> : <PanelBottomClose size={20} />}
          </button>
        </div>

      </div>
    </div>
  );
};

export default Controls;