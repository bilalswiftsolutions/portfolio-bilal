(function () {
  const root = document.documentElement;
  const nav = document.getElementById("site-nav");
  const toggle = document.querySelector(".nav-toggle");
  const header = document.querySelector(".site-header");
  const progress = document.querySelector(".scroll-progress");
  const year = document.getElementById("year");
  const calm = document.documentElement.getAttribute("data-calm") === "1";
  const reduceMotion = calm || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const calmBtn = document.querySelector(".calm-toggle");
  if (calmBtn) {
    const ar0 = document.documentElement.lang === "ar";
    const lbl = calmBtn.querySelector(".calm-label");
    const sync = (on) => {
      calmBtn.setAttribute("aria-pressed", on ? "true" : "false");
      const t = on ? (ar0 ? "تشغيل الحركة" : "Turn animations on") : (ar0 ? "الوضع الهادئ: إيقاف الحركة" : "Calm mode: turn animations off");
      calmBtn.title = t; calmBtn.setAttribute("aria-label", t);
      if (lbl) lbl.textContent = ar0 ? "هادئ" : "Calm";
    };
    sync(calm);
    calmBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const on = document.documentElement.getAttribute("data-calm") !== "1";
      try { localStorage.setItem("calm", on ? "1" : "0"); } catch (err) {}
      location.reload();
    });
  }
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

  // Small items pop in as they scroll into view
  if ("IntersectionObserver" in window && !reduceMotion) {
    const popSel = [
      ".panel > div", ".shipped span", ".ff-list > div", ".story-body p", ".pull", ".commit-list li",
      ".work-metrics > div", ".work-top", ".work-metric", ".chips li", ".tool-head", ".gauge h3", ".gauge p",
      ".edu-meta", ".edu-card h3", ".edu-school", ".degree", ".contact-row", ".contact-note", ".copy-email",
      ".sp-q", ".sp-related a", ".toc li", ".prose h2", ".prose p", ".prose pre", ".prose li", ".hire-link strong",
      ".hire-link .route", ".sp-card h3", ".sp-card p", ".sp-proof-row h3", ".sp-proof-row p", ".footer-inner > *", ".hero-stats > div"
    ].join(", ");
    const counts = new Map();
    const pops = Array.from(document.querySelectorAll(popSel)).filter((el) => !el.closest(".hero-w-grid") && !el.classList.contains("reveal"));
    const popIO = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        popIO.unobserve(en.target);
        const el = en.target;
        el.classList.add("is-visible");
        setTimeout(() => { el.classList.remove("pop", "is-visible"); el.style.removeProperty("--pi"); el.style.removeProperty("--pr"); }, 1100);
      });
    }, { threshold: 0.05, rootMargin: "0px 0px -30px 0px" });
    pops.forEach((el) => {
      const parent = el.parentElement;
      const n = counts.get(parent) || 0;
      counts.set(parent, n + 1);
      el.style.setProperty("--pi", String(n % 8));
      el.style.setProperty("--pr", (n % 2 ? 2 : -2) + "deg");
      el.classList.add("pop");
      popIO.observe(el);
    });
    document.addEventListener("click", (e) => {
      const btn = e.target.closest && e.target.closest(".show-more");
      if (!btn) return;
      const list = btn.previousElementSibling;
      if (list) list.querySelectorAll(".pop").forEach((li) => li.classList.remove("pop", "is-visible"));
    });
  }

  // A tiny Bit blows a flying kiss wherever you click
  if (!reduceMotion) {
    const kd = document.createElement("div");
    kd.innerHTML = '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>' +
      '<radialGradient id="kBody" cx="32%" cy="22%" r="85%"><stop offset="0" stop-color="#ffb684"/><stop offset=".45" stop-color="#f7801f"/><stop offset="1" stop-color="#c94f08"/></radialGradient>' +
      '<radialGradient id="kHeart" cx="34%" cy="28%" r="80%"><stop offset="0" stop-color="#ffd2b0"/><stop offset=".45" stop-color="#f7801f"/><stop offset="1" stop-color="#c24a06"/></radialGradient>' +
      '<radialGradient id="kHeartW" cx="34%" cy="28%" r="80%"><stop offset="0" stop-color="#fff"/><stop offset=".6" stop-color="#fff3e8"/><stop offset="1" stop-color="#f3d2b6"/></radialGradient>' +
      '<symbol id="kh" viewBox="0 0 24 24"><path d="M12 21.2S2.8 15.6 2.2 9.6C1.8 5.4 6.6 3.2 9.4 6L12 8.6 14.6 6c2.8-2.8 7.6-.6 7.2 3.6-.6 6-9.8 11.6-9.8 11.6Z"/><ellipse cx="7.4" cy="8.2" rx="2.2" ry="1.3" fill="#fff" opacity=".65" transform="rotate(-35 7.4 8.2)"/></symbol>' +
      "</defs></svg>";
    document.body.appendChild(kd.firstChild);
    const kissSvg = '<svg viewBox="0 0 80 86" aria-hidden="true">' +
      '<line x1="40" y1="13" x2="40" y2="5" stroke="#c4560a" stroke-width="3" stroke-linecap="round"/><circle cx="40" cy="5" r="4.2" fill="#ffb27a" stroke="#c4560a" stroke-width="1.2"/>' +
      '<rect x="8" y="15" width="64" height="58" rx="20" fill="#a9460a"/><rect x="8" y="13" width="64" height="56" rx="20" fill="url(#kBody)"/>' +
      '<ellipse cx="25" cy="19" rx="11" ry="3" fill="#fff" opacity=".5" transform="rotate(-10 25 19)"/>' +
      '<rect x="16" y="23" width="48" height="36" rx="13" fill="#fff"/>' +
      '<path d="M25 37q4.5-4.5 9 0M46 37q4.5-4.5 9 0" stroke="#2a1a10" stroke-width="2.8" fill="none" stroke-linecap="round"/>' +
      '<circle cx="23" cy="47" r="3.8" fill="#ffb27a"/><circle cx="57" cy="47" r="3.8" fill="#ffb27a"/>' +
      '<path d="M33 46q7 7 14 0" stroke="#2a1a10" stroke-width="2.6" fill="none" stroke-linecap="round"/>' +
      '<g class="k-hand"><path d="M72 58q12-2 9-16" stroke="#c4560a" stroke-width="5.5" fill="none" stroke-linecap="round"/><circle cx="81" cy="41" r="5" fill="#a9460a"/></g>' +
      "</svg>";
    const heart = (x, y, size, white) => {
      const h = document.createElement("span");
      h.className = "kiss-heart";
      h.style.width = h.style.height = size + "px";
      h.innerHTML = '<svg viewBox="0 0 24 24"><use href="#kh" fill="url(#' + (white ? "kHeartW" : "kHeart") + ')" stroke="' + (white ? "#f2711c" : "none") + '" stroke-width="' + (white ? "1.2" : "0") + '"/></svg>';
      h.style.transform = "translate(" + (x - size / 2) + "px," + (y - size / 2) + "px)";
      document.body.appendChild(h);
      return h;
    };
    const shower = (x, y, n, down) => {
      for (let i = 0; i < n; i++) {
        const a = (Math.PI * 2 * i) / n + Math.random() * 0.4;
        const d = 60 + Math.random() * 110;
        const s = 12 + Math.random() * 18;
        const h = heart(x, y, s, i % 3 === 0);
        const tx = x + Math.cos(a) * d - s / 2;
        const ty = y + Math.sin(a) * d - s / 2;
        h.animate([
          { transform: "translate(" + (x - s / 2) + "px," + (y - s / 2) + "px) scale(0.2) rotate(0deg)", opacity: 1 },
          { transform: "translate(" + tx + "px," + ty + "px) scale(1.1) rotate(" + (Math.random() * 40 - 20) + "deg)", opacity: 1, offset: 0.45 },
          { transform: "translate(" + tx + "px," + (ty + (down ? 1 : -1) * (60 + Math.random() * 40)) + "px) scale(0.7) rotate(" + (Math.random() * 60 - 30) + "deg)", opacity: 0 }
        ], { duration: 1300 + Math.random() * 500, easing: "cubic-bezier(.2,.7,.35,1)", fill: "forwards" });
        setTimeout(() => h.remove(), 1900);
      }
    };
    let active = 0;
    document.addEventListener("click", (e) => {
      if (e.target.closest && e.target.closest(".hero-bit")) return;
      const special = e.target.closest && e.target.closest(".nav-cta, .btn-primary, a[href*='wa.me'], a[download], .rail-bit, .peek-bit, .guide, .contact-row");
      if (!special) {
        let px = e.clientX, py = e.clientY;
        if (!px && !py && e.target.getBoundingClientRect) { const r = e.target.getBoundingClientRect(); px = r.left + r.width / 2; py = r.top + r.height / 2; }
        shower(px, py, 5, py < 220);
        return;
      }
      let x = e.clientX, y = e.clientY;
      if (!x && !y && e.target.getBoundingClientRect) { const r = e.target.getBoundingClientRect(); x = r.left + r.width / 2; y = r.top + r.height / 2; }
      if (active >= 4) { shower(x, y, 8); return; }
      active++;
      const k = document.createElement("div");
      k.className = "kiss";
      k.innerHTML = kissSvg;
      k.style.left = x + "px";
      k.style.top = y + "px";
      document.body.appendChild(k);
      const flip = x > window.innerWidth - 140 ? -1 : 1;
      const down = y < 220;
      if (down) k.style.marginTop = "18px";
      k.animate([
        { transform: "scale(" + 0 * flip + ",0) rotate(0deg)" },
        { transform: "scale(" + 1.2 * flip + ",1.2) rotate(" + -10 * flip + "deg)", offset: 0.6 },
        { transform: "scale(" + flip + ",1) rotate(" + -6 * flip + "deg)" }
      ], { duration: 420, easing: "cubic-bezier(.34,1.56,.64,1)", fill: "forwards" });
      const hand = k.querySelector(".k-hand");
      hand.style.transformBox = "fill-box";
      hand.style.transformOrigin = "0% 100%";
      hand.animate([
        { transform: "rotate(0deg)" },
        { transform: "rotate(-28deg)", offset: 0.2 },
        { transform: "rotate(18deg)", offset: 0.4 },
        { transform: "rotate(-28deg)", offset: 0.6 },
        { transform: "rotate(18deg)", offset: 0.8 },
        { transform: "rotate(0deg)" }
      ], { duration: 900, delay: 300, easing: "ease-in-out", fill: "forwards" });
      setTimeout(() => {
        const sx = x + 20 * flip, sy = down ? y + 58 : y - 36;
        const v = down ? 1 : -1;
        const ex = sx + 90 * flip, ey = sy + 120 * v;
        const big = heart(sx, sy, 38, false);
        big.animate([
          { transform: "translate(" + (sx - 19) + "px," + (sy - 19) + "px) scale(0.3) rotate(0deg)" },
          { transform: "translate(" + (sx + 55 * flip - 19) + "px," + (sy + 75 * v - 19) + "px) scale(1.25) rotate(" + 18 * flip + "deg)", offset: 0.6 },
          { transform: "translate(" + (ex - 19) + "px," + (ey - 19) + "px) scale(1.6) rotate(" + -8 * flip + "deg)" }
        ], { duration: 750, easing: "cubic-bezier(.3,.7,.4,1)", fill: "forwards" });
        for (let i = 0; i < 9; i++) {
          setTimeout(() => {
            const s = 9 + Math.random() * 6;
            const t = heart(sx, sy, s, i % 2 === 1);
            t.animate([
              { transform: "translate(" + (sx - s / 2) + "px," + (sy - s / 2) + "px) scale(0.4)", opacity: 1 },
              { transform: "translate(" + (sx + (30 + Math.random() * 40) * flip - s / 2) + "px," + (sy + v * (50 + Math.random() * 50) - s / 2) + "px) scale(1)", opacity: 0 }
            ], { duration: 900, easing: "ease-out", fill: "forwards" });
            setTimeout(() => t.remove(), 950);
          }, i * 90);
        }
        setTimeout(() => { big.remove(); shower(ex, ey, 26, down); }, 760);
      }, 620);
      k.animate([{ opacity: 1, transform: "scale(" + flip + ",1) rotate(" + -6 * flip + "deg)" }, { opacity: 0, transform: "scale(" + 0.3 * flip + ",0.3) translateY(10px)" }], { duration: 320, delay: 1500, easing: "ease-in", fill: "forwards" });
      setTimeout(() => { k.remove(); active--; }, 1850);
    });
  }

  // Section guides: a character welcomes you to each section, walks down with you, and hands over to the next one
  (() => {
    const sections = Array.from(document.querySelectorAll("main > section.section")).filter((s) => s.querySelector(".section-head, .section-title, .contact-title"));
    if (!sections.length) return;
    const ar = root.lang === "ar";
    const lines = ar
      ? { record: "أهلًا! هذه الأرقام", about: "تعرّف على بلال!", skills: "اضغط أي مفتاح!", experience: "لنمشِ معًا في مسيرته", projects: "تفضّل! أفضل أعماله", hire: "تحتاج شيئًا يُبنى؟", education: "من هنا بدأ كل شيء", contact: "قل مرحبًا لبلال!", services: "هذه خدماته", experience_ar: "" }
      : { record: "Hi! Here's the impact.", about: "Meet Bilal!", skills: "Press a key, any key!", experience: "Let's walk through his career!", projects: "Ta-da! His best work.", hire: "Need something built?", education: "Where it all started.", contact: "Say hi to Bilal!", services: "Here's what he does." };
    const fill = (id, fb) => 'url(#' + id + ') ' + fb;
    const eyes = '<g class="g-eyes"><ellipse cx="32" cy="46" rx="3.6" ry="4.8" fill="#2a1a10"/><ellipse cx="48" cy="46" rx="3.6" ry="4.8" fill="#2a1a10"/><circle cx="33.3" cy="44.2" r="1.3" fill="#fff"/><circle cx="49.3" cy="44.2" r="1.3" fill="#fff"/></g>';
    const face = eyes + '<circle cx="24" cy="54" r="3.6" fill="#ffb27a"/><circle cx="56" cy="54" r="3.6" fill="#ffb27a"/><path d="M35 55q5 4.5 10 0" fill="none" stroke="#2a1a10" stroke-width="2.4" stroke-linecap="round"/>';
    const charsAll = [
      '<svg viewBox="0 0 80 92"><ellipse cx="40" cy="88" rx="20" ry="3.5" fill="rgba(120,55,15,.22)"/><path d="M28 74v8M52 74v8" stroke="#c4560a" stroke-width="4.5" stroke-linecap="round"/><rect x="20" y="80" width="13" height="7" rx="3.5" fill="#8f3a07"/><rect x="47" y="80" width="13" height="7" rx="3.5" fill="#8f3a07"/><line x1="40" y1="16" x2="40" y2="7" stroke="#c4560a" stroke-width="3" stroke-linecap="round"/><circle class="g-bulb" cx="40" cy="6" r="4.4" fill="#ffb27a" stroke="#c4560a"/><rect x="10" y="18" width="60" height="58" rx="19" fill="#a9460a"/><rect x="10" y="16" width="60" height="56" rx="19" fill="' + fill("kBody", "#f2711c") + '"/><ellipse cx="26" cy="21" rx="10" ry="3" fill="#fff" opacity=".5" transform="rotate(-10 26 21)"/><rect x="17" y="27" width="46" height="36" rx="12" fill="#fff"/>' + face + '<path d="M11 50q-9 6-5 15" stroke="#c4560a" stroke-width="5" fill="none" stroke-linecap="round"/><g class="g-arm"><path d="M69 50q11-8 9-20" stroke="#c4560a" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="78" cy="28" r="4.6" fill="#a9460a"/></g></svg>',
      '<svg viewBox="0 0 80 92"><ellipse cx="40" cy="88" rx="22" ry="3.5" fill="rgba(120,55,15,.22)"/><circle cx="40" cy="52" r="32" fill="' + fill("kBody", "#f2711c") + '"/><ellipse cx="27" cy="33" rx="10" ry="5" fill="#fff" opacity=".5" transform="rotate(-28 27 33)"/>' + face + '<ellipse cx="11" cy="64" rx="6" ry="8" fill="#d75c0c" transform="rotate(25 11 64)"/><g class="g-arm"><ellipse cx="71" cy="46" rx="6" ry="9" fill="#d75c0c" transform="rotate(-35 71 46)"/></g></svg>',
      '<svg viewBox="0 0 80 92"><ellipse cx="40" cy="88" rx="22" ry="3.5" fill="rgba(120,55,15,.2)"/><circle cx="40" cy="52" r="32" fill="' + fill("kHeartW", "#fff6ee") + '" stroke="#f3d2b6" stroke-width="1"/><ellipse cx="27" cy="33" rx="10" ry="5" fill="#fff" opacity=".95" transform="rotate(-28 27 33)"/><path d="M28 46q4-4 8 0M44 46q4-4 8 0" fill="none" stroke="#2a1a10" stroke-width="2.6" stroke-linecap="round"/><circle cx="24" cy="54" r="3.8" fill="#ffb27a"/><circle cx="56" cy="54" r="3.8" fill="#ffb27a"/><path d="M35 55q5 4.5 10 0" fill="none" stroke="#2a1a10" stroke-width="2.4" stroke-linecap="round"/><ellipse cx="11" cy="64" rx="6" ry="8" fill="#f6e2d0" transform="rotate(25 11 64)"/><g class="g-arm"><ellipse cx="71" cy="46" rx="6" ry="9" fill="#f6e2d0" transform="rotate(-35 71 46)"/></g></svg>',
      '<svg viewBox="0 0 80 92"><ellipse cx="40" cy="88" rx="20" ry="3.5" fill="rgba(120,55,15,.22)"/><g class="g-arm"><path d="M40 8l9.2 20.4 22.3 2.4-16.7 15 4.7 21.9L40 56.4 20.5 67.7l4.7-21.9-16.7-15 22.3-2.4Z" fill="' + fill("kHeart", "#f7801f") + '" stroke="#d75c0c" stroke-width="1.6" stroke-linejoin="round"/></g><ellipse cx="31" cy="27" rx="5" ry="2.6" fill="#fff" opacity=".6" transform="rotate(-30 31 27)"/><ellipse cx="34" cy="40" rx="2.6" ry="3.4" fill="#2a1a10"/><ellipse cx="46" cy="40" rx="2.6" ry="3.4" fill="#2a1a10"/><circle cx="35" cy="38.8" r="1" fill="#fff"/><circle cx="47" cy="38.8" r="1" fill="#fff"/><circle cx="29" cy="46" r="2.6" fill="#ffd2b0"/><circle cx="51" cy="46" r="2.6" fill="#ffd2b0"/><path d="M37 47q3 2.8 6 0" fill="none" stroke="#2a1a10" stroke-width="2" stroke-linecap="round"/><path d="M32 66v14M48 66v14" stroke="#c4560a" stroke-width="4" stroke-linecap="round"/><rect x="25" y="79" width="12" height="6" rx="3" fill="#8f3a07"/><rect x="43" y="79" width="12" height="6" rx="3" fill="#8f3a07"/></svg>'
    ];

    const chars = [charsAll[0]];
    const guides = sections.map((sec, i) => {
      const g = document.createElement("div");
      g.className = "guide";
      g.setAttribute("aria-hidden", "true");
      const title = sec.querySelector(".section-title, .contact-title");
      const key = sec.id || "";
      const text = lines[key] || (ar ? "أهلًا! هذا قسم " : "Welcome to ") + (title ? title.textContent.replace(/\s+/g, " ").trim().replace(/\.$/, "") : "");
      g.innerHTML = '<span class="g-bubble">' + text.replace(/</g, "&lt;") + '</span><span class="g-inner">' + chars[i % chars.length] + "</span>";
      sec.appendChild(g);
      return { sec, g, greeted: false, handed: false };
    });

    const greet = (o) => {
      if (o.greeted) return;
      o.greeted = true;
      o.g.classList.add("in", "wave", "talk");
      setTimeout(() => o.g.classList.remove("wave"), 2000);
      setTimeout(() => o.g.classList.remove("talk"), 3200);
    };
    if (reduceMotion) {
      guides.forEach((o) => o.g.classList.add("in"));
      return;
    }

    const travel = () => window.innerWidth >= 1340;
    const handOff = (o, next) => {
      o.handed = true;
      o.g.classList.add("toss");
      setTimeout(() => o.g.classList.remove("toss"), 600);
      if (!next) return;
      const a = o.g.getBoundingClientRect();
      const b = next.g.getBoundingClientRect();
      const sx = a.left + a.width / 2, sy = a.top + 20, ex = b.left + b.width / 2, ey = b.top + 20;
      const h = document.createElement("span");
      h.className = "kiss-heart";
      h.style.width = h.style.height = "26px";
      h.innerHTML = '<svg viewBox="0 0 24 24"><use href="#kh" fill="url(#kHeart) #f2711c"/></svg>';
      document.body.appendChild(h);
      const midX = (sx + ex) / 2 + (ex > sx ? 60 : -60), midY = Math.min(sy, ey) - 80;
      h.animate([
        { transform: "translate(" + (sx - 13) + "px," + (sy - 13) + "px) scale(.5) rotate(0deg)" },
        { transform: "translate(" + (midX - 13) + "px," + (midY - 13) + "px) scale(1.3) rotate(200deg)", offset: 0.5 },
        { transform: "translate(" + (ex - 13) + "px," + (ey - 13) + "px) scale(.9) rotate(360deg)" }
      ], { duration: 900, easing: "cubic-bezier(.35,.1,.3,1)", fill: "forwards" });
      setTimeout(() => {
        h.remove();
        next.greeted = false;
        greet(next);
        next.g.classList.add("catch");
        setTimeout(() => next.g.classList.remove("catch"), 600);
      }, 900);
    };

    let queued = false;
    const walkTimers = new WeakMap();
    const update = () => {
      queued = false;
      const vh = window.innerHeight;
      const canTravel = travel();
      guides.forEach((o, i) => {
        const r = o.sec.getBoundingClientRect();
        if (r.top < vh * 0.82 && r.bottom > vh * 0.15) greet(o);
        if (!canTravel) { o.g.style.setProperty("--gy", "0px"); return; }
        const span = Math.max(r.height - 260, 0);
        const p = Math.min(Math.max((vh * 0.35 - r.top) / Math.max(r.height - vh * 0.35, 1), 0), 1);
        const y = (p * span).toFixed(1);
        if (o.g.style.getPropertyValue("--gy") !== y + "px") {
          o.g.style.setProperty("--gy", y + "px");
          o.g.classList.add("walking");
          clearTimeout(walkTimers.get(o.g));
          walkTimers.set(o.g, setTimeout(() => o.g.classList.remove("walking"), 240));
        }
        if (!o.handed && p > 0.9 && o.greeted) handOff(o, guides[i + 1]);
        if (o.handed && p < 0.6) o.handed = false;
      });
    };
    const onScroll = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    setTimeout(update, 300);
  })();
})();
