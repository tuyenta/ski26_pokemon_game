/**
 * Main Entry Point
 * Initializes all game systems, sets up event handlers, and starts the application
 */

import { AGE_CONFIGS } from '@config/ageGroups';
import { LanguageManager } from '@config/i18n';
import { EventBus } from '@core/EventBus';
import { GameEvent } from '@core/events';

// Import all game systems
import { ARFilterSystem } from '@systems/ARFilterSystem';
import { BattleSystem } from '@systems/BattleSystem';
import { BreedingSystem } from '@systems/BreedingSystem';
import { BuddySystem } from '@systems/BuddySystem';
import { CollectionManager } from '@systems/CollectionManager';
import { CustomizationSystem } from '@systems/CustomizationSystem';
import { EventsSystem } from '@systems/EventsSystem';
import { FusionSystem } from '@systems/FusionSystem';
import { GymBadgeSystem } from '@systems/GymBadgeSystem';
import { InventoryManager } from '@systems/InventoryManager';
import { MiniGameManager } from '@systems/MiniGameManager';
import { PhotoCapture } from '@systems/PhotoCapture';
import { QuestManager } from '@systems/QuestManager';
import { ShopSystem } from '@systems/ShopSystem';
import { SoundManager } from '@systems/SoundManager';
import { TeamManager } from '@systems/TeamManager';
import { TradingSystem } from '@systems/TradingSystem';
import { TrainerProfile } from '@systems/TrainerProfile';
import { WeatherTimeSystem } from '@systems/WeatherTimeSystem';

// Import modal registry
import { ModalRegistry } from '@components/ModalRegistry';

// Import utilities
import { debounce } from '@utils/helpers';
import { fetchPokemonList } from '@utils/pokeapi';

// Declare global face-api from CDN
declare const faceapi: any;

/**
 * Application State
 */
interface AppState {
    isRunning: boolean;
    faceDetectionLoaded: boolean;
    selectedAge: '4-6' | '7-10' | 'mixed' | null;
    videoStream: MediaStream | null;
    detectionInterval: number | null;
}

/**
 * Main Application Class
 */
class PokemonARGame {
    private state: AppState;
    private eventBus: EventBus;
    private languageManager: LanguageManager;
    
    // Game Systems
    private collectionManager: CollectionManager;
    private weatherSystem: WeatherTimeSystem;
    private inventoryManager: InventoryManager;
    private trainerProfile: TrainerProfile;
    private questManager: QuestManager;
    private gymBadgeSystem: GymBadgeSystem;
    private tradingSystem: TradingSystem;
    private teamManager: TeamManager;
    private fusionSystem: FusionSystem;
    private battleSystem: BattleSystem;
    private soundManager: SoundManager;
    private breedingSystem: BreedingSystem;
    private shopSystem: ShopSystem;
    private buddySystem: BuddySystem;
    private customizationSystem: CustomizationSystem;
    private eventsSystem: EventsSystem;
    private arFilterSystem: ARFilterSystem;
    private miniGameManager: MiniGameManager;
    private photoCapture: PhotoCapture;
    
    // Modal Registry
    private modalRegistry: ModalRegistry;
    
    // DOM Elements
    private videoCanvas: HTMLCanvasElement | null = null;
    private ctx: CanvasRenderingContext2D | null = null;
    private videoElement: HTMLVideoElement | null = null;

    constructor() {
        this.state = {
            isRunning: false,
            faceDetectionLoaded: false,
            selectedAge: null,
            videoStream: null,
            detectionInterval: null
        };
        
        // Initialize core systems
        this.eventBus = EventBus.getInstance();
        this.languageManager = new LanguageManager();
        
        // Initialize modal registry
        this.modalRegistry = ModalRegistry.getInstance();
        
        // Initialize game systems
        this.collectionManager = new CollectionManager();
        this.weatherSystem = new WeatherTimeSystem();
        this.inventoryManager = new InventoryManager();
        this.trainerProfile = new TrainerProfile();
        this.questManager = new QuestManager();
        this.gymBadgeSystem = new GymBadgeSystem();
        this.tradingSystem = new TradingSystem();
        this.teamManager = new TeamManager();
        this.fusionSystem = new FusionSystem();
        this.battleSystem = new BattleSystem();
        this.soundManager = new SoundManager();
        this.breedingSystem = new BreedingSystem();
        this.shopSystem = new ShopSystem();
        this.buddySystem = new BuddySystem();
        this.customizationSystem = new CustomizationSystem();
        this.eventsSystem = new EventsSystem();
        this.arFilterSystem = new ARFilterSystem();
        this.miniGameManager = new MiniGameManager();
        this.photoCapture = new PhotoCapture();
        
        // Setup event handlers
        this.setupEventHandlers();
    }
    
