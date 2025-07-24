'use client';

import React, { useState } from 'react';
import { GameState } from '../constants/GameConstants';

interface GameUIProps {
  score: number;
  level: number;
  lives: number;
  gameState: GameState;
  onStartGame: () => void;
  onResetGame: () => void;
  onPauseGame: () => void;
  onToggleControls: () => void;
  isMuted: boolean;
  showInstructions: boolean;
  onToggleInstructions: () => void;
  controlsVisible: boolean;
}

/**
 * Game UI component for displaying score, lives, and game state
 */
const GameUI: React.FC<GameUIProps> = ({
  score,
  level,
  lives,
  gameState,
  onStartGame,
  onResetGame,
  onPauseGame,
  onToggleControls,
  isMuted,
  showInstructions,
  onToggleInstructions,
  controlsVisible
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Header with game info */}
      <div className="flex justify-end items-center p-4 pointer-events-auto">
        <div className="flex gap-2">
          <button 
            onClick={onToggleControls}
            className="bg-blue-900 p-2 rounded-full text-white hover:bg-blue-800 transition-colors md:hidden"
            aria-label={controlsVisible ? "Hide Controls" : "Show Controls"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          </button>
        </div>
      </div>

      {/* Game state overlays */}
      {gameState === GameState.READY && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-80 pointer-events-auto">
          <h1 className="text-4xl font-bold text-yellow-400 mb-8 animate-pulse">PAC-MAN</h1>
          <button 
            onClick={onStartGame}
            className="bg-yellow-400 text-black font-bold py-3 px-8 rounded-full text-xl hover:bg-yellow-300 transition-colors"
          >
            Start Game
          </button>
        </div>
      )}

      {gameState === GameState.PAUSED && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-80 pointer-events-auto">
          <div className="text-yellow-400 text-4xl font-bold mb-8">PAUSED</div>
          <div className="flex gap-4">
            <button 
              onClick={onStartGame}
              className="bg-yellow-400 text-black font-bold py-2 px-6 rounded-full hover:bg-yellow-300 transition-colors"
            >
              Resume
            </button>
            <button 
              onClick={onResetGame}
              className="bg-red-500 text-white font-bold py-2 px-6 rounded-full hover:bg-red-600 transition-colors"
            >
              Restart
            </button>
          </div>
        </div>
      )}

      {gameState === GameState.GAME_OVER && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-90 pointer-events-auto">
          <div className="text-red-500 text-6xl font-bold mb-4 animate-bounce">Game Over</div>
          <div className="text-yellow-400 text-2xl mb-8">Final Score: {score}</div>
          <button 
            onClick={onResetGame}
            className="bg-yellow-400 text-black font-bold py-3 px-8 rounded-full text-xl hover:bg-yellow-300 transition-colors"
          >
            Play Again
          </button>
        </div>
      )}

      {gameState === GameState.LEVEL_COMPLETE && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-80 pointer-events-auto">
          <div className="text-green-500 text-4xl font-bold mb-4">Level Complete!</div>
          <div className="text-yellow-400 text-2xl mb-8">Score: {score}</div>
          <div className="text-white text-xl animate-pulse">Get Ready for Level {level + 1}</div>
        </div>
      )}

      {/* Instructions modal */}
      {showInstructions && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-90 pointer-events-auto">
          <div className="bg-blue-900 p-6 rounded-lg max-w-md w-full">
            <h2 className="text-yellow-400 text-2xl font-bold mb-4">How to Play</h2>
            
            <div className="text-white mb-4">
              <h3 className="font-bold mb-2">Controls:</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Use Arrow Keys or WASD to move Pac-Man</li>
                <li>Press P to pause the game</li>
                <li>Mobile: Use on-screen controls or swipe</li>
              </ul>
            </div>
            
            <div className="text-white mb-4">
              <h3 className="font-bold mb-2">Objective:</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Eat all dots to complete the level</li>
                <li>Avoid ghosts or they'll eat you</li>
                <li>Eat power pellets to scare ghosts temporarily</li>
                <li>Eat scared ghosts for bonus points</li>
              </ul>
            </div>
            
            <button 
              onClick={onToggleInstructions}
              className="bg-yellow-400 text-black font-bold py-2 px-4 rounded-full mt-4 hover:bg-yellow-300 transition-colors w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameUI;