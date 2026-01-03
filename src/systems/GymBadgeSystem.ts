import { EventBus } from '../core/EventBus';
import { GameEvent } from '../core/events';
import { StorageAdapter } from '../core/StorageAdapter';

export interface GymBadge {
  id: number;
  name: string;
  type: string;
  emoji: string;
  challenge: string;
  requirement: number;
}

export class GymBadgeSystem {
  private badges: number[];
  private gymLeaders: GymBadge[];
  private storage: StorageAdapter;
  private eventBus: EventBus;
  
  constructor() {
    this.storage = StorageAdapter.getInstance();
    this.eventBus = EventBus.getInstance();
    
    this.badges = this.loadBadges();
    this.gymLeaders = this.initializeGymLeaders();
    
    this.setupEventListeners();
  }
  
  private initializeGymLeaders(): GymBadge[] {
    return [
      { id: 1, name: 'Boulder', type: 'rock', emoji: '🪨', challenge: 'Catch 10 Pokemon', requirement: 10 },
      { id: 2, name: 'Cascade', type: 'water', emoji: '💧', challenge: 'Catch 5 Water-type', requirement: 5 },
      { id: 3, name: 'Thunder', type: 'electric', emoji: '⚡', challenge: 'Win 5 battles', requirement: 5 },
      { id: 4, name: 'Rainbow', type: 'grass', emoji: '🌈', challenge: 'Catch 20 Pokemon', requirement: 20 },
      { id: 5, name: 'Soul', type: 'poison', emoji: '☠️', challenge: 'Catch 1 Shiny', requirement: 1 },
      { id: 6, name: 'Marsh', type: 'psychic', emoji: '🔮', challenge: 'Maintain 7-day streak', requirement: 7 },
      { id: 7, name: 'Volcano', type: 'fire', emoji: '🔥', challenge: 'Win 10 battles', requirement: 10 },
      { id: 8, name: 'Earth', type: 'ground', emoji: '🌍', challenge: 'Catch 50 Pokemon', requirement: 50 }
    ];
  }
  
  private loadBadges(): number[] {
    const saved = this.storage.get<number[]>('gym_badges');
    return saved || [];
  }
  
  private saveBadges(): void {
    this.storage.set('gym_badges', this.badges);
  }
  
  private setupEventListeners(): void {
    // Check badge progress on relevant events
    this.eventBus.on(GameEvent.POKEMON_CAUGHT, () => {
      this.checkBadgeProgress();
    });
    
    this.eventBus.on(GameEvent.BATTLE_WON, () => {
      this.checkBadgeProgress();
    });
    
    this.eventBus.on(GameEvent.STREAK_UPDATED, () => {
      this.checkBadgeProgress();
    });
    
    this.eventBus.on(GameEvent.COLLECTION_UPDATED, () => {
      this.checkBadgeProgress();
    });
  }
  
  public checkBadgeProgress(): void {
    // This will be called by main game controller with current stats
    // For now, emit event to request stats
    this.eventBus.emit(GameEvent.BADGE_CHECK_REQUESTED, {});
  }
  
  public checkWithStats(stats: {
    totalCaught: number;
    typeStats: Record<string, number>;
    shinyCount: number;
    wins: number;
    currentStreak: number;
  }): void {
    this.gymLeaders.forEach(gym => {
      if (this.badges.includes(gym.id)) return;
      
      let earned = false;
      
      switch(gym.id) {
        case 1: earned = stats.totalCaught >= 10; break;
        case 2: earned = (stats.typeStats['water'] || 0) >= 5; break;
        case 3: earned = stats.wins >= 5; break;
        case 4: earned = stats.totalCaught >= 20; break;
        case 5: earned = stats.shinyCount >= 1; break;
        case 6: earned = stats.currentStreak >= 7; break;
        case 7: earned = stats.wins >= 10; break;
        case 8: earned = stats.totalCaught >= 50; break;
      }
      
      if (earned) {
        this.earnBadge(gym);
      }
    });
  }
  
  private earnBadge(gym: GymBadge): void {
    this.badges.push(gym.id);
    this.saveBadges();
    
    this.eventBus.emit(GameEvent.BADGE_EARNED, {
      badge: gym.name,
      type: gym.type,
      emoji: gym.emoji
    });
  }
  
  public getBadges(): number[] {
    return [...this.badges];
  }
  
  public hasBadge(badgeId: number): boolean {
    return this.badges.includes(badgeId);
  }
  
  public getBadgeCount(): number {
    return this.badges.length;
  }
  
  public getAllGymLeaders(): GymBadge[] {
    return [...this.gymLeaders];
  }
  
  public getNextBadge(): GymBadge | null {
    const unearned = this.gymLeaders.find(gym => !this.badges.includes(gym.id));
    return unearned || null;
  }
}
