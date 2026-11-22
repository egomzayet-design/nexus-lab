import { Storage } from "../core/Storage.js";
import { Hotkeys } from "./Hotkeys.js";
import { MenuUI } from "./MenuUI.js";
import { StatsPanel } from "./panels/StatsPanel.js";
import { ControlsPanel } from "./panels/ControlsPanel.js";
import { HotkeysPanel } from "./panels/HotkeysPanel.js";
import { SettingsPanel } from "./panels/SettingsPanel.js";
import { FovPanel } from "./panels/FovPanel.js";
import { AimPanel } from "./panels/AimPanel.js";
import { EspPanel } from "./panels/EspPanel.js";
import { VisualsPanel } from "./panels/VisualsPanel.js";
import { ProfilesPanel } from "./panels/ProfilesPanel.js";

/**
 * Professional draggable gaming control panel for the offline sandbox.
 */
export class DebugMenu {
  /**
   * @param {{
   *   root: HTMLElement,
   *   player: import('../player/Player.js').Player,
   *   checkpoints: import('../world/Checkpoints.js').Checkpoints,
   *   getMode: () => string,
   *   setMode: (mode: string) => void,
   *   getFov: () => object,
   *   setFov: (partial: object) => void,
   *   getAim: () => object,
   *   setAim: (partial: object) => void,
   *   resetAimScore: () => void,
   *   respawnAim: () => void,
   *   getEsp: () => object,
   *   setEsp: (partial: object) => void,
   *   getVisuals: () => object,
   *   setVisuals: (partial: object) => void,
   *   applyFullSettings: (settings: object) => void,
   *   collectSettings: () => object,
   *   onHud?: (state: object) => void,
   * }} deps
   */
  constructor(deps) {
    this.deps = deps;
    this.player = deps.player;
    this.checkpoints = deps.checkpoints;
    this.onHud = deps.onHud;

    this.settings = Storage.load();
    this.profiles = Storage.loadProfiles();
    this.hotkeys = new Hotkeys(this.settings.hotkeys);

    this.ui = new MenuUI(deps.root, {
      title: "NEXUS",
      tabs: [
        { id: "controls", label: "Play" },
        { id: "fov", label: "FOV" },
        { id: "aim", label: "Aim" },
        { id: "esp", label: "ESP" },
        { id: "visuals", label: "Visual" },
        { id: "stats", label: "Stats" },
        { id: "hotkeys", label: "Keys" },
        { id: "profiles", label: "Profiles" },
        { id: "settings", label: "Config" },
      ],
      onClose: () => this.setOpen(false),
      onTab: (id) => this.#showTab(id),
      onMove: (x, y) => {
        this.settings.menuPosition = { x, y };
      },
    });

    this.ui.setPosition(this.settings.menuPosition.x, this.settings.menuPosition.y);

    this.controlsPanel = new ControlsPanel({
      getSpeed: () => this.player.speedMultiplier,
      getJump: () => this.player.jumpMultiplier,
      getInvuln: () => this.player.invulnerable,
      getCheckpoints: () => this.checkpoints.list,
      getActiveCheckpointId: () => this.checkpoints.current.id,
      onSpeed: (v) => {
        this.player.speedMultiplier = v;
        this.settings.speedMultiplier = v;
        this.#emitHud();
      },
      onJump: (v) => {
        this.player.jumpMultiplier = v;
        this.settings.jumpMultiplier = v;
      },
      onInvuln: (v) => {
        this.player.invulnerable = v;
        this.settings.invulnerable = v;
        this.#emitHud();
        this.ui.toast(v ? "Invulnerability ON" : "Invulnerability OFF");
      },
      onTeleport: (id) => this.teleportTo(id),
      onReset: () => this.resetPlayer(),
    });

    this.fovPanel = new FovPanel({
      get: () => this.deps.getFov(),
      onChange: (p) => {
        this.deps.setFov(p);
        Object.assign(this.settings.fov, p);
      },
    });

    this.aimPanel = new AimPanel({
      get: () => this.deps.getAim(),
      onChange: (p) => {
        this.deps.setAim(p);
        Object.assign(this.settings.aim, p);
      },
      onResetScore: () => this.deps.resetAimScore(),
      onRespawn: () => this.deps.respawnAim(),
    });

    this.espPanel = new EspPanel({
      get: () => this.deps.getEsp(),
      onChange: (p) => {
        this.deps.setEsp(p);
        Object.assign(this.settings.esp, p);
      },
    });

    this.visualsPanel = new VisualsPanel({
      get: () => this.deps.getVisuals(),
      onChange: (p) => {
        this.deps.setVisuals(p);
        Object.assign(this.settings.visuals, p);
        this.#emitHud();
      },
    });

    this.statsPanel = new StatsPanel();
    this.hotkeysPanel = new HotkeysPanel({
      hotkeys: this.hotkeys,
      onChange: () => {
        this.settings.hotkeys = this.hotkeys.toJSON();
      },
      toast: (m) => this.ui.toast(m),
    });

    this.profilesPanel = new ProfilesPanel({
      list: () => Object.keys(this.profiles),
      getActive: () => this.settings.activeProfile || "Default",
      onSaveAs: (name) => this.saveProfile(name),
      onLoad: (name) => this.loadProfile(name),
      onDelete: (name) => this.deleteProfile(name),
    });

    this.settingsPanel = new SettingsPanel({
      onSave: () => this.save(),
      onLoad: () => this.load(),
      onClear: () => this.clearSaved(),
      getMode: () => this.deps.getMode(),
      onMode: (mode) => {
        this.deps.setMode(mode);
        this.settings.mode = mode;
        this.#emitHud();
        this.ui.toast(`Mode → ${mode}`);
      },
    });

    this.#panelViews = {
      controls: this.ui.registerPanel("controls", this.controlsPanel.el),
      fov: this.ui.registerPanel("fov", this.fovPanel.el),
      aim: this.ui.registerPanel("aim", this.aimPanel.el),
      esp: this.ui.registerPanel("esp", this.espPanel.el),
      visuals: this.ui.registerPanel("visuals", this.visualsPanel.el),
      stats: this.ui.registerPanel("stats", this.statsPanel.el),
      hotkeys: this.ui.registerPanel("hotkeys", this.hotkeysPanel.el),
      profiles: this.ui.registerPanel("profiles", this.profilesPanel.el),
      settings: this.ui.registerPanel("settings", this.settingsPanel.el),
    };

