import { StorageAdapter } from '../core/StorageAdapter';

export interface PokemonCustomization {
  nickname?: string;
  favorite?: boolean;
  note?: string;
}

export class CustomizationSystem {
  private customizations: Record<number, PokemonCustomization>;
  private storage: StorageAdapter;
  
  constructor() {
    this.storage = StorageAdapter.getInstance();
    this.customizations = this.load();
  }
  
  private load(): Record<number, PokemonCustomization> {
    return this.storage.get<Record<number, PokemonCustomization>>('customizations') || {};
  }
  
  private save(): void {
    this.storage.set('customizations', this.customizations);
  }
  
  public setNickname(pokemonId: number, nickname: string): void {
    if (!this.customizations[pokemonId]) {
      this.customizations[pokemonId] = {};
    }
    this.customizations[pokemonId].nickname = nickname.substring(0, 12);
    this.save();
  }
  
  public toggleFavorite(pokemonId: number): boolean {
    if (!this.customizations[pokemonId]) {
      this.customizations[pokemonId] = {};
    }
    this.customizations[pokemonId].favorite = !this.customizations[pokemonId].favorite;
    this.save();
    return this.customizations[pokemonId].favorite || false;
  }
  
  public setNote(pokemonId: number, note: string): void {
    if (!this.customizations[pokemonId]) {
      this.customizations[pokemonId] = {};
    }
    this.customizations[pokemonId].note = note.substring(0, 100);
    this.save();
  }
  
  public getCustomization(pokemonId: number): PokemonCustomization {
    return this.customizations[pokemonId] || {};
  }
  
  public isFavorite(pokemonId: number): boolean {
    return this.customizations[pokemonId]?.favorite || false;
  }
  
  public getNickname(pokemonId: number): string | undefined {
    return this.customizations[pokemonId]?.nickname;
  }
  
  public getNote(pokemonId: number): string | undefined {
    return this.customizations[pokemonId]?.note;
  }
  
  public getAllFavorites(): number[] {
    return Object.entries(this.customizations)
      .filter(([_, custom]) => custom.favorite)
      .map(([id, _]) => parseInt(id));
  }
}
