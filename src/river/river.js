// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
function resizeCanvas() {
    const maxWidth = 800;
    const maxHeight = 600;
    const windowRatio = window.innerWidth / window.innerHeight;
    const gameRatio = maxWidth / maxHeight;

    if (windowRatio > gameRatio) {
        canvas.height = Math.min(maxHeight, window.innerHeight - 20);
        canvas.width = canvas.height * gameRatio;
    } else {
        canvas.width = Math.min(maxWidth, window.innerWidth - 20);
        canvas.height = canvas.width / gameRatio;
    }
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Audio Context
let audioContext = null;

function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
}

function playSound(frequency, duration, type = 'sine', volume = 0.3) {
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;
    gainNode.gain.value = volume;

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}

const sounds = {
    shoot: () => playSound(200, 0.1, 'square', 0.15),

    explosion: () => {
        if (!audioContext) return;
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);

        osc.frequency.setValueAtTime(150, audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.3);
        gain.gain.setValueAtTime(0.2, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

        osc.start();
        osc.stop(audioContext.currentTime + 0.3);
    },

    bonus: (type) => {
        const freqMap = { ammo: 400, fuel: 500, life: 600 };
        const freq = freqMap[type] || 400;
        playSound(freq, 0.2, 'sine', 0.2);
    },

    damage: () => playSound(100, 0.2, 'sawtooth', 0.2),

    gameOver: () => {
        if (!audioContext) return;
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);

        osc.frequency.setValueAtTime(300, audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 1);
        gain.gain.setValueAtTime(0.2, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);

        osc.start();
        osc.stop(audioContext.currentTime + 1);
    },

    victory: () => {
        [400, 500, 600].forEach((freq, i) => {
            setTimeout(() => playSound(freq, 0.2, 'sine', 0.2), i * 200);
        });
    }
};

// Mobile detection
const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

// Game constants
const MAX_SPEED = 5;
const MIN_SPEED = 1;
const FUEL_DRAIN_RATE = 0.03;
const VICTORY_SCORE = 1000;

// Player object
const player = {
    x: 0,
    y: 0,
    width: 20,
    height: 30,
    speed: 2,
    dx: 0,
    rotation: 0,
    lives: 3,
    fuel: 100,
    ammo: 50,
    score: 0
};

// Game arrays
const bullets = [];
const enemies = [];
const obstacles = [];
const bonuses = [];
const particles = [];

// River banks
const riverBanks = {
    left: [],
    right: []
};

let riverOffset = 0;
let gameTime = 0;

// Generate river banks
function generateRiverBanks() {
    const centerX = canvas.width / 2;
    const amplitude = canvas.width * 0.15;
    const frequency = 0.005;

    // Generate points along the river
    for (let y = -10; y < canvas.height + 50; y += 10) {
        const offset = Math.sin((y + riverOffset) * frequency) * amplitude;

        riverBanks.left.push({
            x: centerX - canvas.width * 0.3 + offset,
            y: y
        });

        riverBanks.right.push({
            x: centerX + canvas.width * 0.3 + offset,
            y: y
        });
    }
}

function updateRiverBanks() {
    riverOffset += player.speed;

    // Clear and regenerate
    riverBanks.left = [];
    riverBanks.right = [];
    generateRiverBanks();
}

