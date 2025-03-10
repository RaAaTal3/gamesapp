// Script pour le jeu de Morpion

// Variables du jeu
let currentPlayer = 'X';
let gameBoard = ['', '', '', '', '', '', '', '', ''];
let gameActive = true;
let scores = { X: 0, O: 0 };

// Combinaisons gagnantes (lignes, colonnes, diagonales)
const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Lignes
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Colonnes
    [0, 4, 8], [2, 4, 6]             // Diagonales
];

// Éléments du DOM
const cells = document.querySelectorAll('.cell');
const statusMessage = document.getElementById('status-message');
const currentPlayerDisplay = document.getElementById('current-player');
const resetButton = document.getElementById('reset-button');
const scoreX = document.getElementById('score-x');
const scoreO = document.getElementById('score-o');
const winModal = document.getElementById('win-modal');
const winMessage = document.getElementById('win-message');
const winDetails = document.getElementById('win-details');
const playAgainButton = document.getElementById('play-again');

// Initialisation du jeu
function initGame() {
    cells.forEach(cell => {
        cell.addEventListener('click', cellClick);
    });
    
    resetButton.addEventListener('click', resetGame);
    playAgainButton.addEventListener('click', resetGame);
    
    updateStatus();
}

// Gestion du clic sur une cellule
function cellClick() {
    const cellIndex = parseInt(this.getAttribute('data-index'));
    
    // Vérifier si la cellule est déjà occupée ou si le jeu est terminé
    if (gameBoard[cellIndex] !== '' || !gameActive) {
        return;
    }
    
    // Mettre à jour le tableau de jeu et l'interface
    gameBoard[cellIndex] = currentPlayer;
    this.textContent = currentPlayer;
    this.classList.add(currentPlayer.toLowerCase());
    
    // Jouer un effet sonore
    playMoveSound();
    
    // Vérifier s'il y a un gagnant ou égalité
    checkResult();
}

// Vérifier le résultat du jeu
function checkResult() {
    let roundWon = false;
    let winningCells = [];
    
    // Vérifier les combinaisons gagnantes
    for (let i = 0; i < winningCombinations.length; i++) {
        const [a, b, c] = winningCombinations[i];
        
        if (
            gameBoard[a] !== '' && 
            gameBoard[a] === gameBoard[b] && 
            gameBoard[a] === gameBoard[c]
        ) {
            roundWon = true;
            winningCells = [a, b, c];
            break;
        }
    }
    
    // Gestion de la victoire
    if (roundWon) {
        gameActive = false;
        highlightWinningCells(winningCells);
        
        // Mettre à jour le score
        scores[currentPlayer]++;
        updateScoreDisplay();
        
        // Afficher le modal de victoire
        setTimeout(() => {
            showWinModal(`Joueur ${currentPlayer} a gagné !`, `Félicitations au joueur ${currentPlayer} pour cette victoire !`);
        }, 1000);
        
        return;
    }
    
    // Vérifier s'il y a égalité
    if (!gameBoard.includes('')) {
        gameActive = false;
        
        // Afficher le modal d'égalité
        setTimeout(() => {
            showWinModal('Match nul !', 'Il n\'y a pas de vainqueur cette fois-ci.');
        }, 1000);
        
        return;
    }
    
    // Si le jeu continue, changer de joueur
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    updateStatus();
}

// Mettre à jour le message de statut
function updateStatus() {
    currentPlayerDisplay.textContent = currentPlayer;
    statusMessage.textContent = `Au tour du joueur `;
}

// Mettre en évidence les cellules gagnantes
function highlightWinningCells(cells) {
    cells.forEach(index => {
        document.querySelector(`.cell[data-index="${index}"]`).classList.add('win');
    });
}

// Mettre à jour l'affichage du score
function updateScoreDisplay() {
    scoreX.textContent = scores.X;
    scoreO.textContent = scores.O;
}

// Afficher le modal de victoire ou d'égalité
function showWinModal(message, details) {
    winMessage.textContent = message;
    winDetails.textContent = details;
    winModal.classList.add('active');
}

// Réinitialiser le jeu
function resetGame() {
    gameBoard = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    currentPlayer = 'X';
    
    // Réinitialiser l'affichage
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o', 'win');
    });
    
    // Fermer le modal
    winModal.classList.remove('active');
    
    // Mettre à jour le statut
    updateStatus();
}

// Effet sonore pour les mouvements
function playMoveSound() {
    // Cette fonction peut être implémentée plus tard si des sons sont ajoutés
    // const moveSound = new Audio('sounds/move.mp3');
    // moveSound.volume = 0.2;
    // moveSound.play();
}

// Démarrer le jeu
document.addEventListener('DOMContentLoaded', initGame); 