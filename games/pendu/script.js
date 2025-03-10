// Script pour le jeu du Pendu

// Liste de mots pour le jeu
const wordList = [
    'JAVASCRIPT', 'ORDINATEUR', 'PROGRAMMATION', 'ALGORITHM', 'DEVELOPPEUR',
    'INTERFACE', 'RESPONSIVE', 'NAVIGATEUR', 'TECHNOLOGIE', 'APPLICATION',
    'INTERNET', 'SERVEUR', 'TERMINAL', 'VARIABLE', 'FONCTION',
    'BOOTSTRAP', 'DATABASE', 'FRAMEWORK', 'DOCUMENT', 'ANIMATION',
    'COMPOSANT', 'PLATEFORME', 'GRAPHIQUE', 'MULTIMEDIA', 'EXPERIENCE'
];

// Variables du jeu
let selectedWord = '';          // Mot à deviner
let guessedLetters = [];        // Lettres déjà proposées
let wrongGuesses = 0;           // Nombre d'erreurs
let correctGuesses = 0;         // Nombre de lettres correctes trouvées
let maxWrongGuesses = 10;       // Nombre maximum d'erreurs autorisées
let gameOver = false;           // État du jeu
let stats = { wins: 0, losses: 0 }; // Statistiques de jeu

// Éléments du DOM
const wordDisplay = document.getElementById('word-display');
const keyboard = document.getElementById('keyboard');
const attemptsDisplay = document.getElementById('attempts');
const usedLettersDisplay = document.getElementById('used-letters');
const newGameButton = document.getElementById('new-game');
const resultModal = document.getElementById('result-modal');
const resultMessage = document.getElementById('result-message');
const resultDetails = document.getElementById('result-details');
const revealedWord = document.getElementById('revealed-word');
const playAgainButton = document.getElementById('play-again');
const winsDisplay = document.getElementById('wins');
const lossesDisplay = document.getElementById('losses');

// Initialisation du jeu
function initGame() {
    // Créer le clavier
    createKeyboard();
    
    // Charger les statistiques depuis le localStorage si elles existent
    loadStats();
    
    // Configurer les boutons
    newGameButton.addEventListener('click', startNewGame);
    playAgainButton.addEventListener('click', startNewGame);
    
    // Démarrer une nouvelle partie
    startNewGame();
}

// Créer le clavier virtuel
function createKeyboard() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    
    for (let letter of letters) {
        const keyButton = document.createElement('button');
        keyButton.classList.add('key');
        keyButton.textContent = letter;
        keyButton.dataset.letter = letter;
        keyButton.addEventListener('click', handleLetterClick);
        keyboard.appendChild(keyButton);
    }
}

// Démarrer une nouvelle partie
function startNewGame() {
    // Réinitialiser les variables
    guessedLetters = [];
    wrongGuesses = 0;
    correctGuesses = 0;
    gameOver = false;
    
    // Sélectionner un mot aléatoire
    selectedWord = wordList[Math.floor(Math.random() * wordList.length)];
    
    // Réinitialiser l'affichage
    updateWordDisplay();
    updateAttemptsDisplay();
    updateUsedLettersDisplay();
    resetHangman();
    resetKeyboard();
    
    // Fermer le modal de résultat s'il est ouvert
    resultModal.classList.remove('active');
}

// Mettre à jour l'affichage du mot
function updateWordDisplay() {
    wordDisplay.innerHTML = '';
    
    for (let letter of selectedWord) {
        const letterBox = document.createElement('div');
        letterBox.classList.add('letter-box');
        
        if (guessedLetters.includes(letter)) {
            letterBox.textContent = letter;
        }
        
        wordDisplay.appendChild(letterBox);
    }
}

// Mettre à jour l'affichage des tentatives
function updateAttemptsDisplay() {
    attemptsDisplay.textContent = maxWrongGuesses - wrongGuesses;
}

