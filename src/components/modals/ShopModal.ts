import { InventoryManager } from '../../systems/InventoryManager';
import { ShopSystem } from '../../systems/ShopSystem';
import { BaseModal } from '../BaseModal';

export class ShopModal extends BaseModal {
  private shopSystem: ShopSystem;
  private inventoryManager: InventoryManager;
  
  constructor() {
    super();
    this.shopSystem = new ShopSystem();
    this.inventoryManager = new InventoryManager();
  }
  
  public render(): HTMLElement {
    const modal = this.createModalContainer('shop-modal', 'linear-gradient(135deg, #FA8BFF 0%, #2BD2FF 90%)');
    const closeButton = this.createCloseButton();
    const header = this.createHeader('POKE SHOP', '🏪');
    
    const content = document.createElement('div');
    content.style.cssText = `
      max-width: 1000px;
      margin: 0 auto;
      color: white;
    `;
    
    // Coins display
    const coinsSection = this.createCoinsSection();
    
    // Shop items grid
    const itemsGrid = this.createShopGrid();
    
    content.appendChild(coinsSection);
    content.appendChild(itemsGrid);
    
    modal.appendChild(closeButton);
    modal.appendChild(header);
    modal.appendChild(content);
    
    return modal;
  }
  
  private createCoinsSection(): HTMLElement {
    const section = document.createElement('div');
    section.id = 'shop-coins-display';
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
  
  private createShopGrid(): HTMLElement {
    const container = document.createElement('div');
    container.style.cssText = `
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 20px;
    `;
    
    const items = this.shopSystem.getItems();
    
    items.forEach(item => {
      const card = this.createShopItemCard(item);
      container.appendChild(card);
    });
    
    return container;
  }
  
  private createShopItemCard(item: any): HTMLElement {
    const card = document.createElement('div');
    card.style.cssText = `
      background: rgba(255,255,255,0.15);
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      transition: transform 0.3s, background 0.3s;
      cursor: pointer;
    `;
    
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'scale(1.05)';
      card.style.background = 'rgba(255,255,255,0.25)';
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'scale(1)';
      card.style.background = 'rgba(255,255,255,0.15)';
    });
    
    const coins = this.inventoryManager.getCoins();
    const canAfford = coins >= item.price;
    
    card.innerHTML = `
      <div style="font-size: 64px; margin-bottom: 15px;">${item.emoji}</div>
      <h3 style="font-size: 20px; margin: 10px 0;">${item.name}</h3>
      <p style="font-size: 14px; opacity: 0.8; margin: 10px 0;">${item.desc}</p>
      <div style="
        font-size: 24px;
        font-weight: bold;
        color: ${canAfford ? '#4CAF50' : '#f44336'};
        margin: 15px 0;
      ">
        💰 ${item.price}
      </div>
      <button style="
        background: ${canAfford ? '#4CAF50' : '#666'};
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 16px;
        font-weight: bold;
        cursor: ${canAfford ? 'pointer' : 'not-allowed'};
        width: 100%;
      " ${!canAfford ? 'disabled' : ''}>
        BUY
      </button>
    `;
    
    if (canAfford) {
      const buyButton = card.querySelector('button');
      buyButton?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.buyItem(item);
      });
    }
    
    return card;
  }
  
  private buyItem(item: any): void {
    const coins = this.inventoryManager.getCoins();
    
    if (coins >= item.price) {
      this.inventoryManager.removeCoins(item.price);
      this.inventoryManager.addItem(item.id, 1);
      
      // Show success feedback
      this.showPurchaseSuccess(item);
      
      // Refresh display
      this.refreshModal();
    }
  }
  
  private showPurchaseSuccess(item: any): void {
    // Could add a toast notification here
    console.log(`Purchased ${item.name}!`);
  }
  
  private refreshModal(): void {
    if (this.modalElement) {
      const oldContent = this.modalElement.querySelector('div:nth-child(3)');
      if (oldContent) {
        const newContent = this.render().querySelector('div:nth-child(3)');
        if (newContent) {
          oldContent.replaceWith(newContent);
        }
      }
    }
  }
}
