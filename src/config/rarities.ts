/**
 * Pokemon rarity tiers configuration
 */

export interface RarityTier {
  ids: number[];
  chance: number;
  color: string;
  emoji: string;
}

export const RARITY_TIERS: Record<string, RarityTier> = {
  common: { 
    ids: [], 
    chance: 70, 
    color: '#CCCCCC', 
    emoji: '⚪' 
  },
  uncommon: { 
    ids: [], 
    chance: 20, 
    color: '#00FF00', 
    emoji: '🟢' 
  },
  rare: { 
    ids: [], 
    chance: 7, 
    color: '#0088FF', 
    emoji: '🔵' 
  },
  legendary: { 
    ids: [150, 151, 249, 250, 251, 382, 383, 384, 385, 386, 483, 484, 487, 491, 493, 494], 
    chance: 3, 
    color: '#FFD700', 
    emoji: '🌟' 
  }
};

/**
 * Check if Pokemon is legendary
 */
export function isLegendary(pokemonId: number): boolean {
  return RARITY_TIERS.legendary.ids.includes(pokemonId);
}

/**
 * Generate shiny Pokemon (1/512 chance, or 1/64 for legendaries)
 */
export function generateShinyChance(pokemonId: number): boolean {
  const baseChance = isLegendary(pokemonId) ? 64 : 512;
  return Math.random() < (1 / baseChance);
}

/**
 * Get Pokemon rarity tier
 */
export function getRarityTier(pokemonId: number): string {
  if (RARITY_TIERS.legendary.ids.includes(pokemonId)) return 'legendary';
  if (pokemonId >= 1 && pokemonId <= 151) return 'common';
  if (pokemonId >= 152 && pokemonId <= 251) return 'uncommon';
  if (pokemonId >= 252 && pokemonId <= 386) return 'rare';
  return 'common';
}
