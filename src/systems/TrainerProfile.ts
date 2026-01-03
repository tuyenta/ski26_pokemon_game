import { EventBus } from '../core/EventBus';
import { GameEvent } from '../core/events';
import { StorageAdapter } from '../core/StorageAdapter';

export interface TrainerProfileData {
  name: string;
  title: string;
  avatar: string;
  level: number;
  xp: number;
  xpToNext: number;
  badges: number[];
  favoriteType: string;
  joinDate: string;
}

export class TrainerProfile {
  private profile: TrainerProfileData;
  private storage: StorageAdapter;
  private eventBus: EventBus;
  
  constructor() {
    this.storage = StorageAdapter.getInstance();
    this.eventBus = EventBus.getInstance();
    
    this.profile = this.loadProfile();
    
    // Subscribe to events for automatic updates
    this.setupEventListeners();
  }
  
  private loadProfile(): TrainerProfileData {
    const saved = this.storage.get<TrainerProfileData>('trainer_profile');
    return saved || {
      name: 'Trainer',
      title: 'Rookie Trainer',
      avatar: '🧑',
      level: 1,
      xp: 0,
      xpToNext: 100,
      badges: [],
      favoriteType: 'normal',
      joinDate: new Date().toISOString()
    };
  }
  
  private saveProfile(): void {
    this.storage.set('trainer_profile', this.profile);
    this.eventBus.emit(GameEvent.PROFILE_UPDATED, { profile: this.profile });
  }
  
  private setupEventListeners(): void {
    // Auto-gain XP when Pokemon is caught
    this.eventBus.on(GameEvent.POKEMON_CAUGHT, (payload) => {
      const baseXP = 50;
      const shinyBonus = payload.isShiny ? 100 : 0;
      const rarityBonus = payload.isLegendary ? 200 : 0;
      this.addXP(baseXP + shinyBonus + rarityBonus);
    });
    
    // Auto-gain XP from battles
    this.eventBus.on(GameEvent.BATTLE_WON, () => {
      this.addXP(100);
    });
    
    // Update title when collection grows
    this.eventBus.on(GameEvent.COLLECTION_UPDATED, (payload) => {
      this.updateTitle(payload.totalCaught);
    });
  }
  
  public setUsername(name: string): boolean {
    if (name && name.trim().length > 0) {
      this.profile.name = name.trim().substring(0, 20);
      this.saveProfile();
      return true;
    }
    return false;
  }
  
  public addXP(amount: number): void {
    this.profile.xp += amount;
    
    this.eventBus.emit(GameEvent.XP_GAINED, {
      amount,
      total: this.profile.xp,
      level: this.profile.level
    });
    
    while (this.profile.xp >= this.profile.xpToNext) {
      this.levelUp();
    }
    
    this.saveProfile();
  }
  
  private levelUp(): void {
    this.profile.level++;
    this.profile.xp -= this.profile.xpToNext;
    this.profile.xpToNext = Math.floor(this.profile.xpToNext * 1.5);
    
    this.eventBus.emit(GameEvent.LEVEL_UP, {
      level: this.profile.level,
      xpToNext: this.profile.xpToNext
    });
    
    this.saveProfile();
  }
  
  private updateTitle(collectionSize: number): void {
    let newTitle = 'Rookie Trainer';
    
    if (collectionSize >= 500) newTitle = 'Pokemon Master';
    else if (collectionSize >= 300) newTitle = 'Elite Four Member';
    else if (collectionSize >= 150) newTitle = 'Champion';
    else if (collectionSize >= 100) newTitle = 'Gym Leader';
    else if (collectionSize >= 50) newTitle = 'Expert Trainer';
    else if (collectionSize >= 25) newTitle = 'Rising Star';
    else if (collectionSize >= 10) newTitle = 'Novice Trainer';
    
    if (newTitle !== this.profile.title) {
      this.profile.title = newTitle;
      this.eventBus.emit(GameEvent.TITLE_EARNED, { title: newTitle });
      this.saveProfile();
    }
  }
  
  public getProfile(): TrainerProfileData {
    return { ...this.profile };
  }
  
  public getLevel(): number {
    return this.profile.level;
  }
  
  public getXP(): { current: number; required: number; percentage: number } {
    return {
      current: this.profile.xp,
      required: this.profile.xpToNext,
      percentage: (this.profile.xp / this.profile.xpToNext) * 100
    };
  }
  
  public setAvatar(emoji: string): void {
    this.profile.avatar = emoji;
    this.saveProfile();
  }
  
  public setFavoriteType(type: string): void {
    this.profile.favoriteType = type;
    this.saveProfile();
  }
}
