(function () {
  const cfg = window.NEXUS_SITE || {};
  const downloads = cfg.downloads || {};

  function formatBytes(bytes) {
    if (!bytes || bytes <= 0) return "—";
    const mb = bytes / (1024 * 1024);
    return mb >= 10 ? `${mb.toFixed(1)} MB` : `${mb.toFixed(2)} MB`;
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function setStatus(kind, message, type) {
    const el = document.getElementById(`status-${kind}`);
    if (!el) return;
    el.textContent = message || "";
    el.classList.toggle("is-error", type === "error");
    el.classList.toggle("is-ok", type === "ok");
  }

  function hydrateMeta() {
    setText("meta-setup-version", cfg.version || "2.0.0");
    setText("meta-portable-version", cfg.version || "2.0.0");
    setText("meta-setup-size", formatBytes(downloads.setup && downloads.setup.sizeBytes));
    setText("meta-portable-size", formatBytes(downloads.portable && downloads.portable.sizeBytes));
    setText("meta-setup-name", (downloads.setup && downloads.setup.name) || "NEXUS_LAB_Setup.exe");
    setText("meta-portable-name", (downloads.portable && downloads.portable.name) || "NEXUS_LAB_Portable.exe");

    const releases = document.getElementById("releases-link");
    if (releases) {
      if (cfg.releasesUrl) {
        releases.href = cfg.releasesUrl;
      } else {
        releases.href = "#download";
        releases.removeAttribute("target");
      }
    }
  }

  async function downloadFile(kind) {
    const item = downloads[kind];
    const btn = document.getElementById(kind === "setup" ? "dl-setup" : "dl-portable");
    const label = btn && btn.querySelector(".btn-label");
    const progress = btn && btn.querySelector(".btn-progress");

    if (!item || !item.url) {
      setStatus(
        kind,
        "Download URL is not configured yet. Publish GitHub Releases, then refresh this page.",
        "error"
      );
      return;
    }

    if (/localhost|127\.0\.0\.1|file:/i.test(item.url)) {
      setStatus(kind, "Blocked unsafe local download URL.", "error");
      return;
    }

    btn.disabled = true;
    if (progress) {
      progress.hidden = false;
      progress.textContent = "0%";
    }
    setStatus(kind, "Starting download…", "ok");

    try {
      const response = await fetch(item.url, { redirect: "follow" });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} — file unavailable`);
      }

      const total = Number(response.headers.get("Content-Length")) || item.sizeBytes || 0;
      const reader = response.body && response.body.getReader ? response.body.getReader() : null;

      let blob;
      if (!reader) {
        blob = await response.blob();
        if (progress) progress.textContent = "100%";
      } else {
        const chunks = [];
        let received = 0;
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
          received += value.length;
          if (progress && total) {
            progress.textContent = `${Math.min(100, Math.round((received / total) * 100))}%`;
          } else if (progress) {
            progress.textContent = `${Math.round(received / (1024 * 1024))} MB`;
          }
        }
        blob = new Blob(chunks, {
          type: response.headers.get("Content-Type") || "application/octet-stream",
        });
        if (progress) progress.textContent = "100%";
      }

      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = item.name || `${kind}.exe`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
      setStatus(kind, "Download complete. If the save dialog did not open, check your browser downloads.", "ok");
    } catch (err) {
      // Fallback: navigate directly to the release asset (works even when CORS blocks fetch).
      setStatus(kind, `Fetch failed (${err.message}). Opening direct download…`, "error");
      const a = document.createElement("a");
      a.href = item.url;
      a.rel = "noopener";
      a.target = "_blank";
      a.download = item.name || "";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } finally {
      btn.disabled = false;
      if (progress) progress.hidden = true;
      if (label) label.textContent = kind === "setup" ? "Download Setup" : "Download Portable";
    }
  }

  function bindDownloads() {
    const setup = document.getElementById("dl-setup");
    const portable = document.getElementById("dl-portable");
    const main = document.getElementById("btn-download-main");

    if (setup) setup.addEventListener("click", () => downloadFile("setup"));
    if (portable) portable.addEventListener("click", () => downloadFile("portable"));
    if (main) {
      main.addEventListener("click", (e) => {
        if (downloads.setup && downloads.setup.url) {
          e.preventDefault();
          document.getElementById("download").scrollIntoView({ behavior: "smooth" });
          downloadFile("setup");
        }
      });
    }
  }

  function bindNav() {
    const toggle = document.getElementById("nav-toggle");
    const nav = document.getElementById("site-nav");
    if (!toggle || !nav) return;

    toggle.addEventListener("click", () => {
      const open = !nav.classList.contains("is-open");
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  function bindReveal() {
    const nodes = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      nodes.forEach((n) => n.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    nodes.forEach((n) => io.observe(n));
  }

  hydrateMeta();
  bindDownloads();
  bindNav();
  bindReveal();
})();
