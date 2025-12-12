import React, { useState } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import { QuizQuestion } from '../types';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: QuizQuestion[];
  isLoading: boolean;
}

const QuizModal: React.FC<QuizModalProps> = ({ isOpen, onClose, questions, isLoading }) => {
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);

  if (!isOpen) return null;

  const handleAnswer = (qIndex: number, optionIndex: number) => {
    if (showResults) return; // Locked
    const newAnswers = [...userAnswers];
    newAnswers[qIndex] = optionIndex;
    setUserAnswers(newAnswers);
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, i) => {
      if (userAnswers[i] === q.correctAnswerIndex) score++;
    });
    return score;
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-gray-900">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Comprehension Check
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-48 space-y-4">
              <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-400 animate-pulse">Generating questions with AI...</p>
            </div>
          ) : questions.length === 0 ? (
             <div className="text-center text-gray-500">Could not generate quiz. Try again later.</div>
          ) : (
            <div className="space-y-8">
              {questions.map((q, qIdx) => (
                <div key={qIdx} className="space-y-3">
                  <h3 className="text-lg font-medium text-gray-200">{qIdx + 1}. {q.question}</h3>
                  <div className="space-y-2">
                    {q.options.map((option, oIdx) => {
                      let btnClass = "w-full p-4 rounded-xl border text-left transition-all flex justify-between items-center ";
                      
                      if (showResults) {
                        if (oIdx === q.correctAnswerIndex) {
                          btnClass += "bg-green-500/10 border-green-500/50 text-green-400 ";
                        } else if (userAnswers[qIdx] === oIdx) {
                           btnClass += "bg-red-500/10 border-red-500/50 text-red-400 ";
                        } else {
                          btnClass += "bg-gray-800/50 border-gray-800 text-gray-500 opacity-50 ";
                        }
                      } else {
                        if (userAnswers[qIdx] === oIdx) {
                           btnClass += "bg-blue-600 border-blue-500 text-white shadow-lg ";
                        } else {
                           btnClass += "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 ";
                        }
                      }

                      return (
                        <button
                          key={oIdx}
                          onClick={() => handleAnswer(qIdx, oIdx)}
                          disabled={showResults}
                          className={btnClass}
                        >
                          <span>{option}</span>
                          {showResults && oIdx === q.correctAnswerIndex && <CheckCircle size={18} />}
                          {showResults && userAnswers[qIdx] === oIdx && oIdx !== q.correctAnswerIndex && <AlertCircle size={18} />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {!isLoading && questions.length > 0 && (
          <div className="p-6 border-t border-gray-800 bg-gray-900/50 flex justify-between items-center">
            {showResults ? (
               <div className="text-lg font-bold">
                 Score: <span className={calculateScore() === questions.length ? "text-green-400" : "text-white"}>{calculateScore()} / {questions.length}</span>
               </div>
            ) : (
               <div className="text-sm text-gray-500">Select all answers to check</div>
            )}
            
            {!showResults ? (
               <button
                onClick={() => setShowResults(true)}
                disabled={userAnswers.length < questions.length || userAnswers.includes(undefined as any)}
                className="px-6 py-3 bg-white text-black font-bold rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
               >
                 Check Answers
               </button>
            ) : (
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gray-800 text-white font-bold rounded-full hover:bg-gray-700 transition-colors"
               >
                 Done
               </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default QuizModal;
