import Pacman from './Pacman';
import Ghost from './Ghost';
import {
  CELL_SIZE,
  POWER_MODE_DURATION,
  POINTS,
  GameState,
  GhostType,
  GHOST_COLORS,
  Direction,
  MAZE_LAYOUT,
  LEVEL_SETTINGS
} from '../constants/GameConstants';

// Types
interface Position {
  x: number;
  y: number;
}

interface GameScore {
  score: number;
  level: number;
  lives: number;
}

interface GameCallbacks {
  onScoreUpdate: (score: GameScore) => void;
  onGameStateChange: (state: GameState) => void;
  // Sound functionality is disabled
  // onSoundPlay?: (sound: string) => void;
}

/**
 * Main game engine class that manages the game state and logic
 */
export default class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private pacman: Pacman;
  private ghosts: Ghost[];
  private dots: Position[];
  private powerPellets: Position[];
  private pacmanStartPosition: Position;
  private nextDirection: Direction | null;
  private score: number;
  private level: number;
  private lives: number;
  private gameState: GameState;
  private animationId: number;
  private callbacks: GameCallbacks;
  private lastFrameTime: number;
  private fps: number;

  constructor(canvas: HTMLCanvasElement, callbacks: GameCallbacks) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    this.callbacks = callbacks;
    this.score = 0;
    this.level = 1;
    this.lives = 3;
    this.gameState = GameState.READY;
    this.animationId = 0;
    this.lastFrameTime = 0;
    this.fps = 60;
    this.nextDirection = null;

    // Initialize game entities
    this.pacmanStartPosition = { x: 0, y: 0 }; // Initial placeholder
    this.pacman = new Pacman(this.pacmanStartPosition.x, this.pacmanStartPosition.y, CELL_SIZE);
    this.ghosts = [];
    this.dots = [];
    this.powerPellets = [];

    // Set up canvas
    this.setupCanvas();

    // Initialize the maze
    this.initializeMaze();
  }

  /**
   * Set up the canvas dimensions based on the maze layout
   */
  private setupCanvas(): void {
    this.canvas.width = CELL_SIZE * MAZE_LAYOUT[0].length;
    this.canvas.height = CELL_SIZE * MAZE_LAYOUT.length;
  }

  /**
   * Initialize the maze with dots, power pellets, ghosts, and Pacman
   */
  private initializeMaze(): void {
    this.dots = [];
    this.powerPellets = [];
    this.ghosts = [];

    const ghostStartPositions: { [key: string]: Position } = {};
    let pacmanStartPos: Position | null = null;

    // Parse the maze layout
    MAZE_LAYOUT.forEach((row, y) => {
      row.split('').forEach((cell, x) => {
        const centerX = (x + 0.5) * CELL_SIZE;
        const centerY = (y + 0.5) * CELL_SIZE;

        switch (cell) {
          case '.':
            this.dots.push({ x: centerX, y: centerY });
            break;
          case 'o':
            this.powerPellets.push({ x: centerX, y: centerY });
            break;
          case 'P':
            pacmanStartPos = { x: centerX, y: centerY };
            break;
          case 'B':
            ghostStartPositions[GhostType.BLINKY] = { x: centerX, y: centerY };
            break;
          case 'I':
            ghostStartPositions[GhostType.INKY] = { x: centerX, y: centerY };
            break;
          case 'K': // Assuming 'K' for Pinky
            ghostStartPositions[GhostType.PINKY] = { x: centerX, y: centerY };
            break;
          case 'C':
            ghostStartPositions[GhostType.CLYDE] = { x: centerX, y: centerY };
            break;
        }
      });
    });

    // Create Pacman
    if (!pacmanStartPos) throw new Error('Pacman start position not found in maze layout.');
    this.pacmanStartPosition = pacmanStartPos;
    this.pacman.reset(this.pacmanStartPosition.x, this.pacmanStartPosition.y);

    // Create Ghosts with different types
    Object.values(GhostType).forEach(type => {
      const pos = ghostStartPositions[type];
      if (!pos) throw new Error(`Start position for ghost ${type} not found.`);
      const ghost = new Ghost(
        pos.x,
        pos.y,
        CELL_SIZE,
        GHOST_COLORS[type],
        type
      );
      this.ghosts.push(ghost);
    });

    // Update level settings
    this.applyLevelSettings();
  }

  /**
   * Checks if an entity is close to the center of a grid tile, which is an intersection point.
   */
  private isAtIntersection(entity: Pacman | Ghost): boolean {
    const xCenter = (Math.floor(entity.x / CELL_SIZE) + 0.5) * CELL_SIZE;
    const yCenter = (Math.floor(entity.y / CELL_SIZE) + 0.5) * CELL_SIZE;
    // A small tolerance, should be less than the entity's speed to avoid overshooting.
    const tolerance = entity.speed / 2;
    return Math.abs(entity.x - xCenter) < tolerance && Math.abs(entity.y - yCenter) < tolerance;
  }

  /**
   * Updates Pac-Man's direction based on buffered player input.
   * This allows for smoother and more responsive controls by turning at intersections.
   */
  private updatePacmanDirection(): void {
    if (this.nextDirection === null) return;

    // Allow immediate reversal of direction, even when not at an intersection.
    if (this.nextDirection === (this.pacman.direction + 180) % 360) {
      this.pacman.direction = this.nextDirection;
      this.nextDirection = null;
      return;
    }

    // If at an intersection, check if the new direction is possible.
    if (this.isAtIntersection(this.pacman)) {
      const angle = (this.nextDirection * Math.PI) / 180;
      // Check if the path is clear in the new direction.
      if (this.canMove(this.pacman.x + Math.cos(angle), this.pacman.y + Math.sin(angle))) {
        // Snap to grid center for a clean turn.
        this.pacman.x = (Math.floor(this.pacman.x / CELL_SIZE) + 0.5) * CELL_SIZE;
        this.pacman.y = (Math.floor(this.pacman.y / CELL_SIZE) + 0.5) * CELL_SIZE;
        this.pacman.direction = this.nextDirection;
        this.nextDirection = null;
      }
    }
  }

  /**
   * Apply settings based on current level
   */
  private applyLevelSettings(): void {
    const levelIndex = Math.min(this.level - 1, LEVEL_SETTINGS.length - 1);
    const settings = LEVEL_SETTINGS[levelIndex];

    // Apply ghost speed based on level
    this.ghosts.forEach(ghost => {
      ghost.speed = settings.ghostSpeed;
    });
  }

  /**
   * Start the game
   */
  start(): void {
    if (this.gameState === GameState.READY || this.gameState === GameState.LEVEL_COMPLETE) {
      this.gameState = GameState.PLAYING;
      this.callbacks.onGameStateChange(this.gameState);
      // Sound functionality is disabled
      // this.callbacks.onSoundPlay?.('start');
      this.gameLoop(0);
    } else if (this.gameState === GameState.PAUSED) {
      this.gameState = GameState.PLAYING;
      this.callbacks.onGameStateChange(this.gameState);
      this.gameLoop(0);
    }
  }

  /**
   * Pause the game
   */
  pause(): void {
    if (this.gameState === GameState.PLAYING) {
      this.gameState = GameState.PAUSED;
      this.callbacks.onGameStateChange(this.gameState);
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
      }
    }
  }

  /**
   * Reset the game
   */
  reset(): void {
    this.score = 0;
    this.level = 1;
    this.lives = 3;
    this.gameState = GameState.READY;

    this.updateScore();
    this.callbacks.onGameStateChange(this.gameState);

    this.initializeMaze();
    this.drawMaze();
  }

  /**
   * Handle Pacman's death
   */
  private handlePacmanDeath(): void {
    this.lives--;
    this.updateScore();
    // Sound functionality is disabled
    // this.callbacks.onSoundPlay?.('death');

    if (this.lives <= 0) {
      this.gameState = GameState.GAME_OVER;
      this.callbacks.onGameStateChange(this.gameState);
      // Sound functionality is disabled
      // this.callbacks.onSoundPlay?.('gameOver');
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
      }
    } else {
      // Reset positions but keep score and level
      this.pacman.reset(this.pacmanStartPosition.x, this.pacmanStartPosition.y);
      this.ghosts.forEach(ghost => ghost.reset());

      // Pause briefly before continuing
      this.gameState = GameState.PAUSED;
      this.callbacks.onGameStateChange(this.gameState);

      setTimeout(() => {
        this.gameState = GameState.PLAYING;
        this.callbacks.onGameStateChange(this.gameState);
        this.gameLoop(0);
      }, 1000);
    }
  }

  /**
   * Handle level completion
   */
  private handleLevelComplete(): void {
    this.level++;
    this.updateScore();
    // Sound functionality is disabled
    // this.callbacks.onSoundPlay?.('levelComplete');

    this.gameState = GameState.LEVEL_COMPLETE;
    this.callbacks.onGameStateChange(this.gameState);

    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    // Initialize next level after a delay
    setTimeout(() => {
      this.initializeMaze();
      this.gameState = GameState.PLAYING;
      this.callbacks.onGameStateChange(this.gameState);
      this.gameLoop(0);
    }, 2000);
  }

  /**
   * Update the score
   */
  private updateScore(): void {
    this.callbacks.onScoreUpdate({
      score: this.score,
      level: this.level,
      lives: this.lives
    });
  }

  /**
   * Check if a position is a valid move (not a wall)
   */
  canMove(x: number, y: number): boolean {
    // A small margin to prevent getting stuck in walls.
    // This value should be slightly less than half the entity size.
    const radius = CELL_SIZE / 2 - 1;

    // Check multiple points around the entity's center to simulate its size.
    // This prevents clipping into walls.
    const pointsToCheck = [
      { x: x, y: y }, // Center
      { x: x + radius, y: y }, // Right edge
      { x: x - radius, y: y }, // Left edge
      { x: x, y: y + radius }, // Bottom edge
      { x: x, y: y - radius }, // Top edge
    ];

    for (const point of pointsToCheck) {
      const gridX = Math.floor(point.x / CELL_SIZE);
      const gridY = Math.floor(point.y / CELL_SIZE);

      if (gridY < 0 || gridY >= MAZE_LAYOUT.length || gridX < 0 || gridX >= MAZE_LAYOUT[0].length) {
        return false; // Out of bounds
      }

      if (MAZE_LAYOUT[gridY][gridX] === '#') {
        return false; // Wall collision
      }
    }

    return true;
  }

  /**
   * Handle keyboard input for Pacman movement
   */
  handleKeyDown(key: string): void {
    // Allow pause/resume regardless of game state, but only if the key is 'p'
    if (key === 'p') {
      if (this.gameState === GameState.PLAYING) {
        this.pause();
      } else if (this.gameState === GameState.PAUSED) {
        this.start();
      }
      return;
    }

    if (this.gameState !== GameState.PLAYING) return;

    // Buffer the next intended direction
    switch (key) {
      case 'ArrowLeft':
      case 'a':
        this.nextDirection = Direction.LEFT;
        break;
      case 'ArrowRight':
      case 'd':
        this.nextDirection = Direction.RIGHT;
        break;
      case 'ArrowUp':
      case 'w':
        this.nextDirection = Direction.UP;
        break;
      case 'ArrowDown':
      case 's':
        this.nextDirection = Direction.DOWN;
        break;
    }
  }

  /**
   * Check for collisions between Pacman and game objects
   */
  private checkCollisions(): void {
    const hitboxSize = CELL_SIZE / 2;

    // Check dot collisions
    this.dots = this.dots.filter(dot => {
      const dx = dot.x - this.pacman.x;
      const dy = dot.y - this.pacman.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < hitboxSize) {
        this.score += POINTS.DOT;
        this.updateScore();
        // Sound functionality is disabled
        // this.callbacks.onSoundPlay?.('munch');
        return false;
      }
      return true;
    });

    // Check power pellet collisions
    this.powerPellets = this.powerPellets.filter(pellet => {
      const dx = pellet.x - this.pacman.x;
      const dy = pellet.y - this.pacman.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < hitboxSize) {
        this.score += POINTS.POWER_PELLET;
        this.updateScore();
        // Sound functionality is disabled
        // this.callbacks.onSoundPlay?.('powerPellet');

        // Activate power mode
        this.pacman.activatePowerMode(POWER_MODE_DURATION, () => {
          this.ghosts.forEach(ghost => ghost.unScare());
        });

        // Scare all ghosts
        this.ghosts.forEach(ghost => ghost.scare());

        return false;
      }
      return true;
    });

    // Check ghost collisions
    this.ghosts.forEach(ghost => {
      if (this.pacman.collidesWith(ghost)) {
        if (ghost.scared) {
          // Eat the ghost
          this.score += POINTS.GHOST;
          this.updateScore();
          // Sound functionality is disabled
          // this.callbacks.onSoundPlay?.('eatGhost');
          ghost.reset();
        } else {
          // Pacman dies
          this.handlePacmanDeath();
        }
      }
    });

    // Check level completion
    if (this.dots.length === 0 && this.powerPellets.length === 0) {
      this.handleLevelComplete();
    }
  }

  /**
   * Main game loop
   */
  private gameLoop(timestamp: number): void {
    if (this.gameState !== GameState.PLAYING) return;

    // Calculate delta time for smooth animation
    const deltaTime = timestamp - this.lastFrameTime;

    // Limit frame rate
    if (deltaTime < 1000 / this.fps) {
      this.animationId = requestAnimationFrame(this.gameLoop.bind(this));
      return;
    }

    this.lastFrameTime = timestamp;

    // Update Pacman's direction based on buffered input
    this.updatePacmanDirection();

    // Update Pacman
    this.pacman.move(this.canMove.bind(this));
    this.pacman.updateMouth();

    // Update Ghosts
    this.ghosts.forEach(ghost => {
      ghost.calculateNextMove(
        this.pacman.x,
        this.pacman.y,
        this.pacman.direction,
        this.canMove.bind(this)
      );
      ghost.move(this.canMove.bind(this));
    });

    // Check for collisions
    this.checkCollisions();

    // Draw everything
    this.drawMaze();

    // Request next frame
    this.animationId = requestAnimationFrame(this.gameLoop.bind(this));
  }

  /**
   * Draw the maze and all game entities
   */
  private drawMaze(): void {
    // Clear canvas
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw walls
    this.ctx.fillStyle = '#2121DE';
    MAZE_LAYOUT.forEach((row, y) => {
      row.split('').forEach((cell, x) => {
        if (cell === '#') {
          this.ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
      });
    });

    // Draw dots
    this.ctx.fillStyle = '#ffffff';
    this.dots.forEach(dot => {
      this.ctx.beginPath();
      this.ctx.arc(dot.x, dot.y, 2, 0, Math.PI * 2);
      this.ctx.fill();
    });

    // Draw power pellets with pulsing animation
    this.ctx.fillStyle = '#ffffff';
    const pulseSize = 4 + Math.sin(Date.now() / 200) * 2; // Pulsing between 2 and 6

    this.powerPellets.forEach(pellet => {
      this.ctx.beginPath();
      this.ctx.arc(pellet.x, pellet.y, pulseSize, 0, Math.PI * 2);
      this.ctx.fill();
    });

    // Draw ghosts
    this.ghosts.forEach(ghost => {
      this.ctx.beginPath();

      // Flashing blue when scared and about to recover
      if (ghost.scared && this.pacman.isPowered) {
        const timeLeft = this.pacman.powerModeTimer ?
          POWER_MODE_DURATION - (Date.now() - (this.pacman.powerModeTimer as any)._idleStart) : 0;

        if (timeLeft < 3000 && Math.floor(Date.now() / 250) % 2 === 0) {
          this.ctx.fillStyle = '#FFFFFF'; // Flash white
        } else {
          this.ctx.fillStyle = '#0000FF'; // Blue when scared
        }
      } else {
        this.ctx.fillStyle = ghost.color;
      }

      // Draw ghost body
      this.ctx.arc(ghost.x, ghost.y, CELL_SIZE / 2, 0, Math.PI * 2);
      this.ctx.fill();

      // Draw eyes
      this.ctx.fillStyle = '#FFFFFF';

      // Position eyes based on direction
      const eyeOffsetX = Math.cos((ghost.direction * Math.PI) / 180) * 3;
      const eyeOffsetY = Math.sin((ghost.direction * Math.PI) / 180) * 3;

      // Left eye
      this.ctx.beginPath();
      this.ctx.arc(ghost.x - 4 + eyeOffsetX, ghost.y - 2 + eyeOffsetY, 2, 0, Math.PI * 2);
      this.ctx.fill();

      // Right eye
      this.ctx.beginPath();
      this.ctx.arc(ghost.x + 4 + eyeOffsetX, ghost.y - 2 + eyeOffsetY, 2, 0, Math.PI * 2);
      this.ctx.fill();

      // Draw pupils
      this.ctx.fillStyle = '#000000';

      // Left pupil
      this.ctx.beginPath();
      this.ctx.arc(ghost.x - 4 + eyeOffsetX * 1.5, ghost.y - 2 + eyeOffsetY * 1.5, 1, 0, Math.PI * 2);
      this.ctx.fill();

      // Right pupil
      this.ctx.beginPath();
      this.ctx.arc(ghost.x + 4 + eyeOffsetX * 1.5, ghost.y - 2 + eyeOffsetY * 1.5, 1, 0, Math.PI * 2);
      this.ctx.fill();
    });

    // Draw Pacman
    this.ctx.save();
    const rotation = (this.pacman.direction * Math.PI) / 180;
    this.ctx.translate(this.pacman.x, this.pacman.y);
    this.ctx.rotate(rotation);

    // Draw main body
    this.ctx.beginPath();
    this.ctx.fillStyle = 'yellow';
    this.ctx.arc(0, 0, CELL_SIZE / 2, this.pacman.mouthAngle, Math.PI * 2 - this.pacman.mouthAngle);
    this.ctx.lineTo(0, 0);
    this.ctx.fill();

    // Draw eye
    this.ctx.beginPath();
    this.ctx.fillStyle = '#000000';
    this.ctx.arc(-2, -8, 3, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }

  /**
   * Clean up resources when component unmounts
   */
  cleanup(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    this.pacman.cleanup();
    this.ghosts.forEach(ghost => ghost.cleanup());
  }
}