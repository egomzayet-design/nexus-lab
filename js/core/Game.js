import { Input } from "./Input.js";
import { Storage } from "./Storage.js";
import { Player } from "../player/Player.js";
import { World } from "../world/World.js";
import { Checkpoints } from "../world/Checkpoints.js";
import { DebugMenu } from "../debug/DebugMenu.js";
import { FovOverlay } from "../sandbox/FovOverlay.js";
import { AimTrainer } from "../sandbox/AimTrainer.js";
import { EspSandbox } from "../sandbox/EspSandbox.js";

/**
 * Offline sandbox runtime: platformer + aim trainer + ESP visualizer.
 */
export class Game {
  /**
   * @param {{
   *   canvas: HTMLCanvasElement,
   *   debugRoot: HTMLElement,
   *   hudSpeed: HTMLElement,
   *   hudInvuln: HTMLElement,
   *   hudMode: HTMLElement,
   * }} els
   */
  constructor(els) {
    this.canvas = els.canvas;
    this.ctx = els.canvas.getContext("2d", { alpha: false });
    this.hudSpeed = els.hudSpeed;
    this.hudInvuln = els.hudInvuln;
    this.hudMode = els.hudMode;

    const saved = Storage.load();
    this.mode = saved.mode || "platform";
    this.visuals = { ...saved.visuals };

    this.world = new World(els.canvas.width, els.canvas.height);
    this.checkpoints = new Checkpoints(this.world.checkpoints);
    const spawn = this.checkpoints.current;
    this.player = new Player(spawn.x - 14, spawn.y - 40);
    this.player.speedMultiplier = saved.speedMultiplier;
    this.player.jumpMultiplier = saved.jumpMultiplier;
    this.player.invulnerable = saved.invulnerable;

    this.fov = new FovOverlay(saved.fov);
    this.aim = new AimTrainer(els.canvas.width, els.canvas.height, saved.aim);
    this.esp = new EspSandbox(els.canvas.width, els.canvas.height, saved.esp);

    this.input = new Input(window);
    this.debug = new DebugMenu({
      root: els.debugRoot,
      player: this.player,
      checkpoints: this.checkpoints,
      getMode: () => this.mode,
      setMode: (m) => this.setMode(m),
      getFov: () => this.fov.settings,
      setFov: (p) => this.fov.apply(p),
      getAim: () => this.aim.settings,
      setAim: (p) => this.aim.apply(p),
      resetAimScore: () => this.aim.resetScore(),
      respawnAim: () => this.aim.respawn(),
      getEsp: () => this.esp.settings,
      setEsp: (p) => this.esp.apply(p),
      getVisuals: () => this.visuals,
      setVisuals: (p) => Object.assign(this.visuals, p),
      applyFullSettings: (s) => this.applyFullSettings(s),
      collectSettings: () => this.collectSettings(),
      onHud: (state) => this.#updateHud(state),
    });

    this.#running = false;
    this.#last = 0;
    this.#fps = 60;
    this.#frameMs = 16.7;
    this.#raf = 0;
    this.#fpsFrames = 0;
    this.#fpsTimer = 0;
    this.#boundKeyDown = (e) => {
      this.debug.handleKeyDown(e);
    };
    this.#boundMouseMove = (e) => this.#onMouseMove(e);
    this.#boundMouseDown = (e) => this.#onMouseDown(e);
    this.#boundContext = (e) => e.preventDefault();
  }

  #running;
  #last;
  #fps;
  #frameMs;
  #raf;
  #fpsFrames;
  #fpsTimer;
  #boundKeyDown;
  #boundMouseMove;
  #boundMouseDown;
  #boundContext;

  start() {
    if (this.#running) return;
    this.#running = true;
    this.input.start();
    window.addEventListener("keydown", this.#boundKeyDown, true);
    this.canvas.addEventListener("mousemove", this.#boundMouseMove);
    this.canvas.addEventListener("mousedown", this.#boundMouseDown);
    this.canvas.addEventListener("contextmenu", this.#boundContext);
    this.#last = performance.now();
    this.#raf = requestAnimationFrame((t) => this.#frame(t));
    this.#updateHud({
      speed: this.player.speedMultiplier,
      invuln: this.player.invulnerable,
      mode: this.mode,
      showHud: this.visuals.showHud,
    });
  }

  stop() {
    this.#running = false;
    this.input.stop();
    window.removeEventListener("keydown", this.#boundKeyDown, true);
    this.canvas.removeEventListener("mousemove", this.#boundMouseMove);
    this.canvas.removeEventListener("mousedown", this.#boundMouseDown);
    this.canvas.removeEventListener("contextmenu", this.#boundContext);
    cancelAnimationFrame(this.#raf);
  }

  setMode(mode) {
    this.mode = mode;
    this.#updateHud({
      speed: this.player.speedMultiplier,
      invuln: this.player.invulnerable,
      mode: this.mode,
      showHud: this.visuals.showHud,
    });
  }

  applyFullSettings(s) {
    this.mode = s.mode || "platform";
    this.player.speedMultiplier = s.speedMultiplier;
    this.player.jumpMultiplier = s.jumpMultiplier;
    this.player.invulnerable = s.invulnerable;
    this.fov.apply(s.fov);
    this.aim.apply(s.aim);
    this.esp.apply(s.esp);
    Object.assign(this.visuals, s.visuals);
  }

  collectSettings() {
    return {
      mode: this.mode,
      speedMultiplier: this.player.speedMultiplier,
      jumpMultiplier: this.player.jumpMultiplier,
      invulnerable: this.player.invulnerable,
      fov: { ...this.fov.settings },
      aim: { ...this.aim.settings },
      esp: { ...this.esp.settings },
      visuals: { ...this.visuals },
      hotkeys: this.debug.hotkeys.toJSON(),
      menuPosition: {
        x: this.debug.ui.el.offsetLeft,
        y: this.debug.ui.el.offsetTop,
      },
      activeProfile: this.debug.settings.activeProfile || "Default",
    };
  }

  #onMouseMove(e) {
    if (this.mode !== "aim" && this.mode !== "esp") return;
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    if (this.mode === "aim") {
      if (e.movementX || e.movementY) {
        this.aim.moveCrosshair(e.movementX, e.movementY);
      } else {
        this.aim.setCrosshair(x, y);
      }
    } else if (this.mode === "esp") {
      this.esp.observer.x = x;
      this.esp.observer.y = y;
    }
  }

  #onMouseDown(e) {
    if (this.mode !== "aim") return;
    if (e.button === 0) this.aim.fire();
  }

  #frame(now) {
    if (!this.#running) return;

    let dt = (now - this.#last) / 1000;
    this.#last = now;
    if (dt > 0.05) dt = 0.05;

    this.#frameMs = dt * 1000;
    this.#fpsFrames += 1;
    this.#fpsTimer += dt;
    if (this.#fpsTimer >= 0.25) {
      this.#fps = this.#fpsFrames / this.#fpsTimer;
      this.#fpsFrames = 0;
      this.#fpsTimer = 0;
    }

    if (this.mode === "platform") {
      this.player.update(this.input, dt, {
        platforms: this.world.platforms,
        hazards: this.world.hazards,
        bounds: this.world.bounds,
      });
    } else if (this.mode === "aim") {
      if (this.input.consumePress("Space")) this.aim.fire();
      this.aim.update(dt);
    } else if (this.mode === "esp") {
      this.esp.update(dt);
    }

    this.#draw();

    this.debug.updateStats(this.#statsPayload());

    this.input.endFrame();
    this.#raf = requestAnimationFrame((t) => this.#frame(t));
  }

  #statsPayload() {
    const base = {
      FPS: Math.round(this.#fps),
      "Frame ms": this.#frameMs,
      Mode: this.mode,
    };
    if (this.mode === "platform") {
      const p = this.player.getStats();
      return {
        ...base,
        "Pos X": p.x,
        "Pos Y": p.y,
        "Vel X": p.vx,
        "Vel Y": p.vy,
        Ground: p.onGround,
        Alive: p.alive,
        "Eff Speed": p.effectiveSpeed,
        "Eff Jump": p.effectiveJump,
        Invuln: p.invulnerable,
      };
    }
    if (this.mode === "aim") {
      const a = this.aim.getStats();
      return {
        ...base,
        Score: a.score,
        Hits: a.hits,
        Misses: a.misses,
        Accuracy: a.accuracy,
        Combo: a.combo,
        Sens: a.sensitivity,
        Targets: a.targets,
      };
    }
    const e = this.esp.getStats();
    return {
      ...base,
      Entities: e.entities,
      "Obs X": e.observerX,
      "Obs Y": e.observerY,
      ESP: e.espEnabled,
      "Max Dist": e.maxDistance,
    };
  }

  #draw() {
    const ctx = this.ctx;
    if (this.mode === "platform") {
      this.world.draw(ctx);
      this.checkpoints.draw(ctx);
      this.fov.draw(ctx, this.player.cx, this.player.cy);
      this.player.draw(ctx);
      ctx.save();
      ctx.fillStyle = "rgba(57,255,20,0.55)";
      ctx.font = "12px JetBrains Mono";
      ctx.fillText("PLATFORM · A/D move · W/Space jump · F1 panel · 1/2/3 modes", 16, 24);
      ctx.restore();
    } else if (this.mode === "aim") {
      this.aim.draw(ctx, this.visuals, this.fov);
    } else {
      this.esp.draw(ctx, this.visuals, this.fov);
    }
  }

  #updateHud(state) {
    const show = state.showHud !== false;
    this.hudSpeed.parentElement.style.display = show ? "flex" : "none";
    this.hudSpeed.textContent = `SPD ×${Number(state.speed).toFixed(2)}`;
    this.hudInvuln.textContent = state.invuln ? "INVULN ON" : "INVULN OFF";
    this.hudInvuln.classList.toggle("hud-off", !state.invuln);
    this.hudMode.textContent = `MODE ${(state.mode || this.mode).toUpperCase()}`;
  }
}
