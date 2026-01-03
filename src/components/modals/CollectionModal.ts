import { CollectionManager } from '../../systems/CollectionManager';
import { TrainerProfile } from '../../systems/TrainerProfile';
import { BaseModal } from '../BaseModal';

export class CollectionModal extends BaseModal {
  private collectionManager: CollectionManager;
  private trainerProfile: TrainerProfile;
  
  constructor() {
    super();
    this.collectionManager = new CollectionManager();
    this.trainerProfile = new TrainerProfile();
  }
  
  public render(): HTMLElement {
    const modal = this.createModalContainer('collection-modal');
    const closeButton = this.createCloseButton();
    const header = this.createHeader('MY COLLECTION', '📚');
    
    const content = document.createElement('div');
    content.style.cssText = `
      max-width: 1200px;
      margin: 0 auto;
      color: white;
    `;
    
    // Stats section
    const stats = this.createStatsSection();
    
    // Collection grid
    const grid = this.createCollectionGrid();
    
    content.appendChild(stats);
    content.appendChild(grid);
    
    modal.appendChild(closeButton);
    modal.appendChild(header);
    modal.appendChild(content);
    
    return modal;
  }
  
  private createStatsSection(): HTMLElement {
    const section = document.createElement('div');
    section.style.cssText = `
      background: rgba(255,255,255,0.1);
      padding: 20px;
      border-radius: 12px;
      margin-bottom: 20px;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
    `;
    
    const collectionSize = this.collectionManager.getCollectionSize();
    const completion = this.collectionManager.getCompletionPercent();
    const stats = this.collectionManager.getStats();
    
    const statItems = [
      { label: 'Caught', value: collectionSize, emoji: '⚪' },
      { label: 'Completion', value: `${completion}%`, emoji: '📊' },
      { label: 'Total Scans', value: stats.totalScans, emoji: '📸' },
      { label: 'Current Streak', value: `${stats.currentStreak} days`, emoji: '🔥' }
    ];
    
    statItems.forEach(item => {
      const statDiv = document.createElement('div');
      statDiv.style.textAlign = 'center';
      statDiv.innerHTML = `
        <div style="font-size: 32px;">${item.emoji}</div>
        <div style="font-size: 24px; font-weight: bold; margin: 5px 0;">${item.value}</div>
        <div style="font-size: 14px; opacity: 0.8;">${item.label}</div>
      `;
      section.appendChild(statDiv);
    });
    
    return section;
  }
  
  private createCollectionGrid(): HTMLElement {
    const container = document.createElement('div');
    
    const collection = this.collectionManager.getCollection();
    const sortedPokemon = Object.values(collection).sort((a, b) => a.id - b.id);
    
    // Handle empty collection
    if (sortedPokemon.length === 0) {
      container.style.cssText = `
        text-align: center;
        padding: 60px 20px;
        color: white;
      `;
      container.innerHTML = `
        <div style="font-size: 80px; margin-bottom: 20px;">📭</div>
        <h2 style="margin-bottom: 10px;">No Pokémon Yet!</h2>
        <p style="opacity: 0.8; margin-bottom: 30px;">Start the game to catch your first Pokémon!</p>
        <div style="background: rgba(255,255,255,0.1); border-radius: 12px; padding: 20px; max-width: 400px; margin: 0 auto;">
          <p style="font-size: 14px; opacity: 0.9;">💡 <strong>How to catch Pokémon:</strong></p>
          <ol style="text-align: left; font-size: 14px; opacity: 0.8; padding-left: 20px;">
            <li>Click "START GAME" on the home screen</li>
            <li>Allow camera access</li>
            <li>Look around and detect faces</li>
            <li>Pokémon will appear based on faces detected!</li>
          </ol>
        </div>
      `;
      return container;
    }
    
    container.style.cssText = `
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 15px;
      margin-top: 20px;
      max-height: 500px;
      overflow-y: auto;
      padding: 10px;
    `;
    
    sortedPokemon.forEach(pokemon => {
      const card = this.createPokemonCard(pokemon);
      container.appendChild(card);
    });
    
    return container;
  }
  
  private createPokemonCard(pokemon: any): HTMLElement {
    const card = document.createElement('div');
    card.style.cssText = `
      background: linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05));
      border-radius: 12px;
      padding: 15px;
      text-align: center;
      cursor: pointer;
      transition: transform 0.3s, background 0.3s;
      ${pokemon.isShiny ? 'box-shadow: 0 0 20px rgba(255, 215, 0, 0.8);' : ''}
      border: 2px solid ${pokemon.isShiny ? 'gold' : 'rgba(255,255,255,0.1)'};
    `;
    
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-5px) scale(1.05)';
      card.style.background = 'rgba(255,255,255,0.25)';
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0) scale(1)';
      card.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))';
    });
    
    // Use emoji if available, fallback to sprite URL
    const display = pokemon.emoji 
      ? `<div style="font-size: 80px; margin-bottom: 10px;">${pokemon.isShiny ? '✨' : ''}${pokemon.emoji}</div>`
      : `<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.isShiny ? 'shiny/' : ''}${pokemon.id}.png" 
           style="width: 100%; height: auto; image-rendering: pixelated;" 
           onerror="this.style.display='none'; this.parentElement.querySelector('.fallback-emoji').style.display='block';">
         <div class="fallback-emoji" style="font-size: 60px; display: none;">❓</div>`;
    
    const types = pokemon.types?.map((t: string) => 
      `<span style="background: rgba(255,255,255,0.3); padding: 3px 8px; border-radius: 12px; font-size: 10px; margin: 0 2px;">${t}</span>`
    ).join('') || '';
    
    card.innerHTML = `
      ${display}
      <div style="font-size: 16px; font-weight: bold; margin-bottom: 5px; color: ${pokemon.isShiny ? '#FFD700' : 'white'};">
        ${pokemon.name.toUpperCase()} ${pokemon.isShiny ? '✨' : ''}
      </div>
      <div style="font-size: 11px; opacity: 0.8; margin-bottom: 5px;">#${pokemon.id.toString().padStart(3, '0')}</div>
      <div style="margin: 8px 0;">${types}</div>
      <div style="font-size: 11px; opacity: 0.7;">
        CP: ${pokemon.cp || 0} | Caught: ${pokemon.count || pokemon.timesScanned || 1}x
      </div>
    `;
    
    return card;
  }
  
  protected async onShow(): Promise<void> {
    // Refresh data when modal is shown
    // Could add animations here
  }
}
