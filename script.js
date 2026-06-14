/* =============================================
   FAISAL HOSSAIN — PORTFOLIO JS
   Features: Typing effect, Scroll reveals,
             Nav scroll style, Language bars,
             Hamburger menu, Back to top
   ============================================= */

document.addEventListener("DOMContentLoaded", () => {
  /* ─────────────────────────────────────────
     1. TYPING EFFECT
  ───────────────────────────────────────── */
  const typedEl = document.getElementById("typed");
  const phrases = [
    "Webentwickler",
    "Vue.js Entwickler",
    "React Entwickler",
    "Frontend Spezialist",
    "Node.js Entwickler",
    "Full-Stack Developer",
  ];
  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 80;

  function typeLoop() {
    const current = phrases[phraseIndex];

    if (isDeleting) {
      typedEl.textContent = current.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 45;
    } else {
      typedEl.textContent = current.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 90;
    }

    if (!isDeleting && charIndex === current.length) {
      typingSpeed = 2000; // pause at end
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      typingSpeed = 400; // pause before next word
    }

    setTimeout(typeLoop, typingSpeed);
  }

  // Start typing after hero animation finishes
  setTimeout(typeLoop, 1000);

  /* ─────────────────────────────────────────
     2. NAV: Scroll style + Active link
  ───────────────────────────────────────── */
  const nav = document.getElementById("nav");
  const navLinks = document.querySelectorAll('.nav__link[href^="#"]');
  const sections = document.querySelectorAll("section[id]");

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
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${current}`) {
        link.classList.add("active");
      }
    });
  }

  window.addEventListener("scroll", updateNav, { passive: true });
  updateNav(); // run once on load

  /* ─────────────────────────────────────────
     3. HAMBURGER MENU
  ───────────────────────────────────────── */
  const hamburger = document.getElementById("hamburger");
  const navLinksContainer = document.getElementById("navLinks");

  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("open");
    navLinksContainer.classList.toggle("open");
  });

  // Close menu on link click
  navLinksContainer.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      hamburger.classList.remove("open");
      navLinksContainer.classList.remove("open");
    });
  });

  // Close on outside click
  document.addEventListener("click", (e) => {
    if (!nav.contains(e.target)) {
      hamburger.classList.remove("open");
      navLinksContainer.classList.remove("open");
    }
  });

  /* ─────────────────────────────────────────
     4. SCROLL REVEAL — IntersectionObserver
  ───────────────────────────────────────── */
  const revealElements = document.querySelectorAll("[data-reveal]");

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // Stagger siblings in same parent
          const siblings = Array.from(
            entry.target.parentElement.querySelectorAll("[data-reveal]"),
          );
          const index = siblings.indexOf(entry.target);
          const delay = index * 80;

          setTimeout(() => {
            entry.target.classList.add("revealed");
          }, delay);

          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: "0px 0px -40px 0px",
    },
  );

  revealElements.forEach((el) => revealObserver.observe(el));

  /* ─────────────────────────────────────────
     5. LANGUAGE BARS — animate on reveal
  ───────────────────────────────────────── */
  const langSection = document.querySelector(".languages");

  const langObserver = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        document.querySelectorAll(".lang-bar__fill").forEach((fill) => {
          const targetWidth = fill.getAttribute("data-width");
          // Small timeout to allow CSS transition to fire
          setTimeout(() => {
            fill.style.width = targetWidth + "%";
          }, 200);
        });
        langObserver.unobserve(langSection);
      }
    },
    { threshold: 0.3 },
  );

  if (langSection) langObserver.observe(langSection);

  /* ─────────────────────────────────────────
     6. BACK TO TOP
  ───────────────────────────────────────── */
  const backToTop = document.getElementById("backToTop");

  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* ─────────────────────────────────────────
     7. SKILL CHIP HOVER — subtle glow
  ───────────────────────────────────────── */
  document.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("mouseenter", () => {
      chip.style.transform = "translateY(-2px)";
    });
    chip.addEventListener("mouseleave", () => {
      chip.style.transform = "";
    });
  });

  /* ─────────────────────────────────────────
     8. CONTACT CARDS — open links
  ───────────────────────────────────────── */
  // Replace # hrefs with real links when available
  const contactLinks = document.querySelectorAll('.contact-card[href="#"]');
  contactLinks.forEach((card) => {
    card.addEventListener("click", (e) => {
      const label = card.querySelector(".contact-card__label").textContent;
      if (label === "LinkedIn") {
        // e.preventDefault();
        // window.open('https://linkedin.com/in/YOUR_PROFILE', '_blank');
      }
    });
  });

  /* ─────────────────────────────────────────
     9. HERO BACKGROUND PARALLAX (subtle)
  ───────────────────────────────────────── */
  const heroGlow1 = document.querySelector(".hero__glow--1");
  const heroGlow2 = document.querySelector(".hero__glow--2");

  if (heroGlow1 && heroGlow2) {
    document.addEventListener("mousemove", (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;

      heroGlow1.style.transform = `translate(${x * 0.5}px, ${y * 0.5}px)`;
      heroGlow2.style.transform = `translate(${-x * 0.3}px, ${-y * 0.3}px)`;
    });
  }

  /* ─────────────────────────────────────────
     10. SMOOTH SCROLL for anchor links
  ───────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const href = anchor.getAttribute("href");
      if (href === "#") return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const offset = 80; // nav height
        const top =
          target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: "smooth" });
      }
    });
  });

  /* ─────────────────────────────────────────
     11. FOOTER YEAR
  ───────────────────────────────────────── */
  const footerCopy = document.querySelector(".footer__copy");
  if (footerCopy) {
    const year = new Date().getFullYear();
    footerCopy.innerHTML = footerCopy.innerHTML.replace("2025", year);
  }
});