    /**
     * Initialize the application
     */
    async init(): Promise<void> {
        console.log('🎮 Initializing Pokemon AR Game...');
        
        // Setup UI elements
        this.setupUI();
        
        // Load face detection models
        await this.loadFaceDetection();
        
        // Show age selector
        this.showAgeSelector();
        
        console.log('✅ Game initialized successfully');
    }
    
    /**
     * Setup cross-system event handlers
     */
    private setupEventHandlers(): void {
        // When Pokemon is caught, update various systems
        this.eventBus.on(GameEvent.POKEMON_CAUGHT, (data) => {
            console.log(`🎉 Pokemon caught: ${data.name}`);
            
            // Play sound
            this.soundManager.playSound('catch');
            
            // Check if legendary for special notification
            if (data.isLegendary) {
                this.eventBus.emit(GameEvent.LEGENDARY_CAUGHT, data);
                this.soundManager.playSound('legendary');
            }
            
            // Update breeding steps
            this.breedingSystem.addSteps(1);
            
            // Update buddy distance
            this.buddySystem.addDistance(1);
        });
        
        // Profile updates
        this.eventBus.on(GameEvent.PROFILE_UPDATED, () => {
            this.updateTopBarUI();
        });
        
        // Inventory updates
        this.eventBus.on(GameEvent.INVENTORY_UPDATED, () => {
            this.updateTopBarUI();
        });
        
        // Quest completion
        this.eventBus.on(GameEvent.QUEST_COMPLETED, (data) => {
            this.soundManager.playSound('achievement');
            console.log(`✅ Quest completed: ${data.title}`);
        });
        
        // Achievement unlocked
        this.eventBus.on(GameEvent.ACHIEVEMENT_UNLOCKED, (data) => {
            this.soundManager.playSound('achievement');
            this.showNotification(`🏆 Achievement: ${data.name}`, 'success');
        });
        
        // Battle events
        this.eventBus.on(GameEvent.BATTLE_WON, (data) => {
            this.soundManager.playSound('win');
        });
        
        this.eventBus.on(GameEvent.BATTLE_LOST, () => {
            this.soundManager.playSound('lose');
        });
        
        // Egg hatched
        this.eventBus.on(GameEvent.EGG_HATCHED, (data) => {
            this.soundManager.playSound('hatch');
            this.showNotification(`🥚 Egg hatched: ${data.name}!`, 'success');
        });
    }
    
