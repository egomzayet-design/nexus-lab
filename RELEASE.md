# NEXUS LAB — Public Release Guide

## Built artifacts (ready now)

| File | Path |
|------|------|
| Installer | `release/NEXUS_LAB_Setup.exe` |
| Portable | `release/NEXUS_LAB_Portable.exe` |
| Download page | `website/index.html` |

Local download page (when served): http://localhost:4177/website/

## Publish to GitHub Releases (shareable public URL)

1. Create a **public** GitHub repository (example name: `nexus-lab`).
2. Install [GitHub CLI](https://cli.github.com/) and sign in:

```powershell
gh auth login
```

3. Add the GitHub remote and push:

```powershell
git remote add github https://github.com/<YOUR_USER>/nexus-lab.git
git push -u github main
```

4. Create the release and upload both EXEs:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\publish-github-release.ps1 -Repo "<YOUR_USER>/nexus-lab" -Tag v2.0.0
```

Or tag and let GitHub Actions build + publish:

```powershell
git tag v2.0.0
git push github v2.0.0
```

5. **Shareable release URL:**

```
https://github.com/<YOUR_USER>/nexus-lab/releases/latest
```

Direct assets:

```
https://github.com/<YOUR_USER>/nexus-lab/releases/download/v2.0.0/NEXUS_LAB_Setup.exe
https://github.com/<YOUR_USER>/nexus-lab/releases/download/v2.0.0/NEXUS_LAB_Portable.exe
```

6. Point the download page GitHub button at your repo by editing `website/index.html` (`dl-release` href).

## Cursor Origin (code backup)

Repo created: `rayan-ajili/nexus-lab`  
Clone URL: `https://origin.cursor.com/rayan-ajili/nexus-lab.git`  
Note: Origin hosting is internal (not a public download CDN). Use GitHub Releases for public EXE downloads.

## Install test checklist

- [x] `NEXUS_LAB_Portable.exe` launches NEXUS LAB window
- [x] `NEXUS_LAB_Setup.exe` built (NSIS)
- [ ] Run Setup on a clean machine / path
- [ ] Open panel with F1; switch modes 1/2/3
