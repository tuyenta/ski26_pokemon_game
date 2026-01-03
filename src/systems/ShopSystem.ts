export interface ShopItem {
  id: string;
  name: string;
  price: number;
  emoji: string;
  desc: string;
}

export class ShopSystem {
  private items: ShopItem[];
  
  constructor() {
    this.items = this.initializeItems();
  }
  
  private initializeItems(): ShopItem[] {
    return [
      { id: 'pokeball', name: 'Pokeball', price: 20, emoji: '⚪', desc: 'Standard catch ball' },
      { id: 'greatball', name: 'Great Ball', price: 50, emoji: '🔵', desc: 'Better catch rate' },
      { id: 'ultraball', name: 'Ultra Ball', price: 100, emoji: '🟡', desc: 'Best catch rate' },
      { id: 'potion', name: 'Potion', price: 30, emoji: '🧪', desc: 'Heal 20 HP' },
      { id: 'superpotion', name: 'Super Potion', price: 70, emoji: '💉', desc: 'Heal 50 HP' },
      { id: 'luckyegg', name: 'Lucky Egg', price: 200, emoji: '🥚', desc: '2x XP boost' },
      { id: 'rarecandy', name: 'Rare Candy', price: 300, emoji: '🍬', desc: 'Instant evolution' },
      { id: 'incense', name: 'Incense', price: 150, emoji: '💨', desc: 'Boost spawns' }
    ];
  }
  
  public getItems(): ShopItem[] {
    return [...this.items];
  }
  
  public getItemById(itemId: string): ShopItem | undefined {
    return this.items.find(i => i.id === itemId);
  }
  
  public calculateTotalCost(itemId: string, quantity: number): number {
    const item = this.getItemById(itemId);
    return item ? item.price * quantity : 0;
  }
  
  public calculateSellPrice(itemId: string, quantity: number): number {
    const item = this.getItemById(itemId);
    return item ? Math.floor(item.price * 0.5 * quantity) : 0;
  }
}
