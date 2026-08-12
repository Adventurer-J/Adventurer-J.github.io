(function () {
  "use strict";

  const TAU = Math.PI * 2;
  const SYMBOLS = ["∇", "∫", "Σ", "λ", "ψ", "∞", "∂", "Ω", "φ", "Δ", "π", "i"];
  const CURVES = [
    {
      label: "γ(s,t) = Rθ[L(½−s), A·sin(κs−ωt)·e^(−μs)]",
      amplitude: 0.115,
      harmonics: [[2.15, 1.06, 1], [4.7, -0.46, 0.27], [7.3, 0.24, 0.12]],
      phase: 0.1,
      tilt: -0.12
    },
    {
      label: "γ(s,t) = Σ aₙ·[cos(nκs−ωₙt), sin(nκs−ωₙt)]",
      amplitude: 0.102,
      harmonics: [[1.7, 0.82, 1], [3.4, -1.21, 0.38], [6.8, 0.51, 0.14]],
      phase: 1.4,
      tilt: 0.16
    },
    {
      label: "γ(s,t) = [Ls, A·sin(2πks+φt)+B·cos(πs−ωt)]",
      amplitude: 0.128,
      harmonics: [[2.8, 0.72, 1], [5.6, -0.35, 0.32], [1.15, 1.34, 0.2]],
      phase: 2.25,
      tilt: -0.24
    },
    {
      label: "γ(s,t) = Rθ·[L(1−s), Im(e^(iκs)·e^(−iωt))]",
      amplitude: 0.093,
      harmonics: [[2.35, 1.18, 1], [4.7, 0.58, 0.22], [9.4, -0.3, 0.08]],
      phase: 3.05,
      tilt: 0.08
    }
  ];

  function initializeCyberSpine(canvas, canvasIndex) {
    const layer = canvas.closest("[data-sf-spine-layer]") || canvas.closest(".cm-tianyan-hero");
    const scene = canvas.closest(".sf-hero") || layer;
    if (!layer || !scene) return;

    const context = canvas.getContext("2d", { alpha: true, desynchronized: true });
    if (!context) return;

    const variant = canvas.dataset.sfVariant || "landing";
    const controls = scene.querySelector(".sf-spine-console");
    const formulaOutput = scene.querySelector("[data-sf-formula]");
    const generateButton = scene.querySelector("[data-sf-generate]");
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0, active: false };

    let width = 0;
    let height = 0;
    let ratio = 1;
    let points = [];
    let frame = 0;
    let visible = true;
    let curveIndex = variant === "story" ? 1 : canvasIndex % CURVES.length;
    let pulse = 0;
    let changeTimer = 0;

    function themeIsDark() {
      return document.documentElement.dataset.cmTheme === "dark" || variant === "story";
    }

    function resize() {
      const box = layer.getBoundingClientRect();
      width = Math.max(1, Math.round(box.width));
      height = Math.max(1, Math.round(box.height));
      ratio = Math.min(devicePixelRatio || 1, 1.65);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      pointer.x = pointer.targetX = width * (variant === "story" ? 0.74 : 0.72);
      pointer.y = pointer.targetY = height * 0.5;
      paint(performance.now(), true);
    }

    /*
     * This is not a traced illustration: every vertebra is sampled each frame
     * from a finite Fourier parametric curve γ(s,t). Ribs use its normal vector.
     */
    function sampleCurve(now, staticFrame) {
      const curve = CURVES[curveIndex];
      const time = now * 0.001;
      const count = width < 680 ? 58 : variant === "story" ? 72 : 86;
      const length = Math.min(width * (variant === "story" ? 0.62 : 0.57), height * 0.92);
      const amplitude = Math.min(width, height) * curve.amplitude;
      const baseX = width * (variant === "story" ? 0.73 : 0.72);
      const baseY = height * (variant === "story" ? 0.51 : 0.5);

      if (!pointer.active || staticFrame || reducedMotion.matches) {
        pointer.targetX = baseX + Math.cos(time * 0.24 + curve.phase) * width * 0.025;
        pointer.targetY = baseY + Math.sin(time * 0.31 + curve.phase) * height * 0.035;
      }
      pointer.x += (pointer.targetX - pointer.x) * (staticFrame ? 1 : 0.035);
      pointer.y += (pointer.targetY - pointer.y) * (staticFrame ? 1 : 0.035);

      const steerX = (pointer.x / width - 0.5) * 0.24;
      const steerY = (pointer.y / height - 0.5) * 0.18;
      const theta = curve.tilt + steerY - steerX * 0.24;
      const cosTheta = Math.cos(theta);
      const sinTheta = Math.sin(theta);
      const phaseTime = reducedMotion.matches ? 0.8 : time;

      points = Array.from({ length: count }, function (_, index) {
        const s = index / (count - 1);
        const envelope = 0.2 + 0.8 * Math.pow(s, 0.78);
        let wave = 0;
        curve.harmonics.forEach(function (term, harmonicIndex) {
          const spatial = term[0] * TAU * s;
          const temporal = term[1] * phaseTime;
          wave += Math.sin(spatial - temporal + curve.phase + harmonicIndex * 0.41) * term[2];
        });
        const localX = (0.48 - s) * length + Math.sin(s * TAU * 1.6 + phaseTime * 0.32) * length * 0.014 * s;
        const localY = wave * amplitude * envelope;
        return {
          x: pointer.x + localX * cosTheta - localY * sinTheta,
          y: pointer.y + localX * sinTheta + localY * cosTheta,
          s: s
        };
      });
      pulse *= staticFrame ? 0 : 0.94;
    }

    function normalAt(index) {
      const before = points[Math.max(0, index - 1)];
      const after = points[Math.min(points.length - 1, index + 1)];
      const dx = after.x - before.x;
      const dy = after.y - before.y;
      const distance = Math.max(0.001, Math.hypot(dx, dy));
      return { x: -dy / distance, y: dx / distance, angle: Math.atan2(dy, dx) };
    }

    function drawGuideField(now) {
      const dark = themeIsDark();
      const time = now * 0.001;
      context.save();
      context.globalCompositeOperation = dark ? "lighter" : "source-over";
      context.setLineDash([3, 10]);
      context.lineWidth = 0.7;
      context.strokeStyle = dark ? "rgba(115,185,179,.13)" : "rgba(66,133,128,.12)";
      [0.17, 0.36, 0.58, 0.79].forEach(function (fraction, index) {
        const pointIndex = Math.floor((points.length - 1) * fraction);
        const point = points[pointIndex];
        const normal = normalAt(pointIndex);
        const reach = 44 + index * 11 + Math.sin(time + index) * 4;
        context.beginPath();
        context.moveTo(point.x - normal.x * reach, point.y - normal.y * reach);
        context.lineTo(point.x + normal.x * reach, point.y + normal.y * reach);
        context.stroke();
      });
      context.restore();
    }

    function drawSpine(now) {
      const dark = themeIsDark();
      const copper = dark ? "226,158,132" : "151,85,69";
      const cyan = dark ? "115,198,191" : "55,126,121";
      const ink = dark ? "238,232,220" : "36,38,34";
      const time = now * 0.001;

      context.save();
      context.lineCap = "round";
      context.lineJoin = "round";
      context.shadowColor = `rgba(${cyan},${0.22 + pulse * 0.22})`;
      context.shadowBlur = 14 + pulse * 22;
      context.strokeStyle = `rgba(${cyan},${dark ? 0.4 : 0.34})`;
      context.lineWidth = 2.1 + pulse * 0.6;
      context.beginPath();
      points.forEach(function (point, index) {
        if (index === 0) context.moveTo(point.x, point.y);
        else context.lineTo(point.x, point.y);
      });
      context.stroke();

      points.forEach(function (point, index) {
        const normal = normalAt(index);
        const s = point.s;
        const joint = index % 4 === 0;
        const taper = Math.pow(1 - s, 0.58);
        const ribLength = 3.2 + taper * (12 + Math.sin(index * 0.66 - time * 1.4) * 2.2);
        const sweep = Math.sin(index * 0.34 - time * 1.2) * 2.4 * taper;

        context.shadowBlur = joint ? 9 + pulse * 9 : 0;
        context.strokeStyle = joint ? `rgba(${copper},${dark ? 0.78 : 0.62})` : `rgba(${cyan},${dark ? 0.36 : 0.29})`;
        context.lineWidth = joint ? 1.25 : 0.7;
        context.beginPath();
        context.moveTo(point.x - normal.x * ribLength, point.y - normal.y * ribLength);
        context.quadraticCurveTo(point.x + Math.cos(normal.angle) * sweep, point.y + Math.sin(normal.angle) * sweep, point.x + normal.x * ribLength, point.y + normal.y * ribLength);
        context.stroke();

        context.fillStyle = joint ? `rgba(${copper},${dark ? 0.95 : 0.82})` : `rgba(${cyan},${dark ? 0.72 : 0.58})`;
        context.beginPath();
        context.arc(point.x, point.y, joint ? 2.05 + pulse * 0.5 : 1.05, 0, TAU);
        context.fill();

        if (joint && index > 1) {
          context.strokeStyle = `rgba(${ink},${dark ? 0.16 : 0.12})`;
          context.lineWidth = 0.65;
          context.beginPath();
          context.arc(point.x, point.y, 4.8 + taper * 1.7, 0, TAU);
          context.stroke();
        }
      });

      const head = points[0];
      const headNormal = normalAt(0);
      context.save();
      context.translate(head.x, head.y);
      context.rotate(headNormal.angle);
      context.shadowColor = `rgba(${cyan},.72)`;
      context.shadowBlur = 18 + pulse * 18;
      context.fillStyle = `rgba(${ink},${dark ? 0.9 : 0.78})`;
      context.strokeStyle = `rgba(${copper},.94)`;
      context.lineWidth = 1.25;
      context.beginPath();
      context.moveTo(17 + pulse * 3, 0);
      context.lineTo(4, -9);
      context.lineTo(-9, -5.5);
      context.lineTo(-12, 0);
      context.lineTo(-9, 5.5);
      context.lineTo(4, 9);
      context.closePath();
      context.fill();
      context.stroke();
      context.fillStyle = `rgba(${cyan},.96)`;
      context.beginPath();
      context.arc(6, -3, 1.7, 0, TAU);
      context.arc(6, 3, 1.7, 0, TAU);
      context.fill();
      context.restore();
      context.restore();
    }

    function drawSymbols(now) {
      const dark = themeIsDark();
      context.save();
      context.globalCompositeOperation = dark ? "lighter" : "source-over";
      for (let index = 0; index < 6; index += 1) {
        const travel = (now * (0.000035 + index * 0.000004) + index / 6) % 1;
        const pointIndex = Math.min(points.length - 1, Math.floor(travel * points.length));
        const point = points[pointIndex];
        const normal = normalAt(pointIndex);
        const side = index % 2 ? -1 : 1;
        const lift = (16 + index * 2.6) * side;
        context.font = `${9 + index % 3}px "SFMono-Regular", Consolas, monospace`;
        context.fillStyle = index % 2 ? (dark ? "rgba(119,202,195,.58)" : "rgba(52,120,115,.48)") : (dark ? "rgba(229,160,133,.62)" : "rgba(147,82,66,.52)");
        context.fillText(SYMBOLS[(index + curveIndex * 2) % SYMBOLS.length], point.x + normal.x * lift, point.y + normal.y * lift);
      }
      context.restore();
    }

    function paint(now, staticFrame) {
      context.clearRect(0, 0, width, height);
      sampleCurve(now, staticFrame);
      drawGuideField(now);
      drawSpine(now);
      drawSymbols(now);
      if (!staticFrame && visible && !document.hidden && !reducedMotion.matches) frame = requestAnimationFrame(animate);
    }

    function animate(now) {
      frame = 0;
      paint(now, false);
    }

    function start() {
      if (frame || !visible || document.hidden || reducedMotion.matches) return;
      frame = requestAnimationFrame(animate);
    }

    function stop() {
      cancelAnimationFrame(frame);
      frame = 0;
    }

    function switchEquation() {
      curveIndex = (curveIndex + 1) % CURVES.length;
      pulse = 1;
      if (controls) {
        controls.classList.remove("is-generating");
        void controls.offsetWidth;
        controls.classList.add("is-generating");
      }
      clearTimeout(changeTimer);
      changeTimer = setTimeout(function () {
        if (formulaOutput) formulaOutput.textContent = CURVES[curveIndex].label;
        if (controls) controls.classList.remove("is-generating");
      }, 150);
      start();
    }

    scene.addEventListener("pointermove", function (event) {
      const box = layer.getBoundingClientRect();
      pointer.targetX = Math.max(width * 0.55, Math.min(width * 0.9, event.clientX - box.left));
      pointer.targetY = Math.max(height * 0.18, Math.min(height * 0.82, event.clientY - box.top));
      pointer.active = true;
    }, { passive: true });
    scene.addEventListener("pointerleave", function () { pointer.active = false; }, { passive: true });
    scene.addEventListener("pointerdown", function (event) {
      if (event.target.closest("button, a")) return;
      pulse = Math.max(pulse, 0.72);
      start();
    }, { passive: true });
    if (generateButton) generateButton.addEventListener("click", switchEquation);

    if ("ResizeObserver" in window) new ResizeObserver(resize).observe(layer);
    else addEventListener("resize", resize, { passive: true });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible) start();
        else stop();
      }, { rootMargin: "120px" }).observe(layer);
    }

    document.addEventListener("visibilitychange", function () { document.hidden ? stop() : start(); });
    document.addEventListener("cm:themechange", function () { paint(performance.now(), true); });
    const motionChange = function () {
      if (reducedMotion.matches) {
        stop();
        paint(performance.now(), true);
      } else start();
    };
    if (reducedMotion.addEventListener) reducedMotion.addEventListener("change", motionChange);
    else reducedMotion.addListener(motionChange);
    addEventListener("pagehide", function () {
      stop();
      clearTimeout(changeTimer);
    });

    resize();
    if (formulaOutput && variant === "landing") formulaOutput.textContent = CURVES[curveIndex].label;
    start();
  }

  function boot() {
    document.querySelectorAll("[data-sf-cyber-spine]").forEach(initializeCyberSpine);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
