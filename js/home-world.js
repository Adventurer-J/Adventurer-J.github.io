(() => {
  "use strict";

  const root = document.documentElement;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  const safeStore = {
    get(key) {
      try { return localStorage.getItem(key); } catch (error) { return null; }
    },
    set(key, value) {
      try { localStorage.setItem(key, value); } catch (error) {}
    }
  };

  function announce(message) {
    const toast = $("#toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(announce.timer);
    announce.timer = window.setTimeout(() => toast.classList.remove("is-visible"), 1800);
  }

  function setupTheme() {
    const button = $("#theme-toggle");
    const themeColor = $("meta[name='theme-color']");
    if (!button) return;

    const sync = () => {
      const dark = root.dataset.theme === "dark";
      button.setAttribute("aria-label", dark ? "切换到浅色" : "切换到深色");
      button.title = dark ? "切换到浅色" : "切换到深色";
      if (themeColor) themeColor.content = dark ? "#111311" : "#ece9e1";
    };

    button.addEventListener("click", () => {
      root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
      safeStore.set("open-frame-theme", root.dataset.theme);
      sync();
      announce(root.dataset.theme === "dark" ? "已切换到深色模式" : "已切换到浅色模式");
      window.dispatchEvent(new CustomEvent("frame-style-change"));
    });

    sync();
  }

  function setupPalette() {
    const buttons = $$('[data-palette-choice]');
    if (!buttons.length) return;

    const sync = () => {
      buttons.forEach((button) => {
        const active = button.dataset.paletteChoice === root.dataset.palette;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", String(active));
      });
    };

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        root.dataset.palette = button.dataset.paletteChoice;
        safeStore.set("open-frame-palette", root.dataset.palette);
        sync();
        announce(`配色已切换为 ${$("span", button)?.textContent || "新风格"}`);
        window.dispatchEvent(new CustomEvent("frame-style-change"));
      });
    });

    sync();
  }

  function setupMobileMenu() {
    const toggle = $("#menu-toggle");
    const menu = $("#mobile-nav");
    if (!toggle || !menu) return;

    const close = () => {
      toggle.setAttribute("aria-expanded", "false");
      menu.classList.remove("is-open");
    };

    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") !== "true";
      toggle.setAttribute("aria-expanded", String(open));
      menu.classList.toggle("is-open", open);
    });
    $$("a", menu).forEach((link) => link.addEventListener("click", close));
    window.addEventListener("resize", () => { if (window.innerWidth > 820) close(); }, { passive: true });
  }

  function setupReveal() {
    const elements = $$('[data-reveal]');
    if (!elements.length) return;
    if (reducedMotion.matches || !("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -7%", threshold: 0.08 });

    elements.forEach((element, index) => {
      element.style.transitionDelay = `${Math.min(index % 4, 3) * 55}ms`;
      observer.observe(element);
    });
  }

  function setupScrollState() {
    const progress = $("#page-progress-bar");
    const navLinks = $$(".desktop-nav a");
    const sections = navLinks.map((link) => document.querySelector(link.hash)).filter(Boolean);
    let ticking = false;

    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (progress) progress.style.transform = `scaleX(${ratio})`;

      let activeId = "";
      sections.forEach((section) => {
        if (section.getBoundingClientRect().top <= 180) activeId = section.id;
      });
      navLinks.forEach((link) => link.classList.toggle("is-active", link.hash === `#${activeId}`));
      ticking = false;
    };

    window.addEventListener("scroll", () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }, { passive: true });
    update();
  }

  function setupClock() {
    const target = $("#local-time");
    if (!target) return;
    const update = () => {
      target.textContent = new Intl.DateTimeFormat("zh-CN", {
        hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false
      }).format(new Date());
    };
    update();
    window.setInterval(update, 1000);
  }

  function setupCursor() {
    const halo = $("#cursor-halo");
    if (!halo || !finePointer.matches || reducedMotion.matches) return;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let currentX = x;
    let currentY = y;
    let frame = 0;

    window.addEventListener("pointermove", (event) => {
      x = event.clientX;
      y = event.clientY;
      if (!frame) frame = requestAnimationFrame(draw);
    }, { passive: true });

    function draw() {
      currentX += (x - currentX) * 0.16;
      currentY += (y - currentY) * 0.16;
      halo.style.transform = `translate3d(${currentX - 170}px, ${currentY - 170}px, 0)`;
      frame = 0;
      if (Math.abs(x - currentX) > .2 || Math.abs(y - currentY) > .2) frame = requestAnimationFrame(draw);
    }
  }

  function setupTilt() {
    if (!finePointer.matches || reducedMotion.matches) return;
    $$('[data-tilt]').forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width;
        const py = (event.clientY - rect.top) / rect.height;
        card.style.setProperty("--ry", `${(px - .5) * 4.8}deg`);
        card.style.setProperty("--rx", `${(.5 - py) * 4.8}deg`);
        card.style.setProperty("--spot-x", `${px * 100}%`);
        card.style.setProperty("--spot-y", `${py * 100}%`);
      }, { passive: true });
      card.addEventListener("pointerleave", () => {
        card.style.setProperty("--ry", "0deg");
        card.style.setProperty("--rx", "0deg");
        card.style.setProperty("--spot-x", "50%");
        card.style.setProperty("--spot-y", "50%");
      });
    });
  }

  function setupMagneticButtons() {
    if (!finePointer.matches || reducedMotion.matches) return;
    $$('.magnetic').forEach((button) => {
      button.addEventListener("pointermove", (event) => {
        const rect = button.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;
        button.style.transform = `translate(${x * .08}px, ${y * .12}px)`;
      });
      button.addEventListener("pointerleave", () => { button.style.transform = ""; });
    });
  }

  function setupCardPreviews() {
    const map = {
      profile: "个人名片：开场、简介、精选内容、联系方式",
      product: "产品故事：问题、方案、使用场景、行动入口",
      projects: "作品陈列：精选项目、角色、结果、下一步",
      journal: "故事记录：最新文章、主题索引、时间线、订阅"
    };
    $$('[data-preview]').forEach((button) => {
      button.addEventListener("click", () => announce(map[button.dataset.preview] || "模板结构已准备"));
    });
  }

  function setupQuotes() {
    const target = $("#closing-quote");
    const button = $("#quote-refresh");
    if (!target || !button) return;
    const quotes = [
      "“方向不必一次确定，页面可以边走边长。”",
      "“真正有用的设计，会把复杂留在幕后。”",
      "“不要展示所有东西，只展示最能代表你的东西。”",
      "“好奇心不是偏离路线，它本身就是路线。”",
      "“一个清楚的入口，胜过十个模糊的选择。”",
      "“先让人感到真实，再让人记住风格。”",
      "“持续更新的痕迹，比完美无缺的空白更动人。”",
      "“作品解释你做过什么，选择解释你是谁。”"
    ];
    let index = 0;
    button.addEventListener("click", () => {
      let next = index;
      while (next === index) next = Math.floor(Math.random() * quotes.length);
      index = next;
      target.animate([{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }], { duration: 420, easing: "cubic-bezier(.16,1,.3,1)" });
      target.textContent = quotes[index];
    });
  }

  function setupCommandPanel() {
    const dialog = $("#command-panel");
    const openButton = $("#command-open");
    const input = $("#command-input");
    const results = $("#command-results");
    if (!dialog || !openButton || !input || !results) return;
    const nativeDialog = typeof dialog.showModal === "function";
    const isOpen = () => nativeDialog ? dialog.open : dialog.hasAttribute("open");
    const closeDialog = () => {
      if (nativeDialog) dialog.close();
      else {
        dialog.removeAttribute("open");
        dialog.removeAttribute("aria-modal");
        document.body.style.overflow = "";
      }
    };
    const showDialog = () => {
      if (nativeDialog) dialog.showModal();
      else {
        dialog.setAttribute("open", "");
        dialog.setAttribute("aria-modal", "true");
        document.body.style.overflow = "hidden";
      }
    };

    const entries = [
      { key: "01", title: "回到开场", note: "首页与主张", href: "#top", terms: "首页 开场 hero top" },
      { key: "02", title: "选择模板", note: "四种表达方式", href: "#templates", terms: "模板 个人 产品 作品 故事" },
      { key: "03", title: "阅读页面原则", note: "清晰、探索、呼吸", href: "#principles", terms: "原则 设计 清晰 探索 留白" },
      { key: "04", title: "浏览内容模块", note: "六块自由组合", href: "#modules", terms: "模块 内容 组件 地图" },
      { key: "05", title: "打开风格实验室", note: "实时配色切换", href: "#studio", terms: "风格 配色 主题 颜色 studio" },
      { key: "06", title: "进入科幻故事", note: "想象与长内容", href: "/Sci-Fi/", terms: "科幻 故事 写作" },
      { key: "07", title: "浏览途中记录", note: "地点、片段与生活", href: "/Miles%20and%20Memories/", terms: "旅行 途中 地点 生活" },
      { key: "08", title: "查看源代码", note: "GitHub repository", href: "https://github.com/Adventurer-J/Adventurer-J.github.io", terms: "源码 github code" }
    ];
    let visible = entries;
    let selected = 0;

    const render = () => {
      results.replaceChildren();
      if (!visible.length) {
        const empty = document.createElement("p");
        empty.className = "command-item";
        empty.textContent = "没有匹配入口，换一个关键词试试。";
        results.append(empty);
        return;
      }
      visible.forEach((entry, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `command-item${index === selected ? " is-selected" : ""}`;
        button.setAttribute("role", "option");
        button.setAttribute("aria-selected", String(index === selected));
        button.innerHTML = `<b>${entry.key}</b><span><strong>${entry.title}</strong><small>${entry.note}</small></span><span>↗</span>`;
        button.addEventListener("click", () => go(entry));
        results.append(button);
      });
    };

    const go = (entry) => {
      closeDialog();
      if (/^https?:/.test(entry.href)) window.open(entry.href, "_blank", "noopener");
      else window.location.href = entry.href;
    };

    const open = () => {
      visible = entries;
      selected = 0;
      input.value = "";
      render();
      showDialog();
      requestAnimationFrame(() => input.focus());
    };

    openButton.addEventListener("click", open);
    dialog.addEventListener("click", (event) => { if (event.target === dialog) closeDialog(); });
    $("form", dialog)?.addEventListener("submit", (event) => {
      if (!nativeDialog) event.preventDefault();
      closeDialog();
    });
    input.addEventListener("input", () => {
      const query = input.value.trim().toLowerCase();
      visible = entries.filter((entry) => `${entry.title} ${entry.note} ${entry.terms}`.toLowerCase().includes(query));
      selected = 0;
      render();
    });
    input.addEventListener("keydown", (event) => {
      if (!visible.length) return;
      if (event.key === "ArrowDown") { event.preventDefault(); selected = (selected + 1) % visible.length; render(); }
      if (event.key === "ArrowUp") { event.preventDefault(); selected = (selected - 1 + visible.length) % visible.length; render(); }
      if (event.key === "Enter") { event.preventDefault(); go(visible[selected]); }
    });
    window.addEventListener("keydown", (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        isOpen() ? closeDialog() : open();
      }
      if (event.key === "/" && !isOpen() && !/input|textarea/i.test(document.activeElement?.tagName || "")) {
        event.preventDefault();
        open();
      }
    });
  }

  function setupCanvas() {
    const canvas = $("#world-surface");
    const hero = $(".hero");
    if (!canvas || !hero || reducedMotion.matches) return;
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    const pointer = { x: .78, y: .38, targetX: .78, targetY: .38, active: false };
    const nodes = Array.from({ length: 28 }, (_, index) => ({
      x: .48 + Math.random() * .55,
      y: .08 + Math.random() * .82,
      radius: 1.1 + Math.random() * 2.4,
      phase: index * .73 + Math.random() * 4
    }));
    let width = 0;
    let height = 0;
    let dpr = 1;
    let frame = 0;
    let visible = true;
    let style = readStyle();

    function readStyle() {
      const css = getComputedStyle(root);
      return {
        accent: css.getPropertyValue("--accent").trim() || "#c16f42",
        ink: css.getPropertyValue("--ink").trim() || "#161714",
        line: css.getPropertyValue("--line").trim() || "rgba(22,23,20,.14)"
      };
    }

    function hexToRgba(color, alpha) {
      if (!color.startsWith("#")) return color;
      const hex = color.slice(1);
      const full = hex.length === 3 ? hex.split("").map((char) => char + char).join("") : hex;
      const number = Number.parseInt(full, 16);
      return `rgba(${(number >> 16) & 255}, ${(number >> 8) & 255}, ${number & 255}, ${alpha})`;
    }

    function resize() {
      const rect = hero.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function field(x, row, time) {
      const dx = x / width - pointer.x;
      const falloff = Math.exp(-(dx * dx) * 18);
      const base = Math.sin(x * .008 + time * .0005 + row * .63) * 15;
      const micro = Math.sin(x * .021 - time * .00022 + row) * 5;
      const pull = falloff * Math.sin(pointer.y * Math.PI * 2 + row * .44) * 46;
      return base + micro + pull;
    }

    function draw(time) {
      if (!visible) { frame = 0; return; }
      pointer.x += (pointer.targetX - pointer.x) * .035;
      pointer.y += (pointer.targetY - pointer.y) * .035;
      context.clearRect(0, 0, width, height);

      const startX = width * .38;
      const endX = width * 1.04;
      const top = height * .12;
      const bottom = height * .9;
      const rows = width < 760 ? 10 : 16;

      for (let row = 0; row < rows; row += 1) {
        const ratio = row / Math.max(rows - 1, 1);
        const baseY = top + (bottom - top) * ratio;
        context.beginPath();
        for (let x = startX; x <= endX; x += 13) {
          const taper = Math.sin(Math.min(1, Math.max(0, (x - startX) / (endX - startX))) * Math.PI);
          const y = baseY + field(x, row, time) * taper;
          if (x === startX) context.moveTo(x, y); else context.lineTo(x, y);
        }
        context.strokeStyle = row % 4 === 0 ? hexToRgba(style.accent, .38) : style.line;
        context.lineWidth = row % 4 === 0 ? 1.15 : .7;
        context.stroke();
      }

      const gradient = context.createRadialGradient(pointer.x * width, pointer.y * height, 0, pointer.x * width, pointer.y * height, width * .2);
      gradient.addColorStop(0, hexToRgba(style.accent, .14));
      gradient.addColorStop(1, hexToRgba(style.accent, 0));
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);

      nodes.forEach((node) => {
        const x = node.x * width + Math.cos(time * .00018 + node.phase) * 10;
        const y = node.y * height + Math.sin(time * .00023 + node.phase) * 8;
        const dx = x / width - pointer.x;
        const dy = y / height - pointer.y;
        const glow = Math.max(0, 1 - Math.hypot(dx, dy) * 3.2);
        context.beginPath();
        context.arc(x, y, node.radius + glow * 2.4, 0, Math.PI * 2);
        context.fillStyle = hexToRgba(style.accent, .2 + glow * .55);
        context.fill();
      });

      frame = requestAnimationFrame(draw);
    }

    hero.addEventListener("pointermove", (event) => {
      const rect = hero.getBoundingClientRect();
      pointer.targetX = (event.clientX - rect.left) / rect.width;
      pointer.targetY = (event.clientY - rect.top) / rect.height;
      pointer.active = true;
    }, { passive: true });
    hero.addEventListener("pointerleave", () => {
      pointer.targetX = .78;
      pointer.targetY = .38;
      pointer.active = false;
    });
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("frame-style-change", () => { style = readStyle(); });
    document.addEventListener("visibilitychange", () => {
      visible = !document.hidden;
      if (visible && !frame) frame = requestAnimationFrame(draw);
    });

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting && !document.hidden;
        if (visible && !frame) frame = requestAnimationFrame(draw);
      });
      observer.observe(hero);
    }

    resize();
    frame = requestAnimationFrame(draw);
  }

  setupTheme();
  setupPalette();
  setupMobileMenu();
  setupReveal();
  setupScrollState();
  setupClock();
  setupCursor();
  setupTilt();
  setupMagneticButtons();
  setupCardPreviews();
  setupQuotes();
  setupCommandPanel();
  setupCanvas();
})();