function drawRiverBanks() {
    // Draw filled land areas outside the river (left side)
    ctx.save();
    const leftGradient = ctx.createLinearGradient(0, 0, canvas.width / 2, 0);
    leftGradient.addColorStop(0, '#2d4a1e');
    leftGradient.addColorStop(1, 'rgba(45, 74, 30, 0)');
    ctx.fillStyle = leftGradient;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    riverBanks.left.forEach((point) => {
        ctx.lineTo(point.x, point.y);
    });
    ctx.lineTo(0, canvas.height);
    ctx.closePath();
    ctx.fill();

    // Right side land
    const rightGradient = ctx.createLinearGradient(canvas.width, 0, canvas.width / 2, 0);
    rightGradient.addColorStop(0, '#2d4a1e');
    rightGradient.addColorStop(1, 'rgba(45, 74, 30, 0)');
    ctx.fillStyle = rightGradient;

    ctx.beginPath();
    ctx.moveTo(canvas.width, 0);
    ctx.lineTo(canvas.width, canvas.height);
    riverBanks.right.forEach((point) => {
        ctx.lineTo(point.x, point.y);
    });
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Draw shadow/dark edge (inner side)
    ctx.save();
    ctx.strokeStyle = '#1a3010';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 10;

    // Left bank shadow
    ctx.beginPath();
    riverBanks.left.forEach((point, index) => {
        if (index === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
    });
    ctx.stroke();

    // Right bank shadow
    ctx.beginPath();
    riverBanks.right.forEach((point, index) => {
        if (index === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
    });
    ctx.stroke();
    ctx.restore();

    // Draw main bank line (bright green)
    ctx.save();
    ctx.strokeStyle = '#4a8c2a';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = '#4a8c2a';
    ctx.shadowBlur = 8;

    // Left bank
    ctx.beginPath();
    riverBanks.left.forEach((point, index) => {
        if (index === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
    });
    ctx.stroke();

    // Right bank
    ctx.beginPath();
    riverBanks.right.forEach((point, index) => {
        if (index === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
    });
    ctx.stroke();
    ctx.restore();

    // Draw grass/vegetation details
    ctx.save();
    ctx.strokeStyle = '#6cb33f';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';

    // Left bank grass
    for (let i = 0; i < riverBanks.left.length; i += 3) {
        const point = riverBanks.left[i];
        // Draw small grass blades
        for (let g = 0; g < 2; g++) {
            const offsetX = Math.random() * 8 - 4;
            const offsetY = Math.random() * 6 - 3;
            ctx.beginPath();
            ctx.moveTo(point.x + offsetX, point.y + offsetY);
            ctx.lineTo(point.x + offsetX - 3, point.y + offsetY - 5);
            ctx.stroke();
        }
    }

    // Right bank grass
    for (let i = 0; i < riverBanks.right.length; i += 3) {
        const point = riverBanks.right[i];
        for (let g = 0; g < 2; g++) {
            const offsetX = Math.random() * 8 - 4;
            const offsetY = Math.random() * 6 - 3;
            ctx.beginPath();
            ctx.moveTo(point.x + offsetX, point.y + offsetY);
            ctx.lineTo(point.x + offsetX + 3, point.y + offsetY - 5);
            ctx.stroke();
        }
    }
    ctx.restore();

    // Draw highlight edge (lightest, outermost)
    ctx.save();
    ctx.strokeStyle = '#8fdb5f';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = 0.8;

    // Left bank highlight
    ctx.beginPath();
    riverBanks.left.forEach((point, index) => {
        if (index === 0) ctx.moveTo(point.x - 2, point.y);
        else ctx.lineTo(point.x - 2, point.y);
    });
    ctx.stroke();

    // Right bank highlight
    ctx.beginPath();
    riverBanks.right.forEach((point, index) => {
        if (index === 0) ctx.moveTo(point.x + 2, point.y);
        else ctx.lineTo(point.x + 2, point.y);
    });
    ctx.stroke();
    ctx.restore();
}

// Initialize player position
function initPlayer() {
    player.x = canvas.width / 2;
    player.y = canvas.height - 100;
}

initPlayer();
generateRiverBanks();

// Shooting
function shoot() {
    if (player.ammo > 0) {
        bullets.push({
            x: player.x,
            y: player.y - player.height / 2,
            speed: 8,
            angle: player.rotation,
            width: 4,
            height: 10
        });
        player.ammo--;
        sounds.shoot();
    }
}

// Enemy spawning
function spawnEnemy() {
    const type = Math.random() > 0.6 ? 'air' : 'water';
    const centerX = canvas.width / 2;
    const minX = centerX - canvas.width * 0.25;
    const maxX = centerX + canvas.width * 0.25;

    enemies.push({
        x: minX + Math.random() * (maxX - minX),
        y: -50,
        type: type,
        health: 1,
        speed: Math.random() * 1.5 + 1,
        points: type === 'air' ? 20 : 10,
        width: type === 'air' ? 15 : 20,
        height: type === 'air' ? 15 : 25,
        oscillation: Math.random() * Math.PI * 2,
        oscillationSpeed: Math.random() * 0.02 + 0.01
    });
}

// Obstacle generation
function generateObstacles() {
    if (Math.random() < 0.015) {
        const centerX = canvas.width / 2;
        const side = Math.random() > 0.5 ? 'left' : 'right';
        const minX = centerX - canvas.width * 0.25;
        const maxX = centerX + canvas.width * 0.25;

        let x;
        if (side === 'left') {
            x = minX + Math.random() * (centerX - minX - 100);
        } else {
            x = centerX + 50 + Math.random() * (maxX - centerX - 50);
        }

        obstacles.push({
            x: x,
            y: -30,
            width: 20 + Math.random() * 30,
            height: 20 + Math.random() * 30,
            type: Math.random() > 0.5 ? 'rock' : 'log'
        });
    }
}

// Bonus spawning
function spawnBonus() {
    const types = ['ammo', 'fuel', 'life'];
    const type = types[Math.floor(Math.random() * types.length)];
    const centerX = canvas.width / 2;
    const minX = centerX - canvas.width * 0.2;
    const maxX = centerX + canvas.width * 0.2;

    bonuses.push({
        x: minX + Math.random() * (maxX - minX),
        y: -30,
        type: type,
        width: 20,
        height: 20,
        animation: 0
    });
}

// Particle system
function createExplosion(x, y, color) {
    for (let i = 0; i < 15; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4 + 2;
        particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1,
            color: color,
            rotation: Math.random() * Math.PI * 2
        });
    }

    // Add some white/bright particles for flash effect
    for (let i = 0; i < 5; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 6 + 1;
        particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 0.8,
            color: '#ffffff',
            rotation: Math.random() * Math.PI * 2
        });
    }
}

