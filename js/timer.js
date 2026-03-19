const RomanticTimer = (() => {
    const START_DATE = new Date('2025-03-01T00:00:00'); // <--- CAMBIA ESTO

    function update(el) {
        const tick = () => {
            const now = new Date();
            const diff = now - START_DATE;
            
            const d = Math.floor(diff / (1000 * 60 * 60 * 24));
            const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const m = Math.floor((diff / (1000 * 60)) % 60);
            const s = Math.floor((diff / 1000) % 60);

            el.textContent = `${d} días · ${String(h).padStart(2,'0')} h · ${String(m).padStart(2,'0')} min · ${String(s).padStart(2,'0')} seg`;
        };
        setInterval(tick, 1000);
        tick();
    }
    return { init: update };
})();
