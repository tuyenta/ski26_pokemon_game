import { CollectionManager } from '@systems/CollectionManager';
import { BaseModal } from '../BaseModal';

export class PokedexModal extends BaseModal {
  private collectionManager: CollectionManager;
  private filterType: string = 'all';
  private filterRarity: string = 'all';
  private searchQuery: string = '';
  
  constructor() {
    super();
    this.collectionManager = new CollectionManager();
  }
  
  public render(): HTMLElement {
    const modal = this.createModalContainer('pokedex-modal');
    const closeButton = this.createCloseButton();
    const header = this.createHeader('POKÉDEX', '📖');
    
    const content = document.createElement('div');
    content.style.cssText = 'padding: 20px; color: white; max-height: 500px; overflow-y: auto;';
    
    // Stats summary
    const stats = this.collectionManager.getStats();
    const statsDiv = document.createElement('div');
    statsDiv.style.cssText = 'display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px;';
    statsDiv.innerHTML = `
      <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; text-align: center;">
        <div style="font-size: 24px; font-weight: bold;">${stats.totalCaught}</div>
        <div style="font-size: 12px; opacity: 0.8;">Caught</div>
      </div>
      <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; text-align: center;">
        <div style="font-size: 24px; font-weight: bold;">${stats.totalSeen}</div>
        <div style="font-size: 12px; opacity: 0.8;">Seen</div>
      </div>
      <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; text-align: center;">
        <div style="font-size: 24px; font-weight: bold;">${stats.shinyCount}</div>
        <div style="font-size: 12px; opacity: 0.8;">✨ Shiny</div>
      </div>
      <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; text-align: center;">
        <div style="font-size: 24px; font-weight: bold;">${stats.legendaryCount}</div>
        <div style="font-size: 12px; opacity: 0.8;">🌟 Legendary</div>
      </div>
    `;
    
    // Search and filters
    const filtersDiv = document.createElement('div');
    filtersDiv.style.cssText = 'margin-bottom: 20px;';
    filtersDiv.innerHTML = `
      <input type="text" id="pokedex-search" placeholder="Search Pokémon..." 
        style="width: 100%; padding: 10px; border-radius: 8px; border: none; margin-bottom: 10px; background: rgba(255,255,255,0.9);">
      <div style="display: flex; gap: 10px;">
        <select id="type-filter" style="flex: 1; padding: 8px; border-radius: 8px; border: none;">
          <option value="all">All Types</option>
          <option value="normal">Normal</option>
          <option value="fire">Fire</option>
          <option value="water">Water</option>
          <option value="grass">Grass</option>
          <option value="electric">Electric</option>
          <option value="ice">Ice</option>
          <option value="fighting">Fighting</option>
          <option value="poison">Poison</option>
          <option value="ground">Ground</option>
          <option value="flying">Flying</option>
          <option value="psychic">Psychic</option>
          <option value="bug">Bug</option>
          <option value="rock">Rock</option>
          <option value="ghost">Ghost</option>
          <option value="dragon">Dragon</option>
          <option value="dark">Dark</option>
          <option value="steel">Steel</option>
          <option value="fairy">Fairy</option>
        </select>
        <select id="rarity-filter" style="flex: 1; padding: 8px; border-radius: 8px; border: none;">
          <option value="all">All Rarities</option>
          <option value="common">Common</option>
          <option value="uncommon">Uncommon</option>
          <option value="rare">Rare</option>
          <option value="epic">Epic</option>
          <option value="legendary">Legendary</option>
        </select>
      </div>
    `;
    
    // Pokemon list
    const listDiv = document.createElement('div');
    listDiv.id = 'pokedex-list';
    listDiv.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 15px;';
    
    content.appendChild(statsDiv);
    content.appendChild(filtersDiv);
    content.appendChild(listDiv);
    
    modal.appendChild(closeButton);
    modal.appendChild(header);
    modal.appendChild(content);
    
    // Event listeners
    setTimeout(() => {
      const searchInput = document.getElementById('pokedex-search') as HTMLInputElement;
      const typeFilter = document.getElementById('type-filter') as HTMLSelectElement;
      const rarityFilter = document.getElementById('rarity-filter') as HTMLSelectElement;
      
      searchInput?.addEventListener('input', (e) => {
        this.searchQuery = (e.target as HTMLInputElement).value.toLowerCase();
        this.updatePokemonList();
      });
      
      typeFilter?.addEventListener('change', (e) => {
        this.filterType = (e.target as HTMLSelectElement).value;
        this.updatePokemonList();
      });
      
      rarityFilter?.addEventListener('change', (e) => {
        this.filterRarity = (e.target as HTMLSelectElement).value;
        this.updatePokemonList();
      });
      
      this.updatePokemonList();
    }, 100);
    
    return modal;
  }
  
  private updatePokemonList(): void {
    const listDiv = document.getElementById('pokedex-list');
    if (!listDiv) return;
    
    const collection = this.collectionManager.getCollection();
    let filtered = Object.values(collection);
    
    // Apply filters
    if (this.filterType !== 'all') {
      filtered = filtered.filter(p => p.types?.includes(this.filterType));
    }
    if (this.filterRarity !== 'all') {
      filtered = filtered.filter(p => p.rarity === this.filterRarity);
    }
    if (this.searchQuery) {
      filtered = filtered.filter(p => p.name.toLowerCase().includes(this.searchQuery));
    }
    
    // Sort by ID
    filtered.sort((a, b) => a.id - b.id);
    
    // Render
    listDiv.innerHTML = filtered.map(pokemon => `
      <div style="background: linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05)); 
        padding: 15px; border-radius: 12px; text-align: center; cursor: pointer; transition: transform 0.2s;"
        onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
        <div style="font-size: 40px; margin-bottom: 8px;">${pokemon.isShiny ? '✨' : ''}${pokemon.emoji || '❓'}</div>
        <div style="font-weight: bold; font-size: 14px; margin-bottom: 4px;">#${pokemon.id} ${pokemon.name}</div>
        <div style="font-size: 11px; opacity: 0.8;">
          ${pokemon.types?.map(t => `<span style="background: rgba(255,255,255,0.2); padding: 2px 6px; border-radius: 4px; margin: 0 2px;">${t}</span>`).join('') || ''}
        </div>
        <div style="font-size: 10px; opacity: 0.7; margin-top: 4px;">CP: ${pokemon.cp || 0} | Caught: ${pokemon.count || 0}x</div>
      </div>
    `).join('');
  }
}

export class BattleModal extends BaseModal {
  private battleManager: any;
  private selectedPokemon: any = null;
  private opponentPokemon: any = null;
  private playerHP: number = 100;
  private opponentHP: number = 100;
  
