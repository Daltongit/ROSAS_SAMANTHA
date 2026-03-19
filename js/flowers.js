/* =============================================
   flowers.js  –  Animación del árbol de rosas
   =============================================
   Fases:
     0  → semilla cae al suelo
     1  → brota el tronco (ramas fractal)
     2  → aparecen las flores en forma de corazón
     3  → animación completa, flores ondean
   ============================================= */

const FlowerTree = (() => {

    /* ── Paleta de rosas rosadas ── */
    const COLORS = {
        petal: ['#ffc0cb', '#ff85a1', '#ff69b4', '#ff4d79', '#ffb6c1', '#e91e8c'],
        center: ['#fff0a0', '#ffe066', '#ffcf40'],
        trunk: '#6b3a2a',
        branch: '#7d4535',
        seed: '#4e2a04',
    };

    /* ── Variables de estado ── */
    let canvas, ctx, W, H;
    let phase = 0;
    let progress = 0;
    let rafId = null;
    let flowers = [];
    let onComplete = null;

    /* ── Corazón paramétrico ── */
    function heartPoint(t, cx, cy, size) {
        const x = size * 16 * Math.pow(Math.sin(t), 3);
        const y = -size * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
        return { x: cx + x, y: cy + y };
    }

    function buildHeartPoints(cx, cy, size, n) {
        const pts = [];
        // Borde del corazón
        for (let i = 0; i < n; i++) {
            const t = (i / n) * Math.PI * 2;
            pts.push(heartPoint(t, cx, cy, size));
        }
        // Interior del corazón
        for (let i = 0; i < n * 0.6; i++) {
            const t = Math.random() * Math.PI * 2;
            const scale = 0.3 + Math.random() * 0.65;
            const x = size * scale * 16 * Math.pow(Math.sin(t), 3);
            const y = -size * scale * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
            pts.push({ x: cx + x, y: cy + y });
        }
        return pts;
    }

    /* ── Dibuja una rosa ── */
    function drawRose(cx, cy, r, petalColor, centerColor, alpha, wobble) {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(cx + Math.sin(wobble) * 1.5, cy + Math.cos(wobble * 1.3) * 1);

        // 5 pétalos
        for (let i = 0; i < 5; i++) {
            ctx.save();
            ctx.rotate((i / 5) * Math.PI * 2 + wobble * 0.3);
            ctx.beginPath();
            ctx.ellipse(0, -r * 0.7, r * 0.45, r * 0.75, 0, 0, Math.PI * 2);
            ctx.fillStyle = petalColor;
            ctx.fill();
            ctx.restore();
        }
        // Centro
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.38, 0, Math.PI * 2);
        ctx.fillStyle = centerColor;
        ctx.fill();

        ctx.restore();
    }

    /* ── Árbol fractal ── */
    function drawBranch(x1, y1, angle, len, depth, alpha) {
        if (depth === 0 || len < 2) return;
        const x2 = x1 + len * Math.sin(angle);
        const y2 = y1 - len * Math.cos(angle);

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = depth > 3 ? COLORS.trunk : COLORS.branch;
        ctx.lineWidth = depth * 1.8;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.restore();

        const spread = 0.45;
        drawBranch(x2, y2, angle - spread, len * 0.68, depth - 1, alpha);
        drawBranch(x2, y2, angle + spread, len * 0.68, depth - 1, alpha);
        if (depth > 2) drawBranch(x2, y2, angle, len * 0.72, depth - 1, alpha);
    }

    /* ── Dibuja la semilla ── */
    function drawSeed(x, y, alpha) {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.ellipse(x, y, 5, 8, 0, 0, Math.PI * 2);
        ctx.fillStyle = COLORS.seed;
        ctx.fill();
        ctx.restore();
    }

    function clear() {
        ctx.clearRect(0, 0, W, H);
    }

    /* ── Loop principal ── */
    let lastTime = 0;
    function loop(ts) {
        const dt = Math.min((ts - lastTime) / 1000, 0.05);
        lastTime = ts;
        clear();
        update(dt);
        render();
        rafId = phase < 3
            ? requestAnimationFrame(loop)
            : requestAnimationFrame(loopIdle);
    }

    let idleTime = 0;
    function loopIdle(ts) {
        const dt = Math.min((ts - lastTime) / 1000, 0.05);
        lastTime = ts;
        idleTime += dt;
        clear();
        renderComplete(idleTime);
        rafId = requestAnimationFrame(loopIdle);
    }

    /* ── Update por fase ── */
    const SPEEDS = [0.6, 0.22, 0.18, 1.0];
    function update(dt) {
        progress = Math.min(progress + dt * SPEEDS[phase], 1);
        if (progress >= 1) {
            progress = 0;
            phase++;
            if (phase === 3 && onComplete) onComplete();
        }
    }

    /* ── Render por fase ── */
    function render() {
        const trunkX = W / 2;
        const trunkY = H - 10;

        if (phase === 0) {
            // Semilla cayendo
            const y = progress * (trunkY - 20) + 10;
            drawSeed(trunkX, y, 1);
        }

        if (phase === 1) {
            // Tronco creciendo
            drawSeed(trunkX, trunkY - 5, 1 - progress);
            ctx.save();
            ctx.rect(0, trunkY - (trunkY - 40) * progress, W, H);
            ctx.clip();
            drawBranch(trunkX, trunkY, 0, H * 0.38, 7, progress);
            ctx.restore();
        }

        if (phase === 2) {
            // Flores apareciendo sobre el árbol
            drawBranch(trunkX, trunkY, 0, H * 0.38, 7, 1);
            const n = Math.floor(flowers.length * progress);
            for (let i = 0; i < n; i++) {
                const f = flowers[i];
                drawRose(f.x, f.y, f.r, f.petal, f.center, f.alpha, 0);
            }
        }
    }

    /* ── Render idle (flores ondeando) ── */
    function renderComplete(t) {
        const trunkX = W / 2;
        const trunkY = H - 10;
        drawBranch(trunkX, trunkY, 0, H * 0.38, 7, 1);
        flowers.forEach(f => {
            drawRose(f.x, f.y, f.r, f.petal, f.center, f.alpha, t * 1.2 + f.phase);
        });
    }

    /* ── API pública ── */
    function init(canvasEl, completeCb) {
        canvas = canvasEl;
        ctx = canvas.getContext('2d');
        onComplete = completeCb || null;
        resize();
        buildFlowers();
        phase = 0;
        progress = 0;
        lastTime = 0;
        idleTime = 0;
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(loop);
    }

    function resize() {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        W = rect.width;
        H = rect.height;
        canvas.width = W * dpr;
        canvas.height = H * dpr;
        ctx.scale(dpr, dpr);
    }

    function buildFlowers() {
        flowers = [];
        const cx = W / 2;
        const cy = H * 0.37;
        const size = Math.min(W, H) * 0.095;
        const pts = buildHeartPoints(cx, cy, size, 80);
        pts.forEach(p => {
            flowers.push({
                x: p.x,
                y: p.y,
                r: 4 + Math.random() * 5,
                petal: COLORS.petal[Math.floor(Math.random() * COLORS.petal.length)],
                center: COLORS.center[Math.floor(Math.random() * COLORS.center.length)],
                alpha: 0.75 + Math.random() * 0.25,
                phase: Math.random() * Math.PI * 2,
            });
        });
    }

    function restart() { init(canvas, onComplete); }

    return { init, restart, resize };
})();

window.FlowerTree = FlowerTree;