// Keyboard controls
const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === ' ') {
        e.preventDefault();
        if (!isPaused) {
            initAudio();
            shoot();
        }
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

function handleKeyboard() {
    if (keys['ArrowUp']) {
        player.speed = Math.min(player.speed + 0.05, MAX_SPEED);
    }
    if (keys['ArrowDown']) {
        player.speed = Math.max(player.speed - 0.05, MIN_SPEED);
    }
    if (keys['ArrowLeft']) {
        player.x -= 4;
        player.rotation = -0.15;
    } else if (keys['ArrowRight']) {
        player.x += 4;
        player.rotation = 0.15;
    } else {
        player.rotation *= 0.9; // Smooth return to center
    }
}

// Mobile controls
if (isMobile && window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', (e) => {
        if (!isPaused) {
            const tilt = e.gamma; // -90 to 90
            if (tilt !== null) {
                player.x += tilt * 0.4;
                player.rotation = tilt * 0.003;
            }
        }
    });
}

const shootBtn = document.getElementById('shootBtn');
if (shootBtn) {
    shootBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (!isPaused) {
            initAudio();
            shoot();
        }
    });
}

// Touch on canvas for shooting
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    initAudio();
    if (!isPaused) {
        shoot();
    }
});

// Pause/Play
let isPaused = false;
const pauseBtn = document.getElementById('pauseBtn');
pauseBtn.addEventListener('click', () => {
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? 'Play' : 'Pause';
});

// Collision detection
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

function handleCollisions() {
    // Bullets vs Enemies
    for (let i = bullets.length - 1; i >= 0; i--) {
        for (let j = enemies.length - 1; j >= 0; j--) {
            if (checkCollision(bullets[i], enemies[j])) {
                player.score += enemies[j].points;
                createExplosion(enemies[j].x, enemies[j].y, '#ff3366');
                sounds.explosion();
                bullets.splice(i, 1);
                enemies.splice(j, 1);
                break;
            }
        }
    }

    // Player vs Enemies
    for (let i = enemies.length - 1; i >= 0; i--) {
        if (checkCollision(player, enemies[i])) {
            player.lives--;
            sounds.damage();
            createExplosion(enemies[i].x, enemies[i].y, '#ff3366');
            enemies.splice(i, 1);
        }
    }

    // Player vs Obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
        if (checkCollision(player, obstacles[i])) {
            player.lives--;
            sounds.damage();
            createExplosion(obstacles[i].x, obstacles[i].y, '#ea5455');
            obstacles.splice(i, 1);
        }
    }

    // Player vs Bonuses
    for (let i = bonuses.length - 1; i >= 0; i--) {
        if (checkCollision(player, bonuses[i])) {
            const bonus = bonuses[i];
            switch(bonus.type) {
                case 'ammo':
                    player.ammo += 20;
                    break;
                case 'fuel':
                    player.fuel = Math.min(player.fuel + 25, 100);
                    break;
                case 'life':
                    player.lives++;
                    break;
            }
            sounds.bonus(bonus.type);
            createExplosion(bonus.x, bonus.y, '#ffff00');
            bonuses.splice(i, 1);
        }
    }

    // Player vs River banks
    if (riverBanks.left.length > 0 && riverBanks.right.length > 0) {
        const playerMidY = Math.floor(riverBanks.left.length / 2);
        if (playerMidY < riverBanks.left.length) {
            const leftBankX = riverBanks.left[playerMidY].x;
            const rightBankX = riverBanks.right[playerMidY].x;

            if (player.x - player.width / 2 < leftBankX ||
                player.x + player.width / 2 > rightBankX) {
                player.x = Math.max(leftBankX + player.width / 2,
                             Math.min(player.x, rightBankX - player.width / 2));
            }
        }
    }
}

