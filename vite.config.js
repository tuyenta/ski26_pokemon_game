import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@core': resolve(__dirname, './src/core'),
      '@systems': resolve(__dirname, './src/systems'),
      '@components': resolve(__dirname, './src/components'),
      '@utils': resolve(__dirname, './src/utils'),
      '@config': resolve(__dirname, './src/config')
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core systems - always loaded
          'core': [
            './src/core/EventBus.ts',
            './src/core/StorageAdapter.ts',
            './src/core/events.ts'
          ],
          // Collection & progression systems
          'collection': [
            './src/systems/CollectionManager.ts',
            './src/systems/TrainerProfile.ts',
            './src/systems/QuestManager.ts'
          ],
          // Battle systems
          'battle': [
            './src/systems/BattleSystem.ts',
            './src/systems/GymBadgeSystem.ts'
          ],
          // Social & breeding systems
          'social': [
            './src/systems/BreedingSystem.ts',
            './src/systems/TeamManager.ts',
            './src/systems/BuddySystem.ts'
          ],
          // Shop & inventory
          'economy': [
            './src/systems/ShopSystem.ts',
            './src/systems/InventoryManager.ts',
            './src/systems/TradingSystem.ts'
          ],
          // Modals - lazy loaded
          'modals': [
            './src/components/ModalRegistry.ts'
          ]
        }
      }
    },
    target: 'es2020',
    chunkSizeWarningLimit: 1000
  },
  server: {
    port: 3000,
    open: true
  }
});
