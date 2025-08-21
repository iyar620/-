// =====================
// Enhanced Sea Battle – single-file upgrade
// =====================
// Notes:
// - Comments in EN (as per your preference). Hebrew summary sent in chat.
// - Key upgrades:
//   1) Centralized collision helper (AABB)
//   2) Game loop uses delta time (requestAnimationFrame) – no setInterval
//   3) HUD (score/health/upgrades), Pause (Escape)
//   4) Particles for explosions + player wake
//   5) Separated update() vs draw(), cleaner entity hierarchy
//   6) Subtle ship tilt + wave-aware scale
//   7) Spawn timers managed inside loop

// =====================
// Globals & DOM
// =====================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const gameOverMessageElement = document.getElementById('gameOverMessage');
const gameOverTextElement = document.getElementById('gameOverText');
const restartButton = document.getElementById('restartButton');

// Fit canvas
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Image assets
const images = {
  player: './images/player.png',
  enemy: './images/enemy.png',
  wood: './images/wood.png',
  bullet: './images/rocket.png',
};

const loadedImages = {};

// =====================
// Utility
// =====================
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function randRange(min, max) { return Math.random() * (max - min) + min; }
function now() { return performance.now(); }

// Axis-aligned bounding box collision
function aabb(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

// Wave helpers
let waveOffset = 0;
let backgroundOffset = 0.1;
const waveSpeed = 0.050;
const backgroundSpeed = 0.1;

function getWaveY(x, baseY) {
  // Primary single wave used for bobbing computations
  const amplitude = 20;
  const frequency = 0.018;
  const phase = 0;
  return amplitude * Math.sin(x * frequency + waveOffset + phase) + baseY;
}

function drawWaves(dt) {
  // Background
  const baseHue = 190;
  const maxHue = 220;
  const hueRange = maxHue - baseHue;
  const bgHue = baseHue + ((Math.cos(backgroundOffset) + 1) / 2) * hueRange;
  ctx.fillStyle = `hsl(${bgHue}, 60%, 55%)`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Wave lines
  const hue = baseHue + ((Math.sin(backgroundOffset) + 1) / 2) * hueRange;
  const waveColors = Array.from({ length: 8 }, (_, i) => `hsl(${(hue + i * 4) % 360}, ${80 - i * 5}%, ${60 + i * 3}%)`);
  const waveConfigs = [
    { amplitude: 20, frequency: 0.018, phase: 0,                verticalOffset: canvas.height / 12 },
    { amplitude: 18, frequency: 0.022, phase: Math.PI / 6,      verticalOffset: canvas.height / 6  },
    { amplitude: 16, frequency: 0.025, phase: Math.PI / 2,      verticalOffset: canvas.height / 4  },
    { amplitude: 14, frequency: 0.019, phase: Math.PI / 3,      verticalOffset: canvas.height / 3  },
    { amplitude: 12, frequency: 0.028, phase: Math.PI / 4,      verticalOffset: canvas.height / 2.2 },
    { amplitude: 10, frequency: 0.021, phase: -Math.PI / 5,     verticalOffset: canvas.height / 1.7 },
    { amplitude:  8, frequency: 0.027, phase: Math.PI / 8,      verticalOffset: canvas.height / 1.3 },
    { amplitude:  6, frequency: 0.024, phase: -Math.PI / 7,     verticalOffset: canvas.height / 1.05 }
  ];

  ctx.lineWidth = 2;
  waveConfigs.forEach((conf, i) => {
    ctx.strokeStyle = waveColors[i % waveColors.length];
    ctx.beginPath();
    ctx.moveTo(0, conf.verticalOffset);
    for (let x = 0; x < canvas.width; x++) {
      const y = conf.amplitude * Math.sin(x * conf.frequency + waveOffset + conf.phase) + conf.verticalOffset;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  });

  waveOffset += waveSpeed * dt * 0.06;      // scale with dt (ms -> approx factor)
  backgroundOffset += backgroundSpeed * 0.2 * dt * 0.06;
}

// =====================
// Input
// =====================
const keys = {};
function handleKeyDown(e) {
  keys[e.code] = true;
  if (e.code === 'Space') {
    const nearestEnemy = getNearestEnemy();
    if (nearestEnemy) player.shoot(nearestEnemy);
  }
  if (e.code === 'Escape') togglePause();
}
function handleKeyUp(e) { keys[e.code] = false; }

document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);

// Mobile touch (tap to shoot, drag to move)
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

// Prevent scroll on mobile
document.body.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });

