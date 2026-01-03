/**
 * Event types for the Pokemon AR Game
 * Used by EventBus for type-safe pub/sub communication
 */

export enum GameEvent {
  // Pokemon events
  POKEMON_CAUGHT = 'pokemon:caught',
  POKEMON_SCANNED = 'pokemon:scanned',
  SHINY_FOUND = 'shiny:found',
  LUCKY_FOUND = 'lucky:found',
  
  // Trainer events
  XP_GAINED = 'trainer:xp_gained',
  LEVEL_UP = 'trainer:level_up',
  TITLE_UPDATED = 'trainer:title_updated',
  NAME_CHANGED = 'trainer:name_changed',
  
  // Quest events
  QUEST_PROGRESS = 'quest:progress',
  QUEST_COMPLETED = 'quest:completed',
  
  // Achievement events
  ACHIEVEMENT_UNLOCKED = 'achievement:unlocked',
  BADGE_EARNED = 'badge:earned',
  
  // Inventory events
  ITEM_ACQUIRED = 'inventory:item_acquired',
  ITEM_USED = 'inventory:item_used',
  COINS_CHANGED = 'inventory:coins_changed',
  
  // Battle events
  BATTLE_STARTED = 'battle:started',
  BATTLE_WON = 'battle:won',
  BATTLE_LOST = 'battle:lost',
  
  // Team events
  TEAM_UPDATED = 'team:updated',
  POKEMON_ADDED_TO_TEAM = 'team:pokemon_added',
  POKEMON_REMOVED_FROM_TEAM = 'team:pokemon_removed',
  
  // Breeding events
  EGG_HATCHED = 'breeding:egg_hatched',
  BUDDY_CANDY_EARNED = 'breeding:buddy_candy',
  
  // Trading events
  TRADE_COMPLETED = 'trading:completed',
  
  // UI events
  MODAL_OPENED = 'ui:modal_opened',
  MODAL_CLOSED = 'ui:modal_closed',
  NOTIFICATION_SHOW = 'ui:notification_show',
  
  // Camera events
  CAMERA_STARTED = 'camera:started',
  CAMERA_STOPPED = 'camera:stopped',
  FACE_DETECTED = 'camera:face_detected',
  
  // Session events
  SESSION_STARTED = 'session:started',
  SESSION_ENDED = 'session:ended',
  
  // Weather/Time events
  WEATHER_CHANGED = 'weather:changed',
  TIME_CHANGED = 'time:changed',
  
  // Collection events
  COLLECTION_UPDATED = 'collection:updated',
  DAILY_CHALLENGE_COMPLETED = 'collection:daily_challenge_completed',
  STREAK_UPDATED = 'collection:streak_updated',
  
  // Additional events
  PROFILE_UPDATED = 'trainer:profile_updated',
  TITLE_EARNED = 'trainer:title_earned',
  INVENTORY_UPDATED = 'inventory:updated',
  QUEST_PROGRESS_UPDATED = 'quest:progress_updated',
  POKEMON_EVOLVED = 'pokemon:evolved',
  PHOTO_TAKEN = 'photo:taken',
  BADGE_CHECK_REQUESTED = 'badge:check_requested',
  POKEMON_FUSED = 'pokemon:fused',
  LEGENDARY_CAUGHT = 'pokemon:legendary_caught'
}