// Update functions
function updatePlayer() {
    // Keep player in bounds horizontally
    player.x = Math.max(player.width / 2, Math.min(player.x, canvas.width - player.width / 2));
    player.y = Math.max(player.height / 2, Math.min(player.y, canvas.height - player.height / 2));
}

function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].y -= bullets[i].speed;
        bullets[i].x += bullets[i].angle * 2;

        if (bullets[i].y < -10) {
            bullets.splice(i, 1);
        }
    }
}

function updateEnemies() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        enemies[i].y += player.speed;

        // Add oscillation for air enemies
        if (enemies[i].type === 'air') {
            enemies[i].oscillation += enemies[i].oscillationSpeed;
            enemies[i].x += Math.sin(enemies[i].oscillation) * 1.5;
        }

        if (enemies[i].y > canvas.height + 50) {
            enemies.splice(i, 1);
        }
    }
}

function updateObstacles() {
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].y += player.speed;

        if (obstacles[i].y > canvas.height + 50) {
            obstacles.splice(i, 1);
        }
    }
}

function updateBonuses() {
    for (let i = bonuses.length - 1; i >= 0; i--) {
        bonuses[i].y += player.speed * 0.8;
        bonuses[i].animation += 0.1;

        if (bonuses[i].y > canvas.height + 50) {
            bonuses.splice(i, 1);
        }
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].x += particles[i].vx;
        particles[i].y += particles[i].vy;
        particles[i].life -= 0.02;

        if (particles[i].life <= 0) {
            particles.splice(i, 1);
        }
    }
}

function updateFuel() {
    player.fuel -= FUEL_DRAIN_RATE;
    if (player.fuel <= 0) {
        player.fuel = 0;
        gameOver('OUT OF FUEL');
    }
}

// Draw functions
function drawRiverBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#16213e');
    gradient.addColorStop(1, '#0f3460');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Water texture
    ctx.save();
    ctx.globalAlpha = 0.1;
    ctx.strokeStyle = '#00f3ff';
    for (let i = 0; i < 5; i++) {
        const offset = (riverOffset * 0.5 + i * 100) % canvas.height;
        ctx.beginPath();
        for (let x = 0; x < canvas.width; x += 20) {
            const y = offset + Math.sin((x + riverOffset) * 0.02) * 10;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
    }
    ctx.restore();
}