    /**
     * Setup UI elements and event listeners
     */
    private setupUI(): void {
        // Canvas setup with willReadFrequently for better performance with face detection
        this.videoCanvas = document.getElementById('video-canvas') as HTMLCanvasElement;
        this.ctx = this.videoCanvas?.getContext('2d', { willReadFrequently: true }) || null;
        
        console.log('🎨 Canvas setup:');
        console.log('  - Canvas element:', this.videoCanvas);
        console.log('  - Canvas context:', this.ctx);
        console.log('  - Canvas display:', this.videoCanvas?.style.display);
        console.log('  - Canvas visibility:', window.getComputedStyle(this.videoCanvas!).visibility);
        
        // Age selector buttons
        const ageButtons = document.querySelectorAll('.age-btn');
        ageButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const age = btn.getAttribute('data-age') as '4-6' | '7-10' | 'mixed';
                this.selectAge(age);
            });
        });
        
        // Start button
        const startBtn = document.getElementById('start-btn');
        startBtn?.addEventListener('click', () => this.startGame());
        
        // Collection button (on start screen)
        const collectionBtn = document.getElementById('collection-btn');
        collectionBtn?.addEventListener('click', () => {
            this.modalRegistry.openModal('collection');
        });
        
        // Battle button (on start screen)
        const battleBtn = document.getElementById('battle-btn');
        battleBtn?.addEventListener('click', () => {
            this.modalRegistry.openModal('battle');
        });
        
        // Leaderboard button (on start screen)
        const leaderboardBtn = document.getElementById('leaderboard-btn');
        leaderboardBtn?.addEventListener('click', () => {
            this.modalRegistry.openModal('leaderboard');
        });
        
        // Menu buttons (in game)
        const menuButtons = document.querySelectorAll('.menu-btn');
        menuButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const modalId = btn.getAttribute('data-modal');
                if (modalId) {
                    this.modalRegistry.openModal(modalId);
                    this.soundManager.playSound('click');
                }
            });
        });
        
        // AR Filter buttons
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.getAttribute('data-filter');
                if (filter && this.videoCanvas) {
                    this.arFilterSystem.setFilter(filter, this.videoCanvas);
                    this.soundManager.playSound('click');
                }
            });
        });
        
        // Photo capture button
        const photoBtn = document.getElementById('photo-btn');
        photoBtn?.addEventListener('click', () => {
            if (this.videoCanvas) {
                this.photoCapture.capturePhoto(this.videoCanvas);
                this.soundManager.playSound('click');
                this.showNotification('📸 Photo captured!', 'success');
            }
        });
        
        // Mini-game buttons
        const minigameButtons = document.querySelectorAll('.minigame-btn');
        minigameButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const game = btn.getAttribute('data-game');
                this.soundManager.playSound('click');
                this.showNotification(`🎮 ${game} game - Coming soon!`, 'info');
            });
        });
    }
    
    /**
     * Load face detection models
     */
    private async loadFaceDetection(): Promise<void> {
        const loadMsg = document.getElementById('load-msg');
        if (loadMsg) loadMsg.textContent = 'Loading AI models...';
        
        try {
            // Wait for faceapi to be available
            let attempts = 0;
            while (typeof faceapi === 'undefined' && attempts < 50) {
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }
            
            if (typeof faceapi === 'undefined') {
                throw new Error('Face API library not loaded');
            }
            
            // Load face-api models
            await faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.13/model');
            await faceapi.nets.faceLandmark68Net.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.13/model');
            
            this.state.faceDetectionLoaded = true;
            console.log('✅ Face detection models loaded');
            
            if (loadMsg) loadMsg.textContent = 'Loading Pokemon data...';
            
            // Preload Pokemon data based on age group
            // This will be done after age selection
        } catch (error) {
            console.error('❌ Failed to load face detection:', error);
            if (loadMsg) {
                loadMsg.textContent = 'Error loading AI models. Please refresh the page.';
                loadMsg.style.color = '#ff4444';
            }
        }
    }
    
    /**
     * Show age selector
     */
    private showAgeSelector(): void {
        const ageSelector = document.getElementById('age-selector');
        const loadMsg = document.getElementById('load-msg');
        
        if (ageSelector) ageSelector.style.display = 'block';
        if (loadMsg) loadMsg.style.display = 'none';
    }
    
    /**
     * Select age group
     */
    private selectAge(age: '4-6' | '7-10' | 'mixed'): void {
        this.state.selectedAge = age;
        this.soundManager.playSound('click');
        
        // Store in local storage
        localStorage.setItem('selectedAge', age);
        
        // Show username input and buttons
        const ageSelector = document.getElementById('age-selector');
        const usernameInput = document.getElementById('username-input');
        const startBtn = document.getElementById('start-btn');
        const collectionBtn = document.getElementById('collection-btn');
        const battleBtn = document.getElementById('battle-btn');
        const leaderboardBtn = document.getElementById('leaderboard-btn');
        
        if (ageSelector) ageSelector.style.display = 'none';
        if (usernameInput) usernameInput.style.display = 'block';
        if (startBtn) startBtn.style.display = 'block';
        if (collectionBtn) collectionBtn.style.display = 'block';
        if (battleBtn) battleBtn.style.display = 'block';
        if (leaderboardBtn) leaderboardBtn.style.display = 'block';
        
        // Load Pokemon list for selected age
        this.loadPokemonData(age);
    }
    
    /**
     * Load Pokemon data based on age group
     */
    private async loadPokemonData(age: '4-6' | '7-10' | 'mixed'): Promise<void> {
        const config = AGE_CONFIGS[age];
        const loadMsg = document.getElementById('load-msg');
        
        try {
            if (loadMsg) {
                loadMsg.style.display = 'block';
                loadMsg.textContent = `Loading ${config.pokemonCount} Pokemon...`;
            }
            
            await fetchPokemonList(config.pokemonCount);
            
            if (loadMsg) {
                loadMsg.style.display = 'none';
            }
            
            console.log(`✅ Loaded ${config.pokemonCount} Pokemon for age group ${age}`);
        } catch (error) {
            console.error('❌ Failed to load Pokemon data:', error);
            if (loadMsg) loadMsg.textContent = 'Error loading Pokemon. Please refresh.';
        }
    }
    
    /**
     * Start the game
     */
    private async startGame(): Promise<void> {
        // Get trainer name
        const nameInput = document.getElementById('trainer-name-input') as HTMLInputElement;
        const trainerName = nameInput?.value.trim() || 'Trainer';
        
        // Set trainer profile
        this.trainerProfile.setUsername(trainerName);
        
        // Hide start screen
        const startNode = document.getElementById('start-node');
        if (startNode) startNode.style.display = 'none';
        
        // Show game UI
        const gameUI = document.getElementById('game-ui');
        if (gameUI) gameUI.style.display = 'block';
        
        // Re-verify canvas is available and visible
        if (!this.videoCanvas) {
            this.videoCanvas = document.getElementById('video-canvas') as HTMLCanvasElement;
            this.ctx = this.videoCanvas?.getContext('2d', { willReadFrequently: true }) || null;
        }
        
        if (this.videoCanvas) {
            this.videoCanvas.style.display = 'block';
            this.videoCanvas.style.visibility = 'visible';
            console.log('🎨 Canvas forced visible');
            console.log('  - Width:', this.videoCanvas.width, 'Height:', this.videoCanvas.height);
            console.log('  - Client:', this.videoCanvas.clientWidth, 'x', this.videoCanvas.clientHeight);
        } else {
            console.error('❌ Canvas element not found!');
        }
        
        // Update UI
        this.updateTopBarUI();
        
        // Start camera
        await this.startCamera();
        
        // Start face detection loop
        this.startDetectionLoop();
        
        // Check for active events
        this.eventsSystem.checkActiveEvent();
        
        this.state.isRunning = true;
        this.soundManager.playSound('click');
        
        console.log('🎮 Game started!');
    }
    
    /**
     * Start camera stream
     */
    private async startCamera(): Promise<void> {
        try {
            console.log('📹 Requesting camera access...');
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: 1280, height: 720 }
            });
            
            this.state.videoStream = stream;
            console.log('✅ Camera access granted');
            
            // Create video element
            this.videoElement = document.createElement('video');
            this.videoElement.srcObject = stream;
            this.videoElement.autoplay = true;
            this.videoElement.playsInline = true;
            this.videoElement.muted = true;
            this.videoElement.style.display = 'none';
            
            // Append video element to DOM (required for proper initialization)
            document.body.appendChild(this.videoElement);
            
            console.log('📹 Video element created and added to DOM, waiting for metadata...');
            console.log('📹 Video stream active:', stream.active);
            console.log('📹 Video tracks:', stream.getVideoTracks().length);
            
            // Wait for video to be ready
            await new Promise<void>((resolve) => {
                this.videoElement!.onloadedmetadata = () => {
                    if (this.videoCanvas && this.videoElement) {
                        // Set canvas dimensions to match viewport (window size)
                        this.videoCanvas.width = window.innerWidth;
                        this.videoCanvas.height = window.innerHeight;
                        
                        console.log(`📹 Video size: ${this.videoElement.videoWidth}x${this.videoElement.videoHeight}`);
                        console.log(`📹 Canvas size: ${this.videoCanvas.width}x${this.videoCanvas.height}`);
                        console.log(`📹 Viewport size: ${window.innerWidth}x${window.innerHeight}`);
                        
                        // Force a test draw to canvas
                        if (this.ctx) {
                            this.ctx.fillStyle = '#00ff00';
                            this.ctx.fillRect(0, 0, 200, 200);
                            console.log('🎨 Test green rectangle drawn to canvas');
                        }
                    }
                    resolve();
                };
            });
            
            // Start playing video
            await this.videoElement.play();
            console.log('▶️ Video playing');
            console.log('📹 Video element in DOM:', document.body.contains(this.videoElement));
            console.log('📹 Video readyState:', this.videoElement.readyState);
            console.log('📹 Video paused:', this.videoElement.paused);
            
            // Make sure canvas is visible
            if (this.videoCanvas) {
                this.videoCanvas.style.display = 'block';
                console.log('👁️ Canvas visibility set to block');
            }
            
            // Start drawing video to canvas
            this.drawVideoFrame(this.videoElement);
            
            // Handle window resize
            window.addEventListener('resize', () => {
                if (this.videoCanvas) {
                    this.videoCanvas.width = window.innerWidth;
                    this.videoCanvas.height = window.innerHeight;
                    console.log('📐 Canvas resized to:', window.innerWidth, 'x', window.innerHeight);
                }
            });
            
            console.log('✅ Camera started and video drawing to canvas');
            console.log('📊 Final status:');
            console.log('  - Video width:', this.videoElement.videoWidth, 'x', this.videoElement.videoHeight);
            console.log('  - Canvas width:', this.videoCanvas?.width, 'x', this.videoCanvas?.height);
            console.log('  - Canvas in viewport:', this.videoCanvas?.getBoundingClientRect());
        } catch (error) {
            console.error('❌ Camera access denied:', error);
            alert('Camera access is required to play this game. Please allow camera access and refresh.');
        }
    }
    
    /**
     * Draw video frame to canvas
     */
    private drawVideoFrame(video: HTMLVideoElement): void {
        if (!this.ctx || !this.videoCanvas) {
            console.error('❌ Canvas or context not available');
            return;
        }
        
        let frameCount = 0;
        
        const draw = () => {
            if (!this.state.isRunning) return;
            
            if (video.readyState === video.HAVE_ENOUGH_DATA) {
                try {
                    // Clear canvas first
                    this.ctx!.clearRect(0, 0, this.videoCanvas!.width, this.videoCanvas!.height);
                    
                    // Calculate scaling to cover canvas while maintaining aspect ratio
                    const canvasAspect = this.videoCanvas!.width / this.videoCanvas!.height;
                    const videoAspect = video.videoWidth / video.videoHeight;
                    
                    let sx = 0, sy = 0, sw = video.videoWidth, sh = video.videoHeight;
                    
                    if (canvasAspect > videoAspect) {
                        // Canvas is wider - crop video height
                        sh = video.videoWidth / canvasAspect;
                        sy = (video.videoHeight - sh) / 2;
                    } else {
                        // Canvas is taller - crop video width
                        sw = video.videoHeight * canvasAspect;
                        sx = (video.videoWidth - sw) / 2;
                    }
                    
                    // Draw video frame (cropped and scaled to fit canvas)
                    this.ctx!.drawImage(
                        video,
                        sx, sy, sw, sh,  // Source rectangle (from video)
                        0, 0, this.videoCanvas!.width, this.videoCanvas!.height  // Destination (canvas)
                    );
                    
                    // Apply AR filter if one is active
                    const currentFilter = this.arFilterSystem.getCurrentFilter();
                    if (currentFilter) {
                        this.arFilterSystem.applyFilter(currentFilter.id, this.videoCanvas!);
                    }
                    
                    // Log first few frames for debugging
                    if (frameCount < 3) {
                        console.log(`📹 Frame ${frameCount + 1} drawn to canvas`);
                        frameCount++;
                    }
                    
                    // Update A-Frame texture
                    const mirror = document.getElementById('mirror');
                    if (mirror) {
                        const material = mirror.getAttribute('material');
                        if (!material || material.src !== '#video-canvas') {
                            mirror.setAttribute('material', {
                                shader: 'flat',
                                src: '#video-canvas',
                                side: 'double'
                            });
                        }
                    }
                } catch (error) {
                    console.error('❌ Draw error:', error);
                }
            }
            
            requestAnimationFrame(draw);
        };
        
        draw();
        console.log('✅ Video drawing loop started');
    }
    
    /**
     * Start face detection loop
     */
    private startDetectionLoop(): void {
        const detect = async () => {
            if (!this.state.isRunning || !this.videoCanvas) return;
            
            try {
                // Detect faces
                const detections = await faceapi.detectAllFaces(
                    this.videoCanvas,
                    new faceapi.TinyFaceDetectorOptions()
                ).withFaceLandmarks();
                
                // Update face count
                const faceCount = document.getElementById('face-count');
                if (faceCount) faceCount.textContent = detections.length.toString();
                
                // If faces detected, trigger Pokemon spawn
                if (detections.length > 0) {
                    this.handleFaceDetection(detections);
                }
            } catch (error) {
                console.error('Detection error:', error);
            }
        };
        
        // Run detection every 500ms
        this.state.detectionInterval = window.setInterval(detect, 500);
    }
    
    /**
     * Handle face detection
     */
    private handleFaceDetection = debounce((detections: any[]) => {
        // Calculate centroid for Pokemon spawn
        const landmarks = detections[0].landmarks;
        const nose = landmarks.getNose()[0];
        
        // Spawn random Pokemon at face location
        this.spawnPokemon(nose.x, nose.y);
    }, 2000);
    
    /**
     * Spawn Pokemon at location
     */
    private async spawnPokemon(x: number, y: number): Promise<void> {
        if (!this.state.selectedAge) return;
        
        const config = AGE_CONFIGS[this.state.selectedAge];
        const pokemonId = Math.floor(Math.random() * config.pokemonCount) + 1;
        
        // Get weather bonus
        const weatherBonus = this.weatherSystem.getCurrentWeatherBonus();
        const isShiny = Math.random() < 0.01; // 1% shiny chance
        
        // Emit spawn event
        this.eventBus.emit(GameEvent.POKEMON_SPAWNED, {
            id: pokemonId,
            x,
            y,
            isShiny
        });
        
        // Auto-catch (simplified for this version)
        // In full version, this would show catch UI
        setTimeout(() => {
            this.catchPokemon(pokemonId, isShiny);
        }, 1000);
    }
    
    /**
     * Catch Pokemon
     */
    private async catchPokemon(id: number, isShiny: boolean): Promise<void> {
        // Use Pokeball from inventory
        const hasPokeballResult = this.inventoryManager.useItem('pokeball');
        if (!hasPokeballResult.success) {
            this.showNotification('❌ No Pokeballs left!', 'error');
            return;
        }
        
        // Add to collection
        const result = await this.collectionManager.addPokemon(id, isShiny);
        
        if (result.success) {
            // Show notification
            const message = result.isFirstCatch 
                ? `🎉 New Pokemon: ${result.pokemon?.name}!`
                : `✅ Caught ${result.pokemon?.name} again!`;
            
            this.showNotification(message, 'success');
            
            // Update quest progress
            this.questManager.updateProgress('catch', id);
            
            // Add coins reward
            this.inventoryManager.addCoins(isShiny ? 100 : 10);
        }
    }
    
    /**
     * Update top bar UI
     */
    private updateTopBarUI(): void {
        const profile = this.trainerProfile.getProfile();
        const inventory = this.inventoryManager.getInventory();
        
        // Update trainer info
        const trainerName = document.getElementById('trainer-name');
        const trainerLevel = document.getElementById('trainer-level');
        
        if (trainerName) trainerName.textContent = profile.username;
        if (trainerLevel) trainerLevel.textContent = `Lv.${profile.level}`;
        
        // Update coins
        const coinsAmount = document.getElementById('coins-amount');
        if (coinsAmount) coinsAmount.textContent = inventory.coins.toString();
    }
    
    /**
     * Show notification
     */
    private showNotification(message: string, type: 'success' | 'error' | 'info'): void {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 10px;
            color: white;
            font-weight: bold;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 3000);
    }
    
    /**
     * Stop the game
     */
    stop(): void {
        this.state.isRunning = false;
        
        // Stop detection
        if (this.state.detectionInterval) {
            clearInterval(this.state.detectionInterval);
        }
        
        // Stop camera
        if (this.state.videoStream) {
            this.state.videoStream.getTracks().forEach(track => track.stop());
        }
        
        console.log('🛑 Game stopped');
    }
}

/**
 * Initialize application on page load
 */
window.addEventListener('DOMContentLoaded', async () => {
    const game = new PokemonARGame();
    await game.init();
    
    // Expose game instance for debugging
    (window as any).game = game;
});
