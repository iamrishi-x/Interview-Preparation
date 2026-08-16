(function () {
  const STORAGE_KEY = "genai_prep_progress_v1";
  const THEME_KEY = "genai_prep_theme";
  const EXPORT_VERSION = "1.0.0";

  function getPreferredTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") {
      return saved;
    }
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
  }

  function updateThemeToggleLabel(theme) {
    const next = theme === "light" ? "dark" : "light";
    document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
      btn.textContent = next === "light" ? "Light" : "Dark";
      btn.setAttribute("aria-label", `Switch to ${next} theme`);
      btn.setAttribute("aria-pressed", String(theme === "light"));
    });
  }

  function setupThemeToggle() {
    const current = document.documentElement.getAttribute("data-theme") || "dark";
    updateThemeToggleLabel(current);
    document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const themeNow = document.documentElement.getAttribute("data-theme") || "dark";
        const next = themeNow === "light" ? "dark" : "light";
        applyTheme(next);
        updateThemeToggleLabel(next);
      });
    });
  }

  function safeParse(jsonText) {
    try {
      return JSON.parse(jsonText);
    } catch (_error) {
      return null;
    }
  }

  function readState() {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? safeParse(raw) : null;
    if (!parsed || !Array.isArray(parsed.items)) {
      return { version: EXPORT_VERSION, updatedAt: null, items: [] };
    }
    return parsed;
  }

  function writeState(state) {
    state.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function stateToMap(state) {
    const map = new Map();
    state.items.forEach((item) => {
      if (item && typeof item.id === "string") {
        map.set(item.id, {
          id: item.id,
          checked: Boolean(item.checked),
          updatedAt: item.updatedAt || new Date().toISOString(),
        });
      }
    });
    return map;
  }

  function mapToState(map) {
    return {
      version: EXPORT_VERSION,
      updatedAt: new Date().toISOString(),
      items: Array.from(map.values()).sort((a, b) => a.id.localeCompare(b.id)),
    };
  }

  function setStatus(message) {
    const statusNode = document.querySelector("[data-progress-status]");
    if (statusNode) {
      statusNode.textContent = message;
    }
  }

  function applyChecklistState() {
    const state = readState();
    const map = stateToMap(state);
    const checks = document.querySelectorAll("input[type='checkbox'][data-check-id]");

    checks.forEach((check) => {
      const id = check.getAttribute("data-check-id");
      if (!id) {
        return;
      }
      const item = map.get(id);
      if (item) {
        check.checked = item.checked;
      }
      check.addEventListener("change", () => {
        map.set(id, {
          id,
          checked: check.checked,
          updatedAt: new Date().toISOString(),
        });
        writeState(mapToState(map));
      });
    });
  }

  function exportProgress() {
    const btn = document.querySelector("[data-export-progress]");
    if (!btn) {
      return;
    }
    btn.addEventListener("click", () => {
      const state = readState();
      const payload = JSON.stringify(
        {
          version: EXPORT_VERSION,
          updatedAt: new Date().toISOString(),
          items: Array.isArray(state.items) ? state.items : [],
        },
        null,
        2,
      );

      const blob = new Blob([payload], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "genai-prep-progress.json";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      setStatus("Progress exported.");
    });
  }

  function mergeImportedState(imported) {
    const current = stateToMap(readState());
    const incoming = stateToMap(imported);

    incoming.forEach((item, id) => {
      const existing = current.get(id);
      if (!existing) {
        current.set(id, item);
        return;
      }
      const existingTime = Date.parse(existing.updatedAt || "");
      const incomingTime = Date.parse(item.updatedAt || "");
      if (Number.isNaN(existingTime) || incomingTime >= existingTime) {
        current.set(id, item);
      }
    });

    writeState(mapToState(current));
  }

  function importProgress() {
    const trigger = document.querySelector("[data-import-progress]");
    const input = document.querySelector("[data-import-progress-input]");
    if (!trigger || !input) {
      return;
    }

    trigger.addEventListener("click", () => input.click());

    input.addEventListener("change", async () => {
      const file = input.files && input.files[0];
      if (!file) {
        return;
      }

      const text = await file.text();
      const parsed = safeParse(text);
      if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.items)) {
        setStatus("Import failed: invalid JSON shape.");
        return;
      }
      if (parsed.version !== EXPORT_VERSION) {
        setStatus("Import failed: unsupported version.");
        return;
      }

      mergeImportedState(parsed);
      applyChecklistState();
      setStatus("Progress imported and merged.");
      input.value = "";
    });
  }

  function setupNav() {
    const toggle = document.querySelector("[data-nav-toggle]");
    const panel = document.querySelector("[data-nav-panel]");
    if (!toggle || !panel) {
      return;
    }

    const setOpen = (isOpen) => {
      panel.setAttribute("data-open", String(isOpen));
      toggle.setAttribute("aria-expanded", String(isOpen));
    };

    setOpen(false);
    toggle.addEventListener("click", () => {
      const isOpen = panel.getAttribute("data-open") === "true";
      setOpen(!isOpen);
    });

    panel.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setOpen(false));
    });
  }

  function setupOnThisPage() {
    const source = document.querySelector("[data-on-this-page-source]");
    const target = document.querySelector("[data-on-this-page]");
    if (!source || !target) {
      return;
    }

    const headings = Array.from(source.querySelectorAll("h2[id]"));
    if (!headings.length) {
      return;
    }

    const list = document.createElement("ul");
    headings.forEach((heading) => {
      const li = document.createElement("li");
      const link = document.createElement("a");
      link.href = `#${heading.id}`;
      link.textContent = heading.textContent || heading.id;
      li.appendChild(link);
      list.appendChild(li);
    });
    target.appendChild(list);
  }

  applyTheme(getPreferredTheme());

  document.addEventListener("DOMContentLoaded", () => {
    setupThemeToggle();
    setupNav();
    setupOnThisPage();
    applyChecklistState();
    exportProgress();
    importProgress();
  });
})();
