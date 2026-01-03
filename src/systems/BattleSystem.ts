import { EventBus } from '../core/EventBus';
import { GameEvent } from '../core/events';
import { StorageAdapter } from '../core/StorageAdapter';

export interface BattlePokemon {
  id: number;
  name: string;
  hp: number;
  maxHp: number;
  attack?: number;
  defense?: number;
  type?: string;
}

export interface BattleResult {
  won: boolean;
  playerPokemon: string;
  opponentPokemon: string;
  turnsPlayed: number;
  date: string;
}

export class BattleSystem {
  private wins: number;
  private battles: BattleResult[];
  private storage: StorageAdapter;
  private eventBus: EventBus;
  
  constructor() {
    this.storage = StorageAdapter.getInstance();
    this.eventBus = EventBus.getInstance();
    
    this.wins = this.loadWins();
    this.battles = this.loadBattles();
  }
  
  private loadWins(): number {
    return this.storage.get<number>('battle_wins') || 0;
  }
  
  private loadBattles(): BattleResult[] {
    const saved = this.storage.get<BattleResult[]>('battle_history');
    return saved || [];
  }
  
  private saveWins(): void {
    this.storage.set('battle_wins', this.wins);
  }
  
  private saveBattles(): void {
    this.storage.set('battle_history', this.battles);
  }
  
  public winBattle(playerPokemon: string, opponentPokemon: string, turnsPlayed: number): void {
    this.wins++;
    this.saveWins();
    
    const result: BattleResult = {
      won: true,
      playerPokemon,
      opponentPokemon,
      turnsPlayed,
      date: new Date().toISOString()
    };
    
    this.battles.push(result);
    this.saveBattles();
    
    this.eventBus.emit(GameEvent.BATTLE_WON, {
      opponentName: opponentPokemon,
      rewards: { coins: 50, xp: 100 }
    });
  }
  
  public loseBattle(playerPokemon: string, opponentPokemon: string, turnsPlayed: number): void {
    const result: BattleResult = {
      won: false,
      playerPokemon,
      opponentPokemon,
      turnsPlayed,
      date: new Date().toISOString()
    };
    
    this.battles.push(result);
    this.saveBattles();
    
    this.eventBus.emit(GameEvent.BATTLE_LOST, {
      opponentName: opponentPokemon
    });
  }
  
  public getWins(): number {
    return this.wins;
  }
  
  public getBattleHistory(): BattleResult[] {
    return [...this.battles];
  }
  
  public getRecentBattles(count: number = 5): BattleResult[] {
    return this.battles.slice(-count).reverse();
  }
  
  public getWinRate(): number {
    if (this.battles.length === 0) return 0;
    const wins = this.battles.filter(b => b.won).length;
    return (wins / this.battles.length) * 100;
  }
  
  public getTotalBattles(): number {
    return this.battles.length;
  }
}
