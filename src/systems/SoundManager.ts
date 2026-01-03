export type OscillatorType = 'sine' | 'square' | 'triangle' | 'sawtooth';

export class SoundManager {
  private audioContext: AudioContext | null;
  private enabled: boolean;
  
  constructor() {
    this.enabled = true;
    this.audioContext = null;
    this.initSounds();
  }
  
  private initSounds(): void {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioContextClass();
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }
  
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }
  
  public isEnabled(): boolean {
    return this.enabled;
  }
  
  private playBeep(
    frequency: number = 440,
    duration: number = 200,
    type: OscillatorType = 'sine'
  ): void {
    if (!this.enabled || !this.audioContext) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.audioContext.currentTime + duration / 1000
    );
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration / 1000);
  }
  
  public playScanSound(): void {
    this.playBeep(800, 100, 'square');
    setTimeout(() => this.playBeep(1000, 100, 'square'), 100);
    setTimeout(() => this.playBeep(1200, 200, 'square'), 200);
  }
  
  public playSuccessSound(): void {
    this.playBeep(523, 150, 'sine');
    setTimeout(() => this.playBeep(659, 150, 'sine'), 150);
    setTimeout(() => this.playBeep(784, 300, 'sine'), 300);
  }
  
  public playNewPokemonSound(): void {
    this.playBeep(392, 100, 'triangle');
    setTimeout(() => this.playBeep(494, 100, 'triangle'), 100);
    setTimeout(() => this.playBeep(587, 100, 'triangle'), 200);
    setTimeout(() => this.playBeep(784, 400, 'triangle'), 300);
  }
  
  public playShinySound(): void {
    this.playBeep(880, 100, 'sine');
    setTimeout(() => this.playBeep(1100, 100, 'sine'), 80);
    setTimeout(() => this.playBeep(1320, 100, 'sine'), 160);
    setTimeout(() => this.playBeep(1760, 300, 'sine'), 240);
  }
  
  public playEvolutionSound(): void {
    this.playBeep(440, 200, 'square');
    setTimeout(() => this.playBeep(554, 200, 'square'), 200);
    setTimeout(() => this.playBeep(659, 200, 'square'), 400);
    setTimeout(() => this.playBeep(880, 400, 'square'), 600);
  }
  
  public playClickSound(): void {
    this.playBeep(600, 50, 'square');
  }
  
  /**
   * Play sound by name - unified interface
   */
  public playSound(soundName: string): void {
    switch (soundName) {
      case 'catch':
        this.playCatchSound();
        break;
      case 'legendary':
        this.playShinySound();
        break;
      case 'achievement':
        this.playSuccessSound();
        break;
      case 'win':
        this.playSuccessSound();
        break;
      case 'lose':
        this.playErrorSound();
        break;
      case 'hatch':
        this.playNewPokemonSound();
        break;
      case 'click':
        this.playClickSound();
        break;
      default:
        this.playClickSound();
    }
  }
  
  public playErrorSound(): void {
    this.playBeep(200, 100, 'square');
    setTimeout(() => this.playBeep(150, 200, 'square'), 100);
  }
  
  public playLevelUpSound(): void {
    this.playBeep(659, 150, 'triangle');
    setTimeout(() => this.playBeep(784, 150, 'triangle'), 150);
    setTimeout(() => this.playBeep(988, 150, 'triangle'), 300);
    setTimeout(() => this.playBeep(1319, 400, 'triangle'), 450);
  }
}
