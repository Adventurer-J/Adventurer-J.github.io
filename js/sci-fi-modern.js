(function () {
  "use strict";

  function initializeCyberSpine() {
    const canvas = document.getElementById("sf-cyber-spine");
    const stage = canvas && canvas.closest(".sf-spine-stage");
    if (!canvas || !stage) return;

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    const formulaOutput = stage.querySelector("[data-sf-formula]");
    const generateButton = stage.querySelector("[data-sf-generate]");
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    const coarsePointer = matchMedia("(pointer: coarse)");
    const pointer = { x: 0, y: 0, active: false };
    const head = { x: 0, y: 0, vx: 0, vy: 0 };
    const symbols = ["∇", "∫", "Σ", "λ", "ψ", "∞", "∂", "Ω", "φ", "Δ", "π", "i"];
    const formulas = [
      "∫Ω e^(−iωt) · ∇ψ dx",
      "∂t q + v · ∇q = 0",
      "Σ(k=0→n) aₖ zᵏ = Ψ(z)",
      "det(I + ∇u) = ρ(x)",
      "Δφ + λe^φ = 0",
      "e^(iπ) + 1 = 0",
      "∇ × F = ∂t B",
      "lim(n→∞) Π(1 + z/n) = e^z",
      "⟨ψ | H | ψ⟩ = E",
      "∮Γ A · dx = 2πi Σ Res"
    ];

    let width = 0;
    let height = 0;
    let ratio = 1;
    let nodes = [];
    let motes = [];
    let packets = [];
    let frame = 0;
    let visible = true;
    let energy = 0;
    let time = 0;
    let lastFormula = -1;
    let changeTimer = 0;

    function isDark() {
      return document.documentElement.dataset.cmTheme === "dark";
    }

    function seedNodes() {
      const count = width < 520 ? 34 : 48;
      nodes = Array.from({ length: count }, (_, index) => ({
        x: width * (0.18 + index / count * 0.64),
        y: height * (0.52 + Math.sin(index * 0.26) * 0.09),
        px: 0,
        py: 0,
        phase: Math.random() * Math.PI * 2
      }));
      head.x = nodes[0].x;
      head.y = nodes[0].y;
      head.vx = 0;
      head.vy = 0;
      packets = Array.from({ length: 5 }, (_, index) => ({
        offset: index / 5,
        speed: 0.0015 + index * 0.00013,
        symbol: symbols[(index * 3) % symbols.length]
      }));
    }

    function createMote(x, y, intense) {
      return {
        x,
        y,
        vx: (Math.random() - 0.5) * (intense ? 1.7 : 0.55),
        vy: (Math.random() - 0.5) * (intense ? 1.7 : 0.55),
        life: 1,
        decay: 0.008 + Math.random() * 0.014,
        size: 0.55 + Math.random() * 1.25,
        symbol: Math.random() > 0.72 ? symbols[Math.floor(Math.random() * symbols.length)] : ""
      };
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
      pointer.x = width * 0.38;
      pointer.y = height * 0.52;
      seedNodes();
      paint(performance.now(), true);
    }

    function updateSpine(now, staticFrame) {
      time = now * 0.001;
      const automaticX = width * (0.5 + Math.cos(time * 0.48) * 0.23);
      const automaticY = height * (0.52 + Math.sin(time * 0.72) * 0.17);
      const targetX = pointer.active ? pointer.x : automaticX;
      const targetY = pointer.active ? pointer.y : automaticY;

      if (staticFrame || reducedMotion.matches) {
        head.x = targetX;
        head.y = targetY;
      } else {
        head.vx += (targetX - head.x) * (0.0028 + energy * 0.0022);
        head.vy += (targetY - head.y) * (0.0028 + energy * 0.0022);
        head.vx *= 0.92;
        head.vy *= 0.92;
        const speed = Math.hypot(head.vx, head.vy);
        const cap = 4.2 + energy * 3.2;
        if (speed > cap) {
          head.vx = head.vx / speed * cap;
          head.vy = head.vy / speed * cap;
        }
        head.x += head.vx;
        head.y += head.vy;
      }

      nodes[0].px = nodes[0].x;
      nodes[0].py = nodes[0].y;
      nodes[0].x += (head.x - nodes[0].x) * (staticFrame ? 1 : 0.34);
      nodes[0].y += (head.y - nodes[0].y) * (staticFrame ? 1 : 0.34);

      const spacing = Math.max(7.4, Math.min(width, height) * 0.019);
      for (let index = 1; index < nodes.length; index += 1) {
        const node = nodes[index];
        const previous = nodes[index - 1];
        node.px = node.x;
        node.py = node.y;
        let dx = node.x - previous.x;
        let dy = node.y - previous.y;
        const distance = Math.max(0.001, Math.hypot(dx, dy));
        dx /= distance;
        dy /= distance;
        const wave = Math.sin(time * 2.3 - index * 0.43 + node.phase) * (0.65 + index / nodes.length * 1.3);
        node.x = previous.x + dx * spacing - dy * wave * 0.13;
        node.y = previous.y + dy * spacing + dx * wave * 0.13;
      }

      if (!staticFrame && Math.random() < 0.32 + energy * 0.45) {
        const source = nodes[Math.floor(Math.random() * nodes.length)];
        motes.push(createMote(source.x, source.y, energy > 0.5));
      }
      if (motes.length > 150) motes.splice(0, motes.length - 150);
      energy *= staticFrame ? 0 : 0.95;
    }

    function drawSpine() {
      const copper = isDark() ? "231,164,139" : "221,151,123";
      const cyan = isDark() ? "125,203,196" : "104,190,183";

      context.save();
      context.globalCompositeOperation = "lighter";
      context.lineCap = "round";
      context.lineJoin = "round";

      context.shadowColor = `rgba(${cyan},${0.28 + energy * 0.28})`;
      context.shadowBlur = 18 + energy * 22;
      context.strokeStyle = `rgba(${cyan},${0.26 + energy * 0.2})`;
      context.lineWidth = 2.2;
      context.beginPath();
      nodes.forEach((node, index) => index ? context.lineTo(node.x, node.y) : context.moveTo(node.x, node.y));
      context.stroke();

      nodes.forEach((node, index) => {
        const next = nodes[Math.min(nodes.length - 1, index + 1)];
        const dx = next.x - node.x;
        const dy = next.y - node.y;
        const distance = Math.max(1, Math.hypot(dx, dy));
        const nx = -dy / distance;
        const ny = dx / distance;
        const taper = 1 - index / nodes.length * 0.72;
        const rib = (6 + Math.sin(index * 0.72 + time * 1.8) * 1.8) * taper + 2;
        const active = index % 4 === 0;

        context.shadowBlur = active ? 16 : 6;
        context.strokeStyle = active ? `rgba(${copper},${0.64 + energy * 0.18})` : `rgba(${cyan},0.34)`;
        context.lineWidth = active ? 1.15 : 0.72;
        context.beginPath();
        context.moveTo(node.x - nx * rib, node.y - ny * rib);
        context.lineTo(node.x + nx * rib, node.y + ny * rib);
        context.stroke();

        context.fillStyle = active ? `rgba(${copper},0.92)` : `rgba(${cyan},0.74)`;
        context.beginPath();
        context.arc(node.x, node.y, active ? 2.2 + energy * 0.7 : 1.25, 0, Math.PI * 2);
        context.fill();

        if (active) {
          context.strokeStyle = `rgba(${copper},0.24)`;
          context.beginPath();
          context.arc(node.x, node.y, 5.3 + Math.sin(time * 2 + index) * 0.8, 0, Math.PI * 2);
          context.stroke();
        }
      });

      const first = nodes[0];
      const second = nodes[1] || first;
      const angle = Math.atan2(first.y - second.y, first.x - second.x);
      context.save();
      context.translate(first.x, first.y);
      context.rotate(angle);
      context.shadowColor = `rgba(${cyan},0.8)`;
      context.shadowBlur = 20 + energy * 20;
      context.fillStyle = `rgba(${cyan},0.9)`;
      context.beginPath();
      context.moveTo(12 + energy * 3, 0);
      context.lineTo(-2, -7);
      context.lineTo(-7, 0);
      context.lineTo(-2, 7);
      context.closePath();
      context.fill();
      context.strokeStyle = `rgba(${copper},0.9)`;
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(3, -4);
      context.lineTo(9, -10 - energy * 4);
      context.moveTo(3, 4);
      context.lineTo(9, 10 + energy * 4);
      context.stroke();
      context.restore();
      context.restore();
    }

    function drawPackets(now) {
      context.save();
      context.globalCompositeOperation = "lighter";
      packets.forEach((packet, index) => {
        const travel = (packet.offset + now * packet.speed) % 1;
        const nodeIndex = Math.min(nodes.length - 1, Math.floor(travel * nodes.length));
        const node = nodes[nodeIndex];
        const lift = index % 2 ? -17 : 17;
        context.font = `${10 + (index % 2) * 2}px "SFMono-Regular", Consolas, monospace`;
        context.fillStyle = index % 2 ? "rgba(128,206,199,.7)" : "rgba(230,162,135,.72)";
        context.shadowColor = context.fillStyle;
        context.shadowBlur = 10;
        context.fillText(packet.symbol, node.x + 5, node.y + lift);
      });
      context.restore();
    }

    function drawMotes() {
      context.save();
      context.globalCompositeOperation = "lighter";
      motes = motes.filter((mote) => {
        mote.x += mote.vx;
        mote.y += mote.vy;
        mote.vx *= 0.985;
        mote.vy *= 0.985;
        mote.life -= mote.decay;
        if (mote.life <= 0) return false;
        const color = mote.symbol ? "123,201,194" : "228,159,132";
        context.fillStyle = `rgba(${color},${mote.life * 0.52})`;
        if (mote.symbol) {
          context.font = `${8 + mote.size * 2}px "SFMono-Regular", Consolas, monospace`;
          context.fillText(mote.symbol, mote.x, mote.y);
        } else {
          context.beginPath();
          context.arc(mote.x, mote.y, mote.size, 0, Math.PI * 2);
          context.fill();
        }
        return true;
      });
      context.restore();
    }

    function paint(now, staticFrame) {
      context.clearRect(0, 0, width, height);
      updateSpine(now, staticFrame);
      drawMotes();
      drawSpine();
      drawPackets(now);
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

    function generateFormula() {
      let next = Math.floor(Math.random() * formulas.length);
      if (next === lastFormula) next = (next + 1) % formulas.length;
      lastFormula = next;
      energy = 1;
      stage.classList.remove("is-generating");
      void stage.offsetWidth;
      stage.classList.add("is-generating");
      clearTimeout(changeTimer);
      changeTimer = window.setTimeout(() => {
        if (formulaOutput) formulaOutput.textContent = formulas[next];
        packets.forEach((packet, index) => { packet.symbol = symbols[(next + index * 2) % symbols.length]; });
        for (let index = 0; index < 34; index += 1) motes.push(createMote(nodes[0].x, nodes[0].y, true));
        stage.classList.remove("is-generating");
      }, 180);
      start();
    }

    stage.addEventListener("pointermove", (event) => {
      if (coarsePointer.matches) return;
      const box = stage.getBoundingClientRect();
      pointer.x = Math.max(0, Math.min(width, event.clientX - box.left));
      pointer.y = Math.max(0, Math.min(height, event.clientY - box.top));
      pointer.active = true;
    }, { passive: true });
    stage.addEventListener("pointerleave", () => { pointer.active = false; }, { passive: true });
    stage.addEventListener("pointerdown", (event) => {
      if (event.target.closest("button")) return;
      energy = Math.max(energy, 0.72);
      start();
    }, { passive: true });

    if (generateButton) generateButton.addEventListener("click", generateFormula);

    if ("ResizeObserver" in window) new ResizeObserver(resize).observe(stage);
    else addEventListener("resize", resize, { passive: true });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver((entries) => {
        visible = entries[0].isIntersecting;
        if (visible) start();
        else stop();
      }, { rootMargin: "120px" }).observe(stage);
    }

    document.addEventListener("visibilitychange", () => document.hidden ? stop() : start());
    document.addEventListener("cm:themechange", () => paint(performance.now(), true));

    const onMotionChange = () => {
      if (reducedMotion.matches) {
        stop();
        paint(performance.now(), true);
      } else start();
    };
    if (reducedMotion.addEventListener) reducedMotion.addEventListener("change", onMotionChange);
    else reducedMotion.addListener(onMotionChange);

    addEventListener("pagehide", () => {
      stop();
      clearTimeout(changeTimer);
    });

    resize();
    start();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initializeCyberSpine, { once: true });
  else initializeCyberSpine();
})();
