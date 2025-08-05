export class Controls {
  constructor(
    onPlayPause,
    onStep,
    onReset,
    onPatternLoad,
    onSpeedChange,
    onDensityChange
  ) {
    this.onPlayPause = onPlayPause;
    this.onStep = onStep;
    this.onReset = onReset;
    this.onPatternLoad = onPatternLoad;
    this.onSpeedChange = onSpeedChange;
    this.onDensityChange = onDensityChange;

    this.isRunning = false;
    this.initControls();
  }

  initControls() {
    const playPauseBtn = document.getElementById("playPause");
    const stepBtn = document.getElementById("step");
    const resetBtn = document.getElementById("reset");
    const speedSlider = document.getElementById("speed");
    const densitySlider = document.getElementById("density");

    const gliderBtn = document.getElementById("glider");
    const oscillatorBtn = document.getElementById("oscillator");
    const pulsarBtn = document.getElementById("pulsar");
    const spaceshipBtn = document.getElementById("spaceship");

    playPauseBtn.addEventListener("click", () => this.togglePlayPause());
    stepBtn.addEventListener("click", () => this.onStep());
    resetBtn.addEventListener("click", () => this.reset());

    gliderBtn.addEventListener("click", () => this.onPatternLoad("glider"));
    oscillatorBtn.addEventListener("click", () =>
      this.onPatternLoad("oscillator")
    );
    pulsarBtn.addEventListener("click", () => this.onPatternLoad("pulsar"));
    spaceshipBtn.addEventListener("click", () =>
      this.onPatternLoad("spaceship")
    );

    speedSlider.addEventListener("input", (e) => {
      const speed = parseInt(e.target.value);
      this.onSpeedChange(speed);
      document.getElementById("speedValue").textContent = speed;
    });

    densitySlider.addEventListener("input", (e) => {
      const density = parseInt(e.target.value) / 100;
      this.onDensityChange(density);
      document.getElementById("densityValue").textContent = parseInt(
        e.target.value
      );
    });
  }

  togglePlayPause() {
    this.isRunning = !this.isRunning;
    const btn = document.getElementById("playPause");
    btn.textContent = this.isRunning ? "Pause" : "Start";
    document.getElementById("step").disabled = this.isRunning;
    this.onPlayPause(this.isRunning);
  }

  reset() {
    this.isRunning = false;
    document.getElementById("playPause").textContent = "Start";
    document.getElementById("step").disabled = false;
    this.onReset();
  }

  updateStats(generation, livingCount) {
    document.getElementById("generation").textContent = generation;
    document.getElementById("livingCells").textContent = livingCount || 0;
  }
}
