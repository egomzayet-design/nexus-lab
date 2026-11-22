/**
 * Player testing controls: speed, jump, teleport, invulnerability.
 */
export class ControlsPanel {
  /**
   * @param {{
   *   getSpeed: () => number,
   *   getJump: () => number,
   *   getInvuln: () => boolean,
   *   getCheckpoints: () => Array<{ id: string, label: string }>,
   *   getActiveCheckpointId: () => string,
   *   onSpeed: (v: number) => void,
   *   onJump: (v: number) => void,
   *   onInvuln: (v: boolean) => void,
   *   onTeleport: (id: string) => void,
   *   onReset: () => void,
   * }} api
   */
  constructor(api) {
    this.api = api;
    this.el = document.createElement("div");

    this.el.innerHTML = `
      <section class="panel-section">
        <div class="control-row">
          <div class="slider-wrap">
            <div class="slider-meta">
              <span>Speed Multiplier</span>
              <span class="val" data-speed-val>1.00×</span>
            </div>
            <input class="neon-slider" data-speed type="range" min="0.25" max="5" step="0.05" />
          </div>
        </div>
        <div class="control-row">
          <div class="slider-wrap">
            <div class="slider-meta">
              <span>Jump Multiplier</span>
              <span class="val" data-jump-val>1.00×</span>
            </div>
            <input class="neon-slider" data-jump type="range" min="0.25" max="4" step="0.05" />
          </div>
        </div>
        <div class="control-row">
          <span class="panel-label" style="margin:0">Invulnerability</span>
          <label class="toggle">
            <input type="checkbox" data-invuln />
            <span class="toggle-track"></span>
          </label>
        </div>
      </section>
      <section class="panel-section">
        <span class="panel-label">Teleport Checkpoints</span>
        <div class="btn-row" data-cps></div>
      </section>
      <section class="panel-section">
        <span class="panel-label">Actions</span>
        <div class="btn-row">
          <button type="button" class="btn" data-reset>Reset Player</button>
          <button type="button" class="btn" data-speed-reset>Speed 1×</button>
          <button type="button" class="btn" data-jump-reset>Jump 1×</button>
        </div>
      </section>
    `;

    this.#speed = this.el.querySelector("[data-speed]");
    this.#jump = this.el.querySelector("[data-jump]");
    this.#speedVal = this.el.querySelector("[data-speed-val]");
    this.#jumpVal = this.el.querySelector("[data-jump-val]");
    this.#invuln = this.el.querySelector("[data-invuln]");
    this.#cps = this.el.querySelector("[data-cps]");

    this.#bind();
    this.syncFromApi();
    this.renderCheckpoints();
  }

  #speed;
  #jump;
  #speedVal;
  #jumpVal;
  #invuln;
  #cps;

  #bind() {
    this.#speed.addEventListener("input", () => {
      const v = Number(this.#speed.value);
      this.#speedVal.textContent = `${v.toFixed(2)}×`;
      this.api.onSpeed(v);
    });

    this.#jump.addEventListener("input", () => {
      const v = Number(this.#jump.value);
      this.#jumpVal.textContent = `${v.toFixed(2)}×`;
      this.api.onJump(v);
    });

    this.#invuln.addEventListener("change", () => {
      this.api.onInvuln(this.#invuln.checked);
    });

    this.el.querySelector("[data-reset]").addEventListener("click", () => this.api.onReset());
    this.el.querySelector("[data-speed-reset]").addEventListener("click", () => {
      this.#speed.value = "1";
      this.#speed.dispatchEvent(new Event("input"));
    });
    this.el.querySelector("[data-jump-reset]").addEventListener("click", () => {
      this.#jump.value = "1";
      this.#jump.dispatchEvent(new Event("input"));
    });
  }

  syncFromApi() {
    const speed = this.api.getSpeed();
    const jump = this.api.getJump();
    this.#speed.value = String(speed);
    this.#jump.value = String(jump);
    this.#speedVal.textContent = `${speed.toFixed(2)}×`;
    this.#jumpVal.textContent = `${jump.toFixed(2)}×`;
    this.#invuln.checked = this.api.getInvuln();
    this.#highlightActiveCp();
  }

  renderCheckpoints() {
    this.#cps.innerHTML = "";
    for (const cp of this.api.getCheckpoints()) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn";
      btn.dataset.cp = cp.id;
      btn.textContent = cp.label;
      btn.addEventListener("click", () => {
        this.api.onTeleport(cp.id);
        this.#highlightActiveCp();
      });
      this.#cps.appendChild(btn);
    }
    this.#highlightActiveCp();
  }

  #highlightActiveCp() {
    const active = this.api.getActiveCheckpointId();
    for (const btn of this.#cps.querySelectorAll("[data-cp]")) {
      btn.classList.toggle("is-active", btn.dataset.cp === active);
    }
  }
}
