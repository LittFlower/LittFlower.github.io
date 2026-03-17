(function () {
  const storageKey = "theme";
  const root = document.documentElement;
  const mediaQuery =
    typeof window.matchMedia === "function"
      ? window.matchMedia("(prefers-color-scheme: dark)")
      : null;
  const currentScript = document.currentScript;
  const buildId = currentScript?.src
    ? new URL(currentScript.src, window.location.href).searchParams.get("v")
    : "";

  const readStorage = () => {
    try {
      return window.localStorage.getItem(storageKey);
    } catch (_) {
      return null;
    }
  };

  const writeStorage = (value) => {
    try {
      window.localStorage.setItem(storageKey, value);
    } catch (_) {
      return;
    }
  };

  const resolveTheme = (value) => (value === "dark" ? "dark" : "light");

  const applyTheme = (value) => {
    const theme = resolveTheme(value);
    root.setAttribute("data-theme", theme);
    if (document.body) {
      document.body.setAttribute("data-theme", theme);
    }
    return theme;
  };

  const updateButton = (value) => {
    const theme = resolveTheme(value);
    const button = document.querySelector("[data-theme-toggle]");
    if (!button) {
      return;
    }

    const label = button.querySelector("[data-theme-toggle-label]");
    const isDark = theme === "dark";
    button.setAttribute("aria-pressed", isDark ? "true" : "false");
    button.setAttribute("title", isDark ? "切换为浅色主题" : "切换为深色主题");
    if (label) {
      label.textContent = isDark ? "深色主题" : "浅色主题";
    }
  };

  const stored = readStorage();
  const initialTheme =
    stored === "light" || stored === "dark"
      ? stored
      : mediaQuery && mediaQuery.matches
        ? "dark"
        : "light";

  const sync = (value) => {
    const theme = applyTheme(value);
    updateButton(theme);
    return theme;
  };

  window.__setTheme = (value) => {
    const theme = sync(value);
    writeStorage(theme);
  };

  window.__toggleTheme = () => {
    const current = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
    const next = current === "dark" ? "light" : "dark";
    const theme = sync(next);
    writeStorage(theme);
  };

  const attachToggle = () => {
    const button = document.querySelector("[data-theme-toggle]");
    if (!button || button.__themeToggleBound) {
      return;
    }

    button.__themeToggleBound = true;
    button.addEventListener("click", (event) => {
      event.preventDefault();
      window.__toggleTheme();
    });
  };

  const init = () => {
    sync(root.getAttribute("data-theme") || initialTheme);
    attachToggle();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }

  const handleMediaChange = (event) => {
    const storedTheme = readStorage();
    if (storedTheme === "light" || storedTheme === "dark") {
      updateButton(storedTheme);
      return;
    }

    sync(event.matches ? "dark" : "light");
  };

  if (mediaQuery) {
    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleMediaChange);
    } else if (typeof mediaQuery.addListener === "function") {
      mediaQuery.addListener(handleMediaChange);
    }
  }

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      const swUrl = buildId ? `/sw.js?v=${buildId}` : "/sw.js";
      navigator.serviceWorker.register(swUrl).catch(() => {});
    });
  }
})();
