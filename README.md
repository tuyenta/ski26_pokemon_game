# Pokemon AR Game - Modular Architecture

This is a modularized refactor of the Pokemon AR face-scanning game, splitting the ~6000 line monolithic HTML file into a maintainable TypeScript project.

## Project Structure

```
ski26_pokemon_game/
├── src/
│   ├── core/                    # Core systems
│   │   ├── EventBus.ts          # Pub/sub event system
│   │   ├── events.ts            # Event types and payloads
│   │   └── StorageAdapter.ts    # localStorage abstraction
│   ├── systems/                 # Game systems (19 classes) ✅
│   │   ├── ARFilterSystem.ts    # AR filter effects
│   │   ├── BattleSystem.ts      # Battle mechanics
│   │   ├── BreedingSystem.ts    # Pokemon breeding
│   │   ├── BuddySystem.ts       # Buddy Pokemon features
│   │   ├── CollectionManager.ts # Pokemon collection
│   │   ├── CustomizationSystem.ts # Player customization
│   │   ├── EventsSystem.ts      # In-game events
│   │   ├── FusionSystem.ts      # Pokemon fusion
│   │   ├── GymBadgeSystem.ts    # Gym badges & progression
│   │   ├── InventoryManager.ts  # Items & coins
│   │   ├── MiniGameManager.ts   # Mini-games
│   │   ├── PhotoCapture.ts      # AR photo capture
│   │   ├── QuestManager.ts      # Quest system
│   │   ├── ShopSystem.ts        # In-game shop
│   │   ├── SoundManager.ts      # Audio management
│   │   ├── TeamManager.ts       # Team management
│   │   ├── TradingSystem.ts     # Pokemon trading
│   │   ├── TrainerProfile.ts    # XP, levels, titles
│   │   └── WeatherTimeSystem.ts # Weather & time effects
│   ├── components/              # UI components
│   │   ├── BaseModal.ts         # Base modal class
│   │   ├── ModalRegistry.ts     # Modal lazy-loading registry
│   │   └── modals/              # Modal implementations
│   │       ├── CollectionModal.ts
│   │       ├── InventoryModal.ts
│   │       ├── QuestsModal.ts
│   │       ├── ShopModal.ts
│   │       ├── StubModals.ts    # Placeholder modals
│   │       └── TrainerModal.ts
│   ├── utils/                   # Utility functions
│   │   ├── coordinates.ts       # A-Frame coordinate transforms
│   │   ├── pokeapi.ts           # Pokemon API utilities
│   │   └── helpers.ts           # General helpers
│   ├── config/                  # Configuration files
│   │   ├── ageGroups.ts         # Age-specific configs
│   │   ├── rarities.ts          # Rarity system & functions
│   │   └── i18n.ts              # Translations
│   ├── styles/                  # CSS modules ✅
│   │   ├── aframe.css           # A-Frame specific styles
│   │   ├── base.css             # Base/reset styles
│   │   ├── components.css       # Component styles
│   │   └── modals.css           # Modal styles
│   └── main.ts                  # Entry point orchestrator ✅
├── index.html                   # HTML entry point
├── package.json                 # Dependencies
├── vite.config.js               # Vite configuration
├── tsconfig.json                # TypeScript configuration
├── ai_studio_code.js            # AI Studio integration
├── ai_studio_code.css           # AI Studio styles
├── pokemon-sw.js                # Service worker for PWA
├── pokemom_ai_game.html         # Original monolithic file
└── pokemom_ai_game_1.html       # Backup of original
```

## Key Features

### ✅ Completed

1. **Project Infrastructure**
   - Vite build system with code-splitting
   - TypeScript configuration (v5.3+)
   - Complete directory structure
   - Service worker for PWA support

2. **Core Systems**
   - EventBus for decoupled pub/sub communication
   - StorageAdapter for reactive localStorage
   - Comprehensive event types (40+ events)

3. **Configuration**
   - Age group configs (4-6, 7-10, mixed)
   - Rarity tiers and shiny chance logic
   - Translation system (i18n)

4. **Utilities**
   - Coordinate transformations
   - PokeAPI integration
   - Helper functions

