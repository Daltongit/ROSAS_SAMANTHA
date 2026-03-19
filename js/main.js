/* =============================================
   main.js  –  Orquestación general
   ============================================= */

/* ── 💬 PERSONALIZA TU MENSAJE AQUÍ ── */
const MENSAJE_TITULO = 'Rosas Rosadas para el amor de mi vida.';
const MENSAJE_CUERPO = 'Si pudiera elegir un lugar seguro, sería a tu lado siempre. 🌸';

/* ── Emojis del borde ── */
const FLOWER_EMOJIS = ['🌸', '🌺', '🌷', '💐', '🌹', '🌸', '🌺', '🌷'];

/* ── Typewriter ── */
function typewriter(el, text, speed, onDone) {
    el.textContent = '';
    el.classList.add('cursor');
    let i = 0;
    const id = setInterval(() => {
        el.textContent += text[i++];
        if (i >= text.length) {
            clearInterval(id);
            el.classList.remove('cursor');
            if (onDone) onDone();
        }
    }, speed);
}

/* ── Flores decorativas en los bordes ── */
function buildBorderFlowers() {
    document.querySelectorAll('.border-flowers').forEach(band => {
        const bW = band.offsetWidth || window.innerWidth;
        const count = Math.floor(bW / 55) + 2;
        for (let i = 0; i < count; i++) {
            const el = document.createElement('span');
            el.className = 'border-flower-item';
            el.textContent = FLOWER_EMOJIS[i % FLOWER_EMOJIS.length];
            el.style.left = `${(i / count) * 100}%`;
            el.style.top = `${10 + Math.random() * 40}px`;
            el.style.fontSize = `${1.4 + Math.random() * 0.9}rem`;
            el.style.animationDelay = `${Math.random() * 2}s`;
            el.style.animationDuration = `${2.5 + Math.random() * 2}s`;
            band.appendChild(el);
        }
    });
}

/* ── Callback cuando termina el árbol ── */
function onTreeComplete() {
    const box = document.getElementById('messageBox');
    const title = document.getElementById('messageTitle');
    const body = document.getElementById('messageBody');

    box.classList.add('visible');

    setTimeout(() => {
        typewriter(title, MENSAJE_TITULO, 45, () => {
            setTimeout(() => {
                typewriter(body, MENSAJE_CUERPO, 40);
            }, 400);
        });
    }, 500);

    // Muestra el botón de reiniciar
    const btn = document.querySelector('.btn-restart');
    if (btn) btn.style.display = 'inline-block';
}

/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {
    buildBorderFlowers();

    // Canvas
    const canvas = document.getElementById('flowerCanvas');
    FlowerTree.init(canvas, onTreeComplete);

    // Cronómetro
    RomanticTimer.init(document.getElementById('timerDisplay'));

    // Botón reiniciar
    const btn = document.createElement('button');
    btn.className = 'btn-restart';
    btn.textContent = '🌸 Volver a ver';
    document.querySelector('.scene-wrapper').appendChild(btn);

    btn.addEventListener('click', () => {
        document.getElementById('messageTitle').textContent = '';
        document.getElementById('messageBody').textContent = '';
        document.getElementById('messageBox').classList.remove('visible');
        btn.style.display = 'none';
        FlowerTree.restart();
    });

    // Responsive
    window.addEventListener('resize', () => FlowerTree.resize());
});