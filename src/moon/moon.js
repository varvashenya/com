// Lunar Lander Game - Vanilla JavaScript
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game constants
const GRAVITY = 0.05; // Moon gravity (much lower than Earth)
const THRUST_POWER = 0.14;
const FUEL_CONSUMPTION = 0.2;
const ROTATION_SPEED = 0.06; // Rotation speed in radians

// Audio context for sound effects
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let thrustSound = null;

// Sound generation functions
function playThrustSound() {
    if (thrustSound) return; // Already playing

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(80, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(60, audioContext.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    thrustSound = { oscillator, gainNode };
}

function stopThrustSound() {
    if (!thrustSound) return;

    const { oscillator, gainNode } = thrustSound;
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
    oscillator.stop(audioContext.currentTime + 0.1);
    thrustSound = null;
}

function playLandingSound() {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.3);

    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.3);
}

function playCrashSound() {
    // Create explosion sound with noise
    const bufferSize = audioContext.sampleRate * 0.5; // 0.5 seconds
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    // Generate noise that fades out
    for (let i = 0; i < bufferSize; i++) {
        const decay = 1 - (i / bufferSize);
        data[i] = (Math.random() * 2 - 1) * decay;
    }

    const noise = audioContext.createBufferSource();
    noise.buffer = buffer;

    const noiseGain = audioContext.createGain();
    noiseGain.gain.setValueAtTime(0.3, audioContext.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);

    noise.connect(noiseGain);
    noiseGain.connect(audioContext.destination);

    // Add low frequency rumble
    const rumble = audioContext.createOscillator();
    const rumbleGain = audioContext.createGain();

    rumble.type = 'sawtooth';
    rumble.frequency.setValueAtTime(50, audioContext.currentTime);
    rumble.frequency.exponentialRampToValueAtTime(20, audioContext.currentTime + 0.3);

    rumbleGain.gain.setValueAtTime(0.3, audioContext.currentTime);
    rumbleGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);

    rumble.connect(rumbleGain);
    rumbleGain.connect(audioContext.destination);

    noise.start();
    rumble.start();
    noise.stop(audioContext.currentTime + 0.5);
    rumble.stop(audioContext.currentTime + 0.5);
}

function playSuccessSound() {
    // Play ascending success tones
    const frequencies = [400, 500, 600, 800];

    frequencies.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);

        const startTime = audioContext.currentTime + index * 0.1;
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.start(startTime);
        oscillator.stop(startTime + 0.3);
    });
}

function playWarningBeep() {
    // Yellow warning beep - medium pitch
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);

    gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);
}

function playDangerBeep() {
    // Red danger beep - high pitch, more urgent
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(1200, audioContext.currentTime);

    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.15);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.15);
}

function playSafeBeep() {
    // Green safe beep - low pitch, gentle
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(400, audioContext.currentTime);

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.08);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.08);
}

function playFuelWarningBeep() {
    // Fuel warning beep - quick double beep
    for (let i = 0; i < 2; i++) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(900, audioContext.currentTime);

        const startTime = audioContext.currentTime + i * 0.15;
        gainNode.gain.setValueAtTime(0.15, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.08);

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.start(startTime);
        oscillator.stop(startTime + 0.08);
    }
}

function playOxygenWarningBeep() {
    // O2 warning beep - triple urgent beep
    for (let i = 0; i < 3; i++) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(1100 - i * 100, audioContext.currentTime);

        const startTime = audioContext.currentTime + i * 0.12;
        gainNode.gain.setValueAtTime(0.12, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.1);

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.start(startTime);
        oscillator.stop(startTime + 0.1);
    }
}

function playStationBeep(distance, maxDistance) {
    // Sputnik-1 style beep - volume based on distance
    // distance: how far the station is from lander
    // maxDistance: maximum audible distance

    if (distance > maxDistance) return;

    // Calculate volume based on distance (closer = louder)
    const volumeFactor = 1 - (distance / maxDistance);
    const volume = volumeFactor * 0.25; // Increased from 0.12 to 0.25 for better audibility

    if (volume < 0.01) return; // Too quiet to play


    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime);

    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.12);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.12);
}

// Game state
let gameState = {
    lander: {
        x: canvas.width / 2,
        y: canvas.height - 50, // Will be adjusted to actual terrain height
        vx: 0, // horizontal velocity
        vy: 0, // vertical velocity
        width: 20,
        height: 30,
        angle: 0 // Rotation angle in radians (0 = pointing up)
    },
    fuel: 100,
    oxygen: 100, // O2 meter - depletes over time (5 minutes total)
    oxygenMax: 100,
    oxygenDepletionRate: 100 / (60 * 60 * 5), // Depletes over 5 minutes at 60fps
    keys: {
        up: false,
        left: false,
        right: false
    },
    gameOver: false,
    landed: true, // Start in landed state
    crashed: false,
    crashDebris: [],
    stars: [],
    meteors: [],
    spaceStations: [],
    spaceSuits: [],
    terrain: [],
    rocks: [], // Surface boulders
    surfaceTexture: [], // Small rocks/dots for surface texture
    flames: [],
    previousOverallLightState: 'green',
    nextStationSpawn: 0, // Time until next station spawn
    lastFuelWarningBeep: 0, // Frame counter for fuel warning beeps
    lastOxygenWarningBeep: 0, // Frame counter for O2 warning beeps
    fuelStation: null // Fuel station on the left side
};

// Initialize stars in the sky
function initStars() {
    for (let i = 0; i < 200; i++) {
        gameState.stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height, // Cover entire canvas height
            size: Math.random() * 2,
            vx: 0.15 + Math.random() * 0.1, // Move left to right (moon rotation effect)
            vy: (Math.random() - 0.5) * 0.02  // Very slight vertical variance
        });
    }
}

// Generate random moon terrain with realistic features
function generateTerrain() {
    const points = 100; // More points for smoother terrain
    const baseHeight = canvas.height - 50;
    const minTerrainY = canvas.height - 150; // Don't go higher than this
    const maxTerrainY = canvas.height - 30; // Don't go lower than this (leave room for rendering)

    // Generate base terrain with varying heights
    for (let i = 0; i < points; i++) {
        const x = (canvas.width / points) * i;

        // Use sine waves for natural rolling hills
        const wave1 = Math.sin(i * 0.1) * 15;
        const wave2 = Math.sin(i * 0.05) * 8;
        const wave3 = Math.sin(i * 0.3) * 5;

        // Add some random variation
        const noise = (Math.random() - 0.5) * 10;

        let y = baseHeight + wave1 + wave2 + wave3 + noise;

        // Clamp terrain to stay on screen
        y = Math.max(minTerrainY, Math.min(maxTerrainY, y));

        gameState.terrain.push({ x, y });
    }

    // Add some craters
    addCraters();

    // Close the terrain polygon
    gameState.terrain.push({ x: canvas.width, y: canvas.height });
    gameState.terrain.push({ x: 0, y: canvas.height });
}

// Add craters to the terrain
function addCraters() {
    const craterCount = 5 + Math.floor(Math.random() * 3);
    const minTerrainY = canvas.height - 150; // Don't go higher than this
    const maxTerrainY = canvas.height - 30; // Don't go lower than this

    for (let c = 0; c < craterCount; c++) {
        // Random crater position and size
        const craterCenter = Math.floor(Math.random() * (gameState.terrain.length - 20)) + 10;
        const craterWidth = 10 + Math.floor(Math.random() * 15);
        const craterDepth = 15 + Math.random() * 25;

        // Create crater depression
        for (let i = 0; i < craterWidth; i++) {
            const idx = craterCenter - Math.floor(craterWidth / 2) + i;
            if (idx >= 0 && idx < gameState.terrain.length) {
                // Parabolic crater shape
                const progress = i / craterWidth;
                const depth = Math.sin(progress * Math.PI) * craterDepth;
                gameState.terrain[idx].y += depth;

                // Clamp after crater modification to ensure it stays on screen
                gameState.terrain[idx].y = Math.max(minTerrainY, Math.min(maxTerrainY, gameState.terrain[idx].y));

                // Mark crater points for special rendering
                gameState.terrain[idx].isCrater = true;
            }
        }
    }
}

