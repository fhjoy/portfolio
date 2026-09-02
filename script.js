document.addEventListener("DOMContentLoaded", () => {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  /* ─────────────────────────────────────────
     1. NAV: Scroll style + Active link
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
     2. ACCESSIBLE HAMBURGER MENU
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
      open ? "Menü schließen" : "Menü öffnen",
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
      setMenu(false);
      hamburger?.focus();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 640) setMenu(false);
  });

  /* ─────────────────────────────────────────
     3. SCROLL REVEAL — IntersectionObserver
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
     4. BACK TO TOP
  ───────────────────────────────────────── */
  const backToTop = document.getElementById("backToTop");

  backToTop?.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  });

  /* ─────────────────────────────────────────
     5. HERO BACKGROUND PARALLAX (subtle)
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
     6. SMOOTH SCROLL for anchor links
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
     7. FOOTER YEAR
  ───────────────────────────────────────── */
  const currentYear = document.getElementById("currentYear");
  if (currentYear) currentYear.textContent = String(new Date().getFullYear());

  /* ─────────────────────────────────────────
     8. PRIVACY-FRIENDLY VISITOR STATISTICS
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

    const visitorCounter = document.getElementById("visitorCounter");
    const visitorCount = document.getElementById("visitorCount");

    if (!visitorCounter || !visitorCount) return;

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

        visitorCount.textContent = new Intl.NumberFormat("de-DE").format(count);
        visitorCounter.hidden = false;
      })
      .catch(() => {
        // Keep the optional counter hidden if the service is unavailable.
      });
  }
});
