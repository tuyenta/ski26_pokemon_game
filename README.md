# Pokemon AR Game - Modular Architecture

This is a modularized refactor of the Pokemon AR face-scanning game, splitting the ~6000 line monolithic HTML file into a maintainable TypeScript project.

## Project Structure

```
pokemon/
├── src/
│   ├── core/              # Core systems
│   │   ├── EventBus.ts    # Pub/sub event system
│   │   ├── events.ts      # Event types and payloads
│   │   └── StorageAdapter.ts  # localStorage abstraction
│   ├── systems/           # Game systems (25+ classes)
│   │   ├── CollectionManager.ts  ✅ Complete
│   │   ├── TrainerProfile.ts     🚧 TODO
│   │   ├── InventoryManager.ts   🚧 TODO
│   │   ├── BattleSystem.ts       🚧 TODO
│   │   └── ... (22+ more)
│   ├── components/        # UI components
│   │   └── modals/       # Lazy-loaded modals
│   ├── utils/            # Utility functions
│   │   ├── coordinates.ts  # A-Frame coordinate transforms
│   │   ├── pokeapi.ts     # Pokemon API utilities
│   │   └── helpers.ts     # General helpers
│   ├── config/           # Configuration files
│   │   ├── ageGroups.ts   # Age-specific configs
│   │   ├── rarities.ts    # Rarity system & functions
│   │   └── i18n.ts        # Translations
│   ├── styles/           # CSS modules
│   └── main.ts           # Entry point orchestrator
├── public/               # Static assets
├── index.html            # Minimal HTML entry
├── package.json          # Dependencies
├── vite.config.js        # Vite configuration
├── tsconfig.json         # TypeScript configuration
└── pokemom_ai_game.html  # Original monolithic file
```

## Key Features

### ✅ Completed

1. **Project Infrastructure**
   - Vite build system with code-splitting
   - TypeScript configuration
   - Directory structure

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

5. **First System Module**
   - CollectionManager fully extracted and event-driven

### 🚧 Next Steps

1. **Extract Remaining System Classes** (Priority: High)
   - TrainerProfile (XP, levels, titles)
   - InventoryManager (items, coins)
   - QuestManager
   - BattleSystem
   - PVPBattleSystem
   - 20+ more systems...

2. **Extract UI Modals** (Priority: Medium)
   - Create ModalRegistry for lazy loading
   - Convert 20+ modal functions to components

3. **Create Main Entry Point** (Priority: High)
   - Build index.html with A-Frame scene
   - Create main.ts orchestrator
   - Wire up all systems via EventBus

4. **Extract CSS** (Priority: Low)
   - Split inline styles into modules
   - Organize by component

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

### Extracted ✅
- Project structure
- Event bus system
- Storage adapter
- Configuration files
- Utility functions
- CollectionManager system

### TODO 🚧
- 24 remaining system classes
- 20+ modal components
- Main entry point (index.html + main.ts)
- CSS extraction
- Face detection integration
- A-Frame scene setup
- Testing and validation

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

**Status**: 🚧 In Progress (20% complete)
**Next Priority**: Extract core game systems (TrainerProfile, InventoryManager, etc.)
