// =====================
// קרב ים – גרסה מלאה ומשודרגת (סירות מתנדנדות, עצים דוהים, ים פרלקס + קצף)
// =====================
// שליטה: WASD / חצים לתנועה, רווח לירי אוטומטי על אויב קרוב, Escape = השהיה
// דרישות HTML: 
//   <canvas id="gameCanvas"></canvas>
//   <div id="gameOverMessage" style="display:none"><span id="gameOverText"></span><button id="restartButton">Restart</button></div>

// ---------- קנבס וממשק ----------
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const gameOverMessageElement = document.getElementById('gameOverMessage');
const gameOverTextElement = document.getElementById('gameOverText');
const restartButton = document.getElementById('restartButton');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// ---------- נכסים (תמונות) ----------
const images = {
  player: './images/player.png',
  enemy:  './images/enemy.png',
  wood:   './images/wood.png',
  bullet: './images/rocket.png',
};
const loadedImages = {};

function loadImages(callback) {
  const entries = Object.entries(images);
  let left = entries.length;
  entries.forEach(([key, src]) => {
    const img = new Image();
    img.onload = () => {
      loadedImages[key] = img;
      if (--left === 0) callback();
    };
    img.onerror = () => {
      console.warn('נכשל בטעינת תמונה', src, '— משתמש במלבנים חלופיים.');
      // יצירת קנבס חלופי
      const c = document.createElement('canvas');
      c.width = c.height = 32;
      const cctx = c.getContext('2d');
      cctx.fillStyle = '#ccc';
      cctx.fillRect(0, 0, 32, 32);
      cctx.fillStyle = '#333';
      cctx.fillRect(6, 6, 20, 20);
      const fallback = new Image();
      fallback.onload = () => {
        loadedImages[key] = fallback;
        if (--left === 0) callback();
      };
      fallback.src = c.toDataURL();
    };
    img.src = src;
  });
}

