(function () {
  "use strict";

  function initializeGravityWell() {
    const canvas = document.getElementById("sf-black-hole");
    const stage = canvas && canvas.closest(".sf-gravity-stage");
    if (!canvas || !stage) return;

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    const coarsePointer = matchMedia("(pointer: coarse)");
    const pointer = { x: 0.5, y: 0.5, active: false };
    const center = { x: 0, y: 0, baseX: 0, baseY: 0 };
    let width = 0;
    let height = 0;
    let ratio = 1;
    let particles = [];
    let frame = 0;
    let visible = true;
    let pulse = 0;
    let lastTime = 0;

    function isDark() {
      return document.documentElement.dataset.cmTheme === "dark";
    }

    function createParticle(index, fresh) {
      const angle = Math.random() * Math.PI * 2;
      const outer = Math.min(width, height) * (0.43 + Math.random() * 0.2);
      const radius = fresh ? outer : Math.min(width, height) * (0.54 + Math.random() * 0.12);
      const orbitScale = 0.72 + Math.random() * 0.18;
      const speed = 0.48 + Math.random() * 0.78;
      return {
        x: center.x + Math.cos(angle) * radius,
        y: center.y + Math.sin(angle) * radius * orbitScale,
        px: center.x + Math.cos(angle) * radius,
        py: center.y + Math.sin(angle) * radius * orbitScale,
        vx: -Math.sin(angle) * speed,
        vy: Math.cos(angle) * speed * orbitScale,
        size: 0.55 + Math.random() * 1.55,
        alpha: 0.28 + Math.random() * 0.62,
        warm: index % 4 !== 0,
        phase: Math.random() * Math.PI * 2
      };
    }

    function resetParticle(particle, index) {
      Object.assign(particle, createParticle(index, false));
    }

    function resize() {
      const box = stage.getBoundingClientRect();
      ratio = Math.min(devicePixelRatio || 1, 1.6);
      width = Math.max(1, Math.round(box.width));
      height = Math.max(1, Math.round(box.height));
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      center.baseX = width * 0.5;
      center.baseY = height * 0.47;
      center.x = center.baseX;
      center.y = center.baseY;
      const count = width < 520 ? 92 : Math.min(190, Math.round(width * 0.31));
      particles = Array.from({ length: count }, (_, index) => createParticle(index, true));
      paint(performance.now(), true);
    }

    function drawAccretionDisk(time, foreground) {
      const dark = isDark();
      const copper = dark ? "232,166,137" : "215,143,112";
      const diskRadius = Math.min(width, height) * 0.29;
      context.save();
      context.translate(center.x, center.y);
      context.rotate(-0.17 + Math.sin(time * 0.00018) * 0.018);
      context.scale(1, 0.27);
      context.globalCompositeOperation = "screen";
      for (let index = 0; index < 7; index += 1) {
        const radius = diskRadius * (0.62 + index * 0.085);
        const gradient = context.createLinearGradient(-radius, 0, radius, 0);
        gradient.addColorStop(0, `rgba(${copper},0)`);
        gradient.addColorStop(0.28, `rgba(${copper},${foreground ? 0.1 : 0.2})`);
        gradient.addColorStop(0.52, `rgba(255,223,190,${foreground ? 0.28 : 0.48})`);
        gradient.addColorStop(0.76, `rgba(${copper},${foreground ? 0.08 : 0.18})`);
        gradient.addColorStop(1, `rgba(${copper},0)`);
        context.strokeStyle = gradient;
        context.lineWidth = foreground ? 2.2 : 1.25;
        context.beginPath();
        if (foreground) context.ellipse(0, 0, radius, radius, 0, 0, Math.PI);
        else context.ellipse(0, 0, radius, radius, 0, Math.PI, Math.PI * 2);
        context.stroke();
      }
      context.restore();
    }

    function drawEventHorizon(time) {
      const horizon = Math.min(width, height) * 0.105;
      const lens = context.createRadialGradient(center.x, center.y, horizon * 0.48, center.x, center.y, horizon * 1.55);
      lens.addColorStop(0, "rgba(0,0,0,1)");
      lens.addColorStop(0.62, "rgba(0,0,0,1)");
      lens.addColorStop(0.76, isDark() ? "rgba(236,170,140,.42)" : "rgba(218,145,111,.38)");
      lens.addColorStop(0.86, "rgba(255,224,190,.1)");
      lens.addColorStop(1, "rgba(0,0,0,0)");
      context.fillStyle = lens;
      context.beginPath();
      context.arc(center.x, center.y, horizon * 1.58, 0, Math.PI * 2);
      context.fill();

      const shadow = context.createRadialGradient(center.x - horizon * 0.22, center.y - horizon * 0.18, 0, center.x, center.y, horizon);
      shadow.addColorStop(0, "#000");
      shadow.addColorStop(0.76, "#010202");
      shadow.addColorStop(1, "rgba(0,0,0,.96)");
      context.fillStyle = shadow;
      context.beginPath();
      context.arc(center.x, center.y, horizon, 0, Math.PI * 2);
      context.fill();

      context.strokeStyle = isDark() ? "rgba(236,170,140,.44)" : "rgba(218,145,111,.4)";
      context.lineWidth = 0.8 + pulse * 2.4;
      context.beginPath();
      context.arc(center.x, center.y, horizon * (1.12 + pulse * 0.22 + Math.sin(time * 0.0016) * 0.012), 0, Math.PI * 2);
      context.stroke();
    }

    function paint(now, staticFrame) {
      const delta = Math.min(2, Math.max(0.4, (now - (lastTime || now - 16.7)) / 16.7));
      lastTime = now;
      context.clearRect(0, 0, width, height);

      const maxShiftX = width * 0.055;
      const maxShiftY = height * 0.045;
      const targetX = center.baseX + (pointer.active ? (pointer.x - 0.5) * maxShiftX * 2 : 0);
      const targetY = center.baseY + (pointer.active ? (pointer.y - 0.5) * maxShiftY * 2 : 0);
      center.x += (targetX - center.x) * (staticFrame ? 1 : 0.045);
      center.y += (targetY - center.y) * (staticFrame ? 1 : 0.045);
      pulse *= staticFrame ? 0 : 0.946;

      drawAccretionDisk(now, false);

      const horizon = Math.min(width, height) * 0.11;
      const resetRadius = Math.max(width, height) * 0.77;
      particles.forEach((particle, index) => {
        particle.px = particle.x;
        particle.py = particle.y;
        const dx = center.x - particle.x;
        const dy = center.y - particle.y;
        const distance = Math.max(1, Math.hypot(dx, dy));

        if (!staticFrame && !reducedMotion.matches) {
          const gravity = (920 + pulse * 2700) / (distance * distance + 1300);
          const swirl = (0.004 + pulse * 0.009) * Math.max(0.18, 1 - distance / resetRadius);
          particle.vx += (dx / distance * gravity - dy / distance * swirl) * delta;
          particle.vy += (dy / distance * gravity + dx / distance * swirl) * delta;
          particle.vx *= 0.998;
          particle.vy *= 0.998;
          const velocity = Math.hypot(particle.vx, particle.vy);
          const cap = 3.8 + pulse * 2.8;
          if (velocity > cap) {
            particle.vx = particle.vx / velocity * cap;
            particle.vy = particle.vy / velocity * cap;
          }
          particle.x += particle.vx * delta;
          particle.y += particle.vy * delta;
        }

        if (distance < horizon || distance > resetRadius || particle.x < -80 || particle.x > width + 80 || particle.y < -80 || particle.y > height + 80) {
          resetParticle(particle, index);
          return;
        }

        const depth = Math.max(0.16, Math.min(1, (distance - horizon) / (resetRadius - horizon)));
        const shimmer = 0.74 + Math.sin(now * 0.002 + particle.phase) * 0.26;
        const color = particle.warm ? "226,165,137" : "226,232,221";
        context.strokeStyle = `rgba(${color},${particle.alpha * shimmer * (1.12 - depth)})`;
        context.lineWidth = particle.size * (1.25 - depth * 0.45);
        context.beginPath();
        context.moveTo(particle.px, particle.py);
        context.lineTo(particle.x, particle.y);
        context.stroke();
        context.fillStyle = `rgba(${color},${particle.alpha * 0.8})`;
        context.beginPath();
        context.arc(particle.x, particle.y, Math.max(0.45, particle.size * 0.58), 0, Math.PI * 2);
        context.fill();
      });

      drawEventHorizon(now);
      drawAccretionDisk(now, true);

      if (!staticFrame && visible && !document.hidden && !reducedMotion.matches) {
        frame = requestAnimationFrame(animate);
      }
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

    function triggerPulse() {
      pulse = 1;
      stage.classList.remove("is-pulsing");
      void stage.offsetWidth;
      stage.classList.add("is-pulsing");
      window.setTimeout(function () { stage.classList.remove("is-pulsing"); }, 520);
      start();
    }

    stage.addEventListener("pointermove", function (event) {
      if (coarsePointer.matches) return;
      const box = stage.getBoundingClientRect();
      pointer.x = Math.max(0, Math.min(1, (event.clientX - box.left) / box.width));
      pointer.y = Math.max(0, Math.min(1, (event.clientY - box.top) / box.height));
      pointer.active = true;
    }, { passive: true });
    stage.addEventListener("pointerleave", function () { pointer.active = false; }, { passive: true });
    stage.addEventListener("pointerdown", triggerPulse, { passive: true });

    const pulseButton = stage.querySelector("[data-sf-pulse]");
    if (pulseButton) pulseButton.addEventListener("click", function (event) {
      event.stopPropagation();
      triggerPulse();
    });

    if ("ResizeObserver" in window) new ResizeObserver(resize).observe(stage);
    else addEventListener("resize", resize, { passive: true });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible) start();
        else stop();
      }, { rootMargin: "120px" }).observe(stage);
    }

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop();
      else start();
    });
    document.addEventListener("cm:themechange", function () { paint(performance.now(), true); });

    const onMotionChange = function () {
      if (reducedMotion.matches) {
        stop();
        paint(performance.now(), true);
      } else start();
    };
    if (reducedMotion.addEventListener) reducedMotion.addEventListener("change", onMotionChange);
    else reducedMotion.addListener(onMotionChange);

    addEventListener("pagehide", stop);
    resize();
    start();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initializeGravityWell, { once: true });
  else initializeGravityWell();
})();
