const FlowerTree = (() => {
    const PETAL_COLORS = ['#ff85a1', '#ff6b9d', '#ff4081', '#f48fb1', '#ffc0cb', '#e91e8c'];
    const TRUNK_COLOR = '#5d3a1a';
    const BRANCH_COLOR = '#7b4f2e';

    let canvas, ctx, W, H, DPR;
    let phase = 0; // 0: Semilla, 1: Tronco, 2: Flores, 3: Idle
    let t = 0;
    let flowers = [];
    let rafId = null;
    let lastTs = 0;
    let onDone = null;

    // Matemáticas del corazón (Taubin)
    function getHeartPoint(t, scale) {
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
        return { x: x * scale, y: y * scale };
    }

    function buildFlowers() {
        flowers = [];
        const count = 150; 
        const centerX = W / 2;
        const centerY = H * 0.4;
        const scale = Math.min(W, H) * 0.045;

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = Math.pow(Math.random(), 0.5); // Distribución uniforme
            const p = getHeartPoint(angle, scale * r);
            
            flowers.push({
                x: centerX + p.x,
                y: centerY + p.y,
                size: 4 + Math.random() * 5,
                color: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
                delay: Math.random() * 0.8,
                currentScale: 0
            });
        }
    }

    function drawBranch(x, y, angle, length, width, growth) {
        if (length < 8 || growth <= 0) return;

        const x2 = x + Math.cos(angle) * length * growth;
        const y2 = y + Math.sin(angle) * length * growth;

        ctx.beginPath();
        ctx.strokeStyle = length > 20 ? TRUNK_COLOR : BRANCH_COLOR;
        ctx.lineWidth = width;
        ctx.lineCap = 'round';
        ctx.moveTo(x, y);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        if (growth >= 1) {
            drawBranch(x2, y2, angle - 0.4, length * 0.7, width * 0.7, t * 2 - 1);
            drawBranch(x2, y2, angle + 0.4, length * 0.7, width * 0.7, t * 2 - 1);
        }
    }

    function loop(ts) {
        const dt = (ts - lastTs) / 1000;
        lastTs = ts;
        ctx.clearRect(0, 0, W, H);

        if (phase === 1) { // Crecimiento tronco
            t = Math.min(t + dt * 0.8, 1);
            drawBranch(W / 2, H * 0.9, -Math.PI / 2, H * 0.25, 8, t);
            if (t >= 1) { phase = 2; t = 0; }
        } 
        else if (phase >= 2) { // Flores
            drawBranch(W / 2, H * 0.9, -Math.PI / 2, H * 0.25, 8, 1);
            t = Math.min(t + dt * 1.2, 1);
            
            flowers.forEach(f => {
                if (t > f.delay) {
                    f.currentScale = Math.min(f.currentScale + dt * 4, 1);
                }
                ctx.beginPath();
                ctx.fillStyle = f.color;
                ctx.arc(f.x, f.y, f.size * f.currentScale, 0, Math.PI * 2);
                ctx.fill();
            });

            if (phase === 2 && flowers.every(f => f.currentScale >= 1)) {
                phase = 3;
                if (onDone) onDone();
            }
        }

        rafId = requestAnimationFrame(loop);
    }

    return {
        init: (el, cb) => {
            canvas = el; ctx = canvas.getContext('2d');
            onDone = cb;
            DPR = window.devicePixelRatio || 1;
            W = canvas.clientWidth; H = canvas.clientHeight;
            canvas.width = W * DPR; canvas.height = H * DPR;
            ctx.scale(DPR, DPR);
            buildFlowers();
            phase = 1; t = 0;
            lastTs = performance.now();
            loop(lastTs);
        },
        restart: () => { phase = 1; t = 0; buildFlowers(); }
    };
})();
