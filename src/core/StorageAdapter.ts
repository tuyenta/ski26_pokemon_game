/**
 * StorageAdapter - Abstraction layer over localStorage
 * Emits events when storage changes for reactive updates
 */

import { eventBus } from './EventBus';
import { GameEvent } from './events';

export class StorageAdapter {
  private static instance: StorageAdapter;
  private prefix: string;

  private constructor(prefix: string = 'pokemon_') {
    this.prefix = prefix;
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): StorageAdapter {
    if (!StorageAdapter.instance) {
      StorageAdapter.instance = new StorageAdapter();
    }
    return StorageAdapter.instance;
  }

  /**
   * Get item from localStorage
   */
  get<T>(key: string): T | null {
    try {
      const fullKey = this.prefix + key;
      const item = localStorage.getItem(fullKey);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading ${key} from storage:`, error);
      return null;
    }
  }

  /**
   * Set item in localStorage and emit event
   */
  set<T>(key: string, value: T): void {
    try {
      const fullKey = this.prefix + key;
      localStorage.setItem(fullKey, JSON.stringify(value));
      
      // Emit storage change event if needed
      this.emitStorageEvent(key, value);
    } catch (error) {
      console.error(`Error writing ${key} to storage:`, error);
    }
  }

  /**
   * Remove item from localStorage
   */
  remove(key: string): void {
    try {
      const fullKey = this.prefix + key;
      localStorage.removeItem(fullKey);
    } catch (error) {
      console.error(`Error removing ${key} from storage:`, error);
    }
  }

  /**
   * Clear all items with prefix
   */
  clear(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }

  /**
   * Check if key exists
   */
  has(key: string): boolean {
    const fullKey = this.prefix + key;
    return localStorage.getItem(fullKey) !== null;
  }

  /**
   * Get all keys with prefix
   */
  keys(): string[] {
    const allKeys = Object.keys(localStorage);
    return allKeys
      .filter(key => key.startsWith(this.prefix))
      .map(key => key.substring(this.prefix.length));
  }

  /**
   * Emit appropriate event based on storage key change
   */
  private emitStorageEvent(key: string, value: any): void {
    // Map storage keys to events
    switch (key) {
      case 'collection':
        const collection = value as any;
        const totalCaught = Object.keys(collection).length;
        eventBus.emit(GameEvent.COLLECTION_UPDATED, {
          totalCaught,
          completionPercent: Math.round((totalCaught / 1025) * 100)
        });
        break;
      
      case 'coins':
        eventBus.emit(GameEvent.COINS_CHANGED, {
          amount: 0,
          newTotal: value
        });
        break;
      
      // Add more mappings as needed
    }
  }
}

// Export singleton instance
export const storage = new StorageAdapter();