function drawPlayer() {
    ctx.save();

    // Water wake/ripples behind boat
    ctx.globalAlpha = 0.3;
    ctx.strokeStyle = '#00f3ff';
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
        const offset = i * 8;
        const width = 15 + i * 5;
        ctx.beginPath();
        ctx.arc(player.x, player.y + player.height / 2 + offset, width, 0, Math.PI, true);
        ctx.stroke();
    }
    ctx.globalAlpha = 1;

    ctx.translate(player.x, player.y);
    ctx.rotate(player.rotation);

    // Glow effect
    ctx.shadowColor = '#00f3ff';
    ctx.shadowBlur = 20;

    // Main hull gradient
    const gradient = ctx.createLinearGradient(0, -player.height / 2, 0, player.height / 2);
    gradient.addColorStop(0, '#00f3ff');
    gradient.addColorStop(0.5, '#0099ff');
    gradient.addColorStop(1, '#0066cc');
    ctx.fillStyle = gradient;

    // Main boat body - streamlined shape
    ctx.beginPath();
    ctx.moveTo(0, -player.height / 2);
    ctx.lineTo(-player.width / 2, 0);
    ctx.lineTo(-player.width / 3, player.height / 2);
    ctx.lineTo(player.width / 3, player.height / 2);
    ctx.lineTo(player.width / 2, 0);
    ctx.closePath();
    ctx.fill();

    // Deck/cabin
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.moveTo(0, -player.height / 4);
    ctx.lineTo(-player.width / 4, player.height / 6);
    ctx.lineTo(player.width / 4, player.height / 6);
    ctx.closePath();
    ctx.fill();

    // Window/cockpit
    ctx.fillStyle = 'rgba(0, 243, 255, 0.6)';
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();

    // Engine glow at back
    ctx.shadowBlur = 25;
    ctx.shadowColor = '#00ffff';
    ctx.fillStyle = '#00ffff';
    ctx.fillRect(-3, player.height / 2 - 2, 6, 4);

    // Outline
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, -player.height / 2);
    ctx.lineTo(-player.width / 2, 0);
    ctx.lineTo(-player.width / 3, player.height / 2);
    ctx.lineTo(player.width / 3, player.height / 2);
    ctx.lineTo(player.width / 2, 0);
    ctx.closePath();
    ctx.stroke();

    // Speed indicator lines
    if (player.speed > 3) {
        ctx.globalAlpha = 0.5;
        ctx.strokeStyle = '#00f3ff';
        ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(-player.width / 2 - 3, player.height / 4 + i * 3);
            ctx.lineTo(-player.width / 2 - 8, player.height / 4 + i * 3 + 5);
            ctx.moveTo(player.width / 2 + 3, player.height / 4 + i * 3);
            ctx.lineTo(player.width / 2 + 8, player.height / 4 + i * 3 + 5);
            ctx.stroke();
        }
    }

    ctx.restore();
}

