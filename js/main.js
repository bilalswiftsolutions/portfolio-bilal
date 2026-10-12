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

  // Theme toggle (dark is the default; the choice is remembered per visitor)
  const themeBtn = document.querySelector(".theme-toggle");
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const isLight = () => root.getAttribute("data-theme") === "light";
  const syncThemeUi = () => {
    const label = isLight() ? "Switch to dark mode" : "Switch to light mode";
    if (themeBtn) {
      themeBtn.setAttribute("aria-label", label);
      themeBtn.setAttribute("title", label);
    }
    if (themeMeta) themeMeta.setAttribute("content", isLight() ? "#f2efe7" : "#0c0c0d");
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
  document.querySelectorAll(".commit-list").forEach((list) => {
    const total = list.children.length;
    if (total <= 5) return;
    list.classList.add("is-clamped");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "show-more";
    btn.setAttribute("aria-expanded", "false");
    btn.textContent = `+ show ${total - 4} more changes`;
    btn.addEventListener("click", () => {
      const clamped = list.classList.toggle("is-clamped");
      btn.setAttribute("aria-expanded", clamped ? "false" : "true");
      btn.textContent = clamped ? `+ show ${total - 4} more changes` : "− show less";
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
  document.querySelectorAll(".bento, .stack, .gitlog, .hero-copy, .about-copy, .hire-grid, .sp-grid").forEach((group) => {
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

  // Spotlight that follows the pointer on project cards
  if (finePointer && !reduceMotion) {
    document.querySelectorAll(".work").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", e.clientX - r.left + "px");
        card.style.setProperty("--my", e.clientY - r.top + "px");
      });
    });
  }
})();