// Mettre à jour l'affichage des lettres utilisées
function updateUsedLettersDisplay() {
    usedLettersDisplay.textContent = guessedLetters.join(', ');
}

// Réinitialiser l'affichage du pendu
function resetHangman() {
    const hangmanParts = document.querySelectorAll('.hangman-part');
    hangmanParts.forEach(part => {
        part.classList.add('hidden');
        part.classList.remove('show');
    });
}

// Réinitialiser le clavier
function resetKeyboard() {
    const keys = document.querySelectorAll('.key');
    keys.forEach(key => {
        key.classList.remove('used', 'correct', 'wrong');
        key.disabled = false;
    });
}

// Gérer le clic sur une lettre
function handleLetterClick(e) {
    if (gameOver) return;
    
    const letter = e.target.dataset.letter;
    
    // Vérifier si la lettre a déjà été utilisée
    if (guessedLetters.includes(letter)) return;
    
    // Ajouter la lettre aux lettres utilisées
    guessedLetters.push(letter);
    
    // Marquer la touche comme utilisée
    e.target.classList.add('used');
    e.target.disabled = true;
    
    // Vérifier si la lettre est dans le mot
    if (selectedWord.includes(letter)) {
        // Lettre correcte
        e.target.classList.add('correct');
        
        // Mettre à jour l'affichage du mot
        updateWordDisplay();
        
        // Compter le nombre de fois où la lettre apparaît
        for (let char of selectedWord) {
            if (char === letter) {
                correctGuesses++;
            }
        }
        
        // Vérifier si le joueur a gagné
        if (correctGuesses === [...new Set(selectedWord.split(''))].length) {
            handleWin();
        }
    } else {
        // Lettre incorrecte
        e.target.classList.add('wrong');
        wrongGuesses++;
        
        // Mettre à jour l'affichage du pendu
        showHangmanPart(wrongGuesses);
        
        // Mettre à jour l'affichage des tentatives
        updateAttemptsDisplay();
        
        // Vérifier si le joueur a perdu
        if (wrongGuesses >= maxWrongGuesses) {
            handleLoss();
        }
    }
    
    // Mettre à jour l'affichage des lettres utilisées
    updateUsedLettersDisplay();
}

// Afficher une partie du pendu
function showHangmanPart(partNumber) {
    const part = document.getElementById(`part-${partNumber}`);
    if (part) {
        part.classList.remove('hidden');
        part.classList.add('show');
    }
}

// Gérer la victoire
function handleWin() {
    gameOver = true;
    stats.wins++;
    saveStats();
    updateStatsDisplay();
    
    // Afficher le modal de victoire
    resultMessage.textContent = 'Bravo, vous avez gagné !';
    resultDetails.textContent = 'Vous avez deviné le mot correctement.';
    revealedWord.textContent = selectedWord;
    resultModal.classList.add('active');
}

// Gérer la défaite
function handleLoss() {
    gameOver = true;
    stats.losses++;
    saveStats();
    updateStatsDisplay();
    
    // Afficher le modal de défaite
    resultMessage.textContent = 'Dommage, vous avez perdu !';
    resultDetails.textContent = 'Vous n\'avez pas deviné le mot à temps.';
    revealedWord.textContent = selectedWord;
    resultModal.classList.add('active');
}

// Mettre à jour l'affichage des statistiques
function updateStatsDisplay() {
    winsDisplay.textContent = stats.wins;
    lossesDisplay.textContent = stats.losses;
}

// Charger les statistiques depuis le localStorage
function loadStats() {
    const savedStats = localStorage.getItem('hangmanStats');
    if (savedStats) {
        stats = JSON.parse(savedStats);
        updateStatsDisplay();
    }
}

// Sauvegarder les statistiques dans le localStorage
function saveStats() {
    localStorage.setItem('hangmanStats', JSON.stringify(stats));
}

// Démarrer le jeu quand la page est chargée
document.addEventListener('DOMContentLoaded', initGame); 