// Generate rocks and boulders on the surface
function generateRocks() {
    const rockCount = 15 + Math.floor(Math.random() * 10);
    
    for (let i = 0; i < rockCount; i++) {
        // Find a random point on the terrain
        const terrainIdx = Math.floor(Math.random() * (gameState.terrain.length - 2));
        const terrainPoint = gameState.terrain[terrainIdx];
        
        gameState.rocks.push({
            x: terrainPoint.x,
            y: terrainPoint.y,
            size: 3 + Math.random() * 8,
            shade: 0.3 + Math.random() * 0.4 // Random darkness for variety
        });
    }
}

// Generate surface texture (small rocks/dots) - called once to prevent flickering
function generateSurfaceTexture() {
    for (let i = 0; i < gameState.terrain.length - 2; i++) {
        const point = gameState.terrain[i];
        const nextPoint = gameState.terrain[i + 1];
        
        // Add random small rocks on surface
        if (Math.random() > 0.7) {
            const rockX = point.x + (nextPoint.x - point.x) * Math.random();
            const rockY = point.y - Math.random() * 3;
            const rockSize = Math.random() * 2 + 1;
            
            gameState.surfaceTexture.push({
                x: rockX,
                y: rockY,
                size: rockSize
            });
        }
    }
}

// Position lander on the terrain surface
function positionLanderOnTerrain() {
    const landerX = canvas.width / 2;
    
    // Find the terrain height at the lander's x position
    let terrainY = canvas.height - 50; // Default fallback
    
    for (let i = 0; i < gameState.terrain.length - 3; i++) {
        const point = gameState.terrain[i];
        const nextPoint = gameState.terrain[i + 1];
        
        if (point.x <= landerX && nextPoint.x >= landerX) {
            // Interpolate terrain height at this x position
            const t = (landerX - point.x) / (nextPoint.x - point.x);
            terrainY = point.y + (nextPoint.y - point.y) * t;
            break;
        }
    }
    
    // Position lander on surface (subtract half height so bottom touches ground)
    gameState.lander.x = landerX;
    gameState.lander.y = terrainY - gameState.lander.height / 2;
}

// Get terrain height at a specific x position
function getTerrainHeightAt(x) {
    // Wrap x position to handle screen wrapping
    let wrappedX = x;
    if (wrappedX < 0) wrappedX += canvas.width;
    if (wrappedX > canvas.width) wrappedX -= canvas.width;

    // Find terrain height at this x position
    for (let i = 0; i < gameState.terrain.length - 3; i++) {
        const point = gameState.terrain[i];
        const nextPoint = gameState.terrain[i + 1];

        if (point.x <= wrappedX && nextPoint.x >= wrappedX) {
            // Interpolate terrain height at this x position
            const t = (wrappedX - point.x) / (nextPoint.x - point.x);
            return point.y + (nextPoint.y - point.y) * t;
        }
    }

    // Fallback to base height
    return canvas.height - 50;
}

// Create fuel station on the left side of screen
function createFuelStation() {
    const stationX = 100; // Position on left side
    const terrainY = getTerrainHeightAt(stationX);

    gameState.fuelStation = {
        x: stationX,
        y: terrainY,
        platformWidth: 90, // Diameter of circular pad
        platformHeight: 6,
        radius: 45, // Radius of circular launchpad
        pulsePhase: 0 // For holographic animation
    };
}

// Create a meteor
function createMeteor() {
    // Random spawn from top or sides
    const side = Math.random();
    let x, y, vx, vy;

    if (side < 0.7) {
        // Spawn from top
        x = Math.random() * canvas.width;
        y = -20;
        vx = (Math.random() - 0.5) * 4;
        vy = Math.random() * 2 + 2; // Moving downward
    } else {
        // Spawn from left or right
        if (Math.random() < 0.5) {
            x = -20;
            vx = Math.random() * 3 + 2; // Moving right
        } else {
            x = canvas.width + 20;
            vx = -(Math.random() * 3 + 2); // Moving left
        }
        y = Math.random() * (canvas.height - 200);
        vy = Math.random() * 2 + 1;
    }

    gameState.meteors.push({
        x: x,
        y: y,
        vx: vx,
        vy: vy,
        size: Math.random() * 2 + 1
    });
}

// Randomly spawn meteors
function maybeSpawnMeteor() {
    // Small chance each frame to spawn a meteor
    if (Math.random() < 0.01) {
        createMeteor();
    }
}

// Create a space station
function createSpaceStation() {
    // Spawn from left or right, moving horizontally
    const fromLeft = Math.random() < 0.5;

    gameState.spaceStations.push({
        x: fromLeft ? -100 : canvas.width + 100,
        y: 50 + Math.random() * 150, // Upper part of sky
        vx: fromLeft ? 1.5 : -1.5, // Slow, steady movement
        width: 60,
        height: 30,
        rotation: 0,
        rotationSpeed: 0.01, // Slow rotation
        malfunctioningWindow: Math.floor(Math.random() * 5), // Random window 0-4
        flickerState: true, // Current state of malfunctioning light
        flickerTimer: 0, // Frame counter for flicker
        beepTimer: Math.floor(Math.random() * 60) // Start at random phase so stations beep at different times
    });
}

// Randomly spawn space stations at intervals
function maybeSpawnSpaceStation() {
    if (gameState.nextStationSpawn <= 0) {
        createSpaceStation();
        // Next spawn in 10-20 seconds (at 60fps)
        gameState.nextStationSpawn = 600 + Math.random() * 600;
    } else {
        gameState.nextStationSpawn--;
    }
}

// Create a space suit (astronaut)
function createSpaceSuit() {
    // Spawn from top, left, or right edges only (not from bottom to avoid mid-screen spawning)
    const side = Math.random();
    let x, y, vx, vy;

    if (side < 0.33) {
        // From top
        x = Math.random() * canvas.width;
        y = -20;
        vx = (Math.random() - 0.5) * 0.8;
        vy = Math.random() * 0.5 + 0.3;
    } else if (side < 0.66) {
        // From left
        x = -20;
        y = Math.random() * (canvas.height - 200);
        vx = Math.random() * 0.5 + 0.3;
        vy = (Math.random() - 0.5) * 0.5;
    } else {
        // From right
        x = canvas.width + 20;
        y = Math.random() * (canvas.height - 200);
        vx = -(Math.random() * 0.5 + 0.3);
        vy = (Math.random() - 0.5) * 0.5;
    }

    gameState.spaceSuits.push({
        x: x,
        y: y,
        vx: vx,
        vy: vy,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.03, // Slow tumbling
        size: 8 + Math.random() * 4, // Variable size for depth perception
        wavePhase: Math.random() * Math.PI * 2, // Animation phase for waving
        waveSpeed: 0.05 + Math.random() * 0.05 // How fast they wave
    });
}

// Randomly spawn space suits
function maybeSpawnSpaceSuit() {
    // Small chance each frame to spawn a space suit (reduced from 0.005 to 0.002)
    if (Math.random() < 0.002) {
        createSpaceSuit();
    }
}

// Input handling - Keyboard
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') gameState.keys.up = true;
    if (e.key === 'ArrowLeft') gameState.keys.left = true;
    if (e.key === 'ArrowRight') gameState.keys.right = true;
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowUp') gameState.keys.up = false;
    if (e.key === 'ArrowLeft') gameState.keys.left = false;
    if (e.key === 'ArrowRight') gameState.keys.right = false;
});

