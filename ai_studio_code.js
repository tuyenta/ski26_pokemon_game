const video = document.getElementById('input-video');
const btnScan = document.getElementById('btn-scan');
const scanBar = document.getElementById('scan-bar');
const resultBoard = document.getElementById('result-board');
const pokeImg = document.getElementById('poke-img');
const pokeName = document.getElementById('poke-name');
const statusText = document.getElementById('status');

let faceMesh;

// 1. Khởi tạo Camera và AI
async function init() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        await video.play();

        // Gán camera vào VR
        document.getElementById('webcam-plane').setAttribute('src', video);

        // Khởi tạo MediaPipe Face Mesh
        faceMesh = new FaceMesh({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
        });

        faceMesh.setOptions({
            maxNumFaces: 6,
            refineLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        faceMesh.onResults(onFaceResults);
        
        statusText.innerText = "Sẵn sàng!";
        setTimeout(() => {
            document.getElementById('loading-screen').style.display = 'none';
        }, 1000);

    } catch (err) {
        statusText.innerText = "Lỗi Camera: Hãy cấp quyền truy cập!";
        console.error(err);
    }
}

// 2. Logic xử lý kết quả AI với Multi-Face Tracking
let currentFacesData = [];
let faceTracker = {
    faces: new Map(), // Map of faceId -> {landmarks, pokemonId, frameCount, centroid}
    nextId: 1,
    sessionId: Date.now(), // Unique session for multiplayer variation
    
    calculateCentroid(landmarks) {
        const nose = landmarks[1];
        return { x: nose.x, y: nose.y };
    },
    
    findClosestFace(centroid) {
        let minDist = Infinity;
        let closestId = null;
        
        for (const [id, face] of this.faces.entries()) {
            const dx = face.centroid.x - centroid.x;
            const dy = face.centroid.y - centroid.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < 0.15 && dist < minDist) { // Threshold for same face
                minDist = dist;
                closestId = id;
            }
        }
        return closestId;
    },
    
    updateFaces(faceLandmarks) {
        const detectedIds = new Set();
        const newFaces = [];
        
        // Process each detected face
        for (let i = 0; i < faceLandmarks.length && i < 6; i++) {
            const landmarks = faceLandmarks[i];
            const centroid = this.calculateCentroid(landmarks);
            
            // Find if this is an existing face
            let faceId = this.findClosestFace(centroid);
            
            if (faceId === null) {
                // New face detected
                faceId = this.nextId++;
                const pokemonId = this.generatePokemonId(landmarks, i);
                this.faces.set(faceId, {
                    landmarks,
                    pokemonId,
                    centroid,
                    frameCount: 1
                });
            } else {
                // Existing face, update it
                const face = this.faces.get(faceId);
                face.landmarks = landmarks;
                face.centroid = centroid;
                face.frameCount++;
            }
            
            detectedIds.add(faceId);
            
            // Only include faces detected for 3+ frames (validation)
            if (this.faces.get(faceId).frameCount >= 3) {
                newFaces.push({
                    id: faceId,
                    landmarks,
                    pokemonId: this.faces.get(faceId).pokemonId
                });
            }
        }
        
        // Remove faces that disappeared
        for (const id of this.faces.keys()) {
            if (!detectedIds.has(id)) {
                this.faces.delete(id);
            }
        }
        
        return newFaces;
    },
    
    generatePokemonId(landmarks, index) {
        // Session-based + position + face data for unique multiplayer matches
        const keyPoint = landmarks[1]; // Nose point
        const faceCode = Math.floor((keyPoint.x + keyPoint.y) * 1000);
        const sessionCode = (this.sessionId % 1000);
        const combined = (faceCode + sessionCode + (index * 17)) % 151;
        return combined + 1; // Gen 1 (1-151)
    }
};

function onFaceResults(results) {
    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        currentFacesData = faceTracker.updateFaces(results.multiFaceLandmarks);
    } else {
        currentFacesData = [];
    }
}

// Hàm quét liên tục để lấy dữ liệu mặt
function updateAI() {
    faceMesh.send({ image: video });
    requestAnimationFrame(updateAI);
}

// 3. Logic so sánh và lấy ảnh Pokemon - Multi-Face Support
let pokemonCache = {}; // Cache for fetched Pokemon data

