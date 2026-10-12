(function () {
  const root = document.documentElement;
  const nav = document.getElementById("site-nav");
  const toggle = document.querySelector(".nav-toggle");
  const header = document.querySelector(".site-header");
  const progress = document.querySelector(".scroll-progress");
  const year = document.getElementById("year");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (year) year.textContent = String(new Date().getFullYear());

  // Theme toggle (light is the default; the choice is remembered per visitor)
  const themeBtn = document.querySelector(".theme-toggle");
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const isLight = () => root.getAttribute("data-theme") !== "dark";
  const syncThemeUi = () => {
    const label = isLight() ? "Switch to dark mode" : "Switch to light mode";
    if (themeBtn) {
      themeBtn.setAttribute("aria-label", label);
      themeBtn.setAttribute("title", label);
    }
    if (themeMeta) themeMeta.setAttribute("content", isLight() ? "#fbf6f0" : "#17100b");
  };
  syncThemeUi();
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const next = isLight() ? "dark" : "light";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) {}
      syncThemeUi();
    });
  }

  // Mobile menu
  if (toggle && nav) {
    const close = () => {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
    };
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", close));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
  }

  // Long commit lists collapse to 4 items with a toggle
  const ar = root.lang === "ar";
  const moreLabel = (n) => (ar ? `+ عرض ${n} إنجازات أخرى` : `+ show ${n} more changes`);
  const lessLabel = ar ? "− عرض أقل" : "− show less";
  document.querySelectorAll(".commit-list").forEach((list) => {
    const total = list.children.length;
    if (total <= 5) return;
    list.classList.add("is-clamped");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "show-more";
    btn.setAttribute("aria-expanded", "false");
    btn.textContent = moreLabel(total - 4);
    btn.addEventListener("click", () => {
      const clamped = list.classList.toggle("is-clamped");
      btn.setAttribute("aria-expanded", clamped ? "false" : "true");
      btn.textContent = clamped ? moreLabel(total - 4) : lessLabel;
    });
    list.after(btn);
  });

  // Copy email
  const copyBtn = document.querySelector(".copy-email");
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      const email = copyBtn.dataset.email;
      try {
        await navigator.clipboard.writeText(email);
        copyBtn.textContent = "Copied ✓";
        copyBtn.classList.add("is-done");
      } catch (e) {
        window.location.href = "mailto:" + email;
        return;
      }
      setTimeout(() => {
        copyBtn.textContent = "Copy email address";
        copyBtn.classList.remove("is-done");
      }, 2000);
    });
  }

  // Stagger reveal delays among siblings
  document.querySelectorAll(".bento, .hire-grid, .sp-grid, .gauges, .toolkit, .sp-proof, .sp-faq").forEach((group) => {
    Array.from(group.children).forEach((child, i) => {
      if (child.classList.contains("reveal")) child.style.setProperty("--i", String(i % 6));
    });
  });

  const trace = document.querySelector(".trace");
  const total = trace && trace.querySelector("[data-count]");
  const runTrace = () => {
    if (!trace) return;
    trace.classList.remove("run");
    void trace.offsetWidth;
    trace.classList.add("run");
    if (total && !reduceMotion) {
      const target = Number(total.dataset.count);
      const start = performance.now();
      const step = (now) => {
        const t = Math.min((now - start) / 2400, 1);
        total.textContent = String(Math.round(target * t));
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }
  };

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
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

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

    if (trace) {
      let timer;
      new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          clearInterval(timer);
          if (!entry.isIntersecting) return;
          runTrace();
          if (!reduceMotion) timer = setInterval(runTrace, 7000);
        });
      }, { threshold: 0.3 }).observe(trace);
    }
  } else {
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
    runTrace();
  }


  // Count-up numbers in the record section
  const counters = document.querySelectorAll("[data-count-to]");
  if (counters.length && "IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        io.unobserve(entry.target);
        const el = entry.target;
        const target = Number(el.dataset.countTo);
        const suffix = el.textContent.replace(/[0-9.,]/g, "");
        const start = performance.now();
        const step = (now) => {
          const t = Math.min((now - start) / 1600, 1);
          const eased = 1 - Math.pow(1 - t, 3);
          el.textContent = Math.round(target * eased) + suffix;
          if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => io.observe(el));
  }

  // Scroll progress + header state
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const max = root.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
      if (progress) progress.style.setProperty("--progress", ratio.toFixed(4));
      if (header) header.classList.toggle("is-scrolled", window.scrollY > 10);
      ticking = false;
    });
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Bit walks down the experience timeline as you scroll
  const rail = document.querySelector(".career");
  const railBit = rail && rail.querySelector(".rail-bit");
  if (railBit && !reduceMotion) {
    let walkTimer;
    let queued = false;
    const place = () => {
      queued = false;
      const r = rail.getBoundingClientRect();
      const span = Math.max(r.height - railBit.offsetHeight, 0);
      const t = Math.min(Math.max((window.innerHeight * 0.45 - r.top) / Math.max(r.height, 1), 0), 1);
      railBit.style.transform = "translate3d(0," + (t * span).toFixed(1) + "px,0)";
    };
    window.addEventListener("scroll", () => {
      if (!queued) { queued = true; requestAnimationFrame(place); }
      railBit.classList.add("walking");
      clearTimeout(walkTimer);
      walkTimer = setTimeout(() => railBit.classList.remove("walking"), 220);
    }, { passive: true });
    window.addEventListener("resize", place);
    place();
  }

  // Bit waves again when you hover the portrait
  const stage = document.querySelector(".stage");
  const heroBit = stage && stage.querySelector(".bit");
  if (heroBit && finePointer && !reduceMotion) {
    stage.querySelector(".pebble").addEventListener("pointerenter", () => {
      heroBit.classList.remove("waving");
      void heroBit.getBoundingClientRect();
      heroBit.classList.add("waving");
    });
  }

  // Little hearts that float up from a point
  const heartSvg = '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3.1 4.5 6.9 4.5c2.1 0 3.6 1.1 5.1 3 1.5-1.9 3-3 5.1-3 3.8 0 6 3.9 4.5 7.3C19.5 16.4 12 21 12 21Z"/></svg>';
  const burst = (x, y, n) => {
    if (reduceMotion) return;
    for (let i = 0; i < n; i++) {
      const h = document.createElement("span");
      h.className = "heart";
      h.innerHTML = heartSvg;
      h.style.left = x - 8 + (Math.random() * 30 - 15) + "px";
      h.style.top = y - 8 + "px";
      h.style.setProperty("--dx", (Math.random() * 60 - 30).toFixed(0) + "px");
      h.style.setProperty("--rot", (Math.random() * 50 - 25).toFixed(0) + "deg");
      h.style.animationDelay = i * 60 + "ms";
      document.body.appendChild(h);
      setTimeout(() => h.remove(), 1400);
    }
  };

  // Bit's eyes follow the pointer
  const bits = Array.from(document.querySelectorAll(".bit"));
  if (bits.length && finePointer && !reduceMotion) {
    let px = 0, py = 0, pending = false;
    window.addEventListener("pointermove", (e) => {
      px = e.clientX; py = e.clientY;
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => {
        pending = false;
        bits.forEach((b) => {
          const r = b.getBoundingClientRect();
          if (r.bottom < 0 || r.top > window.innerHeight) return;
          const dx = px - (r.left + r.width / 2);
          const dy = py - (r.top + r.height * 0.4);
          const d = Math.hypot(dx, dy) || 1;
          const k = Math.min(d / 160, 1) * 3.2;
          b.style.setProperty("--ex", ((dx / d) * k).toFixed(2) + "px");
          b.style.setProperty("--ey", ((dy / d) * k).toFixed(2) + "px");
          b.style.setProperty("--hr", (Math.max(Math.min(dx / 60, 1), -1) * 6).toFixed(1) + "deg");
        });
      });
    }, { passive: true });
  }

  // Bit's speech bubble cycles, and clicking Bit makes it jump with hearts
  const bubble = document.querySelector(".bubble");
  const heroBitBtn = document.querySelector(".hero-bit");
  const lines = root.lang === "ar"
    ? ["مرحبًا، أنا Bit!", "بلال متاح للعمل الآن", "مرّر للأسفل، سأرافقك", "اضغط عليّ!"]
    : ["Hi, I'm Bit!", "Bilal is available now", "Scroll — I'll walk you through", "Psst… click me!"];
  if (bubble && !reduceMotion) {
    let li = 0;
    setInterval(() => {
      if (document.hidden) return;
      li = (li + 1) % lines.length;
      bubble.textContent = lines[li];
      bubble.classList.remove("swap");
      void bubble.offsetWidth;
      bubble.classList.add("swap");
    }, 4200);
  }
  if (heroBitBtn) {
    heroBitBtn.addEventListener("click", (e) => {
      heroBitBtn.classList.remove("jump");
      void heroBitBtn.offsetWidth;
      heroBitBtn.classList.add("jump");
      const r = heroBitBtn.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + 10, 6);
      if (bubble) {
        bubble.textContent = root.lang === "ar" ? "هيهي! 🧡" : "Hehe, that tickles!";
        bubble.classList.remove("swap");
        void bubble.offsetWidth;
        bubble.classList.add("swap");
      }
    });
  }
  document.querySelectorAll(".nav-cta, .contact-panel .contact-row, .btn-primary").forEach((el) => {
    el.addEventListener("click", (e) => burst(e.clientX || 0, e.clientY || 0, 5));
  });

  // Timeline dots pop as Bit walks past them
  const careerItems = Array.from(document.querySelectorAll(".career-item"));
  if (careerItems.length && railBit) {
    let q = false;
    const mark = () => {
      q = false;
      const by = railBit.getBoundingClientRect().top + 30;
      careerItems.forEach((it) => {
        const node = it.querySelector(".node");
        if (node) it.classList.toggle("reached", node.getBoundingClientRect().top <= by);
      });
    };
    window.addEventListener("scroll", () => { if (!q) { q = true; requestAnimationFrame(mark); } }, { passive: true });
    mark();
  }

  // Apple TV style tilt with a moving reflection
  if (finePointer && !reduceMotion) {
    document.querySelectorAll(".work, .hire-link, .sp-card, .gauge, .edu-card, .sp-proof-row").forEach((card) => {
      card.classList.add("tilt");
      const max = card.classList.contains("work--feature") ? 4 : 8;
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        card.classList.add("tilting");
        card.style.transform = "perspective(900px) rotateX(" + ((0.5 - y) * max).toFixed(2) + "deg) rotateY(" + ((x - 0.5) * max).toFixed(2) + "deg) translateY(-4px) scale(1.015)";
        card.style.setProperty("--gx", (x * 100).toFixed(1) + "%");
        card.style.setProperty("--gy", (y * 100).toFixed(1) + "%");
      });
      card.addEventListener("pointerleave", () => {
        card.classList.remove("tilting");
        card.style.transform = "";
      });
    });
  }
})();
