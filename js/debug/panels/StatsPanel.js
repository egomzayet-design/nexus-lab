export class StatsPanel {
  constructor() {
    this.el = document.createElement("div");
    this.el.innerHTML = `
      <section class="panel-section">
        <span class="panel-label">Live Statistics</span>
        <div class="stat-grid" data-grid></div>
      </section>
    `;
    this.#grid = this.el.querySelector("[data-grid]");
    this.#nodes = {};
    this.#lastHash = "";
  }

  #grid;
  #nodes;
  #lastHash;

  #ensureKeys(keys) {
    const existing = new Set(Object.keys(this.#nodes));
    const needed = new Set(keys);
    let changed = false;
    for (const k of existing) {
      if (!needed.has(k)) {
        this.#nodes[k].parentElement.remove();
        delete this.#nodes[k];
        changed = true;
      }
    }
    for (const k of keys) {
      if (!this.#nodes[k]) {
        const card = document.createElement("div");
        card.className = "stat-card";
        card.innerHTML = `<span class="label">${k}</span><span class="value" data-k="${k}">—</span>`;
        this.#grid.appendChild(card);
        this.#nodes[k] = card.querySelector("[data-k]");
        changed = true;
      }
    }
    if (changed) this.#lastHash = "";
  }

  /**
   * @param {Record<string, string|number|boolean>} stats
   */
  update(stats) {
    const entries = Object.entries(stats).map(([k, v]) => {
      let display;
      if (typeof v === "number") display = Number.isInteger(v) ? String(v) : v.toFixed(1);
      else if (typeof v === "boolean") display = v ? "YES" : "NO";
      else display = String(v);
      return [k, display];
    });
    this.#ensureKeys(entries.map(([k]) => k));
    const hash = entries.map(([, v]) => v).join("|");
    if (hash === this.#lastHash) return;
    this.#lastHash = hash;
    for (const [k, v] of entries) {
      const node = this.#nodes[k];
      if (node && node.textContent !== v) node.textContent = v;
    }
  }
}
