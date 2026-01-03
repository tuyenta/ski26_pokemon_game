/**
 * Collection Manager - Tracks caught Pokemon, achievements, and stats
 * Emits events via EventBus for other systems to react to collection changes
 */

import { AGE_CONFIGS } from '../config/ageGroups';
import { eventBus } from '../core/EventBus';
import { GameEvent } from '../core/events';
import { storage } from '../core/StorageAdapter';

export interface PokemonInCollection {
  id: number;
  name: string;
  type: string;
  firstCaught: string;
  timesScanned: number;
  isShiny: boolean;
  evolutionProgress: number;
  hasEvolved: boolean;
}

export interface Stats {
  totalScans: number;
  currentStreak: number;
  longestStreak: number;
  lastScanDate: string | null;
  scansByType: Record<string, number>;
  fastestScan: number | null;
}

export interface Achievement {
  unlocked: boolean;
  date: string;
}

export interface DailyChallenge {
  type: string;
  target: number | string;
  desc: string;
  reward: string;
  emoji: string;
  date: string;
  progress: number;
  completed: boolean;
}

export class CollectionManager {
  collection: Record<number, PokemonInCollection>;
  achievements: Record<string, Achievement>;
  stats: Stats;
  private selectedAgeGroup: string | null;

  constructor(ageGroup: string | null = null) {
    this.selectedAgeGroup = ageGroup;
    this.collection = this.loadCollection();
    this.achievements = this.loadAchievements();
    this.stats = this.loadStats();
  }

  private loadCollection(): Record<number, PokemonInCollection> {
    return storage.get<Record<number, PokemonInCollection>>('collection') || {};
  }

  private loadAchievements(): Record<string, Achievement> {
    return storage.get<Record<string, Achievement>>('achievements') || {};
  }

  private loadStats(): Stats {
    const defaultStats: Stats = {
      totalScans: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastScanDate: null,
      scansByType: {},
      fastestScan: null
    };
    return storage.get<Stats>('stats') || defaultStats;
  }

  private saveCollection(): void {
    storage.set('collection', this.collection);
  }

  private saveAchievements(): void {
    storage.set('achievements', this.achievements);
  }

  private saveStats(): void {
    storage.set('stats', this.stats);
  }

  /**
   * Add or update a Pokemon in the collection
   */
  addPokemon(
    pokemonId: number,
    pokemonName: string,
    pokemonType: string,
    isShiny: boolean = false
  ): { isNew: boolean; pokemon: PokemonInCollection } {
    const isNew = !this.collection[pokemonId];

    if (isNew) {
      this.collection[pokemonId] = {
        id: pokemonId,
        name: pokemonName,
        type: pokemonType,
        firstCaught: new Date().toISOString(),
        timesScanned: 1,
        isShiny: isShiny,
        evolutionProgress: 0,
        hasEvolved: false
      };

      // Emit event
      eventBus.emit(GameEvent.POKEMON_CAUGHT, {
        id: pokemonId,
        name: pokemonName,
        type: pokemonType,
        isShiny,
        isNew: true
      });
    } else {
      this.collection[pokemonId].timesScanned++;
      this.collection[pokemonId].evolutionProgress++;

      // Keep shiny status if already shiny or newly shiny
      if (isShiny && !this.collection[pokemonId].isShiny) {
        this.collection[pokemonId].isShiny = true;
      }

      eventBus.emit(GameEvent.POKEMON_CAUGHT, {
        id: pokemonId,
        name: pokemonName,
        type: pokemonType,
        isShiny,
        isNew: false
      });
    }

    this.saveCollection();
    return { isNew, pokemon: this.collection[pokemonId] };
  }

  /**
   * Update scanning stats and check achievements
   */
  updateStats(pokemonType: string): void {
    this.stats.totalScans++;

    // Update streak
    const today = new Date().toISOString().split('T')[0];
    if (this.stats.lastScanDate === today) {
      // Same day, streak continues
    } else {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (this.stats.lastScanDate === yesterdayStr) {
        this.stats.currentStreak++;
      } else {
        this.stats.currentStreak = 1;
      }

      this.stats.lastScanDate = today;

      eventBus.emit(GameEvent.STREAK_UPDATED, {
        streak: this.stats.currentStreak
      });
    }

    if (this.stats.currentStreak > this.stats.longestStreak) {
      this.stats.longestStreak = this.stats.currentStreak;
    }

    // Track by type
    if (!this.stats.scansByType[pokemonType]) {
      this.stats.scansByType[pokemonType] = 0;
    }
    this.stats.scansByType[pokemonType]++;

    this.saveStats();
    this.checkAchievements();
  }

