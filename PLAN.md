# 2D Car Racing Game — Project Plan (v1 / MVP)

A browser-based 2D top-down car racing game built as a learning project. This document outlines what we will build, how it's organized, and the order we'll build it in.

---

## 1. Tech Stack

### Choice: **Vanilla JavaScript + HTML5 Canvas**

| Layer | Tool | Why |
|---|---|---|
| Structure | HTML5 | One file, no build step, opens in any browser. |
| Rendering | HTML5 Canvas (2D context) | Built-in, perfect for 2D games, gives you direct pixel/sprite control. |
| Logic | Vanilla JavaScript (ES6+) | Forces you to understand the game loop, state, and OOP basics — exactly what you're learning. |
| Styling | Plain CSS | Just for page layout + HUD styling. |
| Dev tools | A modern browser + VS Code + Live Server extension | Zero install, instant feedback. |

### Why **not** a game engine (Phaser, PixiJS, Kaboom)?

- **You said you're learning MERN + DSA.** This project is a chance to strengthen core JS skills (classes, the event loop, data structures for collisions) — engines hide that behind abstractions.
- **Overkill for v1.** Engines shine when you have scenes, asset pipelines, physics, and many entities. We have one car and one track.
- **No build pipeline.** No `npm install`, no bundler, no transpiler. You open `index.html` and it runs.
- **Easy to share.** Drop the folder on any machine and it just works.

> Rule of thumb: pick up a game engine when vanilla starts *hurting* your productivity, not before.

### What we will explicitly avoid adding in v1

- No frameworks (React, Vue, jQuery).
- No TypeScript (add it later as a learning upgrade).
- No build tools (Vite/Webpack) for v1.
- No external libraries, assets, or CDNs.

---

## 2. Core Features for v1 (MVP)

### Must-have (MVP)

