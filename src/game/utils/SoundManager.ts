import { SOUND_EFFECTS } from '../constants/GameConstants';

/**
 * Sound Manager for handling game audio
 * Note: Sound functionality is currently disabled
 */
export default class SoundManager {
  private sounds: Map<string, HTMLAudioElement>;
  private isMuted: boolean;
  private soundsLoaded: boolean = false;

  constructor() {
    this.sounds = new Map();
    this.isMuted = true; // Default to muted since sounds are removed
    // Sound preloading is disabled
  }

  /**
   * Preload all game sounds
   * Note: This method is disabled as sound files have been removed
   */
  private preloadSounds(): void {
    // Sound preloading is disabled
    console.info('Sound functionality is disabled');
    this.soundsLoaded = false;
  }

  /**
   * Play a sound effect
   * Note: This method is disabled as sound files have been removed
   * @param name The name of the sound to play
   */
  public play(name: string): void {
    // Sound playback is disabled
    return;
  }

  /**
   * Toggle mute state
   * Note: This method always returns true as sounds are disabled
   */
  toggleMute(): boolean {
    // Always muted since sounds are disabled
    this.isMuted = true;
    return this.isMuted;
  }

  /**
   * Set mute state
   * Note: This method has no effect as sounds are disabled
   */
  setMute(mute: boolean): void {
    // Always muted since sounds are disabled
    this.isMuted = true;
  }

  /**
   * Check if sound is muted
   */
  getMute(): boolean {
    return this.isMuted;
  }
}