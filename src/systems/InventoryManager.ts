import { EventBus } from '../core/EventBus';
import { GameEvent } from '../core/events';
import { StorageAdapter } from '../core/StorageAdapter';

export interface ItemInventory {
  pokeball: number;
  greatball: number;
  ultraball: number;
  potion: number;
  superpotion: number;
  luckyegg: number;
  rarecandy: number;
  incense: number;
}

export interface ItemEffect {
  catchRate?: number;
  heal?: number;
  xpBoost?: number;
  instantEvolve?: boolean;
  spawnBoost?: number;
  desc: string;
}

export class InventoryManager {
  private items: ItemInventory;
  private coins: number;
  private storage: StorageAdapter;
  private eventBus: EventBus;
  
  constructor() {
    this.storage = StorageAdapter.getInstance();
    this.eventBus = EventBus.getInstance();
    
    this.items = this.loadInventory();
    this.coins = this.loadCoins();
  }
  
  private loadInventory(): ItemInventory {
    const saved = this.storage.get<ItemInventory>('inventory');
    return saved || {
      pokeball: 10,
      greatball: 3,
      ultraball: 1,
      potion: 5,
      superpotion: 2,
      luckyegg: 1,
      rarecandy: 0,
      incense: 0
    };
  }
  
  private loadCoins(): number {
    return this.storage.get<number>('coins') || 100;
  }
  
  private saveInventory(): void {
    this.storage.set('inventory', this.items);
    this.eventBus.emit(GameEvent.INVENTORY_UPDATED, { items: this.items });
  }
  
  private saveCoins(): void {
    this.storage.set('coins', this.coins);
    this.eventBus.emit(GameEvent.COINS_CHANGED, { coins: this.coins });
  }
  
  public useItem(itemName: keyof ItemInventory): boolean {
    if (this.items[itemName] > 0) {
      this.items[itemName]--;
      this.saveInventory();
      
      this.eventBus.emit(GameEvent.ITEM_USED, {
        item: itemName,
        remaining: this.items[itemName]
      });
      
      return true;
    }
    return false;
  }
  
  public addItem(itemName: keyof ItemInventory, quantity: number = 1): void {
    this.items[itemName] = (this.items[itemName] || 0) + quantity;
    this.saveInventory();
    
    this.eventBus.emit(GameEvent.ITEM_ACQUIRED, {
      item: itemName,
      quantity,
      total: this.items[itemName]
    });
  }
  
  public addCoins(amount: number): void {
    this.coins += amount;
    this.saveCoins();
  }
  
  public removeCoins(amount: number): boolean {
    if (this.coins >= amount) {
      this.coins -= amount;
      this.saveCoins();
      return true;
    }
    return false;
  }
  
  public getCoins(): number {
    return this.coins;
  }
  
  public getItems(): ItemInventory {
    return { ...this.items };
  }
  
  public getItemCount(itemName: keyof ItemInventory): number {
    return this.items[itemName] || 0;
  }
  
  /**
   * Get full inventory state
   */
  public getInventory(): { items: ItemInventory; coins: number } {
    return {
      items: { ...this.items },
      coins: this.coins
    };
  }
  
  public getItemEffect(itemName: keyof ItemInventory): ItemEffect {
    const effects: Record<keyof ItemInventory, ItemEffect> = {
      pokeball: { catchRate: 1.0, desc: 'Standard catch rate' },
      greatball: { catchRate: 1.5, desc: '+50% catch rate' },
      ultraball: { catchRate: 2.0, desc: '2x catch rate' },
      potion: { heal: 20, desc: 'Restore 20 HP' },
      superpotion: { heal: 50, desc: 'Restore 50 HP' },
      luckyegg: { xpBoost: 2.0, desc: '2x XP for 10 minutes' },
      rarecandy: { instantEvolve: true, desc: 'Instant evolution' },
      incense: { spawnBoost: 1.5, desc: '+50% spawn rate' }
    };
    
    return effects[itemName] || { desc: 'Unknown item' };
  }
}
