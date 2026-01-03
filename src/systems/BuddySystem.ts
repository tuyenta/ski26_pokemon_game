import { EventBus } from '../core/EventBus';
import { GameEvent } from '../core/events';
import { StorageAdapter } from '../core/StorageAdapter';

export interface BuddyPokemon {
  id: number;
  name: string;
  type: string;
  startedAt: string;
}

export class BuddySystem {
  private buddy: BuddyPokemon | null;
  private distance: number;
  private storage: StorageAdapter;
  private eventBus: EventBus;
  
  constructor() {
    this.storage = StorageAdapter.getInstance();
    this.eventBus = EventBus.getInstance();
    
    this.buddy = this.loadBuddy();
    this.distance = this.loadDistance();
  }
  
  private loadBuddy(): BuddyPokemon | null {
    return this.storage.get<BuddyPokemon>('buddy') || null;
  }
  
  private loadDistance(): number {
    return this.storage.get<number>('buddy_distance') || 0;
  }
  
  private saveBuddy(): void {
    if (this.buddy) {
      this.storage.set('buddy', this.buddy);
    } else {
      this.storage.remove('buddy');
    }
  }
  
  private saveDistance(): void {
    this.storage.set('buddy_distance', this.distance);
  }
  
  public setBuddy(pokemonId: number, pokemonName: string, pokemonType: string): 
    { success: boolean; message: string; buddy?: BuddyPokemon } {
    this.buddy = {
      id: pokemonId,
      name: pokemonName,
      type: pokemonType,
      startedAt: new Date().toISOString()
    };
    this.distance = 0;
    this.saveBuddy();
    this.saveDistance();
    
    return { success: true, message: `${pokemonName} is now your buddy!`, buddy: this.buddy };
  }
  
  public removeBuddy(): void {
    this.buddy = null;
    this.distance = 0;
    this.saveBuddy();
    this.saveDistance();
  }
  
  /**
   * Add distance for buddy walking
   */
  public addDistance(steps: number): void {
    if (!this.buddy) return;
    
    this.distance += steps;
    
    if (this.distance >= 100) {
      const candies = Math.floor(this.distance / 100);
      this.distance = this.distance % 100;
      
      this.eventBus.emit(GameEvent.BUDDY_CANDY_EARNED, {
        pokemonId: this.buddy.id,
        candies
      });
    }
    
    this.saveDistance();
  }
  
  public walk(steps: number = 10): { candies: number; distance: number } {
    if (!this.buddy) return { candies: 0, distance: 0 };
    
    this.distance += steps;
    this.saveDistance();
    
    let candiesEarned = 0;
    // Earn candy every 100 steps
    if (this.distance >= 100) {
      candiesEarned = Math.floor(this.distance / 100);
      this.distance = this.distance % 100;
      
      this.eventBus.emit(GameEvent.BUDDY_CANDY_EARNED, {
        candies: candiesEarned
      });
      
      this.saveDistance();
    }
    
    return { candies: candiesEarned, distance: this.distance };
  }
  
  public getBuddy(): BuddyPokemon | null {
    return this.buddy ? { ...this.buddy } : null;
  }
  
  public getDistance(): number {
    return this.distance;
  }
  
  public getProgressToNextCandy(): number {
    return this.distance;
  }
}
