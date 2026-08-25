(function () {
  "use strict";

  function initializeSurface() {
    const canvas = document.getElementById("world-surface");
    const host = canvas && canvas.closest(".world-hero");
    if (!canvas || !host) return;

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    const coarsePointer = matchMedia("(pointer: coarse)");
    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0, active: false };
    let width = 0;
    let height = 0;
    let ratio = 1;
    let frame = 0;
    let visible = true;
    let lastPaint = 0;

    function isDark() {
      return document.documentElement.dataset.cmTheme === "dark";
    }

    function resize() {
      const box = host.getBoundingClientRect();
      ratio = Math.min(devicePixelRatio || 1, 1.6);
      width = Math.max(1, Math.round(box.width));
      height = Math.max(1, Math.round(box.height));
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      draw(performance.now(), true);
    }

    function surfaceHeight(u, v, time) {
      const peak = 0.72 * Math.exp(-2.8 * ((u - 0.18) ** 2 + (v + 0.08) ** 2));
      const basin = -0.28 * Math.exp(-5.2 * ((u + 0.63) ** 2 + (v - 0.46) ** 2));
      const saddle = 0.13 * (u * u - 0.72 * v * v);
      const wave = 0.055 * Math.sin(4.1 * u + time * 0.42) * Math.cos(3.4 * v - time * 0.28);
      return peak + basin + saddle + wave - 0.25;
    }

    function project(u, v, time) {
      const mobile = width < 760;
      const z = surfaceHeight(u, v, time);
      const yaw = -0.28 + pointer.x * 0.16;
      const pitch = 1.02 + pointer.y * 0.12;
      const cosYaw = Math.cos(yaw);
      const sinYaw = Math.sin(yaw);
      const cosPitch = Math.cos(pitch);
      const sinPitch = Math.sin(pitch);

      const x1 = u * cosYaw - v * sinYaw;
      const y1 = u * sinYaw + v * cosYaw;
      const y2 = y1 * cosPitch - z * sinPitch;
      const depth = y1 * sinPitch + z * cosPitch;
      const perspective = 1 / Math.max(0.58, 1 + depth * 0.18);
      const scale = mobile
        ? Math.min(width * 0.58, height * 0.39)
        : Math.min(width * 0.34, height * 0.48);
      const centerX = mobile ? width * 0.6 : width * 0.72;
      const centerY = mobile ? height * 0.68 : height * 0.52;

      return {
        x: centerX + x1 * scale * perspective,
        y: centerY + y2 * scale * perspective,
        depth: depth,
        z: z
      };
    }

    function drawPolyline(points, color, lineWidth) {
      if (points.length < 2) return;
      context.beginPath();
      context.moveTo(points[0].x, points[0].y);
      for (let index = 1; index < points.length; index += 1) {
        context.lineTo(points[index].x, points[index].y);
      }
      context.strokeStyle = color;
      context.lineWidth = lineWidth;
      context.stroke();
    }

    function draw(now, staticFrame) {
      const time = now * 0.001;
      context.clearRect(0, 0, width, height);

      pointer.x += (pointer.targetX - pointer.x) * 0.045;
      pointer.y += (pointer.targetY - pointer.y) * 0.045;

      const dark = isDark();
      const copper = dark ? "226,145,91" : "166,88,49";
      const ink = dark ? "232,233,226" : "24,25,22";
      const cols = width < 700 ? 19 : 29;
      const rows = width < 700 ? 15 : 23;
      const samples = 48;

      const glowCenter = project(0.18, -0.08, time);
      const glow = context.createRadialGradient(
        glowCenter.x,
        glowCenter.y,
        0,
        glowCenter.x,
        glowCenter.y,
        Math.min(width, height) * 0.23
      );
      glow.addColorStop(0, `rgba(${copper},${dark ? 0.18 : 0.15})`);
      glow.addColorStop(0.48, `rgba(${copper},${dark ? 0.06 : 0.05})`);
      glow.addColorStop(1, `rgba(${copper},0)`);
      context.fillStyle = glow;
      context.beginPath();
      context.arc(glowCenter.x, glowCenter.y, Math.min(width, height) * 0.23, 0, Math.PI * 2);
      context.fill();

      for (let row = 0; row < rows; row += 1) {
        const v = -1 + (2 * row) / (rows - 1);
        const points = [];
        for (let sample = 0; sample < samples; sample += 1) {
          const u = -1.22 + (2.44 * sample) / (samples - 1);
          points.push(project(u, v, time));
        }
        const emphasis = row % 4 === 0;
        drawPolyline(
          points,
          `rgba(${emphasis ? copper : ink},${emphasis ? (dark ? 0.38 : 0.31) : (dark ? 0.17 : 0.13)})`,
          emphasis ? 1.05 : 0.62
        );
      }

      for (let column = 0; column < cols; column += 1) {
        const u = -1.22 + (2.44 * column) / (cols - 1);
        const points = [];
        for (let sample = 0; sample < samples; sample += 1) {
          const v = -1 + (2 * sample) / (samples - 1);
          points.push(project(u, v, time));
        }
        const emphasis = column % 5 === 0;
        drawPolyline(
          points,
          `rgba(${emphasis ? copper : ink},${emphasis ? (dark ? 0.34 : 0.28) : (dark ? 0.15 : 0.11)})`,
          emphasis ? 1 : 0.58
        );
      }

      const pulseU = -1.12 + ((time * 0.12) % 2.22);
      const pulse = project(pulseU, -0.08, time);
      const pulseGlow = context.createRadialGradient(pulse.x, pulse.y, 0, pulse.x, pulse.y, 18);
      pulseGlow.addColorStop(0, dark ? "rgba(216,241,91,.92)" : "rgba(118,134,20,.9)");
      pulseGlow.addColorStop(0.22, dark ? "rgba(216,241,91,.42)" : "rgba(141,155,31,.38)");
      pulseGlow.addColorStop(1, "rgba(216,241,91,0)");
      context.fillStyle = pulseGlow;
      context.beginPath();
      context.arc(pulse.x, pulse.y, 18, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = dark ? "#d8f15b" : "#6f791d";
      context.beginPath();
      context.arc(pulse.x, pulse.y, 2.6, 0, Math.PI * 2);
      context.fill();

      const peak = project(0.18, -0.08, time);
      context.strokeStyle = `rgba(${copper},${dark ? 0.52 : 0.44})`;
      context.setLineDash([3, 5]);
      context.beginPath();
      context.moveTo(peak.x, peak.y);
      context.lineTo(peak.x, peak.y - Math.min(100, height * 0.12));
      context.stroke();
      context.setLineDash([]);
      context.fillStyle = dark ? "rgba(238,238,232,.8)" : "rgba(23,24,22,.72)";
      context.font = `600 9px ${getComputedStyle(document.documentElement).getPropertyValue("--world-mono") || "monospace"}`;
      context.fillText("SURFACE / PEAK", peak.x + 8, peak.y - Math.min(100, height * 0.12) + 3);

      if (!staticFrame && visible && !document.hidden && !reducedMotion.matches) {
        frame = requestAnimationFrame(animate);
      }
    }

    function animate(now) {
      frame = 0;
      if (now - lastPaint < 28) {
        frame = requestAnimationFrame(animate);
        return;
      }
      lastPaint = now;
      draw(now, false);
    }

    function start() {
      if (frame || !visible || document.hidden || reducedMotion.matches) return;
      frame = requestAnimationFrame(animate);
    }

    function stop() {
      cancelAnimationFrame(frame);
      frame = 0;
    }

    function updatePointer(event) {
      if (coarsePointer.matches || reducedMotion.matches) return;
      const box = host.getBoundingClientRect();
      pointer.targetX = Math.max(-1, Math.min(1, ((event.clientX - box.left) / box.width - 0.5) * 2));
      pointer.targetY = Math.max(-1, Math.min(1, ((event.clientY - box.top) / box.height - 0.5) * 2));
      pointer.active = true;
    }

    host.addEventListener("pointermove", updatePointer, { passive: true });
    host.addEventListener("pointerleave", function () {
      pointer.targetX = 0;
      pointer.targetY = 0;
      pointer.active = false;
    }, { passive: true });

    if ("ResizeObserver" in window) new ResizeObserver(resize).observe(host);
    else addEventListener("resize", resize, { passive: true });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible) start();
        else stop();
      }, { rootMargin: "120px" }).observe(host);
    }

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop();
      else start();
    });
    document.addEventListener("cm:themechange", function () { draw(performance.now(), true); });

    const onMotionChange = function () {
      if (reducedMotion.matches) {
        stop();
        draw(performance.now(), true);
      } else {
        start();
      }
    };
    if (reducedMotion.addEventListener) reducedMotion.addEventListener("change", onMotionChange);
    else reducedMotion.addListener(onMotionChange);

    addEventListener("pagehide", stop);
    addEventListener("pageshow", function (event) {
      if (event.persisted) {
        resize();
        start();
      }
    });

    resize();
    start();
  }

  function initializeProjectTilt() {
    if (matchMedia("(pointer: coarse)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    document.querySelectorAll("[data-world-tilt]").forEach(function (card) {
      let scheduled = 0;
      let point = null;

      function update() {
        scheduled = 0;
        if (!point) return;
        const box = card.getBoundingClientRect();
        const x = Math.max(0, Math.min(box.width, point.clientX - box.left));
        const y = Math.max(0, Math.min(box.height, point.clientY - box.top));
        card.style.setProperty("--pointer-x", x + "px");
        card.style.setProperty("--pointer-y", y + "px");
        card.style.setProperty("--tilt-y", ((x / box.width - 0.5) * 2.6).toFixed(2) + "deg");
        card.style.setProperty("--tilt-x", ((0.5 - y / box.height) * 2.2).toFixed(2) + "deg");
      }

      card.addEventListener("pointermove", function (event) {
        point = event;
        if (!scheduled) scheduled = requestAnimationFrame(update);
      }, { passive: true });
      card.addEventListener("pointerleave", function () {
        point = null;
        cancelAnimationFrame(scheduled);
        scheduled = 0;
        card.style.setProperty("--tilt-x", "0deg");
        card.style.setProperty("--tilt-y", "0deg");
      }, { passive: true });
    });
  }

  function initialize() {
    initializeSurface();
    initializeProjectTilt();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true });
  else initialize();
})();
