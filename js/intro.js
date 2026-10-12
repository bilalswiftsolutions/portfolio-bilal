(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!document.querySelector(".hero-w")) return;
  if (location.hash) return;


  const defs = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<radialGradient id="iOrange" cx="32%" cy="24%" r="85%"><stop offset="0" stop-color="#ffc49a"/><stop offset=".45" stop-color="#f7801f"/><stop offset="1" stop-color="#b9480a"/></radialGradient>
<radialGradient id="iWhite" cx="32%" cy="24%" r="85%"><stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#fff4ea"/><stop offset="1" stop-color="#e3c9b1"/></radialGradient>
<radialGradient id="iStar" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#fff3e2"/><stop offset=".45" stop-color="#ffb15c"/><stop offset="1" stop-color="#e0600a"/></radialGradient>
<linearGradient id="iCap" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a4318"/><stop offset="1" stop-color="#3d1d0a"/></linearGradient>
<linearGradient id="iScreen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3e8"/><stop offset=".4" stop-color="#fff"/><stop offset="1" stop-color="#ffe9d6"/></linearGradient>
<symbol id="c-blob" viewBox="0 0 60 60"><circle cx="30" cy="32" r="24" fill="url(#iOrange)"/><ellipse cx="21" cy="19" rx="8" ry="4.5" fill="#fff" opacity=".55" transform="rotate(-25 21 19)"/><ellipse cx="23" cy="32" rx="3" ry="4" fill="#2a1a10"/><ellipse cx="37" cy="32" rx="3" ry="4" fill="#2a1a10"/><circle cx="24" cy="30.6" r="1" fill="#fff"/><circle cx="38" cy="30.6" r="1" fill="#fff"/><circle cx="17" cy="38" r="3" fill="#ffc49a"/><circle cx="43" cy="38" r="3" fill="#ffc49a"/><path d="M26 39q4 3.5 8 0" fill="none" stroke="#2a1a10" stroke-width="2" stroke-linecap="round"/></symbol>
<symbol id="c-white" viewBox="0 0 60 60"><circle cx="30" cy="32" r="24" fill="url(#iWhite)"/><ellipse cx="21" cy="19" rx="8" ry="4.5" fill="#fff" opacity=".9" transform="rotate(-25 21 19)"/><path d="M20 31q3-3.5 6 0M34 31q3-3.5 6 0" fill="none" stroke="#2a1a10" stroke-width="2.2" stroke-linecap="round"/><circle cx="17" cy="37" r="3.2" fill="#ffb27a"/><circle cx="43" cy="37" r="3.2" fill="#ffb27a"/><path d="M27 38q3 3 6 0" fill="none" stroke="#2a1a10" stroke-width="2" stroke-linecap="round"/></symbol>
<symbol id="c-bit" viewBox="0 0 60 60"><line x1="30" y1="10" x2="30" y2="4" stroke="#c4560a" stroke-width="2.5" stroke-linecap="round"/><circle cx="30" cy="4" r="3.2" fill="url(#iStar)"/><rect x="8" y="11" width="44" height="40" rx="14" fill="#a9460a"/><rect x="8" y="10" width="44" height="38" rx="14" fill="url(#iOrange)"/><rect x="14" y="17" width="32" height="24" rx="9" fill="url(#iScreen)"/><rect x="22" y="23" width="4" height="7" rx="2" fill="#2a1a10"/><rect x="34" y="23" width="4" height="7" rx="2" fill="#2a1a10"/><path d="M27 34q3 2.6 6 0" fill="none" stroke="#2a1a10" stroke-width="1.8" stroke-linecap="round"/><ellipse cx="17" cy="14" rx="6" ry="2" fill="#fff" opacity=".5" transform="rotate(-12 17 14)"/></symbol>
<symbol id="c-heart" viewBox="0 0 60 60"><path d="M30 52S8 38.5 6.5 24.5C5.4 14 17.5 8.5 24.5 15.5L30 21l5.5-5.5c7-7 19.1-1.5 18 9C52 38.5 30 52 30 52Z" fill="url(#iOrange)"/><ellipse cx="17" cy="18" rx="5.5" ry="3.2" fill="#fff" opacity=".6" transform="rotate(-35 17 18)"/></symbol>
<symbol id="c-star" viewBox="0 0 60 60"><path d="M30 5l7 15.5 17 1.8-12.7 11.4 3.6 16.7L30 41.8l-14.9 8.6 3.6-16.7L6 22.3l17-1.8Z" fill="url(#iStar)" stroke="#d75c0c" stroke-width="1.5" stroke-linejoin="round"/><circle cx="25" cy="29" r="2.2" fill="#2a1a10"/><circle cx="35" cy="29" r="2.2" fill="#2a1a10"/><path d="M27.5 34q2.5 2.2 5 0" fill="none" stroke="#2a1a10" stroke-width="1.6" stroke-linecap="round"/></symbol>
</defs></svg>`;

  const bombSvg = `<svg viewBox="0 0 120 150" aria-hidden="true">
