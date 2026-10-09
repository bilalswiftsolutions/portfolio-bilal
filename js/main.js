(function () {
  const nav = document.getElementById("site-nav");
  const toggle = document.querySelector(".nav-toggle");
  const year = document.getElementById("year");
  const header = document.querySelector(".site-header");
  const progress = document.querySelector(".scroll-progress");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (year) year.textContent = String(new Date().getFullYear());

  // Theme toggle (dark is the default; the choice is remembered per visitor)
  const root = document.documentElement;
  const themeBtn = document.querySelector(".theme-toggle");
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const isLight = () => root.getAttribute("data-theme") === "light";
  const syncThemeUi = () => {
    const label = isLight() ? "Switch to dark mode" : "Switch to light mode";
    if (themeBtn) {
      themeBtn.setAttribute("aria-label", label);
      themeBtn.setAttribute("title", label);
    }
    if (themeMeta) themeMeta.setAttribute("content", isLight() ? "#f4f7fd" : "#04060c");
  };
  syncThemeUi();
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const next = isLight() ? "dark" : "light";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) {}
      syncThemeUi();
      document.dispatchEvent(new CustomEvent("themechange"));
    });
  }

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Stagger reveal delays among siblings in the same grid/list
  document.querySelectorAll(".skills-grid, .projects-grid, .timeline, .contact-cards, .education-grid").forEach((group) => {
    Array.from(group.children).forEach((child, i) => {
      if (child.classList.contains("reveal")) child.style.setProperty("--i", String(i % 6));
    });
  });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

    // Highlight the nav link of the section in view
    const links = nav ? Array.from(nav.querySelectorAll('a[href^="#"]')) : [];
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          links.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + entry.target.id));
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    links.forEach((a) => {
      const target = document.querySelector(a.getAttribute("href"));
      if (target) sectionObserver.observe(target);
    });
  } else {
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
  }

  // Scroll progress bar + header state
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
      if (progress) progress.style.setProperty("--progress", ratio.toFixed(4));
      if (header) header.classList.toggle("is-scrolled", window.scrollY > 10);
      ticking = false;
    });
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Typing effect in the hero terminal line
  const typed = document.querySelector(".typed-text");
  if (typed) {
    const words = (typed.dataset.words || "").split("|").filter(Boolean);
    if (reduceMotion || !words.length) {
      typed.textContent = words[0] || "";
    } else {
      let w = 0;
      let c = 0;
      let deleting = false;
      const tick = () => {
        const word = words[w];
        c += deleting ? -1 : 1;
        typed.textContent = word.slice(0, c);
        let delay = deleting ? 28 : 55;
        if (!deleting && c === word.length) {
          deleting = true;
          delay = 1800;
        } else if (deleting && c === 0) {
          deleting = false;
          w = (w + 1) % words.length;
          delay = 350;
        }
        setTimeout(tick, delay);
      };
      setTimeout(tick, 900);
    }
  }

  if (reduceMotion) return;

  // Cursor glow + card spotlight + subtle 3D tilt (mouse/trackpad only)
  if (finePointer) {
    const glow = document.querySelector(".cursor-glow");
    let gx = 0;
    let gy = 0;
    let glowQueued = false;
    window.addEventListener(
      "pointermove",
      (e) => {
        gx = e.clientX;
        gy = e.clientY;
        if (glow && !glowQueued) {
          glowQueued = true;
          requestAnimationFrame(() => {
            glow.style.transform = `translate(${gx}px, ${gy}px) translate(-50%, -50%)`;
            glow.classList.add("is-on");
            glowQueued = false;
          });
        }
      },
      { passive: true }
    );
    document.addEventListener("pointerleave", () => glow && glow.classList.remove("is-on"));

    const tiltCards = document.querySelectorAll(".project-card, .skill-card");
    document.querySelectorAll(".project-card, .skill-card, .timeline-item, .education-card").forEach((card) => {
      const tilt = Array.prototype.includes.call(tiltCards, card);
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;
        card.style.setProperty("--mx", x + "px");
        card.style.setProperty("--my", y + "px");
        if (tilt) {
          const rx = ((y / r.height) - 0.5) * -6;
          const ry = ((x / r.width) - 0.5) * 6;
          card.style.transform = `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateY(-4px)`;
        }
      });
      card.addEventListener("pointerleave", () => {
        if (tilt) card.style.transform = "";
      });
    });
  }

  // Particle network on a fixed background canvas
  const canvas = document.getElementById("bg-canvas");
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext("2d");
  const palettes = {
    dark: ["34, 225, 255", "139, 92, 246", "255, 61, 212"],
    light: ["8, 145, 178", "124, 58, 237", "219, 39, 119"],
  };
  let colors = isLight() ? palettes.light : palettes.dark;
  let lineAlpha = isLight() ? 0.3 : 0.22;
  let w = 0;
  let h = 0;
  let dpr = 1;
  let particles = [];
  const mouse = { x: -9999, y: -9999 };
  const LINK = 130;

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round(Math.min(90, (w * h) / 16000));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.6 + 0.6,
      c: colors[Math.floor(Math.random() * colors.length)],
    }));
  };

  document.addEventListener("themechange", () => {
    const prev = colors;
    colors = isLight() ? palettes.light : palettes.dark;
    lineAlpha = isLight() ? 0.3 : 0.22;
    particles.forEach((p) => { p.c = colors[prev.indexOf(p.c)] || colors[0]; });
  });

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  });
  window.addEventListener("pointermove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
  document.addEventListener("pointerleave", () => { mouse.x = mouse.y = -9999; });

  let running = true;
  document.addEventListener("visibilitychange", () => {
    running = !document.hidden;
    if (running) requestAnimationFrame(draw);
  });

  function draw() {
    if (!running) return;
    ctx.clearRect(0, 0, w, h);

    for (const p of particles) {
      // Gentle repulsion from the pointer
      const dxm = p.x - mouse.x;
      const dym = p.y - mouse.y;
      const dm = dxm * dxm + dym * dym;
      if (dm < 14400) {
        const f = (14400 - dm) / 14400 * 0.6;
        const d = Math.sqrt(dm) || 1;
        p.x += (dxm / d) * f;
        p.y += (dym / d) * f;
      }
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -10) p.x = w + 10;
      if (p.x > w + 10) p.x = -10;
      if (p.y < -10) p.y = h + 10;
      if (p.y > h + 10) p.y = -10;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.c}, 0.85)`;
      ctx.fill();
    }

    for (let i = 0; i < particles.length; i++) {
      const a = particles[i];
      for (let j = i + 1; j < particles.length; j++) {
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < LINK * LINK) {
          const alpha = (1 - Math.sqrt(d2) / LINK) * lineAlpha;
          ctx.strokeStyle = `rgba(${a.c}, ${alpha.toFixed(3)})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }

  resize();
  requestAnimationFrame(draw);
})();
