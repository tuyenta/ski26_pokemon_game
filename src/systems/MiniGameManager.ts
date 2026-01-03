import { StorageAdapter } from '../core/StorageAdapter';

export interface HighScores {
  quickTime: number;
  memoryMatch: number;
  catchRush: number;
}

export class MiniGameManager {
  private highScores: HighScores;
  private storage: StorageAdapter;
  
  constructor() {
    this.storage = StorageAdapter.getInstance();
    this.highScores = this.loadHighScores();
  }
  
  private loadHighScores(): HighScores {
    const saved = this.storage.get<HighScores>('minigame_scores');
    return saved || { quickTime: 0, memoryMatch: 0, catchRush: 0 };
  }
  
  private saveHighScores(): void {
    this.storage.set('minigame_scores', this.highScores);
  }
  
  public updateHighScore(game: keyof HighScores, score: number): boolean {
    if (score > this.highScores[game]) {
      this.highScores[game] = score;
      this.saveHighScores();
      return true; // New high score!
    }
    return false;
  }
  
  public getHighScore(game: keyof HighScores): number {
    return this.highScores[game];
  }
  
  public getHighScores(): HighScores {
    return { ...this.highScores };
  }
  
  public resetHighScores(): void {
    this.highScores = { quickTime: 0, memoryMatch: 0, catchRush: 0 };
    this.saveHighScores();
  }
}
