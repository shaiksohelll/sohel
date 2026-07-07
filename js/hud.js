// HUD — draws the speed readout and a small keyboard hint on the canvas.
export class HUD {
  constructor() {
    this.font = "bold 22px system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
  }

  render(ctx, car) {
    ctx.save();

    // ---- Speed panel (top-left) ----
    const px = 16;
    const py = 16;
    const pw = 200;
    const ph = 56;

    ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
    ctx.fillRect(px, py, pw, ph);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    ctx.lineWidth = 1;
    ctx.strokeRect(px + 0.5, py + 0.5, pw - 1, ph - 1);

    ctx.fillStyle = "#fff";
    ctx.font = "12px system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("SPEED", px + 12, py + 8);

    ctx.fillStyle = "#f1c40f";
    ctx.font = this.font;
    const speed = Math.round(car.getSpeedKmh());
    ctx.fillText(`${speed} km/h`, px + 12, py + 22);

    // ---- Keyboard hint (top-right, subtle) ----
    ctx.font = "12px system-ui, sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
    ctx.textAlign = "right";
    ctx.textBaseline = "top";
    ctx.fillText("Keyboard: WASD / Arrow keys", ctx.canvas.width - 16, 22);

    ctx.restore();
  }
}
