// Definición de las piezas y sus propiedades
const TETRIMINOS = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    className: "tetrimino-I",
    imgPath: "./assets/tetrimino1.jpg",
  },
  J: {
    shape: [
      [0, 1, 0],
      [0, 1, 0],
      [1, 1, 0],
    ],
    className: "tetrimino-J",
    imgPath: "./assets/tetrimino1.jpg",
  },
  L: {
    shape: [
      [0, 1, 0],
      [0, 1, 0],
      [0, 1, 1],
    ],
    className: "tetrimino-L",
    imgPath: "./assets/tetrimino1.jpg",
  },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    className: "tetrimino-O",
    imgPath: "./assets/tetrimino2.jpg",
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    className: "tetrimino-S",
    imgPath: "./assets/tetrimino2.jpg",
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    className: "tetrimino-T",
    imgPath: "./assets/tetrimino2.jpg",
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    className: "tetrimino-Z",
    imgPath: "./assets/tetrimino1.jpg",
  },
};

// Función para obtener una pieza aleatoria
function getRandomPiece() {
  const pieces = Object.keys(TETRIMINOS);
  const randomType = pieces[Math.floor(Math.random() * pieces.length)];
  const tetriminoData = TETRIMINOS[randomType];

  return {
    shape: [...tetriminoData.shape], // Copia para evitar modificar el original
    className: tetriminoData.className,
    row: 0,
    col:
      Math.floor(CONFIG.COLS / 2) -
      Math.floor(tetriminoData.shape[0].length / 2),
    type: randomType,
  };
}
