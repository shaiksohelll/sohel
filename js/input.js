// Keyboard input tracker. Exposes isDown(key).
// Tracks the raw event.key strings (e.g. "w", "ArrowUp").
export class Input {
  constructor() {
    this.keys = new Set();

    window.addEventListener("keydown", (e) => {
      this.keys.add(e.key);
      // Prevent page scroll on arrow keys / space.
      if (
        e.key === "ArrowUp" ||
        e.key === "ArrowDown" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight" ||
        e.key === " "
      ) {
        e.preventDefault();
      }
    });

    window.addEventListener("keyup", (e) => {
      this.keys.delete(e.key);
    });

    // Clear all keys when window loses focus (prevents stuck keys).
    window.addEventListener("blur", () => this.keys.clear());
  }

  isDown(key) {
    return this.keys.has(key);
  }
}
