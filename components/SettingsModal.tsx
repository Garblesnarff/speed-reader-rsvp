import React from 'react';
import { X, Layers, Eye, Monitor, Zap, Coffee, Maximize } from 'lucide-react';
import { FocusMode } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isChunkMode: boolean;
  onToggleChunkMode: () => void;
  chunkSize: number;
  onChunkSizeChange: (size: number) => void;
  isBionicMode: boolean;
  onToggleBionicMode: () => void;
  focusMode: FocusMode;
  onFocusModeChange: (mode: FocusMode) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  isChunkMode,
  onToggleChunkMode,
  chunkSize,
  onChunkSizeChange,
  isBionicMode,
  onToggleBionicMode,
  focusMode,
  onFocusModeChange
}) => {
  if (!isOpen) return null;

  const modes = [
    { id: FocusMode.DEFAULT, label: 'Default', icon: Monitor, desc: 'Standard RSVP experience' },
    { id: FocusMode.MINIMAL, label: 'Minimal', icon: Maximize, desc: 'Hides UI while reading' },
    { id: FocusMode.ZEN, label: 'Zen', icon: Coffee, desc: 'Calming ambient colors' },
    { id: FocusMode.INTENSE, label: 'Intense', icon: Zap, desc: 'High contrast, solid black' },
  ];

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900/50 sticky top-0 backdrop-blur-md z-10">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            Settings
          </h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          
          {/* Focus Mode Section */}
          <div className="space-y-4">
             <label className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Focus Mode</label>
             <div className="grid grid-cols-2 gap-3">
               {modes.map((mode) => {
                 const Icon = mode.icon;
                 const isSelected = focusMode === mode.id;
                 return (
                   <button
                    key={mode.id}
                    onClick={() => onFocusModeChange(mode.id)}
                    className={`flex flex-col items-start p-3 rounded-xl border transition-all text-left ${
                      isSelected 
                        ? 'bg-gray-800 border-red-500/50 text-white shadow-lg shadow-red-900/10' 
                        : 'bg-gray-900/50 border-gray-800 text-gray-400 hover:bg-gray-800 hover:border-gray-700'
                    }`}
                   >
                     <div className={`mb-2 p-1.5 rounded-lg ${isSelected ? 'bg-red-500 text-white' : 'bg-gray-800 text-gray-500'}`}>
                        <Icon size={16} />
                     </div>
                     <span className={`font-semibold text-sm ${isSelected ? 'text-white' : 'text-gray-300'}`}>{mode.label}</span>
                     <span className="text-[10px] text-gray-500 mt-1 leading-tight">{mode.desc}</span>
                   </button>
                 )
               })}
             </div>
          </div>

          <div className="h-px bg-gray-800" />
          
          {/* Chunk Mode Setting */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isChunkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-800 text-gray-400'}`}>
                  <Layers size={20} />
                </div>
                <div>
                  <div className="font-semibold text-gray-200">Chunk Mode</div>
                  <div className="text-xs text-gray-500">Display multiple words at once</div>
                </div>
              </div>
              
              <button
                onClick={onToggleChunkMode}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  isChunkMode ? 'bg-red-600' : 'bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isChunkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Chunk Size Slider - Only visible if active */}
            {isChunkMode && (
              <div className="pl-12 pr-2 animate-in fade-in slide-in-from-top-2 duration-200">
                 <div className="flex justify-between items-center mb-2">
                    <label className="text-xs text-gray-400 font-medium">Chunk Size</label>
                    <span className="text-xs font-mono font-bold text-blue-400">{chunkSize} words</span>
                 </div>
                 <input
                  type="range"
                  min="2"
                  max="5"
                  step="1"
                  value={chunkSize}
                  onChange={(e) => onChunkSizeChange(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400"
                />
                <div className="flex justify-between mt-1 text-[10px] text-gray-600 font-mono">
                  <span>2</span>
                  <span>5</span>
                </div>
              </div>
            )}
          </div>

          <div className="h-px bg-gray-800" />

          {/* Bionic Mode Setting */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isBionicMode ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-800 text-gray-400'}`}>
                <Eye size={20} />
              </div>
              <div>
                <div className="font-semibold text-gray-200">Bionic Mode</div>
                <div className="text-xs text-gray-500">Bold initial letters to guide eyes</div>
              </div>
            </div>
            
            <button
              onClick={onToggleBionicMode}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                isBionicMode ? 'bg-purple-600' : 'bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isBionicMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SettingsModal;