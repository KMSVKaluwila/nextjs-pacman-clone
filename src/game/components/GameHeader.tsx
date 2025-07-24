'use client';

import React from 'react';

interface GameHeaderProps {
  score: number;
  level: number;
  lives: number;
  onToggleInstructions: () => void;
}

const GameHeader: React.FC<GameHeaderProps> = ({ score, level, lives, onToggleInstructions }) => {
  return (
    <div className="flex justify-between items-center w-full max-w-xl mb-4 bg-black rounded-lg p-2 border-4 border-blue-900">
      <div className="flex gap-4">
        <div className="px-2 text-center">
          <div className="text-yellow-400 text-xs font-bold uppercase">Score</div>
          <div className="text-white text-xl font-bold">{score}</div>
        </div>
        <div className="px-2 text-center">
          <div className="text-yellow-400 text-xs font-bold uppercase">Level</div>
          <div className="text-white text-xl font-bold">{level}</div>
        </div>
        <div className="px-2 text-center">
          <div className="text-yellow-400 text-xs font-bold uppercase">Lives</div>
          <div className="text-white text-xl font-bold flex justify-center gap-1">
            {[...Array(lives)].map((_, i) => (
              <span key={i} className="text-yellow-400">●</span>
            ))}
          </div>
        </div>
      </div>
      <button
        onClick={onToggleInstructions}
        className="p-2 rounded-full text-white hover:bg-blue-900 transition-colors pointer-events-auto"
        aria-label="Instructions"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
      </button>
    </div>
  );
};

export default GameHeader;