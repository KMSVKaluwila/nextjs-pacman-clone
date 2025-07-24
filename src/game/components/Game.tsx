'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import GameEngine from '../classes/GameEngine';
import MobileControls from '../utils/MobileControls';
import SoundManager from '../utils/SoundManager';
import GameUI from './GameUI';
import GameHeader from './GameHeader';
import { Direction, GameState } from '../constants/GameConstants';

const Game = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gameEngineRef = useRef<GameEngine | null>(null);
  const soundManagerRef = useRef<SoundManager | null>(null);
  const mobileControlsRef = useRef<MobileControls | null>(null);

  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [gameState, setGameState] = useState<GameState>(GameState.READY);
  const [isMuted, setIsMuted] = useState(true);
  const [controlsVisible, setControlsVisible] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    if (canvasRef.current && containerRef.current) {
      const onScoreUpdate = ({ score, level, lives }: { score: number; level: number; lives: number }) => {
        setScore(score);
        setLevel(level);
        setLives(lives);
      };

      gameEngineRef.current = new GameEngine(canvasRef.current, {
        onScoreUpdate,
        onGameStateChange: setGameState,
      });

      soundManagerRef.current = new SoundManager();
      soundManagerRef.current?.setMute(isMuted);

      mobileControlsRef.current = new MobileControls(
        containerRef.current,
        (direction: Direction) => {
            let key = '';
            switch (direction) {
              case Direction.UP: key = 'ArrowUp'; break;
              case Direction.DOWN: key = 'ArrowDown'; break;
              case Direction.LEFT: key = 'ArrowLeft'; break;
              case Direction.RIGHT: key = 'ArrowRight'; break;
            }
            gameEngineRef.current?.handleKeyDown(key);
        }
      );

      const handleKeyDown = (e: KeyboardEvent) => {
        gameEngineRef.current?.handleKeyDown(e.key);
      };

      window.addEventListener('keydown', handleKeyDown);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        gameEngineRef.current?.cleanup();
        mobileControlsRef.current?.cleanup();
      };
    }
  }, [isMuted]);

  const handleStartGame = () => {
    gameEngineRef.current?.start();
  };

  const handleResetGame = () => {
    gameEngineRef.current?.reset();
  };

  const handlePauseGame = () => {
    gameEngineRef.current?.pause();
  };

  const handleToggleControls = () => {
    if (mobileControlsRef.current) {
      const isVisible = mobileControlsRef.current.toggleControls();
      setControlsVisible(isVisible);
    }
  };

  const handleToggleInstructions = () => {
    setShowInstructions(!showInstructions);
  };

  return (
    <div ref={containerRef} className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      <GameHeader
        score={score}
        level={level}
        lives={lives}
        onToggleInstructions={handleToggleInstructions}
      />
      <div className="relative w-full max-w-xl aspect-[20/21]">
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full bg-black border-4 border-blue-900 rounded-lg"
        />
        <GameUI
          score={score}
          level={level}
          lives={lives}
          gameState={gameState}
          onStartGame={handleStartGame}
          onResetGame={handleResetGame}
          onPauseGame={handlePauseGame}
          onToggleControls={handleToggleControls}
          isMuted={isMuted}
          showInstructions={showInstructions}
          onToggleInstructions={handleToggleInstructions}
          controlsVisible={controlsVisible}
        />
      </div>
    </div>
  );
};

export default Game;
