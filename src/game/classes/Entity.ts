/**
 * Base class for all game entities (Pacman, Ghosts)
 */
export default class Entity {
  x: number;
  y: number;
  speed: number;
  direction: number; // 0: right, 90: down, 180: left, 270: up
  size: number;

  constructor(x: number, y: number, speed: number, size: number) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.direction = 0;
    this.size = size;
  }

  /**
   * Update entity position based on current direction and speed
   */
  move(canMove: (x: number, y: number) => boolean): void {
    const angle = (this.direction * Math.PI) / 180;
    const newX = this.x + Math.cos(angle) * this.speed;
    const newY = this.y + Math.sin(angle) * this.speed;

    if (canMove(newX, newY)) {
      this.x = newX;
      this.y = newY;
    }
  }

  /**
   * Check if this entity collides with another entity
   */
  collidesWith(entity: Entity, hitboxModifier: number = 1): boolean {
    const dx = this.x - entity.x;
    const dy = this.y - entity.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    return distance < (this.size / 2 + entity.size / 2) * hitboxModifier;
  }
}