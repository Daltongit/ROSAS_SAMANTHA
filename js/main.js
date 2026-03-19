/* ==============================================
   main.js  —  Orquestación general
   ==============================================
   ✏️  PERSONALIZA tu mensaje aquí abajo
   ============================================== */

const TITULO = 'Rosas Rosadas para el amor de mi vida.';
const CUERPO  = 'Si pudiera elegir un lugar seguro, sería a tu lado siempre. 🌸';

/* ── SVG de una rosa pequeña para los bordes ── */
function roseSVG(size, color1, color2, centerCol) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">
    <defs>
      <radialGradient id="pg" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stop-color="${color1}"/>
        <stop offset="100%" stop-color="${color2}"/>
      </radialGradient>
      <radialGradient id="cg" cx="40%" cy="35%" r="65%">
        <stop offset="0%" stop-color="#fffde7"/>
        <stop offset="100%" stop-color="${centerCol}"/>
      </radialGradient>
    </defs>
    <!-- 5 pétalos exteriores -->
    <ellipse cx="50" cy="20" rx="14" ry="22" fill="url(#pg)" transform="rotate(0   50 50)"/>
    <ellipse cx="50" cy="20" rx="14" ry="22" fill="url(#pg)" transform="rotate(72  50 50)"/>
    <ellipse cx="50" cy="20" rx="14" ry="22" fill="url(#pg)" transform="rotate(144 50 50)"/>
    <ellipse cx="50" cy="20" rx="14" ry="22" fill="url(#pg)" transform="rotate(216 50 50)"/>
    <ellipse cx="50" cy="20" rx="14" ry="22" fill="url(#pg)" transform="rotate(288 50 50)"/>
    <!-- 5 pétalos interiores -->
    <ellipse cx="50" cy="28" rx="9"  ry="15" fill="url(#pg)" opacity=".85" transform="rotate(36  50 50)"/>
    <ellipse cx="50" cy="28" rx="9"  ry="15" fill="url(#pg)" opacity=".85" transform="rotate(108 50 50)"/>
    <ellipse cx="50" cy="28" rx="9"  ry="15" fill="url(#pg)" opacity=".85" transform="rotate(180 50 50)"/>
    <ellipse cx="50" cy="28" rx="9"  ry="15" fill="url(#pg)" opacity=".85" transform="rotate(252 50 50)"/>
    <ellipse cx="50" cy="28" rx="9"  ry="15" fill="url(#pg)" opacity=".85" transform="rotate(324 50 50)"/>
    <!-- Centro -->
    <circle cx="50" cy="50" r="14" fill="url(#cg)"/>
    <circle cx="44" cy="44" r="5"  fill="rgba(255,255,255,.55)"/>
    <!-- Tallo -->
    <line x1="50" y1="68" x2="50" y2="95" stroke="#4caf50" stroke-width="4" stroke-linecap="round"/>
    <ellipse cx="42" cy="84" rx="9" ry="5" fill="#66bb6a" transform="rotate(-30 42 84)"/>
  </svg>`;
}

const ROSE_VARIANTS = [
  { c1:'#ff85a1', c2:'#e91e8c', cc:'#ffe082' },
  { c1:'#ffc0cb', c2:'#ff6b9d', cc:'#fff59d' },
  { c1:'#ff4081', c2:'#c2185b', cc:'#ffd54f' },
  { c1:'#ffb3c6', c2:'#f06292', cc:'#ffecb3' },
  { c1:'#ff80ab', c2:'#ff4081', cc:'#ffe082' },
  { c1:'#f48fb1', c2:'#e91e8c', cc:'#fff9c4' },
];

/* ── Banda de flores ── */
function buildBand(id) {
  const band  = document.getElementById(id);
  if (!band) return;
  const bw    = band.offsetWidth || window.innerWidth;
  const count = Math.floor(bw / 62) + 2;

  for (let i = 0; i < count; i++) {
    const v    = ROSE_VARIANTS[i % ROSE_VARIANTS.length];
    const size = 54 + Math.random() * 22;
    const el   = document.createElement('div');
    el.className = 'band-rose';
    el.innerHTML = roseSVG(size, v.c1, v.c2, v.cc);

    const left  = (i / count) * 100 + (Math.random() - 0.5) * 4;
    const lean  = Math.random() > 0.5 ? 1 : -1;
    el.style.cssText = `
      left: ${left}%;
      bottom: ${-2 + Math.random() * 8}px;
      --dur:   ${2.4 + Math.random() * 2}s;
      --delay: ${Math.random() * 2}s;
      --lean:  ${lean};
    `;
    band.appendChild(el);
  }
}

/* ── Pétalos flotantes en el canvas ── */
const PETAL_EMOJIS = ['🌸','🌺','✿','❀','🌹'];

function buildFloatingPetals() {
  const container = document.getElementById('petalsFloat');
  if (!container) return;
  for (let i = 0; i < 14; i++) {
    const el = document.createElement('span');
    el.className  = 'fp';
    el.textContent = PETAL_EMOJIS[i % PETAL_EMOJIS.length];
    el.style.cssText = `
      --fl:  ${5 + Math.random() * 88}%;
      --fd:  ${3.5 + Math.random() * 5}s;
      --fd2: ${Math.random() * 6}s;
      --fs:  ${0.75 + Math.random() * 0.8}rem;
    `;
    container.appendChild(el);
  }
}

/* ── Typewriter ── */
function typewrite(el, text, speed, done) {
  el.textContent = '';
  el.classList.add('cursor');
  let i = 0;
  const id = setInterval(() => {
    el.textContent += text[i++];
    if (i >= text.length) {
      clearInterval(id);
      el.classList.remove('cursor');
      if (done) done();
    }
  }, speed);
}

/* ── Cuando el árbol termina ── */
function onTreeDone() {
  const card  = document.getElementById('card');
  const title = document.getElementById('cardTitle');
  const body  = document.getElementById('cardBody');
  const btn   = document.getElementById('btnAgain');

  card.classList.add('show');

  setTimeout(() => {
    typewrite(title, TITULO, 44, () => {
      setTimeout(() => {
        typewrite(body, CUERPO, 36, () => {
          if (btn) btn.style.display = 'inline-block';
        });
      }, 350);
    });
  }, 600);
}

/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {

  buildBand('bandTop');
  buildBand('bandBottom');
  buildFloatingPetals();

  /* Canvas */
  const canvas = document.getElementById('c');
  FlowerTree.init(canvas, onTreeDone);

  /* Cronómetro */
  RomanticTimer.init(document.getElementById('clockTime'));

  /* Botón reiniciar */
  const btn = document.getElementById('btnAgain');
  if (btn) {
    btn.addEventListener('click', () => {
      const card  = document.getElementById('card');
      const title = document.getElementById('cardTitle');
      const body  = document.getElementById('cardBody');
      card.classList.remove('show');
      title.textContent = '';
      body.textContent  = '';
      btn.style.display = 'none';
      FlowerTree.restart();
    });
  }

  /* Responsive */
  window.addEventListener('resize', () => FlowerTree.resize());
});
