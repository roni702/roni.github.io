document.addEventListener('DOMContentLoaded', () => {
    const typewriterElements = document.querySelectorAll('.typewriter');
    let totalDelay = 0;

    typewriterElements.forEach((element) => {
        const text = element.getAttribute('data-text');
        let index = 0;

        function typeEffect() {
            if (index < text.length) {
                element.innerHTML += text.charAt(index);
                index++; 
                setTimeout(typeEffect, 40); // Snelheid van het typen (100ms)
            }
        }

        // Start het type-effect na de totale vertraging
        setTimeout(typeEffect, totalDelay);

        // Verhoog de totale vertraging voor het volgende element
        totalDelay += text.length * 100; // Aantal karakters * snelheid van typen
    });
});
