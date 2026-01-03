import { EventBus } from '../../core/EventBus';
import { GameEvent } from '../../core/events';
import { QuestManager } from '../../systems/QuestManager';
import { BaseModal } from '../BaseModal';

export class QuestsModal extends BaseModal {
  private questManager: QuestManager;
  private eventBus: EventBus;
  
  constructor() {
    super();
    this.questManager = new QuestManager();
    this.eventBus = EventBus.getInstance();
  }
  
  public render(): HTMLElement {
    const modal = this.createModalContainer('quests-modal', 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)');
    const closeButton = this.createCloseButton();
    const header = this.createHeader('ACTIVE QUESTS', '📜');
    
    const content = document.createElement('div');
    content.id = 'quests-content';
    content.style.cssText = `
      max-width: 800px;
      margin: 0 auto;
      color: white;
    `;
    
    const activeQuests = this.questManager.getActiveQuests();
    
    activeQuests.forEach(quest => {
      const questCard = this.createQuestCard(quest);
      content.appendChild(questCard);
    });
    
    modal.appendChild(closeButton);
    modal.appendChild(header);
    modal.appendChild(content);
    
    // Subscribe to quest updates
    this.setupEventListeners();
    
    return modal;
  }
  
  private createQuestCard(quest: any): HTMLElement {
    const card = document.createElement('div');
    card.style.cssText = `
      background: rgba(255,255,255,0.15);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 15px;
      backdrop-filter: blur(10px);
    `;
    
    const progress = Math.min((quest.progress / quest.target) * 100, 100);
    const isComplete = quest.progress >= quest.target;
    
    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <h3 style="margin: 0; font-size: 20px;">${quest.title}</h3>
        <span style="font-size: 24px;">${isComplete ? '✅' : '⏳'}</span>
      </div>
      <p style="margin: 10px 0; opacity: 0.9; font-size: 14px;">${quest.desc}</p>
      <div style="background: rgba(0,0,0,0.3); border-radius: 20px; height: 24px; overflow: hidden; margin: 10px 0;">
        <div style="
          background: linear-gradient(90deg, #4CAF50, #8BC34A);
          height: 100%;
          width: ${progress}%;
          transition: width 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
        ">
          ${quest.progress} / ${quest.target}
        </div>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
        <span style="font-size: 14px; opacity: 0.8;">Reward: ${quest.reward} coins</span>
        <span style="font-size: 14px; font-weight: bold;">${Math.floor(progress)}%</span>
      </div>
    `;
    
    return card;
  }
  
  private setupEventListeners(): void {
    this.eventBus.on(GameEvent.QUEST_PROGRESS_UPDATED, () => {
      if (this.isOpen) {
        this.refreshQuests();
      }
    });
  }
  
  private refreshQuests(): void {
    const content = this.modalElement?.querySelector('#quests-content');
    if (content) {
      content.innerHTML = '';
      const activeQuests = this.questManager.getActiveQuests();
      activeQuests.forEach(quest => {
        const questCard = this.createQuestCard(quest);
        content.appendChild(questCard);
      });
    }
  }
  
  protected async onShow(): Promise<void> {
    this.refreshQuests();
  }
}