// ---------- פונקציות עזר ----------
const TAU = Math.PI * 2;
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function randRange(min, max) { return Math.random() * (max - min) + min; }
function now() { return performance.now(); }
function aabb(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

// ---------- ים / רקע ----------
let waveOffset = 0;            // רדיאנים
let backgroundOffset = 0.1;    // מניע גוון
const waveSpeed = 0.9;         // רדיאנים לשנייה
const backgroundSpeed = 0.4;   // מהירות שינוי גוון

let foamParticles = [];        // {x,y,life}

// גובה גל בסיסי עבור x ב-y בסיסי
function getWaveY(x, baseY) {
  return 20 * Math.sin(x * 0.018 + waveOffset) + baseY;
}

function drawWaves(dt) {
  // dt בשניות
  const baseHue = 190;
  const maxHue = 220;
  const hueRange = maxHue - baseHue;
  const bgHue = baseHue + ((Math.cos(backgroundOffset) + 1) / 2) * hueRange;
  ctx.fillStyle = `hsl(${bgHue}, 60%, 55%)`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const hue = baseHue + ((Math.sin(backgroundOffset) + 1) / 2) * hueRange;
  const waveColors = Array.from({ length: 8 }, (_, i) => `hsl(${(hue + i * 4) % 360}, ${80 - i * 5}%, ${60 + i * 3}%)`);

  const waveConfigs = [
    { amplitude: 20, frequency: 0.018, phase: 0,               verticalOffset: canvas.height / 12,  speedFactor: 1.0 },
    { amplitude: 18, frequency: 0.022, phase: Math.PI / 6,     verticalOffset: canvas.height / 6,   speedFactor: 0.9 },
    { amplitude: 16, frequency: 0.025, phase: Math.PI / 2,     verticalOffset: canvas.height / 4,   speedFactor: 0.8 },
    { amplitude: 14, frequency: 0.019, phase: Math.PI / 3,     verticalOffset: canvas.height / 3,   speedFactor: 0.7 },
    { amplitude: 12, frequency: 0.028, phase: Math.PI / 4,     verticalOffset: canvas.height / 2.2, speedFactor: 0.6 },
    { amplitude: 10, frequency: 0.021, phase: -Math.PI / 5,    verticalOffset: canvas.height / 1.7, speedFactor: 0.5 },
    { amplitude:  8, frequency: 0.027, phase: Math.PI / 8,     verticalOffset: canvas.height / 1.3, speedFactor: 0.4 },
    { amplitude:  6, frequency: 0.024, phase: -Math.PI / 7,    verticalOffset: canvas.height / 1.05,speedFactor: 0.3 }
  ];

  ctx.lineWidth = 2;
  waveConfigs.forEach((conf, i) => {
    ctx.strokeStyle = waveColors[i % waveColors.length];
    ctx.beginPath();
    ctx.moveTo(0, conf.verticalOffset);
    for (let x = 0; x < canvas.width; x++) {
      const y = conf.amplitude * Math.sin(x * conf.frequency + waveOffset * conf.speedFactor + conf.phase) + conf.verticalOffset;
      ctx.lineTo(x, y);
      // קצף
      if (Math.random() < 0.00035) {
        foamParticles.push({ x, y, life: randRange(0.6, 1.3) }); // שניות
      }
    }
    ctx.stroke();
  });

  // ציור ועדכון קצף
  foamParticles.forEach(f => {
    ctx.fillStyle = `rgba(255,255,255,${clamp(f.life / 1.3, 0, 1)})`;
    ctx.beginPath();
    ctx.arc(f.x, f.y, 1.8, 0, TAU);
    ctx.fill();
    f.y -= 2 * dt;        // תנועה קלה למעלה
    f.life -= dt;
  });
  foamParticles = foamParticles.filter(f => f.life > 0);

  waveOffset += waveSpeed * dt;
  backgroundOffset += backgroundSpeed * dt;
}

// ---------- קלט ----------
const keys = {};
document.addEventListener('keydown', (e) => {
  keys[e.code] = true;
  if (e.code === 'Space') {
    const nearestEnemy = getNearestEnemy();
    if (nearestEnemy) player.shoot(nearestEnemy);
  }
  if (e.code === 'Escape') togglePause();
});
document.addEventListener('keyup', (e) => { keys[e.code] = false; });

// מגע למובייל
canvas.ontouchstart = (event) => {
  const nearestEnemy = getNearestEnemy();
  if (nearestEnemy) player.shoot(nearestEnemy);
  event.preventDefault();
};
canvas.ontouchmove = (event) => {
  const t = event.touches[0];
  player.x = t.clientX - player.width / 2;
  player.y = t.clientY - player.height / 2;
  event.preventDefault();
};
document.body.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });

// ---------- ישויות ----------
class Entity {
  constructor(x, y, img, w = img?.width || 32, h = img?.height || 32) {
    this.x = x; this.y = y;
    this.vx = 0; this.vy = 0;
    this.width = w; this.height = h;
    this.image = img;
    this.dead = false;
    this.angle = 0;
    this.alpha = 1;
  }
  getRect() { return { x: this.x, y: this.y, width: this.width, height: this.height }; }
  update(dt) {} // שניות
  draw(ctx) {
    const horizon = canvas.height * 0.25;
    const maxScale = 1.0;
    const minScale = 0.6;
    const distanceFromHorizon = Math.max(0, this.y - horizon);
    const scale = clamp(minScale + (distanceFromHorizon / (canvas.height - horizon)) * (maxScale - minScale), minScale, maxScale);
    const waveY = getWaveY(this.x + this.width / 2, this.y);
    const waveDepth = Math.abs(waveY - this.y) * 0.10;

    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.translate(this.x + this.width / 2, waveY + waveDepth);
    ctx.scale(scale, scale);
    ctx.rotate(this.angle);
    if (this.image) {
      ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
    } else {
      ctx.fillStyle = 'magenta';
      ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
    }
    ctx.restore();
  }
}

class Ship extends Entity {
  constructor(x, y, img) {
    super(x, y, img);
    this.health = 300;
    this.speed = 220;          // px/sec
    this.fireRate = 7;         // bullets/sec
    this.range = 520;          // px
    this.lastShotTime = 0;     // ms
    this.tilt = 0;
    this.swayTime = Math.random() * 1000; // ms phase
  }
  update(dt) {
    // dt seconds
    this.x = clamp(this.x + this.vx * this.speed * dt, 0, canvas.width - this.width);
    this.y = clamp(this.y + this.vy * this.speed * dt, 0, canvas.height - this.height);
    this.swayTime += dt * 1000;
    this.angle = Math.sin(this.swayTime / 800) * 0.08 + this.tilt; // gentle sway
  }
  canShoot(timeMs) { return (timeMs - this.lastShotTime) >= (1000 / this.fireRate); }
  shoot(target) {
    const t = now();
    if (!this.canShoot(t)) return;
    this.lastShotTime = t;
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    const angle = Math.atan2(target.y - this.y, target.x - this.x);
    bulletsPlayer.push(new Bullet(cx, cy, angle));
  }
}

