
/**
 * Sound Manager for handling game audio
 * Note: Sound functionality is currently disabled. This class acts as a stub
 * to prevent errors in other parts of the code that expect a SoundManager instance.
 */
export default class SoundManager {
  constructor() {
    // No setup needed for the disabled sound manager.
  }

  /**
   * Play a sound effect
   * Note: This method is a no-op as sound functionality is disabled.
   * @param name The name of the sound to play
   */
  public play(name: string): void {
    // Sound playback is disabled
  }

  /**
   * Toggle mute state
   * @returns {boolean} Always returns true (muted).
   */
  toggleMute(): boolean {
    return true;
  }

  /**
   * Set mute state
   * Note: This method is a no-op as sound is always muted.
   * @param mute The desired mute state.
   */
  setMute(mute: boolean): void {
    // Sound is always muted.
  }

  /**
   * Check if sound is muted
   * @returns {boolean} Always returns true.
   */
  getMute(): boolean {
    return true;
  }
}