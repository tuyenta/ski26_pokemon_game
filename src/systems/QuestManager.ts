import { EventBus } from '../core/EventBus';
import { GameEvent } from '../core/events';
import { StorageAdapter } from '../core/StorageAdapter';

export interface Quest {
  id: number;
  title: string;
  desc: string;
  reward: number;
  type: string;
  target: number;
  progress: number;
}

export class QuestManager {
  private quests: Quest[];
  private activeQuests: number[];
  private storage: StorageAdapter;
  private eventBus: EventBus;
  
  constructor() {
    this.storage = StorageAdapter.getInstance();
    this.eventBus = EventBus.getInstance();
    
    this.quests = this.initializeQuests();
    this.activeQuests = this.loadActiveQuests();
    
    this.setupEventListeners();
  }
  
  private initializeQuests(): Quest[] {
    const savedProgress = this.storage.get<Record<number, number>>('quest_progress') || {};
    
    const quests: Quest[] = [
      { id: 1, title: 'First Steps', desc: 'Catch 5 different Pokemon', reward: 100, type: 'catch', target: 5, progress: 0 },
      { id: 2, title: 'Type Collector', desc: 'Catch 3 Water-type Pokemon', reward: 150, type: 'type-water', target: 3, progress: 0 },
      { id: 3, title: 'Battle Ready', desc: 'Win 3 battles', reward: 200, type: 'battle', target: 3, progress: 0 },
      { id: 4, title: 'Shiny Hunter', desc: 'Catch 1 Shiny Pokemon', reward: 500, type: 'shiny', target: 1, progress: 0 },
      { id: 5, title: 'Evolution Master', desc: 'Evolve 5 Pokemon', reward: 300, type: 'evolve', target: 5, progress: 0 },
      { id: 6, title: 'Legendary Hunter', desc: 'Catch 1 Legendary Pokemon', reward: 1000, type: 'legendary', target: 1, progress: 0 },
      { id: 7, title: 'Streak Master', desc: 'Maintain a 7-day streak', reward: 250, type: 'streak', target: 7, progress: 0 },
      { id: 8, title: 'Photo Album', desc: 'Take 10 photos', reward: 150, type: 'photo', target: 10, progress: 0 }
    ];
    
    // Restore progress from storage
    quests.forEach(quest => {
      if (savedProgress[quest.id] !== undefined) {
        quest.progress = savedProgress[quest.id];
      }
    });
    
    return quests;
  }
  
  private loadActiveQuests(): number[] {
    const saved = this.storage.get<number[]>('active_quests');
    return saved || [1, 2, 3];
  }
  
  private saveQuests(): void {
    this.storage.set('active_quests', this.activeQuests);
    
    // Save progress for all quests
    const progress: Record<number, number> = {};
    this.quests.forEach(q => {
      progress[q.id] = q.progress;
    });
    this.storage.set('quest_progress', progress);
    
    this.eventBus.emit(GameEvent.QUEST_PROGRESS_UPDATED, {
      activeQuests: this.getActiveQuests()
    });
  }
  
  private setupEventListeners(): void {
    // Auto-update quest progress based on game events
    this.eventBus.on(GameEvent.POKEMON_CAUGHT, (payload) => {
      this.updateProgress('catch', 1);
      if (payload.isShiny) this.updateProgress('shiny', 1);
      if (payload.isLegendary) this.updateProgress('legendary', 1);
      if (payload.type) this.updateProgress(`type-${payload.type}`, 1);
    });
    
    this.eventBus.on(GameEvent.BATTLE_WON, () => {
      this.updateProgress('battle', 1);
    });
    
    this.eventBus.on(GameEvent.POKEMON_EVOLVED, () => {
      this.updateProgress('evolve', 1);
    });
    
    this.eventBus.on(GameEvent.STREAK_UPDATED, (payload) => {
      if (payload.streak >= 7) {
        this.updateProgress('streak', payload.streak);
      }
    });
    
    this.eventBus.on(GameEvent.PHOTO_TAKEN, () => {
      this.updateProgress('photo', 1);
    });
  }
  
  public updateProgress(type: string, value: number = 1): void {
    let questCompleted = false;
    
    this.activeQuests.forEach(questId => {
      const quest = this.quests.find(q => q.id === questId);
      if (quest && quest.type === type && quest.progress < quest.target) {
        quest.progress = Math.min(quest.progress + value, quest.target);
        
        if (quest.progress >= quest.target) {
          this.completeQuest(quest);
          questCompleted = true;
        }
      }
    });
    
    if (questCompleted) {
      this.saveQuests();
    }
  }
  
  private completeQuest(quest: Quest): void {
    this.eventBus.emit(GameEvent.QUEST_COMPLETED, {
      quest: quest.title,
      reward: quest.reward
    });
    
    // Remove completed quest and add new one
    const index = this.activeQuests.indexOf(quest.id);
    if (index > -1) {
      this.activeQuests.splice(index, 1);
      
      const availableQuests = this.quests.filter(
        q => !this.activeQuests.includes(q.id) && q.progress < q.target
      );
      
      if (availableQuests.length > 0) {
        this.activeQuests.push(availableQuests[0].id);
      }
    }
  }
  
  public getActiveQuests(): Quest[] {
    return this.activeQuests
      .map(id => this.quests.find(q => q.id === id))
      .filter(q => q !== undefined) as Quest[];
  }
  
  public getAllQuests(): Quest[] {
    return [...this.quests];
  }
  
  public getQuestById(id: number): Quest | undefined {
    return this.quests.find(q => q.id === id);
  }
}