// Input handling - Touch Controls
function setupTouchControls() {
    const touchButtons = document.querySelectorAll('.touch-button');

    touchButtons.forEach(button => {
        const key = button.dataset.key;

        // Handle touch start
        button.addEventListener('touchstart', (e) => {
            e.preventDefault();
            gameState.keys[key] = true;
            button.classList.add('active');
        }, { passive: false });

        // Handle touch end
        button.addEventListener('touchend', (e) => {
            e.preventDefault();
            gameState.keys[key] = false;
            button.classList.remove('active');
        }, { passive: false });

        // Handle touch cancel (when finger moves off button)
        button.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            gameState.keys[key] = false;
            button.classList.remove('active');
        }, { passive: false });

        // Also support mouse events for testing on desktop
        button.addEventListener('mousedown', (e) => {
            e.preventDefault();
            gameState.keys[key] = true;
            button.classList.add('active');
        });

        button.addEventListener('mouseup', (e) => {
            e.preventDefault();
            gameState.keys[key] = false;
            button.classList.remove('active');
        });

        button.addEventListener('mouseleave', (e) => {
            gameState.keys[key] = false;
            button.classList.remove('active');
        });
    });
}

// Initialize touch controls when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupTouchControls);
} else {
    setupTouchControls();
}

// Detect if device has touchscreen
function isTouchDevice() {
    return (('ontouchstart' in window) ||
            (navigator.maxTouchPoints > 0) ||
            (navigator.msMaxTouchPoints > 0));
}

// Toggle touch controls for desktop testing
const toggleButton = document.getElementById('toggleTouchControls');
const touchControls = document.getElementById('touchControls');

if (toggleButton && touchControls) {
    // Show touch controls by default on touch devices
    if (isTouchDevice()) {
        touchControls.style.display = 'flex';
        toggleButton.textContent = 'HIDE TOUCH';
    }

    toggleButton.addEventListener('click', () => {
        if (touchControls.style.display === 'flex') {
            touchControls.style.display = 'none';
            toggleButton.textContent = 'SHOW TOUCH';
        } else {
            touchControls.style.display = 'flex';
            toggleButton.textContent = 'HIDE TOUCH';
        }
    });
}

// Prevent default touch behavior on canvas to avoid scrolling
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
}, { passive: false });

// Create flame particles for engine effects (from rotated thruster)
function createFlame(x, y, angle) {
    // Thruster is at the bottom of lander in local coords: (0, +15)
    // Proper rotation matrix for point (0, +15):
    //   x' = 0*cos(θ) - 15*sin(θ) = -15*sin(θ)
    //   y' = 0*sin(θ) + 15*cos(θ) = +15*cos(θ)

    const thrusterDistance = 15; // lander.height / 2
    const thrusterLocalX = 0;
    const thrusterLocalY = thrusterDistance; // +15 in local coords (bottom)

    // Apply rotation matrix
    const thrusterX = x + (thrusterLocalX * Math.cos(angle) - thrusterLocalY * Math.sin(angle));
    const thrusterY = y + (thrusterLocalX * Math.sin(angle) + thrusterLocalY * Math.cos(angle));

    // Use rotation matrix for direction too.
    // Local flame direction: (0, +1) pointing down in local coords
    // After rotation: dx = 0*cos - 1*sin = -sin(angle)
    //                 dy = 0*sin + 1*cos = cos(angle)

    const spread = 0.3;

    for (let i = 0; i < 2; i++) {
        const randomAngle = (Math.random() - 0.5) * spread;

        const speed = 3 + Math.random() * 2;

        // Rotate the flame direction (0, +1) by (angle + randomAngle)
        const totalAngle = angle + randomAngle;
        const flameDirX = -Math.sin(totalAngle);
        const flameDirY = Math.cos(totalAngle);

        gameState.flames.push({
            x: thrusterX + flameDirX * 5,
            y: thrusterY + flameDirY * 5,
            vx: flameDirX * speed,
            vy: flameDirY * speed,
            life: 15 + Math.random() * 10,
            size: Math.random() * 3 + 2
        });
    }
}

// Create explosion debris when crashing
function createExplosion(x, y, impactSpeed) {
    const debrisCount = Math.min(50, Math.floor(impactSpeed * 10));

    for (let i = 0; i < debrisCount; i++) {
        const angle = (Math.PI * 2 * i) / debrisCount + Math.random() * 0.5;
        const speed = impactSpeed * (0.5 + Math.random() * 0.5);

        gameState.crashDebris.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - Math.random() * 2, // Slightly upward
            size: Math.random() * 4 + 2,
            life: 60 + Math.random() * 40,
            maxLife: 60 + Math.random() * 40,
            color: Math.random() > 0.5 ? '#0f0' : '#ff0'
        });
    }

    // Add some fire particles
    for (let i = 0; i < 30; i++) {
        gameState.crashDebris.push({
            x: x + Math.random() * 20 - 10,
            y: y + Math.random() * 20 - 10,
            vx: (Math.random() - 0.5) * 3,
            vy: (Math.random() - 0.5) * 3,
            size: Math.random() * 5 + 3,
            life: 30 + Math.random() * 30,
            maxLife: 30 + Math.random() * 30,
            color: Math.random() > 0.3 ? '#f00' : '#ff8800'
        });
    }
}

