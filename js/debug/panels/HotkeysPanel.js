import { Hotkeys, HOTKEY_META } from "../Hotkeys.js";

export class HotkeysPanel {
  /**
   * @param {{
   *   hotkeys: import('../Hotkeys.js').Hotkeys,
   *   onChange: () => void,
   *   toast: (msg: string) => void,
   * }} api
   */
  constructor(api) {
    this.api = api;
    this.el = document.createElement("div");
    this.el.innerHTML = `
      <section class="panel-section">
        <span class="panel-label">Custom Hotkeys</span>
        <p class="panel-note">Click a bind, then press a key. Esc cancels.</p>
        <div class="hotkey-list" data-list></div>
      </section>
      <section class="panel-section">
        <div class="btn-row">
          <button type="button" class="btn" data-reset-keys>Reset Hotkeys</button>
        </div>
      </section>
    `;

    this.#list = this.el.querySelector("[data-list]");
    this.el.querySelector("[data-reset-keys]").addEventListener("click", () => {
      this.api.hotkeys.resetDefaults();
      this.api.onChange();
      this.render();
      this.api.toast("Hotkeys reset");
    });

    this.render();
  }

  #list;

  render() {
    this.#list.innerHTML = "";
    for (const meta of HOTKEY_META) {
      const row = document.createElement("div");
      row.className = "hotkey-row";
      const code = this.api.hotkeys.get(meta.id);
      row.innerHTML = `
        <span class="name">${meta.name}</span>
        <button type="button" class="hotkey-bind" data-action="${meta.id}">${Hotkeys.labelFor(code)}</button>
      `;
      const bindBtn = row.querySelector(".hotkey-bind");
      bindBtn.addEventListener("click", () => this.#startListen(meta.id, bindBtn));
      this.#list.appendChild(row);
    }
  }

  #startListen(action, btn) {
    for (const b of this.#list.querySelectorAll(".hotkey-bind")) {
      b.classList.remove("is-listening");
      b.textContent = Hotkeys.labelFor(this.api.hotkeys.get(b.dataset.action));
    }
    btn.classList.add("is-listening");
    btn.textContent = "…";

    this.api.hotkeys.beginListen(action, (result) => {
      if (!result.ok) {
        this.api.toast(`Conflict with ${result.conflict}`);
        btn.classList.remove("is-listening");
        btn.textContent = Hotkeys.labelFor(this.api.hotkeys.get(action));
        return;
      }
      this.api.onChange();
      this.render();
      this.api.toast(`Bound ${Hotkeys.labelFor(result.code)}`);
    });
  }
}
