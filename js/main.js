// Script principal pour la page d'accueil

document.addEventListener('DOMContentLoaded', function() {
    // Animation d'entrée pour les cartes
    const cards = document.querySelectorAll('.game-card');
    
    cards.forEach((card, index) => {
        // Ajoute une animation d'entrée différée pour chaque carte
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 100 * index);
        
        // Effet sonore léger lors du survol
        card.addEventListener('mouseenter', () => {
            playHoverSound();
        });
    });
    
    // Fonction pour jouer un son léger au survol
    function playHoverSound() {
        // Cette fonction peut être implémentée plus tard si des sons sont ajoutés
        // const hoverSound = new Audio('sounds/hover.mp3');
        // hoverSound.volume = 0.2;
        // hoverSound.play();
    }
    
    // Mise à jour de l'année dans le footer
    const footerYear = document.querySelector('footer p');
    const currentYear = new Date().getFullYear();
    footerYear.innerHTML = footerYear.innerHTML.replace('2023', currentYear);
    
    // Prépare les transitions entre les pages
    const playButtons = document.querySelectorAll('.play-button');
    
    playButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const targetUrl = this.getAttribute('href');
            
            // Animation de sortie
            document.body.classList.add('page-transition');
            
            // Redirection après l'animation
            setTimeout(() => {
                window.location.href = targetUrl;
            }, 500);
        });
    });
}); 