// Script pour le jeu de Dames

// Configuration du jeu
const BOARD_SIZE = 8;
const PLAYER_WHITE = 'white';
const PLAYER_BLACK = 'black';
const EMPTY = null;

// Variables du jeu
let board = [];
let currentPlayer = PLAYER_WHITE;
let selectedPiece = null;
let possibleMoves = [];
let mandatoryJumps = [];
let gameMode = '2-players';
let gameActive = true;
let pieceCount = {
    [PLAYER_WHITE]: 12,
    [PLAYER_BLACK]: 12
};

// Éléments DOM
const checkersBoard = document.getElementById('checkers-board');
const currentPlayerDisplay = document.getElementById('current-player');
const whiteCountDisplay = document.getElementById('white-count');
const blackCountDisplay = document.getElementById('black-count');
const newGameButton = document.getElementById('new-game');
const restartButton = document.getElementById('restart-button');
const gameModeSelect = document.getElementById('game-mode');
const gameOverOverlay = document.getElementById('game-over-overlay');
const winnerMessage = document.getElementById('winner-message');
const winnerDetails = document.getElementById('winner-details');

// Initialisation du jeu
function initGame() {
    setupBoard();
    renderBoard();
    setupEventListeners();
    updateGameInfo();
}

// Configurer les écouteurs d'événements
function setupEventListeners() {
    newGameButton.addEventListener('click', startNewGame);
    restartButton.addEventListener('click', startNewGame);
    gameModeSelect.addEventListener('change', function() {
        gameMode = this.value;
        startNewGame();
    });
}

// Démarrer une nouvelle partie
function startNewGame() {
    resetGame();
    gameOverOverlay.classList.add('hidden');
}

// Réinitialiser le jeu
function resetGame() {
    board = [];
    currentPlayer = PLAYER_WHITE;
    selectedPiece = null;
    possibleMoves = [];
    mandatoryJumps = [];
    gameActive = true;
    pieceCount = {
        [PLAYER_WHITE]: 12,
        [PLAYER_BLACK]: 12
    };
    
    setupBoard();
    renderBoard();
    updateGameInfo();
}

// Configurer le plateau de jeu
function setupBoard() {
    board = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(EMPTY));
    
    // Placer les pièces blanches (rangées 0-2)
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if ((row + col) % 2 === 1) {
                board[row][col] = { color: PLAYER_WHITE, isKing: false };
            }
        }
    }
    
    // Placer les pièces noires (rangées 5-7)
    for (let row = 5; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if ((row + col) % 2 === 1) {
                board[row][col] = { color: PLAYER_BLACK, isKing: false };
            }
        }
    }
}

// Dessiner le plateau de jeu
function renderBoard() {
    checkersBoard.innerHTML = '';
    
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.classList.add((row + col) % 2 === 0 ? 'light' : 'dark');
            cell.dataset.row = row;
            cell.dataset.col = col;
            
            const piece = board[row][col];
            
            if (piece !== EMPTY) {
                const pieceElement = document.createElement('div');
                pieceElement.classList.add('piece', piece.color);
                
                if (piece.isKing) {
                    pieceElement.classList.add('king');
                }
                
                pieceElement.addEventListener('click', function() {
                    if (!gameActive) return;
                    
                    // Vérifier si c'est le tour du joueur
                    if (piece.color === currentPlayer) {
                        selectPiece(row, col);
                    }
                });
                
                cell.appendChild(pieceElement);
            }
            
            // Ajouter un écouteur d'événements à la cellule vide pour les déplacements
            cell.addEventListener('click', function() {
                if (!gameActive || selectedPiece === null) return;
                
                const clickedRow = parseInt(this.dataset.row);
                const clickedCol = parseInt(this.dataset.col);
                
                // Vérifier si la cellule est un mouvement possible
                const moveIndex = possibleMoves.findIndex(move => 
                    move.toRow === clickedRow && move.toCol === clickedCol
                );
                
                if (moveIndex !== -1) {
                    movePiece(possibleMoves[moveIndex]);
                }
            });
            
            checkersBoard.appendChild(cell);
        }
    }
    
    // Afficher les mouvements possibles
    highlightPossibleMoves();
}

