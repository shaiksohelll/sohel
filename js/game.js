// Game class — owns the canvas, the main loop, and orchestrates update/render.
import { Input } from "./input.js";
import { Car } from "./car.js";
import { HUD } from "./hud.js";

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.input = new Input();
    this.car = new Car(canvas.width / 2, canvas.height / 2);
    this.hud = new HUD();
    this.lastTime = 0;
  }

  start() {
    this.lastTime = performance.now();
    requestAnimationFrame(this.loop);
  }

  loop = (timestamp) => {
    // dt in seconds, clamped to avoid huge jumps after tab switches.
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1);
    this.lastTime = timestamp;

    this.update(dt);
    this.render();

    requestAnimationFrame(this.loop);
  };

  update(dt) {
    this.car.update(dt, this.input);
  }

  render() {
    const { ctx, canvas } = this;

    // Solid background (grass)
    ctx.fillStyle = "#2d4a2d";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    this.car.render(ctx);
    this.hud.render(ctx, this.car);
  }
}
