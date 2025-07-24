import { Direction } from '../constants/GameConstants';

/**
 * Mobile Controls for touch-based devices
 */
export default class MobileControls {
  private container: HTMLElement;
  private controlsVisible: boolean;
  private onDirectionChange: (direction: number) => void;
  private touchStartX: number;
  private touchStartY: number;
  private controlsElement: HTMLElement | null;

  constructor(container: HTMLElement, onDirectionChange: (direction: number) => void) {
    this.container = container;
    this.onDirectionChange = onDirectionChange;
    this.controlsVisible = false;
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.controlsElement = null;
    
    this.init();
  }

  /**
   * Initialize mobile controls
   */
  private init(): void {
    // Check if device is touch-enabled
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      this.createControls();
      this.setupSwipeControls();
    }
  }

  /**
   * Create on-screen control buttons
   */
  private createControls(): void {
    // Create controls container
    const controls = document.createElement('div');
    controls.className = 'mobile-controls';
    controls.style.position = 'absolute';
    controls.style.bottom = '20px';
    controls.style.left = '50%';
    controls.style.transform = 'translateX(-50%)';
    controls.style.display = 'grid';
    controls.style.gridTemplateColumns = 'repeat(3, 60px)';
    controls.style.gridTemplateRows = 'repeat(3, 60px)';
    controls.style.gap = '5px';
    controls.style.zIndex = '100';
    
    // Create direction buttons
    const createButton = (text: string, direction: number, gridArea: string) => {
      const button = document.createElement('button');
      button.textContent = text;
      button.style.gridArea = gridArea;
      button.style.backgroundColor = 'rgba(0, 0, 255, 0.5)';
      button.style.border = 'none';
      button.style.borderRadius = '10px';
      button.style.color = 'white';
      button.style.fontSize = '24px';
      button.style.display = 'flex';
      button.style.alignItems = 'center';
      button.style.justifyContent = 'center';
      button.style.cursor = 'pointer';
      button.style.touchAction = 'manipulation';
      
      // Add event listeners
      button.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.onDirectionChange(direction);
        button.style.backgroundColor = 'rgba(0, 0, 255, 0.8)';
      });
      
      button.addEventListener('touchend', () => {
        button.style.backgroundColor = 'rgba(0, 0, 255, 0.5)';
      });
      
      return button;
    };
    
    // Up button
    const upButton = createButton('↑', Direction.UP, '1 / 2 / 2 / 3');
    controls.appendChild(upButton);
    
    // Left button
    const leftButton = createButton('←', Direction.LEFT, '2 / 1 / 3 / 2');
    controls.appendChild(leftButton);
    
    // Right button
    const rightButton = createButton('→', Direction.RIGHT, '2 / 3 / 3 / 4');
    controls.appendChild(rightButton);
    
    // Down button
    const downButton = createButton('↓', Direction.DOWN, '3 / 2 / 4 / 3');
    controls.appendChild(downButton);
    
    // Add to container
    this.container.appendChild(controls);
    this.controlsElement = controls;
    this.controlsVisible = true;
  }

  /**
   * Set up swipe controls for mobile devices
   */
  private setupSwipeControls(): void {
    // Add touch event listeners to the game container
    this.container.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    this.container.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
  }

  /**
   * Handle touch start event
   */
  private handleTouchStart(e: TouchEvent): void {
    const touch = e.touches[0];
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
  }

  /**
   * Handle touch move event to detect swipes
   */
  private handleTouchMove(e: TouchEvent): void {
    if (!e.touches[0]) return;
    
    e.preventDefault(); // Prevent scrolling
    
    const touch = e.touches[0];
    const diffX = touch.clientX - this.touchStartX;
    const diffY = touch.clientY - this.touchStartY;
    
    // Detect swipe direction if movement is significant
    if (Math.abs(diffX) > 30 || Math.abs(diffY) > 30) {
      if (Math.abs(diffX) > Math.abs(diffY)) {
        // Horizontal swipe
        if (diffX > 0) {
          this.onDirectionChange(Direction.RIGHT);
        } else {
          this.onDirectionChange(Direction.LEFT);
        }
      } else {
        // Vertical swipe
        if (diffY > 0) {
          this.onDirectionChange(Direction.DOWN);
        } else {
          this.onDirectionChange(Direction.UP);
        }
      }
      
      // Reset touch start position
      this.touchStartX = touch.clientX;
      this.touchStartY = touch.clientY;
    }
  }

  /**
   * Toggle visibility of on-screen controls
   */
  toggleControls(): boolean {
    if (this.controlsElement) {
      this.controlsVisible = !this.controlsVisible;
      this.controlsElement.style.display = this.controlsVisible ? 'grid' : 'none';
    }
    return this.controlsVisible;
  }

  /**
   * Clean up event listeners
   */
  cleanup(): void {
    if (this.controlsElement) {
      this.container.removeEventListener('touchstart', this.handleTouchStart.bind(this));
      this.container.removeEventListener('touchmove', this.handleTouchMove.bind(this));
      this.container.removeChild(this.controlsElement);
      this.controlsElement = null;
    }
  }
}