/**
 * Offline aim trainer — mouse tracking inside the sandbox canvas only.
 * Does not read external game memory or automate online aiming.
 */
export class AimTrainer {
  /**
   * @param {number} width
   * @param {number} height
   * @param {import('../core/Storage.js').DEFAULTS['aim']} settings
   */
  constructor(width, height, settings) {
    this.w = width;
    this.h = height;
    this.settings = { ...settings };
    this.crossX = width / 2;
    this.crossY = height / 2;
    this.targets = [];
    this.hits = 0;
    this.misses = 0;
    this.combo = 0;
    this.elapsed = 0;
    this.#pointerLocked = false;
    this.respawn();
  }

  #pointerLocked;

  apply(settings) {
    Object.assign(this.settings, settings);
    if (this.targets.length !== this.settings.spawnCount) {
      this.respawn();
    }
  }

  respawn() {
    this.targets = [];
    const n = Math.max(1, Math.min(12, this.settings.spawnCount | 0));
    for (let i = 0; i < n; i++) {
      this.targets.push(this.#makeTarget(i));
    }
  }

  resetScore() {
    this.hits = 0;
    this.misses = 0;
    this.combo = 0;
    this.settings.score = 0;
    this.respawn();
  }

  #makeTarget(i) {
    const size = this.settings.targetSize;
    const margin = size + 40;
    return {
      id: `T-${i + 1}`,
      x: margin + Math.random() * (this.w - margin * 2),
      y: margin + Math.random() * (this.h - margin * 2),
      vx: (Math.random() * 2 - 1) * 120 * this.settings.targetSpeed,
      vy: (Math.random() * 2 - 1) * 120 * this.settings.targetSpeed,
      r: size / 2,
      pulse: Math.random() * Math.PI * 2,
    };
  }

  /**
   * @param {number} dx mouse delta
   * @param {number} dy mouse delta
   */
  moveCrosshair(dx, dy) {
    const sens = this.settings.sensitivity;
    this.crossX = Math.max(0, Math.min(this.w, this.crossX + dx * sens));
    this.crossY = Math.max(0, Math.min(this.h, this.crossY + dy * sens));
  }

  setCrosshair(x, y) {
    this.crossX = Math.max(0, Math.min(this.w, x));
    this.crossY = Math.max(0, Math.min(this.h, y));
  }

  /**
   * Soft tracking assist toward nearest target (sandbox practice only).
   * @param {number} dt
   */
  #applyAssist(dt) {
    const assist = this.settings.trackingAssist;
    if (assist <= 0 || !this.targets.length) return;
    let best = null;
    let bestD = Infinity;
    for (const t of this.targets) {
      const d = (t.x - this.crossX) ** 2 + (t.y - this.crossY) ** 2;
      if (d < bestD) {
        bestD = d;
        best = t;
      }
    }
    if (!best) return;
    this.crossX += (best.x - this.crossX) * assist * dt * 4;
    this.crossY += (best.y - this.crossY) * assist * dt * 4;
  }

  fire() {
    let hit = false;
    for (let i = this.targets.length - 1; i >= 0; i--) {
      const t = this.targets[i];
      const dx = t.x - this.crossX;
      const dy = t.y - this.crossY;
      if (dx * dx + dy * dy <= t.r * t.r) {
        this.targets.splice(i, 1);
        this.targets.push(this.#makeTarget(this.targets.length));
        this.hits += 1;
        this.combo += 1;
        this.settings.score += 100 + this.combo * 10;
        hit = true;
        break;
      }
    }
    if (!hit) {
      this.misses += 1;
      this.combo = 0;
    }
    return hit;
  }

  /**
   * @param {number} dt
   */
  update(dt) {
    this.elapsed += dt;
    this.#applyAssist(dt);
    for (const t of this.targets) {
      t.x += t.vx * dt;
      t.y += t.vy * dt;
      t.pulse += dt * 4;
      if (t.x < t.r || t.x > this.w - t.r) t.vx *= -1;
      if (t.y < t.r || t.y > this.h - t.r) t.vy *= -1;
      t.x = Math.max(t.r, Math.min(this.w - t.r, t.x));
      t.y = Math.max(t.r, Math.min(this.h - t.r, t.y));
    }
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   * @param {{ crosshairSize: number, crosshairGap: number, glowIntensity: number }} visuals
   * @param {import('./FovOverlay.js').FovOverlay} fov
   */
  draw(ctx, visuals, fov) {
    const grad = ctx.createRadialGradient(
      this.w / 2,
      this.h / 2,
      40,
      this.w / 2,
      this.h / 2,
      this.w * 0.7
    );
    grad.addColorStop(0, "#071207");
    grad.addColorStop(1, "#020402");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.w, this.h);

    ctx.fillStyle = "rgba(57,255,20,0.55)";
    ctx.font = "12px JetBrains Mono";
    ctx.fillText("AIM TRAINER · offline sandbox · click / Space to fire · mouse to aim", 16, 24);
    ctx.fillText(
      `SCORE ${this.settings.score}  HITS ${this.hits}  MISS ${this.misses}  COMBO ${this.combo}`,
      16,
      44
    );

    fov.draw(ctx, this.crossX, this.crossY);

    for (const t of this.targets) {
      const inFov = fov.contains(t.x, t.y, this.crossX, this.crossY);
      const pulse = 1 + Math.sin(t.pulse) * 0.08;
      ctx.save();
      ctx.globalAlpha = inFov ? 1 : 0.25;
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.r * pulse, 0, Math.PI * 2);
      ctx.fillStyle = inFov ? "#39ff14" : "#3a553a";
      ctx.shadowColor = "#39ff14";
      ctx.shadowBlur = 14 * visuals.glowIntensity;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#050705";
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.r * 0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = inFov ? "#39ff14" : "#6a7a6a";
      ctx.font = "10px JetBrains Mono";
      ctx.textAlign = "center";
      ctx.fillText(t.id, t.x, t.y - t.r - 8);
      ctx.restore();
    }

    this.#drawCrosshair(ctx, visuals);
  }

  #drawCrosshair(ctx, visuals) {
    const s = visuals.crosshairSize;
    const g = visuals.crosshairGap;
    const x = this.crossX;
    const y = this.crossY;
    ctx.save();
    ctx.strokeStyle = "#ffffff";
    ctx.shadowColor = "#39ff14";
    ctx.shadowBlur = 8 * visuals.glowIntensity;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - s - g, y);
    ctx.lineTo(x - g, y);
    ctx.moveTo(x + g, y);
    ctx.lineTo(x + s + g, y);
    ctx.moveTo(x, y - s - g);
    ctx.lineTo(x, y - g);
    ctx.moveTo(x, y + g);
    ctx.lineTo(x, y + s + g);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fillStyle = "#39ff14";
    ctx.fill();
    ctx.restore();
  }

  getStats() {
    const shots = this.hits + this.misses;
    return {
      mode: "aim",
      score: this.settings.score,
      hits: this.hits,
      misses: this.misses,
      accuracy: shots ? (this.hits / shots) * 100 : 0,
      combo: this.combo,
      sensitivity: this.settings.sensitivity,
      targets: this.targets.length,
      crossX: this.crossX,
      crossY: this.crossY,
    };
  }
}
