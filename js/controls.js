// Clase para manejar los controles del juego
class Controls {
  constructor(game) {
    this.game = game;
    this.tetrisEl = document.getElementById("tetris");
    this.leftBtn = document.getElementById("left");
    this.rightBtn = document.getElementById("right");
    this.downBtn = document.getElementById("down");
    this.rotateBtn = document.getElementById("rotate");

    // Variables para gestión táctil
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchStartTime = 0;
    this.lastTapTime = 0;
    this.isTouching = false;
    this.touchTimeout = null;
    this.hasMoved = false; // Bandera para indicar si el dedo se ha movido durante el toque
    this.longPressThreshold = 500; // Tiempo en ms para considerar un toque largo

    // Crear indicador visual para gestos
    this.swipeIndicator = document.createElement("div");
    this.swipeIndicator.className = "swipe-indicator";
    this.tetrisEl.appendChild(this.swipeIndicator);

    // Indicador visual para rotación (toque largo)
    this.rotateIndicator = document.createElement("div");
    this.rotateIndicator.className = "rotate-indicator";
    this.rotateIndicator.style.display = "none";
    this.rotateIndicator.innerHTML = "↻";
    this.tetrisEl.appendChild(this.rotateIndicator);

    this.setupControls();
  }

  // Configurar todos los controles
  setupControls() {
    this.setupKeyboardControls();
    this.setupButtonControls();
    this.setupTouchControls();
  }

