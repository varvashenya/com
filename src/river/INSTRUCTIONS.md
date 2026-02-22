# Instrukcje dla GitHub Copilot - Gra "River"

## Przegląd Projektu
Stwórz grę zręcznościową "River" w stylu klasycznych automatów arcade, gdzie gracz steruje łodzią motorową poruszającą się po nieskończonej rzece, unikając przeszkód, zbierając bonusy i strzelając do wrogów.

## Wymagania Techniczne
- **Tylko vanilla JavaScript** - żadnych frameworków
- Czysty HTML5 z Canvas API
- CSS dla układu interfejsu
- Lokalizacja: wszystkie teksty w języku angielskim

## Struktura Plików
Utwórz następujące pliki w folderze `src/river/`:
- `index.html` - główny plik HTML
- `river.js` - cała logika gry
- `river.css` - style (opcjonalne, można użyć inline)

## Krok 1: Struktura HTML (index.html)

Utwórz podstawowy HTML z:
- Canvas element o ID "gameCanvas"
- Interfejs użytkownika:
  - Przycisk Pause/Play
  - Wyświetlacz punktów (Score)
  - Wyświetlacz żyć (Lives)
  - Wyświetlacz paliwa (Fuel gauge/bar)
  - Wyświetlacz amunicji (Ammo counter)
  - Ekran Game Over z przyciskiem Restart
  - Ekran Victory (jeśli osiągnięto wysoki wynik)
- Kontrolki mobilne (widoczne tylko na urządzeniach dotykowych):
  - Przycisk strzału (duży, łatwy do trafienia)
  - Wskaźnik czy używany jest akcelerometr

## Krok 2: Inicjalizacja Canvas i Kontekstu Gry (river.js)

```javascript
// Podstawowa struktura:
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Ustaw rozmiar canvas na pełny ekran lub responsywny
// Zachowaj proporcje odpowiednie dla gry pionowej/poziomej
```

## Krok 3: Obiekt Gracza (Łódź)

Stwórz klasę lub obiekt reprezentujący łódź gracza:
- **Pozycja**: x, y (początkowa pozycja na środku, u dołu ekranu)
- **Prędkość**: speed (kontrolowana klawiszami Up/Down)
  - Strzałka w górę: zwiększa prędkość
  - Strzałka w dół: zmniejsza prędkość
  - Minimalna i maksymalna prędkość
- **Kierunek poziomy**: dx (Left/Right)
- **Rotacja**: niewielki kąt przy skręcaniu w lewo/prawo
- **Statystyki**:
  - lives (np. 3 życia na start)
  - fuel (np. 100, zmniejsza się w czasie)
  - ammo (amunicja, np. 50 na start)
  - score (punkty)
- **Wymiary**: szerokość i wysokość hitboxa
- **Metody**:
  - update() - aktualizacja pozycji
  - draw() - rysowanie łodzi (prostokąt, trójkąt lub sprite)
  - shoot() - tworzenie pocisku

## Krok 4: System Strzałów

Stwórz tablicę pocisków:
- Pociski lecą prosto do góry ekranu (kierunek ruchu rzeki)
- Przy strzale w lewo/prawo: lekkie odchylenie zgodne z rotacją łodzi
- Koszt strzału: -1 amunicja
- Sprawdzaj kolizje z wrogami
- Usuń pociski poza ekranem

```javascript
const bullets = [];
function shoot() {
  if (player.ammo > 0) {
    bullets.push({
      x: player.x,
      y: player.y,
      speed: 8,
      angle: player.rotation // niewielkie odchylenie
    });
    player.ammo--;
  }
}
```

## Krok 5: Generowanie Mapy Rzeki

