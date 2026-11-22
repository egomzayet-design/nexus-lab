export class SettingsPanel {
  /**
   * @param {{
   *   onSave: () => void,
   *   onLoad: () => void,
   *   onClear: () => void,
   *   getMode: () => string,
   *   onMode: (mode: string) => void,
   * }} api
   */
  constructor(api) {
    this.api = api;
    this.el = document.createElement("div");
    this.el.innerHTML = `
      <section class="panel-section">
        <span class="panel-label">Sandbox Mode</span>
        <div class="btn-row" data-modes>
          <button type="button" class="btn" data-mode="platform">Platform</button>
          <button type="button" class="btn" data-mode="aim">Aim Trainer</button>
          <button type="button" class="btn" data-mode="esp">ESP Visualizer</button>
        </div>
      </section>
      <section class="panel-section">
        <span class="panel-label">Persistence</span>
        <p class="panel-note">Stored locally in this offline Windows app.</p>
        <div class="btn-row">
          <button type="button" class="btn" data-save>Save Config</button>
          <button type="button" class="btn" data-load>Load Config</button>
          <button type="button" class="btn btn-danger" data-clear>Clear Saved</button>
        </div>
      </section>
      <section class="panel-section">
        <span class="panel-label">Security Scope</span>
        <p class="panel-note">
          NEXUS LAB operates only inside this offline sandbox.
          No third-party injection, memory access, or anti-cheat interference.
        </p>
      </section>
    `;

    this.el.querySelector("[data-save]").addEventListener("click", () => api.onSave());
    this.el.querySelector("[data-load]").addEventListener("click", () => api.onLoad());
    this.el.querySelector("[data-clear]").addEventListener("click", () => api.onClear());
    this.el.querySelector("[data-modes]").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-mode]");
      if (!btn) return;
      api.onMode(btn.dataset.mode);
      this.syncMode();
    });
    this.syncMode();
  }

  syncMode() {
    const mode = this.api.getMode();
    for (const btn of this.el.querySelectorAll("[data-mode]")) {
      btn.classList.toggle("is-active", btn.dataset.mode === mode);
    }
  }
}