// Sélectionner une pièce
function selectPiece(row, col) {
    // Désélectionner la pièce si elle est déjà sélectionnée
    if (selectedPiece && selectedPiece.row === row && selectedPiece.col === col) {
        selectedPiece = null;
        possibleMoves = [];
        renderBoard();
        return;
    }
    
    // Vérifier si des sauts sont obligatoires
    checkMandatoryJumps();
    
    // Si des sauts sont obligatoires, vérifier si cette pièce peut sauter
    if (mandatoryJumps.length > 0) {
        const hasMandatoryJump = mandatoryJumps.some(jump => 
            jump.fromRow === row && jump.fromCol === col
        );
        
        if (!hasMandatoryJump) {
            // Mettre en évidence les pièces qui peuvent sauter
            const piecesWithJumps = new Set(mandatoryJumps.map(jump => `${jump.fromRow}-${jump.fromCol}`));
            
            for (let r = 0; r < BOARD_SIZE; r++) {
                for (let c = 0; c < BOARD_SIZE; c++) {
                    if (board[r][c] !== EMPTY && board[r][c].color === currentPlayer) {
                        if (piecesWithJumps.has(`${r}-${c}`)) {
                            const pieceElement = document.querySelector(`.cell[data-row="${r}"][data-col="${c}"] .piece`);
                            if (pieceElement) {
                                pieceElement.classList.add('can-jump');
                            }
                        }
                    }
                }
            }
            return;
        }
    }
    
    // Sélectionner la pièce
    selectedPiece = { row, col };
    
    // Calculer les mouvements possibles pour cette pièce
    possibleMoves = calculatePossibleMoves(row, col);
    
    // Si des sauts sont obligatoires, filtrer les mouvements pour ne garder que les sauts
    if (mandatoryJumps.length > 0) {
        possibleMoves = possibleMoves.filter(move => move.isJump);
    }
    
    // Mettre en évidence la pièce sélectionnée
    const pieceElement = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"] .piece`);
    if (pieceElement) {
        pieceElement.classList.add('selected');
    }
    
    // Afficher les mouvements possibles
    highlightPossibleMoves();
}

// Mettre en évidence les mouvements possibles
function highlightPossibleMoves() {
    // Supprimer les anciens indicateurs de mouvement
    const oldHints = document.querySelectorAll('.move-hint');
    oldHints.forEach(hint => hint.remove());
    
    // Si aucune pièce n'est sélectionnée, ne rien faire
    if (!selectedPiece) return;
    
    // Créer des indicateurs pour les mouvements possibles
    possibleMoves.forEach(move => {
        const cell = document.querySelector(`.cell[data-row="${move.toRow}"][data-col="${move.toCol}"]`);
        if (cell) {
            const hint = document.createElement('div');
            hint.classList.add('move-hint');
            
            if (move.isJump) {
                hint.classList.add('capture-hint');
            }
            
            hint.addEventListener('click', function() {
                movePiece(move);
            });
            
            cell.appendChild(hint);
        }
    });
}

