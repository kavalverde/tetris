// Configuración global del juego
const CONFIG = {
  // Dimensiones del tablero
  ROWS: 20,
  COLS: 10,
  BLOCK_SIZE: 30,
  EMPTY: "empty",

  // Configuración del juego
  INITIAL_DROP_SPEED: 1000,
  LEVEL_SPEED_DECREASE: 100,
  MIN_DROP_SPEED: 100,

  // Configuración del temporizador
  GAME_TIMER_SECONDS: 60, // Tiempo de juego en segundos
  TIMER_WARNING_THRESHOLD: 10, // Segundos restantes para mostrar advertencia visual

  // Puntuación
  POINTS_PER_LINE: 100,
  LINES_PER_LEVEL: 10,

  // Interacción táctil
  SWIPE_THRESHOLD: 30, // Distancia mínima para considerar un swipe
  TAP_DURATION: 200, // Tiempo máximo para considerar un toque como tap
  DOUBLE_TAP_DELAY: 300, // Tiempo máximo entre dos toques para considerarlo doble tap
  ROTATION_PRESS_DURATION: 100, // Tiempo en ms que hay que mantener pulsado para rotar
  PINCH_THRESHOLD: 50, // Umbral para detectar gestos de pinch
  VIBRATION_SOFT: 20, // Vibración suave (ms)
  VIBRATION_MEDIUM: 50, // Vibración media (ms)
  VIBRATION_STRONG: 100, // Vibración fuerte (ms)

  // Configuración para envío de puntaje y redirección
  SCORE_ENDPOINT: "https://api.example.com/scores", // Endpoint para enviar puntajes
  REDIRECT_URL: "https://example.com/leaderboard", // URL de redirección después de enviar el puntaje
  REDIRECT_TIMEOUT: 3000, // Tiempo en ms antes de redireccionar
};
