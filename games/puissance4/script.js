// Script pour le jeu Puissance 4

// Configuration du jeu
const ROWS = 6;
const COLS = 7;
const CONNECT = 4; // Nombre de jetons à aligner pour gagner

// Variables du jeu
let board = [];
let currentPlayer = 1;
let gameActive = true;
let scores = { 1: 0, 2: 0 };

// Éléments DOM
const gameBoard = document.getElementById('game-board');
const columnButtons = document.getElementById('column-buttons');
const statusMessage = document.getElementById('status-message');
const resetButton = document.getElementById('reset-button');
const scorePlayer1 = document.getElementById('score-player1');
const scorePlayer2 = document.getElementById('score-player2');
const winModal = document.getElementById('win-modal');
const winMessage = document.getElementById('win-message');
const winDetails = document.getElementById('win-details');
const playAgainButton = document.getElementById('play-again');
const player1Element = document.querySelector('.player-1');
const player2Element = document.querySelector('.player-2');

// Initialisation du jeu
function initGame() {
    // Créer les boutons de colonnes
    createColumnButtons();
    
    // Créer la grille
    createBoard();
    
    // Configurer les événements
    resetButton.addEventListener('click', resetGame);
    playAgainButton.addEventListener('click', resetGame);
    
    // Charger les scores depuis le localStorage si disponibles
    loadScores();
    
    // Mettre à jour l'interface
    updateStatus();
}

// Créer les boutons pour chaque colonne
function createColumnButtons() {
    for (let col = 0; col < COLS; col++) {
        const button = document.createElement('button');
        button.classList.add('column-button');
        button.dataset.column = col;
        button.textContent = '↓';
        button.addEventListener('click', () => makeMove(col));
        columnButtons.appendChild(button);
    }
    
    updateColumnButtons();
}

// Créer la grille de jeu
function createBoard() {
    // Réinitialiser le plateau et l'élément DOM
    board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
    gameBoard.innerHTML = '';
    
    // Créer les cellules du jeu
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = row;
            cell.dataset.col = col;
            gameBoard.appendChild(cell);
        }
    }
}

// Faire un mouvement dans une colonne
function makeMove(col) {
    if (!gameActive) return;
    
    // Trouver la première cellule vide dans la colonne (en partant du bas)
    for (let row = ROWS - 1; row >= 0; row--) {
        if (board[row][col] === 0) {
            // Mettre à jour le tableau de jeu
            board[row][col] = currentPlayer;
            
            // Mettre à jour l'interface
            updateCell(row, col);
            
            // Jouer un effet sonore
            playDropSound();
            
            // Vérifier s'il y a un gagnant
            if (checkWin(row, col)) {
                handleWin();
                return;
            }
            
            // Vérifier s'il y a égalité
            if (checkDraw()) {
                handleDraw();
                return;
            }
            
            // Passer au joueur suivant
            currentPlayer = currentPlayer === 1 ? 2 : 1;
            updateStatus();
            updateColumnButtons();
            return;
        }
    }
    
    // Si on arrive ici, la colonne est pleine
    indicateFullColumn(col);
}

// Mettre à jour l'affichage d'une cellule
function updateCell(row, col) {
    const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
    cell.classList.add(`player-${currentPlayer}`);
}