<defs>
<linearGradient id="bkBody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffb06a"/><stop offset=".5" stop-color="#f2711c"/><stop offset="1" stop-color="#b9480a"/></linearGradient>
<radialGradient id="bkPetal" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#fff"/><stop offset=".6" stop-color="#fff4ea"/><stop offset="1" stop-color="#f1cfb2"/></radialGradient>
<radialGradient id="bkPetalO" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#ffd2b0"/><stop offset=".5" stop-color="#ff9a52"/><stop offset="1" stop-color="#d75c0c"/></radialGradient>
<symbol id="bkFlower" viewBox="-20 -20 40 40"><g class="petals"><ellipse cx="0" cy="-10" rx="6.5" ry="9"/><ellipse cx="9.5" cy="-3.1" rx="6.5" ry="9" transform="rotate(72 9.5 -3.1)"/><ellipse cx="5.9" cy="8.1" rx="6.5" ry="9" transform="rotate(144 5.9 8.1)"/><ellipse cx="-5.9" cy="8.1" rx="6.5" ry="9" transform="rotate(216 -5.9 8.1)"/><ellipse cx="-9.5" cy="-3.1" rx="6.5" ry="9" transform="rotate(288 -9.5 -3.1)"/></g><circle r="6" fill="#ffd27a" stroke="#e8902f" stroke-width="1"/><circle cx="-1.6" cy="-1.8" r="1.8" fill="#fff" opacity=".8"/></symbol>
</defs>
<path d="M22 70 C 22 10, 98 10, 98 70" fill="none" stroke="#a9460a" stroke-width="8" stroke-linecap="round"/>
<path d="M22 70 C 22 10, 98 10, 98 70" fill="none" stroke="#ffb27a" stroke-width="3" stroke-linecap="round" opacity=".7"/>
<path d="M60 64 q-2-16 4-26" stroke="#2f8a3e" stroke-width="2.5" fill="none"/><path d="M40 66 q-4-14-14-20" stroke="#2f8a3e" stroke-width="2.5" fill="none"/><path d="M80 66 q4-14 14-20" stroke="#2f8a3e" stroke-width="2.5" fill="none"/>
<g class="sway"><use href="#bkFlower" x="14" y="28" width="26" height="26" fill="url(#bkPetalO)"/><use href="#bkFlower" x="80" y="28" width="26" height="26" fill="url(#bkPetal)"/><use href="#bkFlower" x="44" y="18" width="34" height="34" fill="url(#bkPetal)"/><use href="#bkFlower" x="28" y="44" width="24" height="24" fill="url(#bkPetal)"/><use href="#bkFlower" x="68" y="44" width="24" height="24" fill="url(#bkPetalO)"/></g>
<path d="M14 66 H106 L96 138 Q95 145 88 145 H32 Q25 145 24 138 Z" fill="url(#bkBody)"/>
<g stroke="#a9460a" stroke-width="2.2" opacity=".55" fill="none"><path d="M18 84 H102"/><path d="M20 102 H100"/><path d="M22 120 H98"/><path d="M38 66 L42 145M60 66 V145M82 66 L78 145"/></g>
<rect x="10" y="62" width="100" height="13" rx="6.5" fill="#d75c0c"/><rect x="14" y="63.5" width="60" height="4" rx="2" fill="#fff" opacity=".35"/>
<ellipse cx="36" cy="86" rx="10" ry="4" fill="#fff" opacity=".35" transform="rotate(-8 36 86)"/>
<ellipse cx="48" cy="104" rx="4.4" ry="5.8" fill="#2a1a10"/><ellipse cx="72" cy="104" rx="4.4" ry="5.8" fill="#2a1a10"/>
<circle cx="49.4" cy="101.8" r="1.6" fill="#fff"/><circle cx="73.4" cy="101.8" r="1.6" fill="#fff"/>
<circle cx="38" cy="114" r="5" fill="#ffc49a"/><circle cx="82" cy="114" r="5" fill="#ffc49a"/>
<path d="M54 114 q6 6 12 0" fill="none" stroke="#2a1a10" stroke-width="2.6" stroke-linecap="round"/>
</svg>`;

  const ov = document.createElement("div");
  ov.className = "intro";
  ov.setAttribute("aria-hidden", "true");
  ov.innerHTML = defs + `<div class="intro-shadow"></div><div class="intro-bomb">${bombSvg}</div><div class="intro-flash"></div><div class="intro-ring"></div><div class="intro-ring r2"></div>`;
  document.body.appendChild(ov);

  const W = window.innerWidth;
  const H = window.innerHeight;
  const size = Math.min(130, Math.max(84, W * 0.12));
  const bomb = ov.querySelector(".intro-bomb");
  const shadow = ov.querySelector(".intro-shadow");
  const flash = ov.querySelector(".intro-flash");
  const rings = ov.querySelectorAll(".intro-ring");
  bomb.style.width = size + "px";
  const groundY = H - size * 1.25 - 12;
  const cx = W / 2;
  const cy = H - size * 0.55 - 12;
  let done = false;
  const anims = [];
  const track = (a) => { anims.push(a); return a; };

  const finish = () => {
    if (done) return;
    done = true;
    ["keydown"].forEach((t) => window.removeEventListener(t, skip));
    ov.style.transition = "opacity 0.26s ease";
    ov.style.opacity = "0";
    setTimeout(() => { anims.forEach((x) => x.cancel()); ov.remove(); }, 300);
  };
  const skip = (e) => { if (e && e.key !== "Escape") return; anims.forEach((a) => a.cancel()); finish(); };
  ["keydown"].forEach((t) => window.addEventListener(t, skip, { passive: true }));

  const fall = 2900;
  track(bomb.animate([
    { transform: `translate(-50%, ${-size * 1.6}px) rotate(-24deg)` },
    { transform: `translate(-50%, ${groundY * 0.55}px) rotate(8deg)`, offset: 0.62 },
    { transform: `translate(-50%, ${groundY}px) rotate(-4deg)` }
  ], { duration: fall, easing: "cubic-bezier(.45,.05,.75,.6)", fill: "forwards" }));
  track(shadow.animate([
    { transform: "translateX(-50%) scale(0.15)", opacity: 0 },
    { transform: "translateX(-50%) scale(1)", opacity: 1 }
  ], { duration: fall, easing: "ease-in", fill: "forwards" }));

  setTimeout(() => {
    if (done) return;
    track(bomb.animate([
      { transform: `translate(-50%, ${groundY}px) scale(1, 1)` },
      { transform: `translate(-50%, ${groundY + size * 0.12}px) scale(1.22, 0.76)`, offset: 0.55 },
      { transform: `translate(-50%, ${groundY - size * 0.05}px) scale(0.9, 1.12)` }
    ], { duration: 520, easing: "ease-out", fill: "forwards" }));
  }, fall);

  setTimeout(() => {
    if (done) return;
    track(bomb.animate([
      { transform: `translate(-50%, ${groundY}px) scale(1)`, opacity: 1 },
      { transform: `translate(-50%, ${groundY - size * 0.2}px) scale(1.7)`, opacity: 0 }
    ], { duration: 380, easing: "ease-out", fill: "forwards" }));
    track(shadow.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 380, fill: "forwards" }));
    flash.style.background = `radial-gradient(circle at ${cx}px ${cy}px, rgba(255,252,246,.95) 0, rgba(255,214,176,.6) 20%, rgba(255,178,122,.25) 42%, rgba(242,113,28,0) 70%)`;
    track(flash.animate([{ opacity: 0 }, { opacity: 1, offset: 0.15 }, { opacity: 0 }], { duration: 1500, easing: "ease-out", fill: "forwards" }));
    rings.forEach((r, i) => {
      r.style.left = cx + "px";
      r.style.top = cy + "px";
      track(r.animate([
        { transform: "translate(-50%,-50%) scale(0.2)", opacity: 0.95 },
        { transform: `translate(-50%,-50%) scale(${i ? 9 : 6})`, opacity: 0 }
      ], { duration: i ? 2100 : 1500, delay: i * 220, easing: "cubic-bezier(.2,.7,.3,1)", fill: "forwards" }));
    });
    burst();
  }, fall + 520);

  function burst() {
    const kinds = ["c-bit", "c-blob", "c-white", "c-heart", "c-star", "c-blob", "c-white", "c-bit", "c-star", "c-heart"];
    const count = W < 640 ? 16 : 32;
    let maxEnd = 0;
    for (let i = 0; i < count; i++) {
      const el = document.createElement("div");
      el.className = "intro-char";
      const s = Math.round((W < 640 ? 40 : 54) + Math.random() * (W < 640 ? 26 : 50));
      el.style.width = el.style.height = s + "px";
      el.innerHTML = `<svg viewBox="0 0 60 60"><use href="#${kinds[i % kinds.length]}"/></svg>`;
      ov.appendChild(el);
      const ang = (-170 + (160 * i) / (count - 1) + (Math.random() * 14 - 7)) * Math.PI / 180;
      const dist = 0.35 + Math.random() * 0.7;
      const tx = Math.min(Math.max(cx + Math.cos(ang) * W * 0.62 * dist, s), W - s) - s / 2;
      const ty = Math.min(Math.max(cy + Math.sin(ang) * H * 1.05 * dist, 70), H - s * 1.4) - s / 2;
      const peak = Math.min(ty, cy) - 60 - Math.random() * 90;
      const midX = (cx - s / 2 + tx) / 2;
      const rot = Math.random() * 60 - 30;
      const fly = 2100 + Math.random() * 600;
      const stay = 1900 + Math.random() * 600;
      track(el.animate([
        { transform: `translate(${cx - s / 2}px, ${cy - s / 2}px) scale(0.2) rotate(0deg)`, opacity: 0 },
        { transform: `translate(${midX}px, ${peak}px) scale(1.15) rotate(${rot * 2}deg)`, opacity: 1, offset: 0.45 },
        { transform: `translate(${tx}px, ${ty}px) scale(1.25, 0.8) rotate(${rot}deg)`, offset: 0.82 },
        { transform: `translate(${tx}px, ${ty - 6}px) scale(1) rotate(${rot}deg)` }
      ], { duration: fly, easing: "cubic-bezier(.25,.8,.35,1)", fill: "forwards" }));
      track(el.animate([
        { transform: `translate(${tx}px, ${ty - 6}px) scale(1) rotate(${rot}deg)` },
        { transform: `translate(${tx}px, ${ty - 16}px) scale(1.05) rotate(${-rot}deg)` },
        { transform: `translate(${tx}px, ${ty - 6}px) scale(1) rotate(${rot}deg)` }
      ], { duration: 1100, delay: fly, iterations: 1, easing: "ease-in-out", fill: "forwards" }));
      const out = fly + stay;
      track(el.animate([
        { transform: `translate(${tx}px, ${ty - 6}px) scale(1) rotate(${rot}deg)`, opacity: 1 },
        { transform: `translate(${tx}px, ${ty - 14}px) scale(1.25) rotate(${rot}deg)`, opacity: 1, offset: 0.35 },
        { transform: `translate(${tx}px, ${ty - 20}px) scale(0) rotate(${rot}deg)`, opacity: 0 }
      ], { duration: 700, delay: out, easing: "cubic-bezier(.5,0,.75,0)", fill: "forwards" }));
      maxEnd = Math.max(maxEnd, out + 700);
    }
    const bits = W < 640 ? 26 : 46;
    for (let i = 0; i < bits; i++) {
      const c = document.createElement("i");
      c.className = "intro-confetti petal" + (i % 3 === 0 ? " w" : "");
      ov.appendChild(c);
      const a = Math.random() * Math.PI - Math.PI;
      const d = 120 + Math.random() * Math.max(W, H) * 0.5;
      track(c.animate([
        { transform: `translate(${cx}px, ${cy}px) rotate(0deg) scale(1)`, opacity: 1 },
        { transform: `translate(${cx + Math.cos(a) * d}px, ${cy + Math.sin(a) * d + 160}px) rotate(${Math.random() * 720}deg) scale(0.6)`, opacity: 0 }
      ], { duration: 2600 + Math.random() * 1000, easing: "cubic-bezier(.2,.7,.4,1)", fill: "forwards" }));
    }
    setTimeout(finish, maxEnd + 40);
  }
})();
