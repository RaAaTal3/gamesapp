// Script pour le jeu du Juste Prix

// Configuration du jeu
const difficultyRanges = {
    easy: { min: 1, max: 100 },
    medium: { min: 1, max: 1000 },
    hard: { min: 1, max: 10000 }
};

// Variables du jeu
let targetPrice;           // Le prix à deviner
let attempts = 0;          // Nombre de tentatives
let guessHistory = [];     // Historique des estimations
let gameOver = false;      // État du jeu
let bestScores = {         // Meilleurs scores (moins de tentatives = meilleur)
    easy: Infinity,
    medium: Infinity,
    hard: Infinity
};
let currentDifficulty = 'medium';  // Difficulté par défaut

// Éléments DOM
const priceDisplay = document.getElementById('price-display');
const resultMessage = document.getElementById('result-message');
const guessInput = document.getElementById('guess-input');
const guessButton = document.getElementById('guess-button');
const attemptCount = document.getElementById('attempt-count');
const bestScoreDisplay = document.getElementById('best-score');
const guessHistoryList = document.getElementById('guess-history');
const newGameButton = document.getElementById('new-game');
const playAgainButton = document.getElementById('play-again');
const difficultySelect = document.getElementById('difficulty-select');
const winModal = document.getElementById('win-modal');
const winMessage = document.getElementById('win-message');
const winDetails = document.getElementById('win-details');
const finalPrice = document.getElementById('final-price');
const arrowUp = document.getElementById('arrow-up');
const arrowDown = document.getElementById('arrow-down');
const infoMessage = document.getElementById('info-message');
const hintIcon = document.getElementById('hint-icon');

// Initialisation du jeu
function initGame() {
    // Configurer les événements
    guessButton.addEventListener('click', handleGuess);
    guessInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') handleGuess();
    });
    newGameButton.addEventListener('click', startNewGame);
    playAgainButton.addEventListener('click', startNewGame);
    
    difficultySelect.addEventListener('change', function() {
        currentDifficulty = this.value;
        startNewGame();
    });
    
    // Charger les meilleurs scores depuis le localStorage
    loadBestScores();
    
    // Démarrer une nouvelle partie
    startNewGame();
}

// Démarrer une nouvelle partie
function startNewGame() {
    // Réinitialiser les variables
    attempts = 0;
    guessHistory = [];
    gameOver = false;
    
    // Générer un nouveau prix aléatoire
    const { min, max } = difficultyRanges[currentDifficulty];
    targetPrice = Math.floor(Math.random() * (max - min + 1)) + min;
    
    // Mettre à jour l'interface
    priceDisplay.textContent = '?';
    priceDisplay.className = 'price-box';
    resultMessage.textContent = '';
    resultMessage.classList.add('hidden');
    guessInput.value = '';
    attemptCount.textContent = attempts;
    guessHistoryList.innerHTML = '';
    
    // Mettre à jour les infos sur les limites
    updateInfoMessage();
    
    // Réinitialiser les flèches
    arrowUp.classList.remove('active');
    arrowDown.classList.remove('active');
    
    // Rendre le champ de saisie actif
    guessInput.disabled = false;
    guessButton.disabled = false;
    
    // Fermez le modal s'il est ouvert
    winModal.classList.remove('active');
    
    // Donner le focus au champ de saisie
    guessInput.focus();
}

// Mettre à jour le message d'information avec les limites
function updateInfoMessage() {
    const { min, max } = difficultyRanges[currentDifficulty];
    
    infoMessage.innerHTML = `
        <p>Je pense à un prix entre <span class="highlight">${min}</span> et <span class="highlight">${max}</span>.</p>
        <p>Pouvez-vous le deviner ?</p>
    `;
    
    // Mettre à jour les attributs min/max de l'input
    guessInput.min = min;
    guessInput.max = max;
}

// Gérer une proposition de prix
function handleGuess() {
    if (gameOver) return;
    
    // Récupérer la valeur
    const guessValue = parseInt(guessInput.value);
    
    // Vérifier si l'entrée est valide
    if (isNaN(guessValue)) {
        shakeInput();
        return;
    }
    
    // Vérifier si le prix est dans les limites
    const { min, max } = difficultyRanges[currentDifficulty];
    if (guessValue < min || guessValue > max) {
        shakeInput();
        return;
    }
    
    // Incrémenter le compteur de tentatives
    attempts++;
    attemptCount.textContent = attempts;
    
    // Comparer la proposition au prix cible
    let result;
    if (guessValue === targetPrice) {
        result = 'correct';
        handleCorrectGuess();
    } else if (guessValue > targetPrice) {
        result = 'trop élevé';
        priceDisplay.className = 'price-box too-high';
        arrowUp.classList.add('active');
        arrowDown.classList.remove('active');
    } else {
        result = 'trop bas';
        priceDisplay.className = 'price-box too-low';
        arrowDown.classList.add('active');
        arrowUp.classList.remove('active');
    }
    
    // Ajouter à l'historique
    addToHistory(guessValue, result);
    
    // Afficher le résultat
    resultMessage.textContent = result === 'correct' ? 'Correct !' : `C'est ${result} !`;
    resultMessage.classList.remove('hidden');
    
    // Effacer l'entrée
    guessInput.value = '';
    guessInput.focus();
}

