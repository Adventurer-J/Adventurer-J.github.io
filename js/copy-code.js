/* Site runtime: code copy, nested navigation, theme, and research filters. */
(function () {
  "use strict";

  const navMap = {
    "数值方法": [
      ["分类总览", "离散、逼近与误差控制", "/research/#discretization"],
      ["逼近与表示", "插值、投影、基函数", "/research/#approximation"],
      ["自适应计算", "网格、阶次与后验估计", "/research/#adaptivity"]
    ],
    "微分方程": [
      ["方程地图", "从模型结构选择方法", "/research/#equations"],
      ["演化问题", "时间积分与稳定性", "/research/#time"],
      ["反问题与随机模型", "正则化、不确定性量化", "/research/#inverse"]
    ],
    "算法": [
      ["求解器", "线性、非线性与特征值", "/research/#solvers"],
      ["优化算法", "约束、无约束与变分结构", "/research/#optimization"],
      ["验证与基准", "误差、收敛率与性能", "/research/#verification"]
    ],
    "操作系统": [
      ["科研工作流", "环境、实验与归档", "/research/#workflow"],
      ["高性能计算", "并行、加速与剖析", "/research/#hpc"],
      ["可复现检查表", "从配置到结果追溯", "/research/#reproducibility"]
    ]
  };

  function initializeCodeCopy() {
    document.querySelectorAll("figure.highlight").forEach((codeBlock) => {
      if (codeBlock.querySelector(".copy-button")) return;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "copy-button";
      button.textContent = "复制代码";
      button.addEventListener("click", async () => {
        try {
          const code = codeBlock.querySelector("code");
          if (!code) throw new Error("No code element");
          await navigator.clipboard.writeText(code.innerText);
          button.textContent = "已复制";
        } catch (error) {
          button.textContent = "复制失败";
        } finally {
          window.setTimeout(() => { button.textContent = "复制代码"; }, 1200);
        }
      });
      codeBlock.appendChild(button);
    });
  }

  function initializeNestedNavigation() {
    const menu = document.querySelector(".nav-menu");
    if (!menu || menu.dataset.cmEnhanced === "true") return;
    menu.dataset.cmEnhanced = "true";

    Array.from(menu.children).forEach((anchor) => {
      if (!anchor.classList || !anchor.classList.contains("nav-menu-item")) return;
      const label = anchor.textContent.trim();
      const items = navMap[label];
      if (!items) return;

      const group = document.createElement("div");
      group.className = "cm-nav-group";
      group.dataset.open = "false";
      menu.insertBefore(group, anchor);
      group.appendChild(anchor);

      const toggle = document.createElement("button");
      toggle.className = "cm-nav-caret";
      toggle.type = "button";
      toggle.setAttribute("aria-label", `展开${label}子菜单`);
      toggle.setAttribute("aria-expanded", "false");

      const submenu = document.createElement("div");
      submenu.className = "cm-submenu";
      submenu.setAttribute("aria-label", `${label}分类`);
      items.forEach(([title, note, href]) => {
        const link = document.createElement("a");
        link.className = "cm-submenu-link";
        link.href = href;
        const titleElement = document.createElement("span");
        titleElement.className = "cm-submenu-title";
        titleElement.textContent = title;
        const noteElement = document.createElement("span");
        noteElement.className = "cm-submenu-note";
        noteElement.textContent = note;
        link.append(titleElement, noteElement);
        submenu.appendChild(link);
      });

      toggle.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        const next = group.dataset.open !== "true";
        menu.querySelectorAll(".cm-nav-group[data-open='true']").forEach((openGroup) => {
          if (openGroup !== group) {
            openGroup.dataset.open = "false";
            const openButton = openGroup.querySelector(".cm-nav-caret");
            if (openButton) openButton.setAttribute("aria-expanded", "false");
          }
        });
        group.dataset.open = String(next);
        toggle.setAttribute("aria-expanded", String(next));
      });
      group.append(toggle, submenu);
    });

    const currentPath = decodeURIComponent(window.location.pathname).replace(/\/$/, "") || "/";
    menu.querySelectorAll(".nav-menu-item").forEach((link) => {
      const linkPath = decodeURIComponent(new URL(link.href, window.location.origin).pathname).replace(/\/$/, "") || "/";
      if (currentPath === linkPath) link.setAttribute("aria-current", "page");
    });

    document.addEventListener("click", (event) => {
      if (event.target.closest(".cm-nav-group")) return;
      menu.querySelectorAll(".cm-nav-group[data-open='true']").forEach((group) => {
        group.dataset.open = "false";
        const button = group.querySelector(".cm-nav-caret");
        if (button) button.setAttribute("aria-expanded", "false");
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      menu.querySelectorAll(".cm-nav-group[data-open='true']").forEach((group) => {
        group.dataset.open = "false";
        const button = group.querySelector(".cm-nav-caret");
        if (button) button.setAttribute("aria-expanded", "false");
      });
    });
  }

  function initializeTheme() {
    const navRight = document.querySelector(".nav-right");
    if (!navRight || document.querySelector(".cm-theme-toggle")) return;
    const saved = localStorage.getItem("cm-theme");
    const preferredDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = saved || (preferredDark ? "dark" : "light");
    document.documentElement.dataset.cmTheme = initial;

    const button = document.createElement("button");
    button.className = "cm-theme-toggle";
    button.type = "button";

    function render(theme) {
      const dark = theme === "dark";
      button.textContent = dark ? "☀" : "◐";
      button.setAttribute("aria-label", dark ? "切换到浅色模式" : "切换到深色模式");
      button.title = dark ? "浅色模式" : "深色模式";
    }

    render(initial);
    button.addEventListener("click", () => {
      const next = document.documentElement.dataset.cmTheme === "dark" ? "light" : "dark";
      document.documentElement.dataset.cmTheme = next;
      localStorage.setItem("cm-theme", next);
      render(next);
    });
    navRight.appendChild(button);
  }

  function initializeSearchInterface() {
    const trigger = document.querySelector("#search-btn");
    const input = document.querySelector("#search-input");
    if (trigger) { trigger.classList.add("cm-search-trigger"); trigger.setAttribute("aria-label", "搜索文章"); }
    if (input) { input.placeholder = "搜索标题、标签或正文…"; input.setAttribute("autocomplete", "off"); }
  }

  function initializeResearchFilters() {
    const controls = document.querySelector("[data-cm-controls]");
    if (!controls) return;
    const buttons = Array.from(controls.querySelectorAll("[data-cm-filter]"));
    const cards = Array.from(document.querySelectorAll("[data-cm-track]"));
    const empty = document.querySelector(".cm-empty");
    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const filter = button.dataset.cmFilter;
        buttons.forEach((candidate) => candidate.setAttribute("aria-pressed", String(candidate === button)));
        let visible = 0;
        cards.forEach((card) => {
          const tracks = (card.dataset.cmTrack || "").split(/\s+/);
          const show = filter === "all" || tracks.includes(filter);
          card.hidden = !show;
          if (show) visible += 1;
        });
        if (empty) empty.dataset.visible = String(visible === 0);
      });
    });
  }

  const categoryMap = {
    "Numerical-method": [["逼近与表示", "插值、投影与基函数", "/research/#approximation"], ["离散化", "有限差分、有限元与谱方法", "/research/#discretization"], ["自适应计算", "网格、阶次与后验估计", "/research/#adaptivity"], ["验证", "误差、收敛率与基准", "/research/#verification"]],
    "Differential equation": [["方程结构", "椭圆、抛物与双曲问题", "/research/#equations"], ["时间演化", "时间积分与稳定性", "/research/#time"], ["反问题与随机模型", "正则化与不确定性量化", "/research/#inverse"], ["建模工作流", "从问题到可信结果", "/research/#workflow"]],
    "Algorithm": [["线性与非线性求解", "迭代法、预条件与特征值", "/research/#solvers"], ["优化", "约束、无约束与变分结构", "/research/#optimization"], ["高性能计算", "并行、加速与性能剖析", "/research/#hpc"], ["验证与基准", "精度、鲁棒性与效率", "/research/#verification"]],
    "Software-system": [["科研工作流", "环境、实验与归档", "/research/#workflow"], ["高性能计算", "并行计算与硬件加速", "/research/#hpc"], ["可复现性", "从配置到结果追溯", "/research/#reproducibility"], ["研究地图", "浏览完整计算数学路线", "/research/"]],
    "Sci-Fi": [["文明与时间", "在长时间尺度上理解选择", "/Sci-Fi/"], ["科技与未知", "以想象力检验技术边界", "/Sci-Fi/"], ["宇宙尺度", "从更大的坐标系观察人类", "/Sci-Fi/"]],
    "Miles and Memories": [["行路记录", "城市、山野与途中见闻", "/Miles%20and%20Memories/"], ["观察与摄影", "保存值得回看的瞬间", "/Miles%20and%20Memories/"], ["阅读与随笔", "研究之外的思考切片", "/Miles%20and%20Memories/"]]
  };

  function initializeCategoryPage() {
    const key = decodeURIComponent(location.pathname).split("/").filter(Boolean)[0];
    const items = categoryMap[key];
    const wall = document.querySelector(".wall-category");
    if (!items || !wall || wall.querySelector(".cm-category-grid")) return;
    wall.classList.add("cm-category-shell");
    const main = wall.querySelector(".wall-main") || wall;
    const kicker = document.createElement("p");
    kicker.className = "cm-category-kicker";
    kicker.textContent = ["Sci-Fi", "Miles and Memories"].includes(key) ? "COLLECTION / 内容索引" : "INDEX / 主题索引";
    main.prepend(kicker);
    const grid = document.createElement("div");
    grid.className = "cm-category-grid";
    items.forEach(([title, note, href], index) => {
      const card = document.createElement("a");
      card.className = "cm-category-card cm-reveal";
      card.href = href;
      card.innerHTML = `<span>${String(index + 1).padStart(2, "0")}</span><strong></strong><small></small><i aria-hidden="true">↗</i>`;
      card.querySelector("strong").textContent = title;
      card.querySelector("small").textContent = note;
      grid.appendChild(card);
    });
    main.appendChild(grid);
    const canvas = document.querySelector("#tagCanvas, .wall-category-tags");
    if (canvas) canvas.hidden = true;
    document.querySelectorAll(".post-list").forEach((list) => {
      if (!/DEBUG:|没有文章/.test(list.textContent)) return;
      list.classList.add("cm-empty-state");
      list.innerHTML = '<span>INDEX STATUS</span><h2>内容索引正在建立</h2><p>文章与记录将显示在这里。</p><a href="/research/">打开研究地图 →</a>';
    });
  }

  function initializeParticles() {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const targets = document.querySelectorAll(".cm-home-hero, .cm-hero, .wall-category, .post-content__head");
    targets.forEach((target) => {
      if (target.querySelector(":scope > .cm-particle-canvas")) return;
      const canvas = document.createElement("canvas");
      canvas.className = "cm-particle-canvas";
      canvas.setAttribute("aria-hidden", "true");
      target.prepend(canvas);
      const ctx = canvas.getContext("2d");
      let points = [], width = 0, height = 0, frame;
      function resize() {
        const dpr = Math.min(devicePixelRatio || 1, 1.5);
        width = target.clientWidth; height = target.clientHeight;
        canvas.width = width * dpr; canvas.height = height * dpr;
        canvas.style.width = `${width}px`; canvas.style.height = `${height}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const count = width < 700 ? 20 : Math.min(58, Math.round(width / 22));
        points = Array.from({length: count}, () => ({x: Math.random()*width, y: Math.random()*height, vx:(Math.random()-.5)*.22, vy:(Math.random()-.5)*.22, r:Math.random()*1.3+.45}));
      }
      function draw() {
        ctx.clearRect(0, 0, width, height);
        const dark = document.documentElement.dataset.cmTheme === "dark";
        ctx.fillStyle = dark ? "rgba(89,222,207,.7)" : "rgba(8,111,112,.52)";
        points.forEach((p, i) => {
          p.x += p.vx; p.y += p.vy;
          if (p.x < 0 || p.x > width) p.vx *= -1;
          if (p.y < 0 || p.y > height) p.vy *= -1;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fill();
          for (let j=i+1; j<points.length; j++) {
            const q=points[j], dx=p.x-q.x, dy=p.y-q.y, d=Math.hypot(dx,dy);
            if (d < 112) { ctx.strokeStyle = dark ? `rgba(89,222,207,${.13*(1-d/112)})` : `rgba(8,111,112,${.1*(1-d/112)})`; ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(q.x,q.y); ctx.stroke(); }
          }
        });
        frame = requestAnimationFrame(draw);
      }
      resize(); draw();
      if ("ResizeObserver" in window) new ResizeObserver(resize).observe(target);
      else addEventListener("resize", resize, {passive:true});
      document.addEventListener("visibilitychange", () => { cancelAnimationFrame(frame); if (!document.hidden) draw(); });
    });
  }

  function initializeMotion() {
    const selectors = ".cm-home-research-card, .cm-card, .cm-category-card, .post-item, .cm-home-section-card";
    document.querySelectorAll(selectors).forEach((card) => card.addEventListener("pointermove", (event) => {
      const box = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${event.clientX - box.left}px`);
      card.style.setProperty("--my", `${event.clientY - box.top}px`);
    }));
    const nodes = document.querySelectorAll(".cm-reveal, .cm-home-section, .cm-home-workflow, .post-item");
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) { nodes.forEach(n => n.classList.add("is-visible")); return; }
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); } }), {threshold: .08});
    nodes.forEach(node => { node.classList.add("cm-reveal"); observer.observe(node); });
  }

  function initializeBackToTop() {
    if (document.querySelector(".cm-back-top")) return;
    const button = document.createElement("button");
    button.className = "cm-back-top"; button.type = "button"; button.setAttribute("aria-label", "返回顶部"); button.textContent = "↑";
    button.addEventListener("click", () => scrollTo({top:0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"}));
    document.body.appendChild(button);
    const update = () => button.classList.toggle("is-visible", scrollY > 620);
    addEventListener("scroll", update, {passive:true}); update();
  }

  function initializeReadingProgress() {
    if (!document.querySelector(".post-content")) return;
    const bar = document.createElement("div"); bar.className = "cm-reading-progress"; document.body.appendChild(bar);
    const update = () => { const max = document.documentElement.scrollHeight - innerHeight; bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`; };
    addEventListener("scroll", update, {passive:true}); update();
  }

  function initialize() {
    document.documentElement.classList.add(`cm-page-${document.querySelector(".cm-home") ? "home" : document.querySelector(".cm-hub") ? "research" : document.querySelector(".post-content") ? "article" : document.querySelector(".wall-category") ? "category" : "default"}`);
    initializeSearchInterface();
    initializeCodeCopy();
    initializeNestedNavigation();
    initializeTheme();
    initializeResearchFilters();
    initializeCategoryPage();
    initializeParticles();
    initializeMotion();
    initializeReadingProgress();
    initializeBackToTop();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();
