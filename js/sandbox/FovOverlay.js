/**
 * FOV circle overlay for the offline sandbox only.
 */
export class FovOverlay {
  /**
   * @param {{ enabled: boolean, radius: number, thickness: number, opacity: number, fill: boolean }} settings
   */
  constructor(settings) {
    this.settings = { ...settings };
  }

  apply(settings) {
    Object.assign(this.settings, settings);
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} cx
   * @param {number} cy
   */
  draw(ctx, cx, cy) {
    if (!this.settings.enabled) return;
    const { radius, thickness, opacity, fill } = this.settings;
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    if (fill) {
      ctx.fillStyle = `rgba(57,255,20,${0.06 * opacity})`;
      ctx.fill();
    }
    ctx.strokeStyle = `rgba(57,255,20,${opacity})`;
    ctx.lineWidth = thickness;
    ctx.setLineDash([8, 6]);
    ctx.shadowColor = "#39ff14";
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.restore();
  }

  /**
   * @param {number} tx
   * @param {number} ty
   * @param {number} cx
   * @param {number} cy
   */
  contains(tx, ty, cx, cy) {
    if (!this.settings.enabled) return true;
    const dx = tx - cx;
    const dy = ty - cy;
    return dx * dx + dy * dy <= this.settings.radius * this.settings.radius;
  }
}
