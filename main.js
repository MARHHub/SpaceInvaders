// Get the canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreElement = document.getElementById('finalScore');
const playAgainBtn = document.getElementById('playAgainBtn');
const startScreen = document.getElementById('startScreen');
const startGameBtn = document.getElementById('startGameBtn');

// Set canvas dimensions to fill the screen
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Reload canvas size when the window resizes
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    playerY = canvas.height - 100; // Keep the player near the bottom
});

// Load images
const background = new Image();
const playerImg = new Image();
const bulletImg = new Image();
const enemyImg = new Image();
const enemyBulletImg = new Image();
const lifeImg = new Image(); // For player lives
background.src = 'background.png';
playerImg.src = 'player.png';
bulletImg.src = 'bullet.png';
enemyImg.src = 'enemy.png';
enemyBulletImg.src = 'bullet.png';
lifeImg.src = 'player.png'; // Image for player lives

// Player settings (start near the center but lower)
let playerX = canvas.width / 2 - 32; // Center horizontally
let playerY = canvas.height - 100; // Lower in the canvas
let playerX_change = 0;
let playerWidth = 64;
let playerHeight = 64;
let playerLives = 3; // 3 lives system
let gameOver = false;

// Bullet settings (limit to one active bullet at a time)
let bullet = null;
let bulletY_change = 10;

// Enemy settings (10 enemies, constantly present)
let numEnemies = 10;
let enemies = [];
let enemyBullets = [];
const enemyShootInterval = 2000; // Enemies shoot every 2-3 seconds
const maxEnemyBullets = 3; // Limit active enemy bullets
const minimumEnemyDistance = 150; // Minimum distance from the player

// Generate enemies at a distance away from the player
function createEnemies() {
    enemies = [];
    for (let i = 0; i < numEnemies; i++) {
        let enemyX, enemyY;
        do {
            enemyX = Math.random() * (canvas.width - 64);
            enemyY = Math.random() * (canvas.height / 2);
        } while (Math.abs(enemyX - playerX) < minimumEnemyDistance || enemyY > canvas.height / 3);

        enemies.push({
            x: enemyX,
            y: enemyY,
            x_change: 4,
            y_change: 40,
            canShoot: true
        });
    }
}
createEnemies();

// Make the closest enemy shoot
function closestEnemyShoot() {
    if (!gameOver && enemyBullets.length < maxEnemyBullets) {
        let closestEnemy = enemies.reduce((closest, current) => {
            let closestDist = Math.abs(closest.x - playerX);
            let currentDist = Math.abs(current.x - playerX);
            return currentDist < closestDist ? current : closest;
        });

        if (closestEnemy.canShoot) {
            enemyBullets.push({
                x: closestEnemy.x + 16,
                y: closestEnemy.y
            });
            closestEnemy.canShoot = false;
            setTimeout(() => closestEnemy.canShoot = true, Math.random() * 1000 + 2000); // Reset after 2-3 seconds
        }
    }
}
setInterval(closestEnemyShoot, 500); // Check for enemy shots every 0.5 seconds

// Game settings
let score = 0;
const font = "20px 'Arial', sans-serif";
const fontColor = "#FFFFFF";

// Draw player
function drawPlayer() {
    ctx.drawImage(playerImg, playerX, playerY, playerWidth, playerHeight);
}

// Draw enemies
function drawEnemies() {
    for (let i = 0; i < enemies.length; i++) {
        ctx.drawImage(enemyImg, enemies[i].x, enemies[i].y, 64, 64);
    }
}

// Fire bullet
function fireBullet() {
    if (bullet === null) {
        bullet = {
            x: playerX + 16, // Position the bullet from player's current position
            y: playerY
        };
    }
}

// Draw and move the bullet
function drawBullet() {
    if (bullet !== null) {
        ctx.drawImage(bulletImg, bullet.x, bullet.y, 32, 32);
        bullet.y -= bulletY_change;

        // Remove bullet if it goes off the screen
        if (bullet.y <= 0) {
            bullet = null; // Allow player to fire again
        }
    }
}

// Draw and move enemy bullets
// Fix loseLife function to decrease lives and handle game over properly
function loseLife() {
    playerLives--; // Decrease player lives by 1
    if (playerLives === 0) {
        gameOver = true; // Trigger game over if no lives are left
        showGameOverScreen();
    }
}

