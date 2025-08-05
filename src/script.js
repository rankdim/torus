import { GameOfLife } from "./conway.js";
import { Patterns } from "./patterns.js";
import { Visualization3D } from "./visualization3d.js";
import { Visualization2D } from "./visualization2d.js";
import { Controls } from "./controls.js";

class TorusGameOfLife {
  constructor() {
    this.GRID_WIDTH = 80;
    this.GRID_HEIGHT = 40;
    this.TORUS_RADIUS = 8;
    this.TUBE_RADIUS = 4;

    this.isRunning = false;
    this.speed = 300;
    this.density = 0.3;

    this.animationId = null;
    this.lastUpdate = 0;

    this.gameLogic = new GameOfLife(
      this.GRID_WIDTH,
      this.GRID_HEIGHT,
      this.density
    );
    this.visualization3d = new Visualization3D(
      this.GRID_WIDTH,
      this.GRID_HEIGHT,
      this.TORUS_RADIUS,
      this.TUBE_RADIUS
    );
    this.visualization2d = new Visualization2D(
      this.GRID_WIDTH,
      this.GRID_HEIGHT,
      8
    );
    this.controls = new Controls(
      (isRunning) => (this.isRunning = isRunning),
      () => this.step(),
      () => this.reset(),
      (patternName) => this.loadPattern(patternName),
      (speed) => (this.speed = speed),
      (density) => {
        this.density = density;
        this.gameLogic.density = density;
      }
    );

    this.init();
    this.animate();

    // Auto-start the animation
    setTimeout(() => {
      this.controls.togglePlayPause();
    }, 500);
  }

  loadPattern(patternName) {
    Patterns.loadPattern(this.gameLogic, patternName);
    this.updateVisualization();
    this.update2DView();
    this.updateStats();
  }

  init() {
    this.visualization3d.createCellMeshes();
    this.updateVisualization();
    this.update2DView();
    this.updateStats();
  }

  step() {
    this.gameLogic.nextGeneration();
    this.updateVisualization();
    this.update2DView();
    this.updateStats();
  }

  reset() {
    this.isRunning = false;
    this.gameLogic.initGrid();
    this.updateVisualization();
    this.update2DView();
    this.updateStats();
  }

  updateVisualization() {
    this.visualization3d.updateVisualization(this.gameLogic.gameState);
  }

  update2DView() {
    this.visualization2d.update2DView(this.gameLogic.gameState);
  }

  updateStats() {
    const livingCount = this.gameLogic.countLivingCells();
    this.controls.updateStats(this.gameLogic.generation, livingCount);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const now = Date.now();
    if (this.isRunning && now - this.lastUpdate > this.speed) {
      this.step();
      this.lastUpdate = now;
    }

    this.visualization3d.animate();
  }
}

// Start the application
window.addEventListener("load", () => {
  new TorusGameOfLife();
});
