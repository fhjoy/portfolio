document.addEventListener("DOMContentLoaded", () => {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const root = document.documentElement;
  const language = root.lang === "en" ? "en" : "de";
  const locale = language === "en" ? "en-GB" : "de-DE";
  const uiCopy =
    language === "en"
      ? {
          activateDarkTheme: "Use dark colour scheme",
          activateLightTheme: "Use light colour scheme",
          closeMenu: "Close menu",
          openMenu: "Open menu",
          qualityPassing: "Quality gate passed",
          qualityAttention: "Review recommended",
          qualityUnavailable: "Quality data unavailable",
          lastAudited: "Last audited",
          commit: "commit",
          measurements: "measurements",
          outOf: "out of",
        }
      : {
          activateDarkTheme: "Dunkles Farbschema aktivieren",
          activateLightTheme: "Helles Farbschema aktivieren",
          closeMenu: "Menü schließen",
          openMenu: "Menü öffnen",
          qualityPassing: "Qualitätsziel erreicht",
          qualityAttention: "Überprüfung empfohlen",
          qualityUnavailable: "Qualitätsdaten nicht verfügbar",
          lastAudited: "Zuletzt geprüft",
          commit: "Commit",
          measurements: "Messungen",
          outOf: "von",
        };

  /* ─────────────────────────────────────────
     1. LANGUAGE PREFERENCE
  ───────────────────────────────────────── */
  document.querySelectorAll("[data-language-switch]").forEach((link) => {
    link.addEventListener("click", () => {
      const nextLanguage = link.dataset.languageSwitch;
      if (nextLanguage !== "de" && nextLanguage !== "en") return;

      try {
        localStorage.setItem("portfolio-language", nextLanguage);
      } catch {
        // The link still changes language when storage is unavailable.
      }

      const destination = new URL(
        link.getAttribute("href"),
        window.location.href,
      );
      destination.search = window.location.search;
      destination.searchParams.delete("lang");
      destination.hash = window.location.hash;
      link.href = destination.href;
    });
  });

  /* ─────────────────────────────────────────
     2. LIGHT / DARK THEME
  ───────────────────────────────────────── */
  const themeStorageKey = "portfolio-theme";
  const themeToggle = document.getElementById("themeToggle");
  const themeColor = document.getElementById("themeColor");
  const systemTheme = window.matchMedia("(prefers-color-scheme: light)");

  function getStoredTheme() {
    try {
      const storedTheme = localStorage.getItem(themeStorageKey);
      return storedTheme === "light" || storedTheme === "dark"
        ? storedTheme
        : null;
    } catch {
      return null;
    }
  }

  function setTheme(theme, persist = false) {
    const isLight = theme === "light";
    const nextThemeLabel = isLight
      ? uiCopy.activateDarkTheme
      : uiCopy.activateLightTheme;

    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    themeColor?.setAttribute("content", isLight ? "#f4f7fb" : "#080d1a");

    if (themeToggle) {
      themeToggle.setAttribute("aria-label", nextThemeLabel);
      themeToggle.setAttribute("title", nextThemeLabel);
    }

    if (persist) {
      try {
        localStorage.setItem(themeStorageKey, theme);
      } catch {
        // The selected theme still applies for the current page.
      }
    }
  }

  setTheme(root.dataset.theme === "light" ? "light" : "dark");

  themeToggle?.addEventListener("click", () => {
    const nextTheme = root.dataset.theme === "light" ? "dark" : "light";
    setTheme(nextTheme, true);
  });

  function followSystemTheme(event) {
    if (!getStoredTheme()) {
      setTheme(event.matches ? "light" : "dark");
    }
  }

  if (typeof systemTheme.addEventListener === "function") {
    systemTheme.addEventListener("change", followSystemTheme);
  } else {
    systemTheme.addListener(followSystemTheme);
  }

  window.addEventListener("storage", (event) => {
    if (event.key !== themeStorageKey) return;

    const storedTheme = getStoredTheme();
    setTheme(storedTheme || (systemTheme.matches ? "light" : "dark"));
  });

  /* ─────────────────────────────────────────
     3. NAV: Scroll style + Active link
  ───────────────────────────────────────── */
  const nav = document.getElementById("nav");
  const navLinks = document.querySelectorAll('.nav__link[href^="#"]');
  const sections = document.querySelectorAll("main section[id]:not(#home)");

  function updateNav() {
    // Scrolled style
    if (window.scrollY > 60) {
      nav.classList.add("scrolled");
    } else {
      nav.classList.remove("scrolled");
    }

    // Active link highlight
    let current = "";
    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 120;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute("id");
      }
    });

    navLinks.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${current}`;
      link.classList.toggle("active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  window.addEventListener("scroll", updateNav, { passive: true });
  updateNav();

  /* ─────────────────────────────────────────
     4. ACCESSIBLE HAMBURGER MENU
  ───────────────────────────────────────── */
  const hamburger = document.getElementById("hamburger");
  const navLinksContainer = document.getElementById("navLinks");

  function setMenu(open) {
    if (!hamburger || !navLinksContainer) return;
    hamburger.classList.toggle("open", open);
    navLinksContainer.classList.toggle("open", open);
    hamburger.setAttribute("aria-expanded", String(open));
    hamburger.setAttribute(
      "aria-label",
      open ? uiCopy.closeMenu : uiCopy.openMenu,
    );
  }

  hamburger?.addEventListener("click", () => {
    setMenu(hamburger.getAttribute("aria-expanded") !== "true");
  });

  // Close menu on link click
  navLinksContainer?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      setMenu(false);
    });
  });

  // Close on outside click
  document.addEventListener("click", (e) => {
    if (nav && !nav.contains(e.target)) {
      setMenu(false);
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (document.querySelector(".case-study-dialog[open]")) return;
      setMenu(false);
      hamburger?.focus();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 640) setMenu(false);
  });

  /* ─────────────────────────────────────────
     5. SCROLL REVEAL — IntersectionObserver
  ───────────────────────────────────────── */
  const revealElements = document.querySelectorAll("[data-reveal]");

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealElements.forEach((el) => el.classList.add("revealed"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const siblings = Array.from(
            entry.target.parentElement.querySelectorAll("[data-reveal]"),
          );
          const index = Math.max(0, siblings.indexOf(entry.target));
          const delay = index * 70;

          setTimeout(() => {
            entry.target.classList.add("revealed");
          }, delay);

          revealObserver.unobserve(entry.target);
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -40px 0px",
      },
    );

    revealElements.forEach((el) => revealObserver.observe(el));
  }

  /* ─────────────────────────────────────────
     6. BACK TO TOP
  ───────────────────────────────────────── */
  const backToTop = document.getElementById("backToTop");

  backToTop?.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  });

  /* ─────────────────────────────────────────
     7. HERO BACKGROUND PARALLAX (subtle)
  ───────────────────────────────────────── */
  const heroGlow1 = document.querySelector(".hero__glow--1");
  const heroGlow2 = document.querySelector(".hero__glow--2");

  const hasFinePointer = window.matchMedia("(pointer: fine)").matches;

  if (!prefersReducedMotion && hasFinePointer && heroGlow1 && heroGlow2) {
    document.addEventListener("mousemove", (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;

      heroGlow1.style.transform = `translate(${x * 0.5}px, ${y * 0.5}px)`;
      heroGlow2.style.transform = `translate(${-x * 0.3}px, ${-y * 0.3}px)`;
    });
  }

  /* ─────────────────────────────────────────
     8. SMOOTH SCROLL for anchor links
  ───────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const offset = 80; // nav height
        const top =
          target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({
          top,
          behavior: prefersReducedMotion ? "auto" : "smooth",
        });
      }
    });
  });

  /* ─────────────────────────────────────────
     9. FOOTER YEAR
  ───────────────────────────────────────── */
  const currentYear = document.getElementById("currentYear");
  if (currentYear) currentYear.textContent = String(new Date().getFullYear());

  /* ─────────────────────────────────────────
     10. PRIVACY-FRIENDLY VISITOR STATISTICS
  ───────────────────────────────────────── */
  const doNotTrackSignal = navigator.doNotTrack || window.doNotTrack;
  const privacySignalEnabled =
    navigator.globalPrivacyControl === true ||
    doNotTrackSignal === "1" ||
    doNotTrackSignal === "yes";
  const isLivePortfolio = window.location.hostname === "fhjoy.github.io";

  if (!privacySignalEnabled && isLivePortfolio) {
    const analyticsScript = document.createElement("script");
    analyticsScript.async = true;
    analyticsScript.src = "https://gc.zgo.at/count.js";
    analyticsScript.dataset.goatcounter = "https://fhjoy.goatcounter.com/count";
    document.body.append(analyticsScript);
  }

  // Reading the public aggregate does not track the current visitor, so the
  // visible total remains available when Do Not Track is enabled.
  const visitorCounter = document.getElementById("visitorCounter");
  const visitorCount = document.getElementById("visitorCount");

  if (visitorCounter && visitorCount) {
    fetch("https://fhjoy.goatcounter.com/counter/TOTAL.json", {
      credentials: "omit",
      referrerPolicy: "no-referrer",
    })
      .then((response) => {
        if (!response.ok) throw new Error("Visitor counter unavailable");
        return response.json();
      })
      .then((data) => {
        const count = Number(String(data.count).replace(/[^0-9]/g, ""));
        if (!Number.isFinite(count)) return;

        visitorCount.textContent = new Intl.NumberFormat(locale).format(count);
        visitorCounter.hidden = false;
      })
      .catch(() => {
        // Keep the optional counter hidden if the service is unavailable.
      });
  }

  /* ─────────────────────────────────────────
     11. ACCESSIBLE ENGINEERING CASE STUDIES
  ───────────────────────────────────────── */
  const caseStudyTriggers = document.querySelectorAll("[data-case-study]");
  const caseStudyDialogs = document.querySelectorAll(".case-study-dialog");
  let lastCaseStudyTrigger = null;

  function closeCaseStudy(dialog) {
    if (typeof dialog.close === "function") {
      dialog.close();
    } else {
      dialog.removeAttribute("open");
      document.body.classList.remove("dialog-open");
      lastCaseStudyTrigger?.focus();
      lastCaseStudyTrigger = null;
    }
  }

  caseStudyTriggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const dialogId = trigger.dataset.caseStudy;
      const dialog = dialogId ? document.getElementById(dialogId) : null;
      if (!(dialog instanceof HTMLElement)) return;

      lastCaseStudyTrigger = trigger;
      setMenu(false);

      if (typeof dialog.showModal === "function") {
        dialog.showModal();
      } else {
        dialog.setAttribute("open", "");
      }

      document.body.classList.add("dialog-open");
      dialog.querySelector("[data-dialog-close]")?.focus();
    });
  });

  caseStudyDialogs.forEach((dialog) => {
    dialog.querySelectorAll("[data-dialog-close]").forEach((button) => {
      button.addEventListener("click", () => closeCaseStudy(dialog));
    });

    // Clicking the shaded backdrop is an additional closing option. The
    // visible close buttons remain available for keyboard and touch users.
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) closeCaseStudy(dialog);
    });

    dialog.addEventListener("close", () => {
      document.body.classList.remove("dialog-open");
      lastCaseStudyTrigger?.focus();
      lastCaseStudyTrigger = null;
    });
  });

  /* ─────────────────────────────────────────
     12. AUTOMATED LIGHTHOUSE QUALITY DASHBOARD
  ───────────────────────────────────────── */
  const qualityDashboard = document.querySelector("[data-quality-dashboard]");

  function setQualityStatus(status, text) {
    const statusElement = qualityDashboard?.querySelector(
      "[data-quality-status]",
    );
    const statusText = qualityDashboard?.querySelector(
      "[data-quality-status-text]",
    );
    if (!statusElement || !statusText) return;

    statusElement.classList.remove(
      "quality-dashboard__status--pending",
      "quality-dashboard__status--passing",
      "quality-dashboard__status--attention",
    );
    statusElement.classList.add(`quality-dashboard__status--${status}`);
    statusText.textContent = text;
  }

  function renderQualitySummary(summary) {
    if (!qualityDashboard || !summary?.scores) return;

    const metricKeys = ["performance", "accessibility", "bestPractices", "seo"];

    metricKeys.forEach((key) => {
      const rawScore = Number(summary.scores[key]);
      if (!Number.isFinite(rawScore)) return;

      const score = Math.min(100, Math.max(0, Math.round(rawScore)));
      const scoreElement = qualityDashboard.querySelector(
        `[data-quality-score="${key}"]`,
      );
      const bar = qualityDashboard.querySelector(`[data-quality-bar="${key}"]`);
      const metric = qualityDashboard.querySelector(
        `[data-quality-metric="${key}"]`,
      );
      const label = metric?.querySelector(
        ".quality-metric__label",
      )?.textContent;

      if (scoreElement) scoreElement.textContent = String(score);
      if (bar) bar.style.width = `${score}%`;
      if (metric && label) {
        metric.setAttribute(
          "aria-label",
          `${label}: ${score} ${uiCopy.outOf} 100`,
        );
      }
    });

    const passed = summary.status === "passing";
    setQualityStatus(
      passed ? "passing" : "attention",
      passed ? uiCopy.qualityPassing : uiCopy.qualityAttention,
    );

    const updatedElement = qualityDashboard.querySelector(
      "[data-quality-updated]",
    );
    const updatedDate = summary.updatedAt ? new Date(summary.updatedAt) : null;

    if (updatedElement && updatedDate && !Number.isNaN(updatedDate.getTime())) {
      const parts = [
        `${uiCopy.lastAudited} ${new Intl.DateTimeFormat(locale, {
          dateStyle: "medium",
        }).format(updatedDate)}`,
      ];

      if (typeof summary.commit === "string" && summary.commit) {
        parts.push(`${uiCopy.commit} ${summary.commit.slice(0, 7)}`);
      }
      if (Number.isFinite(Number(summary.runs))) {
        parts.push(`${Number(summary.runs)} ${uiCopy.measurements}`);
      }

      updatedElement.textContent = parts.join(" · ");
    }
  }

  if (qualityDashboard && window.location.protocol !== "file:") {
    const qualitySource = qualityDashboard.dataset.qualitySource;

    if (qualitySource) {
      fetch(qualitySource, { cache: "no-store", credentials: "same-origin" })
        .then((response) => {
          if (!response.ok) throw new Error("Quality summary unavailable");
          return response.json();
        })
        .then((summary) => {
          if (summary?.status === "pending") return;
          renderQualitySummary(summary);
        })
        .catch(() => {
          setQualityStatus("pending", uiCopy.qualityUnavailable);
        });
    }
  }
});
