document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('c');
    
    FlowerTree.init(canvas, () => {
        const card = document.getElementById('card');
        card.classList.add('show');
        
        // Efecto Typewriter
        let i = 0;
        const titulo = "Flores Amarillas para el amor de mi vida:";
        const el = document.getElementById('cardTitle');
        
        const type = () => {
            if (i < titulo.length) {
                el.textContent += titulo.charAt(i);
                i++;
                setTimeout(type, 50);
            } else {
                document.getElementById('cardBody').textContent = "Si pudiera elegir un lugar seguro, sería a tu lado siempre. ✨";
                document.getElementById('btnAgain').style.display = 'inline-block';
            }
        };
        type();
    });

    RomanticTimer.init(document.getElementById('clockTime'));

    document.getElementById('btnAgain').addEventListener('click', () => {
        location.reload(); // Reinicio limpio
    });
});