// Update game physics
function update() {
    // Update stars (slow drift simulating moon rotation)
    gameState.stars.forEach(star => {
        star.x += star.vx;
        star.y += star.vy;

        // Wrap around horizontally (moon rotation effect)
        if (star.x > canvas.width) star.x = 0;

        // Wrap vertically if needed (keep stars across entire sky)
        if (star.y < 0) star.y = canvas.height;
        if (star.y > canvas.height) star.y = 0;
    });

    // Update meteors
    maybeSpawnMeteor();
    gameState.meteors = gameState.meteors.filter(meteor => {

        // Update position
        meteor.x += meteor.vx;
        meteor.y += meteor.vy;

        // Remove if off screen
        return meteor.x > -50 && meteor.x < canvas.width + 50 &&
               meteor.y > -50 && meteor.y < canvas.height + 50;
    });

    // Update space stations
    maybeSpawnSpaceStation();
    gameState.spaceStations = gameState.spaceStations.filter(station => {
        // Update position
        station.x += station.vx;
        station.rotation += station.rotationSpeed;

        // Update malfunctioning window flicker
        station.flickerTimer++;
        // Flicker randomly every 5-20 frames
        const flickerInterval = 5 + Math.random() * 15;
        if (station.flickerTimer >= flickerInterval) {
            station.flickerState = !station.flickerState;
            station.flickerTimer = 0;
        }

        // Sputnik-style beeping based on distance from lander
        station.beepTimer++;
        if (station.beepTimer >= 60) { // Beep once per second
            // Calculate distance from lander
            const dx = station.x - gameState.lander.x;
            const dy = station.y - gameState.lander.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const maxAudibleDistance = 600;

            playStationBeep(distance, maxAudibleDistance);
            station.beepTimer = 0;
        }

        // Remove if off screen
        return station.x > -150 && station.x < canvas.width + 150;
    });

    // Update space suits (astronauts)
    maybeSpawnSpaceSuit();
    gameState.spaceSuits = gameState.spaceSuits.filter(suit => {
        // Update position
        suit.x += suit.vx;
        suit.y += suit.vy;
        suit.rotation += suit.rotationSpeed;
        suit.wavePhase += suit.waveSpeed; // Update animation phase

        // Remove if off screen (allow them to go all the way to bottom)
        return suit.x > -30 && suit.x < canvas.width + 30 &&
               suit.y > -30 && suit.y < canvas.height + 30;
    });

    // Fuel warning beep
    if (gameState.fuel < 20 && !gameState.landed && !gameState.crashed) {
        gameState.lastFuelWarningBeep++;
        // Beep every 60 frames (once per second at 60fps)
        if (gameState.lastFuelWarningBeep >= 60) {
            playFuelWarningBeep();
            gameState.lastFuelWarningBeep = 0;
        }
    } else {
        gameState.lastFuelWarningBeep = 0;
    }

    // Oxygen warning beep
    if (gameState.oxygen < 20 && !gameState.crashed) {
        gameState.lastOxygenWarningBeep++;
        // Beep every 60 frames (once per second at 60fps)
        if (gameState.lastOxygenWarningBeep >= 60) {
            playOxygenWarningBeep();
            gameState.lastOxygenWarningBeep = 0;
        }
    } else {
        gameState.lastOxygenWarningBeep = 0;
    }

    // Oxygen depletion - runs continuously
    if (!gameState.gameOver && !gameState.crashed) {
        gameState.oxygen -= gameState.oxygenDepletionRate;

        // Check if oxygen has run out
        if (gameState.oxygen <= 0) {
            gameState.oxygen = 0;
            gameState.crashed = true;
            gameState.gameOver = true;
            playCrashSound();
            showGameOver(false, 'OUT OF OXYGEN! Mission failed.');
            return;
        }
    }

    if (gameState.gameOver) {
        // Continue updating crash debris even after game over
        gameState.crashDebris = gameState.crashDebris.filter(debris => {
            debris.x += debris.vx;
            debris.y += debris.vy;
            debris.vy += GRAVITY; // Apply gravity to debris
            debris.life--;
            return debris.life > 0 && debris.y < canvas.height;
        });

        // Continue updating flames so they disappear naturally
        gameState.flames = gameState.flames.filter(flame => {
            flame.x += flame.vx;
            flame.y += flame.vy;
            flame.vy += GRAVITY * 0.5;
            flame.life--;
            return flame.life > 0;
        });

        return;
    }

    const lander = gameState.lander;

    // If crashed, just update debris and flames, don't process anything else
    if (gameState.crashed) {
        gameState.crashDebris = gameState.crashDebris.filter(debris => {
            debris.x += debris.vx;
            debris.y += debris.vy;
            debris.vy += GRAVITY; // Apply gravity to debris
            debris.life--;
            return debris.life > 0 && debris.y < canvas.height;
        });

        // Update existing flames so they disappear
        gameState.flames = gameState.flames.filter(flame => {
            flame.x += flame.vx;
            flame.y += flame.vy;
            flame.vy += GRAVITY * 0.5;
            flame.life--;
            return flame.life > 0;
        });

        return;
    }


    // If landed, only allow takeoff with up thrust
    if (gameState.landed) {
        // Refuel if on fuel station platform
        if (gameState.fuelStation && gameState.fuel < 100) {
            const station = gameState.fuelStation;

            // Check if lander is positioned near the fuel station (on the ground below it)
            // The lander lands on terrain, not on the visual platform
            if (lander.x >= station.x - station.platformWidth / 2 &&
                lander.x <= station.x + station.platformWidth / 2) {

                // Refuel at 0.5 units per frame (30 units per second at 60fps)
                gameState.fuel = Math.min(100, gameState.fuel + 0.5);
            }
        }

        // When landed, ONLY up button can take off (no left/right to avoid accidental takeoff on mobile)
        if (gameState.fuel > 0 && gameState.keys.up) {
            gameState.landed = false;
            playThrustSound();

            // Thrust straight up when taking off
            lander.vy -= Math.cos(lander.angle) * THRUST_POWER;
            gameState.fuel -= FUEL_CONSUMPTION;
            createFlame(lander.x, lander.y, lander.angle);
        } else {
            stopThrustSound();
        }

        // Update existing flames even when landed so they disappear
        gameState.flames = gameState.flames.filter(flame => {
            flame.x += flame.vx;
            flame.y += flame.vy;
            flame.vy += GRAVITY * 0.5;
            flame.life--;
            return flame.life > 0;
        });

        // Don't update physics if landed
        // Note: UI drawn in draw() -> drawCockpitInstruments()
        return;
    }

    // When airborne: any thrust button (up/left/right) activates main engine
    // This makes mobile controls easier - you can thrust in a direction with one button
    const thrustActive = gameState.fuel > 0 && (gameState.keys.up || gameState.keys.left || gameState.keys.right);

    if (thrustActive) {
        playThrustSound();

        // Apply rotation when left/right is pressed
        if (gameState.keys.left) {
            lander.angle -= ROTATION_SPEED;
        }
        if (gameState.keys.right) {
            lander.angle += ROTATION_SPEED;
        }

        // Thrust is applied in the direction the lander is pointing
        // angle = 0 means pointing up (negative Y)
        // angle increases clockwise
        lander.vx += Math.sin(lander.angle) * THRUST_POWER;
        lander.vy -= Math.cos(lander.angle) * THRUST_POWER;
        gameState.fuel -= FUEL_CONSUMPTION;
        createFlame(lander.x, lander.y, lander.angle);
    } else {
        stopThrustSound();
    }

    // Apply gravity (always pulling down)
    lander.vy += GRAVITY;

    // Update position
    lander.x += lander.vx;
    lander.y += lander.vy;

    // Clamp fuel
    gameState.fuel = Math.max(0, gameState.fuel);

    // Update flames (they continue in their initial direction with gravity)
    gameState.flames = gameState.flames.filter(flame => {
        flame.x += flame.vx;
        flame.y += flame.vy;
        flame.vy += GRAVITY * 0.5; // Flames are affected slightly by gravity
        flame.life--;
        return flame.life > 0;
    });

    // Screen wrapping for horizontal movement
    if (lander.x < -lander.width) lander.x = canvas.width;
    if (lander.x > canvas.width) lander.x = -lander.width;

    // Check if escaped orbit
    if (lander.y < -lander.height) {
        stopThrustSound();
        playSuccessSound();
        endGame(true, 'MISSION SUCCESS! You escaped lunar orbit!');
        return;
    }

    // Check collision with actual terrain
    const terrainHeight = getTerrainHeightAt(lander.x);
    const landerBottom = lander.y + lander.height / 2;

    if (landerBottom >= terrainHeight) {
        // Calculate impact speed
        const speed = Math.sqrt(lander.vx * lander.vx + lander.vy * lander.vy);
        const verticalSpeed = Math.abs(lander.vy);
        const horizontalSpeed = Math.abs(lander.vx);

        // Check landing angle - must be pointing mostly upward
        // Normalize angle to -π to π range
        let normalizedAngle = lander.angle % (Math.PI * 2);
        if (normalizedAngle > Math.PI) normalizedAngle -= Math.PI * 2;
        if (normalizedAngle < -Math.PI) normalizedAngle += Math.PI * 2;

        // Safe angle: within 30 degrees (π/6 radians) of vertical (0)
        const SAFE_ANGLE_LIMIT = Math.PI / 6; // 30 degrees
        const angleFromVertical = Math.abs(normalizedAngle);
        const angleSafe = angleFromVertical < SAFE_ANGLE_LIMIT;

        // Safe landing conditions: slow vertical speed, not too much horizontal speed, AND safe angle
        const SAFE_LANDING_SPEED = 1.5;
        const SAFE_HORIZONTAL_SPEED = 2.0;

        if (verticalSpeed < SAFE_LANDING_SPEED && horizontalSpeed < SAFE_HORIZONTAL_SPEED && angleSafe) {
            // Successful landing!
            lander.y = terrainHeight - lander.height / 2;
            lander.vy = 0;
            lander.vx = 0;
            gameState.landed = true;
            stopThrustSound();
            playLandingSound();
            // Don't end game, allow taking off again
        } else {
            // Crash!
            gameState.crashed = true;
            stopThrustSound();
            playCrashSound();

            let crashReason = '';
            if (!angleSafe) {
                const angleDegrees = Math.round(Math.abs(normalizedAngle) * 180 / Math.PI);
                crashReason = `CRASH! Unsafe landing angle: ${angleDegrees}° (max safe: 30°)`;
            } else if (verticalSpeed >= SAFE_LANDING_SPEED) {
                crashReason = `CRASH! Vertical impact: ${verticalSpeed.toFixed(1)} m/s (max safe: ${SAFE_LANDING_SPEED} m/s)`;
            } else {
                crashReason = `CRASH! Horizontal impact: ${horizontalSpeed.toFixed(1)} m/s (max safe: ${SAFE_HORIZONTAL_SPEED} m/s)`;
            }

            createExplosion(lander.x, lander.y, speed);

            // Delay the game over message to show explosion
            setTimeout(() => {
                endGame(false, crashReason);
            }, 1500);
        }
    }

    // Update UI
    // Note: UI is now drawn directly on canvas in drawCockpitInstruments()
}


// End game
function endGame(success, message) {
    gameState.gameOver = true;
    const gameOverDiv = document.getElementById('gameOver');
    const title = document.getElementById('gameOverTitle');
    const msg = document.getElementById('gameOverMessage');

    title.textContent = success ? '🎉 MISSION SUCCESS!' : '💥 MISSION FAILED';
    title.style.color = success ? '#0f0' : '#f00';
    msg.textContent = message;

    gameOverDiv.style.display = 'block';
}

