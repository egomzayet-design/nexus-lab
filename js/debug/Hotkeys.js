import { DEFAULT_HOTKEYS } from "../core/Storage.js";

const CODE_LABELS = {
  Backquote: "`",
  Space: "Space",
  Escape: "Esc",
  ArrowUp: "↑",
  ArrowDown: "↓",
  ArrowLeft: "←",
  ArrowRight: "→",
};

export class Hotkeys {
  constructor(bindings) {
    this.bindings = { ...DEFAULT_HOTKEYS, ...bindings };
    this.#listening = null;
    this.#onRebound = null;
  }

  #listening;
  #onRebound;

  get listening() {
    return this.#listening;
  }

  static labelFor(code) {
    if (!code) return "—";
    if (CODE_LABELS[code]) return CODE_LABELS[code];
    if (code.startsWith("Key")) return code.slice(3);
    if (code.startsWith("Digit")) return code.slice(5);
    return code;
  }

  get(action) {
    return this.bindings[action];
  }

  set(action, code) {
    this.bindings[action] = code;
  }

  findConflict(code, exceptAction) {
    for (const [action, bound] of Object.entries(this.bindings)) {
      if (action === exceptAction) continue;
      if (bound === code) return action;
    }
    return null;
  }

  matches(action, code) {
    return this.bindings[action] === code;
  }

  beginListen(action, onRebound) {
    this.#listening = action;
    this.#onRebound = onRebound;
  }

  cancelListen() {
    this.#listening = null;
    this.#onRebound = null;
  }

  handleKeyDown(e) {
    if (!this.#listening) return false;
    e.preventDefault();
    e.stopPropagation();

    if (e.code === "Escape") {
      this.cancelListen();
      return true;
    }

    const action = this.#listening;
    const conflict = this.findConflict(e.code, action);
    if (conflict) {
      this.#onRebound?.({ ok: false, action, code: e.code, conflict });
      return true;
    }

    this.set(action, e.code);
    this.#onRebound?.({ ok: true, action, code: e.code });
    this.cancelListen();
    return true;
  }

  resetDefaults() {
    this.bindings = { ...DEFAULT_HOTKEYS };
  }

  toJSON() {
    return { ...this.bindings };
  }
}

export const HOTKEY_META = [
  { id: "toggleMenu", name: "Toggle Menu" },
  { id: "toggleMenuAlt", name: "Toggle Menu (Alt)" },
  { id: "toggleInvuln", name: "Toggle Invulnerability" },
  { id: "teleportNext", name: "Teleport Next CP" },
  { id: "resetPlayer", name: "Reset Player" },
  { id: "modePlatform", name: "Mode: Platform" },
  { id: "modeAim", name: "Mode: Aim Trainer" },
  { id: "modeEsp", name: "Mode: ESP Sandbox" },
  { id: "toggleFov", name: "Toggle FOV" },
  { id: "toggleEsp", name: "Toggle ESP" },
];
