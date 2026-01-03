/**
 * Item emoji mapping utilities
 */

const ITEM_EMOJIS: Record<string, string> = {
  pokeball: '⚪',
  greatball: '🔵',
  ultraball: '🟡',
  potion: '🧪',
  superpotion: '💉',
  luckyegg: '🥚',
  rarecandy: '🍬',
  incense: '💨'
};

/**
 * Get emoji for an item
 */
export function getItemEmoji(itemName: string): string {
  return ITEM_EMOJIS[itemName] || '📦';
}

/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

/**
 * Format date to readable string
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString();
}

/**
 * Get time of day
 */
export function getTimeOfDay(): 'morning' | 'day' | 'evening' | 'night' {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'day';
  if (hour >= 18 && hour < 22) return 'evening';
  return 'night';
}

/**
 * Generate random ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
