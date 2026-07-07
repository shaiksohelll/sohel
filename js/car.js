// Car class — top-down vehicle with angle + speed physics.
// Step 3: angle-based motion with frame-rate-independent exponential friction
// and speed-proportional steering (with a small floor so the car is aimable
// at rest).

export class Car {
  constructor(x, y) {
    // Position & visuals
    this.x = x;
    this.y = y;
    this.width = 40;
    this.height = 20;
    this.color = "#e74c3c";

    // Physics state
    // angle: 0 = facing +x (right). Increases clockwise in canvas coords
    //        (since canvas y-axis points down).
    // speed: px/s along facing direction. Positive = forward, negative = reverse.
    this.angle = 0;
    this.speed = 0;

    // Tunables
    this.maxSpeed = 500;        // px/s (forward)
    this.maxReverseSpeed = 200; // px/s (reverse cap)
    this.acceleration = 320;    // px/s^2 (forward)
    this.reverseAccel = 200;    // px/s^2 (reverse, weaker)
    this.friction = 2.5;        // exponential decay when no W/S pressed
    this.drag = 0.4;            // always-on air/rolling resistance
    this.turnRate = 3.2;        // rad/s at full speed (~183 deg/s)
    this.minTurnFactor = 0.15;  // turn rate floor at speed = 0
  }

  update(dt, input) {
    // --- Throttle / brake / reverse ---
    const forward  = input.isDown("w") || input.isDown("ArrowUp");
    const reverse  = input.isDown("s") || input.isDown("ArrowDown");
    const turnLeft = input.isDown("a") || input.isDown("ArrowLeft");
    const turnRight= input.isDown("d") || input.isDown("ArrowRight");

    if (forward) {
      this.speed += this.acceleration * dt;
    } else if (reverse) {
      this.speed -= this.reverseAccel * dt;
    } else {
      // No throttle input -> exponential friction decay (frame-rate independent).
      this.speed *= Math.exp(-this.friction * dt);
      if (Math.abs(this.speed) < 1) this.speed = 0;
    }

    // Always-on light drag (so the car eventually settles even at max speed).
    this.speed *= Math.exp(-this.drag * dt);

    // Clamp to speed limits.
    if (this.speed >  this.maxSpeed)        this.speed =  this.maxSpeed;
    if (this.speed < -this.maxReverseSpeed) this.speed = -this.maxReverseSpeed;

    // --- Steering: speed-proportional with floor ---
    // At speed 0 you still get minTurnFactor * turnRate, so the car is aimable.
    // At max speed you get the full turnRate.
    const speedRatio = Math.abs(this.speed) / this.maxSpeed;
    const turnFactor = this.minTurnFactor + (1 - this.minTurnFactor) * speedRatio;
    const turn = this.turnRate * turnFactor * dt;
    if (turnLeft)  this.angle -= turn;
    if (turnRight) this.angle += turn;

    // --- Apply velocity along facing direction ---
    // (cos a, sin a) is the unit forward vector in canvas coordinates.
    this.x += Math.cos(this.angle) * this.speed * dt;
    this.y += Math.sin(this.angle) * this.speed * dt;
  }

  render(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    // Body
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);

    // Outline
    ctx.strokeStyle = "#7a1f17";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);

    // Windshield (near the front)
    ctx.fillStyle = "#3498db";
    ctx.fillRect(this.width / 2 - 14, -this.height / 2 + 3, 8, this.height - 6);

    // Nose (front bumper indicator) — bright yellow so facing is obvious.
    ctx.fillStyle = "#f1c40f";
    ctx.fillRect(this.width / 2 - 6, -this.height / 2, 6, this.height);

    // Rear lights
    ctx.fillStyle = "#c0392b";
    ctx.fillRect(-this.width / 2, -this.height / 2, 3, 4);
    ctx.fillRect(-this.width / 2,  this.height / 2 - 4, 3, 4);

    ctx.restore();
  }

  // 1 px = 0.05 m -> m/s, * 3.6 -> km/h.  speed * 0.18.
  getSpeedKmh() {
    return Math.abs(this.speed) * 0.18;
  }
}
