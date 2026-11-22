/**
 * Draggable shell + tab chrome for the debug menu.
 */
export class MenuUI {
  /**
   * @param {HTMLElement} root
   * @param {{ title?: string, tabs: Array<{ id: string, label: string }>, onClose: () => void, onTab: (id: string) => void, onMove: (x: number, y: number) => void }} options
   */
  constructor(root, options) {
    this.root = root;
    this.options = options;
    this.open = false;
    this.activeTab = options.tabs[0]?.id ?? "controls";

    this.el = document.createElement("div");
    this.el.className = "debug-menu";
    this.el.setAttribute("role", "dialog");
    this.el.setAttribute("aria-label", "Debug menu");

    this.el.innerHTML = `
      <header class="debug-header" data-drag>
        <h2 class="debug-title">${options.title ?? "DEBUG"} <span>// MENU</span></h2>
        <button type="button" class="debug-close" aria-label="Close" data-close>×</button>
      </header>
      <nav class="debug-tabs" role="tablist"></nav>
      <div class="debug-body" data-body></div>
      <div class="toast" data-toast></div>
      <footer class="debug-footer">NEXUS LAB · OFFLINE SANDBOX · NO EXTERNAL INJECTION</footer>
    `;

    this.tabsEl = this.el.querySelector(".debug-tabs");
    this.bodyEl = this.el.querySelector("[data-body]");
    this.toastEl = this.el.querySelector("[data-toast]");
    this.headerEl = this.el.querySelector("[data-drag]");

    for (const tab of options.tabs) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "debug-tab";
      btn.dataset.tab = tab.id;
      btn.setAttribute("role", "tab");
      btn.textContent = tab.label;
      this.tabsEl.appendChild(btn);
    }

    root.appendChild(this.el);
    this.#bind();
    this.#syncTabs();
  }

  #drag = null;
  #toastTimer = 0;

  #bind() {
    this.el.querySelector("[data-close]").addEventListener("click", () => {
      this.options.onClose();
    });

    this.tabsEl.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-tab]");
      if (!btn) return;
      this.setTab(btn.dataset.tab);
    });

    this.headerEl.addEventListener("pointerdown", (e) => {
      if (e.target.closest("[data-close]")) return;
      this.#drag = {
        px: e.clientX,
        py: e.clientY,
        ox: this.el.offsetLeft,
        oy: this.el.offsetTop,
      };
      this.el.classList.add("is-dragging");
      this.headerEl.setPointerCapture(e.pointerId);
    });

    this.headerEl.addEventListener("pointermove", (e) => {
      if (!this.#drag) return;
      const x = this.#drag.ox + (e.clientX - this.#drag.px);
      const y = this.#drag.oy + (e.clientY - this.#drag.py);
      this.setPosition(x, y);
    });

    const endDrag = (e) => {
      if (!this.#drag) return;
      this.#drag = null;
      this.el.classList.remove("is-dragging");
      try {
        this.headerEl.releasePointerCapture(e.pointerId);
      } catch {
        /* already released */
      }
      this.options.onMove(this.el.offsetLeft, this.el.offsetTop);
    };

    this.headerEl.addEventListener("pointerup", endDrag);
    this.headerEl.addEventListener("pointercancel", endDrag);
  }

  setPosition(x, y) {
    const maxX = window.innerWidth - this.el.offsetWidth - 8;
    const maxY = window.innerHeight - 48;
    const nx = Math.max(8, Math.min(x, maxX));
    const ny = Math.max(8, Math.min(y, maxY));
    this.el.style.left = `${nx}px`;
    this.el.style.top = `${ny}px`;
  }

  setOpen(open) {
    this.open = open;
    this.el.classList.toggle("is-open", open);
    this.root.setAttribute("aria-hidden", open ? "false" : "true");
    if (open) {
      this.el.style.pointerEvents = "auto";
    } else {
      // keep transition then ignore hits
      window.setTimeout(() => {
        if (!this.open) this.el.style.pointerEvents = "none";
      }, 220);
    }
  }

  setTab(id) {
    if (this.activeTab === id) return;
    this.activeTab = id;
    this.#syncTabs();
    this.options.onTab(id);
  }

  #syncTabs() {
    for (const btn of this.tabsEl.querySelectorAll(".debug-tab")) {
      btn.classList.toggle("is-active", btn.dataset.tab === this.activeTab);
    }
  }

  /** Mount a panel element into the body; returns a show/hide helper. */
  registerPanel(id, element) {
    element.classList.add("panel");
    element.dataset.panel = id;
    if (id === this.activeTab) element.classList.add("is-active");
    this.bodyEl.appendChild(element);
    return {
      show: () => {
        for (const p of this.bodyEl.querySelectorAll(".panel")) {
          p.classList.toggle("is-active", p.dataset.panel === id);
        }
      },
    };
  }

  toast(message, ms = 1600) {
    this.toastEl.textContent = message;
    this.toastEl.classList.add("is-visible");
    window.clearTimeout(this.#toastTimer);
    this.#toastTimer = window.setTimeout(() => {
      this.toastEl.classList.remove("is-visible");
    }, ms);
  }
}
