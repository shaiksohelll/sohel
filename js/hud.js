// HUD — draws the speed readout and a controls hint on the canvas.
export class HUD {
  constructor() {
    this.font = "bold 22px system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
    this.hintFont = "14px system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
  }

  render(ctx, car) {
    ctx.save();

    // ---- Speed panel (top-left) ----
    const panelX = 16;
    const panelY = 16;
    const panelW = 200;
    const panelH = 56;

    ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
    ctx.fillRect(panelX, panelY, panelW, panelH);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    ctx.lineWidth = 1;
    ctx.strokeRect(panelX + 0.5, panelY + 0.5, panelW - 1, panelH - 1);

    ctx.fillStyle = "#fff";
    ctx.font = "12px system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("SPEED", panelX + 12, panelY + 8);

    ctx.fillStyle = "#f1c40f";
    ctx.font = this.font;
    const speed = Math.round(car.getSpeedKmh());
    ctx.fillText(`${speed} km/h`, panelX + 12, panelY + 22);

    // ---- Controls hint (bottom-left) ----
    ctx.font = this.hintFont;
    ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
    const hintY = ctx.canvas.height - 50;
    ctx.fillText("Controls:  W / ↑  accelerate", 16, hintY);
    ctx.fillText("              S / ↓  brake / reverse", 16, hintY + 18);
    ctx.fillText("              A / ←  turn left      D / →  turn right", 16, hintY + 36);

    ctx.restore();
  }
}