  // Configurar controles de teclado
  setupKeyboardControls() {
    document.addEventListener("keydown", (e) => {
      if (this.game.gameOver) return;

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

  // Configurar controles de botones
  setupButtonControls() {
    // Controles táctiles de botones
    this.leftBtn.addEventListener("click", () => {
      if (!this.game.gameOver && !this.game.isPaused)
        this.game.piece.moveLeft();
    });

    this.rightBtn.addEventListener("click", () => {
      if (!this.game.gameOver && !this.game.isPaused)
        this.game.piece.moveRight();
    });

    this.downBtn.addEventListener("click", () => {
      if (!this.game.gameOver && !this.game.isPaused) {
        if (this.game.piece.moveDown()) {
          // Si moveDown devuelve true, significa que la pieza se ha bloqueado
          this.game.handlePieceLock();
        }
      }
    });

    this.rotateBtn.addEventListener("click", () => {
      if (!this.game.gameOver && !this.game.isPaused) this.game.piece.rotate();
    });

    // Prevenir comportamiento de desplazamiento para los botones en móvil
    const buttons = document.querySelectorAll(".control-btn");
    buttons.forEach((button) => {
      button.addEventListener("touchstart", (e) => {
        e.preventDefault();
        button.click();
      });
    });
  }

  // Configurar controles táctiles en el tablero
  setupTouchControls() {
    // Eventos táctiles en el tablero
    this.tetrisEl.addEventListener("touchstart", (e) => {
      if (this.game.gameOver || this.game.isPaused) return;

      const touch = e.touches[0];
      this.touchStartX = touch.clientX;
      this.touchStartY = touch.clientY;
      this.touchStartTime = Date.now();
      this.isTouching = true;
      this.hasMoved = false;

      // Mostrar indicador visual en la posición del toque
      const rect = this.tetrisEl.getBoundingClientRect();
      this.swipeIndicator.style.left = `${touch.clientX - rect.left - 25}px`;
      this.swipeIndicator.style.top = `${touch.clientY - rect.top - 25}px`;
      this.swipeIndicator.style.width = "50px";
      this.swipeIndicator.style.height = "50px";
      this.swipeIndicator.classList.add("active");

      // Configurar timeout para toque largo (rotación)
      this.touchTimeout = setTimeout(() => {
        if (this.isTouching && !this.hasMoved) {
          // Solo rotar si el dedo no se ha movido significativamente
          this.game.piece.rotate();
          this.vibrate(50); // Feedback háptico

          // Mostrar indicador visual de rotación
          this.rotateIndicator.style.display = "flex";
          this.rotateIndicator.style.left = `${
            touch.clientX - rect.left - 30
          }px`;
          this.rotateIndicator.style.top = `${touch.clientY - rect.top - 30}px`;

          // Ocultar el indicador después de un tiempo
          setTimeout(() => {
            this.rotateIndicator.style.display = "none";
          }, 300);
        }
      }, this.longPressThreshold);
    });

    this.tetrisEl.addEventListener("touchmove", (e) => {
      if (this.game.gameOver || !this.isTouching || this.game.isPaused) return;

      const touch = e.touches[0];
      const currentX = touch.clientX;
      const currentY = touch.clientY;

      const deltaX = currentX - this.touchStartX;
      const deltaY = currentY - this.touchStartY;
      const threshold = CONFIG.SWIPE_THRESHOLD || 30;

      // Verificar si el movimiento es suficiente para considerarlo un swipe
      if (Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold) {
        this.hasMoved = true; // Marcar que ha habido movimiento significativo

        // Cancelar el timeout de rotación si el usuario está haciendo swipe
        if (this.touchTimeout) {
          clearTimeout(this.touchTimeout);
          this.touchTimeout = null;
        }
      }

      // Determinar dirección dominante del movimiento
      if (Math.abs(deltaX) > threshold && Math.abs(deltaX) > Math.abs(deltaY)) {
        // Movimiento horizontal
        if (deltaX > 0) {
          // Derecha
          this.game.piece.moveRight();
          this.touchStartX = currentX; // Reset para permitir múltiples movimientos
        } else {
          // Izquierda
          this.game.piece.moveLeft();
          this.touchStartX = currentX; // Reset para permitir múltiples movimientos
        }

        // Actualizar posición del indicador visual
        const rect = this.tetrisEl.getBoundingClientRect();
        this.swipeIndicator.style.left = `${touch.clientX - rect.left - 25}px`;
      } else if (
        Math.abs(deltaY) > threshold &&
        Math.abs(deltaY) > Math.abs(deltaX)
      ) {
        // Movimiento vertical (solo hacia abajo)
        if (deltaY > 0) {
          // Abajo (mover más rápido)
          if (this.game.piece.moveDown()) {
            // Si moveDown devuelve true, significa que la pieza se ha bloqueado
            this.game.handlePieceLock();
          }
          this.touchStartY = currentY; // Reset para permitir múltiples movimientos

          // Actualizar posición del indicador visual
          const rect = this.tetrisEl.getBoundingClientRect();
          this.swipeIndicator.style.top = `${touch.clientY - rect.top - 25}px`;
        }
      }
    });

    this.tetrisEl.addEventListener("touchend", (e) => {
      if (this.game.gameOver || this.game.isPaused) return;

      // Limpiar el timeout de rotación
      if (this.touchTimeout) {
        clearTimeout(this.touchTimeout);
        this.touchTimeout = null;
      }

      const touchDuration = Date.now() - this.touchStartTime;
      const doubleTapThreshold = CONFIG.DOUBLE_TAP_DELAY || 300;

      // Solo procesar el doble tap si fue un toque rápido y no hubo movimiento significativo
      if (touchDuration < 200 && !this.hasMoved) {
        const currentTime = Date.now();
        const timeSinceLastTap = currentTime - this.lastTapTime;

        if (timeSinceLastTap < doubleTapThreshold) {
          // Doble tap: hard drop
          if (this.game.piece.hardDrop()) {
            this.game.handlePieceLock();
            this.vibrate(100); // Feedback háptico más fuerte para hard drop
          }
        }

        this.lastTapTime = currentTime;
      }

      // Ocultar el indicador visual
      this.swipeIndicator.classList.remove("active");
      this.isTouching = false;
    });

    // Asegurarse de que no perdemos el estado de toque
    this.tetrisEl.addEventListener("touchcancel", () => {
      if (this.touchTimeout) {
        clearTimeout(this.touchTimeout);
        this.touchTimeout = null;
      }
      this.swipeIndicator.classList.remove("active");
      this.rotateIndicator.style.display = "none";
      this.isTouching = false;
    });

    // Detector de gestos más avanzados (pinch para pausar)
    let touchDistance = 0;
    this.tetrisEl.addEventListener("touchstart", (e) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        touchDistance = Math.sqrt(dx * dx + dy * dy);
      }
    });

    this.tetrisEl.addEventListener("touchmove", (e) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const currentDistance = Math.sqrt(dx * dx + dy * dy);

        // Detectar gesto de pinch (pellizco con dos dedos)
        const pinchThreshold = 50;
        if (Math.abs(currentDistance - touchDistance) > pinchThreshold) {
          this.game.togglePause();
          touchDistance = currentDistance; // Resetear para evitar múltiples activaciones
        }
      }
    });

    // Rotación del dispositivo
    window.addEventListener("orientationchange", () => {
      // Ajustar la disposición del juego en caso de rotación
      setTimeout(() => {
        this.adjustLayoutOnRotation();
      }, 300); // Pequeño retraso para que la pantalla se reajuste primero
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
