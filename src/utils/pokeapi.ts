/**
 * Pokemon API utilities
 */

const POKEAPI_BASE = 'https://pokeapi.co/api/v2';

export interface Pokemon {
  name: string;
  url: string;
}

export interface PokemonDetails {
  id: number;
  name: string;
  types: Array<{ type: { name: string } }>;
  abilities: Array<{ ability: { name: string } }>;
  height: number;
  weight: number;
  stats: Array<{ stat: { name: string }; base_stat: number }>;
}

/**
 * Fetch Pokemon list from PokeAPI
 */
export async function fetchPokemonList(limit: number = 1025): Promise<Pokemon[]> {
  const response = await fetch(`${POKEAPI_BASE}/pokemon?limit=${limit}`);
  const data = await response.json();
  return data.results;
}

/**
 * Fetch Pokemon details by ID or URL
 */
export async function fetchPokemonDetails(idOrUrl: number | string): Promise<PokemonDetails> {
  const url = typeof idOrUrl === 'number' ? `${POKEAPI_BASE}/pokemon/${idOrUrl}` : idOrUrl;
  const response = await fetch(url);
  return await response.json();
}

/**
 * Get Pokemon sprite URL
 */
export function getPokemonSpriteUrl(pokemonId: number, isShiny: boolean = false): string {
  if (isShiny) {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${pokemonId}.png`;
  }
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`;
}

/**
 * Get backup sprite URL
 */
export function getBackupSpriteUrl(pokemonId: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;
}

/**
 * Extract Pokemon ID from PokeAPI URL
 */
export function extractPokemonId(url: string): number {
  return parseInt(url.split('/').filter(Boolean).pop() || '0');
}