btnScan.addEventListener('click', async () => {
    if (!currentFacesData || currentFacesData.length === 0) {
        alert("Bé ơi, máy không thấy mặt bé! Hãy nhìn thẳng vào camera nhe.");
        return;
    }

    const faceCount = currentFacesData.length;
    statusText.innerText = `Phát hiện ${faceCount} người chơi!`;

    // Hiệu ứng quét
    scanBar.setAttribute('visible', 'true');
    scanBar.setAttribute('animation', 'property: position; from: 0 1.2 0.01; to: 0 -1.2 0.01; dur: 1500; loops: 1');

    // Hide all result boards first
    for (let i = 1; i <= 6; i++) {
        const board = document.getElementById(`result-board-${i}`);
        if (board) {
            board.setAttribute('visible', 'false');
            board.setAttribute('scale', '0 0 0');
        }
    }
    
    setTimeout(async () => {
        scanBar.setAttribute('visible', 'false');
        
        // Batch fetch all Pokemon
        const fetchPromises = currentFacesData.map((face, index) => 
            fetchPokemonForFace(face.pokemonId, index + 1)
        );
        
        await Promise.all(fetchPromises);
        statusText.innerText = "Hoàn tất!";
    }, 1500);
});

async function fetchPokemonForFace(id, playerNumber) {
    try {
        // Check cache first
        let data;
        if (pokemonCache[id]) {
            data = pokemonCache[id];
        } else {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
            data = await response.json();
            pokemonCache[id] = data; // Cache the result
        }
        
        const name = data.name.toUpperCase();
        const imageUrl = data.sprites.other['official-artwork'].front_default;
        const types = data.types.map(t => t.type.name.toUpperCase()).join(', ');
        const abilities = data.abilities.slice(0, 2).map(a => a.ability.name.toUpperCase()).join(', ');
        const height = (data.height / 10).toFixed(1);
        const weight = (data.weight / 10).toFixed(1);
        
        const stats = data.stats;
        const hp = stats.find(s => s.stat.name === 'hp')?.base_stat || 0;
        const attack = stats.find(s => s.stat.name === 'attack')?.base_stat || 0;
        const defense = stats.find(s => s.stat.name === 'defense')?.base_stat || 0;
        const speed = stats.find(s => s.stat.name === 'speed')?.base_stat || 0;

        // Update corresponding result board
        const boardId = `result-board-${playerNumber}`;
        const board = document.getElementById(boardId);
        
        if (board) {
            document.getElementById(`res-name-${playerNumber}`).setAttribute('value', name);
            document.getElementById(`res-img-${playerNumber}`).setAttribute('src', imageUrl);
            document.getElementById(`res-id-${playerNumber}`).setAttribute('value', `#${id.toString().padStart(3, '0')}`);
            document.getElementById(`res-type-${playerNumber}`).setAttribute('value', `⚡ Type: ${types}`);
            document.getElementById(`res-abilities-${playerNumber}`).setAttribute('value', `⭐ Abilities: ${abilities}`);
            document.getElementById(`res-height-${playerNumber}`).setAttribute('value', `📏 Height: ${height}m`);
            document.getElementById(`res-weight-${playerNumber}`).setAttribute('value', `⚖️ Weight: ${weight}kg`);
            document.getElementById(`res-stats-${playerNumber}`).setAttribute('value', `HP:${hp} ATK:${attack} DEF:${defense} SPD:${speed}`);
            document.getElementById(`player-label-${playerNumber}`).setAttribute('value', `PLAYER ${playerNumber}`);
            
            board.setAttribute('visible', 'true');
            board.setAttribute('animation', 'property: scale; from: 0 0 0; to: 1 1 1; dur: 500; delay: ' + (playerNumber * 100));
        }
    } catch (err) {
        console.error(`Lỗi lấy dữ liệu Pokemon cho player ${playerNumber}:`, err);
    }
}

// Đóng bảng kết quả khi nhấn vào nó - Multi-board support
for (let i = 1; i <= 6; i++) {
    const board = document.getElementById(`result-board-${i}`);
    if (board) {
        board.addEventListener('click', () => {
            board.setAttribute('scale', '0 0 0');
            setTimeout(() => {
                board.setAttribute('visible', 'false');
            }, 300);
        });
    }
}

init().then(() => {
    updateAI();
});