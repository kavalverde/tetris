// Clase para manejar los controles del juego
class Controls {
  constructor(game) {
    this.game = game;
    this.tetrisEl = document.getElementById("tetris");
    this.controlsEnabled = true;

    // Referencias a los botones de control
    this.leftBtn = document.getElementById("left-btn");
    this.rightBtn = document.getElementById("right-btn");
    this.downBtn = document.getElementById("down-btn");
    this.rotateBtn = document.getElementById("rotate-btn");
    this.dropBtn = document.getElementById("drop-btn");

    this.setupControls();
  }

  // Configurar todos los controles
  setupControls() {
    this.setupKeyboardControls();
    this.setupButtonControls();

    // Rotación del dispositivo
    window.addEventListener("orientationchange", () => {
      // Ajustar la disposición del juego en caso de rotación
      setTimeout(() => {
        this.adjustLayoutOnRotation();
      }, 300); // Pequeño retraso para que la pantalla se reajuste primero
    });
  }

  // Configurar controles de teclado
  setupKeyboardControls() {
    document.addEventListener("keydown", (e) => {
      if (this.game.gameOver || !this.controlsEnabled) return;

      switch (e.key) {
        case "ArrowLeft":
          this.game.piece.moveLeft();
          break;
        case "ArrowRight":
          this.game.piece.moveRight();
          break;
        case "ArrowDown":
          if (this.game.piece.moveDown()) {
            // Si moveDown devuelve true, significa que la pieza se ha bloqueado
            this.game.handlePieceLock();
          }
          break;
        case "ArrowUp":
          this.game.piece.rotate();
          break;
        case " ": // Barra espaciadora
          // Hard drop
          if (this.game.piece.hardDrop()) {
            this.game.handlePieceLock();
          }
          break;
        case "p": // Pausar juego
        case "P":
          this.game.togglePause();
          break;
      }
    });
  }

  // Configurar controles de botones táctiles
  setupButtonControls() {
    // Solo configurar si los botones existen
    if (this.leftBtn) {
      this.leftBtn.addEventListener("click", () => {
        if (this.game.gameOver || this.game.isPaused || !this.controlsEnabled)
          return;
        this.game.piece.moveLeft();
        this.vibrate(CONFIG.VIBRATION_SOFT);
      });
    }

    if (this.rightBtn) {
      this.rightBtn.addEventListener("click", () => {
        if (this.game.gameOver || this.game.isPaused || !this.controlsEnabled)
          return;
        this.game.piece.moveRight();
        this.vibrate(CONFIG.VIBRATION_SOFT);
      });
    }

    if (this.downBtn) {
      this.downBtn.addEventListener("click", () => {
        if (this.game.gameOver || this.game.isPaused || !this.controlsEnabled)
          return;
        if (this.game.piece.moveDown()) {
          this.game.handlePieceLock();
        }
        this.vibrate(CONFIG.VIBRATION_SOFT);
      });

      // Para permitir mantener pulsado el botón para mover rápido hacia abajo
      let downInterval;
      this.downBtn.addEventListener("touchstart", (e) => {
        if (this.game.gameOver || this.game.isPaused || !this.controlsEnabled)
          return;
        e.preventDefault(); // Prevenir comportamiento por defecto

        // Primer movimiento
        if (this.game.piece.moveDown()) {
          this.game.handlePieceLock();
        }

        // Movimientos continuos
        downInterval = setInterval(() => {
          if (this.game.piece.moveDown()) {
            this.game.handlePieceLock();
            clearInterval(downInterval);
          }
        }, 100); // Más rápido que el intervalo normal para mejor respuesta

        this.vibrate(CONFIG.VIBRATION_SOFT);
      });

      // Detener el movimiento cuando se suelta el botón
      this.downBtn.addEventListener("touchend", () => {
        clearInterval(downInterval);
      });

      this.downBtn.addEventListener("touchcancel", () => {
        clearInterval(downInterval);
      });
    }

    if (this.rotateBtn) {
      this.rotateBtn.addEventListener("click", () => {
        if (this.game.gameOver || this.game.isPaused || !this.controlsEnabled)
          return;
        this.game.piece.rotate();
        this.vibrate(CONFIG.VIBRATION_MEDIUM);
      });
    }

    if (this.dropBtn) {
      this.dropBtn.addEventListener("click", () => {
        if (this.game.gameOver || this.game.isPaused || !this.controlsEnabled)
          return;
        if (this.game.piece.hardDrop()) {
          this.game.handlePieceLock();
        }
        this.vibrate(CONFIG.VIBRATION_STRONG);
      });
    }

    // Agregar evento para pausar juego (doble toque en el tablero)
    let lastTapTime = 0;
    this.tetrisEl.addEventListener("click", () => {
      const currentTime = Date.now();
      const timeSinceLastTap = currentTime - lastTapTime;

      if (timeSinceLastTap < 300) {
        // Doble toque rápido
        this.game.togglePause();
      }

      lastTapTime = currentTime;
    });
  }

  // Ajustar el diseño cuando el dispositivo rota
  adjustLayoutOnRotation() {
    const orientation = window.orientation;
    if (orientation === 90 || orientation === -90) {
      // Modo horizontal
      document.body.classList.add("landscape");
    } else {
      // Modo vertical
      document.body.classList.remove("landscape");
    }
  }

  // Método para deshabilitar controles (útil al pausar)
  disableControls() {
    this.controlsEnabled = false;
  }

  // Método para habilitar controles
  enableControls() {
    this.controlsEnabled = true;
  }

  // Método para el feedback háptico (vibración) - si está disponible
  vibrate(duration = 20) {
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(duration);
    }
  }

  // Método para generar feedback cuando una pieza encaja perfectamente
  provideFeedback() {
    // Visual
    this.tetrisEl.classList.add("perfect-fit");
    setTimeout(() => {
      this.tetrisEl.classList.remove("perfect-fit");
    }, 300);

    // Háptico
    this.vibrate(50);
  }
}
