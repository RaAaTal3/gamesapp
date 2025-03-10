// Script pour le jeu Tetris

// Configuration du jeu
const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 30;
const EMPTY_CELL = 'empty';
const INITIAL_SPEED = 1000; // Intervalle en ms entre les mouvements
const SPEED_INCREASE = 0.8; // Multiplier pour l'augmentation de la vitesse
const LEVEL_LINES = 10; // Nombre de lignes pour augmenter de niveau

// Définition des pièces
const PIECES = [
    {
        name: 'I',
        shape: [
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ],
        startOffset: { row: -1, col: 3 }
    },
    {
        name: 'O',
        shape: [
            [1, 1],
            [1, 1]
        ],
        startOffset: { row: 0, col: 4 }
    },
    {
        name: 'T',
        shape: [
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        startOffset: { row: 0, col: 3 }
    },
    {
        name: 'L',
        shape: [
            [0, 0, 1],
            [1, 1, 1],
            [0, 0, 0]
        ],
        startOffset: { row: 0, col: 3 }
    },
    {
        name: 'J',
        shape: [
            [1, 0, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        startOffset: { row: 0, col: 3 }
    },
    {
        name: 'S',
        shape: [
            [0, 1, 1],
            [1, 1, 0],
            [0, 0, 0]
        ],
        startOffset: { row: 0, col: 3 }
    },
    {
        name: 'Z',
        shape: [
            [1, 1, 0],
            [0, 1, 1],
            [0, 0, 0]
        ],
        startOffset: { row: 0, col: 3 }
    }
];

// Variables du jeu
let board = [];
let currentPiece = null;
let nextPiece = null;
let currentPosition = { row: 0, col: 0 };
let gameActive = false;
let gameLoop = null;
let isPaused = false;
let score = 0;
let lines = 0;
let level = 1;
let dropSpeed = INITIAL_SPEED;

// Éléments DOM
const tetrisBoard = document.getElementById('tetris-board');
const nextPieceElement = document.getElementById('next-piece');
const scoreElement = document.getElementById('score');
const linesElement = document.getElementById('lines');
const levelElement = document.getElementById('level');
const startButton = document.getElementById('start-button');
const pauseButton = document.getElementById('pause-button');
const restartButton = document.getElementById('restart-button');
const pauseOverlay = document.getElementById('pause-overlay');
const gameOverOverlay = document.getElementById('game-over-overlay');

// Éléments de contrôle mobile
const leftButton = document.getElementById('left-btn');
const rightButton = document.getElementById('right-btn');
const rotateButton = document.getElementById('rotate-btn');
const downButton = document.getElementById('down-btn');
const dropButton = document.getElementById('drop-btn');

// Initialisation du jeu
function initGame() {
    setupBoard();
    setupEventListeners();
    createNextPiece();
    updateNextPieceDisplay();
    updateScoreDisplay();
}

// Configurer le plateau de jeu
function setupBoard() {
    tetrisBoard.innerHTML = '';
    board = [];
    
    // Créer une grille vide
    for (let row = 0; row < ROWS; row++) {
        const newRow = [];
        for (let col = 0; col < COLS; col++) {
            newRow.push(EMPTY_CELL);
            
            // Créer les cellules du DOM
            const cell = document.createElement('div');
            cell.classList.add('tetris-cell', EMPTY_CELL);
            cell.dataset.row = row;
            cell.dataset.col = col;
            tetrisBoard.appendChild(cell);
        }
        board.push(newRow);
    }
}

// Configurer les écouteurs d'événements
function setupEventListeners() {
    document.addEventListener('keydown', handleKeyPress);
    startButton.addEventListener('click', startGame);
    pauseButton.addEventListener('click', togglePause);
    restartButton.addEventListener('click', restartGame);
    
    // Contrôles mobiles
    leftButton.addEventListener('click', () => movePiece(0, -1));
    rightButton.addEventListener('click', () => movePiece(0, 1));
    rotateButton.addEventListener('click', rotatePiece);
    downButton.addEventListener('click', () => movePiece(1, 0));
    dropButton.addEventListener('click', dropPiece);
}

// Gérer les touches du clavier
function handleKeyPress(e) {
    if (!gameActive || isPaused) return;
    
    switch (e.key) {
        case 'ArrowLeft':
            movePiece(0, -1);
            break;
        case 'ArrowRight':
            movePiece(0, 1);
            break;
        case 'ArrowUp':
            rotatePiece();
            break;
        case 'ArrowDown':
            movePiece(1, 0);
            break;
        case ' ':
            dropPiece();
            break;
        case 'p':
        case 'P':
            togglePause();
            break;
    }
}

// Démarrer le jeu
function startGame() {
    if (gameActive) return;
    
    resetGame();
    gameActive = true;
    createNewPiece();
    startGameLoop();
    
    startButton.textContent = 'Redémarrer';
    pauseButton.disabled = false;
}

// Redémarrer le jeu
function restartGame() {
    resetGame();
    gameActive = true;
    createNewPiece();
    startGameLoop();
    
    gameOverOverlay.classList.add('hidden');
    pauseButton.disabled = false;
}

// Réinitialiser le jeu
function resetGame() {
    // Réinitialiser les variables
    score = 0;
    lines = 0;
    level = 1;
    dropSpeed = INITIAL_SPEED;
    gameActive = false;
    isPaused = false;
    
    // Nettoyer le plateau
    setupBoard();
    
    // Mettre à jour l'affichage
    updateScoreDisplay();
    
    // Assurer que les overlays sont cachés
    pauseOverlay.classList.add('hidden');
    gameOverOverlay.classList.add('hidden');
    
    // Réinitialiser les pièces
    createNextPiece();
}

// Mettre en pause ou reprendre le jeu
function togglePause() {
    if (!gameActive) return;
    
    isPaused = !isPaused;
    
    if (isPaused) {
        clearInterval(gameLoop);
        pauseOverlay.classList.remove('hidden');
        pauseButton.textContent = 'Reprendre';
    } else {
        startGameLoop();
        pauseOverlay.classList.add('hidden');
        pauseButton.textContent = 'Pause';
    }
}

// Démarrer la boucle de jeu
function startGameLoop() {
    if (gameLoop) clearInterval(gameLoop);
    
    gameLoop = setInterval(() => {
        if (!movePiece(1, 0)) {
            // Si la pièce ne peut pas descendre davantage
            placePiece();
            checkLines();
            if (!createNewPiece()) {
                gameOver();
            }
        }
    }, dropSpeed);
}

// Créer une nouvelle pièce
function createNewPiece() {
    if (nextPiece === null) {
        createNextPiece();
    }
    
    currentPiece = nextPiece;
    createNextPiece();
    
    // Position de départ
    currentPosition = { ...currentPiece.startOffset };
    
    // Vérifier si la pièce peut être placée
    if (!isValidMove(currentPiece.shape, currentPosition)) {
        return false;
    }
    
    // Dessiner la pièce sur le plateau
    drawPiece();
    updateNextPieceDisplay();
    
    return true;
}

// Créer la pièce suivante
function createNextPiece() {
    const randomIndex = Math.floor(Math.random() * PIECES.length);
    nextPiece = JSON.parse(JSON.stringify(PIECES[randomIndex]));
}

// Mettre à jour l'affichage de la pièce suivante
function updateNextPieceDisplay() {
    nextPieceElement.innerHTML = '';
    
    // Créer une grille pour la pièce suivante
    const pieceSize = nextPiece.shape.length;
    
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            const cell = document.createElement('div');
            cell.classList.add('tetris-cell');
            
            if (row < pieceSize && col < pieceSize && nextPiece.shape[row][col]) {
                cell.classList.add('filled', `piece-${nextPiece.name}`);
            } else {
                cell.classList.add('empty');
            }
            
            nextPieceElement.appendChild(cell);
        }
    }
}

// Dessiner la pièce actuelle sur le plateau
function drawPiece() {
    // Effacer la pièce précédente
    clearPiece();
    
    // Dessiner la nouvelle position
    const pieceSize = currentPiece.shape.length;
    
    for (let row = 0; row < pieceSize; row++) {
        for (let col = 0; col < pieceSize; col++) {
            if (currentPiece.shape[row][col]) {
                const boardRow = currentPosition.row + row;
                const boardCol = currentPosition.col + col;
                
                // Vérifier si la cellule est sur le plateau
                if (boardRow >= 0 && boardRow < ROWS && boardCol >= 0 && boardCol < COLS) {
                    const cell = tetrisBoard.querySelector(`[data-row="${boardRow}"][data-col="${boardCol}"]`);
                    cell.classList.remove(EMPTY_CELL);
                    cell.classList.add('filled', `piece-${currentPiece.name}`);
                }
            }
        }
    }
    
    // Dessiner la pièce fantôme
    drawGhostPiece();
}

// Effacer la pièce actuelle du plateau
function clearPiece() {
    // Supprimer toutes les cellules avec la classe 'filled' qui ne sont pas fixées
    const filledCells = tetrisBoard.querySelectorAll('.filled:not(.fixed)');
    filledCells.forEach(cell => {
        cell.classList.remove('filled');
        cell.classList.remove(`piece-${currentPiece.name}`);
        cell.classList.remove('ghost');
        cell.classList.add(EMPTY_CELL);
    });
}

// Dessiner la pièce fantôme (preview de l'emplacement)
function drawGhostPiece() {
    const ghostPosition = { ...currentPosition };
    
    // Trouver la position la plus basse possible
    while (isValidMove(currentPiece.shape, { row: ghostPosition.row + 1, col: ghostPosition.col })) {
        ghostPosition.row++;
    }
    
    // Ne pas dessiner la pièce fantôme si elle est à la même position que la pièce actuelle
    if (ghostPosition.row === currentPosition.row) return;
    
    // Dessiner la pièce fantôme
    const pieceSize = currentPiece.shape.length;
    
    for (let row = 0; row < pieceSize; row++) {
        for (let col = 0; col < pieceSize; col++) {
            if (currentPiece.shape[row][col]) {
                const boardRow = ghostPosition.row + row;
                const boardCol = ghostPosition.col + col;
                
                // Vérifier si la cellule est sur le plateau
                if (boardRow >= 0 && boardRow < ROWS && boardCol >= 0 && boardCol < COLS) {
                    const cell = tetrisBoard.querySelector(`[data-row="${boardRow}"][data-col="${boardCol}"]`);
                    if (!cell.classList.contains('filled')) {
                        cell.classList.remove(EMPTY_CELL);
                        cell.classList.add('filled', `piece-${currentPiece.name}`, 'ghost');
                    }
                }
            }
        }
    }
}

// Déplacer la pièce
function movePiece(rowOffset, colOffset) {
    const newPosition = {
        row: currentPosition.row + rowOffset,
        col: currentPosition.col + colOffset
    };
    
    if (isValidMove(currentPiece.shape, newPosition)) {
        currentPosition = newPosition;
        drawPiece();
        return true;
    }
    return false;
}

// Faire tourner la pièce
function rotatePiece() {
    const rotatedShape = rotateMatrix(currentPiece.shape);
    
    if (isValidMove(rotatedShape, currentPosition)) {
        currentPiece.shape = rotatedShape;
        drawPiece();
        return true;
    }
    
    // Essayer avec un décalage (wall kick)
    const kicks = [
        { row: 0, col: 1 },   // droite
        { row: 0, col: -1 },  // gauche
        { row: -1, col: 0 },  // haut
        { row: 1, col: 0 },   // bas
        { row: -1, col: 1 },  // haut-droite
        { row: -1, col: -1 }, // haut-gauche
    ];
    
    for (const kick of kicks) {
        const kickedPosition = {
            row: currentPosition.row + kick.row,
            col: currentPosition.col + kick.col
        };
        
        if (isValidMove(rotatedShape, kickedPosition)) {
            currentPiece.shape = rotatedShape;
            currentPosition = kickedPosition;
            drawPiece();
            return true;
        }
    }
    
    return false;
}

// Faire tomber la pièce instantanément
function dropPiece() {
    while (movePiece(1, 0)) {
        // Continuer à descendre jusqu'à ce que ce ne soit plus possible
    }
    
    // Placer la pièce et créer une nouvelle
    placePiece();
    checkLines();
    if (!createNewPiece()) {
        gameOver();
    }
}

// Placer la pièce sur le plateau
function placePiece() {
    const pieceSize = currentPiece.shape.length;
    
    for (let row = 0; row < pieceSize; row++) {
        for (let col = 0; col < pieceSize; col++) {
            if (currentPiece.shape[row][col]) {
                const boardRow = currentPosition.row + row;
                const boardCol = currentPosition.col + col;
                
                // Vérifier si la cellule est sur le plateau
                if (boardRow >= 0 && boardRow < ROWS && boardCol >= 0 && boardCol < COLS) {
                    // Mettre à jour le modèle de données
                    board[boardRow][boardCol] = currentPiece.name;
                    
                    // Mettre à jour le DOM
                    const cell = tetrisBoard.querySelector(`[data-row="${boardRow}"][data-col="${boardCol}"]`);
                    cell.classList.add('fixed');
                }
            }
        }
    }
}

// Vérifier et effacer les lignes complètes
function checkLines() {
    let linesCleared = 0;
    const linesToClear = [];
    
    // Vérifier chaque ligne
    for (let row = 0; row < ROWS; row++) {
        let isLineFull = true;
        
        for (let col = 0; col < COLS; col++) {
            if (board[row][col] === EMPTY_CELL) {
                isLineFull = false;
                break;
            }
        }
        
        if (isLineFull) {
            linesToClear.push(row);
            linesCleared++;
        }
    }
    
    if (linesCleared > 0) {
        // Animation pour les lignes complètes
        animateLinesClear(linesToClear, () => {
            // Mettre à jour le score
            updateScore(linesCleared);
            
            // Supprimer les lignes et faire descendre les blocs
            clearLines(linesToClear);
        });
    }
}

// Animer l'effacement des lignes
function animateLinesClear(rowIndices, callback) {
    // Ajouter la classe flash aux cellules des lignes complètes
    rowIndices.forEach(row => {
        for (let col = 0; col < COLS; col++) {
            const cell = tetrisBoard.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            cell.classList.add('flash');
        }
    });
    
    // Attendre la fin de l'animation
    setTimeout(() => {
        rowIndices.forEach(row => {
            for (let col = 0; col < COLS; col++) {
                const cell = tetrisBoard.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                cell.classList.remove('flash');
            }
        });
        
        callback();
    }, 900); // Durée de l'animation
}

// Effacer les lignes et faire descendre les blocs
function clearLines(rowIndices) {
    // Trier les indices de ligne en ordre décroissant
    rowIndices.sort((a, b) => b - a);
    
    rowIndices.forEach(rowIndex => {
        // Supprimer la ligne
        board.splice(rowIndex, 1);
        
        // Ajouter une nouvelle ligne vide en haut
        const newRow = Array(COLS).fill(EMPTY_CELL);
        board.unshift(newRow);
    });
    
    // Mettre à jour le DOM pour refléter le nouveau plateau
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const cell = tetrisBoard.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            
            // Réinitialiser les classes
            cell.className = 'tetris-cell';
            
            // Ajouter les classes appropriées
            if (board[row][col] === EMPTY_CELL) {
                cell.classList.add(EMPTY_CELL);
            } else {
                cell.classList.add('filled', `piece-${board[row][col]}`, 'fixed');
            }
        }
    }
}

