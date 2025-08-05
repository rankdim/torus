export class Visualization2D {
  constructor(gridWidth, gridHeight, cellSize = 8) {
    this.GRID_WIDTH = gridWidth;
    this.GRID_HEIGHT = gridHeight;
    this.cellSize2d = cellSize;

    this.canvas2d = document.getElementById("canvas2d");
    this.ctx2d = this.canvas2d.getContext("2d");
  }

  update2DView(gameState) {
    this.ctx2d.fillStyle = "#111111";
    this.ctx2d.fillRect(0, 0, this.canvas2d.width, this.canvas2d.height);

    this.ctx2d.strokeStyle = "#333333";
    this.ctx2d.lineWidth = 1;

    for (let j = 0; j <= this.GRID_WIDTH; j++) {
      const x = j * this.cellSize2d;
      this.ctx2d.beginPath();
      this.ctx2d.moveTo(x, 0);
      this.ctx2d.lineTo(x, this.GRID_HEIGHT * this.cellSize2d);
      this.ctx2d.stroke();
    }

    for (let i = 0; i <= this.GRID_HEIGHT; i++) {
      const y = i * this.cellSize2d;
      this.ctx2d.beginPath();
      this.ctx2d.moveTo(0, y);
      this.ctx2d.lineTo(this.GRID_WIDTH * this.cellSize2d, y);
      this.ctx2d.stroke();
    }

    for (let i = 0; i < this.GRID_HEIGHT; i++) {
      for (let j = 0; j < this.GRID_WIDTH; j++) {
        const x = j * this.cellSize2d;
        const y = i * this.cellSize2d;

        if (gameState[i][j] === 1) {
          this.ctx2d.fillStyle = "#00ff88";
          this.ctx2d.fillRect(
            x + 1,
            y + 1,
            this.cellSize2d - 2,
            this.cellSize2d - 2
          );
        } else {
          this.ctx2d.fillStyle = "#222222";
          this.ctx2d.fillRect(
            x + 1,
            y + 1,
            this.cellSize2d - 2,
            this.cellSize2d - 2
          );
        }
      }
    }

    this.ctx2d.strokeStyle = "#ffaa00";
    this.ctx2d.lineWidth = 2;
    this.ctx2d.setLineDash([5, 5]);

    this.ctx2d.beginPath();
    this.ctx2d.moveTo(0, 0);
    this.ctx2d.lineTo(this.GRID_WIDTH * this.cellSize2d, 0);
    this.ctx2d.stroke();

    this.ctx2d.beginPath();
    this.ctx2d.moveTo(0, this.GRID_HEIGHT * this.cellSize2d);
    this.ctx2d.lineTo(
      this.GRID_WIDTH * this.cellSize2d,
      this.GRID_HEIGHT * this.cellSize2d
    );
    this.ctx2d.stroke();

    this.ctx2d.beginPath();
    this.ctx2d.moveTo(0, 0);
    this.ctx2d.lineTo(0, this.GRID_HEIGHT * this.cellSize2d);
    this.ctx2d.stroke();

    this.ctx2d.beginPath();
    this.ctx2d.moveTo(this.GRID_WIDTH * this.cellSize2d, 0);
    this.ctx2d.lineTo(
      this.GRID_WIDTH * this.cellSize2d,
      this.GRID_HEIGHT * this.cellSize2d
    );
    this.ctx2d.stroke();

    this.ctx2d.setLineDash([]);
  }
}
