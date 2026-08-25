(function () {
  "use strict";

  const stage = document.querySelector("[data-cyber-worm]");
  const canvas = document.querySelector("[data-cyber-worm-canvas]");
  if (!stage || !canvas) return;

  const context = canvas.getContext("2d", { alpha: true });
  if (!context) return;

  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const forcedColors = matchMedia("(forced-colors: active)");
  const coarsePointer = matchMedia("(pointer: coarse)").matches;
  const lowPower = coarsePointer || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) || (navigator.deviceMemory && navigator.deviceMemory <= 4);
  const samples = lowPower ? 2600 : 5600;
  const values = new Float32Array(samples);
  for (let index = 0; index < samples; index += 1) values[index] = index * (10000 / samples);

  let width = 0;
  let height = 0;
  let frame = 0;
  let visible = true;
  let lastTime = 0;
  let phase = 0;

  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    width = Math.max(1, stage.clientWidth);
    height = Math.max(1, stage.clientHeight);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function draw(now, staticFrame) {
    frame = 0;
    if (!staticFrame) {
      if (lastTime && now - lastTime < (lowPower ? 54 : 34)) {
        frame = requestAnimationFrame(animate);
        return;
      }
      const elapsed = lastTime ? Math.min(64, now - lastTime) : 16;
      lastTime = now;
      phase += elapsed * 0.00027;
    }

    context.clearRect(0, 0, width, height);
    const scale = Math.min(width / 540, height / 650) * (coarsePointer ? 0.86 : 1);
    const offsetX = width * 0.64;
    const offsetY = height * 0.53;
    const time = staticFrame ? 1.2 : phase;

    context.save();
    context.globalCompositeOperation = "lighter";
    for (let index = 0; index < samples; index += 1) {
      const i = values[index];
      const y = i / 235;
      const e = y / 8 - 13;
      const k = (4 + Math.sin(y * 2 - time) * 3) * Math.cos(i / 29);
      const safeK = Math.abs(k) < 0.045 ? (k < 0 ? -0.045 : 0.045) : k;
      const d = Math.hypot(k, e);
      const q = 3 * Math.sin(k * 2) + 0.3 / safeK + Math.sin(y / 25) * k * (9 + 4 * Math.sin(e * 9 - d * 3 + time * 2));
      const sourceX = q + 30 * Math.cos(d - time) - 200;
      const sourceY = 310 - q * Math.sin(d - time) - d * 39;
      const x = offsetX + sourceX * scale;
      const py = offsetY + sourceY * scale;
      if (x < -12 || x > width + 12 || py < -12 || py > height + 12) continue;

      const spine = Math.max(0, 1 - Math.abs(k) / 1.1) * (.48 + .52 * Math.sin(y * .48 - time * 2.1) ** 2);
      const alpha = (index % 5 === 0 ? .19 : .07) + Math.min(.18, d * .007);
      const radius = index % 17 === 0 ? 1.25 : (index % 5 === 0 ? .8 : .52);
      context.fillStyle = spine > .63
        ? `rgba(196, 32, 38, ${Math.min(.48, alpha + spine * .18)})`
        : `rgba(233, 228, 221, ${Math.min(.31, alpha)})`;
      context.beginPath();
      context.arc(x, py, radius, 0, Math.PI * 2);
      context.fill();
    }
    context.restore();

    if (!staticFrame && visible && !document.hidden && !forcedColors.matches) frame = requestAnimationFrame(animate);
  }

  function animate(now) { draw(now, false); }

  function render() {
    cancelAnimationFrame(frame);
    frame = 0;
    lastTime = 0;
    canvas.hidden = forcedColors.matches;
    if (forcedColors.matches) return;
    if (reducedMotion.matches) draw(performance.now(), true);
    else if (visible && !document.hidden) frame = requestAnimationFrame(animate);
  }

  resize();
  render();

  const resizeObserver = "ResizeObserver" in window ? new ResizeObserver(() => { resize(); render(); }) : null;
  if (resizeObserver) resizeObserver.observe(stage);
  else addEventListener("resize", () => { resize(); render(); }, { passive: true });

  const visibilityObserver = "IntersectionObserver" in window ? new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (!visible) { cancelAnimationFrame(frame); frame = 0; }
    else render();
  }, { rootMargin: "160px" }) : null;
  if (visibilityObserver) visibilityObserver.observe(stage);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; }
    else render();
  });
  reducedMotion.addEventListener?.("change", render);
  forcedColors.addEventListener?.("change", render);
  addEventListener("pagehide", () => {
    cancelAnimationFrame(frame);
    resizeObserver?.disconnect();
    visibilityObserver?.disconnect();
  }, { once: true });
})();
