import { EventBus } from '../core/EventBus';
import { GameEvent } from '../core/events';
import { StorageAdapter } from '../core/StorageAdapter';

export interface Fusion {
  id: string;
  name: string;
  pokemon1: number;
  pokemon2: number;
  types: string[];
  power: number;
  created: string;
}

export class FusionSystem {
  private fusions: Fusion[];
  private storage: StorageAdapter;
  private eventBus: EventBus;
  
  constructor() {
    this.storage = StorageAdapter.getInstance();
    this.eventBus = EventBus.getInstance();
    
    this.fusions = this.loadFusions();
  }
  
  private loadFusions(): Fusion[] {
    const saved = this.storage.get<Fusion[]>('fusions');
    return saved || [];
  }
  
  private saveFusions(): void {
    this.storage.set('fusions', this.fusions);
  }
  
  public canFuse(pokemon1TimesScanned: number, pokemon2TimesScanned: number): boolean {
    return pokemon1TimesScanned >= 3 && pokemon2TimesScanned >= 3;
  }
  
  public fusePokemon(
    pokemon1Id: number,
    pokemon1Name: string,
    pokemon1Type: string,
    pokemon2Id: number,
    pokemon2Name: string,
    pokemon2Type: string
  ): Fusion | null {
    const fusion: Fusion = {
      id: `${pokemon1Id}-${pokemon2Id}`,
      name: this.generateFusionName(pokemon1Name, pokemon2Name),
      pokemon1: pokemon1Id,
      pokemon2: pokemon2Id,
      types: [pokemon1Type, pokemon2Type],
      power: pokemon1Id + pokemon2Id,
      created: new Date().toISOString()
    };
    
    this.fusions.push(fusion);
    this.saveFusions();
    
    this.eventBus.emit(GameEvent.POKEMON_FUSED, {
      fusion: fusion.name,
      pokemon1: pokemon1Name,
      pokemon2: pokemon2Name
    });
    
    return fusion;
  }
  
  private generateFusionName(name1: string, name2: string): string {
    const half1 = name1.substring(0, Math.ceil(name1.length / 2));
    const half2 = name2.substring(Math.floor(name2.length / 2));
    return (half1 + half2).toUpperCase();
  }
  
  public getFusions(): Fusion[] {
    return [...this.fusions];
  }
  
  public getFusionById(id: string): Fusion | undefined {
    return this.fusions.find(f => f.id === id);
  }
  
  public getFusionCount(): number {
    return this.fusions.length;
  }
  
  public hasFusion(pokemon1Id: number, pokemon2Id: number): boolean {
    const id1 = `${pokemon1Id}-${pokemon2Id}`;
    const id2 = `${pokemon2Id}-${pokemon1Id}`;
    return this.fusions.some(f => f.id === id1 || f.id === id2);
  }
}
