import { CollectionManager } from '../../systems/CollectionManager';
import { GymBadgeSystem } from '../../systems/GymBadgeSystem';
import { TrainerProfile } from '../../systems/TrainerProfile';
import { BaseModal } from '../BaseModal';

export class TrainerModal extends BaseModal {
  private trainerProfile: TrainerProfile;
  private gymBadgeSystem: GymBadgeSystem;
  private collectionManager: CollectionManager;
  
  constructor() {
    super();
    this.trainerProfile = new TrainerProfile();
    this.gymBadgeSystem = new GymBadgeSystem();
    this.collectionManager = new CollectionManager();
  }
  
  public render(): HTMLElement {
    const modal = this.createModalContainer('trainer-modal', 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)');
    const closeButton = this.createCloseButton();
    
    const content = document.createElement('div');
    content.style.cssText = `
      max-width: 800px;
      margin: 0 auto;
      color: white;
      padding: 20px;
    `;
    
    const profile = this.trainerProfile.getProfile();
    const xpInfo = this.trainerProfile.getXP();
    const badges = this.gymBadgeSystem.getBadges();
    
    content.innerHTML = `
      <div style="text-align: center; margin-bottom: 40px;">
        <div style="font-size: 80px; margin-bottom: 20px;">${profile.avatar}</div>
        <h1 style="font-size: 48px; margin: 10px 0;">${profile.name}</h1>
        <h2 style="font-size: 24px; opacity: 0.8; margin: 10px 0;">${profile.title}</h2>
      </div>
      
      <div style="background: rgba(255,255,255,0.15); padding: 20px; border-radius: 12px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 15px 0; font-size: 20px;">📊 TRAINER STATS</h3>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
          <div>
            <div style="font-size: 14px; opacity: 0.8;">Level</div>
            <div style="font-size: 32px; font-weight: bold;">⭐ ${profile.level}</div>
          </div>
          <div>
            <div style="font-size: 14px; opacity: 0.8;">XP Progress</div>
            <div style="font-size: 24px; font-weight: bold;">${xpInfo.current} / ${xpInfo.required}</div>
          </div>
        </div>
        <div style="background: rgba(0,0,0,0.3); border-radius: 20px; height: 24px; overflow: hidden; margin-top: 15px;">
          <div style="
            background: linear-gradient(90deg, #4CAF50, #8BC34A);
            height: 100%;
            width: ${xpInfo.percentage}%;
            transition: width 0.3s;
          "></div>
        </div>
      </div>
      
      <div style="background: rgba(255,255,255,0.15); padding: 20px; border-radius: 12px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 15px 0; font-size: 20px;">🏆 GYM BADGES (${badges.length}/8)</h3>
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
          ${this.renderBadges()}
        </div>
      </div>
      
      <div style="background: rgba(255,255,255,0.15); padding: 20px; border-radius: 12px;">
        <h3 style="margin: 0 0 15px 0; font-size: 20px;">📅 MEMBER SINCE</h3>
        <div style="font-size: 18px;">${new Date(profile.joinDate).toLocaleDateString()}</div>
      </div>
    `;
    
    modal.appendChild(closeButton);
    modal.appendChild(content);
    
    return modal;
  }
  
  private renderBadges(): string {
    const allBadges = this.gymBadgeSystem.getAllGymLeaders();
    const earnedBadges = this.gymBadgeSystem.getBadges();
    
    return allBadges.map(badge => {
      const earned = earnedBadges.includes(badge.id);
      return `
        <div style="
          text-align: center;
          padding: 15px;
          background: rgba(255,255,255,${earned ? '0.2' : '0.05'});
          border-radius: 8px;
          ${earned ? '' : 'opacity: 0.4;'}
        ">
          <div style="font-size: 36px;">${badge.emoji}</div>
          <div style="font-size: 12px; margin-top: 5px;">${badge.name}</div>
        </div>
      `;
    }).join('');
  }
  
  protected async onShow(): Promise<void> {
    // Refresh profile data
  }
}