Proceduralnie generuj rzekę:
- **Brzegi rzeki**: 
  - Rysuj jako **ciągłe linie** (używaj `ctx.lineTo()`)
  - Lewa i prawa krawędź z płynną animacją (lekkie fale, sine wave)
  - Kolor: ciemniejszy odcień zieleni/brązu (#2d5016 lub podobny)
  - Grubość linii: 3-4px dla lepszej widoczności
  - Brzegi się lekko zmieniają (zakręty), ale zawsze pozostawiają wystarczającą szerokość
- **Szerokość**: zawsze wystarczająca aby można było przejechać (minimum 60% szerokości canvas)
- **Przeszkody**: 
  - Skały, pnie drzew, wysepki
  - Generuj przed kamerą (powyżej widocznego obszaru)
  - Zawsze pozostaw przejście dla gracza
  - Algorytm: użyj siatki, upewnij się że jest korytarz o minimalnej szerokości
- **Wyspy/odcinki**: mogą zawężać rzekę ale nie blokować całkowicie

```javascript
// Struktura dla brzegów rzeki
const riverBanks = {
  left: [],   // Tablica punktów dla lewego brzegu
  right: []   // Tablica punktów dla prawego brzegu
};

function generateRiverBanks() {
  // Generuj punkty brzegów używając funkcji sinus dla płynnych zakrętów
  // Dodawaj nowe punkty na górze, usuń stare na dole
  const centerX = canvas.width / 2;
  const amplitude = canvas.width * 0.15; // Jak bardzo rzeka się wije
  const frequency = 0.01; // Częstotliwość zakrętów
  
  // Przykład dla lewego brzegu
  const offset = Math.sin(Date.now() * frequency) * amplitude;
  riverBanks.left.push({
    x: centerX - canvas.width * 0.3 + offset,
    y: -10
  });
}

function drawRiverBanks() {
  ctx.strokeStyle = '#2d5016';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  // Rysuj lewy brzeg
  ctx.beginPath();
  riverBanks.left.forEach((point, index) => {
    if (index === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  });
  ctx.stroke();
  
  // Rysuj prawy brzeg
  ctx.beginPath();
  riverBanks.right.forEach((point, index) => {
    if (index === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  });
  ctx.stroke();
}

const obstacles = [];
function generateObstacles() {
  // Sprawdź czy potrzeba dodać nowe przeszkody
  // Dodaj losowe przeszkody, ale zapewnij przejście
  // Usuń przeszkody poza ekranem (poniżej)
}
```

## Krok 6: Wrogowie (Cele)

Stwórz system wrogów:
- **Typy wrogów**:
  - Wodne: inne łodzie, kajaki (poruszają się po wodzie)
  - Powietrzne: helikoptery, ptaki (nad rzeką)
- **Spawn**: losowo, okresowo
- **Ruch**: 
  - Niektórzy statyczni
  - Niektórzy poruszają się w poprzek rzeki
  - Niektórzy podążają za graczem
- **Kolizje**: trafienie pociskiem = zniszczenie + punkty
- **Punkty**: różne wartości dla różnych typów

```javascript
const enemies = [];
function spawnEnemy() {
  const type = Math.random() > 0.5 ? 'water' : 'air';
  enemies.push({
    x: Math.random() * canvas.width,
    y: -50,
    type: type,
    health: 1,
    speed: Math.random() * 2 + 1,
    points: type === 'air' ? 20 : 10
  });
}
```

## Krok 7: System Bonusów

Stwórz różne bonusy:
- **Ammo** (amunicja): +10 lub +20 pocisków
- **Fuel** (paliwo): +25 paliwa
- **Repair/Life** (życie): +1 życie lub naprawa
- **Spawn**: rzadziej niż wrogowie
- **Grafika**: różne kolory/kształty dla każdego typu
- **Zbieranie**: kolizja z graczem

```javascript
const bonuses = [];
function spawnBonus() {
  const types = ['ammo', 'fuel', 'life'];
  const type = types[Math.floor(Math.random() * types.length)];
  bonuses.push({
    x: Math.random() * (canvas.width - 100) + 50,
    y: -30,
    type: type
  });
}
```

## Krok 8: Sterowanie - Klawiatura (Desktop)

Implementuj obsługę klawiszy:
```javascript
const keys = {};
window.addEventListener('keydown', (e) => {
  keys[e.key] = true;
  if (e.key === ' ') {
    e.preventDefault();
    shoot();
  }
});

window.addEventListener('keyup', (e) => {
  keys[e.key] = false;
});

function handleKeyboard() {
  if (keys['ArrowUp']) player.speed = Math.min(player.speed + 0.1, MAX_SPEED);
  if (keys['ArrowDown']) player.speed = Math.max(player.speed - 0.1, MIN_SPEED);
  if (keys['ArrowLeft']) {
    player.x -= 3;
    player.rotation = -0.1; // lekki pochył
  }
  if (keys['ArrowRight']) {
    player.x += 3;
    player.rotation = 0.1;
  }
}
```

## Krok 9: Sterowanie - Mobile (Dotyk + Akcelerometr)

### Detekcja urządzenia mobilnego:
```javascript
const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
```

### Akcelerometr:
```javascript
if (isMobile && window.DeviceOrientationEvent) {
  window.addEventListener('deviceorientation', (e) => {
    const tilt = e.gamma; // -90 do 90
    player.x += tilt * 0.5; // przesuwanie łodzi
    player.rotation = tilt * 0.002; // wizualna rotacja
  });
}
```

### Przycisk strzału:
```javascript
// Przycisk w HTML
// <button id="shootBtn">FIRE</button>

// Lub strzał przez dotyk canvas (poza przyciskami UI)
canvas.addEventListener('touchstart', (e) => {
  shoot();
});
```

## Krok 10: Przycisk Pause/Play

```javascript
let isPaused = false;
const pauseBtn = document.getElementById('pauseBtn');

pauseBtn.addEventListener('click', () => {
  isPaused = !isPaused;
  pauseBtn.textContent = isPaused ? 'Play' : 'Pause';
});
```

## Krok 11: System Paliwa

Paliwo zmniejsza się powoli w czasie:
```javascript
function updateFuel() {
  if (!isPaused) {
    player.fuel -= 0.05; // wolno się zmniejsza
    if (player.fuel <= 0) {
      player.fuel = 0;
      gameOver('OUT OF FUEL');
    }
  }
}
```

## Krok 12: Detekcja Kolizji

Implementuj funkcje kolizji:
```javascript
function checkCollision(rect1, rect2) {
  return rect1.x < rect2.x + rect2.width &&
         rect1.x + rect1.width > rect2.x &&
         rect1.y < rect2.y + rect2.height &&
         rect1.y + rect1.height > rect2.y;
}

function handleCollisions() {
  // Gracz z przeszkodami -> -1 życie
  // Gracz z wrogami -> -1 życie
  // Gracz z bonusami -> zbierz bonus
  // Pociski z wrogami -> zniszcz wroga, +punkty
  // Gracz z brzegami rzeki -> -1 życie lub spowolnienie
}
```

## Krok 13: Warunki Przegranej (Game Over)

Gra kończy się gdy:
- Życia = 0
- Paliwo = 0
- Gracz utknął (opcjonalnie)

```javascript
function gameOver(reason) {
  isPaused = true;
  // Pokaż ekran Game Over
  document.getElementById('gameOverScreen').style.display = 'block';
  document.getElementById('finalScore').textContent = player.score;
  document.getElementById('gameOverReason').textContent = reason;
}
```

## Krok 14: Warunki Wygranej (Victory)

Opcje wygranej:
- Osiągnięcie określonego wyniku (np. 1000 punktów)
- Przetrwanie określonego czasu/dystansu
- Pokonanie określonej liczby wrogów

```javascript
function checkVictory() {
  if (player.score >= 1000) {
    victory();
  }
}

function victory() {
  isPaused = true;
  // Pokaż ekran Victory
  document.getElementById('victoryScreen').style.display = 'block';
  document.getElementById('victoryScore').textContent = player.score;
}
```

## Krok 15: Restart Gry

```javascript
function restartGame() {
  // Zresetuj wszystkie wartości gracza
  player.lives = 3;
  player.fuel = 100;
  player.ammo = 50;
  player.score = 0;
  player.x = canvas.width / 2;
  player.y = canvas.height - 100;
  
  // Wyczyść tablice
  bullets.length = 0;
  enemies.length = 0;
  obstacles.length = 0;
  bonuses.length = 0;
  
  // Ukryj ekrany końcowe
  document.getElementById('gameOverScreen').style.display = 'none';
  document.getElementById('victoryScreen').style.display = 'none';
  
  isPaused = false;
  gameLoop();
}
```

## Krok 16: Główna Pętla Gry

```javascript
let lastTime = 0;
function gameLoop(timestamp) {
  if (!isPaused) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    
    // Wyczyść canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Rysuj tło rzeki
    drawRiver();
    
    // Aktualizuj logikę
    handleKeyboard();
    updatePlayer();
    updateFuel();
    updateBullets();
    updateEnemies();
    updateObstacles();
    updateBonuses();
    
    // Generuj nowe elementy
    if (Math.random() < 0.02) spawnEnemy();
    if (Math.random() < 0.005) spawnBonus();
    generateObstacles();
    
    // Sprawdź kolizje
    handleCollisions();
    
    // Sprawdź warunki końcowe
    checkVictory();
    if (player.lives <= 0) gameOver('NO LIVES LEFT');
    
    // Rysuj wszystko
    drawObstacles();
    drawBonuses();
    drawEnemies();
    drawPlayer();
    drawBullets();
    
    // Aktualizuj UI
    updateUI();
  }
  
  requestAnimationFrame(gameLoop);
}

// Start gry
gameLoop(0);
```

## Krok 17: Aktualizacja Interfejsu

```javascript
function updateUI() {
  document.getElementById('score').textContent = player.score;
  document.getElementById('lives').textContent = player.lives;
  document.getElementById('fuel').style.width = player.fuel + '%';
  document.getElementById('ammo').textContent = player.ammo;
}
```

## Krok 18: Grafika - Nowoczesny Styl Arcade

Użyj geometrycznych kształtów z nowoczesnymi efektami:

### Paleta kolorów (modern arcade):
- **Główne**: #00f3ff (cyan), #ff00ff (magenta), #ffff00 (yellow)
- **Akcenty**: #00ff88 (neon green), #ff3366 (neon red)
- **Tło**: gradient od #1a1a2e (górny) do #0f3460 (dolny)
- **Rzeka**: gradient od #16213e do #0f3460 z animowaną teksturą

### Grafika elementów:

**Łódź gracza**:
- Kształt: nowoczesny trójkąt/strzałka
- Kolor: gradient od #00f3ff do #0099ff
- Dodaj: subtelny `glow` (shadow blur)
- Rotacja przy skręcaniu (smooth animation)

**Wrogowie**:
- Wodne: czerwone/pomarańczowe kształty (#ff3366) z cieniami
- Powietrzne: żółte/cyan kształty (#ffff00, #00f3ff) z efektem świecenia
- Dodaj pulsujący efekt (scale animation)

**Przeszkody**:
- Kolory: ciemne z jasnym obramowaniem (#2d4059 + #ea5455)
- Kształty: zaokrąglone prostokąty, okręgi
- Dodaj teksturę lub gradient

**Bonusy** (z animacją):
- Amunicja: żółty gradient box (#ffff00 → #ffaa00) + ikona/litera "A"
- Paliwo: zielony gradient (#00ff88 → #00aa66) + ikona "F"
- Życie: czerwony gradient (#ff3366 → #ff0044) + ikona serca/krzyża
- Efekt: pulsowanie (scale 0.9 → 1.1), rotation, glow

**Pociski**:
- Małe, jasne kształty (#00f3ff)
- Trail effect (pozostawiają ślad)
- Glow effect

**Rzeka i brzegi**:
- Tło rzeki: gradient pionowy z animowaną teksturą (fale)
- Brzegi: **ciągłe linie** (3-4px) w kolorze #2d5016 lub #1a472a
- Opcjonalnie: dodaj parallax effect dla głębi

### Efekty wizualne:

```javascript
// Przykład: glow effect dla łodzi
function drawPlayerWithGlow() {
  ctx.save();
  ctx.shadowColor = '#00f3ff';
  ctx.shadowBlur = 15;
  ctx.fillStyle = '#00f3ff';
  // rysuj łódź
  ctx.restore();
}

// Przykład: gradient dla bonusu
function drawBonus(bonus) {
  const gradient = ctx.createLinearGradient(
    bonus.x, bonus.y, 
    bonus.x, bonus.y + bonus.height
  );
  gradient.addColorStop(0, '#ffff00');
  gradient.addColorStop(1, '#ffaa00');
  ctx.fillStyle = gradient;
  // rysuj bonus
}

// Przykład: trail effect dla pocisku
function drawBulletTrail(bullet) {
  ctx.save();
  ctx.globalAlpha = 0.5;
  ctx.strokeStyle = '#00f3ff';
  ctx.lineWidth = 2;
  // rysuj linię za pociskiem
  ctx.restore();
}

// Animowane tło rzeki
function drawRiverBackground() {
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#16213e');
  gradient.addColorStop(1, '#0f3460');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Dodaj animowane fale (opcjonalnie)
  ctx.save();
  ctx.globalAlpha = 0.1;
  // rysuj falującą teksturę
  ctx.restore();
}
```

### Particle Effects (opcjonalnie):
- **Eksplozje**: małe kolorowe particles przy zniszczeniu wroga
- **Iskry**: przy kolizji z przeszkodą
- **Woda**: splash effect przy ruchu łodzi
- **Trail**: ślad za łodzią

### UI - Nowoczesny design:
- Semi-transparent backgrounds (#00000080)
- Neon borders
- Smooth animations
- Progress bars z gradientami
- Pixel-perfect icons

Styl ogólny: **Neon Retro Arcade** - geometryczne kształty, jasne kolory neonowe, gradienty, glow effects, ale zachowaj czystość i czytelność klasycznego arcade.

## Krok 19: Efekty Dźwiękowe (Web Audio API)

**OBOWIĄZKOWE**: Zaimplementuj system dźwięków używając Web Audio API (vanilla JavaScript):

### Inicjalizacja AudioContext
```javascript
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Pomocnicza funkcja do tworzenia dźwięków
function playSound(frequency, duration, type = 'sine', volume = 0.3) {
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
```

### Wymagane efekty dźwiękowe:

1. **Strzał** (shoot):
   - Krótki, ostry dźwięk (200Hz, 0.1s, 'square')
   - Odtwarzaj przy każdym strzale

2. **Wybuch wroga** (enemy destroyed):
   - Głębszy dźwięk z efektem spadku (150Hz → 50Hz, 0.3s)
   - Odtwarzaj gdy pocisk trafi wroga

3. **Zebranie bonusu** (bonus pickup):
   - Pozytywny, rosnący dźwięk (400Hz → 800Hz, 0.2s)
   - Różne częstotliwości dla różnych bonusów

4. **Kolizja/Obrażenia** (damage):
   - Niski, wibrujący dźwięk (100Hz, 0.2s, 'sawtooth')
   - Odtwarzaj przy utracie życia

5. **Silnik łodzi** (engine - ambient):
   - Ciągły, niski dźwięk w tle (80Hz, 'triangle', volume zależna od prędkości)
   - Opcjonalnie: zmiana wysokości dźwięku w zależności od prędkości

6. **Game Over**:
   - Opadający dźwięk (300Hz → 100Hz, 1s)

7. **Victory**:
   - Triumfalna sekwencja (400Hz → 500Hz → 600Hz, każda 0.2s)

### Przykład implementacji:
```javascript
const sounds = {
  shoot: () => playSound(200, 0.1, 'square', 0.2),
  
  explosion: () => {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.connect(gain);
    gain.connect(audioContext.destination);
    
    osc.frequency.setValueAtTime(150, audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.3);
    gain.gain.setValueAtTime(0.3, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    osc.start();
    osc.stop(audioContext.currentTime + 0.3);
  },
  
  bonus: (type) => {
    const freqMap = { ammo: 400, fuel: 500, life: 600 };
    const freq = freqMap[type] || 400;
    playSound(freq, 0.2, 'sine', 0.25);
  },
  
  damage: () => playSound(100, 0.2, 'sawtooth', 0.3),
  
  gameOver: () => {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.connect(gain);
    gain.connect(audioContext.destination);
    
    osc.frequency.setValueAtTime(300, audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 1);
    gain.gain.setValueAtTime(0.3, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
    
    osc.start();
    osc.stop(audioContext.currentTime + 1);
  },
  
  victory: () => {
    [400, 500, 600].forEach((freq, i) => {
      setTimeout(() => playSound(freq, 0.2, 'sine', 0.3), i * 200);
    });
  }
};

// Użycie w grze:
// sounds.shoot();
// sounds.explosion();
// sounds.bonus('fuel');
```

### Uwagi:
- **Mobile**: Użytkownik musi najpierw wejść w interakcję (dotknąć ekran) zanim AudioContext zadziała
- **Inicjalizacja**: Utwórz AudioContext przy pierwszym kliknięciu/dotyku jeśli nie jest aktywny
- **Volume**: Wszystkie dźwięki powinny być wyważone (nie za głośne)
- **Performance**: Web Audio API jest wydajne, ale nie twórz zbyt wielu oscylatorów jednocześnie

## Krok 20: Optymalizacja i Detale

- **Responsywność**: dostosuj canvas do rozmiaru okna
- **FPS**: utrzymuj stabilne 60 FPS
- **Garbage collection**: usuń obiekty poza ekranem
- **Trudność**: stopniowo zwiększaj trudność (więcej wrogów, mniej bonusów)
- **Particle effects**: małe eksplozje przy trafieniach
- **Parallax**: tło poruszające się wolniej niż gra

## Krok 21: Testowanie

Przetestuj:
- ✅ Sterowanie klawiaturą działa poprawnie
- ✅ Sterowanie mobilne (akcelerometr i przycisk strzału)
- ✅ Przycisk Pause/Play działa
- ✅ Kolizje działają poprawnie
- ✅ Paliwo się zmniejsza
- ✅ Amunicja się zmniejsza przy strzale
- ✅ Bonusy działają poprawnie
- ✅ Game Over pojawia się przy 0 życiach lub paliwie
- ✅ Victory pojawia się przy osiągnięciu celu
- ✅ Restart resetuje grę poprawnie
- ✅ Zawsze jest możliwość przejścia między przeszkodami
- ✅ Gra działa płynnie na mobile i desktop
- ✅ **Brzegi rzeki rysowane jako ciągłe linie** z płynną animacją
- ✅ **Wszystkie efekty dźwiękowe działają** (strzał, wybuch, bonus, damage, game over, victory)
- ✅ **AudioContext inicjalizuje się poprawnie** na mobile (po pierwszym dotyku)
- ✅ **Nowoczesny styl graficzny** z gradientami i glow effects

## Uwagi Dodatkowe

- **Bez ruchu wstecz**: gracz może tylko zwalniać, ale nie cofać się
- **Generowanie mapy**: użyj algorytmu który gwarantuje przejście (np. dziel rzekę na sektory, zawsze pozostaw jeden wolny)
- **Balans**: paliwo powinno zmniejszać się na tyle wolno, aby gracz mógł zebrać bonusy
- **Amunicja**: rozpocznij z dużą ilością (50-100), bonusy dodają 10-20
- **Styl arcade**: jasne kolory, wyraźne kontrasty, pixel-perfect kolizje

## Przykładowa Struktura HTML

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>River - Arcade Game</title>
    <style>
        body { margin: 0; padding: 0; overflow: hidden; background: #000; }
        #gameContainer { position: relative; }
        #gameCanvas { display: block; background: #1a4d2e; }
        #ui { position: absolute; top: 10px; left: 10px; color: white; font-family: monospace; }
        #controls { position: absolute; bottom: 20px; right: 20px; }
        .screen { display: none; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                  background: rgba(0,0,0,0.8); color: white; padding: 30px; text-align: center; }
        #shootBtn { display: none; } /* Pokaż tylko na mobile */
    </style>
</head>
<body>
    <div id="gameContainer">
        <canvas id="gameCanvas"></canvas>
        <div id="ui">
            <div>Score: <span id="score">0</span></div>
            <div>Lives: <span id="lives">3</span></div>
            <div>Fuel: <div id="fuelBar"><div id="fuel"></div></div></div>
            <div>Ammo: <span id="ammo">50</span></div>
        </div>
        <div id="controls">
            <button id="pauseBtn">Pause</button>
        </div>
        <button id="shootBtn">FIRE</button>
        
        <div id="gameOverScreen" class="screen">
            <h1>GAME OVER</h1>
            <p id="gameOverReason"></p>
            <p>Final Score: <span id="finalScore">0</span></p>
            <button onclick="restartGame()">Restart</button>
        </div>
        
        <div id="victoryScreen" class="screen">
            <h1>VICTORY!</h1>
            <p>Score: <span id="victoryScore">0</span></p>
            <button onclick="restartGame()">Play Again</button>
        </div>
    </div>
    <script src="river.js"></script>
</body>
</html>
```

## Powodzenia!

Ta instrukcja powinna dostarczyć wszystkich informacji potrzebnych do stworzenia w pełni funkcjonalnej gry River w stylu arcade. Pamiętaj o testowaniu na różnych urządzeniach i dostosowaniu balansu gry dla najlepszego doświadczenia gracza.

