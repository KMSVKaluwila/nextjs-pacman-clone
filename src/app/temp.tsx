'use client';
import { useCallback, useEffect, useRef, useState } from 'react';

// Types
interface Position {
  x: number;
  y: number;
}

interface Ghost extends Position {
  direction: number;
  speed: number;
  scared: boolean;
  color: string;
}

interface GameState {
  pacmanX: number;
  pacmanY: number;
  currentDirection: number;
  dots: Position[];
  powerPellets: Position[];
  ghosts: Ghost[];
  powerModeTimer?: NodeJS.Timeout | null;
}

// Constants
const CELL_SIZE = 20;
const POWER_MODE_DURATION = 10000;

// Game layout
const MAZE_LAYOUT = [
  "####################",
  "#........##........#",
  "#.#####..##..#####.#",
  "#.#...#..##..#...#.#",
  "#.#.#.#..##..#.#.#.#",
  "#.#.#.#..##..#.#.#.#",
  "#....##..##..##....#",
  "#.##.#...##...#.##.#",
  "#.##.#.######.#.##.#",
  "#o.....#....#.....o#",
  "####.#.#.##.#.#####",
  "#o.....#....#.....o#",
  "#.##.#.######.#.##.#",
  "#.##.#...##...#.##.#",
  "#....##..##..##....#",
  "#.#.#.#..##..#.#.#.#",
  "#.#...#..##..#...#.#",
  "#.#####..##..#####.#",
  "#........##........#",
  "####################"
];

export default function PacManGame() {
  // Game state and refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef<GameState | null>(null);
  const animationIdRef = useRef<number>(0);
  
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [powerMode, setPowerMode] = useState(false);

  // Initialize maze
  const initializeMaze = useCallback(() => {
    const dots: Position[] = [];
    const powerPellets: Position[] = [];
    const ghosts: Ghost[] = [];
    let pacmanStartX = CELL_SIZE * 8;
    let pacmanStartY = CELL_SIZE * 8;

    MAZE_LAYOUT.forEach((row, y) => {
      row.split('').forEach((cell, x) => {
        const centerX = (x + 0.5) * CELL_SIZE;
        const centerY = (y + 0.5) * CELL_SIZE;
        
        if (cell === '.') {
          dots.push({ x: centerX, y: centerY });
        } else if (cell === 'o') {
          powerPellets.push({ x: centerX, y: centerY });
        } else if (cell === 'G') {
          const colors = ['#FF0000', '#00FFFF', '#FFB8FF', '#FFB852'];
          ghosts.push({
            x: centerX,
            y: centerY,
            direction: 0,
            speed: 3,
            scared: false,
            color: colors[ghosts.length % colors.length]
          });
        }
      });
    });

    gameStateRef.current = {
      pacmanX: pacmanStartX,
      pacmanY: pacmanStartY,
      currentDirection: 0,
      dots,
      powerPellets,
      ghosts,
      powerModeTimer: null
    };
  }, []);

  // Game functions
  const handlePacmanDeath = useCallback(() => {
    const remainingLives = lives - 1;
    setLives(remainingLives);
    
    if (remainingLives <= 0) {
      setGameOver(true);
    } else {
      if (gameStateRef.current) {
        gameStateRef.current.pacmanX = CELL_SIZE * 8;
        gameStateRef.current.pacmanY = CELL_SIZE * 8;
        gameStateRef.current.currentDirection = 0;
        
        gameStateRef.current.ghosts.forEach(ghost => {
          ghost.x = CELL_SIZE * 8;
          ghost.y = CELL_SIZE * 8;
          ghost.scared = false;
        });
      }
    }
  }, [lives]);

  const drawMaze = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw walls
    ctx.fillStyle = '#2121DE';
    MAZE_LAYOUT.forEach((row, y) => {
      row.split('').forEach((cell, x) => {
        if (cell === '#') {
          ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
      });
    });

    // Draw dots and power pellets
    if (gameStateRef.current) {
      ctx.fillStyle = '#ffffff';
      gameStateRef.current.dots.forEach(dot => {
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, 2, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.fillStyle = '#ffffff';
      gameStateRef.current.powerPellets.forEach(pellet => {
        ctx.beginPath();
        ctx.arc(pellet.x, pellet.y, 6, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // Draw Pacman
    if (gameStateRef.current) {
      ctx.beginPath();
      ctx.fillStyle = 'yellow';
      ctx.arc(
        gameStateRef.current.pacmanX,
        gameStateRef.current.pacmanY,
        CELL_SIZE / 2,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  }, []);

  const canMove = (x: number, y: number): boolean => {
    const gridX = Math.floor(x / CELL_SIZE);
    const gridY = Math.floor(y / CELL_SIZE);
    
    if (gridY < 0 || gridY >= MAZE_LAYOUT.length) return false;
    if (gridX < 0 || gridX >= MAZE_LAYOUT[0].length) return false;
    
    return MAZE_LAYOUT[gridY][gridX] !== '#';
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver) return;
      
      if (gameStateRef.current) {
        const speed = 5;
        let newDirection = gameStateRef.current.currentDirection;

        switch (e.key) {
          case 'ArrowLeft':
          case 'a':
            newDirection = 180;
            break;
          case 'ArrowRight':
          case 'd':
            newDirection = 0;
            break;
          case 'ArrowUp':
          case 'w':
            newDirection = 270;
            break;
          case 'ArrowDown':
          case 's':
            newDirection = 90;
            break;
        }

        const angle = (newDirection * Math.PI) / 180;
        const newX = gameStateRef.current.pacmanX + Math.cos(angle) * speed;
        const newY = gameStateRef.current.pacmanY + Math.sin(angle) * speed;

        if (canMove(newX, newY)) {
          gameStateRef.current.currentDirection = newDirection;
          gameStateRef.current.pacmanX = newX;
          gameStateRef.current.pacmanY = newY;
        }
      }
    };

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Canvas setup
    canvas.width = CELL_SIZE * MAZE_LAYOUT[0].length;
    canvas.height = CELL_SIZE * MAZE_LAYOUT.length;

    // Initialize game
    initializeMaze();

    // Set up event listeners
    window.addEventListener('keydown', handleKeyDown);

    // Game loop
    const gameLoop = () => {
      if (gameOver) return;

      // Draw maze and entities
      drawMaze();

      // Request next frame
      animationIdRef.current = requestAnimationFrame(gameLoop);
    };

    // Start game loop
    gameLoop();

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (gameStateRef.current?.powerModeTimer) {
        clearTimeout(gameStateRef.current.powerModeTimer);
      }
    };
  }, [gameOver, drawMaze, initializeMaze]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-4">
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="border-4 border-blue-900 rounded"
        />
        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
            <div className="text-white text-4xl">Game Over</div>
          </div>
        )}
      </div>
      <div className="mt-4 text-white text-xl">
        <div>Score: {score}</div>
        <div>Level: {level}</div>
        <div>Lives: {lives}</div>
      </div>
    </div>
  );
}
