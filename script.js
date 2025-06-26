const mapCanvas = document.createElement('canvas');
const ctx = mapCanvas.getContext("2d");

mapCanvas.width = window.innerWidth;
mapCanvas.height = window.innerHeight;
mapCanvas.style.left = `0px`;
mapCanvas.style.top = `0px`;
document.body.append(mapCanvas);

let mouseClicked = false;
let lastMouseX = 0;
let lastMouseY = 0;
let worldX = mapCanvas.width / 2;
let worldY = mapCanvas.height / 2;
let mouseScreenX = 0;
let mouseScreenY = 0;

// ======== Утилиты ========
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandomNickname(length = 6) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function worldToScreen(x, y) {
    return {
        x: worldX + x,
        y: worldY + y
    };
}

// Генерация порталов
const portals = Array.from({ length: 100 }, () => ({
    x: getRandomInt(-10000, 10000),
    y: getRandomInt(-10000, 10000),
    nickname: generateRandomNickname(),
    colorLine: undefined
}));

// Функции отрисовки
function drawLine(x1, y1, x2, y2, color = `black`, width = 1) {
    ctx.lineWidth = width;
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

function drawRect(x, y, width, height, color = `black`, stroke = false, lineWidth = 1) {
    if (stroke) {
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = color;
        ctx.strokeRect(x, y, width, height);
    } else {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, width, height);
    }
}

function drawCircle(x, y, radius, startAngle = 0, color = `black`, angle = false, stroke = false, lineWidth = 1) {
    ctx.beginPath();
    ctx.arc(x, y, radius, (startAngle * Math.PI) / 180, Math.PI * 2, angle);
    if (stroke) {
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = color;
        ctx.stroke();
    } else {
        ctx.fillStyle = color;
        ctx.fill();
    }
}

function draw() {
    ctx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
    drawRect(0, 0, mapCanvas.width, mapCanvas.height, 'black');

    // Оси координат
    drawLine(worldX, worldY, worldX, worldY - 10000, 'red', 10);     // вверх
    drawLine(worldX, worldY, worldX, worldY + 10000, 'blue', 10);    // вниз
    drawLine(worldX, worldY, worldX + 10000, worldY, 'green', 10);   // вправо
    drawLine(worldX, worldY, worldX - 10000, worldY, 'yellow', 10);  // влево
    drawCircle(worldX, worldY, 50, 0, 'white');

    for (const portal of portals) {
        const { x, y } = worldToScreen(portal.x, portal.y);

        // Отрисовка круга портала
        drawCircle(x, y, 50, 0, 'white');

        // Выбор ведущей оси
        const headLine = Math.abs(portal.x) < Math.abs(portal.y) ? 'x' : 'y';

        // Определение цвета линии по квадранту
        let color;
        if (portal.x >= 0 && portal.y >= 0) color = headLine === 'x' ? 'blue' : 'green';
        else if (portal.x < 0 && portal.y >= 0) color = headLine === 'x' ? 'blue' : 'yellow';
        else if (portal.x < 0 && portal.y < 0) color = headLine === 'x' ? 'red' : 'yellow';
        else if (portal.x >= 0 && portal.y < 0) color = headLine === 'x' ? 'red' : 'green';

        // Отрисовка линии от портала к оси
        if (headLine === 'x') {
            drawLine(x, y, worldX, y, color, 10);
        } else {
            drawLine(x, y, x, worldY, color, 10);
        }

        // Подпись
        ctx.font = '50px Georgia';
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 3;
        ctx.strokeText(portal.nickname, x + 60, y);
        ctx.fillText(portal.nickname, x + 60, y);

        // ===== Координаты мыши =====
        const mouseWorldX = mouseScreenX - worldX;
        const mouseWorldY = mouseScreenY - worldY;

        const text = `X: ${mouseWorldX.toFixed(0)} | Y: ${mouseWorldY.toFixed(0)}`;

        ctx.font = '120px monospace';
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 3;

        // Позиция: справа сверху
        ctx.textAlign = 'right';
        ctx.strokeText(text, mapCanvas.width -10, 130);
        ctx.fillText(text, mapCanvas.width -10, 130);
        ctx.textAlign = 'left';
    }
}

// Цикл отрисовки
function renderLoop() {
    draw();
    requestAnimationFrame(renderLoop);
}

renderLoop();

// События мыши
document.addEventListener('mousedown', (event) => {
    mouseClicked = true;
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
});

document.addEventListener('mouseup', () => {
    mouseClicked = false;
});

mapCanvas.addEventListener('mousemove', (event) => {
    mouseScreenX = event.clientX;
    mouseScreenY = event.clientY;

    if (mouseClicked) {
        const dx = event.clientX - lastMouseX;
        const dy = event.clientY - lastMouseY;
        worldX += dx;
        worldY += dy;
        lastMouseX = event.clientX;
        lastMouseY = event.clientY;
    }
});
