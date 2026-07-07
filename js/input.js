// Keyboard input tracker. Exposes isDown(key).
// Touch buttons also feed the same keys Set via setKey(), so the car logic
// doesn't need to know which source pressed the key.
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

  // Allow external sources (touch buttons, gamepads, AI, etc.) to feed the
  // same input state the keyboard uses.
  setKey(key, isDown) {
    if (isDown) this.keys.add(key);
    else this.keys.delete(key);
  }
}
