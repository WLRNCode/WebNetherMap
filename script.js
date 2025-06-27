function Main() {
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
    let scale = 1;

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
            x: worldX + x * scale,
            y: worldY + y * scale
        };
    }

    function screenToWorld(x, y) {
        return {
            x: (x - worldX) / scale,
            y: (y - worldY) / scale
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
        drawRect(0, 0, mapCanvas.width, mapCanvas.height, '#1b1a1f');

        // Оси координат
        drawLine(worldX, worldY, worldX, worldY - 10000 * scale, '#fc5455', 5 * scale);     // вверх
        drawLine(worldX, worldY, worldX, worldY + 10000 * scale, '#605bde', 5 * scale);    // вниз
        drawLine(worldX, worldY, worldX + 10000 * scale, worldY, '#41b06d', 5 * scale);   // вправо
        drawLine(worldX, worldY, worldX - 10000 * scale, worldY, '#fcc800', 5 * scale);  // влево
        drawCircle(worldX, worldY, 10 * scale, 0, '#37363b');
        drawCircle(worldX, worldY, 12 * scale, 0, '#1b1a1f',false,true,5 * scale);

        for (const portal of portals) {
            const { x, y } = worldToScreen(portal.x, portal.y);


            // Выбор ведущей оси
            const headLine = Math.abs(portal.x) < Math.abs(portal.y) ? 'x' : 'y';

            // Определение цвета линии по квадранту
            let color;
            if (portal.x >= 0 && portal.y >= 0) color = headLine === 'x' ? '#605bde' : '#41b06d';
            else if (portal.x < 0 && portal.y >= 0) color = headLine === 'x' ? '#605bde' : '#fcc800';
            else if (portal.x < 0 && portal.y < 0) color = headLine === 'x' ? '#fc5455' : '#fcc800';
            else if (portal.x >= 0 && portal.y < 0) color = headLine === 'x' ? '#fc5455' : '#41b06d';

            // Отрисовка линии от портала к оси
            if (headLine === 'x') {
                drawLine(x, y, worldX, y, color, 5 * scale);
                drawCircle(x, y, 7 * scale, 0, color);
                drawCircle(x, y, 9 * scale, 0, '#1b1a1f',false,true,5 * scale);
                drawCircle(worldX, y, 7 * scale, 0, color);
                drawCircle(worldX, y, 9 * scale, 0, '#1b1a1f',false,true,5 * scale);
            } else {
                drawLine(x, y, x, worldY, color, 5 * scale);
                drawCircle(x, y, 7 * scale, 0, color);
                drawCircle(x, y, 9 * scale, 0, '#1b1a1f',false,true,5 * scale);
                drawCircle(x, worldY, 7 * scale, 0, color);
                drawCircle(x, worldY, 9 * scale, 0, '#1b1a1f',false,true,5 * scale);
            }

            // Отрисовка круга портала
            

            // Подпись
            ctx.font = `${20 * scale}px Georgia`;
            ctx.fillStyle = 'white';
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 3;
            ctx.strokeText(portal.nickname, x + 30, y);
            ctx.fillText(portal.nickname, x + 30, y);

            // ===== Координаты мыши =====
            const mouseWorldX = mouseScreenX - worldX;
            const mouseWorldY = mouseScreenY - worldY;

            const text = `X: ${mouseWorldX.toFixed(0)} | Y: ${mouseWorldY.toFixed(0)}`;

            ctx.font = `${20}px monospace`;
            ctx.fillStyle = 'black';
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 3;

            // Позиция: справа сверху
            ctx.textAlign = 'right';
            ctx.strokeText(text, mapCanvas.width -10, 30);
            ctx.fillText(text, mapCanvas.width -10, 30);
            ctx.textAlign = 'left';
        }
    }

    // Цикл отрисовки
    function renderLoop() {
        mapCanvas.width = window.innerWidth;
        mapCanvas.height = window.innerHeight;
        draw();
        requestAnimationFrame(renderLoop);
    }

    renderLoop();

    // События 
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

    mapCanvas.addEventListener("wheel", (event) => {
        const zoomIntensity = 0.1;
        const delta = event.deltaY < 0 ? 1 : -1;
        const oldScale = scale;

        scale += delta * scale * zoomIntensity;
        scale = Math.max(0.1, Math.min(5, scale)); // Ограничение

        const mouseX = event.clientX;
        const mouseY = event.clientY;

        const worldBeforeZoom = screenToWorld(mouseX, mouseY);
        const worldAfterZoom = screenToWorld(mouseX, mouseY); // пересчитывается через новый scale

        worldX += (worldBeforeZoom.x - worldAfterZoom.x) * scale;
        worldY += (worldBeforeZoom.y - worldAfterZoom.y) * scale;

        event.preventDefault();
    }, { passive: false });
}
Main();


