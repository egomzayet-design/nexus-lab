import { Game } from "./core/Game.js";

/**
 * Bootstrap — owned offline NEXUS LAB sandbox only.
 */
function boot() {
  const canvas = document.getElementById("game-canvas");
  const debugRoot = document.getElementById("debug-root");
  const hudSpeed = document.getElementById("hud-speed");
  const hudInvuln = document.getElementById("hud-invuln");
  const hudMode = document.getElementById("hud-mode");

  if (!canvas || !debugRoot || !hudSpeed || !hudInvuln || !hudMode) {
    console.error("[NEXUS LAB] Missing required DOM nodes.");
    return;
  }

  const game = new Game({ canvas, debugRoot, hudSpeed, hudInvuln, hudMode });
  game.start();
  window.__NEXUS_LAB__ = { game };

  if (window.nexusDesktop) {
    document.body.classList.add("is-electron");
    document.getElementById("btn-min")?.addEventListener("click", () => window.nexusDesktop.minimize());
    document.getElementById("btn-max")?.addEventListener("click", () => window.nexusDesktop.maximize());
    document.getElementById("btn-close")?.addEventListener("click", () => window.nexusDesktop.close());
  } else {
    document.querySelector(".window-controls")?.remove();
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
