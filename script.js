script.js
// script.js - Parte 3A
// Movimento, física básica, IA simples e desenho da quadra

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const playerScoreEl = document.getElementById("playerScore");
const cpuScoreEl = document.getElementById("cpuScore");
const timerEl = document.getElementById("timer");
const gameOverEl = document.getElementById("gameOver");
const winnerTextEl = document.getElementById("winnerText");

const GRAVITY = 0.7;
const FLOOR = 420;

// Controles
const keys = {};

document.addEventListener("keydown", (e) => {
    keys[e.code] = true;
});

document.addEventListener("keyup", (e) => {
    keys[e.code] = false;
});

// Jogador
const player = {
    x: 150,
    y: FLOOR,
    width: 40,
    height: 80,
    color: "blue",

    vx: 0,
    vy: 0,

    speed: 5,
    jumpPower: -14,

    onGround: true
};

// CPU
const cpu = {
    x: 800,
    y: FLOOR,
    width: 40,
    height: 80,
    color: "red",

    vx: 0,
    vy: 0,

    speed: 3,
    jumpPower: -14,

    onGround: true
};

function updatePlayer() {
    player.vx = 0;

    if (keys["KeyA"]) {
        player.vx = -player.speed;
    }

    if (keys["KeyD"]) {
        player.vx = player.speed;
    }

    if (keys["KeyW"] && player.onGround) {
        player.vy = player.jumpPower;
        player.onGround = false;
    }

    player.x += player.vx;

    player.vy += GRAVITY;
    player.y += player.vy;

    if (player.y >= FLOOR) {
        player.y = FLOOR;
        player.vy = 0;
        player.onGround = true;
    }

    // Limites da quadra
    if (player.x < 0) {
        player.x = 0;
    }

    if (player.x + player.width > canvas.width) {
        player.x = canvas.width - player.width;
    }
}

function updateCPU() {
    // IA bem simples:
    // tenta se aproximar do jogador

    if (cpu.x > player.x + 60) {
        cpu.vx = -cpu.speed;
    } else if (cpu.x < player.x - 60) {
        cpu.vx = cpu.speed;
    } else {
        cpu.vx = 0;
    }

    cpu.x += cpu.vx;

    cpu.vy += GRAVITY;
    cpu.y += cpu.vy;

    if (cpu.y >= FLOOR) {
        cpu.y = FLOOR;
        cpu.vy = 0;
        cpu.onGround = true;
    }

    if (cpu.x < 0) {
        cpu.x = 0;
    }

    if (cpu.x + cpu.width > canvas.width) {
        cpu.x = canvas.width - cpu.width;
    }
}

function drawCourt() {
    // Fundo da quadra
    ctx.fillStyle = "#d2a679";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Linha do chão
    ctx.strokeStyle = "white";
    ctx.lineWidth = 4;

    ctx.beginPath();
    ctx.moveTo(0, FLOOR + 80);
    ctx.lineTo(canvas.width, FLOOR + 80);
    ctx.stroke();

    // Cesta esquerda
    ctx.strokeRect(40, 200, 10, 80);

    // Cesta direita
    ctx.strokeRect(canvas.width - 50, 200, 10, 80);
}

function drawPlayer(character) {
    ctx.fillStyle = character.color;

    ctx.fillRect(
        character.x,
        character.y,
        character.width,
        character.height
    );
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    updatePlayer();
    updateCPU();

    drawCourt();

    drawPlayer(player);
    drawPlayer(cpu);

    requestAnimationFrame(gameLoop);
}



// ===============================
// PARTE 3B - BOLA E PONTUAÇÃO
// Cole este código ABAIXO da Parte 3A
// ===============================

// Bola
const ball = {
    x: player.x + 50,
    y: player.y + 20,
    radius: 12,

    vx: 0,
    vy: 0,

    holder: "player", // "player", "cpu" ou null
    color: "orange"
};

let playerScore = 0;
let cpuScore = 0;

let shootCooldown = false;

// Arremesso do jogador
document.addEventListener("keydown", (e) => {
    if (e.code === "Space" && !shootCooldown) {
        if (ball.holder === "player") {
            ball.holder = null;

            ball.vx = 12;
            ball.vy = -12;

            shootCooldown = true;

            setTimeout(() => {
                shootCooldown = false;
            }, 500);
        }
    }
});

