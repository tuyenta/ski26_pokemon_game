/**
 * Modal Registry - Manages lazy loading of modal components
 * Implements code-splitting for modals using dynamic imports
 */

export type ModalId = 
  | 'collection'
  | 'pokedex'
  | 'quests'
  | 'inventory'
  | 'battle'
  | 'leaderboard'
  | 'trainer'
  | 'shop'
  | 'trading'
  | 'team'
  | 'breeding'
  | 'settings';

export interface Modal {
  show(): Promise<void>;
  hide(): void;
  render(): HTMLElement;
}

export class ModalRegistry {
  private static instance: ModalRegistry;
  private loadedModals: Map<ModalId, Modal>;
  private currentModal: ModalId | null;
  
  private constructor() {
    this.loadedModals = new Map();
    this.currentModal = null;
  }
  
  public static getInstance(): ModalRegistry {
    if (!ModalRegistry.instance) {
      ModalRegistry.instance = new ModalRegistry();
    }
    return ModalRegistry.instance;
  }
  
  /**
   * Open a modal by ID - lazy loads if not already loaded
   */
  public async openModal(modalId: ModalId): Promise<void> {
    // Close current modal if any
    if (this.currentModal) {
      this.closeModal(this.currentModal);
    }
    
    // Load modal if not already loaded
    if (!this.loadedModals.has(modalId)) {
      await this.loadModal(modalId);
    }
    
    const modal = this.loadedModals.get(modalId);
    if (modal) {
      await modal.show();
      this.currentModal = modalId;
    }
  }
  
  /**
   * Close a specific modal
   */
  public closeModal(modalId: ModalId): void {
    const modal = this.loadedModals.get(modalId);
    if (modal) {
      modal.hide();
      if (this.currentModal === modalId) {
        this.currentModal = null;
      }
    }
  }
  
  /**
   * Close any open modal
   */
  public closeCurrentModal(): void {
    if (this.currentModal) {
      this.closeModal(this.currentModal);
    }
  }
  
  /**
   * Dynamically import and instantiate a modal
   */
  private async loadModal(modalId: ModalId): Promise<void> {
    try {
      let ModalClass;
      
      switch (modalId) {
        case 'collection':
          ModalClass = (await import('./modals/CollectionModal')).CollectionModal;
          break;
        case 'quests':
          ModalClass = (await import('./modals/QuestsModal')).QuestsModal;
          break;
        case 'inventory':
          ModalClass = (await import('./modals/InventoryModal')).InventoryModal;
          break;
        case 'trainer':
          ModalClass = (await import('./modals/TrainerModal')).TrainerModal;
          break;
        case 'shop':
          ModalClass = (await import('./modals/ShopModal')).ShopModal;
          break;
        // Stub modals - all in one file
        case 'pokedex':
          ModalClass = (await import('./modals/StubModals')).PokedexModal;
          break;
        case 'battle':
          ModalClass = (await import('./modals/StubModals')).BattleModal;
          break;
        case 'leaderboard':
          ModalClass = (await import('./modals/StubModals')).LeaderboardModal;
          break;
        case 'trading':
          ModalClass = (await import('./modals/StubModals')).TradingModal;
          break;
        case 'team':
          ModalClass = (await import('./modals/StubModals')).TeamModal;
          break;
        case 'breeding':
          ModalClass = (await import('./modals/StubModals')).BreedingModal;
          break;
        case 'settings':
          ModalClass = (await import('./modals/StubModals')).SettingsModal;
          break;
        default:
          throw new Error(`Unknown modal ID: ${modalId}`);
      }
      
      const modalInstance = new ModalClass();
      this.loadedModals.set(modalId, modalInstance);
    } catch (error) {
      console.error(`Failed to load modal ${modalId}:`, error);
      throw error;
    }
  }
  
  /**
   * Preload specific modals for faster access
   */
  public async preloadModals(modalIds: ModalId[]): Promise<void> {
    const promises = modalIds.map(id => this.loadModal(id));
    await Promise.all(promises);
  }
  
  /**
   * Get currently open modal ID
   */
  public getCurrentModal(): ModalId | null {
    return this.currentModal;
  }
  
  /**
   * Check if a modal is loaded
   */
  public isLoaded(modalId: ModalId): boolean {
    return this.loadedModals.has(modalId);
  }
}
