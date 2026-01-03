import { EventBus } from '../core/EventBus';
import { GameEvent } from '../core/events';
import { StorageAdapter } from '../core/StorageAdapter';

export interface PokemonEgg {
  id: number;
  parent1: number;
  parent2: number;
  stepsRemaining: number;
  created: string;
}

export interface Incubator {
  slots: number;
  upgradeCost: number;
}

export interface HatchedPokemon {
  id: number;
  name: string;
  isShiny: boolean;
}

export class BreedingSystem {
  private eggs: PokemonEgg[];
  private incubator: Incubator;
  private storage: StorageAdapter;
  private eventBus: EventBus;
  
  constructor() {
    this.storage = StorageAdapter.getInstance();
    this.eventBus = EventBus.getInstance();
    
    this.eggs = this.loadEggs();
    this.incubator = this.loadIncubator();
  }
  
  private loadEggs(): PokemonEgg[] {
    const saved = this.storage.get<PokemonEgg[]>('eggs');
    return saved || [];
  }
  
  private loadIncubator(): Incubator {
    const saved = this.storage.get<Incubator>('incubator');
    return saved || { slots: 3, upgradeCost: 500 };
  }
  
  private saveEggs(): void {
    this.storage.set('eggs', this.eggs);
  }
  
  private saveIncubator(): void {
    this.storage.set('incubator', this.incubator);
  }
  
  /**
   * Add steps for egg hatching
   */
  public addSteps(steps: number): void {
    this.eggs.forEach(egg => {
      egg.stepsRemaining -= steps;
      if (egg.stepsRemaining <= 0) {
        this.hatchEgg(egg);
      }
    });
    this.saveEggs();
  }
  
  /**
   * Hatch an egg
   */
  private hatchEgg(egg: PokemonEgg): void {
    // Determine which parent to use
    const pokemonId = Math.random() < 0.5 ? egg.parent1 : egg.parent2;
    
    this.eventBus.emit(GameEvent.EGG_HATCHED, {
      pokemonId,
      name: `Pokemon ${pokemonId}`,
      eggId: egg.id
    });
    
    // Remove egg from array
    this.eggs = this.eggs.filter(e => e.id !== egg.id);
    this.saveEggs();
  }
  
  public breedPokemon(
    pokemon1Id: number,
    pokemon1TimesScanned: number,
    pokemon2Id: number,
    pokemon2TimesScanned: number
  ): { success: boolean; message: string; egg?: PokemonEgg } {
    if (this.eggs.length >= this.incubator.slots) {
      return { success: false, message: 'Incubator is full!' };
    }
    
    if (pokemon1TimesScanned < 5 || pokemon2TimesScanned < 5) {
      return { success: false, message: 'Pokemon need 5+ scans to breed!' };
    }
    
    const egg: PokemonEgg = {
      id: Date.now(),
      parent1: pokemon1Id,
      parent2: pokemon2Id,
      stepsRemaining: 1000,
      created: new Date().toISOString()
    };
    
    this.eggs.push(egg);
    this.saveEggs();
    
    return { success: true, message: 'Egg created!', egg };
  }
  
  public walkWithEggs(steps: number = 10): HatchedPokemon[] {
    const hatched: HatchedPokemon[] = [];
    
    // Process eggs in reverse to safely remove them
    for (let i = this.eggs.length - 1; i >= 0; i--) {
      const egg = this.eggs[i];
      egg.stepsRemaining -= steps;
      
      if (egg.stepsRemaining <= 0) {
        // Hatch egg - randomly choose parent
        const parentId = Math.random() < 0.5 ? egg.parent1 : egg.parent2;
        const isShiny = Math.random() < 0.05; // 5% shiny chance from eggs
        
        // Remove egg
        this.eggs.splice(i, 1);
        
        // Emit hatch event
        this.eventBus.emit(GameEvent.EGG_HATCHED, {
          pokemonId: parentId,
          name: `Pokemon #${parentId}` // Would be resolved by caller
        });
        
        hatched.push({
          id: parentId,
          name: `Pokemon #${parentId}`,
          isShiny
        });
      }
    }
    
    if (hatched.length > 0) {
      this.saveEggs();
    }
    
    return hatched;
  }
  
  public upgradeIncubator(): { success: boolean; message: string; slots?: number } {
    // This would check inventory coins - for now just return structure
    this.incubator.slots += 2;
    this.incubator.upgradeCost = Math.floor(this.incubator.upgradeCost * 1.5);
    this.saveIncubator();
    
    return { success: true, message: 'Incubator upgraded!', slots: this.incubator.slots };
  }
  
  public getEggs(): PokemonEgg[] {
    return [...this.eggs];
  }
  
  public getIncubator(): Incubator {
    return { ...this.incubator };
  }
  
  public getAvailableSlots(): number {
    return this.incubator.slots - this.eggs.length;
  }
}
