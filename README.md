# NEXUS LAB

Professional **offline Windows sandbox** with a neon gaming control panel.

## Security scope

- Runs only inside this owned offline application
- Does **not** inject into Rob Run or any third-party game
- Does **not** modify external process memory
- Does **not** bypass or interfere with Easy Anti-Cheat
- Aim Trainer / ESP Visualizer are **sandbox simulations only**

## Features

- Draggable control panel (black / white / neon green)
- Platform testing: speed, jump, teleport, invulnerability
- FOV overlay settings
- Aim Trainer (sensitivity, tracking, targets)
- ESP Visualizer (boxes, labels, distance, tracers)
- Profiles, hotkeys, visuals, live stats, save/load

## Windows builds

```bash
npm install
npm run build:icons
npm run dist
```

Outputs in `release/`:

- `NEXUS_LAB_Setup.exe` — NSIS installer
- `NEXUS_LAB_Portable.exe` — portable single EXE

## Run (dev)

```bash
npm install
npm start
```

## Download page

Open `website/index.html` locally, or host it with GitHub Pages / Releases.

## GitHub Releases

1. Create a public repo (e.g. `nexus-lab-app/nexus-lab`)
2. Tag a release: `v2.0.0`
3. Upload `NEXUS_LAB_Setup.exe` and `NEXUS_LAB_Portable.exe`
4. Share: `https://github.com/<owner>/<repo>/releases/latest`
