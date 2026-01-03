import { InventoryManager } from '../../systems/InventoryManager';
import { ShopSystem } from '../../systems/ShopSystem';
import { BaseModal } from '../BaseModal';

export class InventoryModal extends BaseModal {
  private inventoryManager: InventoryManager;
  private shopSystem: ShopSystem;
  
  constructor() {
    super();
    this.inventoryManager = new InventoryManager();
    this.shopSystem = new ShopSystem();
  }
  
  public render(): HTMLElement {
    const modal = this.createModalContainer('inventory-modal', 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)');
    const closeButton = this.createCloseButton();
    const header = this.createHeader('INVENTORY', '🎒');
    
    const content = document.createElement('div');
    content.style.cssText = `
      max-width: 900px;
      margin: 0 auto;
      color: white;
    `;
    
    // Coins display
    const coinsSection = this.createCoinsSection();
    
    // Items grid
    const itemsGrid = this.createItemsGrid();
    
    content.appendChild(coinsSection);
    content.appendChild(itemsGrid);
    
    modal.appendChild(closeButton);
    modal.appendChild(header);
    modal.appendChild(content);
    
    return modal;
  }
  
  private createCoinsSection(): HTMLElement {
    const section = document.createElement('div');
    section.style.cssText = `
      background: rgba(255,255,255,0.15);
      padding: 20px;
      border-radius: 12px;
      margin-bottom: 20px;
      text-align: center;
      font-size: 32px;
      font-weight: bold;
    `;
    
    const coins = this.inventoryManager.getCoins();
    section.innerHTML = `💰 ${coins.toLocaleString()} COINS`;
    
    return section;
  }
  
  private createItemsGrid(): HTMLElement {
    const container = document.createElement('div');
    container.style.cssText = `
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 15px;
    `;
    
    const items = this.inventoryManager.getItems();
    const shopItems = this.shopSystem.getItems();
    
    shopItems.forEach(shopItem => {
      const quantity = items[shopItem.id as keyof typeof items] || 0;
      const effect = this.inventoryManager.getItemEffect(shopItem.id as any);
      
      const card = this.createItemCard(shopItem, quantity, effect);
      container.appendChild(card);
    });
    
    return container;
  }
  
  private createItemCard(item: any, quantity: number, effect: any): HTMLElement {
    const card = document.createElement('div');
    card.style.cssText = `
      background: rgba(255,255,255,0.1);
      border-radius: 12px;
      padding: 15px;
      text-align: center;
      transition: transform 0.3s, background 0.3s;
      cursor: pointer;
    `;
    
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-5px)';
      card.style.background = 'rgba(255,255,255,0.2)';
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0)';
      card.style.background = 'rgba(255,255,255,0.1)';
    });
    
    card.innerHTML = `
      <div style="font-size: 48px; margin-bottom: 10px;">${item.emoji}</div>
      <div style="font-size: 18px; font-weight: bold; margin-bottom: 5px;">${item.name}</div>
      <div style="font-size: 24px; color: #FFD700; margin: 10px 0;">×${quantity}</div>
      <div style="font-size: 12px; opacity: 0.8; margin-bottom: 10px;">${effect.desc}</div>
      <div style="font-size: 14px; color: #4CAF50;">💰 ${item.price} coins</div>
    `;
    
    return card;
  }
  
  protected async onShow(): Promise<void> {
    // Could refresh data when shown
  }
}
