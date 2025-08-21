// =====================
// משתנים גלובליים ואתחול
// =====================

// יצירת קנבס וקבלת קונטקסט לציור
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// אלמנטים מה-DOM להודעות וכפתור
const gameOverMessageElement = document.getElementById('gameOverMessage');
const gameOverTextElement = document.getElementById('gameOverText');
const restartButton = document.getElementById('restartButton');

// משתנים לאינטרוולים של אויבים וקרשים
let enemyInterval = null;
let woodInterval = null;

// התאמת גודל הקנבס לגודל החלון
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// נתיבי תמונות
const images = {
    player: './images/player.png',
    enemy: './images/enemy.png',
    wood: './images/wood.png',
    bullet: './images/rocket.png',
};

// משתנים לטעינת תמונות
let loadedImages = {};
let imagesToLoad = Object.keys(images).length;
let imagesLoaded = 0;

// משתנים למשחק
let gameOver = false;
let waveOffset = 0;
let backgroundOffset = 0.1;
const waveSpeed = 0.050;
const backgroundSpeed = 0.1;

// =====================
// פונקציות טעינת תמונות
// =====================

// טוען את כל התמונות ומתחיל משחק כשהכל נטען
function loadImages() {
    for (let key in images) {
        loadedImages[key] = new Image();
        loadedImages[key].src = images[key];
        loadedImages[key].onload = onImageLoad;
        loadedImages[key].onerror = () => console.error(`Failed to load ${images[key]}`);
    }
}

// סופר תמונות טעונות ומתחיל משחק
function onImageLoad() {
    imagesLoaded++;
    if (imagesLoaded === imagesToLoad) {
        startGame();
    }
}

// =====================
// מחלקות המשחק
// =====================

// מחלקת ספינה של שחקן
class Ship {
    constructor(x, y, image) {
        this.x = x;
        this.y = y;
        this.width = image.width;
        this.height = image.height;
        this.image = image;
        this.health = 300;
        this.speed = 7;
        this.fireRate = 7;
        this.wood = 0;
        this.lastShotTime = 0;
        this.range = 500;
        this.dx = 0;
        this.dy = 0;
    }

    // מצייר את הספינה ואת החיים והשדרוגים
    draw() {
        if (!gameOver) {
            // חישוב מהירות נוכחית (כולל שדרוגים ותנועת שחקן)
            const currentSpeed = Math.sqrt(this.dx * this.dx + this.dy * this.dy) * this.speed;

            // קביעת מקדם הפחתה (ככל שמהירות גבוהה, השפעת הגלים קטנה)
            const minWaveEffect = 0.4; // מינימום השפעה
            const maxWaveEffect = 1.0; // מקסימום השפעה
            const speedFactor = Math.min(currentSpeed / 15, 1); // נורמליזציה למהירות
            const waveEffect = maxWaveEffect - (maxWaveEffect - minWaveEffect) * speedFactor;

            const waveY = getWaveY(this.x + this.width / 2, this.y);
            const waveDepth = Math.abs(waveY - this.y) * 0.10 * waveEffect;

            // שינוי גודל לפי מרחק מהאופק (למעלה קטנה, למטה גדולה)
            const horizon = canvas.height * 0.25;
            const maxScale = 1;
            const minScale = 0.6;
            const distanceFromHorizon = Math.max(0, this.y - horizon);
            const scale = Math.max(minScale, Math.min(maxScale,
                minScale + (distanceFromHorizon / (canvas.height - horizon)) * (maxScale - minScale)
            ));

            ctx.save();
            ctx.translate(this.x + this.width / 2, waveY + waveDepth);
            ctx.scale(scale, scale);
            ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
            ctx.restore();

            this.drawHealthAndUpgrades();
        }
    }

    // מצייר חיים ושדרוגים מעל הספינה
    drawHealthAndUpgrades() {
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.fillText(`Health: ${this.health}`, this.x, this.y - 10);
        ctx.fillText(`Upgrades: ${this.wood}`, this.x, this.y - 25);
    }

    // מזיז את הספינה בגבולות המסך
    move() {
        if (!gameOver) {
            this.x = Math.max(0, Math.min(canvas.width - this.width, this.x + this.dx * this.speed));
            this.y = Math.max(0, Math.min(canvas.height - this.height, this.y + this.dy * this.speed));
        }
    }