function drawBullets() {
    bullets.forEach(bullet => {
        ctx.save();

        // Extended trail effect
        const trailLength = 5;
        for (let i = 0; i < trailLength; i++) {
            ctx.globalAlpha = (trailLength - i) / trailLength * 0.5;
            ctx.strokeStyle = '#00f3ff';
            ctx.lineWidth = 3 - (i * 0.4);
            ctx.beginPath();
            ctx.moveTo(bullet.x, bullet.y + i * 3);
            ctx.lineTo(bullet.x, bullet.y + (i + 1) * 3);
            ctx.stroke();
        }

        // Main bullet energy core
        ctx.globalAlpha = 1;
        ctx.shadowColor = '#00f3ff';
        ctx.shadowBlur = 15;

        // Outer glow
        const gradient = ctx.createRadialGradient(bullet.x, bullet.y, 0, bullet.x, bullet.y, bullet.width * 2);
        gradient.addColorStop(0, 'rgba(0, 243, 255, 1)');
        gradient.addColorStop(0.5, 'rgba(0, 243, 255, 0.5)');
        gradient.addColorStop(1, 'rgba(0, 243, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.width * 2, 0, Math.PI * 2);
        ctx.fill();

        // Core bullet
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(bullet.x - bullet.width / 2, bullet.y - bullet.height / 2,
                     bullet.width, bullet.height);

        // Energy crackle
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.globalAlpha = Math.random() * 0.5 + 0.5;
        ctx.beginPath();
        ctx.moveTo(bullet.x - bullet.width, bullet.y);
        ctx.lineTo(bullet.x + bullet.width, bullet.y);
        ctx.moveTo(bullet.x, bullet.y - bullet.width);
        ctx.lineTo(bullet.x, bullet.y + bullet.width);
        ctx.stroke();

        ctx.restore();
    });
}

function drawEnemies() {
    enemies.forEach(enemy => {
        ctx.save();
        ctx.translate(enemy.x, enemy.y);

        if (enemy.type === 'air') {
            // Air enemy - helicopter/drone style
            ctx.shadowColor = '#ffff00';
            ctx.shadowBlur = 15;

            // Pulsating effect
            const pulse = 1 + Math.sin(gameTime * 0.005) * 0.1;
            ctx.scale(pulse, pulse);

            // Main body - diamond shape
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, enemy.width);
            gradient.addColorStop(0, '#ffff00');
            gradient.addColorStop(0.5, '#ffaa00');
            gradient.addColorStop(1, '#00f3ff');
            ctx.fillStyle = gradient;

            ctx.beginPath();
            ctx.moveTo(0, -enemy.height / 2);
            ctx.lineTo(enemy.width / 2, 0);
            ctx.lineTo(0, enemy.height / 2);
            ctx.lineTo(-enemy.width / 2, 0);
            ctx.closePath();
            ctx.fill();

            // Inner glow
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.beginPath();
            ctx.moveTo(0, -enemy.height / 4);
            ctx.lineTo(enemy.width / 4, 0);
            ctx.lineTo(0, enemy.height / 4);
            ctx.lineTo(-enemy.width / 4, 0);
            ctx.closePath();
            ctx.fill();

            // Propellers/wings
            ctx.strokeStyle = '#00f3ff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-enemy.width / 2 - 5, -2);
            ctx.lineTo(-enemy.width / 2 - 5, 2);
            ctx.moveTo(enemy.width / 2 + 5, -2);
            ctx.lineTo(enemy.width / 2 + 5, 2);
            ctx.stroke();

            // Eyes/sensors
            ctx.fillStyle = '#ff0000';
            ctx.beginPath();
            ctx.arc(-3, -2, 2, 0, Math.PI * 2);
            ctx.arc(3, -2, 2, 0, Math.PI * 2);
            ctx.fill();

        } else {
            // Water enemy - boat/ship style
            ctx.shadowColor = '#ff3366';
            ctx.shadowBlur = 15;

            // Main hull
            const gradient = ctx.createLinearGradient(0, -enemy.height / 2, 0, enemy.height / 2);
            gradient.addColorStop(0, '#ff3366');
            gradient.addColorStop(0.5, '#ff0044');
            gradient.addColorStop(1, '#cc0033');
            ctx.fillStyle = gradient;

            // Hull shape
            ctx.beginPath();
            ctx.moveTo(0, -enemy.height / 2);
            ctx.lineTo(-enemy.width / 2, enemy.height / 3);
            ctx.lineTo(-enemy.width / 3, enemy.height / 2);
            ctx.lineTo(enemy.width / 3, enemy.height / 2);
            ctx.lineTo(enemy.width / 2, enemy.height / 3);
            ctx.closePath();
            ctx.fill();

            // Deck detail
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fillRect(-enemy.width / 4, -enemy.height / 4, enemy.width / 2, enemy.height / 3);

            // Outline
            ctx.strokeStyle = '#ff6699';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, -enemy.height / 2);
            ctx.lineTo(-enemy.width / 2, enemy.height / 3);
            ctx.lineTo(-enemy.width / 3, enemy.height / 2);
            ctx.lineTo(enemy.width / 3, enemy.height / 2);
            ctx.lineTo(enemy.width / 2, enemy.height / 3);
            ctx.closePath();
            ctx.stroke();

            // Cannon/weapon
            ctx.fillStyle = '#ffff00';
            ctx.fillRect(-2, -enemy.height / 2 - 5, 4, 6);

            // Wake effect in water
            ctx.globalAlpha = 0.3;
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(-enemy.width / 2, enemy.height / 2);
            ctx.lineTo(-enemy.width / 2 - 5, enemy.height / 2 + 8);
            ctx.moveTo(enemy.width / 2, enemy.height / 2);
            ctx.lineTo(enemy.width / 2 + 5, enemy.height / 2 + 8);
            ctx.stroke();
        }

        ctx.restore();
    });
}

