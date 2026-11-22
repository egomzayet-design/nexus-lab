/**
 * Static test arena geometry for the offline sandbox.
 */
export class World {
  constructor(width, height) {
    this.bounds = { w: width, h: height };

    this.platforms = [
      { x: 0, y: height - 40, w: width, h: 40 },
      { x: 120, y: 560, w: 180, h: 18 },
      { x: 380, y: 480, w: 160, h: 18 },
      { x: 620, y: 400, w: 200, h: 18 },
      { x: 900, y: 320, w: 160, h: 18 },
      { x: 200, y: 300, w: 140, h: 18 },
      { x: 480, y: 220, w: 180, h: 18 },
      { x: 780, y: 160, w: 220, h: 18 },
      { x: 40, y: 180, w: 100, h: 18 },
    ];

    this.hazards = [
      { x: 340, y: height - 56, w: 70, h: 16 },
      { x: 700, y: height - 56, w: 90, h: 16 },
      { x: 1050, y: height - 56, w: 60, h: 16 },
    ];

    this.checkpoints = [
      { id: "spawn", label: "Spawn", x: 80, y: height - 40 },
      { id: "mid", label: "Mid", x: 700, y: 400 },
      { id: "high", label: "High", x: 890, y: 160 },
      { id: "left", label: "Left Tower", x: 90, y: 180 },
      { id: "peak", label: "Peak", x: 570, y: 220 },
    ];

    this.#grid = this.#buildGrid();
  }

  #grid;

  #buildGrid() {
    const step = 40;
    const lines = [];
    for (let x = 0; x <= this.bounds.w; x += step) {
      lines.push({ x1: x, y1: 0, x2: x, y2: this.bounds.h });
    }
    for (let y = 0; y <= this.bounds.h; y += step) {
      lines.push({ x1: 0, y1: y, x2: this.bounds.w, y2: y });
    }
    return lines;
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   */
  draw(ctx) {
    const { w, h } = this.bounds;

    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "#061006");
    grad.addColorStop(1, "#020402");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = "rgba(57,255,20,0.04)";
    ctx.lineWidth = 1;
    for (const line of this.#grid) {
      ctx.beginPath();
      ctx.moveTo(line.x1, line.y1);
      ctx.lineTo(line.x2, line.y2);
      ctx.stroke();
    }

    for (const p of this.platforms) {
      ctx.fillStyle = "#0d1a0d";
      ctx.strokeStyle = "rgba(57,255,20,0.35)";
      ctx.lineWidth = 1;
      ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.strokeRect(p.x + 0.5, p.y + 0.5, p.w - 1, p.h - 1);
      ctx.fillStyle = "rgba(57,255,20,0.15)";
      ctx.fillRect(p.x, p.y, p.w, 3);
    }

    for (const hz of this.hazards) {
      ctx.save();
      ctx.fillStyle = "rgba(255,51,85,0.55)";
      ctx.shadowColor = "#ff3355";
      ctx.shadowBlur = 10;
      ctx.fillRect(hz.x, hz.y, hz.w, hz.h);
      ctx.restore();
    }
  }
}
