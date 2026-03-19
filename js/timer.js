/* =============================================
   timer.js  –  Cronómetro romántico
   =============================================
   ⬇️  CAMBIA START_DATE a tu fecha real 💕
   ============================================= */

const RomanticTimer = (() => {

    // 👇 Cambia esto a la fecha en que comenzó tu amor
    const START_DATE = new Date('2024-01-01T00:00:00');

    let timerEl = null;
    let intervalId = null;

    function pad(n) {
        return String(Math.floor(n)).padStart(2, '0');
    }

    function update() {
        const now = new Date();
        const diff = now - START_DATE;

        if (diff < 0) {
            timerEl.textContent = '¡Pronto comienza nuestra historia! 💕';
            return;
        }

        const totalSeg = Math.floor(diff / 1000);
        const segundos = totalSeg % 60;
        const totalMin = Math.floor(totalSeg / 60);
        const minutos = totalMin % 60;
        const totalHora = Math.floor(totalMin / 60);
        const horas = totalHora % 24;
        const dias = Math.floor(totalHora / 24);

        timerEl.textContent =
            `${dias} días ${pad(horas)} horas ${pad(minutos)} minutos ${pad(segundos)} segundos`;
    }

    function init(el) {
        timerEl = el;
        update();
        if (intervalId) clearInterval(intervalId);
        intervalId = setInterval(update, 1000);
    }

    return { init };
})();

window.RomanticTimer = RomanticTimer;