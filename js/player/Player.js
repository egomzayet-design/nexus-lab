/**
 * Simple 2D platformer player for the offline test sandbox.
 */
export class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.w = 28;
    this.h = 40;
    this.onGround = false;
    this.facing = 1;

    this.baseSpeed = 220;
    this.baseJump = 460;
    this.gravity = 1400;
    this.friction = 0.82;

    this.speedMultiplier = 1;
    this.jumpMultiplier = 1;
    this.invulnerable = false;

    this.flash = 0;
    this.alive = true;
  }

  get speed() {
    return this.baseSpeed * this.speedMultiplier;
  }

  get jumpForce() {
    return this.baseJump * this.jumpMultiplier;
  }

  get cx() {
    return this.x + this.w / 2;
  }

  get cy() {
    return this.y + this.h / 2;
  }

  get bottom() {
    return this.y + this.h;
  }

  get right() {
    return this.x + this.w;
  }

  reset(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.onGround = false;
    this.alive = true;
    this.flash = 0.4;
  }

  teleport(x, y) {
    this.x = x - this.w / 2;
    this.y = y - this.h;
    this.vx = 0;
    this.vy = 0;
    this.flash = 0.35;
  }

  takeHit() {
    if (this.invulnerable) {
      this.flash = 0.2;
      return false;
    }
    this.alive = false;
    this.flash = 0.5;
    return true;
  }

  /**
   * @param {import('../core/Input.js').Input} input
   * @param {number} dt
   * @param {{ platforms: Array<{x:number,y:number,w:number,h:number}>, hazards: Array<{x:number,y:number,w:number,h:number}>, bounds: {w:number,h:number} }} world
   */
  update(input, dt, world) {
    if (!this.alive) {
      this.flash = Math.max(0, this.flash - dt);
      return;
    }

    let move = 0;
    if (input.isDown("KeyA") || input.isDown("ArrowLeft")) move -= 1;
    if (input.isDown("KeyD") || input.isDown("ArrowRight")) move += 1;

    if (move !== 0) {
      this.facing = move;
      this.vx = move * this.speed;
    } else {
      this.vx *= this.friction;
      if (Math.abs(this.vx) < 4) this.vx = 0;
    }

    const jumpPressed =
      input.consumePress("KeyW") ||
      input.consumePress("Space") ||
      input.consumePress("ArrowUp");

    if (jumpPressed && this.onGround) {
      this.vy = -this.jumpForce;
      this.onGround = false;
    }

    this.vy += this.gravity * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    this.#collidePlatforms(world.platforms);
    this.#collideBounds(world.bounds);
    this.#collideHazards(world.hazards);

    this.flash = Math.max(0, this.flash - dt);
  }

  #collidePlatforms(platforms) {
    this.onGround = false;
    for (const p of platforms) {
      if (!this.#overlaps(p)) continue;

      const overlapX = Math.min(this.right, p.x + p.w) - Math.max(this.x, p.x);
      const overlapY = Math.min(this.bottom, p.y + p.h) - Math.max(this.y, p.y);

      if (overlapX < overlapY) {
        if (this.cx < p.x + p.w / 2) this.x = p.x - this.w;
        else this.x = p.x + p.w;
        this.vx = 0;
      } else {
        if (this.cy < p.y + p.h / 2) {
          this.y = p.y - this.h;
          this.vy = 0;
          this.onGround = true;
        } else {
          this.y = p.y + p.h;
          this.vy = 0;
        }
      }
    }
  }

  #collideBounds(bounds) {
    if (this.x < 0) {
      this.x = 0;
      this.vx = 0;
    }
    if (this.right > bounds.w) {
      this.x = bounds.w - this.w;
      this.vx = 0;
    }
    if (this.y < 0) {
      this.y = 0;
      this.vy = 0;
    }
    if (this.bottom > bounds.h) {
      this.y = bounds.h - this.h;
      this.vy = 0;
      this.onGround = true;
    }
  }

  #collideHazards(hazards) {
    for (const h of hazards) {
      if (this.#overlaps(h)) {
        this.takeHit();
        break;
      }
    }
  }

  #overlaps(r) {
    return (
      this.x < r.x + r.w &&
      this.right > r.x &&
      this.y < r.y + r.h &&
      this.bottom > r.y
    );
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   */
  draw(ctx) {
    const alpha = this.flash > 0 ? 0.45 + Math.sin(performance.now() * 0.04) * 0.35 : 1;
    ctx.save();
    ctx.globalAlpha = this.alive ? alpha : 0.35;

    if (this.invulnerable) {
      ctx.shadowColor = "#39ff14";
      ctx.shadowBlur = 18;
    }

    ctx.fillStyle = this.invulnerable ? "#39ff14" : "#e8ffe8";
    ctx.fillRect(this.x, this.y, this.w, this.h);

    ctx.shadowBlur = 0;
    ctx.fillStyle = "#050705";
    const eyeX = this.facing > 0 ? this.x + this.w - 10 : this.x + 4;
    ctx.fillRect(eyeX, this.y + 10, 6, 6);

    if (!this.alive) {
      ctx.fillStyle = "rgba(255,51,85,0.7)";
      ctx.font = "10px JetBrains Mono";
      ctx.fillText("DOWN — R to reset", this.x - 20, this.y - 8);
    }

    ctx.restore();
  }

  getStats() {
    return {
      x: this.x,
      y: this.y,
      vx: this.vx,
      vy: this.vy,
      onGround: this.onGround,
      speedMultiplier: this.speedMultiplier,
      jumpMultiplier: this.jumpMultiplier,
      invulnerable: this.invulnerable,
      alive: this.alive,
      effectiveSpeed: this.speed,
      effectiveJump: this.jumpForce,
    };
  }
}
