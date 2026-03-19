/* ==============================================
   timer.js  —  Cronómetro romántico
   ==============================================
   👇 CAMBIA ESTA FECHA a cuando empezó tu amor
   ============================================== */

const RomanticTimer = (() => {

  const START_DATE = new Date('2026-03-01T00:00:00');

  let el  = null;
  let iid = null;

  function pad(n) { return String(Math.floor(n)).padStart(2,'0'); }

  function tick() {
    const diff = Date.now() - START_DATE.getTime();
    if (diff < 0) {
      el.textContent = '¡Pronto empieza nuestra historia! 💕';
      return;
    }
    const s  = Math.floor(diff / 1000);
    const m  = Math.floor(s  / 60);
    const h  = Math.floor(m  / 60);
    const d  = Math.floor(h  / 24);
    el.textContent = `${d} días · ${pad(h%24)} h · ${pad(m%60)} min · ${pad(s%60)} seg`;
  }

  function init(elRef) {
    el = elRef;
    tick();
    if (iid) clearInterval(iid);
    iid = setInterval(tick, 1000);
  }

  return { init };
})();

window.RomanticTimer = RomanticTimer;
