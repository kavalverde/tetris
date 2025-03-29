// Clase principal del juego
class Game {
  constructor() {
    // Elementos DOM
    this.tetrisEl = document.getElementById("tetris");
    this.nextPieceEl = document.getElementById("next-piece");
    this.scoreEl = document.getElementById("score");
    this.levelEl = document.getElementById("level");
    this.linesEl = document.getElementById("lines");

    // Estado del juego
    this.score = 0;
    this.level = 1;
    this.lines = 0;
    this.gameOver = false;
    this.isPaused = false;
    this.dropInterval = null;
    this.dropSpeed = CONFIG.INITIAL_DROP_SPEED;

    // Inicializar componentes del juego
    this.board = new Board();
    this.piece = new Piece(this.board, this.tetrisEl, this.nextPieceEl);
    this.controls = new Controls(this);
  }

  // Iniciar el juego
  start() {
    // Reiniciar variables
    this.score = 0;
    this.level = 1;
    this.lines = 0;
    this.gameOver = false;
    this.isPaused = false;
    this.dropSpeed = CONFIG.INITIAL_DROP_SPEED;

    // Actualizar UI
    this.updateUI();

    // Inicializar el tablero y las piezas
    this.board.init();
    this.piece.init();

    // Iniciar el intervalo de caída
    this.startDropInterval();
  }

  // Iniciar o reiniciar el intervalo de caída
  startDropInterval() {
    if (this.dropInterval) {
      clearInterval(this.dropInterval);
    }
    this.dropInterval = setInterval(() => this.update(), this.dropSpeed);
  }

  // Actualizar el estado del juego (llamado en cada tick)
  update() {
    if (this.gameOver || this.isPaused) return;

    // Mover la pieza hacia abajo
    const pieceLocked = this.piece.moveDown();

    if (pieceLocked) {
      this.handlePieceLock();
    }
  }

  // Manejar el bloqueo de una pieza
  handlePieceLock() {
    // Asegurarse de que la pieza se dibuja correctamente antes de bloquearla
    this.piece.draw(this.piece.currentPiece);

    // Bloquear la pieza en el tablero
    this.board.lockPiece(this.piece.currentPiece);

    // Comprobar líneas completas
    const clearedLines = this.board.checkLines();

    if (clearedLines > 0) {
      // Actualizar puntuación, nivel y líneas
      this.lines += clearedLines;
      this.score +=
        clearedLines * clearedLines * CONFIG.POINTS_PER_LINE * this.level;
      this.level = Math.floor(this.lines / CONFIG.LINES_PER_LEVEL) + 1;
      this.dropSpeed = Math.max(
        CONFIG.MIN_DROP_SPEED,
        CONFIG.INITIAL_DROP_SPEED -
          (this.level - 1) * CONFIG.LEVEL_SPEED_DECREASE
      );

      // Actualizar UI
      this.updateUI();

      // Actualizar velocidad de caída
      this.startDropInterval();
    }

    // Generar nueva pieza
    const isGameOver = this.piece.generateNextPiece();

    // Verificar si el juego ha terminado
    if (isGameOver) {
      this.gameOver = true;
      clearInterval(this.dropInterval);
      this.showGameOver();
    }
  }

  // Alternar el estado de pausa
  togglePause() {
    this.isPaused = !this.isPaused;

    if (this.isPaused) {
      // Pausar el juego
      clearInterval(this.dropInterval);
      this.showPauseScreen();
    } else {
      // Continuar el juego
      this.hidePauseScreen();
      this.startDropInterval();
    }
  }

  // Mostrar pantalla de pausa
  showPauseScreen() {
    const pauseEl = document.createElement("div");
    pauseEl.className = "game-over"; // Reutilizamos el estilo
    pauseEl.id = "pause-screen";
    pauseEl.innerHTML = `
        <h2>Juego Pausado</h2>
        <button class="restart-btn">Continuar</button>
      `;
    document.body.appendChild(pauseEl);

    // Agregar evento al botón de continuar
    pauseEl.querySelector(".restart-btn").addEventListener("click", () => {
      this.togglePause();
    });
  }

  // Ocultar pantalla de pausa
  hidePauseScreen() {
    const pauseEl = document.getElementById("pause-screen");
    if (pauseEl) {
      document.body.removeChild(pauseEl);
    }
  }

  // Actualizar elementos de la interfaz
  updateUI() {
    this.scoreEl.textContent = `Puntuación: ${this.score}`;
    this.levelEl.textContent = `Nivel: ${this.level}`;
    this.linesEl.textContent = `Líneas: ${this.lines}`;
  }

  // Mostrar pantalla de Game Over
  showGameOver() {
    const gameOverEl = document.createElement("div");
    gameOverEl.className = "game-over";
    gameOverEl.innerHTML = `
        <h2>Game Over</h2>
        <p>Puntuación: ${this.score}</p>
        <p>Nivel: ${this.level}</p>
        <p>Líneas: ${this.lines}</p>
        <button class="restart-btn">Reiniciar</button>
      `;
    document.body.appendChild(gameOverEl);

    // Agregar evento al botón de reinicio
    gameOverEl.querySelector(".restart-btn").addEventListener("click", () => {
      document.body.removeChild(gameOverEl);
      this.start();
    });
  }
}
