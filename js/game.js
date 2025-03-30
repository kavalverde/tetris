// Clase principal del juego
class Game {
  constructor() {
    // Elementos DOM
    this.tetrisEl = document.getElementById("tetris");
    this.nextPieceEl = document.getElementById("next-piece");
    this.scoreEl = document.getElementById("score");
    this.timerEl = document.getElementById("timer");

    // Estado del juego
    this.score = 0;
    this.level = 1;
    this.lines = 0;
    this.gameOver = false;
    this.isPaused = false;
    this.dropInterval = null;
    this.dropSpeed = CONFIG.INITIAL_DROP_SPEED;

    // Variables para el temporizador
    this.timeRemaining = CONFIG.GAME_TIMER_SECONDS;
    this.timerInterval = null;

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
    this.timeRemaining = CONFIG.GAME_TIMER_SECONDS;

    // Actualizar UI
    this.updateUI();

    // Inicializar el tablero y las piezas
    this.board.init();
    this.piece.init();

    // Iniciar el intervalo de caída
    this.startDropInterval();

    // Iniciar el temporizador
    this.startTimer();
  }

  // Iniciar el temporizador del juego
  startTimer() {
    // Limpiar intervalo anterior si existe
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    // Actualizar el timer en la UI inicialmente
    this.updateTimerUI();

    // Crear nuevo intervalo
    this.timerInterval = setInterval(() => {
      // Solo actualizar si el juego no está pausado
      if (!this.isPaused) {
        this.timeRemaining--;
        this.updateTimerUI();

        // Verificar si se acabó el tiempo
        if (this.timeRemaining <= 0) {
          this.endGameByTimeout();
        }
      }
    }, 1000);
  }

  // Actualizar el temporizador en la UI
  updateTimerUI() {
    // Actualizar el texto
    this.timerEl.textContent = `Tiempo: ${this.timeRemaining}s`;

    // Estilos según el tiempo restante
    this.timerEl.classList.remove("timer-warning", "timer-danger");

    if (this.timeRemaining <= 5) {
      this.timerEl.classList.add("timer-danger");
    } else if (this.timeRemaining <= CONFIG.TIMER_WARNING_THRESHOLD) {
      this.timerEl.classList.add("timer-warning");
    }
  }

  // Finalizar el juego por tiempo
  endGameByTimeout() {
    clearInterval(this.timerInterval);
    clearInterval(this.dropInterval);
    this.gameOver = true;
    this.showGameOver();
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
      clearInterval(this.timerInterval);
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
    this.updateTimerUI();
  }

  // Mostrar pantalla de Game Over
  showGameOver() {
    const gameOverEl = document.createElement("div");
    gameOverEl.className = "game-over";
    gameOverEl.innerHTML = `
        <h2>Fin del juego</h2>
        <br/>
        <p>Puntuación: ${this.score}</p>
         <div class="game-over-buttons">
        <button class="restart-btn">Reiniciar</button>
        <button class="submit-score-btn">Enviar Puntaje</button>
      </div>
      `;
    document.body.appendChild(gameOverEl);

    // Agregar evento al botón de reinicio
    gameOverEl.querySelector(".restart-btn").addEventListener("click", () => {
      document.body.removeChild(gameOverEl);
      this.start();
    });

    gameOverEl
      .querySelector(".submit-score-btn")
      .addEventListener("click", () => {
        document.body.removeChild(gameOverEl);
        this.sendScore(); // Llamar a sendScore sin parámetros
      });
  }

  sendScore() {
    // Construir URL con parámetros de puntaje
    const scoreUrl = `${CONFIG.SCORE_ENDPOINT}?score=${this.score}&lines=${this.lines}&level=${this.level}`;

    // Mostrar mensaje de envío
    const messageEl = document.createElement("div");
    messageEl.className = "score-message";
    messageEl.innerHTML = `<p>Enviando puntaje...</p>`;
    document.body.appendChild(messageEl);

    // Enviar los datos al endpoint
    fetch(scoreUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // No se envía body, los datos están en la URL
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error al enviar el puntaje");
        }
        return response.json();
      })
      .then((data) => {
        // Actualizar mensaje de éxito
        messageEl.innerHTML = `<p>¡Puntaje enviado con éxito!</p>
                            <p>Redireccionando en ${
                              CONFIG.REDIRECT_TIMEOUT / 1000
                            } segundos...</p>`;

        // Redireccionar después del tiempo especificado
        setTimeout(() => {
          window.location.href = CONFIG.REDIRECT_URL;
        }, CONFIG.REDIRECT_TIMEOUT);
      })
      .catch((error) => {
        console.error("Error:", error);
        messageEl.innerHTML = `<p>Error al enviar el puntaje: ${
          error.message
        }</p>
                            <p>Redireccionando en ${
                              CONFIG.REDIRECT_TIMEOUT / 1000
                            } segundos...</p>`;

        // Redireccionar aunque haya un error
        setTimeout(() => {
          window.location.href = CONFIG.REDIRECT_URL;
        }, CONFIG.REDIRECT_TIMEOUT);
      });
  }
}