// Vérifier s'il y a une victoire
function checkWin(row, col) {
    // Directions: horizontal, vertical, diagonale, anti-diagonale
    const directions = [
        [0, 1],  // Horizontale →
        [1, 0],  // Verticale ↓
        [1, 1],  // Diagonale ↘
        [1, -1]  // Diagonale ↙
    ];
    
    for (const [dx, dy] of directions) {
        let count = 1;  // Commencer à 1 pour la cellule actuelle
        let positions = [[row, col]];  // Stocker les positions pour mettre en évidence les cellules gagnantes
        
        // Vérifier dans les deux sens
        for (let i = 1; i < CONNECT; i++) {
            const newRow = row + i * dx;
            const newCol = col + i * dy;
            
            if (
                newRow >= 0 && newRow < ROWS && 
                newCol >= 0 && newCol < COLS && 
                board[newRow][newCol] === currentPlayer
            ) {
                count++;
                positions.push([newRow, newCol]);
            } else {
                break;
            }
        }
        
        for (let i = 1; i < CONNECT; i++) {
            const newRow = row - i * dx;
            const newCol = col - i * dy;
            
            if (
                newRow >= 0 && newRow < ROWS && 
                newCol >= 0 && newCol < COLS && 
                board[newRow][newCol] === currentPlayer
            ) {
                count++;
                positions.push([newRow, newCol]);
            } else {
                break;
            }
        }
        
        // Si 4 jetons sont alignés
        if (count >= CONNECT) {
            highlightWinningCells(positions);
            return true;
        }
    }
    
    return false;
}

// Mettre en évidence les cellules gagnantes
function highlightWinningCells(positions) {
    positions.forEach(([row, col]) => {
        const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
        cell.classList.add('winning');
    });
}

// Vérifier s'il y a égalité
function checkDraw() {
    return board[0].every(cell => cell !== 0);
}

// Gérer la victoire
function handleWin() {
    gameActive = false;
    scores[currentPlayer]++;
    updateScores();
    saveScores();
    
    setTimeout(() => {
        winMessage.textContent = `Joueur ${currentPlayer} a gagné !`;
        winDetails.textContent = `Félicitations, vous avez aligné ${CONNECT} jetons !`;
        winModal.classList.add('active');
    }, 1000);
}

// Gérer l'égalité
function handleDraw() {
    gameActive = false;
    
    setTimeout(() => {
        winMessage.textContent = 'Match nul !';
        winDetails.textContent = 'La grille est complète sans vainqueur.';
        winModal.classList.add('active');
    }, 500);
}

// Indiquer qu'une colonne est pleine
function indicateFullColumn(col) {
    const button = document.querySelector(`.column-button[data-column="${col}"]`);
    button.classList.add('full');
    
    setTimeout(() => {
        button.classList.remove('full');
    }, 300);
}

// Mettre à jour l'affichage des scores
function updateScores() {
    scorePlayer1.textContent = scores[1];
    scorePlayer2.textContent = scores[2];
}

// Mettre à jour l'affichage du statut
function updateStatus() {
    statusMessage.textContent = `Au tour du Joueur ${currentPlayer}`;
    
    // Mettre à jour l'apparence des joueurs
    player1Element.classList.toggle('active', currentPlayer === 1);
    player2Element.classList.toggle('active', currentPlayer === 2);
}

// Mettre à jour l'apparence des boutons de colonne
function updateColumnButtons() {
    const buttons = document.querySelectorAll('.column-button');
    
    buttons.forEach(button => {
        button.classList.remove('player-1-turn', 'player-2-turn');
        button.classList.add(`player-${currentPlayer}-turn`);
    });
}

// Réinitialiser le jeu
function resetGame() {
    createBoard();
    currentPlayer = 1;
    gameActive = true;
    updateStatus();
    updateColumnButtons();
    winModal.classList.remove('active');
}

// Jouer un effet sonore lorsqu'un jeton est placé
function playDropSound() {
    // Cette fonction peut être implémentée plus tard si des sons sont ajoutés
    // const dropSound = new Audio('sounds/drop.mp3');
    // dropSound.volume = 0.3;
    // dropSound.play();
}

// Charger les scores depuis le localStorage
function loadScores() {
    const savedScores = localStorage.getItem('connect4Scores');
    if (savedScores) {
        scores = JSON.parse(savedScores);
        updateScores();
    }
}

// Sauvegarder les scores dans le localStorage
function saveScores() {
    localStorage.setItem('connect4Scores', JSON.stringify(scores));
}

// Démarrer le jeu au chargement de la page
document.addEventListener('DOMContentLoaded', initGame); 