class PlayerShip extends Ship {
  constructor(x, y, img) { super(x, y, img); this.wood = 0; }
  update(dt) {
    let dx = 0, dy = 0;
    if (keys['ArrowUp'] || keys['KeyW']) dy -= 1;
    if (keys['ArrowDown'] || keys['KeyS']) dy += 1;
    if (keys['ArrowLeft'] || keys['KeyA']) dx -= 1;
    if (keys['ArrowRight'] || keys['KeyD']) dx += 1;
    const len = Math.hypot(dx, dy) || 1;
    this.vx = dx / len; this.vy = dy / len;
    super.update(dt);
  }
  collectWood() {
    this.wood += 1;
    this.health = Math.min(this.health + 12, 420);
    this.fireRate += 0.15;
  }
}

class EnemyShip extends Ship {
  constructor(x, y, img) { super(x, y, img); this.health = 160; this.speed = 160; this.fireRate = 3.2; }
  update(dt) {
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.hypot(dx, dy) || 1;
    this.vx = dx / dist;
    this.vy = (dy / dist) * 0.6;
    super.update(dt);
    const t = now();
    if (dist < this.range && t - this.lastShotTime >= (1000 / this.fireRate)) {
      this.lastShotTime = t;
      const angle = Math.atan2(player.y - this.y, player.x - this.x);
      const cx = this.x + this.width / 2;
      const cy = this.y + this.height / 2;
      bulletsEnemy.push(new Bullet(cx, cy, angle));
    }
  }
}

class Bullet extends Entity {
  constructor(x, y, angle) {
    super(x, y, loadedImages.bullet, 14, 14);
    this.speed = 460; // px/sec
    this.angleRad = angle;
  }
  update(dt) {
    this.x += Math.cos(this.angleRad) * this.speed * dt;
    this.y += Math.sin(this.angleRad) * this.speed * dt;
    if (this.x < -20 || this.x > canvas.width + 20 || this.y < -20 || this.y > canvas.height + 20) this.dead = true;
  }
  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angleRad);
    ctx.drawImage(this.image, -this.width/2, -this.height/2, this.width, this.height);
    ctx.restore();
  }
}

class Wood extends Entity {
  constructor(x, y, img) {
    super(x, y, img, 26, 26);
    this.life = 9.5;                    // seconds until vanish
    this.rotationSpeed = randRange(-0.6, 0.6) * (Math.PI/180); // rad/sec
    this.angle = randRange(0, TAU);
  }
  update(dt) {
    this.angle += this.rotationSpeed * (dt * 1000) / 16.67; // keep visible speed similar across FPS
    this.life -= dt;
    this.alpha = clamp(this.life / 9.5, 0, 1);
    if (this.life <= 0) this.dead = true;
  }
}

// ---------- מצב משחק ----------
let player;
let enemies = [];
let woods = [];
let bulletsPlayer = [];
let bulletsEnemy = [];
let score = 0;
let paused = false;
let gameOverFlag = false;

let enemySpawnInterval = 3.0;   // seconds
let woodSpawnInterval  = 5.0;   // seconds
let enemySpawnTimer = 0;
let woodSpawnTimer = 0;

// ---------- Helpers ----------
function getNearestEnemy() {
  let nearest = null, minD = Infinity;
  for (const e of enemies) {
    const d = Math.hypot(e.x - player.x, e.y - player.y);
    if (d < minD && d <= player.range) { minD = d; nearest = e; }
  }
  return nearest;
}

function togglePause() { if (!gameOverFlag) paused = !paused; }

