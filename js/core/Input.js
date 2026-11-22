/**
 * Lightweight keyboard state for the owned offline test game.
 * Does not hook external processes — browser events only.
 */
export class Input {
  #down = new Set();
  #pressed = new Set();
  #listeners = new Map();
  #target;
  #boundKeyDown;
  #boundKeyUp;
  #boundBlur;

  constructor(target = window) {
    this.#target = target;
    this.#boundKeyDown = (e) => this.#handleKeyDown(e);
    this.#boundKeyUp = (e) => this.#handleKeyUp(e);
    this.#boundBlur = () => this.#handleBlur();
  }

  start() {
    this.#target.addEventListener("keydown", this.#boundKeyDown);
    this.#target.addEventListener("keyup", this.#boundKeyUp);
    window.addEventListener("blur", this.#boundBlur);
  }

  stop() {
    this.#target.removeEventListener("keydown", this.#boundKeyDown);
    this.#target.removeEventListener("keyup", this.#boundKeyUp);
    window.removeEventListener("blur", this.#boundBlur);
    this.#down.clear();
    this.#pressed.clear();
  }

  isDown(code) {
    return this.#down.has(code);
  }

  consumePress(code) {
    if (!this.#pressed.has(code)) return false;
    this.#pressed.delete(code);
    return true;
  }

  /** Register a one-shot edge listener for a key code. */
  onCode(code, handler) {
    if (!this.#listeners.has(code)) this.#listeners.set(code, new Set());
    this.#listeners.get(code).add(handler);
    return () => this.#listeners.get(code)?.delete(handler);
  }

  endFrame() {
    this.#pressed.clear();
  }

  #handleKeyDown(e) {
    if (e.repeat) return;
    const { code } = e;
    const wasDown = this.#down.has(code);
    this.#down.add(code);
    if (!wasDown) {
      this.#pressed.add(code);
      const handlers = this.#listeners.get(code);
      if (handlers) {
        for (const h of handlers) h(e);
      }
    }
  }

  #handleKeyUp(e) {
    this.#down.delete(e.code);
  }

  #handleBlur() {
    this.#down.clear();
    this.#pressed.clear();
  }
}