    // בודק אם אפשר לירות לפי קצב הירי
    canShoot() {
        const currentTime = Date.now();
        return currentTime - this.lastShotTime >= (1000 / this.fireRate);
    }

    // יורה לעבר אויב
    shoot(target) {
        if (this.canShoot()) {
            this.lastShotTime = Date.now();
            const angle = Math.atan2(target.y - this.y, target.x - this.x);
            bullets.push(new Bullet(this.x + this.width / 2, this.y + this.height / 2, angle));
        }
    }

    // איסוף קרש - מוסיף חיים ושדרוגים
    collectWood() {
        this.wood += 1;
        this.health += 10;
        this.fireRate += 0.1;
    }
}

// מחלקת ספינת אויב
class EnemyShip extends Ship {
    constructor(x, y) {
        super(x, y, loadedImages.enemy);
        this.health = 150;
        this.speed = 4;
        this.fireRate = 4;
        this.lastShotTime = 0;
    }

    // מצייר את ספינת האויב
    draw() {
        const waveY = getWaveY(this.x + this.width / 2, this.y);
        const waveDepth = Math.abs(waveY - this.y) * 0.10;

        const horizon = canvas.height * 0.25;
        const maxScale = 1;
        const minScale = 0.6;
        const distanceFromHorizon = Math.max(0, this.y - horizon);
        const scale = Math.max(minScale, Math.min(maxScale,
            minScale + (distanceFromHorizon / (canvas.height - horizon)) * (maxScale - minScale)
        ));

        ctx.save();
        ctx.translate(this.x + this.width / 2, waveY + waveDepth);
        ctx.scale(scale, scale);
        ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
        ctx.restore();
    }

    // מזיז את האויב לכיוון השחקן
    moveTowards(target) {
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 10) {
            this.x += (dx / dist) * this.speed;
            this.y += (dy / dist) * this.speed * 0.5;
        }
    }

    // יורה לעבר השחקן
    shootAtPlayer(target) {
        const currentTime = Date.now();
        if (currentTime - this.lastShotTime >= (1000 / this.fireRate)) {
            this.lastShotTime = currentTime;
            const angle = Math.atan2(target.y - this.y, target.x - this.x);
            enemyBullets.push(new Bullet(this.x + this.width / 2, this.y + this.height / 2, angle));
        }
    }
}

// מחלקת קליע
class Bullet {
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        this.width = 5;
        this.height = 10;
        this.speed = 7;
        this.angle = angle;
    }

    // מצייר קליע
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.drawImage(loadedImages.bullet, -this.width / 2, -this.height / 2, this.width, this.height);
        ctx.restore();
    }

    // מעדכן מיקום קליע
    update() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
    }

    // בודק פגיעה בספינה
    hits(ship) {
        return (
            this.x < ship.x + ship.width &&
            this.x + this.width > ship.x &&
            this.y < ship.y + ship.height &&
            this.y + this.height > ship.y
        );
    }
}

// מחלקת קרש (שדרוגים)
class Wood {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
    }

    // מצייר קרש
    draw() {
        const waveY = getWaveY(this.x + this.width / 2, this.y);
        const waveDepth = Math.abs(waveY - this.y) * 0.10;

        const horizon = canvas.height * 0.25;
        const maxScale = 1;
        const minScale = 0.6;
        const distanceFromHorizon = Math.max(0, this.y - horizon);
        const scale = Math.max(minScale, Math.min(maxScale,
            minScale + (distanceFromHorizon / (canvas.height - horizon)) * (maxScale - minScale)
        ));

        ctx.save();
        ctx.translate(this.x + this.width / 2, waveY + waveDepth);
        ctx.scale(scale, scale);
        ctx.drawImage(loadedImages.wood, -this.width / 2, -this.height / 2, this.width, this.height);
        ctx.restore();
    }

    // בודק אם השחקן אסף את הקרש
    collect(ship) {
        return (
            ship.x < this.x + this.width &&
            ship.x + ship.width > this.x &&
            ship.y < this.y + this.height &&
            ship.y + ship.height > this.y
        );
    }
}

// =====================
// משתנים של אובייקטים במשחק
// =====================
let player;
let enemies = [];
let woods = [];
let bullets = [];
let enemyBullets = [];
let score = 0;
let keys = {};