5. **Game Systems (19 modules)**
   - CollectionManager - Pokemon collection & Pokedex
   - TrainerProfile - XP, levels, titles
   - InventoryManager - Items, coins, resources
   - QuestManager - Quest tracking & rewards
   - BattleSystem - Battle mechanics
   - BuddySystem - Buddy Pokemon features
   - BreedingSystem - Pokemon breeding
   - TradingSystem - Pokemon trading
   - TeamManager - Team management
   - GymBadgeSystem - Gym badges & progression
   - ShopSystem - In-game shop
   - SoundManager - Audio management
   - PhotoCapture - AR photo capture
   - WeatherTimeSystem - Weather & time effects
   - FusionSystem - Pokemon fusion
   - ARFilterSystem - AR filter effects
   - CustomizationSystem - Player customization
   - EventsSystem - In-game events
   - MiniGameManager - Mini-games

6. **UI Modals**
   - BaseModal class for consistent modal behavior
   - ModalRegistry for lazy-loading
   - CollectionModal, InventoryModal, QuestsModal
   - ShopModal, TrainerModal
   - StubModals for remaining placeholders

7. **CSS Extraction**
   - Base styles (reset, typography)
   - Component styles
   - Modal styles
   - A-Frame specific styles

8. **Main Entry Point**
   - main.ts orchestrator implemented
   - index.html with A-Frame scene

### 🚧 Remaining Work

1. **Complete Modal Implementations** (Priority: Medium)
   - Replace stub modals with full implementations
   - Add remaining modal types (Battle, Trading, etc.)

2. **Face Detection Integration** (Priority: High)
   - Integrate face-api.js or equivalent
   - Connect to A-Frame scene

3. **Testing & Validation** (Priority: High)
   - Unit tests for system modules
   - Integration testing
   - Browser compatibility testing

## Architecture Principles

### Event-Driven Communication

Systems communicate via EventBus instead of direct coupling:

```typescript
// Old (tightly coupled)
collectionManager.addPokemon(...);
trainerProfile.addXP(100);
questManager.update('catch');

// New (event-driven)
eventBus.emit(GameEvent.POKEMON_CAUGHT, {
  id: 25,
  name: 'Pikachu',
  type: 'electric',
  isShiny: false,
  isNew: true
});

// Other systems react independently
trainerProfile.on(GameEvent.POKEMON_CAUGHT, (payload) => {
  if (payload.isNew) this.addXP(100);
});

questManager.on(GameEvent.POKEMON_CAUGHT, (payload) => {
  this.updateProgress('catch_pokemon');
});
```

### Storage Abstraction

Storage operations emit events for reactive updates:

```typescript
// Setting storage automatically emits events
storage.set('collection', collectionData);
// Triggers: GameEvent.COLLECTION_UPDATED

// Other systems can subscribe
eventBus.on(GameEvent.COLLECTION_UPDATED, (payload) => {
  console.log(`Collection: ${payload.totalCaught} caught`);
});
```

### Code Splitting

Vite configuration splits code by feature for optimal loading:

- **core** - Always loaded (EventBus, Storage)
- **collection** - CollectionManager, TrainerProfile, Quests
- **battle** - Battle systems (PvE, PvP, Raids)
- **social** - Friends, Breeding, Teams
- **economy** - Shop, Inventory, Trading
- **modals** - Lazy-loaded UI components

## Development

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Migration Status

### Completed ✅
- Project structure & infrastructure
- Event bus system
- Storage adapter
- Configuration files (age groups, rarities, i18n)
- Utility functions
- **19 game system classes** - All core systems extracted
- Modal framework (BaseModal, ModalRegistry)
- 5 modal implementations + stub modals
- CSS extraction (4 stylesheet modules)
- Main entry point (index.html + main.ts)

### In Progress 🚧
- Replacing stub modals with full implementations
- Integrating face detection

### TODO 📋
- Face detection implementation
- Testing and validation
- Performance optimization
- PWA enhancements

## Event Types

See [src/core/events.ts](src/core/events.ts) for complete list of 40+ event types covering:

- Pokemon events (caught, scanned, shiny, lucky)
- Trainer events (XP, level up, title changes)
- Quest & achievement events
- Inventory & economy events
- Battle events (PvE, PvP, raids)
- Team & breeding events
- UI events (modals, notifications)
- Camera & session events

## Notes

- Original 6173-line HTML file preserved as reference
- Incremental migration approach - systems can be added one at a time
- TypeScript provides type safety for event payloads
- EventBus enables testing systems in isolation
- Code splitting reduces initial bundle size significantly

## Contributing

When extracting new systems:

1. Copy class from original HTML
2. Convert to TypeScript
3. Replace localStorage with `storage` adapter
4. Replace direct system calls with EventBus events
5. Add proper type definitions
6. Export as ES module
7. Update this README

---

**Status**: � In Progress (~80% complete)
**Next Priority**: Integrate face detection, replace stub modals, add tests