function drawObstacles() {
    obstacles.forEach(obs => {
        ctx.save();
        ctx.translate(obs.x, obs.y);

        if (obs.type === 'rock') {
            // Rock with texture
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, obs.width / 2);
            gradient.addColorStop(0, '#4a5568');
            gradient.addColorStop(0.6, '#2d4059');
            gradient.addColorStop(1, '#1a1a2e');
            ctx.fillStyle = gradient;

            // Irregular rock shape
            ctx.beginPath();
            const angles = 8;
            for (let i = 0; i < angles; i++) {
                const angle = (Math.PI * 2 * i) / angles;
                const radius = (obs.width / 2) * (0.8 + Math.random() * 0.4);
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();

            // Highlights on rock
            ctx.fillStyle = 'rgba(200, 200, 200, 0.3)';
            ctx.beginPath();
            ctx.arc(-obs.width / 6, -obs.height / 6, obs.width / 6, 0, Math.PI * 2);
            ctx.fill();

            // Cracks/details
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(-obs.width / 4, -obs.height / 4);
            ctx.lineTo(obs.width / 6, obs.height / 6);
            ctx.moveTo(obs.width / 5, -obs.height / 5);
            ctx.lineTo(obs.width / 3, obs.height / 4);
            ctx.stroke();

            // Border glow
            ctx.strokeStyle = '#ea5455';
            ctx.lineWidth = 2;
            ctx.shadowColor = '#ea5455';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            for (let i = 0; i < angles; i++) {
                const angle = (Math.PI * 2 * i) / angles;
                const radius = (obs.width / 2) * (0.8 + Math.random() * 0.4);
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.stroke();

        } else {
            // Log with wood texture
            const gradient = ctx.createLinearGradient(-obs.width / 2, 0, obs.width / 2, 0);
            gradient.addColorStop(0, '#3d2817');
            gradient.addColorStop(0.5, '#5c4033');
            gradient.addColorStop(1, '#3d2817');
            ctx.fillStyle = gradient;

            // Main log body
            ctx.beginPath();
            ctx.roundRect(-obs.width / 2, -obs.height / 2, obs.width, obs.height, 5);
            ctx.fill();

            // Wood rings at ends
            ctx.strokeStyle = '#2d1810';
            ctx.lineWidth = 1;
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.arc(-obs.width / 2 + 5, 0, 2 + i * 2, 0, Math.PI * 2);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(obs.width / 2 - 5, 0, 2 + i * 2, 0, Math.PI * 2);
                ctx.stroke();
            }

            // Wood grain
            ctx.strokeStyle = 'rgba(61, 40, 23, 0.5)';
            for (let i = -obs.width / 3; i < obs.width / 3; i += 8) {
                ctx.beginPath();
                ctx.moveTo(i, -obs.height / 2);
                ctx.lineTo(i + 2, obs.height / 2);
                ctx.stroke();
            }

            // Highlight
            ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.fillRect(-obs.width / 3, -obs.height / 2 + 2, obs.width / 1.5, obs.height / 4);

            // Border
            ctx.strokeStyle = '#ea5455';
            ctx.lineWidth = 2;
            ctx.shadowColor = '#ea5455';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.roundRect(-obs.width / 2, -obs.height / 2, obs.width, obs.height, 5);
            ctx.stroke();
        }

        ctx.restore();
    });
}