  public render(): HTMLElement {
    const modal = this.createModalContainer('battle-modal', 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)');
    const closeButton = this.createCloseButton();
    const header = this.createHeader('BATTLE ARENA', '⚔️');
    
    const content = document.createElement('div');
    content.style.cssText = 'padding: 20px; color: white;';
    
    // Battle setup or active battle
    if (!this.selectedPokemon) {
      // Check if user has any Pokemon in collection
      const collectionManager = new CollectionManager();
      const hasCollection = Object.keys(collectionManager.getCollection()).length > 0;
      
      content.innerHTML = `
        <div style="text-align: center; padding: 40px;">
          <h3 style="margin-bottom: 10px;">Select Your Pokémon</h3>
          ${!hasCollection ? '<p style="font-size: 14px; opacity: 0.8; margin-bottom: 20px;">🎮 Practice with starter Pokémon!</p>' : ''}
          <div id="battle-pokemon-list" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 15px; max-height: 400px; overflow-y: auto; padding: 10px;"></div>
        </div>
      `;
      
      modal.appendChild(closeButton);
      modal.appendChild(header);
      modal.appendChild(content);
      
      setTimeout(() => this.renderPokemonSelection(), 100);
    } else {
      // Active battle UI
      content.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
          <!-- Player Pokemon -->
          <div style="text-align: center;">
            <div style="font-size: 60px; margin-bottom: 10px;">${this.selectedPokemon.emoji}</div>
            <div style="font-weight: bold;">${this.selectedPokemon.name}</div>
            <div style="background: rgba(255,255,255,0.2); border-radius: 10px; padding: 10px; margin-top: 10px;">
              <div style="font-size: 12px; opacity: 0.8; margin-bottom: 5px;">HP</div>
              <div style="background: rgba(0,0,0,0.3); border-radius: 5px; height: 20px; overflow: hidden;">
                <div id="player-hp-bar" style="background: linear-gradient(90deg, #4ade80, #22c55e); height: 100%; width: ${this.playerHP}%; transition: width 0.3s;"></div>
              </div>
              <div style="font-size: 12px; margin-top: 5px;">${this.playerHP}/100</div>
            </div>
          </div>
          
          <!-- Opponent Pokemon -->
          <div style="text-align: center;">
            <div style="font-size: 60px; margin-bottom: 10px;">${this.opponentPokemon.emoji}</div>
            <div style="font-weight: bold;">${this.opponentPokemon.name}</div>
            <div style="background: rgba(255,255,255,0.2); border-radius: 10px; padding: 10px; margin-top: 10px;">
              <div style="font-size: 12px; opacity: 0.8; margin-bottom: 5px;">HP</div>
              <div style="background: rgba(0,0,0,0.3); border-radius: 5px; height: 20px; overflow: hidden;">
                <div id="opponent-hp-bar" style="background: linear-gradient(90deg, #ef4444, #dc2626); height: 100%; width: ${this.opponentHP}%; transition: width 0.3s;"></div>
              </div>
              <div style="font-size: 12px; margin-top: 5px;">${this.opponentHP}/100</div>
            </div>
          </div>
        </div>
        
        <!-- Battle log -->
        <div id="battle-log" style="background: rgba(0,0,0,0.3); border-radius: 10px; padding: 15px; min-height: 80px; margin-bottom: 20px; font-size: 14px;">
          <div style="opacity: 0.8;">Battle started! Choose your move...</div>
        </div>
        
        <!-- Action buttons -->
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
          <button id="attack-btn" style="background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 15px; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">
            ⚔️ Attack
          </button>
          <button id="defend-btn" style="background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; padding: 15px; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">
            🛡️ Defend
          </button>
          <button id="special-btn" style="background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; padding: 15px; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">
            ✨ Special Move
          </button>
          <button id="run-btn" style="background: linear-gradient(135deg, #64748b, #475569); color: white; padding: 15px; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">
            🏃 Run Away
          </button>
        </div>
      `;
      
      modal.appendChild(closeButton);
      modal.appendChild(header);
      modal.appendChild(content);
      
      setTimeout(() => this.attachBattleListeners(), 100);
    }
    
    return modal;
  }
  
  private renderPokemonSelection(): void {
    const listDiv = document.getElementById('battle-pokemon-list');
    if (!listDiv) return;
    
    const collectionManager = new CollectionManager();
    let collection = Object.values(collectionManager.getCollection());
    
    // If collection is empty, provide starter Pokemon for battle practice
    if (collection.length === 0) {
      collection = [
        { id: 1, name: 'Bulbasaur', emoji: '🌱', types: ['Grass', 'Poison'], cp: 500, count: 1, isShiny: false },
        { id: 4, name: 'Charmander', emoji: '🔥', types: ['Fire'], cp: 520, count: 1, isShiny: false },
        { id: 7, name: 'Squirtle', emoji: '💧', types: ['Water'], cp: 480, count: 1, isShiny: false },
        { id: 25, name: 'Pikachu', emoji: '⚡', types: ['Electric'], cp: 450, count: 1, isShiny: false },
        { id: 133, name: 'Eevee', emoji: '🦊', types: ['Normal'], cp: 440, count: 1, isShiny: false },
        { id: 152, name: 'Chikorita', emoji: '🍃', types: ['Grass'], cp: 460, count: 1, isShiny: false }
      ] as any[];
    }
    
    // Show message if there are many Pokemon
    if (collection.length > 12) {
      const countMsg = document.createElement('p');
      countMsg.style.cssText = 'font-size: 14px; opacity: 0.8; margin-bottom: 15px; text-align: center;';
      countMsg.textContent = `${collection.length} Pokémon available - scroll to see all`;
      listDiv.parentElement?.insertBefore(countMsg, listDiv);
    }
    
    listDiv.innerHTML = collection.map(pokemon => `
      <div class="battle-select-pokemon" data-pokemon='${JSON.stringify(pokemon)}' 
        style="background: linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05)); 
               padding: 15px; 
               border-radius: 12px; 
               text-align: center; 
               cursor: pointer; 
               transition: all 0.3s;
               border: 2px solid ${pokemon.isShiny ? 'gold' : 'rgba(255,255,255,0.1)'};
               ${pokemon.isShiny ? 'box-shadow: 0 0 15px rgba(255, 215, 0, 0.5);' : ''}"
        onmouseover="this.style.transform='translateY(-5px) scale(1.05)'; this.style.background='rgba(255,255,255,0.25)'" 
        onmouseout="this.style.transform='translateY(0) scale(1)'; this.style.background='linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))'">
        <div style="font-size: 50px; margin-bottom: 8px;">${pokemon.isShiny ? '✨' : ''}${pokemon.emoji}</div>
        <div style="font-weight: bold; font-size: 14px; margin-bottom: 4px;">${pokemon.name}</div>
        <div style="font-size: 10px; opacity: 0.7; margin-bottom: 5px;">
          ${pokemon.types?.map((t: string) => `<span style="background: rgba(255,255,255,0.25); padding: 2px 6px; border-radius: 8px; margin: 0 2px;">${t}</span>`).join('') || ''}
        </div>
        <div style="font-size: 11px; opacity: 0.8; margin-top: 4px;">
          <div style="background: rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 6px; display: inline-block;">
            ⚡ CP: ${pokemon.cp || 0}
          </div>
        </div>
      </div>
    `).join('');
    
    // Attach click listeners
    document.querySelectorAll('.battle-select-pokemon').forEach(elem => {
      elem.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const pokemonData = target.getAttribute('data-pokemon');
        if (pokemonData) {
          this.selectedPokemon = JSON.parse(pokemonData);
          this.opponentPokemon = collection[Math.floor(Math.random() * collection.length)];
          this.playerHP = 100;
          this.opponentHP = 100;
          
          // Re-render with battle UI
          const modalContainer = document.getElementById('battle-modal');
          if (modalContainer) {
            modalContainer.innerHTML = '';
            const newContent = this.render();
            modalContainer.parentElement?.replaceChild(newContent, modalContainer);
          }
        }
      });
    });
  }
  
  private attachBattleListeners(): void {
    const attackBtn = document.getElementById('attack-btn');
    const defendBtn = document.getElementById('defend-btn');
    const specialBtn = document.getElementById('special-btn');
    const runBtn = document.getElementById('run-btn');
    const battleLog = document.getElementById('battle-log');
    
    attackBtn?.addEventListener('click', () => {
      if (this.playerHP <= 0 || this.opponentHP <= 0) return;
      const damage = Math.floor(Math.random() * 30) + 15;
      this.opponentHP = Math.max(0, this.opponentHP - damage);
      this.updateBattleLog(`${this.selectedPokemon.name} attacks! Deals ${damage} damage!`);
      this.updateHPBars();
      
      if (this.opponentHP <= 0) {
        this.endBattle(true);
      } else {
        this.opponentTurn();
      }
    });
    
    defendBtn?.addEventListener('click', () => {
      if (this.playerHP <= 0 || this.opponentHP <= 0) return;
      this.updateBattleLog(`${this.selectedPokemon.name} takes a defensive stance!`);
      this.opponentTurn(0.5); // Reduced damage
    });
    
    specialBtn?.addEventListener('click', () => {
      if (this.playerHP <= 0 || this.opponentHP <= 0) return;
      const damage = Math.floor(Math.random() * 50) + 30;
      this.opponentHP = Math.max(0, this.opponentHP - damage);
      this.updateBattleLog(`${this.selectedPokemon.name} uses a special move! Deals ${damage} damage!`);
      this.updateHPBars();
      
      if (this.opponentHP <= 0) {
        this.endBattle(true);
      } else {
        this.opponentTurn();
      }
    });
    
    runBtn?.addEventListener('click', () => {
      this.updateBattleLog('You ran away from the battle!');
      setTimeout(() => this.close(), 1000);
    });
  }
  
  private opponentTurn(damageMultiplier: number = 1): void {
    if (this.opponentHP <= 0 || this.playerHP <= 0) return;
    
    setTimeout(() => {
      const damage = Math.floor(Math.random() * 25 * damageMultiplier) + 10;
      this.playerHP = Math.max(0, this.playerHP - damage);
      this.updateBattleLog(`${this.opponentPokemon.name} attacks! Deals ${damage} damage!`);
      this.updateHPBars();
      
      if (this.playerHP <= 0) {
        this.endBattle(false);
      }
    }, 1000);
  }
  
  private endBattle(victory: boolean): void {
    // Disable all action buttons
    const buttons = ['attack-btn', 'defend-btn', 'special-btn', 'run-btn'];
    buttons.forEach(id => {
      const btn = document.getElementById(id);
      if (btn) {
        (btn as HTMLButtonElement).disabled = true;
        btn.style.opacity = '0.5';
        btn.style.cursor = 'not-allowed';
      }
    });
    
    // Show victory/defeat message with rewards
    setTimeout(() => {
      const battleLog = document.getElementById('battle-log');
      if (battleLog) {
        if (victory) {
          const coins = Math.floor(Math.random() * 100) + 50;
          const exp = Math.floor(Math.random() * 50) + 25;
          battleLog.innerHTML = `
            <div style="text-align: center;">
              <div style="font-size: 24px; margin-bottom: 10px;">🎉 VICTORY! 🎉</div>
              <div style="opacity: 0.9; margin-bottom: 15px;">${this.opponentPokemon.name} fainted!</div>
              <div style="background: rgba(255,255,255,0.1); border-radius: 8px; padding: 10px; margin-bottom: 15px;">
                <div style="font-size: 14px; margin: 5px 0;">💰 Earned ${coins} coins</div>
                <div style="font-size: 14px; margin: 5px 0;">⭐ Gained ${exp} EXP</div>
              </div>
              <div style="display: flex; gap: 10px; justify-content: center;">
                <button id="rematch-btn" style="background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold;">⚔️ New Battle</button>
                <button id="back-selection-btn" style="background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold;">🔙 Back</button>
              </div>
            </div>
          `;
        } else {
          battleLog.innerHTML = `
            <div style="text-align: center;">
              <div style="font-size: 24px; margin-bottom: 10px;">💀 DEFEAT 💀</div>
              <div style="opacity: 0.9; margin-bottom: 15px;">${this.selectedPokemon.name} fainted!</div>
              <div style="opacity: 0.8; margin-bottom: 15px;">Better luck next time!</div>
              <div style="display: flex; gap: 10px; justify-content: center;">
                <button id="rematch-btn" style="background: linear-gradient(135deg, #ef4444, #dc2626); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold;">🔄 Try Again</button>
                <button id="back-selection-btn" style="background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold;">🔙 Back</button>
              </div>
            </div>
          `;
        }
        
        // Attach end battle button listeners
        setTimeout(() => {
          document.getElementById('rematch-btn')?.addEventListener('click', () => {
            this.selectedPokemon = null;
            this.opponentPokemon = null;
            const modalContainer = document.getElementById('battle-modal');
            if (modalContainer) {
              modalContainer.innerHTML = '';
              const newContent = this.render();
              modalContainer.parentElement?.replaceChild(newContent, modalContainer);
            }
          });
          
          document.getElementById('back-selection-btn')?.addEventListener('click', () => {
            this.close();
          });
        }, 100);
      }
    }, 500);
  }
  
  private updateBattleLog(message: string): void {
    const battleLog = document.getElementById('battle-log');
    if (battleLog) {
      battleLog.innerHTML = `<div style="opacity: 0.9;">${message}</div>`;
    }
  }
  
  private updateHPBars(): void {
    const playerBar = document.getElementById('player-hp-bar');
    const opponentBar = document.getElementById('opponent-hp-bar');
    if (playerBar) playerBar.style.width = `${this.playerHP}%`;
    if (opponentBar) opponentBar.style.width = `${this.opponentHP}%`;
  }
}

export class LeaderboardModal extends BaseModal {
  private collectionManager: CollectionManager;
  private trainerManager: any;
  
  constructor() {
    super();
    this.collectionManager = new CollectionManager();
  }
  
  public render(): HTMLElement {
    const modal = this.createModalContainer('leaderboard-modal');
    const closeButton = this.createCloseButton();
    const header = this.createHeader('LEADERBOARD', '🏆');
    
    const content = document.createElement('div');
    content.style.cssText = 'padding: 20px; color: white;';
    
    // Tab navigation
    content.innerHTML = `
      <div style="display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 2px solid rgba(255,255,255,0.2); padding-bottom: 10px;">
        <button class="leaderboard-tab" data-tab="collection" style="background: rgba(255,255,255,0.3); color: white; border: none; padding: 10px 20px; border-radius: 8px 8px 0 0; cursor: pointer; font-weight: bold;">
          📚 Collection
        </button>
        <button class="leaderboard-tab" data-tab="achievements" style="background: rgba(255,255,255,0.1); color: white; border: none; padding: 10px 20px; border-radius: 8px 8px 0 0; cursor: pointer;">
          🏅 Achievements
        </button>
        <button class="leaderboard-tab" data-tab="badges" style="background: rgba(255,255,255,0.1); color: white; border: none; padding: 10px 20px; border-radius: 8px 8px 0 0; cursor: pointer;">
          🎖️ Badges
        </button>
      </div>
      
      <div id="leaderboard-content" style="max-height: 400px; overflow-y: auto;"></div>
    `;
    
    modal.appendChild(closeButton);
    modal.appendChild(header);
    modal.appendChild(content);
    
    setTimeout(() => {
      this.attachTabListeners();
      this.showCollectionLeaderboard();
    }, 100);
    
    return modal;
  }
  
  private attachTabListeners(): void {
    document.querySelectorAll('.leaderboard-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const tabName = target.getAttribute('data-tab');
        
        // Update active tab
        document.querySelectorAll('.leaderboard-tab').forEach(t => {
          (t as HTMLElement).style.background = 'rgba(255,255,255,0.1)';
        });
        target.style.background = 'rgba(255,255,255,0.3)';
        
        // Show content
        if (tabName === 'collection') this.showCollectionLeaderboard();
        else if (tabName === 'achievements') this.showAchievementsLeaderboard();
        else if (tabName === 'badges') this.showBadgesLeaderboard();
      });
    });
  }
  
  private showCollectionLeaderboard(): void {
    const contentDiv = document.getElementById('leaderboard-content');
    if (!contentDiv) return;
    
    // Check if user has any Pokemon
    const stats = this.collectionManager.getStats();
    const hasData = stats.totalCaught > 0;
    
    if (!hasData) {
      contentDiv.innerHTML = `
        <div style="text-align: center; padding: 60px 20px; color: white;">
          <div style="font-size: 80px; margin-bottom: 20px;">🏆</div>
          <h2 style="margin-bottom: 10px;">Leaderboard Coming Soon!</h2>
          <p style="opacity: 0.8; margin-bottom: 20px;">Start catching Pokémon to see your ranking!</p>
          <div style="background: rgba(255,255,255,0.1); border-radius: 12px; padding: 20px; max-width: 400px; margin: 0 auto;">
            <p style="font-size: 14px; opacity: 0.9; margin-bottom: 10px;">💡 <strong>How to rank up:</strong></p>
            <ul style="text-align: left; font-size: 13px; opacity: 0.8; padding-left: 20px; list-style: none;">
              <li style="margin: 8px 0;">⚪ Catch more Pokémon</li>
              <li style="margin: 8px 0;">✨ Find shiny variants</li>
              <li style="margin: 8px 0;">🌟 Capture legendary Pokémon</li>
              <li style="margin: 8px 0;">🔥 Maintain your daily streak</li>
            </ul>
          </div>
        </div>
      `;
      return;
    }
    
    // Mock leaderboard data (in real app, fetch from server)
    const players = [
      { rank: 1, name: 'You', caught: stats.totalCaught, shiny: stats.shinyCount, legendary: stats.legendaryCount, score: stats.totalCaught * 100 + stats.shinyCount * 500 + stats.legendaryCount * 1000 },
      { rank: 2, name: 'TrainerAsh', caught: Math.floor(stats.totalCaught * 1.2), shiny: stats.shinyCount + 3, legendary: stats.legendaryCount + 1, score: Math.floor(stats.totalCaught * 1.2) * 100 + (stats.shinyCount + 3) * 500 + (stats.legendaryCount + 1) * 1000 },
      { rank: 3, name: 'MistyWater', caught: Math.floor(stats.totalCaught * 1.1), shiny: stats.shinyCount + 2, legendary: stats.legendaryCount, score: Math.floor(stats.totalCaught * 1.1) * 100 + (stats.shinyCount + 2) * 500 + stats.legendaryCount * 1000 },
      { rank: 4, name: 'BrockRock', caught: Math.floor(stats.totalCaught * 0.9), shiny: stats.shinyCount + 1, legendary: stats.legendaryCount, score: Math.floor(stats.totalCaught * 0.9) * 100 + (stats.shinyCount + 1) * 500 + stats.legendaryCount * 1000 },
      { rank: 5, name: 'GaryOak', caught: Math.floor(stats.totalCaught * 0.8), shiny: stats.shinyCount, legendary: Math.max(0, stats.legendaryCount - 1), score: Math.floor(stats.totalCaught * 0.8) * 100 + stats.shinyCount * 500 + Math.max(0, stats.legendaryCount - 1) * 1000 },
    ];
    
    contentDiv.innerHTML = `
      <div style="background: rgba(255,255,255,0.05); border-radius: 10px; padding: 15px; margin-bottom: 15px;">
        <div style="font-size: 13px; opacity: 0.8; text-align: center;">
          🎯 Your Score: <strong>${players[0].score.toLocaleString()}</strong> points
        </div>
      </div>
      ${players.map(player => `
        <div style="background: ${player.rank === 1 ? 'linear-gradient(135deg, rgba(255,215,0,0.3), rgba(255,193,7,0.2))' : player.rank <= 3 ? 'linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))' : 'rgba(255,255,255,0.05)'}; 
          padding: 15px; 
          border-radius: 12px; 
          margin-bottom: 10px; 
          display: flex; 
          align-items: center; 
          justify-content: space-between;
          border: 2px solid ${player.rank === 1 ? 'rgba(255,215,0,0.5)' : 'rgba(255,255,255,0.1)'};
          transition: transform 0.2s;"
          onmouseover="this.style.transform='translateX(5px)'"
          onmouseout="this.style.transform='translateX(0)'">
          <div style="display: flex; align-items: center; gap: 15px; flex: 1;">
            <div style="font-size: 28px; font-weight: bold; min-width: 40px; text-align: center;">
              ${player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : player.rank === 3 ? '🥉' : `#${player.rank}`}
            </div>
            <div style="flex: 1;">
              <div style="font-weight: bold; font-size: 16px; margin-bottom: 4px;">
                ${player.name} ${player.rank === 1 ? '👑' : ''}
              </div>
              <div style="font-size: 11px; opacity: 0.8; display: flex; gap: 12px; flex-wrap: wrap;">
                <span>⚪ ${player.caught}</span>
                <span>✨ ${player.shiny}</span>
                <span>🌟 ${player.legendary}</span>
                <span style="background: rgba(255,255,255,0.1); padding: 2px 8px; border-radius: 8px;">🎯 ${player.score.toLocaleString()}</span>
              </div>
            </div>
          </div>
          <div style="font-size: 24px;">🏆</div>
        </div>
      `).join('')}
    `;
  }
  
  private showAchievementsLeaderboard(): void {
    const contentDiv = document.getElementById('leaderboard-content');
    if (!contentDiv) return;
    
    const achievements = this.collectionManager.getStats().achievements || [];
    const hasAchievements = achievements.length > 0;
    
    if (!hasAchievements) {
      contentDiv.innerHTML = `
        <div style="text-align: center; padding: 60px 20px; color: white;">
          <div style="font-size: 80px; margin-bottom: 20px;">🏅</div>
          <h2 style="margin-bottom: 10px;">No Achievements Yet!</h2>
          <p style="opacity: 0.8; margin-bottom: 20px;">Complete challenges to earn achievements!</p>
          <div style="background: rgba(255,255,255,0.1); border-radius: 12px; padding: 20px; max-width: 450px; margin: 0 auto;">
            <p style="font-size: 14px; opacity: 0.9; margin-bottom: 15px;">🎖️ <strong>Available Achievements:</strong></p>
            <div style="text-align: left; font-size: 12px; opacity: 0.8; display: grid; gap: 8px;">
              <div style="background: rgba(255,255,255,0.05); padding: 10px; border-radius: 8px;">
                <strong>First Catch</strong> - Catch your first Pokémon
              </div>
              <div style="background: rgba(255,255,255,0.05); padding: 10px; border-radius: 8px;">
                <strong>Shiny Hunter</strong> - Find your first shiny
              </div>
              <div style="background: rgba(255,255,255,0.05); padding: 10px; border-radius: 8px;">
                <strong>Battle Master</strong> - Win 10 battles
              </div>
              <div style="background: rgba(255,255,255,0.05); padding: 10px; border-radius: 8px;">
                <strong>Collector</strong> - Catch 50 Pokémon
              </div>
            </div>
          </div>
        </div>
      `;
      return;
    }
    
    const mockPlayers = [
      { name: 'You', achievements: achievements.length, points: achievements.length * 100 },
      { name: 'TrainerAsh', achievements: achievements.length + 5, points: (achievements.length + 5) * 100 },
      { name: 'MistyWater', achievements: achievements.length + 3, points: (achievements.length + 3) * 100 },
      { name: 'BrockRock', achievements: achievements.length + 1, points: (achievements.length + 1) * 100 },
      { name: 'GaryOak', achievements: Math.max(0, achievements.length - 1), points: Math.max(0, achievements.length - 1) * 100 },
    ].sort((a, b) => b.points - a.points).map((p, i) => ({ ...p, rank: i + 1 }));
    
    contentDiv.innerHTML = mockPlayers.map(player => `
      <div style="background: ${player.rank === 1 ? 'linear-gradient(135deg, rgba(255,215,0,0.3), rgba(255,193,7,0.2))' : player.rank <= 3 ? 'linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))' : 'rgba(255,255,255,0.05)'}; 
        padding: 15px; 
        border-radius: 12px; 
        margin-bottom: 10px; 
        display: flex; 
        align-items: center; 
        justify-content: space-between;
        border: 2px solid ${player.rank === 1 ? 'rgba(255,215,0,0.5)' : 'rgba(255,255,255,0.1)'};
        transition: transform 0.2s;"
        onmouseover="this.style.transform='translateX(5px)'"
        onmouseout="this.style.transform='translateX(0)'">
        <div style="display: flex; align-items: center; gap: 15px;">
          <div style="font-size: 28px; font-weight: bold; min-width: 40px; text-align: center;">
            ${player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : player.rank === 3 ? '🥉' : `#${player.rank}`}
          </div>
          <div>
            <div style="font-weight: bold; font-size: 16px; margin-bottom: 4px;">
              ${player.name} ${player.rank === 1 ? '👑' : ''}
            </div>
            <div style="font-size: 11px; opacity: 0.8;">
              🏅 ${player.achievements} Achievements | 
              <span style="background: rgba(255,255,255,0.1); padding: 2px 8px; border-radius: 8px;">
                🎯 ${player.points} Points
              </span>
            </div>
          </div>
        </div>
        <div style="font-size: 24px;">🏅</div>
      </div>
    `).join('');
  }
  
  private showBadgesLeaderboard(): void {
    const contentDiv = document.getElementById('leaderboard-content');
    if (!contentDiv) return;
    
    contentDiv.innerHTML = `
      <div style="text-align: center; padding: 60px 20px; color: white;">
        <div style="font-size: 80px; margin-bottom: 20px;">🎖️</div>
        <h2 style="margin-bottom: 10px;">Gym Badges Coming Soon!</h2>
        <p style="opacity: 0.8; margin-bottom: 20px;">Challenge gym leaders to earn badges!</p>
        <div style="background: rgba(255,255,255,0.1); border-radius: 12px; padding: 20px; max-width: 450px; margin: 0 auto;">
          <p style="font-size: 14px; opacity: 0.9; margin-bottom: 15px;">🏛️ <strong>Gym System Features:</strong></p>
          <div style="text-align: left; font-size: 12px; opacity: 0.8; display: grid; gap: 8px;">
            <div style="background: rgba(255,255,255,0.05); padding: 10px; border-radius: 8px; display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 24px;">🔥</span>
              <div><strong>Fire Gym</strong> - Master fire-type Pokémon</div>
            </div>
            <div style="background: rgba(255,255,255,0.05); padding: 10px; border-radius: 8px; display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 24px;">💧</span>
              <div><strong>Water Gym</strong> - Control the waves</div>
            </div>
            <div style="background: rgba(255,255,255,0.05); padding: 10px; border-radius: 8px; display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 24px;">⚡</span>
              <div><strong>Electric Gym</strong> - Harness lightning</div>
            </div>
            <div style="background: rgba(255,255,255,0.05); padding: 10px; border-radius: 8px; display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 24px;">🌱</span>
              <div><strong>Grass Gym</strong> - Nature's power</div>
            </div>
          </div>
          <p style="font-size: 11px; opacity: 0.6; margin-top: 15px; font-style: italic;">
            Collect all 8 gym badges to become a Pokémon Master!
          </p>
        </div>
      </div>
    `;
  }
}

export class TradingModal extends BaseModal {
  private collectionManager: CollectionManager;
  private selectedPokemon: any = null;
  
  constructor() {
    super();
    this.collectionManager = new CollectionManager();
  }
  
  public render(): HTMLElement {
    const modal = this.createModalContainer('trading-modal', 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)');
    const closeButton = this.createCloseButton();
    const header = this.createHeader('TRADING POST', '🔄');
    
    const content = document.createElement('div');
    content.style.cssText = 'padding: 20px; color: white;';
    
    content.innerHTML = `
      <div style="margin-bottom: 20px;">
        <h3 style="margin-bottom: 15px;">Your Pokémon</h3>
        <div id="trading-your-pokemon" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; max-height: 250px; overflow-y: auto;"></div>
      </div>
      
      ${this.selectedPokemon ? `
        <div style="background: rgba(255,255,255,0.1); border-radius: 15px; padding: 20px; margin-bottom: 20px; text-align: center;">
          <div style="font-size: 14px; opacity: 0.8; margin-bottom: 10px;">Selected for Trade</div>
          <div style="font-size: 60px; margin-bottom: 10px;">${this.selectedPokemon.emoji}</div>
          <div style="font-weight: bold; font-size: 18px;">${this.selectedPokemon.name}</div>
          <div style="font-size: 12px; opacity: 0.8; margin-top: 5px;">CP: ${this.selectedPokemon.cp || 0}</div>
          <button id="clear-selection" style="background: rgba(255,255,255,0.2); color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; margin-top: 10px;">
            Clear Selection
          </button>
        </div>
      ` : ''}
      
      <div>
        <h3 style="margin-bottom: 15px;">Available Trades</h3>
        <div id="trading-offers" style="max-height: 200px; overflow-y: auto;"></div>
      </div>
    `;
    
    modal.appendChild(closeButton);
    modal.appendChild(header);
    modal.appendChild(content);
    
    setTimeout(() => {
      this.renderYourPokemon();
      this.renderTradeOffers();
      this.attachTradingListeners();
    }, 100);
    
    return modal;
  }
  
  private renderYourPokemon(): void {
    const container = document.getElementById('trading-your-pokemon');
    if (!container) return;
    
    const collection = Object.values(this.collectionManager.getCollection()).slice(0, 12);
    
    container.innerHTML = collection.map(pokemon => `
      <div class="trade-pokemon-item" data-pokemon='${JSON.stringify(pokemon)}'
        style="background: rgba(255,255,255,0.1); padding: 12px; border-radius: 8px; text-align: center; cursor: pointer; transition: all 0.2s;"
        onmouseover="this.style.background='rgba(255,255,255,0.2)'" 
        onmouseout="this.style.background='rgba(255,255,255,0.1)'">
        <div style="font-size: 30px; margin-bottom: 5px;">${pokemon.emoji}</div>
        <div style="font-size: 11px; font-weight: bold;">${pokemon.name}</div>
        <div style="font-size: 10px; opacity: 0.7;">CP: ${pokemon.cp || 0}</div>
      </div>
    `).join('');
  }
  
  private renderTradeOffers(): void {
    const container = document.getElementById('trading-offers');
    if (!container) return;
    
    // Mock trade offers
    const offers = [
      { id: 1, trainer: 'TrainerAsh', offering: { name: 'Charizard', emoji: '🔥', cp: 2500 }, wants: 'Legendary' },
      { id: 2, trainer: 'MistyWater', offering: { name: 'Gyarados', emoji: '🐉', cp: 2200 }, wants: 'Dragon type' },
      { id: 3, trainer: 'BrockRock', offering: { name: 'Onix', emoji: '🪨', cp: 1800 }, wants: 'Any shiny' },
    ];
    
    container.innerHTML = offers.map(offer => `
      <div style="background: rgba(255,255,255,0.08); padding: 15px; border-radius: 10px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; gap: 15px; align-items: center;">
          <div style="font-size: 40px;">${offer.offering.emoji}</div>
          <div>
            <div style="font-weight: bold;">${offer.trainer} offers:</div>
            <div style="font-size: 14px;">${offer.offering.name} (CP: ${offer.offering.cp})</div>
            <div style="font-size: 12px; opacity: 0.7; margin-top: 4px;">Wants: ${offer.wants}</div>
          </div>
        </div>
        <button class="trade-accept-btn" data-offer-id="${offer.id}"
          style="background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold;"
          ${!this.selectedPokemon ? 'disabled' : ''}>
          ${this.selectedPokemon ? 'Trade' : 'Select Pokémon'}
        </button>
      </div>
    `).join('');
  }
  
  private attachTradingListeners(): void {
    document.querySelectorAll('.trade-pokemon-item').forEach(elem => {
      elem.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const pokemonData = target.getAttribute('data-pokemon');
        if (pokemonData) {
          this.selectedPokemon = JSON.parse(pokemonData);
          // Re-render to show selection
          const modalContainer = document.getElementById('trading-modal');
          if (modalContainer) {
            modalContainer.innerHTML = '';
            const newContent = this.render();
            modalContainer.parentElement?.replaceChild(newContent, modalContainer);
          }
        }
      });
    });
    
    document.getElementById('clear-selection')?.addEventListener('click', () => {
      this.selectedPokemon = null;
      const modalContainer = document.getElementById('trading-modal');
      if (modalContainer) {
        modalContainer.innerHTML = '';
        const newContent = this.render();
        modalContainer.parentElement?.replaceChild(newContent, modalContainer);
      }
    });
    
    document.querySelectorAll('.trade-accept-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        alert('Trade completed! 🎉 (In real app, this would process the trade)');
        this.selectedPokemon = null;
        this.close();
      });
    });
  }
}

export class TeamModal extends BaseModal {
  private collectionManager: CollectionManager;
  private team: any[] = [];
  
  constructor() {
    super();
    this.collectionManager = new CollectionManager();
    this.loadTeam();
  }
  
  private loadTeam(): void {
    // Load team from storage or use first 6 Pokemon
    const collection = Object.values(this.collectionManager.getCollection());
    this.team = collection.slice(0, 6);
  }
  
  public render(): HTMLElement {
    const modal = this.createModalContainer('team-modal', 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)');
    const closeButton = this.createCloseButton();
    const header = this.createHeader('MY TEAM', '👥');
    
    const content = document.createElement('div');
    content.style.cssText = 'padding: 20px; color: white;';
    
    // Team stats
    const totalCP = this.team.reduce((sum, p) => sum + (p.cp || 0), 0);
    const avgCP = this.team.length > 0 ? Math.floor(totalCP / this.team.length) : 0;
    
    content.innerHTML = `
      <div style="background: rgba(255,255,255,0.1); border-radius: 12px; padding: 15px; margin-bottom: 20px;">
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; text-align: center;">
          <div>
            <div style="font-size: 24px; font-weight: bold;">${this.team.length}/6</div>
            <div style="font-size: 12px; opacity: 0.8;">Team Size</div>
          </div>
          <div>
            <div style="font-size: 24px; font-weight: bold;">${totalCP}</div>
            <div style="font-size: 12px; opacity: 0.8;">Total CP</div>
          </div>
          <div>
            <div style="font-size: 24px; font-weight: bold;">${avgCP}</div>
            <div style="font-size: 12px; opacity: 0.8;">Average CP</div>
          </div>
        </div>
      </div>
      
      <h3 style="margin-bottom: 15px;">Active Team</h3>
      <div id="team-slots" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px;">
        ${[0, 1, 2, 3, 4, 5].map(i => {
          const pokemon = this.team[i];
          if (pokemon) {
            return `
              <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 12px; text-align: center;">
                <div style="font-size: 50px; margin-bottom: 8px;">${pokemon.emoji}</div>
                <div style="font-weight: bold; font-size: 14px;">${pokemon.name}</div>
                <div style="font-size: 12px; opacity: 0.8; margin-top: 4px;">CP: ${pokemon.cp || 0}</div>
                <div style="font-size: 10px; opacity: 0.7; margin-top: 4px;">
                  ${pokemon.types?.map((t: string) => `<span style="background: rgba(255,255,255,0.2); padding: 2px 6px; border-radius: 4px; margin: 0 2px;">${t}</span>`).join('') || ''}
                </div>
                <div style="margin-top: 10px; display: flex; gap: 5px; justify-content: center;">
                  <button class="team-buddy-btn" data-index="${i}" style="background: rgba(255,255,255,0.2); color: white; border: none; padding: 5px 10px; border-radius: 6px; cursor: pointer; font-size: 11px;">Set Buddy</button>
                  <button class="team-remove-btn" data-index="${i}" style="background: rgba(239,68,68,0.5); color: white; border: none; padding: 5px 10px; border-radius: 6px; cursor: pointer; font-size: 11px;">Remove</button>
                </div>
              </div>
            `;
          } else {
            return `
              <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 12px; text-align: center; border: 2px dashed rgba(255,255,255,0.3);">
                <div style="font-size: 40px; opacity: 0.3; margin-bottom: 8px;">➕</div>
                <div style="font-size: 12px; opacity: 0.5;">Empty Slot</div>
                <button class="team-add-btn" data-index="${i}" style="background: rgba(255,255,255,0.2); color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; margin-top: 10px; font-size: 11px;">Add Pokémon</button>
              </div>
            `;
          }
        }).join('')}
      </div>
      
      <div id="team-selection" style="display: none;">
        <h3 style="margin-bottom: 15px;">Select Pokémon</h3>
        <div id="team-pokemon-list" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; max-height: 250px; overflow-y: auto;"></div>
      </div>
    `;
    
    modal.appendChild(closeButton);
    modal.appendChild(header);
    modal.appendChild(content);
    
    setTimeout(() => this.attachTeamListeners(), 100);
    
    return modal;
  }
  
  private attachTeamListeners(): void {
    let selectedSlot = -1;
    
    document.querySelectorAll('.team-add-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        selectedSlot = parseInt(target.getAttribute('data-index') || '-1');
        this.showPokemonSelection();
      });
    });
    
    document.querySelectorAll('.team-remove-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const index = parseInt(target.getAttribute('data-index') || '-1');
        if (index >= 0) {
          this.team[index] = null;
          this.team = this.team.filter(p => p !== null);
          this.rerender();
        }
      });
    });
    
    document.querySelectorAll('.team-buddy-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const index = parseInt(target.getAttribute('data-index') || '-1');
        if (index >= 0 && this.team[index]) {
          alert(`${this.team[index].name} is now your buddy! 🎉`);
        }
      });
    });
  }
  
  private showPokemonSelection(): void {
    const selectionDiv = document.getElementById('team-selection');
    const listDiv = document.getElementById('team-pokemon-list');
    if (!selectionDiv || !listDiv) return;
    
    selectionDiv.style.display = 'block';
    
    const collection = Object.values(this.collectionManager.getCollection());
    const available = collection.filter(p => !this.team.some(t => t?.id === p.id));
    
    listDiv.innerHTML = available.slice(0, 20).map(pokemon => `
      <div class="team-select-pokemon" data-pokemon='${JSON.stringify(pokemon)}'
        style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; text-align: center; cursor: pointer; transition: all 0.2s;"
        onmouseover="this.style.background='rgba(255,255,255,0.2)'" 
        onmouseout="this.style.background='rgba(255,255,255,0.1)'">
        <div style="font-size: 35px; margin-bottom: 5px;">${pokemon.emoji}</div>
        <div style="font-size: 11px; font-weight: bold;">${pokemon.name}</div>
        <div style="font-size: 10px; opacity: 0.7;">CP: ${pokemon.cp || 0}</div>
      </div>
    `).join('');
    
    document.querySelectorAll('.team-select-pokemon').forEach(elem => {
      elem.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const pokemonData = target.getAttribute('data-pokemon');
        if (pokemonData) {
          const pokemon = JSON.parse(pokemonData);
          if (this.team.length < 6) {
            this.team.push(pokemon);
          }
          this.rerender();
        }
      });
    });
  }
  
  private rerender(): void {
    const modalContainer = document.getElementById('team-modal');
    if (modalContainer) {
      modalContainer.innerHTML = '';
      const newContent = this.render();
      modalContainer.parentElement?.replaceChild(newContent, modalContainer);
    }
  }
}

export class BreedingModal extends BaseModal {
  private breedingSystem: any;
  private collectionManager: CollectionManager;
  
  constructor() {
    super();
    this.collectionManager = new CollectionManager();
  }
  
  public render(): HTMLElement {
    const modal = this.createModalContainer('breeding-modal', 'linear-gradient(135deg, #FA8BFF 0%, #2BD2FF 90%)');
    const closeButton = this.createCloseButton();
    const header = this.createHeader('BREEDING CENTER', '🥚');
    
    const content = document.createElement('div');
    content.style.cssText = 'padding: 20px; color: white;';
    
    // Mock eggs data
    const mockEggs = [
      { id: 1, steps: 350, maxSteps: 1000, parent1: 'Pikachu', parent2: 'Raichu' },
      { id: 2, steps: 750, maxSteps: 2000, parent1: 'Charmander', parent2: 'Charmeleon' },
      { id: 3, steps: 120, maxSteps: 500, parent1: 'Bulbasaur', parent2: 'Ivysaur' },
    ];
    
    content.innerHTML = `
      <div style="background: rgba(255,255,255,0.1); border-radius: 12px; padding: 20px; margin-bottom: 20px;">
        <h3 style="margin-bottom: 15px;">🥚 Incubating Eggs</h3>
        <div id="eggs-list" style="display: grid; gap: 15px;">
          ${mockEggs.map(egg => {
            const progress = (egg.steps / egg.maxSteps) * 100;
            return `
              <div style="background: rgba(255,255,255,0.1); border-radius: 10px; padding: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                  <div>
                    <div style="font-size: 30px;">🥚</div>
                    <div style="font-size: 12px; opacity: 0.8; margin-top: 5px;">${egg.parent1} × ${egg.parent2}</div>
                  </div>
                  <div style="text-align: right;">
                    <div style="font-weight: bold;">${egg.steps} / ${egg.maxSteps}</div>
                    <div style="font-size: 12px; opacity: 0.8;">steps</div>
                  </div>
                </div>
                <div style="background: rgba(0,0,0,0.3); border-radius: 8px; height: 12px; overflow: hidden;">
                  <div style="background: linear-gradient(90deg, #FA8BFF, #2BD2FF); height: 100%; width: ${progress}%; transition: width 0.3s;"></div>
                </div>
                <div style="font-size: 11px; opacity: 0.7; margin-top: 5px; text-align: center;">
                  ${Math.floor(progress)}% complete
                </div>
              </div>
            `;
          }).join('')}
        </div>
        ${mockEggs.length === 0 ? '<div style="text-align: center; opacity: 0.7; padding: 20px;">No eggs incubating</div>' : ''}
      </div>
      
      <div style="background: rgba(255,255,255,0.1); border-radius: 12px; padding: 20px; margin-bottom: 20px;">
        <h3 style="margin-bottom: 15px;">👥 Breed New Egg</h3>
        <div style="display: grid; grid-template-columns: 1fr auto 1fr; gap: 15px; align-items: center; margin-bottom: 15px;">
          <div style="background: rgba(255,255,255,0.05); border: 2px dashed rgba(255,255,255,0.3); border-radius: 10px; padding: 20px; text-align: center; min-height: 120px; display: flex; flex-direction: column; justify-content: center; cursor: pointer;"
            onclick="alert('Select from your collection')">
            <div style="font-size: 40px; opacity: 0.3;">➕</div>
            <div style="font-size: 12px; opacity: 0.5; margin-top: 5px;">Select Parent 1</div>
          </div>
          <div style="font-size: 30px;">❤️</div>
          <div style="background: rgba(255,255,255,0.05); border: 2px dashed rgba(255,255,255,0.3); border-radius: 10px; padding: 20px; text-align: center; min-height: 120px; display: flex; flex-direction: column; justify-content: center; cursor: pointer;"
            onclick="alert('Select from your collection')">
            <div style="font-size: 40px; opacity: 0.3;">➕</div>
            <div style="font-size: 12px; opacity: 0.5; margin-top: 5px;">Select Parent 2</div>
          </div>
        </div>
        <button style="width: 100%; background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; padding: 15px; border-radius: 10px; cursor: pointer; font-weight: bold; font-size: 16px;"
          onclick="alert('Breeding feature - Select two compatible Pokémon to create an egg.')">
          🥚 Start Breeding
        </button>
      </div>
      
      <div style="background: rgba(255,255,255,0.1); border-radius: 12px; padding: 20px;">
        <h3 style="margin-bottom: 15px;">⚙️ Incubator Upgrades</h3>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
          <div style="background: rgba(255,255,255,0.05); border-radius: 8px; padding: 15px; text-align: center;">
            <div style="font-size: 24px; margin-bottom: 5px;">🔥</div>
            <div style="font-weight: bold; margin-bottom: 5px;">Speed Boost</div>
            <div style="font-size: 12px; opacity: 0.8; margin-bottom: 10px;">2x hatching speed</div>
            <button style="background: rgba(255,255,255,0.2); color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 12px;">
              500 coins
            </button>
          </div>
          <div style="background: rgba(255,255,255,0.05); border-radius: 8px; padding: 15px; text-align: center;">
            <div style="font-size: 24px; margin-bottom: 5px;">✨</div>
            <div style="font-weight: bold; margin-bottom: 5px;">Shiny Boost</div>
            <div style="font-size: 12px; opacity: 0.8; margin-bottom: 10px;">+10% shiny chance</div>
            <button style="background: rgba(255,255,255,0.2); color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 12px;">
              1000 coins
            </button>
          </div>
          <div style="background: rgba(255,255,255,0.05); border-radius: 8px; padding: 15px; text-align: center;">
            <div style="font-size: 24px; margin-bottom: 5px;">🎯</div>
            <div style="font-weight: bold; margin-bottom: 5px;">More Slots</div>
            <div style="font-size: 12px; opacity: 0.8; margin-bottom: 10px;">+2 egg slots</div>
            <button style="background: rgba(255,255,255,0.2); color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 12px;">
              750 coins
            </button>
          </div>
          <div style="background: rgba(255,255,255,0.05); border-radius: 8px; padding: 15px; text-align: center;">
            <div style="font-size: 24px; margin-bottom: 5px;">💡</div>
            <div style="font-weight: bold; margin-bottom: 5px;">Auto-Walk</div>
            <div style="font-size: 12px; opacity: 0.8; margin-bottom: 10px;">Passive steps gain</div>
            <button style="background: rgba(255,255,255,0.2); color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 12px;">
              2000 coins
            </button>
          </div>
        </div>
      </div>
    `;
    
    modal.appendChild(closeButton);
    modal.appendChild(header);
    modal.appendChild(content);
    
    return modal;
  }
}

export class SettingsModal extends BaseModal {
  private settings: any;
  
  constructor() {
    super();
    this.loadSettings();
  }
  
  private loadSettings(): void {
    const saved = localStorage.getItem('gameSettings');
    this.settings = saved ? JSON.parse(saved) : {
      soundEnabled: true,
      musicEnabled: true,
      vibrationEnabled: true,
      notificationsEnabled: true,
      language: 'en',
      showTutorial: true,
      autoSave: true,
    };
  }
  
  private saveSettings(): void {
    localStorage.setItem('gameSettings', JSON.stringify(this.settings));
  }
  
  public render(): HTMLElement {
    const modal = this.createModalContainer('settings-modal');
    const closeButton = this.createCloseButton();
    const header = this.createHeader('SETTINGS', '⚙️');
    
    const content = document.createElement('div');
    content.style.cssText = 'padding: 20px; color: white; max-height: 500px; overflow-y: auto;';
    
    content.innerHTML = `
      <div style="background: rgba(255,255,255,0.1); border-radius: 12px; padding: 20px; margin-bottom: 15px;">
        <h3 style="margin-bottom: 15px;">🔊 Audio</h3>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>Sound Effects</span>
            <input type="checkbox" id="sound-toggle" ${this.settings.soundEnabled ? 'checked' : ''} style="width: 20px; height: 20px;">
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>Background Music</span>
            <input type="checkbox" id="music-toggle" ${this.settings.musicEnabled ? 'checked' : ''} style="width: 20px; height: 20px;">
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>Vibration</span>
            <input type="checkbox" id="vibration-toggle" ${this.settings.vibrationEnabled ? 'checked' : ''} style="width: 20px; height: 20px;">
          </div>
        </div>
      </div>
      
      <div style="background: rgba(255,255,255,0.1); border-radius: 12px; padding: 20px; margin-bottom: 15px;">
        <h3 style="margin-bottom: 15px;">🔔 Notifications</h3>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div>Push Notifications</div>
            <div style="font-size: 12px; opacity: 0.7;">Get alerts about nearby Pokémon</div>
          </div>
          <input type="checkbox" id="notifications-toggle" ${this.settings.notificationsEnabled ? 'checked' : ''} style="width: 20px; height: 20px;">
        </div>
      </div>
      
      <div style="background: rgba(255,255,255,0.1); border-radius: 12px; padding: 20px; margin-bottom: 15px;">
        <h3 style="margin-bottom: 15px;">🌍 Language</h3>
        <select id="language-select" style="width: 100%; padding: 12px; border-radius: 8px; border: none; background: rgba(255,255,255,0.9); font-size: 14px;">
          <option value="en" ${this.settings.language === 'en' ? 'selected' : ''}>English</option>
          <option value="es" ${this.settings.language === 'es' ? 'selected' : ''}>Español</option>
          <option value="fr" ${this.settings.language === 'fr' ? 'selected' : ''}>Français</option>
          <option value="de" ${this.settings.language === 'de' ? 'selected' : ''}>Deutsch</option>
          <option value="ja" ${this.settings.language === 'ja' ? 'selected' : ''}>日本語</option>
          <option value="ko" ${this.settings.language === 'ko' ? 'selected' : ''}>한국어</option>
        </select>
      </div>
      
      <div style="background: rgba(255,255,255,0.1); border-radius: 12px; padding: 20px; margin-bottom: 15px;">
        <h3 style="margin-bottom: 15px;">🎮 Game</h3>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div>Show Tutorial</div>
              <div style="font-size: 12px; opacity: 0.7;">Display hints for new features</div>
            </div>
            <input type="checkbox" id="tutorial-toggle" ${this.settings.showTutorial ? 'checked' : ''} style="width: 20px; height: 20px;">
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div>Auto-Save</div>
              <div style="font-size: 12px; opacity: 0.7;">Automatically save progress</div>
            </div>
            <input type="checkbox" id="autosave-toggle" ${this.settings.autoSave ? 'checked' : ''} style="width: 20px; height: 20px;">
          </div>
        </div>
      </div>
      
      <div style="background: rgba(255,255,255,0.1); border-radius: 12px; padding: 20px;">
        <h3 style="margin-bottom: 15px;">💾 Data</h3>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <button id="export-data-btn" style="background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer; font-weight: bold;">
            📥 Export Save Data
          </button>
          <button id="import-data-btn" style="background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer; font-weight: bold;">
            📤 Import Save Data
          </button>
          <button id="clear-data-btn" style="background: linear-gradient(135deg, #ef4444, #dc2626); color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer; font-weight: bold;">
            🗑️ Clear All Data
          </button>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.2);">
        <div style="font-size: 12px; opacity: 0.7;">Pokémon AR Game</div>
        <div style="font-size: 12px; opacity: 0.7; margin-top: 5px;">Version 1.0.0</div>
      </div>
    `;
    
    modal.appendChild(closeButton);
    modal.appendChild(header);
    modal.appendChild(content);
    
    setTimeout(() => this.attachSettingsListeners(), 100);
    
    return modal;
  }
  
  private attachSettingsListeners(): void {
    document.getElementById('sound-toggle')?.addEventListener('change', (e) => {
      this.settings.soundEnabled = (e.target as HTMLInputElement).checked;
      this.saveSettings();
    });
    
    document.getElementById('music-toggle')?.addEventListener('change', (e) => {
      this.settings.musicEnabled = (e.target as HTMLInputElement).checked;
      this.saveSettings();
    });
    
    document.getElementById('vibration-toggle')?.addEventListener('change', (e) => {
      this.settings.vibrationEnabled = (e.target as HTMLInputElement).checked;
      this.saveSettings();
    });
    
    document.getElementById('notifications-toggle')?.addEventListener('change', (e) => {
      this.settings.notificationsEnabled = (e.target as HTMLInputElement).checked;
      this.saveSettings();
    });
    
    document.getElementById('tutorial-toggle')?.addEventListener('change', (e) => {
      this.settings.showTutorial = (e.target as HTMLInputElement).checked;
      this.saveSettings();
    });
    
    document.getElementById('autosave-toggle')?.addEventListener('change', (e) => {
      this.settings.autoSave = (e.target as HTMLInputElement).checked;
      this.saveSettings();
    });
    
    document.getElementById('language-select')?.addEventListener('change', (e) => {
      this.settings.language = (e.target as HTMLSelectElement).value;
      this.saveSettings();
      alert('Language changed! Restart the app for full effect.');
    });
    
    document.getElementById('export-data-btn')?.addEventListener('click', () => {
      const allData: any = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) allData[key] = localStorage.getItem(key);
      }
      const dataStr = JSON.stringify(allData, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pokemon-save-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });
    
    document.getElementById('import-data-btn')?.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            try {
              const data = JSON.parse(event.target?.result as string);
              Object.keys(data).forEach(key => {
                localStorage.setItem(key, data[key]);
              });
              alert('Data imported successfully! Refresh the page.');
            } catch (err) {
              alert('Error importing data. Please check the file format.');
            }
          };
          reader.readAsText(file);
        }
      };
      input.click();
    });
    
    document.getElementById('clear-data-btn')?.addEventListener('click', () => {
      if (confirm('Are you sure? This will delete ALL your progress!')) {
        if (confirm('Really sure? This cannot be undone!')) {
          localStorage.clear();
          alert('All data cleared. Refreshing...');
          window.location.reload();
        }
      }
    });
  }
}