// Déplacer une pièce
function movePiece(move) {
    const piece = board[move.fromRow][move.fromCol];
    
    // Déplacer la pièce
    board[move.toRow][move.toCol] = piece;
    board[move.fromRow][move.fromCol] = EMPTY;
    
    // Supprimer les pièces capturées
    if (move.isJump) {
        const capturedRow = (move.fromRow + move.toRow) / 2;
        const capturedCol = (move.fromCol + move.toCol) / 2;
        
        // Réduire le compteur de pièces
        const capturedColor = board[capturedRow][capturedCol].color;
        pieceCount[capturedColor]--;
        
        // Animer la capture
        const capturedElement = document.querySelector(`.cell[data-row="${capturedRow}"][data-col="${capturedCol}"] .piece`);
        if (capturedElement) {
            capturedElement.classList.add('captured');
        }
        
        // Supprimer la pièce capturée du modèle
        board[capturedRow][capturedCol] = EMPTY;
    }
    
    // Vérifier si la pièce devient une dame
    if ((piece.color === PLAYER_WHITE && move.toRow === BOARD_SIZE - 1) ||
        (piece.color === PLAYER_BLACK && move.toRow === 0)) {
        piece.isKing = true;
    }
    
    // Réinitialiser la sélection
    selectedPiece = null;
    
    // Animer le mouvement
    const pieceElement = document.querySelector(`.cell[data-row="${move.toRow}"][data-col="${move.toCol}"] .piece`);
    if (pieceElement) {
        pieceElement.classList.add('animated');
    }
    
    // Vérifier si un saut multiple est possible
    let canJumpAgain = false;
    
    if (move.isJump) {
        // Calculer les mouvements possibles à partir de la nouvelle position
        const newJumps = calculatePossibleMoves(move.toRow, move.toCol).filter(m => m.isJump);
        
        if (newJumps.length > 0) {
            // Le joueur peut sauter à nouveau
            canJumpAgain = true;
            selectedPiece = { row: move.toRow, col: move.toCol };
            possibleMoves = newJumps;
            
            // Attendre que l'animation soit terminée avant de redessiner
            setTimeout(() => {
                renderBoard();
            }, 500);
        }
    }
    
    // S'il n'y a pas de sauts multiples, passer au tour suivant
    if (!canJumpAgain) {
        // Changer de joueur
        currentPlayer = currentPlayer === PLAYER_WHITE ? PLAYER_BLACK : PLAYER_WHITE;
        
        // Attendre que l'animation soit terminée avant de redessiner
        setTimeout(() => {
            renderBoard();
            updateGameInfo();
            
            // Vérifier la fin de partie
            checkGameOver();
            
            // Si le jeu est contre l'ordinateur et c'est son tour, jouer automatiquement
            if (gameActive && gameMode === 'vs-computer' && currentPlayer === PLAYER_BLACK) {
                setTimeout(playComputerMove, 500);
            }
        }, 500);
    }
}

// Calculer les mouvements possibles pour une pièce
function calculatePossibleMoves(row, col) {
    const piece = board[row][col];
    if (piece === EMPTY) return [];
    
    const moves = [];
    const isKing = piece.isKing;
    const color = piece.color;
    
    // Déterminer les directions possibles selon la couleur
    const directions = [];
    
    if (color === PLAYER_WHITE || isKing) {
        // En avant pour les blancs, ou dans toutes les directions pour les dames
        directions.push({ rowDelta: 1, colDelta: -1 }); // Diagonale bas-gauche
        directions.push({ rowDelta: 1, colDelta: 1 });  // Diagonale bas-droite
    }
    
    if (color === PLAYER_BLACK || isKing) {
        // En avant pour les noirs, ou dans toutes les directions pour les dames
        directions.push({ rowDelta: -1, colDelta: -1 }); // Diagonale haut-gauche
        directions.push({ rowDelta: -1, colDelta: 1 });  // Diagonale haut-droite
    }
    
    // Vérifier les mouvements simples
    directions.forEach(dir => {
        const newRow = row + dir.rowDelta;
        const newCol = col + dir.colDelta;
        
        if (isValidPosition(newRow, newCol) && board[newRow][newCol] === EMPTY) {
            moves.push({
                fromRow: row,
                fromCol: col,
                toRow: newRow,
                toCol: newCol,
                isJump: false
            });
        }
    });
    
    // Vérifier les sauts (captures)
    directions.forEach(dir => {
        const newRow = row + dir.rowDelta * 2;
        const newCol = col + dir.colDelta * 2;
        const jumpRow = row + dir.rowDelta;
        const jumpCol = col + dir.colDelta;
        
        if (
            isValidPosition(newRow, newCol) && 
            board[newRow][newCol] === EMPTY && 
            board[jumpRow][jumpCol] !== EMPTY && 
            board[jumpRow][jumpCol].color !== color
        ) {
            moves.push({
                fromRow: row,
                fromCol: col,
                toRow: newRow,
                toCol: newCol,
                isJump: true
            });
        }
    });
    
    return moves;
}

// Vérifier si une position est valide sur le plateau
function isValidPosition(row, col) {
    return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}

// Vérifier si des sauts sont obligatoires
function checkMandatoryJumps() {
    mandatoryJumps = [];
    
    // Rechercher tous les sauts possibles pour le joueur actuel
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (board[row][col] !== EMPTY && board[row][col].color === currentPlayer) {
                const jumps = calculatePossibleMoves(row, col).filter(move => move.isJump);
                mandatoryJumps.push(...jumps);
            }
        }
    }
}

