const STORAGE_KEY = "nexus-lab-config-v2";
const PROFILES_KEY = "nexus-lab-profiles-v2";

export const DEFAULT_HOTKEYS = Object.freeze({
  toggleMenu: "Backquote",
  toggleMenuAlt: "F1",
  toggleInvuln: "KeyI",
  teleportNext: "KeyT",
  resetPlayer: "KeyR",
  modePlatform: "Digit1",
  modeAim: "Digit2",
  modeEsp: "Digit3",
  toggleFov: "KeyF",
  toggleEsp: "KeyE",
});

export const DEFAULTS = Object.freeze({
  mode: "platform",
  speedMultiplier: 1,
  jumpMultiplier: 1,
  invulnerable: false,
  menuPosition: { x: 48, y: 72 },
  hotkeys: { ...DEFAULT_HOTKEYS },
  fov: {
    enabled: true,
    radius: 180,
    thickness: 2,
    opacity: 0.85,
    fill: false,
  },
  aim: {
    sensitivity: 1.15,
    targetSpeed: 1,
    targetSize: 28,
    trackingAssist: 0.15,
    spawnCount: 4,
    score: 0,
  },
  esp: {
    enabled: true,
    boxes: true,
    labels: true,
    distance: true,
    tracers: true,
    maxDistance: 900,
    boxThickness: 2,
  },
  visuals: {
    showGrid: true,
    showHud: true,
    glowIntensity: 1,
    crosshairSize: 10,
    crosshairGap: 4,
  },
  activeProfile: "Default",
});

/**
 * Persist settings + named profiles (localStorage — offline app only).
 */
export class Storage {
  static getDefaults() {
    return JSON.parse(JSON.stringify(DEFAULTS));
  }

  static load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return Storage.getDefaults();
      return Storage.#merge(Storage.getDefaults(), JSON.parse(raw));
    } catch {
      return Storage.getDefaults();
    }
  }

  static save(settings) {
    const payload = Storage.#merge(Storage.getDefaults(), settings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return payload;
  }

  static clear() {
    localStorage.removeItem(STORAGE_KEY);
    return Storage.getDefaults();
  }

  static loadProfiles() {
    try {
      const raw = localStorage.getItem(PROFILES_KEY);
      if (!raw) {
        return { Default: Storage.getDefaults() };
      }
      const parsed = JSON.parse(raw);
      if (!parsed.Default) parsed.Default = Storage.getDefaults();
      return parsed;
    } catch {
      return { Default: Storage.getDefaults() };
    }
  }

  static saveProfiles(profiles) {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  }

  static #merge(base, override) {
    const out = { ...base, ...override };
    out.hotkeys = { ...base.hotkeys, ...(override.hotkeys || {}) };
    out.menuPosition = { ...base.menuPosition, ...(override.menuPosition || {}) };
    out.fov = { ...base.fov, ...(override.fov || {}) };
    out.aim = { ...base.aim, ...(override.aim || {}) };
    out.esp = { ...base.esp, ...(override.esp || {}) };
    out.visuals = { ...base.visuals, ...(override.visuals || {}) };
    return out;
  }
}
