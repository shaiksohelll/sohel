// TouchControls — wires on-screen buttons to the Input class.
// Pointer events handle both touch and mouse, so the same code works on
// mobile and on a desktop browser.
export class TouchControls {
  constructor(input) {
    this.input = input;
    this.root = document.getElementById("touch-controls");
    if (!this.root) return;

    const buttons = this.root.querySelectorAll(".touch-btn");
    buttons.forEach((btn) => {
      const key = btn.dataset.key;
      if (!key) return;

      const press = (e) => {
        e.preventDefault();
        this.input.setKey(key, true);
        btn.classList.add("pressed");
      };
      const release = (e) => {
        if (e && e.preventDefault) e.preventDefault();
        this.input.setKey(key, false);
        btn.classList.remove("pressed");
      };

      // pointerdown/up handle both touch and mouse uniformly.
      btn.addEventListener("pointerdown", press);
      btn.addEventListener("pointerup", release);
      btn.addEventListener("pointercancel", release);
      btn.addEventListener("pointerleave", release);

      // Suppress the long-press context menu on iOS Safari.
      btn.addEventListener("contextmenu", (e) => e.preventDefault());
    });
  }
}