function startGame() {
  enemies = []; woods = []; bulletsPlayer = []; bulletsEnemy = [];
  score = 0; paused = false; gameOverFlag = false;
  enemySpawnTimer = 0; woodSpawnTimer = 0;
  enemySpawnInterval = 3.0; woodSpawnInterval = 5.0;
  player = new PlayerShip(canvas.width / 2, canvas.height - 90, loadedImages.player);
  gameOverMessageElement && (gameOverMessageElement.style.display = 'none');
  lastTs = performance.now();
  requestAnimationFrame(gameLoop);
}

function endGame() {
  gameOverFlag = true;
  if (gameOverTextElement) gameOverTextElement.textContent = `Game Over! Score: ${score}`;
  if (gameOverMessageElement) gameOverMessageElement.style.display = 'block';
}

if (restartButton) {
  restartButton.addEventListener('click', () => {
    if (gameOverMessageElement) gameOverMessageElement.style.display = 'none';
    startGame();
  });
}

// ---------- HUD ----------
function drawHUD() {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(12, 10, 220, 74);
  ctx.fillStyle = 'white';
  ctx.font = '16px Arial';
  ctx.fillText(`Score: ${score}`, 22, 34);
  ctx.fillText(`Health: ${Math.max(0, Math.floor(player.health))}`, 22, 54);
  ctx.fillText(`Upgrades: ${player.wood}`, 22, 74);
  ctx.restore();
}

function drawPauseOverlay() {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'white';
  ctx.font = '32px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
  ctx.restore();
}

// ---------- Loop ----------
let lastTs = 0;
function gameLoop(ts) {
  const dt = clamp((ts - lastTs) / 1000, 0, 0.05); // seconds, cap 50ms
  lastTs = ts;
  update(dt);
  draw(dt);
  if (!gameOverFlag) requestAnimationFrame(gameLoop);
}

function update(dt) {
  if (paused || gameOverFlag) return;

  // dynamic difficulty
  enemySpawnInterval = clamp(3.0 - score * 0.003, 1.2, 3.0);

  enemySpawnTimer += dt;
  woodSpawnTimer += dt;
  if (enemySpawnTimer >= enemySpawnInterval) { enemySpawnTimer = 0; if (enemies.length < 5) enemies.push(new EnemyShip(Math.random() * (canvas.width - 50), -50, loadedImages.enemy)); }
  if (woodSpawnTimer >= woodSpawnInterval)   { woodSpawnTimer = 0; if (woods.length   < 7) woods.push(new Wood(Math.random() * (canvas.width - 40), Math.random() * (canvas.height - 120) + 40, loadedImages.wood)); }

  player.update(dt);
  enemies.forEach(e => e.update(dt));
  woods.forEach(w => w.update(dt));
  bulletsPlayer.forEach(b => b.update(dt));
  bulletsEnemy.forEach(b => b.update(dt));

  // collisions: player bullets vs enemies
  for (const b of bulletsPlayer) {
    for (const e of enemies) {
      if (!b.dead && !e.dead && aabb(b.getRect(), e.getRect())) {
        e.health -= 50; b.dead = true;
        if (e.health <= 0) { e.dead = true; score += 10; }
      }
    }
  }
  // enemy bullets vs player
  for (const b of bulletsEnemy) {
    if (!b.dead && aabb(b.getRect(), player.getRect())) {
      player.health -= 20; b.dead = true;
      if (player.health <= 0) endGame();
    }
  }
  // wood pickup
  for (const w of woods) {
    if (!w.dead && aabb(player.getRect(), w.getRect())) { player.collectWood(); w.dead = true; }
  }

  enemies = enemies.filter(e => !e.dead);
  woods = woods.filter(w => !w.dead);
  bulletsPlayer = bulletsPlayer.filter(b => !b.dead);
  bulletsEnemy = bulletsEnemy.filter(b => !b.dead);
}

function draw(dt) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawWaves(dt);

  // draw order: woods below ships for nicer feel
  woods.forEach(w => w.draw(ctx));
  enemies.forEach(e => e.draw(ctx));
  bulletsPlayer.forEach(b => b.draw(ctx));
  bulletsEnemy.forEach(b => b.draw(ctx));
  player.draw(ctx);

  drawHUD();
  if (paused) drawPauseOverlay();
}

// ---------- Boot ----------
loadImages(() => {
  startGame();
});
