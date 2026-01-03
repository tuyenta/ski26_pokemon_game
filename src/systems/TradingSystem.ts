import { EventBus } from '../core/EventBus';
import { GameEvent } from '../core/events';
import { StorageAdapter } from '../core/StorageAdapter';

export interface TradeHistoryEntry {
  date: string;
  gave: { id: number; name: string };
  received: { id: number; name: string; shiny: boolean };
  trader: string;
}

export interface NPCTrader {
  name: string;
  wants: string;
  offers: string;
  wantedPokemon: number[];
  offeredPokemon: number[];
  offeredPokemonId?: number;
  wantedPokemonId?: number;
}

export class TradingSystem {
  private tradeHistory: TradeHistoryEntry[];
  private pendingTrades: any[];
  private storage: StorageAdapter;
  private eventBus: EventBus;
  
  constructor() {
    this.storage = StorageAdapter.getInstance();
    this.eventBus = EventBus.getInstance();
    
    this.tradeHistory = this.loadTradeHistory();
    this.pendingTrades = [];
  }
  
  private loadTradeHistory(): TradeHistoryEntry[] {
    const saved = this.storage.get<TradeHistoryEntry[]>('trade_history');
    return saved || [];
  }
  
  private saveTradeHistory(): void {
    this.storage.set('trade_history', this.tradeHistory);
  }
  
  public proposeNPCTrade(trainerLevel: number): NPCTrader {
    const npcs: NPCTrader[] = [
      { name: 'Youngster Joey', wants: 'normal', offers: 'bug', wantedPokemon: [19, 161], offeredPokemon: [10, 11, 13] },
      { name: 'Lass Emma', wants: 'water', offers: 'grass', wantedPokemon: [54, 60, 98], offeredPokemon: [43, 69, 102] },
      { name: 'Bug Catcher Sam', wants: 'flying', offers: 'poison', wantedPokemon: [16, 21, 83], offeredPokemon: [23, 29, 32] },
      { name: 'Swimmer Kate', wants: 'fire', offers: 'water', wantedPokemon: [37, 58, 77], offeredPokemon: [72, 116, 120] },
      { name: 'Hiker Brock', wants: 'grass', offers: 'rock', wantedPokemon: [43, 69, 114], offeredPokemon: [74, 95, 111] },
      { name: 'Psychic Sabrina', wants: 'fighting', offers: 'psychic', wantedPokemon: [56, 66, 106], offeredPokemon: [63, 96, 102] }
    ];
    
    const availableNPCs = npcs.filter((npc, idx) => idx <= Math.floor(trainerLevel / 5));
    const selectedNPC = availableNPCs[Math.floor(Math.random() * availableNPCs.length)] || npcs[0];
    
    const offeredId = selectedNPC.offeredPokemon[Math.floor(Math.random() * selectedNPC.offeredPokemon.length)];
    const wantedId = selectedNPC.wantedPokemon[Math.floor(Math.random() * selectedNPC.wantedPokemon.length)];
    
    return {
      ...selectedNPC,
      offeredPokemonId: offeredId,
      wantedPokemonId: wantedId
    };
  }
  
  public async executeTrade(
    myPokemonId: number,
    myPokemonName: string,
    receivedPokemonId: number,
    traderName: string
  ): Promise<{ success: boolean; message: string; shiny?: boolean; receivedName?: string }> {
    try {
      // Fetch received Pokemon details from API
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${receivedPokemonId}`);
      const data = await response.json();
      const receivedName = data.name;
      const receivedType = data.types[0].type.name;
      const isShiny = Math.random() < 0.05; // 5% chance for shiny from trades
      
      // Record trade BEFORE emitting events (so collection manager can validate)
      this.tradeHistory.push({
        date: new Date().toISOString(),
        gave: { id: myPokemonId, name: myPokemonName },
        received: { id: receivedPokemonId, name: receivedName, shiny: isShiny },
        trader: traderName
      });
      this.saveTradeHistory();
      
      // Emit trade event - other systems will handle adding/removing Pokemon
      this.eventBus.emit(GameEvent.TRADE_COMPLETED, {
        gave: { id: myPokemonId, name: myPokemonName },
        received: { id: receivedPokemonId, name: receivedName, type: receivedType, shiny: isShiny },
        trader: traderName
      });
      
      return { 
        success: true, 
        message: `Traded ${myPokemonName} for ${receivedName}!`, 
        shiny: isShiny,
        receivedName 
      };
    } catch (error) {
      return { success: false, message: 'Trade failed!' };
    }
  }
  
  public getTradeHistory(): TradeHistoryEntry[] {
    return [...this.tradeHistory];
  }
  
  public getTradeCount(): number {
    return this.tradeHistory.length;
  }
  
  public getRecentTrades(count: number = 5): TradeHistoryEntry[] {
    return this.tradeHistory.slice(-count).reverse();
  }
}