// Atualização da bola
function updateBall() {

    // Se estiver com o jogador
    if (ball.holder === "player") {
        ball.x = player.x + player.width + 10;
        ball.y = player.y + 30;
        return;
    }

    // Se estiver com a CPU
    if (ball.holder === "cpu") {
        ball.x = cpu.x - 10;
        ball.y = cpu.y + 30;

        // Pequena chance da CPU arremessar
        if (Math.random() < 0.005) {
            ball.holder = null;

            ball.vx = -12;
            ball.vy = -12;
        }

        return;
    }

    // Física da bola
    ball.vy += GRAVITY;

    ball.x += ball.vx;
    ball.y += ball.vy;

    // Quicar no chão
    if (ball.y + ball.radius >= FLOOR + 80) {
        ball.y = FLOOR + 80 - ball.radius;

        ball.vy *= -0.7;
        ball.vx *= 0.95;
    }

    // Limites laterais
    if (ball.x - ball.radius <= 0) {
        ball.x = ball.radius;
        ball.vx *= -0.8;
    }

    if (ball.x + ball.radius >= canvas.width) {
        ball.x = canvas.width - ball.radius;
        ball.vx *= -0.8;
    }

    // Jogador pega a bola
    if (
        ball.holder === null &&
        ball.x > player.x &&
        ball.x < player.x + player.width &&
        ball.y > player.y &&
        ball.y < player.y + player.height
    ) {
        ball.holder = "player";

        ball.vx = 0;
        ball.vy = 0;
    }

    // CPU pega a bola
    if (
        ball.holder === null &&
        ball.x > cpu.x &&
        ball.x < cpu.x + cpu.width &&
        ball.y > cpu.y &&
        ball.y < cpu.y + cpu.height
    ) {
        ball.holder = "cpu";

        ball.vx = 0;
        ball.vy = 0;
    }

    // ===== CESTA DIREITA (PONTO DO JOGADOR) =====
    if (
        ball.x >= canvas.width - 50 &&
        ball.x <= canvas.width - 40 &&
        ball.y >= 200 &&
        ball.y <= 280
    ) {
        playerScore++;
        playerScoreEl.textContent = playerScore;

        resetBall("cpu");
    }

    // ===== CESTA ESQUERDA (PONTO DA CPU) =====
    if (
        ball.x >= 40 &&
        ball.x <= 50 &&
        ball.y >= 200 &&
        ball.y <= 280
    ) {
        cpuScore++;
        cpuScoreEl.textContent = cpuScore;

        resetBall("player");
    }
}

// Reiniciar bola após cesta
function resetBall(holder) {

    ball.holder = holder;

    ball.vx = 0;
    ball.vy = 0;

    if (holder === "player") {
        ball.x = player.x;
        ball.y = player.y;
    } else {
        ball.x = cpu.x;
        ball.y = cpu.y;
    }
}

// Desenhar bola
function drawBall() {
    ctx.fillStyle = ball.color;

    ctx.beginPath();
    ctx.arc(
        ball.x,
        ball.y,
        ball.radius,
        0,
        Math.PI * 2
    );

    ctx.fill();
}

// ===============================
// ALTERE O gameLoop() DA PARTE 3A
// ===============================

// Dentro do gameLoop(), adicione:

updateBall();
drawBall();

// A ordem deve ficar assim:

/*
updatePlayer();
updateCPU();
updateBall();

drawCourt();

drawPlayer(player);
drawPlayer(cpu);
drawBall();
*/

// ===============================
// PARTE 3C - CRONÔMETRO, FIM DE JOGO E REINÍCIO
// Cole este código ABAIXO da Parte 3B
// ===============================

// Tempo da partida (em segundos)
let timeLeft = 60;
let gameEnded = false;

// Atualiza o cronômetro na tela
timerEl.textContent = timeLeft;

// Cronômetro
const timerInterval = setInterval(() => {
    if (gameEnded) return;

    timeLeft--;
    timerEl.textContent = timeLeft;

    if (timeLeft <= 0) {
        endGame();
    }
}, 1000);

// Finaliza a partida
function endGame() {
    gameEnded = true;

    clearInterval(timerInterval);

    gameOverEl.classList.remove("hidden");

    if (playerScore > cpuScore) {
        winnerTextEl.textContent = "🏆 You Win!";
    } else if (cpuScore > playerScore) {
        winnerTextEl.textContent = "🤖 CPU Wins!";
    } else {
        winnerTextEl.textContent = "🤝 It's a Tie!";
    }
}

// Reiniciar o jogo
function restartGame() {
    location.reload();
}

// ===============================
// MODIFIQUE O gameLoop()
// ===============================

// Troque o gameLoop da Parte 3A por este:

function gameLoop() {

    if (!gameEnded) {

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        updatePlayer();
        updateCPU();
        updateBall();

        drawCourt();

        drawPlayer(player);
        drawPlayer(cpu);
        drawBall();
    }

    requestAnimationFrame(gameLoop);
}

// Inicia o jogo
gameLoop();