// Draw old-style cockpit instruments - UNIFIED CONTROL PANEL
function drawCockpitInstruments() {
    const lander = gameState.lander;

    // Calculate current values
    const speed = Math.sqrt(lander.vx * lander.vx + lander.vy * lander.vy);
    const verticalSpeed = Math.abs(lander.vy);
    const horizontalSpeed = Math.abs(lander.vx);
    const terrainHeight = getTerrainHeightAt(lander.x);
    const altitude = Math.max(0, Math.round((terrainHeight - lander.y - lander.height / 2) * 0.5));
    const maxAltitude = 500; // Escape altitude

    // Safe landing thresholds
    const SAFE_LANDING_SPEED = 1.5;
    const SAFE_HORIZONTAL_SPEED = 2.0;
    const WARNING_LANDING_SPEED = 1.0;
    const WARNING_HORIZONTAL_SPEED = 1.5;
    const WARNING_ANGLE_LIMIT = Math.PI / 9;
    const SAFE_ANGLE_LIMIT = Math.PI / 6;

    let normalizedAngle = lander.angle % (Math.PI * 2);
    if (normalizedAngle > Math.PI) normalizedAngle -= Math.PI * 2;
    if (normalizedAngle < -Math.PI) normalizedAngle += Math.PI * 2;
    const angleDegrees = Math.round(normalizedAngle * 180 / Math.PI);
    const angleFromVertical = Math.abs(normalizedAngle);
    const angleSafe = angleFromVertical < SAFE_ANGLE_LIMIT;

    // === HORIZONTAL METERS AT TOP LEFT ===
    const meterStartX = 15;
    const meterStartY = 15;
    const meterWidth = 150;
    const meterHeight = 12;
    const meterSpacing = 18;
    const labelWidth = 40;

    // === FUEL HORIZONTAL BAR ===
    const fuelY = meterStartY;

    // Label
    ctx.fillStyle = '#0a0';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('FUEL:', meterStartX, fuelY + 9);

    // Bar background
    const fuelBarX = meterStartX + labelWidth;
    ctx.fillStyle = 'rgba(40, 40, 40, 0.8)';
    ctx.fillRect(fuelBarX, fuelY, meterWidth, meterHeight);
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.4)';
    ctx.lineWidth = 1;
    ctx.strokeRect(fuelBarX, fuelY, meterWidth, meterHeight);

    // Fuel fill
    const fuelFillWidth = (gameState.fuel / 100) * meterWidth;
    ctx.fillStyle = gameState.fuel < 20 ? '#f00' : gameState.fuel < 40 ? '#ff0' : '#0f0';
    ctx.fillRect(fuelBarX, fuelY, fuelFillWidth, meterHeight);

    // Percentage text
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(Math.round(gameState.fuel) + '%', fuelBarX + meterWidth / 2, fuelY + 9);

    // === ALTITUDE HORIZONTAL BAR ===
    const altY = meterStartY + meterSpacing;

    // Label
    ctx.fillStyle = '#0a0';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('ALT:', meterStartX, altY + 9);

    // Bar background
    const altBarX = meterStartX + labelWidth;
    ctx.fillStyle = 'rgba(40, 40, 40, 0.8)';
    ctx.fillRect(altBarX, altY, meterWidth, meterHeight);
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.4)';
    ctx.lineWidth = 1;
    ctx.strokeRect(altBarX, altY, meterWidth, meterHeight);

    // Altitude fill (capped at max altitude)
    const altFillWidth = Math.min(altitude / maxAltitude, 1) * meterWidth;
    ctx.fillStyle = altitude >= maxAltitude ? '#0ff' : '#0a0';
    ctx.fillRect(altBarX, altY, altFillWidth, meterHeight);

    // Altitude text
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(altitude + 'm', altBarX + meterWidth / 2, altY + 9);

    // === O2 HORIZONTAL BAR ===
    const o2Y = meterStartY + meterSpacing * 2;

    // Label
    ctx.fillStyle = '#0a0';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('O2:', meterStartX, o2Y + 9);

    // Bar background
    const o2BarX = meterStartX + labelWidth;
    ctx.fillStyle = 'rgba(40, 40, 40, 0.8)';
    ctx.fillRect(o2BarX, o2Y, meterWidth, meterHeight);
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.4)';
    ctx.lineWidth = 1;
    ctx.strokeRect(o2BarX, o2Y, meterWidth, meterHeight);

    // O2 fill
    const o2FillWidth = (gameState.oxygen / gameState.oxygenMax) * meterWidth;
    ctx.fillStyle = gameState.oxygen < 20 ? '#f00' : gameState.oxygen < 40 ? '#ff0' : '#0ff';
    ctx.fillRect(o2BarX, o2Y, o2FillWidth, meterHeight);

    // Percentage text
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(Math.round(gameState.oxygen) + '%', o2BarX + meterWidth / 2, o2Y + 9);

    // === BOTTOM PANEL - Digital displays and status ===
    const panelHeight = 30;
    const panelY = canvas.height - panelHeight;
    let currentX = 15;

    // === DIGITAL DISPLAYS (Compact) ===
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'left';

    // Velocity
    ctx.fillStyle = '#0a0';
    ctx.fillText('VEL:', currentX, panelY + 12);
    ctx.fillStyle = '#0ff';
    ctx.fillText(speed.toFixed(1) + ' m/s', currentX + 28, panelY + 12);

    // Angle
    ctx.fillStyle = '#0a0';
    ctx.fillText('ANG:', currentX, panelY + 22);
    ctx.fillStyle = angleSafe ? '#0ff' : '#f00';
    ctx.fillText(angleDegrees + '°', currentX + 28, panelY + 22);

    currentX += 100;

    // === WARNING LIGHTS (Small circles) ===
    const lightRadius = 5;
    const lightY = panelY + 15;
    const lightSpacing = 25;

    // Vertical Speed
    let vSpeedState = 'green';
    if (lander.vy < 0) {
        vSpeedState = 'green';
    } else if (verticalSpeed >= SAFE_LANDING_SPEED) {
        vSpeedState = 'red';
    } else if (verticalSpeed >= WARNING_LANDING_SPEED) {
        vSpeedState = 'yellow';
    }
    drawCompactLight(currentX, lightY, lightRadius, vSpeedState, 'V');

    // Horizontal Speed
    let hSpeedState = 'green';
    if (horizontalSpeed >= SAFE_HORIZONTAL_SPEED) {
        hSpeedState = 'red';
    } else if (horizontalSpeed >= WARNING_HORIZONTAL_SPEED) {
        hSpeedState = 'yellow';
    }
    drawCompactLight(currentX + lightSpacing, lightY, lightRadius, hSpeedState, 'H');

    // Angle
    let angleState = 'green';
    if (!angleSafe) {
        angleState = 'red';
    } else if (angleFromVertical >= WARNING_ANGLE_LIMIT) {
        angleState = 'yellow';
    }
    drawCompactLight(currentX + lightSpacing * 2, lightY, lightRadius, angleState, 'A');

    // Overall
    let overallState = 'green';
    if (vSpeedState === 'red' || hSpeedState === 'red' || angleState === 'red') {
        overallState = 'red';
    } else if (vSpeedState === 'yellow' || hSpeedState === 'yellow' || angleState === 'yellow') {
        overallState = 'yellow';
    }

    // Play sound for state changes
    if (overallState !== gameState.previousOverallLightState) {
        if (overallState === 'red') {
            playDangerBeep();
        } else if (overallState === 'yellow') {
            playWarningBeep();
        } else if (overallState === 'green') {
            playSafeBeep();
        }
        gameState.previousOverallLightState = overallState;
    }

    drawCompactLight(currentX + lightSpacing * 3, lightY, lightRadius, overallState, 'OK');

    currentX += lightSpacing * 4 + 20;

    // === STATUS INDICATORS ===
    const statusY = panelY + 15;
    const statusWidth = 40;
    const statusHeight = 12;
    const statusSpacing = 45;

    // Landed
    if (gameState.landed) {
        drawCompactStatus(currentX, statusY, statusWidth, statusHeight, true, 'LAND', '#00f');
    }

    // Low Fuel (blinking)
    if (gameState.fuel < 20) {
        const blink = Math.floor(Date.now() / 300) % 2 === 0;
        drawCompactStatus(currentX + statusSpacing, statusY, statusWidth, statusHeight, blink, 'FUEL!', '#f00');
    }

    // Low O2 (blinking)
    if (gameState.oxygen < 20) {
        const blink = Math.floor(Date.now() / 300) % 2 === 0;
        drawCompactStatus(currentX + statusSpacing * 2, statusY, statusWidth, statusHeight, blink, 'O2!', '#f00');
    }

    // Thrust
    if (gameState.keys.up) {
        drawCompactStatus(currentX + statusSpacing * 3, statusY, statusWidth, statusHeight, true, 'THR', '#ff0');
    }
}