// =====================
// פונקציות לוגיקת משחק
// =====================

// אתחול משחק מחדש
function startGame() {
    resizeCanvas();
    player = new Ship(canvas.width / 2, canvas.height - 60, loadedImages.player);
    enemies = [];
    woods = [];
    bullets = [];
    enemyBullets = [];
    score = 0;
    gameOver = false;
    gameOverMessageElement.style.display = 'none';

    spawnEnemies();
    spawnWoods();

    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('keyup', handleKeyUp);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    // איפוס מאזיני מגע
    canvas.ontouchstart = null;
    canvas.ontouchmove = null;

    canvas.ontouchstart = (event) => {
        const nearestEnemy = getNearestEnemy();
        if (nearestEnemy) {
            player.shoot(nearestEnemy);
        }
        event.preventDefault();
    };
    canvas.ontouchmove = (event) => {
        const touch = event.touches[0];
        player.x = touch.clientX - player.width / 2;
        player.y = touch.clientY - player.height / 2;
        event.preventDefault();
    };

    gameLoop();
}

// יצירת אויבים כל כמה שניות
function spawnEnemies() {
    if (enemyInterval) clearInterval(enemyInterval);
    enemyInterval = setInterval(() => {
        if (enemies.length < 3) {
            const x = Math.random() * (canvas.width - 50);
            enemies.push(new EnemyShip(x, -50));
        }
    }, 3000);
}

// יצירת קרשים כל כמה שניות
function spawnWoods() {
    if (woodInterval) clearInterval(woodInterval);
    woodInterval = setInterval(() => {
        if (woods.length < 5) {
            const x = Math.random() * (canvas.width - 20);
            const y = Math.random() * (canvas.height - 20);
            woods.push(new Wood(x, y));
        }
    }, 5000);
}

// מחזיר את האויב הקרוב ביותר לשחקן
function getNearestEnemy() {
    let nearestEnemy = null;
    let minDistance = Infinity;

    enemies.forEach(enemy => {
        const distance = Math.hypot(enemy.x - player.x, enemy.y - player.y);
        if (distance < minDistance && distance <= player.range) {
            minDistance = distance;
            nearestEnemy = enemy;
        }
    });

    return nearestEnemy;
}

// מחשב את גובה הגל בנקודה מסוימת
function getWaveY(x, baseY) {
    const amplitude = 20;
    const frequency = 0.018;
    const phase = 0;
    return amplitude * Math.sin(x * frequency + waveOffset + phase) + baseY;
}

// מצייר את הגלים והרקע
function drawWaves() {
    // רקע מלא
    const baseHue = 190;
    const maxHue = 220;
    const hueRange = maxHue - baseHue;
    const bgHue = baseHue + ((Math.cos(backgroundOffset) + 1) / 2) * hueRange;
    ctx.fillStyle = `hsl(${bgHue}, 60%, 55%)`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // צבעי גלים
    const hue = baseHue + ((Math.sin(backgroundOffset) + 1) / 2) * hueRange;
    const waveColors = Array.from({length: 8}, (_, i) =>
        `hsl(${(hue + i * 4) % 360}, ${80 - i * 5}%, ${60 + i * 3}%)`
    );

    // מערך גלים שמכסה את כל הגובה
    const waveConfigs = [
        { amplitude: 20, frequency: 0.018, phase: 0, verticalOffset: canvas.height / 12 },
        { amplitude: 18, frequency: 0.022, phase: Math.PI / 6, verticalOffset: canvas.height / 6 },
        { amplitude: 16, frequency: 0.025, phase: Math.PI / 2, verticalOffset: canvas.height / 4 },
        { amplitude: 14, frequency: 0.019, phase: Math.PI / 3, verticalOffset: canvas.height / 3 },
        { amplitude: 12, frequency: 0.028, phase: Math.PI / 4, verticalOffset: canvas.height / 2.2 },
        { amplitude: 10, frequency: 0.021, phase: -Math.PI / 5, verticalOffset: canvas.height / 1.7 },
        { amplitude: 8, frequency: 0.027, phase: Math.PI / 8, verticalOffset: canvas.height / 1.3 },
        { amplitude: 6, frequency: 0.024, phase: -Math.PI / 7, verticalOffset: canvas.height / 1.05 }
    ];

    waveConfigs.forEach((config, index) => {
        ctx.strokeStyle = waveColors[index % waveColors.length];
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 0; x < canvas.width; x++) {
            const y = config.amplitude * Math.sin(x * config.frequency + waveOffset + config.phase) + config.verticalOffset;
            ctx.lineTo(x, y);
        }
        ctx.stroke();
    });
    waveOffset += waveSpeed;
    backgroundOffset += backgroundSpeed * 0.2;
}

