/* =================================================================
   flowers.js  —  Árbol de Rosas Rosadas con animación fluida
   =================================================================
   FASES:
     0  → Semilla cae con rebote
     1  → Brota raíz y crece el tronco/ramas (ease out)
     2  → Corazón de rosas florece pétalo a pétalo
     3  → Idle: flores ondean suavemente, partículas de brillo
   ================================================================= */

const FlowerTree = (() => {

  /* ──────────── Colores ──────────── */
  const PETAL_COLORS  = [
    '#ff85a1','#ff6b9d','#ff4081','#f48fb1',
    '#ffc0cb','#e91e8c','#ff80ab','#ff5c8d','#ffacc7'
  ];
  const CENTER_COLORS = ['#fff59d','#ffe082','#ffd54f','#ffecb3'];
  const TRUNK_COLOR   = '#5d3a1a';
  const BRANCH_COLOR  = '#7b4f2e';
  const SEED_COLOR    = '#3e1f00';

  /* ──────────── Estado ──────────── */
  let canvas, ctx, W, H, DPR;
  let phase    = 0;
  let t        = 0;      // tiempo dentro de la fase [0..1]
  let rafId    = null;
  let lastTs   = 0;
  let idleT    = 0;
  let flowers  = [];
  let sparks   = [];
  let onDone   = null;

  /* ──────────── Easing ──────────── */
  const easeOutQuart  = x => 1 - Math.pow(1 - x, 4);
  const easeOutBounce = x => {
    const n1 = 7.5625, d1 = 2.75;
    if (x < 1/d1)       return n1*x*x;
    if (x < 2/d1)       return n1*(x-=1.5/d1)*x+0.75;
    if (x < 2.5/d1)     return n1*(x-=2.25/d1)*x+0.9375;
    return n1*(x-=2.625/d1)*x+0.984375;
  };
  const easeInOutCubic = x => x < 0.5 ? 4*x*x*x : 1-Math.pow(-2*x+2,3)/2;

  /* ──────────── Corazón ──────────── */
  function heartXY(theta, cx, cy, size) {
    return {
      x: cx + size * 16 * Math.pow(Math.sin(theta), 3),
      y: cy - size * (13*Math.cos(theta) - 5*Math.cos(2*theta)
                       - 2*Math.cos(3*theta) - Math.cos(4*theta))
    };
  }

  function buildFlowers() {
    flowers = [];
    const cx   = W * 0.5;
    const cy   = H * 0.36;
    const size = Math.min(W, H) * 0.092;
    const total = 130;

    /* Borde del corazón */
    for (let i = 0; i < total; i++) {
      const theta = (i / total) * Math.PI * 2;
      const p = heartXY(theta, cx, cy, size);
      flowers.push(makeFlower(p.x, p.y, 5 + Math.random() * 5));
    }
    /* Interior */
    for (let i = 0; i < total * 0.7; i++) {
      const theta = Math.random() * Math.PI * 2;
      const sc    = 0.25 + Math.random() * 0.72;
      flowers.push(makeFlower(
        cx + size * sc * 16 * Math.pow(Math.sin(theta), 3),
        cy - size * sc * (13*Math.cos(theta) - 5*Math.cos(2*theta)
                           - 2*Math.cos(3*theta) - Math.cos(theta)),
        3.5 + Math.random() * 4.5
      ));
    }
    /* Mezclar orden de aparición */
    for (let i = flowers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [flowers[i], flowers[j]] = [flowers[j], flowers[i]];
    }
  }

  function makeFlower(x, y, r) {
    return {
      x, y, r,
      petal  : PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
      petal2 : PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
      center : CENTER_COLORS[Math.floor(Math.random() * CENTER_COLORS.length)],
      alpha  : 0.82 + Math.random() * 0.18,
      phase  : Math.random() * Math.PI * 2,
      rot    : Math.random() * Math.PI * 2,
      scale  : 0,   // crece de 0 → 1 al aparecer
    };
  }

  /* ──────────── Dibujar una rosa ──────────── */
  function drawRose(f, wobble, forceScale) {
    const sc = forceScale !== undefined ? forceScale : f.scale;
    if (sc <= 0.01) return;

    ctx.save();
    ctx.globalAlpha = f.alpha * Math.min(sc, 1);
    ctx.translate(
      f.x + Math.sin(wobble + f.phase) * 1.8,
      f.y + Math.cos(wobble * 0.9 + f.phase) * 1.2
    );
    ctx.rotate(f.rot + Math.sin(wobble * 0.4 + f.phase) * 0.08);
    ctx.scale(sc, sc);

    const r = f.r;

    /* Pétalos exteriores (5) con gradiente */
    for (let i = 0; i < 5; i++) {
      ctx.save();
      ctx.rotate((i / 5) * Math.PI * 2);
      const g = ctx.createRadialGradient(0, -r * 0.55, r * 0.05, 0, -r * 0.55, r * 0.9);
      g.addColorStop(0, lighten(f.petal, 30));
      g.addColorStop(1, darken(f.petal, 10));
      ctx.beginPath();
      ctx.ellipse(0, -r * 0.65, r * 0.42, r * 0.78, 0, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
      ctx.restore();
    }

    /* Pétalos interiores (5, más pequeños) */
    for (let i = 0; i < 5; i++) {
      ctx.save();
      ctx.rotate((i / 5) * Math.PI * 2 + Math.PI / 5);
      const g2 = ctx.createRadialGradient(0, -r * 0.3, 0, 0, -r * 0.3, r * 0.55);
      g2.addColorStop(0, lighten(f.petal2, 20));
      g2.addColorStop(1, f.petal2);
      ctx.beginPath();
      ctx.ellipse(0, -r * 0.34, r * 0.26, r * 0.46, 0, 0, Math.PI * 2);
      ctx.fillStyle = g2;
      ctx.fill();
      ctx.restore();
    }

    /* Centro con gradiente brillante */
    const cg = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 0.35);
    cg.addColorStop(0, '#fffde7');
    cg.addColorStop(0.5, f.center);
    cg.addColorStop(1, darken(f.center, 15));
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = cg;
    ctx.fill();

    /* Punto brillante en centro */
    ctx.beginPath();
    ctx.arc(-r * 0.08, -r * 0.08, r * 0.1, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fill();

    ctx.restore();
  }

  /* ──────────── Árbol fractal ──────────── */
  function drawTree(progress) {
    _branch(W * 0.5, H - 8, 0, H * 0.35, 8, progress, 1);
  }

  function _branch(x1, y1, angle, len, depth, clip, alpha) {
    if (depth === 0 || len < 1.5) return;
    const x2 = x1 + len * Math.sin(angle);
    const y2 = y1 - len * Math.cos(angle);

    /* Sólo dibujar hasta donde llega el 'clip' progress */
    const ratio = Math.min(clip * (9 - depth) / 2, 1);
    if (ratio <= 0) return;

    const ex = x1 + (x2 - x1) * ratio;
    const ey = y1 + (y2 - y1) * ratio;

    /* Gradiente de color en el tronco */
    const g = ctx.createLinearGradient(x1, y1, ex, ey);
    g.addColorStop(0, depth > 4 ? TRUNK_COLOR : BRANCH_COLOR);
    g.addColorStop(1, depth > 3 ? BRANCH_COLOR : '#a0795a');

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = g;
    ctx.lineWidth   = Math.max(depth * 1.9 - 1, 0.8);
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(ex, ey);
    ctx.stroke();
    ctx.restore();

    if (ratio < 1) return;
    const spread = 0.42;
    const sub    = clip - 0.14;
    _branch(x2, y2, angle - spread,          len * 0.67, depth-1, sub, alpha);
    _branch(x2, y2, angle + spread,          len * 0.67, depth-1, sub, alpha);
    _branch(x2, y2, angle - spread * 0.4,   len * 0.73, depth-1, sub, alpha);
    _branch(x2, y2, angle + spread * 0.4,   len * 0.73, depth-1, sub, alpha);
  }

  /* ──────────── Semilla ──────────── */
  function drawSeed(x, y, alpha, sc) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.scale(sc, sc);

    /* Cuerpo */
    const g = ctx.createRadialGradient(-1, -2, 0, 0, 0, 7);
    g.addColorStop(0, '#7b4f2e');
    g.addColorStop(1, SEED_COLOR);
    ctx.beginPath();
    ctx.ellipse(0, 0, 5, 8, 0.3, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();

    /* Brillo */
    ctx.beginPath();
    ctx.ellipse(-1.5, -2.5, 1.5, 2.5, 0.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fill();

    ctx.restore();
  }

  /* ──────────── Chispas / partículas ──────────── */
  function spawnSparks(n) {
    const cx = W * 0.5, cy = H * 0.36;
    for (let i = 0; i < n; i++) {
      const theta = Math.random() * Math.PI * 2;
      const r     = 10 + Math.random() * Math.min(W, H) * 0.17;
      sparks.push({
        x  : cx + r * Math.cos(theta),
        y  : cy + r * Math.sin(theta),
        vx : (Math.random() - 0.5) * 0.6,
        vy : -(0.4 + Math.random() * 0.8),
        life: 1,
        dec : 0.008 + Math.random() * 0.012,
        r  : 1 + Math.random() * 2.5,
        c  : PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
      });
    }
  }

  function updateSparks(dt) {
    sparks = sparks.filter(s => s.life > 0);
    sparks.forEach(s => {
      s.x    += s.vx;
      s.y    += s.vy;
      s.vy   += 0.02;
      s.life -= s.dec;
    });
    if (phase === 3 && Math.random() < 0.04) spawnSparks(1);
  }

  function drawSparks() {
    sparks.forEach(s => {
      ctx.save();
      ctx.globalAlpha = s.life * 0.9;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = s.c;
      ctx.fill();
      ctx.restore();
    });
  }

  /* ──────────── Color helpers ──────────── */
  function hexToRgb(hex) {
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return [r,g,b];
  }
  function lighten(hex, amt) {
    const [r,g,b] = hexToRgb(hex);
    return `rgb(${Math.min(r+amt,255)},${Math.min(g+amt,255)},${Math.min(b+amt,255)})`;
  }
  function darken(hex, amt) {
    const [r,g,b] = hexToRgb(hex);
    return `rgb(${Math.max(r-amt,0)},${Math.max(g-amt,0)},${Math.max(b-amt,0)})`;
  }

  /* ──────────── Fondo decorativo ──────────── */
  function drawBackground() {
    /* Grilla suave de puntos */
    ctx.save();
    ctx.globalAlpha = 0.06;
    for (let x = 0; x < W; x += 22) {
      for (let y = 0; y < H; y += 22) {
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fillStyle = '#ff4081';
        ctx.fill();
      }
    }
    ctx.restore();
  }

  /* ──────────── Loop principal ──────────── */
  const DURATIONS = [1.1, 2.6, 3.2, Infinity];

  function loop(ts) {
    const dt = Math.min((ts - lastTs) / 1000, 0.05);
    lastTs   = ts;
    t        = Math.min(t + dt / DURATIONS[phase], 1);

    ctx.clearRect(0, 0, W, H);
    drawBackground();
    updateSparks(dt);

    /* ── Fase 0: semilla cae ── */
    if (phase === 0) {
      const e  = easeOutBounce(t);
      const ty = 30 + e * (H - 50);
      drawSeed(W * 0.5, ty, 1, 1);
    }

    /* ── Fase 1: tronco crece ── */
    if (phase === 1) {
      const e = easeOutQuart(t);
      drawSeed(W * 0.5, H - 8, 1 - e, 1);
      drawTree(e);
    }

    /* ── Fase 2: flores aparecen ── */
    if (phase === 2) {
      drawTree(1);
      const e   = easeInOutCubic(t);
      const n   = Math.floor(e * flowers.length);
      /* Cada flor ya brotada crece hacia su tamaño final */
      for (let i = 0; i < flowers.length; i++) {
        if (i < n) {
          flowers[i].scale = Math.min(flowers[i].scale + 0.07, 1);
        }
        drawRose(flowers[i], 0);
      }
    }

    drawSparks();

    if (t >= 1 && phase < 3) {
      t = 0;
      phase++;
      if (phase === 3) {
        spawnSparks(40);
        if (onDone) onDone();
      }
    }

    if (phase === 3) {
      idleT += dt;
      drawTree(1);
      flowers.forEach(f => drawRose(f, idleT));
    }

    rafId = requestAnimationFrame(loop);
  }

  /* ──────────── API pública ──────────── */
  function init(el, cb) {
    canvas = el;
    ctx    = canvas.getContext('2d');
    onDone = cb || null;
    resize();
    buildFlowers();
    reset();
    if (rafId) cancelAnimationFrame(rafId);
    lastTs = performance.now();
    rafId  = requestAnimationFrame(loop);
  }

  function resize() {
    DPR    = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    W = rect.width;
    H = rect.height;
    canvas.width  = W * DPR;
    canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  function reset() {
    phase  = 0;
    t      = 0;
    idleT  = 0;
    sparks = [];
    flowers.forEach(f => f.scale = 0);
  }

  function restart() {
    reset();
    buildFlowers();
  }

  return { init, restart, resize };
})();

window.FlowerTree = FlowerTree;
