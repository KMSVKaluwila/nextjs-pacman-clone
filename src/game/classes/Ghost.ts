import Entity from './Entity';
import { GhostType } from '../constants/GameConstants';

/**
 * Ghost class representing enemy characters
 */
export default class Ghost extends Entity {
  color: string;
  scared: boolean;
  ghostType: GhostType;
  initialX: number;
  initialY: number;
  scatterMode: boolean;
  scatterTarget: { x: number, y: number };
  chaseTimer: NodeJS.Timeout | null;
  scatterTimer: NodeJS.Timeout | null;
  
  constructor(x: number, y: number, size: number, color: string, ghostType: GhostType) {
    super(x, y, 3, size); // Ghosts have a default speed of 3
    this.color = color;
    this.scared = false;
    this.ghostType = ghostType;
    this.initialX = x;
    this.initialY = y;
    this.scatterMode = true;
    this.scatterTarget = this.getScatterTarget();
    this.chaseTimer = null;
    this.scatterTimer = null;
    
    // Start the scatter/chase cycle
    this.startBehaviorCycle();
  }

  /**
   * Get the scatter target based on ghost type
   */
  getScatterTarget(): { x: number, y: number } {
    // Each ghost has a different corner to retreat to in scatter mode
    switch (this.ghostType) {
      case GhostType.BLINKY: // Red ghost - top right
        return { x: 400, y: 0 };
      case GhostType.PINKY: // Pink ghost - top left
        return { x: 0, y: 0 };
      case GhostType.INKY: // Cyan ghost - bottom right
        return { x: 400, y: 400 };
      case GhostType.CLYDE: // Orange ghost - bottom left
        return { x: 0, y: 400 };
      default:
        return { x: 0, y: 0 };
    }
  }

  /**
   * Start the behavior cycle (alternating between scatter and chase)
   */
  startBehaviorCycle(): void {
    // Initial scatter mode for 7 seconds
    this.scatterMode = true;
    
    this.scatterTimer = setTimeout(() => {
      // Switch to chase mode for 20 seconds
      this.scatterMode = false;
      
      this.chaseTimer = setTimeout(() => {
        // Restart the cycle
        this.startBehaviorCycle();
      }, 20000); // 20 seconds chase
      
    }, 7000); // 7 seconds scatter
  }

  /**
   * Calculate the next move based on ghost type and current mode
   */
  calculateNextMove(pacmanX: number, pacmanY: number, pacmanDirection: number, canMove: (x: number, y: number) => boolean): void {
    if (this.scared) {
      this.calculateRandomMove(canMove);
      return;
    }
    
    let targetX: number;
    let targetY: number;
    
    if (this.scatterMode) {
      // In scatter mode, target the ghost's corner
      targetX = this.scatterTarget.x;
      targetY = this.scatterTarget.y;
    } else {
      // In chase mode, each ghost has a different targeting strategy
      switch (this.ghostType) {
        case GhostType.BLINKY: // Red ghost - directly targets Pacman
          targetX = pacmanX;
          targetY = pacmanY;
          break;
          
        case GhostType.PINKY: // Pink ghost - targets 4 tiles ahead of Pacman
          const angle = (pacmanDirection * Math.PI) / 180;
          targetX = pacmanX + Math.cos(angle) * 80; // 4 tiles ahead (20px per tile)
          targetY = pacmanY + Math.sin(angle) * 80;
          break;
          
        case GhostType.INKY: // Cyan ghost - complex targeting based on Blinky's position
          // Simplified for now - targets position relative to Pacman
          const angleInky = (pacmanDirection * Math.PI) / 180;
          targetX = pacmanX + Math.cos(angleInky) * 40; // 2 tiles ahead
          targetY = pacmanY + Math.sin(angleInky) * 40;
          break;
          
        case GhostType.CLYDE: // Orange ghost - targets Pacman when far, scatters when close
          const dx = this.x - pacmanX;
          const dy = this.y - pacmanY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance > 8 * this.size) { // If far from Pacman
            targetX = pacmanX;
            targetY = pacmanY;
          } else { // If close to Pacman
            targetX = this.scatterTarget.x;
            targetY = this.scatterTarget.y;
          }
          break;
          
        default:
          targetX = pacmanX;
          targetY = pacmanY;
      }
    }
    
    // Calculate best direction to reach target
    this.calculateBestDirection(targetX, targetY, canMove);
  }

  /**
   * Calculate the best direction to reach a target
   */
  calculateBestDirection(targetX: number, targetY: number, canMove: (x: number, y: number) => boolean): void {
    const directions = [0, 90, 180, 270]; // right, down, left, up
    let bestDirection = this.direction;
    let shortestDistance = Infinity;
    
    // Don't allow 180-degree turns (reversing direction)
    const oppositeDirection = (this.direction + 180) % 360;
    
    for (const direction of directions) {
      // Skip the opposite direction to prevent ghost from reversing
      if (direction === oppositeDirection) continue;
      
      const angle = (direction * Math.PI) / 180;
      const newX = this.x + Math.cos(angle) * this.speed;
      const newY = this.y + Math.sin(angle) * this.speed;
      
      // Check if the ghost can move in this direction
      if (canMove(newX, newY)) {
        // Calculate distance to target from this new position
        const dx = newX - targetX;
        const dy = newY - targetY;
        const distance = dx * dx + dy * dy; // No need for square root for comparison
        
        if (distance < shortestDistance) {
          shortestDistance = distance;
          bestDirection = direction;
        }
      }
    }
    
    this.direction = bestDirection;
  }

  /**
   * Calculate a random move for scared mode
   */
  calculateRandomMove(canMove: (x: number, y: number) => boolean): void {
    const directions = [0, 90, 180, 270]; // right, down, left, up
    const validDirections = [];
    
    // Don't allow 180-degree turns (reversing direction)
    const oppositeDirection = (this.direction + 180) % 360;
    
    for (const direction of directions) {
      // Skip the opposite direction
      if (direction === oppositeDirection) continue;
      
      const angle = (direction * Math.PI) / 180;
      const newX = this.x + Math.cos(angle) * this.speed;
      const newY = this.y + Math.sin(angle) * this.speed;
      
      if (canMove(newX, newY)) {
        validDirections.push(direction);
      }
    }
    
    if (validDirections.length > 0) {
      // Choose a random valid direction
      this.direction = validDirections[Math.floor(Math.random() * validDirections.length)];
    }
  }

  /**
   * Set ghost to scared mode
   */
  scare(): void {
    this.scared = true;
    this.speed = 2; // Slower when scared
  }

  /**
   * Set ghost to normal mode
   */
  unScare(): void {
    this.scared = false;
    this.speed = 3; // Normal speed
  }

  /**
   * Reset ghost to initial position
   */
  reset(): void {
    this.x = this.initialX;
    this.y = this.initialY;
    this.direction = 0;
    this.scared = false;
    this.speed = 3;
  }

  /**
   * Clean up any timers when component unmounts
   */
  cleanup(): void {
    if (this.chaseTimer) {
      clearTimeout(this.chaseTimer);
      this.chaseTimer = null;
    }
    
    if (this.scatterTimer) {
      clearTimeout(this.scatterTimer);
      this.scatterTimer = null;
    }
  }
}