// Gérer une réponse correcte
function handleCorrectGuess() {
    gameOver = true;
    priceDisplay.textContent = targetPrice;
    priceDisplay.className = 'price-box correct';
    
    // Jouer un effet sonore de victoire
    playWinSound();
    
    // Désactiver l'entrée
    guessInput.disabled = true;
    guessButton.disabled = true;
    
    // Mettre à jour le meilleur score si nécessaire
    if (attempts < bestScores[currentDifficulty]) {
        bestScores[currentDifficulty] = attempts;
        saveBestScores();
        updateBestScoreDisplay();
    }
    
    // Afficher le modal de victoire
    showWinModal();
}

// Ajouter une proposition à l'historique
function addToHistory(value, result) {
    // Créer l'élément de liste
    const listItem = document.createElement('li');
    
    // Créer les éléments pour la valeur et l'indice
    const valueSpan = document.createElement('span');
    valueSpan.classList.add('guess-value');
    valueSpan.textContent = value;
    
    const hintSpan = document.createElement('span');
    hintSpan.classList.add('hint');
    hintSpan.textContent = result;
    
    // Ajouter les éléments à l'élément de liste
    listItem.appendChild(valueSpan);
    listItem.appendChild(hintSpan);
    
    // Ajouter l'élément de liste à la liste
    guessHistoryList.prepend(listItem);
    
    // Ajouter à l'historique des propositions
    guessHistory.push({ value, result });
}

// Afficher le modal de victoire
function showWinModal() {
    winMessage.textContent = 'Félicitations !';
    winDetails.textContent = `Vous avez trouvé le prix en ${attempts} tentative${attempts > 1 ? 's' : ''}.`;
    finalPrice.textContent = targetPrice;
    
    // Ajouter une animation de confettis
    createConfetti();
    
    // Afficher le modal
    setTimeout(() => {
        winModal.classList.add('active');
    }, 1000);
}

// Créer un effet de confettis
function createConfetti() {
    const confettiContainer = document.querySelector('.confetti');
    confettiContainer.innerHTML = '';
    
    const colors = ['#f72585', '#4cc9f0', '#4361ee', '#3a0ca3', '#7209b7'];
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti-piece');
        
        // Style aléatoire pour chaque confetti
        confetti.style.width = `${Math.random() * 10 + 5}px`;
        confetti.style.height = `${Math.random() * 10 + 5}px`;
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.position = 'absolute';
        confetti.style.top = `${Math.random() * 100}%`;
        confetti.style.left = `${Math.random() * 100}%`;
        confetti.style.opacity = Math.random();
        confetti.style.animation = `confetti-fall ${Math.random() * 3 + 2}s linear infinite`;
        
        confettiContainer.appendChild(confetti);
    }
}

// Effet visuel pour une entrée invalide
function shakeInput() {
    guessInput.classList.add('shake');
    
    setTimeout(() => {
        guessInput.classList.remove('shake');
    }, 500);
}

// Mettre à jour l'affichage du meilleur score
function updateBestScoreDisplay() {
    const bestScore = bestScores[currentDifficulty];
    bestScoreDisplay.textContent = bestScore === Infinity ? '-' : bestScore;
}

// Jouer un effet sonore de victoire
function playWinSound() {
    // Cette fonction peut être implémentée plus tard si des sons sont ajoutés
    // const winSound = new Audio('sounds/win.mp3');
    // winSound.volume = 0.5;
    // winSound.play();
}

// Charger les meilleurs scores depuis le localStorage
function loadBestScores() {
    const savedScores = localStorage.getItem('justePrixBestScores');
    if (savedScores) {
        bestScores = JSON.parse(savedScores);
    }
    updateBestScoreDisplay();
}

// Sauvegarder les meilleurs scores dans le localStorage
function saveBestScores() {
    localStorage.setItem('justePrixBestScores', JSON.stringify(bestScores));
}

// Ajouter un effet de style CSS pour l'animation des confettis
function addConfettiStyle() {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        @keyframes confetti-fall {
            0% {
                transform: translateY(-10px) rotate(0deg);
            }
            100% {
                transform: translateY(400px) rotate(360deg);
            }
        }
        
        .confetti-piece {
            border-radius: 50%;
            z-index: -1;
        }
        
        .shake {
            animation: shake 0.5s;
        }
        
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            50% { transform: translateX(10px); }
            75% { transform: translateX(-10px); }
        }
    `;
    document.head.appendChild(styleSheet);
}

// Démarrer le jeu au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    addConfettiStyle();
    initGame();
}); 