// =====================
// Entities
// =====================
class Entity {
  constructor(x, y, img, w = img?.width || 32, h = img?.height || 32) {
    this.x = x; this.y = y;
    this.vx = 0; this.vy = 0;
    this.width = w; this.height = h;
    this.image = img;
    this.dead = false;
  }
  getRect() { return { x: this.x, y: this.y, width: this.width, height: this.height }; }
  update(dt) { /* override */ }
  draw(ctx) {
    // Default sprite draw with wave-based scale and bob
    const horizon = canvas.height * 0.25;
    const maxScale = 1.0;
    const minScale = 0.6;
    const distanceFromHorizon = Math.max(0, this.y - horizon);
    const scale = clamp(minScale + (distanceFromHorizon / (canvas.height - horizon)) * (maxScale - minScale), minScale, maxScale);

    const waveY = getWaveY(this.x + this.width / 2, this.y);
    const waveDepth = Math.abs(waveY - this.y) * 0.10;

    ctx.save();
    ctx.translate(this.x + this.width / 2, waveY + waveDepth);
    ctx.scale(scale, scale);
    ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
    ctx.restore();
  }
}

class Ship extends Entity {
  constructor(x, y, img) {
    super(x, y, img);
    this.health = 300;
    this.speed = 7;
    this.fireRate = 7; // bullets per second
    this.range = 500;
    this.lastShotTime = 0;
    this.tilt = 0; // visual roll
  }
  update(dt) {
    // Movement driven by vx/vy (set externally for player, internally for enemies)
    this.x = clamp(this.x + this.vx * this.speed, 0, canvas.width - this.width);
    this.y = clamp(this.y + this.vy * this.speed, 0, canvas.height - this.height);

    // Visual tilt by horizontal velocity
    const targetTilt = clamp(this.vx * 0.25, -0.25, 0.25);
    this.tilt += (targetTilt - this.tilt) * 0.1 * dt * 0.06;
  }
  canShoot(timeMs) {
    return (timeMs - this.lastShotTime) >= (1000 / this.fireRate);
  }
  shoot(target) {
    const t = now();
    if (!this.canShoot(t)) return;
    this.lastShotTime = t;
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    const angle = Math.atan2(target.y - this.y, target.x - this.x);
    bullets.push(new Bullet(cx, cy, angle));

    // Muzzle burst particles
    spawnBurst(cx, cy, 6, 0.9, 160, 280);
  }
  draw(ctx) {
    const horizon = canvas.height * 0.25;
    const maxScale = 1.0;
    const minScale = 0.6;
    const distanceFromHorizon = Math.max(0, this.y - horizon);
    const scale = clamp(minScale + (distanceFromHorizon / (canvas.height - horizon)) * (maxScale - minScale), minScale, maxScale);

    const waveY = getWaveY(this.x + this.width / 2, this.y);
    const waveDepth = Math.abs(waveY - this.y) * 0.10;

    ctx.save();
    ctx.translate(this.x + this.width / 2, waveY + waveDepth);
    ctx.scale(scale, scale);
    ctx.rotate(this.tilt);
    ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
    ctx.restore();
  }
}

class PlayerShip extends Ship {
  constructor(x, y, img) {
    super(x, y, img);
    this.wood = 0;
  }
  update(dt) {
    // Input-driven normalized velocity
    let dx = 0, dy = 0;
    if (keys['ArrowUp'] || keys['KeyW']) dy -= 1;
    if (keys['ArrowDown'] || keys['KeyS']) dy += 1;
    if (keys['ArrowLeft'] || keys['KeyA']) dx -= 1;
    if (keys['ArrowRight'] || keys['KeyD']) dx += 1;

    const len = Math.hypot(dx, dy) || 1;
    this.vx = dx / len; this.vy = dy / len;
    super.update(dt);

    // Wake particles when moving
    const speedMag = Math.hypot(this.vx, this.vy);
    if (speedMag > 0.1 && Math.random() < 0.6) {
      const tailX = this.x + this.width / 2 - this.vx * 10;
      const tailY = this.y + this.height / 2 - this.vy * 10;
      particles.push(new Particle(tailX, tailY, randRange(-0.2, 0.2), randRange(0.1, 0.5), randRange(250, 450), randRange(0.3, 0.7), 'wake'));
    }
  }
  collectWood() {
    this.wood += 1;
    this.health = Math.min(this.health + 10, 400);
    this.fireRate += 0.15; // slightly stronger upgrades
  }
}

