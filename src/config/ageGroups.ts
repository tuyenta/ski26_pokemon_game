/**
 * Age-specific game configurations
 */

export interface AgeConfig {
  pokemonPool: [number, number];
  maxPokemon: number;
  displayStats: string[];
  fontSize: 'small' | 'medium' | 'large';
  scanCountdown: number;
  requiresNarration: boolean;
  showSimpleInfo: boolean;
  typeEmojis: Record<string, string> | null;
}

export const AGE_CONFIGS: Record<string, AgeConfig> = {
  '4-6': {
    pokemonPool: [1, 151],  // Gen 1 only (Kanto)
    maxPokemon: 151,
    displayStats: ['hp'],
    fontSize: 'large',
    scanCountdown: 5,
    requiresNarration: true,
    showSimpleInfo: true,
    typeEmojis: {
      'fire': '🔥', 'water': '💧', 'grass': '🌿',
      'electric': '⚡', 'normal': '⭐', 'ice': '❄️',
      'fighting': '👊', 'poison': '☠️', 'ground': '⛰️',
      'flying': '🦅', 'psychic': '🔮', 'bug': '🐛',
      'rock': '🪨', 'ghost': '👻', 'dragon': '🐉',
      'dark': '🌙', 'steel': '⚙️', 'fairy': '✨'
    }
  },
  '7-10': {
    pokemonPool: [1, 386],  // Gen 1-3
    maxPokemon: 386,
    displayStats: ['hp', 'attack', 'defense', 'speed'],
    fontSize: 'medium',
    scanCountdown: 3,
    requiresNarration: false,
    showSimpleInfo: false,
    typeEmojis: null
  },
  'mixed': {
    pokemonPool: [1, 1025],  // All Pokemon
    maxPokemon: 1025,
    displayStats: ['hp', 'attack', 'defense', 'speed'],
    fontSize: 'medium',
    scanCountdown: 3,
    requiresNarration: false,
    showSimpleInfo: false,
    typeEmojis: null
  }
};
