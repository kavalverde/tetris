// Clase para manejar las piezas de Tetris
class Piece {
  constructor(board, tetrisEl, nextPieceEl) {
    this.board = board;
    this.tetrisEl = tetrisEl;
    this.nextPieceEl = nextPieceEl;
    this.currentPiece = null;
    this.nextPiece = null;
  }

  // Inicializar las piezas iniciales
  init() {
    this.currentPiece = getRandomPiece();
    this.nextPiece = getRandomPiece();
    this.draw(this.currentPiece);
    this.drawPreview(this.nextPiece);
  }

  // Generar la siguiente pieza
  generateNextPiece() {
    this.currentPiece = this.nextPiece;
    this.nextPiece = getRandomPiece();
    this.drawPreview(this.nextPiece);
    return !this.board.isValidMove(this.currentPiece); // Retorna true si es game over
  }

  // Dibujar una pieza en el tablero
  draw(piece) {
    const { shape, className, row, col, type } = piece;
    const imgPath = TETRIMINOS[type].imgPath;

    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[0].length; c++) {
        if (shape[r][c]) {
          const boardRow = row + r;
          const boardCol = col + c;

          // Si está dentro del tablero
          if (
            boardRow >= 0 &&
            boardRow < CONFIG.ROWS &&
            boardCol >= 0 &&
            boardCol < CONFIG.COLS
          ) {
            const cell = this.tetrisEl.querySelector(
              `[data-row="${boardRow}"][data-col="${boardCol}"]`
            );
            if (cell) {
              cell.className = `cell ${className}`;
              cell.style.backgroundImage = `url(${imgPath})`;
              cell.style.backgroundPosition = "center";
              cell.style.backgroundSize = "cover";
            }
          }
        }
      }
    }
  }

  // Borrar una pieza del tablero
  erase(piece) {
    const { shape, row, col } = piece;

    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          const boardRow = row + r;
          const boardCol = col + c;

          // Si está dentro del tablero
          if (
            boardRow >= 0 &&
            boardRow < CONFIG.ROWS &&
            boardCol >= 0 &&
            boardCol < CONFIG.COLS
          ) {
            const cell = this.tetrisEl.querySelector(
              `[data-row="${boardRow}"][data-col="${boardCol}"]`
            );
            if (cell) {
              cell.className = "cell";
              cell.style.backgroundImage = "none";
              cell.style.backgroundPosition = "";
              cell.style.backgroundSize = "";
            }
          }
        }
      }
    }
  }

  // Dibujar la vista previa de la siguiente pieza
  drawPreview(piece) {
    const { shape, className, type } = piece;
    const imgPath = TETRIMINOS[type].imgPath;

    // Limpiar la vista previa
    const cells = this.nextPieceEl.querySelectorAll(".cell");
    cells.forEach((cell) => {
      cell.className = "cell";
      cell.style.backgroundImage = "none";
      cell.style.backgroundPosition = "";
      cell.style.backgroundSize = "";
    });

    // Obtener las dimensiones reales de la pieza (ignorando filas/columnas vacías)
    let minRow = shape.length;
    let maxRow = 0;
    let minCol = shape[0].length;
    let maxCol = 0;

    // Encontrar los límites reales de la pieza
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[0].length; c++) {
        if (shape[r][c]) {
          minRow = Math.min(minRow, r);
          maxRow = Math.max(maxRow, r);
          minCol = Math.min(minCol, c);
          maxCol = Math.max(maxCol, c);
        }
      }
    }

    // Calcular altura y anchura reales de la pieza (solo bloques activos)
    const actualHeight = maxRow - minRow + 1;
    const actualWidth = maxCol - minCol + 1;

    // Calcular offsets para centrar perfectamente en la cuadrícula de 4x4
    const verticalOffset = Math.floor((4 - actualHeight) / 2);
    const horizontalOffset = Math.floor((4 - actualWidth) / 2);

    // Dibujar cada bloque activo de la pieza
    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        if (shape[r][c]) {
          // Calcular posición en la vista previa con offsets ajustados
          const previewRow = r - minRow + verticalOffset;
          const previewCol = c - minCol + horizontalOffset;
          const index = previewRow * 4 + previewCol;

          if (cells[index] && index >= 0 && index < 16) {
            cells[index].className = `cell ${className}`;
            cells[index].style.backgroundImage = `url(${imgPath})`;
            cells[index].style.backgroundPosition = "center";
            cells[index].style.backgroundSize = "cover";
          }
        }
      }
    }
  }

  // Mover la pieza hacia abajo
  moveDown() {
    if (this.board.isValidMove(this.currentPiece, 1, 0)) {
      this.erase(this.currentPiece);
      this.currentPiece.row++;
      this.draw(this.currentPiece);
      return false; // La pieza se movió correctamente y no está bloqueada
    } else {
      // No se pudo mover, la pieza debería bloquearse
      return true; // Retorna true para indicar que la pieza debe ser bloqueada
    }
  }

  // Mover la pieza hacia izquierda
  moveLeft() {
    if (this.board.isValidMove(this.currentPiece, 0, -1)) {
      this.erase(this.currentPiece);
      this.currentPiece.col--;
      this.draw(this.currentPiece);
      return true; // Movimiento exitoso
    }
    return false; // No se pudo mover
  }

  // Mover la pieza hacia derecha
  moveRight() {
    if (this.board.isValidMove(this.currentPiece, 0, 1)) {
      this.erase(this.currentPiece);
      this.currentPiece.col++;
      this.draw(this.currentPiece);
      return true; // Movimiento exitoso
    }
    return false; // No se pudo mover
  }

  // Rotar la pieza
  rotate() {
    const newShape = [];
    const size = this.currentPiece.shape.length;

    // Crear una nueva matriz rotada
    for (let r = 0; r < size; r++) {
      newShape[r] = [];
      for (let c = 0; c < size; c++) {
        newShape[r][c] = this.currentPiece.shape[size - 1 - c][r];
      }
    }

    // Crear una copia de la pieza con la nueva forma
    const rotatedPiece = {
      ...this.currentPiece,
      shape: newShape,
    };

    // Verificar si la rotación es válida
    if (this.board.isValidMove(rotatedPiece)) {
      this.erase(this.currentPiece);
      this.currentPiece.shape = newShape;
      this.draw(this.currentPiece);
      return true; // Rotación exitosa
    }
    return false; // No se pudo rotar
  }

  // Caída rápida (hard drop)
  hardDrop() {
    let dropped = false;

    while (this.board.isValidMove(this.currentPiece, 1, 0)) {
      this.erase(this.currentPiece);
      this.currentPiece.row++;
      this.draw(this.currentPiece);
      dropped = true;
    }

    return dropped; // Retorna true si la pieza se movió al menos una vez
  }
}
