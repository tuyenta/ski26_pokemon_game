const CACHE_NAME = 'pokemon-ar-v1.0';
const RUNTIME_CACHE = 'pokemon-runtime-v1.0';

// Critical assets to cache immediately
const PRECACHE_URLS = [
    '/pokemon/pokemom_ai_game.html',
    'https://aframe.io/releases/1.4.0/aframe.min.js',
    'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.11.0/dist/tf.min.js',
    'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.13/dist/face-api.min.js',
    'https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Poppins:wght@400;600;800&display=swap'
];

// Face detection model files
const FACE_API_MODELS = [
    'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.13/model/tiny_face_detector_model-weights_manifest.json',
    'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.13/model/tiny_face_detector_model-shard1',
    'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.13/model/face_landmark_68_tiny_model-weights_manifest.json',
    'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.13/model/face_landmark_68_tiny_model-shard1'
];

// Install event - cache critical resources
self.addEventListener('install', (event) => {
    console.log('📦 Service Worker: Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('📦 Precaching critical assets');
            return cache.addAll(PRECACHE_URLS.concat(FACE_API_MODELS));
        }).catch((error) => {
            console.error('Failed to precache:', error);
        })
    );
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('✅ Service Worker: Activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
                        console.log('🗑️ Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch event - network-first for API, cache-first for assets
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Handle PokeAPI requests with network-first strategy
    if (url.origin === 'https://pokeapi.co') {
        event.respondWith(networkFirstStrategy(request));
    }
    // Handle Pokemon images from GitHub with cache-first strategy
    else if (url.hostname === 'raw.githubusercontent.com' && url.pathname.includes('pokemon/sprites')) {
        event.respondWith(cacheFirstStrategy(request));
    }
    // Handle other assets with cache-first strategy
    else if (PRECACHE_URLS.some(cachedUrl => request.url.includes(cachedUrl)) || 
             FACE_API_MODELS.some(modelUrl => request.url.includes(modelUrl))) {
        event.respondWith(cacheFirstStrategy(request));
    }
    // Default: network with fallback to cache
    else {
        event.respondWith(
            fetch(request).catch(() => caches.match(request))
        );
    }
});

// Network-first strategy (for API calls)
async function networkFirstStrategy(request) {
    try {
        const networkResponse = await fetch(request);
        // Cache successful responses
        if (networkResponse.ok) {
            const cache = await caches.open(RUNTIME_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.log('📡 Network failed, trying cache for:', request.url);
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        // Return error response
        return new Response(JSON.stringify({ 
            error: 'Offline and no cache available',
            message: 'Please check your internet connection'
        }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Cache-first strategy (for static assets)
async function cacheFirstStrategy(request) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }
    
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(RUNTIME_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.error('❌ Failed to fetch:', request.url, error);
        // Return placeholder for Pokemon sprites
        if (request.url.includes('pokemon/sprites')) {
            return new Response(
                '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="#f0f0f0"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" font-size="20" fill="#999">Offline</text></svg>',
                { 
                    status: 200,
                    headers: { 'Content-Type': 'image/svg+xml' }
                }
            );
        }
        throw error;
    }
}

// Message event for manual cache management
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CACHE_URLS') {
        const urls = event.data.urls;
        event.waitUntil(
            caches.open(RUNTIME_CACHE).then((cache) => {
                return cache.addAll(urls);
            })
        );
    }
});

console.log('🎮 Pokemon AR Service Worker loaded');
