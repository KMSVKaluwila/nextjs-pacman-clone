import Entity from './Entity';

/**
 * Pacman class representing the player character
 */
export default class Pacman extends Entity {
  mouthAngle: number;
  mouthSpeed: number;
  mouthDirection: number; // 1: opening, -1: closing
  isPowered: boolean;
  powerModeTimer: NodeJS.Timeout | null;
  powerModeEndTime: number | null;
  
  constructor(x: number, y: number, size: number) {
    super(x, y, 5, size); // Pacman has a default speed of 5
    this.mouthAngle = 0.2;
    this.mouthSpeed = 0.02;
    this.mouthDirection = 1;
    this.isPowered = false;
    this.powerModeTimer = null;
    this.powerModeEndTime = null;
  }

  /**
   * Update Pacman's mouth animation
   */
  updateMouth(): void {
    // Update mouth animation
    this.mouthAngle += this.mouthSpeed * this.mouthDirection;
    
    // Change direction when mouth is fully open or closed
    if (this.mouthAngle >= 0.5) {
      this.mouthDirection = -1;
    } else if (this.mouthAngle <= 0) {
      this.mouthDirection = 1;
    }
  }

  /**
   * Activate power mode for a specified duration
   */
  activatePowerMode(duration: number, onPowerModeEnd: () => void): void {
    this.isPowered = true;
    this.powerModeEndTime = Date.now() + duration;
    
    // Clear existing timer if there is one
    if (this.powerModeTimer) {
      clearTimeout(this.powerModeTimer);
    }
    
    // Set new timer
    this.powerModeTimer = setTimeout(() => {
      this.isPowered = false;
      this.powerModeEndTime = null;
      onPowerModeEnd();
      this.powerModeTimer = null;
    }, duration);
  }

  /**
   * Reset Pacman to initial position
   */
  reset(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.direction = 0;
    this.isPowered = false;
    this.powerModeEndTime = null;
    
    if (this.powerModeTimer) {
      clearTimeout(this.powerModeTimer);
      this.powerModeTimer = null;
    }
  }

  /**
   * Clean up any timers when component unmounts
   */
  cleanup(): void {
    if (this.powerModeTimer) {
      clearTimeout(this.powerModeTimer);
      this.powerModeTimer = null;
      this.powerModeEndTime = null;
    }
  }
}