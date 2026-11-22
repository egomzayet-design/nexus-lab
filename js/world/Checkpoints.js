/**
 * Named teleport checkpoints for offline player testing.
 */
export class Checkpoints {
  /**
   * @param {Array<{ id: string, label: string, x: number, y: number }>} points
   */
  constructor(points) {
    this.points = points;
    this.index = 0;
  }

  get current() {
    return this.points[this.index];
  }

  get list() {
    return this.points;
  }

  next() {
    this.index = (this.index + 1) % this.points.length;
    return this.current;
  }

  prev() {
    this.index = (this.index - 1 + this.points.length) % this.points.length;
    return this.current;
  }

  goTo(id) {
    const i = this.points.findIndex((p) => p.id === id);
    if (i < 0) return null;
    this.index = i;
    return this.current;
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   */
  draw(ctx) {
    for (let i = 0; i < this.points.length; i++) {
      const p = this.points[i];
      const active = i === this.index;
      ctx.save();
      ctx.strokeStyle = active ? "#39ff14" : "rgba(57,255,20,0.35)";
      ctx.fillStyle = active ? "rgba(57,255,20,0.2)" : "rgba(57,255,20,0.06)";
      ctx.lineWidth = active ? 2 : 1;
      if (active) {
        ctx.shadowColor = "#39ff14";
        ctx.shadowBlur = 12;
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, active ? 14 : 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.fillStyle = active ? "#39ff14" : "#8a9a8a";
      ctx.font = "11px JetBrains Mono";
      ctx.textAlign = "center";
      ctx.fillText(p.label, p.x, p.y - 20);
      ctx.restore();
    }
  }
}