1. **Single player, one car** rendered as a top-down sprite (colored rectangle is fine to start).
2. **Keyboard controls**: Arrow keys **and** WASD both supported.
3. **One simple track**: a closed loop (we'll start with an oval, then maybe a rounded rectangle with an inner island).
4. **Track edges / walls**: visible boundaries, off-track area is a slower surface (grass) or a hard wall.
5. **Collision**: car cannot drive through walls; bumps slow it down or stop it.
6. **Lap system**:
   - Start/finish line defined.
   - Must pass through checkpoints in order (prevents shortcut cheating).
   - Lap counter increments on valid lap.
7. **Lap timer**:
   - Current lap time.
   - Best lap time.
   - Total session time.
8. **HUD** displaying: current lap, best lap, current time.
9. **Game states**: a simple "Press SPACE to start" → "Racing" → "Press R to reset" flow.

### Stretch goals (only after MVP works)

- 🤖 A simple AI opponent car that follows waypoints around the track.
- 🚧 Static obstacles (cones, barriers) on the track.
- 🏁 Multiple tracks selectable from a menu.
- 🔊 Sound effects (engine hum, collision thud).
- 📈 Ghost car (replays your best lap).
- 📱 Basic touch controls for mobile.

If MVP isn't fun and stable, **do not** add stretch goals yet.

---

## 3. File / Folder Structure

Keep it minimal. No nested module maze.

```
/workspace
├── index.html          # Entry point. Contains <canvas> and loads main.js.
├── style.css           # Page layout, HUD styling, fonts, colors.
├── PLAN.md             # This document.
└── js/
    ├── main.js         # Boots the game, kicks off the loop.
    ├── game.js         # Game class: state, loop, update/render orchestration.
    ├── input.js        # KeyboardInput class: tracks key state, exposes helpers.
    ├── car.js          # Car class: position, velocity, sprite, update logic.
    ├── track.js        # Track class: shape, boundaries, checkpoints, drawing.
    ├── collision.js    # Pure functions: AABB, point-in-polygon, etc.
    └── hud.js          # Draws lap/time text on the canvas.
```

### What each file does

- **`index.html`** — Single `<canvas id="game">` element, links `style.css` and `js/main.js`. Nothing fancy.
- **`style.css`** — Centers the canvas on the page, sets background, styles any HTML overlay (start screen).
- **`js/main.js`** — Tiny entry point. Creates a `Game` instance and calls `game.start()`.
- **`js/game.js`** — The heart. Owns the game state (`'idle' | 'racing' | 'paused'`), the `requestAnimationFrame` loop, and tells `Car` and `Track` to update/render each frame.
- **`js/input.js`** — Wraps `keydown`/`keyup` events. Exposes `input.isDown('ArrowUp')` or `input.isDown('w')` so game logic doesn't touch raw events.
- **`js/car.js`** — Car physics: position, velocity, angle, acceleration, friction, turning. Knows how to draw itself.
- **`js/track.js`** — Defines the track shape (array of points or a closed polygon), draws it, and defines the start/finish line + checkpoints.
- **`js/collision.js`** — Reusable geometry helpers. Keeps car/track code clean.
- **`js/hud.js`** — Pure rendering: `hud.draw(ctx, { lap, bestTime, currentTime })`.

> You can collapse this to **3 files** (`index.html`, `game.js`, `car.js`) if you want even less ceremony. The structure above is a *target* — we'll refactor toward it as features land.

---

## 4. Game Loop Architecture

The classic pattern: **input → update → render → repeat**, synced to the browser's repaint rate.

```
┌──────────────────────────────────────────────┐
│  requestAnimationFrame(loop)                 │
│                                              │
│  while (accumulator >= FIXED_DT) {           │
│      input.read();                           │
│      car.update(FIXED_DT);                   │
│      track.checkCollisions(car);             │
│      game.updateTimers(FIXED_DT);            │
│      accumulator -= FIXED_DT;                │
│  }                                           │
│                                              │
│  ctx.clearRect(0, 0, w, h);                  │
│  track.render(ctx);                          │
│  car.render(ctx);                            │
│  hud.render(ctx);                            │
└──────────────────────────────────────────────┘
```

### Key ideas

- **Fixed timestep updates** (e.g. `FIXED_DT = 1/60` second). Physics behaves the same on a 60Hz monitor and a 144Hz monitor. Use an **accumulator** to batch updates between frames.
- **Variable-rate rendering** is fine. We just draw whatever the latest state is.
- **Input** is read once per update step into a snapshot (a `Set` of pressed keys), so a key press isn't missed between physics ticks.
- **State machine** for the game:
  - `IDLE` → press SPACE → `RACING`
  - `RACING` → press R → `IDLE` (reset)
  - `RACING` → press P → `PAUSED` ↔ `RACING`
- **Coordinate system**: Canvas origin `(0, 0)` is top-left. We'll keep "up = forward" by rotating the car sprite based on its `angle`. Track the world in screen coordinates — no scrolling camera in v1.

### Why fixed timestep?

If your physics step depends on real elapsed time, a slow frame makes the car tunnel through walls. A fixed step + accumulator is the standard fix and a great thing to learn early.

---

## 5. Step-by-Step Build Order

Each step is a **testable milestone**. Stop and play with it before moving on.

### Step 0 — Project setup *(15 min)*
- Create `index.html` with a `<canvas width="800" height="600">`.
- Link `style.css`, `js/main.js`.
- Draw a solid background color on the canvas in `main.js`.
- **Test:** Open in browser, see a colored rectangle. ✅

### Step 1 — Static car on screen *(20 min)*
- Create `js/car.js` with a `Car` class.
- Car has `x, y, width, height, color`. Render it as a rectangle.
- **Test:** Car appears in the center of the canvas. ✅

### Step 2 — Keyboard input + movement *(30 min)*
- Create `js/input.js`. Listen for `keydown`/`keyup`.
- Add `vx, vy` (velocity) to the car.
- Arrow keys / WASD set acceleration. Friction slows the car down when no key is pressed.
- Cap maximum speed.
- **Test:** Car drives around smoothly, slides to a stop. ✅

### Step 3 — Car rotation + steering *(40 min)*
- Replace `vx, vy` with `angle` + `speed`.
- Up/W = accelerate forward, Down/S = brake/reverse, Left/A & Right/D = turn.
- Car rectangle is drawn rotated to match `angle`.
- **Test:** Car drives and steers like a top-down car. ✅

### Step 4 — Simple track *(30 min)*
- Create `js/track.js`.
- Hard-code an oval track: outer boundary, inner boundary, track surface between them.
- Render grass (green) off-track, asphalt (gray) on-track.
- **Test:** You can see a racetrack. ✅

### Step 5 — Wall collision *(45 min)*
- Add a "car is on track?" check (point-in-polygon or a simpler heuristic).
- If off-track, either:
  - (a) **Hard wall**: stop the car at the boundary.
  - (b) **Grass penalty**: apply heavy friction off-track.
- We'll go with **(b) grass penalty** for v1 — feels better and is easier to implement.
- **Test:** Driving onto grass slows you down; can't escape the track. ✅

### Step 6 — Start/finish line + checkpoints *(45 min)*
- Define the start/finish line as a line segment on the track.
- Define 2–3 invisible checkpoints around the loop.
- Car must cross them in order; on a full ordered loop, increment the lap counter.
- Reset checkpoint state if the car resets.
- **Test:** Drive one full lap, counter goes from 0 → 1. Driving backward doesn't fake a lap. ✅

### Step 7 — Lap timer + HUD *(30 min)*
- Create `js/hud.js`.
- Use `performance.now()` for accurate timing.
- Display: current lap time, best lap time, lap count.
- Best lap updates automatically when a faster lap completes.
- **Test:** Timer counts up while driving; best lap persists. ✅

### Step 8 — Game states + reset *(30 min)*
- Add `IDLE` screen: "Press SPACE to start" overlay drawn on canvas.
- `R` key resets position, lap counter, timer.
- `P` key pauses.
- **Test:** Clean start/reset/pause flow. ✅

### Step 9 — Polish *(optional, ~1 hr)*
- Better car sprite (a colored rectangle with a small "nose" so direction is visible).
- Skid marks behind the car when turning hard.
- Simple start countdown ("3, 2, 1, GO").
- Background grid for sense of speed.

### Step 10 — Stretch: AI opponent *(only after Step 9)*
- Define a list of waypoints around the track center line.
- AI car steers toward the next waypoint, accelerates when aligned, brakes when sharp turn ahead.
- Render as a different colored car.
- **Test:** AI car completes laps on its own; can race against it. ✅

> **Estimated total time for MVP (Steps 0–8): ~4–6 hours of focused coding** for a beginner. Take it slow — the goal is to *understand* each piece, not finish fast.

---

## 6. What NOT to Include in v1

These are tempting but **out of scope**. We will say "no" to them so v1 actually ships.

| Tempting feature | Why we're skipping it |
|---|---|
| **Multiplayer (online or split-screen)** | Needs networking, state sync, lag handling — a project on its own. |
| **3D graphics (Three.js, WebGL)** | We're learning 2D first. 3D is a different mental model. |
| **Physics engine (Box2D, Matter.js)** | We'll write our own simple car physics — that's the point. |
| **Car upgrades / shop / progression** | Pure feature creep. Save it for v2. |
| **Multiple tracks / track editor** | One great track > three mediocre ones. |
| **Mobile touch controls / responsive layout** | Desktop keyboard only for v1. Easier input model. |
| **Sound & music** | Needs asset sourcing, autoplay rules, mixing. v2. |
| **Node/Express backend, accounts, leaderboards** | Not a web app — a *game*. No backend in v1. |
| **Database for high scores** | Use `localStorage` if you must persist anything. |
| **Animations / sprite sheets / parallax** | Rotated rectangles are fine. |
| **Power-ups, weapons, nitro** | Different game genre. |
| **TypeScript / build tooling** | Add it later as an upgrade challenge. |

---

## 7. Learning Goals (bonus)

By the end of v1, you should be comfortable with:

- The `requestAnimationFrame` game loop and fixed-timestep updates.
- Reading and processing keyboard events.
- Basic 2D vector math (position, velocity, angle, rotation).
- Collision detection (point-in-polygon, line intersection).
- A simple state machine.
- Structuring a small JS project across multiple files.
- Debugging with `console.log` and the browser DevTools.

These are foundational skills that show up in *every* game and in a lot of frontend work.

---

## Ready to proceed?

Once you've reviewed this plan, tell me to **"start Step 0"** (or whichever step you want) and I'll guide you through it, one milestone at a time.