// Draw compact warning light for horizontal panel
function drawCompactLight(x, y, radius, state, label) {
    // Determine color
    let color;
    if (state === 'green') color = '#0f0';
    else if (state === 'yellow') color = '#ff0';
    else color = '#f00';

    // Light with glow
    ctx.fillStyle = color;
    ctx.shadowBlur = 5;
    ctx.shadowColor = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Label
    ctx.fillStyle = '#0a0';
    ctx.font = '7px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(label, x, y - radius - 2);
}

// Draw compact status indicator
function drawCompactStatus(x, y, width, height, active, label, color) {
    if (!active) return;

    ctx.fillStyle = color;
    ctx.shadowBlur = 6;
    ctx.shadowColor = color;
    ctx.fillRect(x - width/2, y - height/2, width, height);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x, y);
}


// Draw everything
function draw() {

    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw stars
    ctx.fillStyle = '#fff';
    gameState.stars.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw meteors (no trails - no atmosphere on the moon!)
    gameState.meteors.forEach(meteor => {
        // Draw meteor with glow
        ctx.fillStyle = '#fff';
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#fff';
        ctx.beginPath();
        ctx.arc(meteor.x, meteor.y, meteor.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Add a bright core
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.arc(meteor.x, meteor.y, meteor.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw space stations
    gameState.spaceStations.forEach(station => {
        ctx.save();
        ctx.translate(station.x, station.y);
        ctx.rotate(station.rotation);

        // Main body (cylinder)
        ctx.fillStyle = '#888';
        ctx.strokeStyle = '#aaa';
        ctx.lineWidth = 2;
        ctx.fillRect(-station.width / 2, -station.height / 2, station.width, station.height);
        ctx.strokeRect(-station.width / 2, -station.height / 2, station.width, station.height);

        // Solar panels (left)
        ctx.fillStyle = '#0066cc';
        ctx.strokeStyle = '#0088ff';
        ctx.fillRect(-station.width / 2 - 25, -20, 20, 40);
        ctx.strokeRect(-station.width / 2 - 25, -20, 20, 40);

        // Solar panel grid lines (left)
        ctx.strokeStyle = '#004488';
        ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(-station.width / 2 - 25, -20 + i * 13.3);
            ctx.lineTo(-station.width / 2 - 5, -20 + i * 13.3);
            ctx.stroke();
        }

        // Solar panels (right)
        ctx.fillStyle = '#0066cc';
        ctx.strokeStyle = '#0088ff';
        ctx.lineWidth = 2;
        ctx.fillRect(station.width / 2 + 5, -20, 20, 40);
        ctx.strokeRect(station.width / 2 + 5, -20, 20, 40);

        // Solar panel grid lines (right)
        ctx.strokeStyle = '#004488';
        ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(station.width / 2 + 5, -20 + i * 13.3);
            ctx.lineTo(station.width / 2 + 25, -20 + i * 13.3);
            ctx.stroke();
        }

        // Windows
        const windowCount = 5;
        const windowSpacing = station.width / (windowCount + 1);
        for (let i = 1; i <= windowCount; i++) {
            // Check if this is the malfunctioning window
            const isMalfunctioning = (i - 1) === station.malfunctioningWindow;

            if (isMalfunctioning) {
                // Malfunctioning window - flickers on/off
                if (station.flickerState) {
                    ctx.fillStyle = '#ffff00';
                    ctx.beginPath();
                    ctx.arc(-station.width / 2 + i * windowSpacing, 0, 3, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    // Off or dim
                    ctx.fillStyle = '#664400';
                    ctx.beginPath();
                    ctx.arc(-station.width / 2 + i * windowSpacing, 0, 3, 0, Math.PI * 2);
                    ctx.fill();
                }
            } else {
                // Normal working window
                ctx.fillStyle = '#ffff00';
                ctx.beginPath();
                ctx.arc(-station.width / 2 + i * windowSpacing, 0, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Antenna
        ctx.strokeStyle = '#aaa';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -station.height / 2);
        ctx.lineTo(0, -station.height / 2 - 10);
        ctx.stroke();

        // Antenna tip
        ctx.fillStyle = '#f00';
        ctx.beginPath();
        ctx.arc(0, -station.height / 2 - 10, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    });

    // Draw space suits (astronauts floating in space)
    gameState.spaceSuits.forEach(suit => {
        ctx.save();
        ctx.translate(suit.x, suit.y);
        ctx.rotate(suit.rotation);

        const s = suit.size;

        // Helmet (white/gray sphere)
        ctx.fillStyle = '#ddd';
        ctx.strokeStyle = '#aaa';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, -s * 0.3, s * 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Helmet visor (dark)
        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath();
        ctx.arc(0, -s * 0.3, s * 0.25, 0, Math.PI * 2);
        ctx.fill();

        // Visor reflection
        ctx.fillStyle = 'rgba(100, 150, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(-s * 0.1, -s * 0.35, s * 0.12, 0, Math.PI * 2);
        ctx.fill();

        // Body (white suit)
        ctx.fillStyle = '#eee';
        ctx.strokeStyle = '#bbb';
        ctx.lineWidth = 1;
        ctx.fillRect(-s * 0.35, -s * 0.1, s * 0.7, s * 0.8);
        ctx.strokeRect(-s * 0.35, -s * 0.1, s * 0.7, s * 0.8);

        // Life support backpack (gray box)
        ctx.fillStyle = '#999';
        ctx.fillRect(-s * 0.3, 0, s * 0.6, s * 0.4);
        ctx.strokeRect(-s * 0.3, 0, s * 0.6, s * 0.4);

        // Calculate wave animation offsets
        const armWaveLeft = Math.sin(suit.wavePhase) * s * 0.3;
        const armWaveRight = Math.sin(suit.wavePhase + Math.PI) * s * 0.3; // Opposite phase
        const legWaveLeft = Math.sin(suit.wavePhase + Math.PI * 0.5) * s * 0.2;
        const legWaveRight = Math.sin(suit.wavePhase + Math.PI * 1.5) * s * 0.2;

        // Arms (animated waving)
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = s * 0.15;
        ctx.lineCap = 'round';

        // Left arm - waves up and down
        ctx.beginPath();
        ctx.moveTo(-s * 0.35, 0);
        ctx.lineTo(-s * 0.6, s * 0.2 + armWaveLeft);
        ctx.stroke();

        // Right arm - waves up and down (opposite phase)
        ctx.beginPath();
        ctx.moveTo(s * 0.35, 0);
        ctx.lineTo(s * 0.6, s * 0.2 + armWaveRight);
        ctx.stroke();

        // Legs (animated moving)
        ctx.lineWidth = s * 0.18;

        // Left leg - moves side to side
        ctx.beginPath();
        ctx.moveTo(-s * 0.15, s * 0.7);
        ctx.lineTo(-s * 0.2 + legWaveLeft, s * 1.1);
        ctx.stroke();

        // Right leg - moves side to side (opposite phase)
        ctx.beginPath();
        ctx.moveTo(s * 0.15, s * 0.7);
        ctx.lineTo(s * 0.2 + legWaveRight, s * 1.1);
        ctx.stroke();

        // Utility belt (orange/red stripe)
        ctx.fillStyle = '#ff6600';
        ctx.fillRect(-s * 0.35, s * 0.3, s * 0.7, s * 0.1);

        // Small details - control panel on chest
        ctx.fillStyle = '#333';
        ctx.fillRect(-s * 0.15, s * 0.1, s * 0.3, s * 0.15);

        ctx.restore();
    });

    // Draw moon surface with realistic texturing
    // Base surface fill
    ctx.fillStyle = '#666';
    ctx.beginPath();
    ctx.moveTo(gameState.terrain[0].x, gameState.terrain[0].y);

    gameState.terrain.forEach(point => {
        ctx.lineTo(point.x, point.y);
    });

    ctx.closePath();
    ctx.fill();

    // Add texture with small rocks/dots (pre-generated to avoid flickering)
    ctx.fillStyle = '#555';
    gameState.surfaceTexture.forEach(rock => {
        ctx.beginPath();
        ctx.arc(rock.x, rock.y, rock.size, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw darker areas in craters
    ctx.fillStyle = 'rgba(40, 40, 40, 0.5)';
    for (let i = 0; i < gameState.terrain.length - 2; i++) {
        const point = gameState.terrain[i];
        if (point.isCrater) {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Draw surface outline with highlights and shadows
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(gameState.terrain[0].x, gameState.terrain[0].y);

    for (let i = 1; i < gameState.terrain.length - 2; i++) {
        const point = gameState.terrain[i];
        const prevPoint = gameState.terrain[i - 1];

        // Calculate slope for lighting effect
        const slope = point.y - prevPoint.y;

        // Brighter on upward slopes (facing "sun"), darker on downward slopes
        if (slope < 0) {
            ctx.strokeStyle = '#999'; // Lighter
        } else if (slope > 2) {
            ctx.strokeStyle = '#666'; // Darker
        } else {
            ctx.strokeStyle = '#777'; // Medium
        }

        ctx.lineTo(point.x, point.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(point.x, point.y);
    }

    // Finish the outline
    ctx.strokeStyle = '#777';
    ctx.lineTo(gameState.terrain[gameState.terrain.length - 3].x, gameState.terrain[gameState.terrain.length - 3].y);
    ctx.stroke();

    // Draw surface rocks and boulders
    gameState.rocks.forEach(rock => {
        // Rock body
        ctx.fillStyle = `rgba(${100 * rock.shade}, ${100 * rock.shade}, ${100 * rock.shade}, 1)`;
        ctx.beginPath();
        ctx.arc(rock.x, rock.y - rock.size / 2, rock.size, 0, Math.PI * 2);
        ctx.fill();

        // Highlight on top for 3D effect
        ctx.fillStyle = `rgba(${150 * rock.shade}, ${150 * rock.shade}, ${150 * rock.shade}, 0.6)`;
        ctx.beginPath();
        ctx.arc(rock.x - rock.size * 0.2, rock.y - rock.size / 2 - rock.size * 0.2, rock.size * 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Shadow at bottom
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(rock.x, rock.y, rock.size * 0.8, rock.size * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw fuel station (Modern Sci-Fi Charging Pad with Holographic Effects)
    if (gameState.fuelStation) {
        const station = gameState.fuelStation;

        // Update pulse animation
        station.pulsePhase = (station.pulsePhase + 0.05) % (Math.PI * 2);

        const padWidth = 80;
        const padHeight = 4;
        const padY = station.y - padHeight;

        // Ground contact shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(station.x, station.y + 1, padWidth * 0.5, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Base charging pad (metallic with glow)
        ctx.fillStyle = '#2a2a2a';
        ctx.strokeStyle = '#0ff';
        ctx.lineWidth = 2;
        ctx.fillRect(station.x - padWidth / 2, padY, padWidth, padHeight);
        ctx.strokeRect(station.x - padWidth / 2, padY, padWidth, padHeight);

        // Energy core in center (pulsing)
        const corePulse = Math.sin(station.pulsePhase) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(0, 255, 255, ${corePulse})`;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#0ff';
        ctx.beginPath();
        ctx.arc(station.x, padY, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Glowing circuit lines on pad surface
        ctx.strokeStyle = `rgba(0, 255, 255, ${corePulse * 0.7})`;
        ctx.lineWidth = 2;
        const circuitPositions = [-25, -15, 15, 25];
        circuitPositions.forEach(offset => {
            ctx.beginPath();
            ctx.moveTo(station.x + offset, padY + 2);
            ctx.lineTo(station.x + offset, padY - 2);
            ctx.stroke();
        });

        // Holographic energy rings rising up (3 rings at different heights)
        for (let i = 0; i < 3; i++) {
            const ringPhase = (station.pulsePhase + i * Math.PI * 0.7) % (Math.PI * 2);
            const ringHeight = (Math.sin(ringPhase) * 0.5 + 0.5) * 80; // 0 to 80 pixels high
            const ringY = padY - ringHeight;
            const ringAlpha = (1 - ringHeight / 80) * 0.6; // Fade as they rise
            const ringRadius = 35 + ringHeight * 0.3; // Expand as they rise

            // Ring effect (ellipse for perspective)
            ctx.strokeStyle = `rgba(0, 255, 255, ${ringAlpha})`;
            ctx.lineWidth = 2;
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#0ff';
            ctx.beginPath();
            ctx.ellipse(station.x, ringY, ringRadius, 8, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.shadowBlur = 0;
        }

        // Energy particles flowing upward
        const particleCount = 8;
        for (let i = 0; i < particleCount; i++) {
            const particlePhase = (station.pulsePhase * 2 + i * Math.PI * 2 / particleCount) % (Math.PI * 2);
            const particleHeight = (Math.sin(particlePhase) * 0.5 + 0.5) * 70;
            const particleX = station.x + (Math.cos(i * Math.PI * 2 / particleCount) * 20);
            const particleY = padY - particleHeight;
            const particleAlpha = (1 - particleHeight / 70) * 0.8;

            ctx.fillStyle = `rgba(0, 255, 255, ${particleAlpha})`;
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#0ff';
            ctx.beginPath();
            ctx.arc(particleX, particleY, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        // Corner status indicators
        const cornerPositions = [
            [station.x - padWidth / 2 + 5, padY],
            [station.x + padWidth / 2 - 5, padY]
        ];

        cornerPositions.forEach(([x, y]) => {
            ctx.fillStyle = '#0ff';
            ctx.shadowBlur = 6;
            ctx.shadowColor = '#0ff';
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        });

        // "FUEL" label with glow
        ctx.fillStyle = '#0ff';
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#0ff';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('⚡ ENERGY ⚡', station.x, padY - 90);
        ctx.shadowBlur = 0;

        // Check if lander is on the platform and refueling
        const lander = gameState.lander;
        if (gameState.landed &&
            lander.x >= station.x - station.platformWidth / 2 &&
            lander.x <= station.x + station.platformWidth / 2) {

            // Energy beam connecting to lander
            const beamAlpha = Math.sin(Date.now() / 100) * 0.2 + 0.5;
            ctx.strokeStyle = `rgba(0, 255, 255, ${beamAlpha})`;
            ctx.lineWidth = 3;
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#0ff';
            ctx.beginPath();
            ctx.moveTo(station.x, padY);
            ctx.lineTo(lander.x, lander.y + lander.height / 2);
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Show refueling message with fuel percentage
            ctx.fillStyle = '#00ff00';
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#00ff00';
            ctx.font = 'bold 11px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`⚡ CHARGING ${Math.floor(gameState.fuel)}% ⚡`, station.x, padY - 100);
            ctx.shadowBlur = 0;

            // Energy flow particles along beam
            for (let i = 0; i < 5; i++) {
                const flowPhase = (Date.now() / 100 + i * 0.2) % 1;
                const flowX = station.x + (lander.x - station.x) * flowPhase;
                const flowY = padY + (lander.y + lander.height / 2 - padY) * flowPhase;

                ctx.fillStyle = `rgba(0, 255, 255, ${1 - flowPhase})`;
                ctx.shadowBlur = 6;
                ctx.shadowColor = '#0ff';
                ctx.beginPath();
                ctx.arc(flowX, flowY, 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }

    }

    // Draw flames
    gameState.flames.forEach(flame => {
        const alpha = flame.life / 20;
        ctx.fillStyle = `rgba(255, ${100 + flame.life * 7}, 0, ${alpha})`;
        ctx.beginPath();
        ctx.arc(flame.x, flame.y, flame.size, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw crash debris
    gameState.crashDebris.forEach(debris => {
        const alpha = debris.life / debris.maxLife;

        // Parse the color and add alpha
        if (debris.color.startsWith('#')) {
            const r = parseInt(debris.color.substr(1, 2), 16);
            const g = parseInt(debris.color.substr(3, 2), 16);
            const b = parseInt(debris.color.substr(5, 2), 16);
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        } else {
            ctx.fillStyle = debris.color;
        }

        ctx.beginPath();
        ctx.arc(debris.x, debris.y, debris.size * alpha, 0, Math.PI * 2);
        ctx.fill();

        // Add glow effect for fire particles
        if (debris.color === '#f00' || debris.color === '#ff8800') {
            ctx.shadowBlur = 10;
            ctx.shadowColor = debris.color;
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    });

    // Draw cockpit instruments (old analog style)
    if (!gameState.crashed) {
        drawCockpitInstruments();
    }

    // Don't draw lander if crashed
    if (gameState.crashed) {
        return;
    }

    // Draw lander
    const lander = gameState.lander;

    ctx.save();
    ctx.translate(lander.x, lander.y);
    ctx.rotate(lander.angle); // Apply rotation

    // Main body (triangular/rocket shape with more structure)
    ctx.fillStyle = '#0f0';
    ctx.strokeStyle = '#0a0';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(0, -lander.height / 2); // Top point
    ctx.lineTo(-lander.width / 2, lander.height / 2); // Bottom left
    ctx.lineTo(lander.width / 2, lander.height / 2); // Bottom right
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Panel lines for structural detail
    ctx.strokeStyle = '#0a0';
    ctx.lineWidth = 1;

    // Horizontal panels
    for (let i = 1; i <= 3; i++) {
        const y = -lander.height / 2 + (lander.height * i / 4);
        const width = (lander.width / 2) * (1 - i / 4);
        ctx.beginPath();
        ctx.moveTo(-width, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }

    // Vertical center line
    ctx.beginPath();
    ctx.moveTo(0, -lander.height / 2 + 5);
    ctx.lineTo(0, lander.height / 2 - 5);
    ctx.stroke();

    // Rivets/bolts detail
    ctx.fillStyle = '#0c0';
    const rivetSize = 1;
    for (let i = 0; i < 4; i++) {
        const y = -lander.height / 2 + 5 + i * 6;
        ctx.beginPath();
        ctx.arc(-3, y, rivetSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(3, y, rivetSize, 0, Math.PI * 2);
        ctx.fill();
    }

    // Cockpit window (larger with frame)
    ctx.strokeStyle = '#0c0';
    ctx.lineWidth = 1.5;
    ctx.fillStyle = '#003366';
    ctx.beginPath();
    ctx.arc(0, -5, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Window reflection
    ctx.fillStyle = 'rgba(100, 150, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(-1.5, -6.5, 2, 0, Math.PI * 2);
    ctx.fill();

    // Antenna on top
    ctx.strokeStyle = '#0f0';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, -lander.height / 2);
    ctx.lineTo(0, -lander.height / 2 - 8);
    ctx.stroke();

    // Antenna tip (blinking light)
    const blinkOn = Math.floor(Date.now() / 500) % 2 === 0;
    ctx.fillStyle = blinkOn ? '#f00' : '#800';
    ctx.beginPath();
    ctx.arc(0, -lander.height / 2 - 8, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Side fuel tanks
    ctx.fillStyle = '#0d0';
    ctx.strokeStyle = '#0a0';
    ctx.lineWidth = 1;

    // Left fuel tank
    ctx.fillRect(-lander.width / 2 + 2, -3, 3, 10);
    ctx.strokeRect(-lander.width / 2 + 2, -3, 3, 10);

    // Right fuel tank
    ctx.fillRect(lander.width / 2 - 5, -3, 3, 10);
    ctx.strokeRect(lander.width / 2 - 5, -3, 3, 10);

    // RCS thrusters (small side thrusters)
    ctx.fillStyle = '#0b0';
    ctx.strokeStyle = '#0a0';

    // Left RCS
    ctx.fillRect(-lander.width / 2 - 2, 0, 2, 3);
    ctx.strokeRect(-lander.width / 2 - 2, 0, 2, 3);

    // Right RCS
    ctx.fillRect(lander.width / 2, 0, 2, 3);
    ctx.strokeRect(lander.width / 2, 0, 2, 3);

    // Engine nozzle at bottom
    ctx.fillStyle = '#0a0';
    ctx.strokeStyle = '#080';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-6, lander.height / 2);
    ctx.lineTo(-4, lander.height / 2 + 3);
    ctx.lineTo(4, lander.height / 2 + 3);
    ctx.lineTo(6, lander.height / 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Main engine thruster flame
    if (gameState.keys.up && gameState.fuel > 0) {
        ctx.fillStyle = 'rgba(255, 150, 0, 0.8)';
        ctx.strokeStyle = 'rgba(255, 100, 0, 0.9)';
        ctx.lineWidth = 2;

        // Draw thruster flame with flicker
        ctx.beginPath();
        ctx.moveTo(-4, lander.height / 2 + 3);
        ctx.lineTo(0, lander.height / 2 + 10 + Math.random() * 5);
        ctx.lineTo(4, lander.height / 2 + 3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Add glow
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ff6600';
        ctx.fill();
        ctx.shadowBlur = 0;

        // Inner bright core
        ctx.fillStyle = 'rgba(255, 255, 100, 0.9)';
        ctx.beginPath();
        ctx.moveTo(-2, lander.height / 2 + 3);
        ctx.lineTo(0, lander.height / 2 + 8);
        ctx.lineTo(2, lander.height / 2 + 3);
        ctx.closePath();
        ctx.fill();
    }

    // Landing legs with more detail
    ctx.strokeStyle = '#0f0';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';

    // Left leg
    ctx.beginPath();
    ctx.moveTo(-lander.width / 2, lander.height / 2 - 2);
    ctx.lineTo(-lander.width / 2 - 3, lander.height / 2 + 3);
    ctx.lineTo(-lander.width / 2 - 6, lander.height / 2 + 5);
    ctx.stroke();

    // Left foot pad
    ctx.fillStyle = '#0f0';
    ctx.fillRect(-lander.width / 2 - 8, lander.height / 2 + 5, 4, 1);

    // Right leg
    ctx.beginPath();
    ctx.moveTo(lander.width / 2, lander.height / 2 - 2);
    ctx.lineTo(lander.width / 2 + 3, lander.height / 2 + 3);
    ctx.lineTo(lander.width / 2 + 6, lander.height / 2 + 5);
    ctx.stroke();

    // Right foot pad
    ctx.fillStyle = '#0f0';
    ctx.fillRect(lander.width / 2 + 4, lander.height / 2 + 5, 4, 1);

    // Landing leg supports/struts
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#0c0';

    // Left strut
    ctx.beginPath();
    ctx.moveTo(-lander.width / 2 + 2, lander.height / 2 - 5);
    ctx.lineTo(-lander.width / 2 - 2, lander.height / 2 + 2);
    ctx.stroke();

    // Right strut
    ctx.beginPath();
    ctx.moveTo(lander.width / 2 - 2, lander.height / 2 - 5);
    ctx.lineTo(lander.width / 2 + 2, lander.height / 2 + 2);
    ctx.stroke();

    ctx.restore();
}

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Initialize and start game
initStars();
generateTerrain();
createFuelStation();
generateRocks();
generateSurfaceTexture();
positionLanderOnTerrain();
gameState.nextStationSpawn = 300 + Math.random() * 600; // First station in 5-15 seconds
gameLoop();

