// Punto de entrada de la aplicación
document.addEventListener("DOMContentLoaded", () => {
  // Prevenir gestos del navegador que puedan interferir con el juego
  document.addEventListener(
    "touchmove",
    function (e) {
      const tetrisEl = document.getElementById("tetris");
      // Solo prevenir el comportamiento por defecto si el toque está dentro del tablero
      if (e.target.closest("#tetris")) {
        e.preventDefault();
      }
    },
    { passive: false }
  );

  // Crear e iniciar el juego
  const game = new Game();
  game.start();
});