// מאזיני מקשים לתנועה וירי
function handleKeyDown(e) {
    keys[e.code] = true;

    if (e.code === 'Space') {
        const nearestEnemy = getNearestEnemy();
        if (nearestEnemy) {
            player.shoot(nearestEnemy);
        }
    }
}

function handleKeyUp(e) {
    keys[e.code] = false;
}

// מעדכן תנועת השחקן לפי מקשים
function updatePlayerMovement() {
    player.dx = 0;
    player.dy = 0;
    if (keys['ArrowUp'] || keys['KeyW']) player.dy = -1;
    if (keys['ArrowDown'] || keys['KeyS']) player.dy = 1;
    if (keys['ArrowLeft'] || keys['KeyA']) player.dx = -1;
    if (keys['ArrowRight'] || keys['KeyD']) player.dx = 1;
    player.move();
}

// מעדכן קליעים של השחקן
function updateBullets() {
    bullets = bullets.filter(bullet => {
        bullet.update();
        let hitEnemy = false;
        enemies = enemies.filter(enemy => {
            if (bullet.hits(enemy)) {
                enemy.health -= 50;
                hitEnemy = true;
                if (enemy.health <= 0) {
                    score += 10;
                    return false;
                }
            }
            return true;
        });
        return !hitEnemy && bullet.x > 0 && bullet.x < canvas.width && bullet.y > 0 && bullet.y < canvas.height;
    });
}

// מעדכן קליעים של אויבים
function updateEnemyBullets() {
    enemyBullets = enemyBullets.filter(bullet => {
        bullet.update();
        if (bullet.hits(player)) {
            player.health -= 20;
            return false;
        }
        return bullet.x > 0 && bullet.x < canvas.width && bullet.y > 0 && bullet.y < canvas.height;
    });
}

// מעדכן תנועת אויבים וירי שלהם
function updateEnemies() {
    enemies.forEach(enemy => {
        enemy.moveTowards(player);
        enemy.shootAtPlayer(player);
    });
}

// מעדכן קרשים (שדרוגים)
function updateWoods() {
    woods = woods.filter(wood => {
        if (wood.collect(player)) {
            player.collectWood();
            return false;
        }
        return true;
    });
}

// בודק אם המשחק נגמר
function checkGameOver() {
    if (player.health <= 0) {
        gameOver = true;
        gameOverTextElement.textContent = `Game Over! Score: ${score}`;
        gameOverMessageElement.style.display = 'block';
    }
}

// =====================
// לולאת המשחק הראשית
// =====================
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawWaves();

    if (!gameOver) {
        updatePlayerMovement();
        updateBullets();
        updateEnemyBullets();
        updateEnemies();
        updateWoods();
        checkGameOver();

        player.draw();
        enemies.forEach(enemy => enemy.draw());
        woods.forEach(wood => wood.draw());
        bullets.forEach(bullet => bullet.draw());
        enemyBullets.forEach(bullet => bullet.draw());

        requestAnimationFrame(gameLoop);
    } else {
        player.draw();
        enemies.forEach(enemy => enemy.draw());
        woods.forEach(wood => wood.draw());
        bullets.forEach(bullet => bullet.draw());
        enemyBullets.forEach(bullet => bullet.draw());
        // לא מפעילים requestAnimationFrame
    }
}

// =====================
// פונקציות עזר ואתחול
// =====================

// התאמת הקנבס לגודל החלון
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);

// מניעת גלילה במובייל
document.body.addEventListener('touchmove', function(event) {
    event.preventDefault();
}, { passive: false });

// אתחול המשחק
loadImages();
restartButton.addEventListener('click', startGame);

// =====================
// סוף הקובץ
// =====================
