export class AimPanel {
  /**
   * @param {{
   *   get: () => object,
   *   onChange: (partial: object) => void,
   *   onResetScore: () => void,
   *   onRespawn: () => void,
   * }} api
   */
  constructor(api) {
    this.api = api;
    this.el = document.createElement("div");
    this.el.innerHTML = `
      <section class="panel-section">
        <span class="panel-label">Aim Trainer (Sandbox)</span>
        <p class="panel-note">Mouse aim + target tracking practice. Offline only.</p>
        <div class="control-row">
          <div class="slider-wrap">
            <div class="slider-meta"><span>Sensitivity</span><span class="val" data-sens-val></span></div>
            <input class="neon-slider" data-sens type="range" min="0.25" max="3" step="0.05" />
          </div>
        </div>
        <div class="control-row">
          <div class="slider-wrap">
            <div class="slider-meta"><span>Target Speed</span><span class="val" data-speed-val></span></div>
            <input class="neon-slider" data-speed type="range" min="0.25" max="3" step="0.05" />
          </div>
        </div>
        <div class="control-row">
          <div class="slider-wrap">
            <div class="slider-meta"><span>Target Size</span><span class="val" data-size-val></span></div>
            <input class="neon-slider" data-size type="range" min="14" max="56" step="2" />
          </div>
        </div>
        <div class="control-row">
          <div class="slider-wrap">
            <div class="slider-meta"><span>Tracking Assist</span><span class="val" data-assist-val></span></div>
            <input class="neon-slider" data-assist type="range" min="0" max="0.6" step="0.01" />
          </div>
        </div>
        <div class="control-row">
          <div class="slider-wrap">
            <div class="slider-meta"><span>Spawn Count</span><span class="val" data-count-val></span></div>
            <input class="neon-slider" data-count type="range" min="1" max="8" step="1" />
          </div>
        </div>
        <div class="btn-row">
          <button type="button" class="btn" data-respawn>Respawn Targets</button>
          <button type="button" class="btn btn-danger" data-reset>Reset Score</button>
        </div>
      </section>
    `;
    this.#bind();
    this.sync();
  }

  #bind() {
    const emit = () => {
      this.api.onChange({
        sensitivity: Number(this.el.querySelector("[data-sens]").value),
        targetSpeed: Number(this.el.querySelector("[data-speed]").value),
        targetSize: Number(this.el.querySelector("[data-size]").value),
        trackingAssist: Number(this.el.querySelector("[data-assist]").value),
        spawnCount: Number(this.el.querySelector("[data-count]").value),
      });
      this.syncLabels();
    };
    for (const sel of ["[data-sens]", "[data-speed]", "[data-size]", "[data-assist]", "[data-count]"]) {
      this.el.querySelector(sel).addEventListener("input", emit);
    }
    this.el.querySelector("[data-respawn]").addEventListener("click", () => this.api.onRespawn());
    this.el.querySelector("[data-reset]").addEventListener("click", () => this.api.onResetScore());
  }

  sync() {
    const s = this.api.get();
    this.el.querySelector("[data-sens]").value = String(s.sensitivity);
    this.el.querySelector("[data-speed]").value = String(s.targetSpeed);
    this.el.querySelector("[data-size]").value = String(s.targetSize);
    this.el.querySelector("[data-assist]").value = String(s.trackingAssist);
    this.el.querySelector("[data-count]").value = String(s.spawnCount);
    this.syncLabels();
  }

  syncLabels() {
    const s = this.api.get();
    this.el.querySelector("[data-sens-val]").textContent = s.sensitivity.toFixed(2);
    this.el.querySelector("[data-speed-val]").textContent = s.targetSpeed.toFixed(2);
    this.el.querySelector("[data-size-val]").textContent = `${s.targetSize}px`;
    this.el.querySelector("[data-assist-val]").textContent = s.trackingAssist.toFixed(2);
    this.el.querySelector("[data-count-val]").textContent = String(s.spawnCount);
  }
}