function drawBonuses() {
    bonuses.forEach(bonus => {
        ctx.save();

        const scale = 0.9 + Math.sin(bonus.animation) * 0.15;
        ctx.translate(bonus.x, bonus.y);
        ctx.scale(scale, scale);
        ctx.rotate(bonus.animation * 0.3);

        let gradient;
        let color1, color2;

        switch(bonus.type) {
            case 'ammo':
                color1 = '#ffff00';
                color2 = '#ffaa00';
                break;
            case 'fuel':
                color1 = '#00ff88';
                color2 = '#00aa66';
                break;
            case 'life':
                color1 = '#ff3366';
                color2 = '#ff0044';
                break;
        }

        // Outer glow ring
        ctx.shadowColor = color1;
        ctx.shadowBlur = 20;
        ctx.strokeStyle = color1;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.arc(0, 0, bonus.width / 2 + 5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;

        // Main box with gradient
        gradient = ctx.createLinearGradient(0, -bonus.height / 2, 0, bonus.height / 2);
        gradient.addColorStop(0, color1);
        gradient.addColorStop(0.5, color2);
        gradient.addColorStop(1, color1);
        ctx.fillStyle = gradient;

        ctx.shadowBlur = 15;
        const radius = 4;
        ctx.beginPath();
        ctx.roundRect(-bonus.width / 2, -bonus.height / 2, bonus.width, bonus.height, radius);
        ctx.fill();

        // Inner highlight
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillRect(-bonus.width / 3, -bonus.height / 3, bonus.width / 1.5, 3);

        // Draw icon
        ctx.fillStyle = '#000000';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (bonus.type === 'ammo') {
            // Bullet icon
            ctx.fillRect(-2, -6, 4, 10);
            ctx.beginPath();
            ctx.arc(0, -6, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillRect(-3, 4, 6, 2);
        } else if (bonus.type === 'fuel') {
            // Gas can icon
            ctx.strokeRect(-5, -4, 10, 8);
            ctx.fillRect(-5, -4, 10, 8);
            ctx.fillStyle = color1;
            ctx.fillRect(-4, -3, 8, 2);
            ctx.fillStyle = '#000000';
            ctx.fillRect(-2, -7, 4, 3);
        } else if (bonus.type === 'life') {
            // Heart icon
            ctx.beginPath();
            ctx.moveTo(0, 4);
            ctx.bezierCurveTo(-6, -2, -6, -6, 0, -3);
            ctx.bezierCurveTo(6, -6, 6, -2, 0, 4);
            ctx.closePath();
            ctx.fill();
        }

        ctx.restore();
    });
}

function drawParticles() {
    particles.forEach(particle => {
        ctx.save();
        ctx.globalAlpha = particle.life;
        ctx.translate(particle.x, particle.y);

        // Rotate particle
        if (particle.rotation !== undefined) {
            ctx.rotate(particle.rotation);
            particle.rotation += 0.1;
        }

        // Shadow glow
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = 8;

        ctx.fillStyle = particle.color;

        // Different particle shapes
        const size = 3 + (1 - particle.life) * 2;
        if (Math.random() > 0.5) {
            ctx.fillRect(-size / 2, -size / 2, size, size);
        } else {
            ctx.beginPath();
            ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    });
}

// UI Update
function updateUI() {
    document.getElementById('score').textContent = player.score;
    document.getElementById('lives').textContent = player.lives;
    document.getElementById('fuelBar').style.width = player.fuel + '%';
    document.getElementById('ammo').textContent = player.ammo;
}

// Game Over
function gameOver(reason) {
    isPaused = true;
    sounds.gameOver();
    document.getElementById('gameOverScreen').style.display = 'block';
    document.getElementById('finalScore').textContent = player.score;
    document.getElementById('gameOverReason').textContent = reason;
}

// Victory
function victory() {
    isPaused = true;
    sounds.victory();
    document.getElementById('victoryScreen').style.display = 'block';
    document.getElementById('victoryScore').textContent = player.score;
}

function checkVictory() {
    if (player.score >= VICTORY_SCORE) {
        victory();
    }
}

// Restart
function restartGame() {
    player.lives = 3;
    player.fuel = 100;
    player.ammo = 50;
    player.score = 0;
    player.speed = 2;
    player.rotation = 0;
    initPlayer();

    bullets.length = 0;
    enemies.length = 0;
    obstacles.length = 0;
    bonuses.length = 0;
    particles.length = 0;

    riverOffset = 0;
    gameTime = 0;
    generateRiverBanks();

    document.getElementById('gameOverScreen').style.display = 'none';
    document.getElementById('victoryScreen').style.display = 'none';

    isPaused = false;
    pauseBtn.textContent = 'Pause';
}

// Main game loop
let lastTime = 0;
let enemySpawnTimer = 0;
let bonusSpawnTimer = 0;

function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    if (!isPaused) {
        gameTime += deltaTime;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw background
        drawRiverBackground();
        drawRiverBanks();

        // Update
        handleKeyboard();
        updatePlayer();
        updateFuel();
        updateBullets();
        updateEnemies();
        updateObstacles();
        updateBonuses();
        updateParticles();
        updateRiverBanks();

        // Spawn enemies
        enemySpawnTimer += deltaTime;
        if (enemySpawnTimer > 1500) {
            spawnEnemy();
            enemySpawnTimer = 0;
        }

        // Spawn bonuses
        bonusSpawnTimer += deltaTime;
        if (bonusSpawnTimer > 5000 + Math.random() * 3000) {
            spawnBonus();
            bonusSpawnTimer = 0;
        }

        // Generate obstacles
        generateObstacles();

        // Collisions
        handleCollisions();

        // Check conditions
        checkVictory();
        if (player.lives <= 0) {
            gameOver('NO LIVES LEFT');
        }

        // Draw everything
        drawObstacles();
        drawBonuses();
        drawEnemies();
        drawBullets();
        drawPlayer();
        drawParticles();

        // Update UI
        updateUI();
    }

    requestAnimationFrame(gameLoop);
}

// Start game
gameLoop(0);

