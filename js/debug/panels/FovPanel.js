export class FovPanel {
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
        <div class="control-row">
          <span class="panel-label" style="margin:0">FOV Overlay</span>
          <label class="toggle">
            <input type="checkbox" data-enabled />
            <span class="toggle-track"></span>
          </label>
        </div>
        <div class="control-row">
          <div class="slider-wrap">
            <div class="slider-meta"><span>Radius</span><span class="val" data-radius-val></span></div>
            <input class="neon-slider" data-radius type="range" min="60" max="420" step="5" />
          </div>
        </div>
        <div class="control-row">
          <div class="slider-wrap">
            <div class="slider-meta"><span>Thickness</span><span class="val" data-thickness-val></span></div>
            <input class="neon-slider" data-thickness type="range" min="1" max="6" step="1" />
          </div>
        </div>
        <div class="control-row">
          <div class="slider-wrap">
            <div class="slider-meta"><span>Opacity</span><span class="val" data-opacity-val></span></div>
            <input class="neon-slider" data-opacity type="range" min="0.2" max="1" step="0.05" />
          </div>
        </div>
        <div class="control-row">
          <span class="panel-label" style="margin:0">Fill Disc</span>
          <label class="toggle">
            <input type="checkbox" data-fill />
            <span class="toggle-track"></span>
          </label>
        </div>
      </section>
    `;
    this.#bind();
    this.sync();
  }

  #bind() {
    const emit = () => {
      this.api.onChange({
        enabled: this.el.querySelector("[data-enabled]").checked,
        radius: Number(this.el.querySelector("[data-radius]").value),
        thickness: Number(this.el.querySelector("[data-thickness]").value),
        opacity: Number(this.el.querySelector("[data-opacity]").value),
        fill: this.el.querySelector("[data-fill]").checked,
      });
      this.syncLabels();
    };
    for (const sel of ["[data-enabled]", "[data-fill]", "[data-radius]", "[data-thickness]", "[data-opacity]"]) {
      this.el.querySelector(sel).addEventListener("input", emit);
      this.el.querySelector(sel).addEventListener("change", emit);
    }
  }

  sync() {
    const s = this.api.get();
    this.el.querySelector("[data-enabled]").checked = s.enabled;
    this.el.querySelector("[data-fill]").checked = s.fill;
    this.el.querySelector("[data-radius]").value = String(s.radius);
    this.el.querySelector("[data-thickness]").value = String(s.thickness);
    this.el.querySelector("[data-opacity]").value = String(s.opacity);
    this.syncLabels();
  }

  syncLabels() {
    const s = this.api.get();
    this.el.querySelector("[data-radius-val]").textContent = `${s.radius}px`;
    this.el.querySelector("[data-thickness-val]").textContent = `${s.thickness}px`;
    this.el.querySelector("[data-opacity-val]").textContent = s.opacity.toFixed(2);
  }
}