class EnemyShip extends Ship {
  constructor(x, y, img) {
    super(x, y, img);
    this.health = 150;
    this.speed = 4;
    this.fireRate = 4;
  }
  update(dt) {
    // Seek player
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.hypot(dx, dy) || 1;
    this.vx = dx / dist;
    this.vy = (dy / dist) * 0.5;
    super.update(dt);

    // Shoot
    const t = now();
    if (t - this.lastShotTime >= (1000 / this.fireRate)) {
      this.lastShotTime = t;
      const angle = Math.atan2(player.y - this.y, player.x - this.x);
      const cx = this.x + this.width / 2;
      const cy = this.y + this.height / 2;
      enemyBullets.push(new Bullet(cx, cy, angle));
      spawnBurst(cx, cy, 5, 0.9, 140, 260);
    }
  }
}

class Bullet extends Entity {
  constructor(x, y, angle) {
    super(x, y, loadedImages.bullet, 5, 10);
    this.speed = 420; // px/s
    this.angle = angle;
    this.width = 12; // visual a bit larger
    this.height = 12;
  }
  update(dt) {
    const s = (this.speed * dt) / 1000;
    this.x += Math.cos(this.angle) * s;
    this.y += Math.sin(this.angle) * s;

    // Despawn offscreen
    if (this.x < -20 || this.x > canvas.width + 20 || this.y < -20 || this.y > canvas.height + 20) {
      this.dead = true;
    }
  }
  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
    ctx.restore();
  }
}

class Wood extends Entity {
  constructor(x, y, img) {
    super(x, y, img, 22, 22);
  }
}

