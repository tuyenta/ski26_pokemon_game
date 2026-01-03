import { EventBus } from '../core/EventBus';
import { GameEvent } from '../core/events';
import { StorageAdapter } from '../core/StorageAdapter';

export interface TeamStats {
  size: number;
  power: number;
  typeVariety: number;
}

export class TeamManager {
  private team: number[];
  private readonly maxTeamSize: number = 6;
  private storage: StorageAdapter;
  private eventBus: EventBus;
  
  constructor() {
    this.storage = StorageAdapter.getInstance();
    this.eventBus = EventBus.getInstance();
    
    this.team = this.loadTeam();
  }
  
  private loadTeam(): number[] {
    const saved = this.storage.get<number[]>('team');
    return saved || [];
  }
  
  private saveTeam(): void {
    this.storage.set('team', this.team);
    this.eventBus.emit(GameEvent.TEAM_UPDATED, { team: this.team });
  }
  
  public addToTeam(pokemonId: number): { success: boolean; message: string } {
    if (this.team.length >= this.maxTeamSize) {
      return { success: false, message: 'Team is full! Remove a Pokemon first.' };
    }
    
    if (this.team.includes(pokemonId)) {
      return { success: false, message: 'Pokemon already in team!' };
    }
    
    this.team.push(pokemonId);
    this.saveTeam();
    
    this.eventBus.emit(GameEvent.POKEMON_ADDED_TO_TEAM, { pokemonId });
    
    return { success: true, message: 'Added to team!' };
  }
  
  public removeFromTeam(pokemonId: number): boolean {
    const index = this.team.indexOf(pokemonId);
    if (index > -1) {
      this.team.splice(index, 1);
      this.saveTeam();
      
      this.eventBus.emit(GameEvent.POKEMON_REMOVED_FROM_TEAM, { pokemonId });
      
      return true;
    }
    return false;
  }
  
  public getTeam(): number[] {
    return [...this.team];
  }
  
  public isInTeam(pokemonId: number): boolean {
    return this.team.includes(pokemonId);
  }
  
  public getTeamSize(): number {
    return this.team.length;
  }
  
  public isFull(): boolean {
    return this.team.length >= this.maxTeamSize;
  }
  
  public clearTeam(): void {
    this.team = [];
    this.saveTeam();
  }
  
  // This would be enhanced with actual Pokemon data from CollectionManager
  public getTeamStats(): TeamStats {
    let totalPower = 0;
    const types = new Set<string>();
    
    // Basic stats based on Pokemon IDs
    // In real usage, would fetch from CollectionManager
    this.team.forEach(id => {
      totalPower += id; // Simplified power calculation
    });
    
    return {
      size: this.team.length,
      power: totalPower,
      typeVariety: types.size
    };
  }
}
