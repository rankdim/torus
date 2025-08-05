export class GameOfLife {
  constructor(gridWidth, gridHeight, density = 0.3) {
    this.GRID_WIDTH = gridWidth;
    this.GRID_HEIGHT = gridHeight;
    this.density = density;
    this.gameState = [];
    this.generation = 0;
    this.initGrid();
  }

  initGrid() {
    this.gameState = [];
    for (let i = 0; i < this.GRID_HEIGHT; i++) {
      this.gameState[i] = [];
      for (let j = 0; j < this.GRID_WIDTH; j++) {
        this.gameState[i][j] = Math.random() < this.density ? 1 : 0;
      }
    }
    this.generation = 0;
  }

  clearGrid() {
    for (let i = 0; i < this.GRID_HEIGHT; i++) {
      for (let j = 0; j < this.GRID_WIDTH; j++) {
        this.gameState[i][j] = 0;
      }
    }
  }

  countNeighbors(grid, x, y) {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (i === 0 && j === 0) continue;

        const nx = (x + i + this.GRID_HEIGHT) % this.GRID_HEIGHT;
        const ny = (y + j + this.GRID_WIDTH) % this.GRID_WIDTH;
        count += grid[nx][ny];
      }
    }
    return count;
  }

  nextGeneration() {
    const newGrid = [];
    for (let i = 0; i < this.GRID_HEIGHT; i++) {
      newGrid[i] = [];
      for (let j = 0; j < this.GRID_WIDTH; j++) {
        const neighbors = this.countNeighbors(this.gameState, i, j);
        const current = this.gameState[i][j];

        if (current === 1) {
          newGrid[i][j] = neighbors === 2 || neighbors === 3 ? 1 : 0;
        } else {
          newGrid[i][j] = neighbors === 3 ? 1 : 0;
        }
      }
    }

    this.gameState = newGrid;
    this.generation++;
  }

  countLivingCells() {
    let count = 0;
    for (let i = 0; i < this.GRID_HEIGHT; i++) {
      for (let j = 0; j < this.GRID_WIDTH; j++) {
        if (this.gameState[i][j] === 1) {
          count++;
        }
      }
    }
    return count;
  }

  placePattern(pattern, startI, startJ) {
    for (let i = 0; i < pattern.length; i++) {
      for (let j = 0; j < pattern[i].length; j++) {
        const gridI = (startI + i) % this.GRID_HEIGHT;
        const gridJ = (startJ + j) % this.GRID_WIDTH;
        this.gameState[gridI][gridJ] = pattern[i][j];
      }
    }
  }
}
