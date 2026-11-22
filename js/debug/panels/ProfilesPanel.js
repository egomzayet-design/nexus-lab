export class ProfilesPanel {
  /**
   * @param {{
   *   list: () => string[],
   *   getActive: () => string,
   *   onSaveAs: (name: string) => void,
   *   onLoad: (name: string) => void,
   *   onDelete: (name: string) => void,
   * }} api
   */
  constructor(api) {
    this.api = api;
    this.el = document.createElement("div");
    this.el.innerHTML = `
      <section class="panel-section">
        <span class="panel-label">Configuration Profiles</span>
        <p class="panel-note">Save named presets for FOV, aim, ESP, hotkeys and visuals.</p>
        <div class="control-row">
          <input class="text-input" data-name type="text" maxlength="32" placeholder="Profile name" />
          <button type="button" class="btn" data-save>Save As</button>
        </div>
        <div class="profile-list" data-list></div>
      </section>
    `;
    this.#list = this.el.querySelector("[data-list]");
    this.el.querySelector("[data-save]").addEventListener("click", () => {
      const name = this.el.querySelector("[data-name]").value.trim();
      if (!name) return;
      this.api.onSaveAs(name);
      this.el.querySelector("[data-name]").value = "";
      this.render();
    });
    this.render();
  }

  #list;

  render() {
    const active = this.api.getActive();
    const names = this.api.list();
    this.#list.innerHTML = "";
    for (const name of names) {
      const row = document.createElement("div");
      row.className = "hotkey-row";
      row.innerHTML = `
        <span class="name">${name}${name === active ? " · ACTIVE" : ""}</span>
        <div class="btn-row">
          <button type="button" class="btn ${name === active ? "is-active" : ""}" data-load>Load</button>
          <button type="button" class="btn btn-danger" data-del ${name === "Default" ? "disabled" : ""}>Del</button>
        </div>
      `;
      row.querySelector("[data-load]").addEventListener("click", () => {
        this.api.onLoad(name);
        this.render();
      });
      const del = row.querySelector("[data-del]");
      if (!del.disabled) {
        del.addEventListener("click", () => {
          this.api.onDelete(name);
          this.render();
        });
      }
      this.#list.appendChild(row);
    }
  }
}
