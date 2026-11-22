/**
 * ESP visualizer for isolated sandbox entities only.
 * Draws boxes, labels, distance and tracers on local test targets — never external games.
 */
export class EspSandbox {
  /**
   * @param {number} width
   * @param {number} height
   * @param {import('../core/Storage.js').DEFAULTS['esp']} settings
   */
  constructor(width, height, settings) {
    this.w = width;
    this.h = height;
    this.settings = { ...settings };
    this.observer = { x: width * 0.5, y: height * 0.72 };
    this.entities = this.#seedEntities();
    this.time = 0;
  }

  apply(settings) {
    Object.assign(this.settings, settings);
  }

  #seedEntities() {
    const labels = ["Dummy-A", "Dummy-B", "Dummy-C", "Prop-Crate", "Target-D", "Bot-E"];
    return labels.map((label, i) => {
      const w = 36 + (i % 3) * 10;
      const h = 48 + (i % 2) * 16;
      return {
        id: label,
        x: 140 + i * 170,
        y: 180 + (i % 3) * 90,
        w,
        h,
        vx: (i % 2 === 0 ? 1 : -1) * (40 + i * 8),
        kind: label.startsWith("Prop") ? "prop" : "target",
      };
    });
  }

  /**
   * @param {number} dt
   * @param {{ x: number, y: number } | null} observerOverride
   */
  update(dt, observerOverride = null) {
    this.time += dt;
    if (observerOverride) {
      this.observer.x = observerOverride.x;
      this.observer.y = observerOverride.y;
    }
    for (const e of this.entities) {
      e.x += e.vx * dt;
      if (e.x < 60 || e.x > this.w - 60 - e.w) e.vx *= -1;
      e.y += Math.sin(this.time * 1.4 + e.x * 0.01) * 8 * dt;
    }
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   * @param {{ showGrid: boolean, glowIntensity: number }} visuals
   * @param {import('./FovOverlay.js').FovOverlay} fov
   */
  draw(ctx, visuals, fov) {
    ctx.fillStyle = "#020402";
    ctx.fillRect(0, 0, this.w, this.h);

    if (visuals.showGrid) {
      ctx.strokeStyle = "rgba(57,255,20,0.05)";
      ctx.lineWidth = 1;
      for (let x = 0; x < this.w; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, this.h);
        ctx.stroke();
      }
      for (let y = 0; y < this.h; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(this.w, y);
        ctx.stroke();
      }
    }

    ctx.fillStyle = "rgba(57,255,20,0.55)";
    ctx.font = "12px JetBrains Mono";
    ctx.fillText("ESP VISUALIZER · isolated sandbox entities · not connected to external games", 16, 24);

    // Observer marker
    ctx.save();
    ctx.fillStyle = "#e8ffe8";
    ctx.shadowColor = "#39ff14";
    ctx.shadowBlur = 12 * visuals.glowIntensity;
    ctx.fillRect(this.observer.x - 12, this.observer.y - 18, 24, 36);
    ctx.restore();

    fov.draw(ctx, this.observer.x, this.observer.y);

    let visible = 0;
    for (const e of this.entities) {
      const cx = e.x + e.w / 2;
      const cy = e.y + e.h / 2;
      const dist = Math.hypot(cx - this.observer.x, cy - this.observer.y);
      const inRange = dist <= this.settings.maxDistance;
      const inFov = fov.contains(cx, cy, this.observer.x, this.observer.y);
      const show = this.settings.enabled && inRange && inFov;
      if (show) visible += 1;

      // Entity body
      ctx.save();
      ctx.fillStyle = e.kind === "prop" ? "#2a3a2a" : "#1a281a";
      ctx.strokeStyle = "rgba(255,255,255,0.25)";
      ctx.lineWidth = 1;
      ctx.fillRect(e.x, e.y, e.w, e.h);
      ctx.strokeRect(e.x + 0.5, e.y + 0.5, e.w - 1, e.h - 1);
      ctx.restore();

      if (!show) continue;

      if (this.settings.tracers) {
        ctx.save();
        ctx.strokeStyle = "rgba(57,255,20,0.35)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.observer.x, this.observer.y - 18);
        ctx.lineTo(cx, e.y);
        ctx.stroke();
        ctx.restore();
      }

      if (this.settings.boxes) {
        ctx.save();
        ctx.strokeStyle = "#39ff14";
        ctx.lineWidth = this.settings.boxThickness;
        ctx.shadowColor = "#39ff14";
        ctx.shadowBlur = 8 * visuals.glowIntensity;
        ctx.strokeRect(e.x - 2, e.y - 2, e.w + 4, e.h + 4);
        ctx.restore();
      }

      if (this.settings.labels || this.settings.distance) {
        const parts = [];
        if (this.settings.labels) parts.push(e.id);
        if (this.settings.distance) parts.push(`${dist.toFixed(0)}u`);
        ctx.save();
        ctx.fillStyle = "#39ff14";
        ctx.font = "11px JetBrains Mono";
        ctx.textAlign = "center";
        ctx.shadowColor = "#000";
        ctx.shadowBlur = 4;
        ctx.fillText(parts.join(" · "), cx, e.y - 10);
        ctx.restore();
      }
    }

    ctx.fillStyle = "rgba(57,255,20,0.7)";
    ctx.font = "12px JetBrains Mono";
    ctx.fillText(`VISIBLE ${visible}/${this.entities.length}`, 16, 44);

    return visible;
  }

  getStats() {
    return {
      mode: "esp",
      entities: this.entities.length,
      observerX: this.observer.x,
      observerY: this.observer.y,
      espEnabled: this.settings.enabled,
      maxDistance: this.settings.maxDistance,
    };
  }
}