// Mettre à jour le score
function updateScore(linesCleared) {
    // Mise à jour des lignes
    lines += linesCleared;
    
    // Calcul du score (plus de points pour plus de lignes à la fois)
    const points = [0, 100, 300, 500, 800];
    score += points[linesCleared] * level;
    
    // Vérifier si le niveau augmente
    const newLevel = Math.floor(lines / LEVEL_LINES) + 1;
    if (newLevel > level) {
        levelUp(newLevel);
    }
    
    // Mettre à jour l'affichage
    updateScoreDisplay();
}

// Augmenter le niveau
function levelUp(newLevel) {
    level = newLevel;
    
    // Augmenter la vitesse
    dropSpeed = Math.max(100, INITIAL_SPEED * Math.pow(SPEED_INCREASE, level - 1));
    
    // Redémarrer la boucle de jeu avec la nouvelle vitesse
    if (gameActive && !isPaused) {
        startGameLoop();
    }
}

// Mettre à jour l'affichage du score
function updateScoreDisplay() {
    scoreElement.textContent = score;
    linesElement.textContent = lines;
    levelElement.textContent = level;
}

// Vérifier si un mouvement est valide
function isValidMove(shape, position) {
    const pieceSize = shape.length;
    
    for (let row = 0; row < pieceSize; row++) {
        for (let col = 0; col < pieceSize; col++) {
            if (shape[row][col]) {
                const boardRow = position.row + row;
                const boardCol = position.col + col;
                
                // Vérifier si la cellule est hors du plateau
                if (
                    boardRow >= ROWS || 
                    boardCol < 0 || 
                    boardCol >= COLS ||
                    (boardRow >= 0 && board[boardRow][boardCol] !== EMPTY_CELL) // Vérifier la collision avec une pièce fixée
                ) {
                    return false;
                }
            }
        }
    }
    
    return true;
}

// Faire tourner une matrice (sens horaire)
function rotateMatrix(matrix) {
    const size = matrix.length;
    const rotated = [];
    
    for (let row = 0; row < size; row++) {
        rotated.push([]);
        for (let col = 0; col < size; col++) {
            rotated[row][col] = matrix[size - 1 - col][row];
        }
    }
    
    return rotated;
}

// Fin de partie
function gameOver() {
    gameActive = false;
    clearInterval(gameLoop);
    gameOverOverlay.classList.remove('hidden');
    pauseButton.disabled = true;
}

// Initialiser le jeu au chargement de la page
document.addEventListener('DOMContentLoaded', initGame); 