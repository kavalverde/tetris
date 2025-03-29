// Clase para manejar el tablero del juego
class Board {
  constructor() {
    this.grid = [];
    this.tetrisEl = document.getElementById("tetris");
    this.nextPieceEl = document.getElementById("next-piece");
    this.init();
  }

  // Inicializar el tablero
  init() {
    // Crear la matriz del tablero
    this.grid = Array.from({ length: CONFIG.ROWS }, () =>
      Array(CONFIG.COLS).fill(CONFIG.EMPTY)
    );

    // Crear la cuadrícula del tablero
    this.tetrisEl.innerHTML = "";
    for (let r = 0; r < CONFIG.ROWS; r++) {
      for (let c = 0; c < CONFIG.COLS; c++) {
        const cell = document.createElement("div");
        cell.className = "cell";
        cell.dataset.row = r;
        cell.dataset.col = c;
        this.tetrisEl.appendChild(cell);
      }
    }

    // Crear la cuadrícula para la siguiente pieza
    this.nextPieceEl.innerHTML = "";
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const cell = document.createElement("div");
        cell.className = "cell";
        this.nextPieceEl.appendChild(cell);
      }
    }
  }

  // Actualizar el tablero completo según la matriz interna
  updateBoard() {
    for (let r = 0; r < CONFIG.ROWS; r++) {
      for (let c = 0; c < CONFIG.COLS; c++) {
        const cell = this.tetrisEl.querySelector(
          `[data-row="${r}"][data-col="${c}"]`
        );
        if (cell) {
          if (this.grid[r][c] !== CONFIG.EMPTY) {
            const pieceData = this.grid[r][c];
            cell.className = `cell ${pieceData.className}`;
            cell.style.backgroundImage = `url(${pieceData.imgPath})`;
            cell.style.backgroundPosition = "center";
            cell.style.backgroundSize = "cover";
          } else {
            cell.className = "cell";
            cell.style.backgroundImage = "none";
            cell.style.backgroundPosition = "";
            cell.style.backgroundSize = "";
          }
        }
      }
    }
  }

  // Verificar líneas completas y eliminarlas
  checkLines() {
    const completedLines = [];

    // Encontrar todas las líneas completas
    for (let r = 0; r < CONFIG.ROWS; r++) {
      if (this.grid[r].every((cell) => cell !== CONFIG.EMPTY)) {
        completedLines.push(r);
      }
    }

    // Si hay líneas completas, eliminarlas
    if (completedLines.length > 0) {
      // Eliminar líneas completas
      for (const r of completedLines) {
        this.grid.splice(r, 1);
        this.grid.unshift(Array(CONFIG.COLS).fill(CONFIG.EMPTY));
      }

      // Actualizar el tablero visual completo
      this.updateBoard();
    }

    return completedLines.length;
  }

  // Fijar una pieza en el tablero
  lockPiece(piece) {
    const { shape, row, col, className, type } = piece;
    const imgPath = TETRIMINOS[type].imgPath;

    // Almacenar la información de la pieza en el tablero
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          const boardRow = row + r;
          const boardCol = col + c;

          if (
            boardRow >= 0 &&
            boardRow < CONFIG.ROWS &&
            boardCol >= 0 &&
            boardCol < CONFIG.COLS
          ) {
            // Guardar información de la pieza
            this.grid[boardRow][boardCol] = {
              className: className,
              imgPath: imgPath,
              bgPos: "center",
              bgSize: "cover",
            };
          }
        }
      }
    }
  }

  // Verificar si una pieza puede moverse a una nueva posición
  isValidMove(piece, rowOffset = 0, colOffset = 0) {
    const { shape, row, col } = piece;

    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          const newRow = row + r + rowOffset;
          const newCol = col + c + colOffset;

          // Verificar si está fuera de los límites
          if (
            newRow < 0 ||
            newRow >= CONFIG.ROWS ||
            newCol < 0 ||
            newCol >= CONFIG.COLS
          ) {
            return false;
          }

          // Verificar si ya hay una pieza en esa posición (y está dentro del tablero)
          if (newRow >= 0 && this.grid[newRow][newCol] !== CONFIG.EMPTY) {
            return false;
          }
        }
      }
    }

    return true;
  }
}