// Vérifier si la partie est terminée
function checkGameOver() {
    // Vérifier s'il reste des pièces aux joueurs
    if (pieceCount[PLAYER_WHITE] === 0) {
        endGame(PLAYER_BLACK);
        return;
    }
    
    if (pieceCount[PLAYER_BLACK] === 0) {
        endGame(PLAYER_WHITE);
        return;
    }
    
    // Vérifier si le joueur actuel a des mouvements possibles
    let hasValidMoves = false;
    
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (board[row][col] !== EMPTY && board[row][col].color === currentPlayer) {
                const moves = calculatePossibleMoves(row, col);
                if (moves.length > 0) {
                    hasValidMoves = true;
                    break;
                }
            }
        }
        if (hasValidMoves) break;
    }
    
    // Si le joueur n'a aucun mouvement valide, c'est un blocage et l'autre joueur gagne
    if (!hasValidMoves) {
        const winner = currentPlayer === PLAYER_WHITE ? PLAYER_BLACK : PLAYER_WHITE;
        endGame(winner);
    }
}

// Terminer la partie
function endGame(winner) {
    gameActive = false;
    
    // Afficher le message de victoire
    const winnerText = winner === PLAYER_WHITE ? 'Blanc' : 'Noir';
    winnerMessage.textContent = `${winnerText} gagne !`;
    winnerDetails.textContent = `Le joueur ${winnerText} a remporté la partie.`;
    
    // Afficher l'overlay de fin de partie
    gameOverOverlay.classList.remove('hidden');
}

// Faire jouer l'ordinateur (stratégie simple)
function playComputerMove() {
    if (!gameActive || currentPlayer !== PLAYER_BLACK) return;
    
    // Vérifier les sauts obligatoires
    checkMandatoryJumps();
    
    let possibleMoves = [];
    
    // Si des sauts sont obligatoires, les collecter
    if (mandatoryJumps.length > 0) {
        possibleMoves = [...mandatoryJumps];
    } else {
        // Collecter tous les mouvements possibles pour les pièces noires
        for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE; col++) {
                if (board[row][col] !== EMPTY && board[row][col].color === PLAYER_BLACK) {
                    possibleMoves.push(...calculatePossibleMoves(row, col));
                }
            }
        }
    }
    
    if (possibleMoves.length === 0) {
        // L'ordinateur n'a aucun mouvement possible
        endGame(PLAYER_WHITE);
        return;
    }
    
    // Stratégie: privilégier les captures, puis les mouvements avançant vers la promotion, puis aléatoire
    let selectedMove;
    
    // D'abord, essayer de capturer
    const jumps = possibleMoves.filter(move => move.isJump);
    if (jumps.length > 0) {
        selectedMove = jumps[Math.floor(Math.random() * jumps.length)];
    } else {
        // Ensuite, essayer de promouvoir un pion en dame
        const promotions = possibleMoves.filter(move => {
            const piece = board[move.fromRow][move.fromCol];
            return !piece.isKing && move.toRow === 0;
        });
        
        if (promotions.length > 0) {
            selectedMove = promotions[Math.floor(Math.random() * promotions.length)];
        } else {
            // Sinon, choisir un mouvement aléatoire avec une préférence pour avancer
            const advancingMoves = possibleMoves.filter(move => move.toRow < move.fromRow);
            if (advancingMoves.length > 0) {
                selectedMove = advancingMoves[Math.floor(Math.random() * advancingMoves.length)];
            } else {
                selectedMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
            }
        }
    }
    
    // Sélectionner la pièce et jouer le mouvement
    selectedPiece = { row: selectedMove.fromRow, col: selectedMove.fromCol };
    movePiece(selectedMove);
}

// Mettre à jour les informations du jeu
function updateGameInfo() {
    // Mettre à jour l'affichage du joueur actuel
    currentPlayerDisplay.className = 'player-piece ' + currentPlayer;
    
    // Mettre à jour le compteur de pièces
    whiteCountDisplay.textContent = pieceCount[PLAYER_WHITE];
    blackCountDisplay.textContent = pieceCount[PLAYER_BLACK];
}

// Initialiser le jeu au chargement de la page
document.addEventListener('DOMContentLoaded', initGame); 