  /**
   * Check and unlock achievements
   */
  private checkAchievements(): void {
    const caughtCount = Object.keys(this.collection).length;

    const achievementChecks = [
      { id: 'first_catch', threshold: 1, name: 'First Catch', emoji: '🎉' },
      { id: 'novice_trainer', threshold: 10, name: 'Novice Trainer', emoji: '⭐' },
      { id: 'expert_trainer', threshold: 50, name: 'Expert Trainer', emoji: '💎' },
      { id: 'master_trainer', threshold: 150, name: 'Master Trainer', emoji: '👑' }
    ];

    achievementChecks.forEach(({ id, threshold, name, emoji }) => {
      if (caughtCount >= threshold && !this.achievements[id]) {
        this.achievements[id] = { unlocked: true, date: new Date().toISOString() };
        eventBus.emit(GameEvent.ACHIEVEMENT_UNLOCKED, { achievementId: id, name });
      }
    });

    // Speed Scanner (10 scans)
    if (this.stats.totalScans >= 10 && !this.achievements['speed_scanner']) {
      this.achievements['speed_scanner'] = { unlocked: true, date: new Date().toISOString() };
      eventBus.emit(GameEvent.ACHIEVEMENT_UNLOCKED, { 
        achievementId: 'speed_scanner', 
        name: 'Speed Scanner' 
      });
    }

    // Streak Master (5 day streak)
    if (this.stats.currentStreak >= 5 && !this.achievements['streak_master']) {
      this.achievements['streak_master'] = { unlocked: true, date: new Date().toISOString() };
      eventBus.emit(GameEvent.ACHIEVEMENT_UNLOCKED, { 
        achievementId: 'streak_master', 
        name: 'Streak Master' 
      });
    }

    // Type Master (caught 5 different types)
    const typeCount = Object.keys(this.stats.scansByType).length;
    if (typeCount >= 5 && !this.achievements['type_master']) {
      this.achievements['type_master'] = { unlocked: true, date: new Date().toISOString() };
      eventBus.emit(GameEvent.ACHIEVEMENT_UNLOCKED, { 
        achievementId: 'type_master', 
        name: 'Type Master' 
      });
    }

    this.saveAchievements();
  }

  /**
   * Get collection size
   */
  getCollectionSize(): number {
    return Object.keys(this.collection).length;
  }

  /**
   * Get collection
   */
  getCollection() {
    return this.collection;
  }

  /**
   * Get stats
   */
  getStats() {
    return this.stats;
  }

  /**
   * Get completion percentage
   */
  getCompletionPercent(): number {
    const maxPokemon = this.selectedAgeGroup 
      ? AGE_CONFIGS[this.selectedAgeGroup]?.maxPokemon || 1025
      : 1025;
    return Math.round((this.getCollectionSize() / maxPokemon) * 100);
  }

  /**
   * Generate or retrieve daily challenge
   */
  generateDailyChallenge(): DailyChallenge {
    const today = new Date().toISOString().split('T')[0];
    const saved = storage.get<DailyChallenge>('daily_challenge');

    if (saved && saved.date === today) {
      return saved;
    }

    // Generate new challenge
    const challenges: Omit<DailyChallenge, 'date' | 'progress' | 'completed'>[] = [
      { type: 'scan_count', target: 5, desc: 'Scan 5 Pokemon today', reward: 'Scanner Badge', emoji: '🎯' },
      { type: 'scan_type', target: 'fire', desc: 'Find a Fire-type Pokemon', reward: 'Fire Badge', emoji: '🔥' },
      { type: 'scan_type', target: 'water', desc: 'Find a Water-type Pokemon', reward: 'Water Badge', emoji: '💧' },
      { type: 'multi_face', target: 2, desc: 'Scan 2+ faces at once', reward: 'Social Badge', emoji: '👥' },
      { type: 'new_pokemon', target: 3, desc: 'Catch 3 new Pokemon', reward: 'Explorer Badge', emoji: '✨' },
      { type: 'shiny_hunt', target: 1, desc: 'Find a Shiny Pokemon', reward: 'Shiny Hunter', emoji: '⭐' }
    ];

    const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];
    const newChallenge: DailyChallenge = {
      ...randomChallenge,
      date: today,
      progress: 0,
      completed: false
    };

    storage.set('daily_challenge', newChallenge);
    return newChallenge;
  }

  /**
   * Update daily challenge progress
   */
  updateDailyChallenge(scanData: {
    type?: string;
    faceCount?: number;
    isNew?: boolean;
    isShiny?: boolean;
  }): DailyChallenge {
    const challenge = this.generateDailyChallenge();

    if (challenge.completed) return challenge;

    switch (challenge.type) {
      case 'scan_count':
        challenge.progress++;
        break;
      case 'scan_type':
        if (scanData.type === challenge.target) {
          challenge.progress = 1;
        }
        break;
      case 'multi_face':
        if (scanData.faceCount && scanData.faceCount >= (challenge.target as number)) {
          challenge.progress = 1;
        }
        break;
      case 'new_pokemon':
        if (scanData.isNew) {
          challenge.progress++;
        }
        break;
      case 'shiny_hunt':
        if (scanData.isShiny) {
          challenge.progress = 1;
        }
        break;
    }

    if (challenge.progress >= (challenge.target as number)) {
      challenge.completed = true;
      eventBus.emit(GameEvent.DAILY_CHALLENGE_COMPLETED, {
        challengeType: challenge.type,
        reward: challenge.reward
      });
    }

    storage.set('daily_challenge', challenge);
    return challenge;
  }

  /**
   * Set age group for Pokemon pool filtering
   */
  setAgeGroup(ageGroup: string): void {
    this.selectedAgeGroup = ageGroup;
  }
}