    this.#emitHud();
  }

  #panelViews;

  get isOpen() {
    return this.ui.open;
  }

  setOpen(open) {
    this.ui.setOpen(open);
    if (open) {
      this.#syncAllPanels();
      this.ui.toast("Control panel open");
    }
  }

  toggle() {
    this.setOpen(!this.ui.open);
  }

  handleKeyDown(e) {
    if (this.hotkeys.handleKeyDown(e)) return true;

    const code = e.code;
    if (
      this.hotkeys.matches("toggleMenu", code) ||
      this.hotkeys.matches("toggleMenuAlt", code)
    ) {
      e.preventDefault();
      this.toggle();
      return true;
    }

    if (this.hotkeys.matches("modePlatform", code)) {
      e.preventDefault();
      this.deps.setMode("platform");
      this.settings.mode = "platform";
      this.settingsPanel.syncMode();
      this.#emitHud();
      return true;
    }
    if (this.hotkeys.matches("modeAim", code)) {
      e.preventDefault();
      this.deps.setMode("aim");
      this.settings.mode = "aim";
      this.settingsPanel.syncMode();
      this.#emitHud();
      return true;
    }
    if (this.hotkeys.matches("modeEsp", code)) {
      e.preventDefault();
      this.deps.setMode("esp");
      this.settings.mode = "esp";
      this.settingsPanel.syncMode();
      this.#emitHud();
      return true;
    }

    if (this.hotkeys.matches("toggleFov", code)) {
      e.preventDefault();
      const next = !this.deps.getFov().enabled;
      this.deps.setFov({ enabled: next });
      this.settings.fov.enabled = next;
      this.fovPanel.sync();
      this.ui.toast(next ? "FOV ON" : "FOV OFF");
      return true;
    }

    if (this.hotkeys.matches("toggleEsp", code)) {
      e.preventDefault();
      const next = !this.deps.getEsp().enabled;
      this.deps.setEsp({ enabled: next });
      this.settings.esp.enabled = next;
      this.espPanel.sync();
      this.ui.toast(next ? "ESP ON" : "ESP OFF");
      return true;
    }

    if (this.hotkeys.matches("toggleInvuln", code)) {
      e.preventDefault();
      const next = !this.player.invulnerable;
      this.player.invulnerable = next;
      this.settings.invulnerable = next;
      this.controlsPanel.syncFromApi();
      this.#emitHud();
      this.ui.toast(next ? "Invulnerability ON" : "Invulnerability OFF");
      return true;
    }

    if (this.hotkeys.matches("teleportNext", code)) {
      e.preventDefault();
      this.teleportNext();
      return true;
    }

    if (this.hotkeys.matches("resetPlayer", code)) {
      e.preventDefault();
      this.resetPlayer();
      return true;
    }

    return false;
  }

  teleportTo(id) {
    const cp = this.checkpoints.goTo(id);
    if (!cp) return;
    this.player.teleport(cp.x, cp.y);
    this.player.alive = true;
    this.controlsPanel.syncFromApi();
    this.ui.toast(`Teleported → ${cp.label}`);
  }

  teleportNext() {
    const cp = this.checkpoints.next();
    this.player.teleport(cp.x, cp.y);
    this.player.alive = true;
    this.controlsPanel.syncFromApi();
    this.ui.toast(`Teleported → ${cp.label}`);
  }

  resetPlayer() {
    const spawn = this.checkpoints.goTo("spawn") ?? this.checkpoints.list[0];
    this.player.reset(spawn.x - this.player.w / 2, spawn.y - this.player.h);
    this.controlsPanel.syncFromApi();
    this.ui.toast("Player reset");
  }

  updateStats(stats) {
    if (!this.ui.open || this.ui.activeTab !== "stats") return;
    this.statsPanel.update(stats);
  }

  save() {
    const collected = this.deps.collectSettings();
    this.settings = {
      ...this.settings,
      ...collected,
      hotkeys: this.hotkeys.toJSON(),
      menuPosition: {
        x: this.ui.el.offsetLeft,
        y: this.ui.el.offsetTop,
      },
    };
    Storage.save(this.settings);
    this.ui.toast("Configuration saved");
  }

  load() {
    this.settings = Storage.load();
    this.hotkeys.bindings = { ...this.settings.hotkeys };
    this.deps.applyFullSettings(this.settings);
    this.ui.setPosition(this.settings.menuPosition.x, this.settings.menuPosition.y);
    this.#syncAllPanels();
    this.#emitHud();
    this.ui.toast("Configuration loaded");
  }

  clearSaved() {
    this.settings = Storage.clear();
    this.hotkeys.resetDefaults();
    this.deps.applyFullSettings(this.settings);
    this.ui.setPosition(this.settings.menuPosition.x, this.settings.menuPosition.y);
    this.#syncAllPanels();
    this.#emitHud();
    this.ui.toast("Saved configuration cleared");
  }

  saveProfile(name) {
    const snapshot = {
      ...this.deps.collectSettings(),
      hotkeys: this.hotkeys.toJSON(),
      menuPosition: {
        x: this.ui.el.offsetLeft,
        y: this.ui.el.offsetTop,
      },
      activeProfile: name,
    };
    this.profiles[name] = snapshot;
    this.settings.activeProfile = name;
    Storage.saveProfiles(this.profiles);
    Storage.save({ ...this.settings, ...snapshot });
    this.ui.toast(`Profile saved: ${name}`);
  }

  loadProfile(name) {
    const profile = this.profiles[name];
    if (!profile) return;
    this.settings = Storage.load();
    Object.assign(this.settings, profile);
    this.settings.activeProfile = name;
    this.hotkeys.bindings = { ...this.settings.hotkeys };
    this.deps.applyFullSettings(this.settings);
    this.#syncAllPanels();
    this.#emitHud();
    this.ui.toast(`Profile loaded: ${name}`);
  }

  deleteProfile(name) {
    if (name === "Default") return;
    delete this.profiles[name];
    Storage.saveProfiles(this.profiles);
    if (this.settings.activeProfile === name) {
      this.settings.activeProfile = "Default";
    }
    this.ui.toast(`Deleted profile: ${name}`);
  }

  #syncAllPanels() {
    this.controlsPanel.syncFromApi();
    this.fovPanel.sync();
    this.aimPanel.sync();
    this.espPanel.sync();
    this.visualsPanel.sync();
    this.hotkeysPanel.render();
    this.profilesPanel.render();
    this.settingsPanel.syncMode();
  }

  #showTab(id) {
    this.#panelViews[id]?.show();
    if (id === "controls") this.controlsPanel.syncFromApi();
    if (id === "fov") this.fovPanel.sync();
    if (id === "aim") this.aimPanel.sync();
    if (id === "esp") this.espPanel.sync();
    if (id === "visuals") this.visualsPanel.sync();
    if (id === "profiles") this.profilesPanel.render();
    if (id === "settings") this.settingsPanel.syncMode();
  }

  #emitHud() {
    this.onHud?.({
      speed: this.player.speedMultiplier,
      invuln: this.player.invulnerable,
      mode: this.deps.getMode(),
      showHud: this.deps.getVisuals().showHud,
    });
  }
}