// Ensure the collision detection is accurate (change the radius if needed)
function isCollision(x1, y1, x2, y2, radius) {
    let distance = Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
    return distance < radius;
}

// Adjust drawEnemyBullets function to remove only one life per bullet hit
function drawEnemyBullets() {
    for (let i = 0; i < enemyBullets.length; i++) {
        const bullet = enemyBullets[i];
        if (bullet && typeof bullet.y !== 'undefined') {
            ctx.drawImage(enemyBulletImg, bullet.x, bullet.y, 10, 20);
            bullet.y += 4; // Keep the original bullet speed

            // Remove the bullet if it moves off-screen
            if (bullet.y > canvas.height) {
                enemyBullets.splice(i, 1);
                i--; // Adjust index after removal
            }

            // Check for collision with the player
            if (isCollision(playerX, playerY, bullet.x, bullet.y, 30)) {
                loseLife();  // Call loseLife when player is hit
                enemyBullets.splice(i, 1); // Remove bullet on collision
                i--; // Adjust index after removal
            }
        }
    }
}



// Check if enemy touches the player (game over)
function checkEnemyCollision() {
    for (let i = 0; i < enemies.length; i++) {
        if (isCollision(enemies[i].x, enemies[i].y, playerX, playerY, playerWidth, playerHeight)) {
            gameOver = true;
            showGameOverScreen();
            return;
        }
    }
}

// Show score and lives
function showScoreAndLives() {
    // Show score
    ctx.fillStyle = fontColor;
    ctx.font = font;
    ctx.fillText("Score: " + score, 10, 30);

    // Show lives on the top-right
    for (let i = 0; i < playerLives; i++) {
        ctx.drawImage(lifeImg, canvas.width - (i + 1) * 40, 10, 30, 30); // Draw player life icons
    }
}

// Show game over screen
function showGameOverScreen() {
    gameOverScreen.style.display = 'block';
    finalScoreElement.textContent = `Your score: ${score}`;
    canvas.style.display = 'none';
}

// Reset game when play again is clicked
playAgainBtn.addEventListener('click', () => {
    gameOver = false;
    score = 0;
    playerLives = 3;
    bullet = null;
    enemyBullets = [];
    createEnemies();
    gameOverScreen.style.display = 'none';
    canvas.style.display = 'block';
    gameLoop();
});

// Show start screen initially
startScreen.style.display = 'block';
canvas.style.display = 'none'; // Hide the canvas initially

// Start the game when "Start Game" button is clicked
startGameBtn.addEventListener('click', () => {
    startScreen.style.display = 'none';
    canvas.style.display = 'block';
    gameLoop(); // Start the game loop
});

// Game loop
function gameLoop() {
    if (gameOver) return; // Stop game loop if game is over

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    // Player movement
    playerX += playerX_change;
    if (playerX <= 0) playerX = 0;
    if (playerX >= canvas.width - 64) playerX = canvas.width - 64;

    drawPlayer();

    // Enemy movement
    for (let i = 0; i < enemies.length; i++) {
        enemies[i].x += enemies[i].x_change;
        if (enemies[i].x <= 0 || enemies[i].x >= canvas.width - 64) {
            enemies[i].x_change = -enemies[i].x_change;
            enemies[i].y += enemies[i].y_change;
        }

        // Collision detection for bullet and enemies
        if (bullet !== null && isCollision(bullet.x, bullet.y, enemies[i].x, enemies[i].y, 64, 64)) {
            score += 1;

            // Reset enemy position after collision
            enemies[i].x = Math.random() * (canvas.width - 64);
            enemies[i].y = Math.random() * (canvas.height / 2);

            // Remove bullet after hitting an enemy
            bullet = null; // Allow player to fire again
        }
    }

    drawEnemies();
    drawBullet(); // Update and draw bullet
    drawEnemyBullets(); // Draw enemy bullets
    checkEnemyCollision(); // Check if enemy touches the player (game over)

    // Show score and lives
    showScoreAndLives();

    requestAnimationFrame(gameLoop);
}

// Key press events
document.addEventListener('keydown', (event) => {
    if (event.key === "ArrowLeft") {
        playerX_change = -5;
    }
    if (event.key === "ArrowRight") {
        playerX_change = 5;
    }
    if (event.key === " ") {
        fireBullet(); // Fire a new bullet only when no bullet is active
    }
});

document.addEventListener('keyup', (event) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        playerX_change = 0;
    }
});

// Start game loop
gameLoop();
