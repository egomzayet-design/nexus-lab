export class VisualsPanel {
  /**
   * @param {{
   *   get: () => object,
   *   onChange: (partial: object) => void,
   * }} api
   */
  constructor(api) {
    this.api = api;
    this.el = document.createElement("div");
    this.el.innerHTML = `
      <section class="panel-section">
        <span class="panel-label">Visual Settings</span>
        <div class="control-row">
          <span class="panel-label" style="margin:0">Show Grid</span>
          <label class="toggle"><input type="checkbox" data-grid /><span class="toggle-track"></span></label>
        </div>
        <div class="control-row">
          <span class="panel-label" style="margin:0">Show HUD</span>
          <label class="toggle"><input type="checkbox" data-hud /><span class="toggle-track"></span></label>
        </div>
        <div class="control-row">
          <div class="slider-wrap">
            <div class="slider-meta"><span>Glow Intensity</span><span class="val" data-glow-val></span></div>
            <input class="neon-slider" data-glow type="range" min="0" max="2" step="0.1" />
          </div>
        </div>
        <div class="control-row">
          <div class="slider-wrap">
            <div class="slider-meta"><span>Crosshair Size</span><span class="val" data-ch-val></span></div>
            <input class="neon-slider" data-ch type="range" min="4" max="24" step="1" />
          </div>
        </div>
        <div class="control-row">
          <div class="slider-wrap">
            <div class="slider-meta"><span>Crosshair Gap</span><span class="val" data-gap-val></span></div>
            <input class="neon-slider" data-gap type="range" min="0" max="12" step="1" />
          </div>
        </div>
      </section>
    `;
    this.#bind();
    this.sync();
  }

  #bind() {
    const emit = () => {
      this.api.onChange({
        showGrid: this.el.querySelector("[data-grid]").checked,
        showHud: this.el.querySelector("[data-hud]").checked,
        glowIntensity: Number(this.el.querySelector("[data-glow]").value),
        crosshairSize: Number(this.el.querySelector("[data-ch]").value),
        crosshairGap: Number(this.el.querySelector("[data-gap]").value),
      });
      this.syncLabels();
    };
    for (const el of this.el.querySelectorAll("input")) {
      el.addEventListener("input", emit);
      el.addEventListener("change", emit);
    }
  }

  sync() {
    const s = this.api.get();
    this.el.querySelector("[data-grid]").checked = s.showGrid;
    this.el.querySelector("[data-hud]").checked = s.showHud;
    this.el.querySelector("[data-glow]").value = String(s.glowIntensity);
    this.el.querySelector("[data-ch]").value = String(s.crosshairSize);
    this.el.querySelector("[data-gap]").value = String(s.crosshairGap);
    this.syncLabels();
  }

  syncLabels() {
    const s = this.api.get();
    this.el.querySelector("[data-glow-val]").textContent = s.glowIntensity.toFixed(1);
    this.el.querySelector("[data-ch-val]").textContent = `${s.crosshairSize}px`;
    this.el.querySelector("[data-gap-val]").textContent = `${s.crosshairGap}px`;
  }
}