export interface EventPayloads {
  [GameEvent.POKEMON_CAUGHT]: {
    id: number;
    name: string;
    type: string;
    isShiny: boolean;
    isNew: boolean;
    isLegendary?: boolean;
  };
  [GameEvent.POKEMON_SCANNED]: {
    id: number;
    faceIndex: number;
  };
  [GameEvent.SHINY_FOUND]: {
    id: number;
    name: string;
  };
  [GameEvent.LUCKY_FOUND]: {
    id: number;
    name: string;
  };
  [GameEvent.XP_GAINED]: {
    amount: number;
    source: string;
  };
  [GameEvent.LEVEL_UP]: {
    newLevel: number;
    rewards: any[];
  };
  [GameEvent.TITLE_UPDATED]: {
    oldTitle: string;
    newTitle: string;
  };
  [GameEvent.NAME_CHANGED]: {
    oldName: string;
    newName: string;
  };
  [GameEvent.QUEST_PROGRESS]: {
    questId: string;
    progress: number;
    target: number;
  };
  [GameEvent.QUEST_COMPLETED]: {
    questId: string;
    rewards: any;
  };
  [GameEvent.ACHIEVEMENT_UNLOCKED]: {
    achievementId: string;
    name: string;
  };
  [GameEvent.BADGE_EARNED]: {
    badgeId: string;
    name: string;
  };
  [GameEvent.ITEM_ACQUIRED]: {
    itemId: string;
    quantity: number;
  };
  [GameEvent.ITEM_USED]: {
    itemId: string;
    quantity: number;
  };
  [GameEvent.COINS_CHANGED]: {
    amount: number;
    newTotal: number;
  };
  [GameEvent.BATTLE_STARTED]: {
    opponentName: string;
  };
  [GameEvent.BATTLE_WON]: {
    opponentName: string;
    rewards: any;
  };
  [GameEvent.BATTLE_LOST]: {
    opponentName: string;
  };
  [GameEvent.TEAM_UPDATED]: {
    team: any[];
  };
  [GameEvent.POKEMON_ADDED_TO_TEAM]: {
    pokemonId: number;
  };
  [GameEvent.POKEMON_REMOVED_FROM_TEAM]: {
    pokemonId: number;
  };
  [GameEvent.EGG_HATCHED]: {
    pokemonId: number;
    name: string;
  };
  [GameEvent.BUDDY_CANDY_EARNED]: {
    candies: number;
  };
  [GameEvent.TRADE_COMPLETED]: {
    given: number;
    received: number;
  };
  [GameEvent.MODAL_OPENED]: {
    modalId: string;
  };
  [GameEvent.MODAL_CLOSED]: {
    modalId: string;
  };
  [GameEvent.NOTIFICATION_SHOW]: {
    message: string;
    type: 'success' | 'info' | 'warning' | 'error';
  };
  [GameEvent.CAMERA_STARTED]: {};
  [GameEvent.CAMERA_STOPPED]: {};
  [GameEvent.FACE_DETECTED]: {
    count: number;
  };
  [GameEvent.SESSION_STARTED]: {};
  [GameEvent.SESSION_ENDED]: {
    duration: number;
  };
  [GameEvent.WEATHER_CHANGED]: {
    weather: string;
  };
  [GameEvent.TIME_CHANGED]: {
    time: 'morning' | 'day' | 'evening' | 'night';
  };
  [GameEvent.COLLECTION_UPDATED]: {
    totalCaught: number;
    completionPercent: number;
  };
  [GameEvent.DAILY_CHALLENGE_COMPLETED]: {
    challengeType: string;
    reward: string;
  };
  [GameEvent.STREAK_UPDATED]: {
    streak: number;
  };
  [GameEvent.PROFILE_UPDATED]: {
    profile: any;
  };
  [GameEvent.TITLE_EARNED]: {
    title: string;
  };
  [GameEvent.INVENTORY_UPDATED]: {
    items: any;
  };
  [GameEvent.QUEST_PROGRESS_UPDATED]: {
    activeQuests: any[];
  };
  [GameEvent.POKEMON_EVOLVED]: {
    pokemon: string;
  };
  [GameEvent.PHOTO_TAKEN]: {};
  [GameEvent.BADGE_CHECK_REQUESTED]: {};
  [GameEvent.POKEMON_FUSED]: {
    fusion: string;
    pokemon1: string;
    pokemon2: string;
  };
  [GameEvent.LEGENDARY_CAUGHT]: {
    id: number;
    name: string;
  };
}

export type EventCallback<T extends GameEvent> = (payload: EventPayloads[T]) => void;
