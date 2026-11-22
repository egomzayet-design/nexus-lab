export class EspPanel {
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
        <span class="panel-label">ESP Visualizer (Sandbox)</span>
        <p class="panel-note">Boxes, labels and distance for local test dummies only.</p>
        <div class="control-row">
          <span class="panel-label" style="margin:0">ESP Enabled</span>
          <label class="toggle"><input type="checkbox" data-enabled /><span class="toggle-track"></span></label>
        </div>
        <div class="control-row">
          <span class="panel-label" style="margin:0">Bounding Boxes</span>
          <label class="toggle"><input type="checkbox" data-boxes /><span class="toggle-track"></span></label>
        </div>
        <div class="control-row">
          <span class="panel-label" style="margin:0">Labels</span>
          <label class="toggle"><input type="checkbox" data-labels /><span class="toggle-track"></span></label>
        </div>
        <div class="control-row">
          <span class="panel-label" style="margin:0">Distance</span>
          <label class="toggle"><input type="checkbox" data-distance /><span class="toggle-track"></span></label>
        </div>
        <div class="control-row">
          <span class="panel-label" style="margin:0">Tracers</span>
          <label class="toggle"><input type="checkbox" data-tracers /><span class="toggle-track"></span></label>
        </div>
        <div class="control-row">
          <div class="slider-wrap">
            <div class="slider-meta"><span>Max Distance</span><span class="val" data-max-val></span></div>
            <input class="neon-slider" data-max type="range" min="100" max="1200" step="20" />
          </div>
        </div>
        <div class="control-row">
          <div class="slider-wrap">
            <div class="slider-meta"><span>Box Thickness</span><span class="val" data-thick-val></span></div>
            <input class="neon-slider" data-thick type="range" min="1" max="5" step="1" />
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
        enabled: this.el.querySelector("[data-enabled]").checked,
        boxes: this.el.querySelector("[data-boxes]").checked,
        labels: this.el.querySelector("[data-labels]").checked,
        distance: this.el.querySelector("[data-distance]").checked,
        tracers: this.el.querySelector("[data-tracers]").checked,
        maxDistance: Number(this.el.querySelector("[data-max]").value),
        boxThickness: Number(this.el.querySelector("[data-thick]").value),
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
    this.el.querySelector("[data-enabled]").checked = s.enabled;
    this.el.querySelector("[data-boxes]").checked = s.boxes;
    this.el.querySelector("[data-labels]").checked = s.labels;
    this.el.querySelector("[data-distance]").checked = s.distance;
    this.el.querySelector("[data-tracers]").checked = s.tracers;
    this.el.querySelector("[data-max]").value = String(s.maxDistance);
    this.el.querySelector("[data-thick]").value = String(s.boxThickness);
    this.syncLabels();
  }

  syncLabels() {
    const s = this.api.get();
    this.el.querySelector("[data-max-val]").textContent = `${s.maxDistance}u`;
    this.el.querySelector("[data-thick-val]").textContent = `${s.boxThickness}px`;
  }
}