// =====================
// Particles (explosions + wake)
// =====================
class Particle {
  constructor(x, y, vx, vy, lifeMs, size, kind = 'explosion') {
    this.x = x; this.y = y;
    this.vx = vx; this.vy = vy;
    this.life = lifeMs; // remaining life in ms
    this.size = size;   // visual base size
    this.kind = kind;
    this.dead = false;
  }
  update(dt) {
    this.life -= dt;
    if (this.life <= 0) { this.dead = true; return; }
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // simple damping
    this.vx *= 0.99;
    this.vy *= 0.99;
  }
  draw(ctx) {
    const alpha = clamp(this.life / 500, 0, 1);
    ctx.save();
    if (this.kind === 'wake') {
      ctx.fillStyle = `rgba(255,255,255,${alpha * 0.35})`;
      ctx.beginPath();
      ctx.ellipse(this.x, this.y, this.size * 0.06, this.size * 0.03, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // explosion
      ctx.fillStyle = `rgba(255,200,120,${alpha})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 0.04, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

function spawnBurst(x, y, count, spread = 1.0, minLife = 120, maxLife = 320) {
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const sp = randRange(0.05, 0.45) * spread;
    const life = randRange(minLife, maxLife);
    particles.push(new Particle(x, y, Math.cos(a) * sp, Math.sin(a) * sp, life, randRange(200, 400), 'explosion'));
  }
}

// =====================
// Game state
// =====================
let player;
let enemies = [];
let woods = [];
let bullets = [];
let enemyBullets = [];
let particles = [];
let score = 0;
let paused = false;
let gameOver = false;

// Spawn timers managed in loop
let enemySpawnInterval = 3000; // ms
let woodSpawnInterval  = 5000; // ms
let enemySpawnTimer = 0;
let woodSpawnTimer = 0;

function getNearestEnemy() {
  let nearest = null;
  let minD = Infinity;
  for (const e of enemies) {
    const d = Math.hypot(e.x - player.x, e.y - player.y);
    if (d < minD && d <= player.range) { minD = d; nearest = e; }
  }
  return nearest;
}

// =====================
// HUD & UI
// =====================
function drawHUD() {
  ctx.save();
  ctx.font = '16px Arial';
  ctx.textBaseline = 'top';
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 4; ctx.shadowOffsetX = 1; ctx.shadowOffsetY = 1;

  ctx.fillStyle = 'white';
  ctx.fillText(`Score: ${score}`, 16, 12);
  ctx.fillText(`Health: ${Math.max(0, Math.floor(player.health))}`, 16, 34);
  ctx.fillText(`Upgrades: ${player.wood}`, 16, 56);

  // Health bar
  const barX = 16, barY = 80, barW = 180, barH = 12;
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.fillRect(barX, barY, barW, barH);
  const pct = clamp(player.health / 400, 0, 1);
  ctx.fillStyle = 'rgba(255,80,80,0.9)';
  ctx.fillRect(barX, barY, barW * pct, barH);

  ctx.restore();
}

function drawPauseOverlay() {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'white';
  ctx.font = '28px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
  ctx.restore();
}

function togglePause() {
  if (gameOver) return;
  paused = !paused;
}

// =====================
// Game lifecycle
// =====================
function startGame() {
  resizeCanvas();
  enemies.length = 0;
  woods.length = 0;
  bullets.length = 0;
  enemyBullets.length = 0;
  particles.length = 0;
  score = 0;
  paused = false;
  gameOver = false;
  enemySpawnTimer = 0;
  woodSpawnTimer = 0;
  enemySpawnInterval = 3000;
  woodSpawnInterval  = 5000;
  player = new PlayerShip(canvas.width / 2, canvas.height - 80, loadedImages.player);
  gameOverMessageElement.style.display = 'none';
  lastTs = now();
  requestAnimationFrame(gameLoop);
}

function endGame() {
  gameOver = true;
  gameOverTextElement.textContent = `Game Over! Score: ${score}`;
  gameOverMessageElement.style.display = 'block';
}

// =====================
// Spawning
// =====================
function spawnEnemy() {
  if (enemies.length >= 4) return;
  const x = Math.random() * (canvas.width - 50);
  const e = new EnemyShip(x, -50, loadedImages.enemy);
  enemies.push(e);
}
function spawnWood() {
  if (woods.length >= 6) return;
  const x = Math.random() * (canvas.width - 30);
  const y = Math.random() * (canvas.height - 100) + 40;
  woods.push(new Wood(x, y, loadedImages.wood));
}

// =====================
// Update & Draw passes
// =====================
function update(dt) {
  if (paused || gameOver) return;

  // Dynamic difficulty: slightly increase enemy spawn as score grows
  enemySpawnInterval = clamp(3000 - score * 5, 1200, 3000);

  // Timers
  enemySpawnTimer += dt;
  woodSpawnTimer  += dt;
  if (enemySpawnTimer >= enemySpawnInterval) { enemySpawnTimer = 0; spawnEnemy(); }
  if (woodSpawnTimer  >= woodSpawnInterval ) { woodSpawnTimer  = 0; spawnWood(); }

  player.update(dt);

  for (const e of enemies) e.update(dt);
  for (const b of bullets) b.update(dt);
  for (const b of enemyBullets) b.update(dt);
  for (const p of particles) p.update(dt);

  // Player bullets -> enemies
  for (const b of bullets) {
    for (const e of enemies) {
      if (!b.dead && !e.dead && aabb(b.getRect(), e.getRect())) {
        e.health -= 50;
        b.dead = true;
        spawnBurst(b.x, b.y, 8, 1.2, 200, 500);
        if (e.health <= 0) {
          e.dead = true;
          score += 10;
          spawnBurst(e.x + e.width / 2, e.y + e.height / 2, 24, 1.4, 300, 800);
        }
      }
    }
  }

  // Enemy bullets -> player
  for (const b of enemyBullets) {
    if (!b.dead && aabb(b.getRect(), player.getRect())) {
      player.health -= 20;
      b.dead = true;
      spawnBurst(b.x, b.y, 6, 1.0, 180, 400);
      if (player.health <= 0) { endGame(); }
    }
  }

  // Player collects woods
  for (const w of woods) {
    if (!w.dead && aabb(player.getRect(), w.getRect())) {
      player.collectWood();
      w.dead = true;
      spawnBurst(w.x + w.width / 2, w.y + w.height / 2, 10, 0.8, 180, 380);
    }
  }

  // Cleanup
  enemies = enemies.filter(e => !e.dead && e.y < canvas.height + 120);
  woods   = woods.filter(w => !w.dead);
  bullets = bullets.filter(b => !b.dead);
  enemyBullets = enemyBullets.filter(b => !b.dead);
  particles = particles.filter(p => !p.dead);
}

function draw(dt) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawWaves(dt);

  // Draw order (background -> entities -> particles -> HUD)
  for (const w of woods) w.draw(ctx);
  for (const e of enemies) e.draw(ctx);
  for (const b of bullets) b.draw(ctx);
  for (const b of enemyBullets) b.draw(ctx);
  player.draw(ctx);
  for (const p of particles) p.draw(ctx);

  drawHUD();
  if (paused) drawPauseOverlay();
}

// =====================
// Main loop
// =====================
let lastTs = 0;
function gameLoop(ts) {
  const dt = clamp(ts - lastTs, 0, 50); // cap delta to avoid jumps
  lastTs = ts;

  update(dt);
  draw(dt);

  if (!gameOver) requestAnimationFrame(gameLoop);
}

// =====================
// Asset loading & boot
// =====================
function loadImages(map, cb) {
  const entries = Object.entries(map);
  let remaining = entries.length;
  for (const [k, src] of entries) {
    const img = new Image();
    img.src = src;
    img.onload = () => { loadedImages[k] = img; if (--remaining === 0) cb(); };
    img.onerror = () => { console.error('Failed to load', src); if (--remaining === 0) cb(); };
  }
}

restartButton.addEventListener('click', startGame);

loadImages(images, startGame);
