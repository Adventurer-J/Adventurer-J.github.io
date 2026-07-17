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


  function initializeTerminalProgress() {
    if (document.querySelector(".cm-terminal-progress")) return;
    const terminal = document.createElement("div");
    terminal.className = "cm-terminal-progress";
    terminal.setAttribute("role", "progressbar");
    terminal.setAttribute("aria-label", "页面滚动进度");
    terminal.setAttribute("aria-valuemin", "0");
    terminal.setAttribute("aria-valuemax", "100");
    terminal.innerHTML = '<span class="cm-terminal-readout"></span><span class="cm-terminal-cursor" aria-hidden="true">_</span>';
    document.body.prepend(terminal);
    const readout = terminal.querySelector(".cm-terminal-readout");
    let scheduled = false;

    function update() {
      const max = Math.max(0, document.documentElement.scrollHeight - innerHeight);
      const progress = max ? Math.min(100, Math.max(0, Math.floor(scrollY / max * 100))) : 100;
      const cells = 16;
      const filled = Math.round(progress / 100 * cells);
      const gauge = "█".repeat(filled) + "░".repeat(cells - filled);
      const complete = progress >= 100;
      readout.textContent = `[${gauge}] ${String(progress).padStart(3, " ")}% | ${complete ? "TASK COMPLETED" : "COMPUTING..."}`;
      terminal.setAttribute("aria-valuenow", String(progress));
      terminal.classList.toggle("is-complete", complete);
      if (complete && terminal.dataset.completed !== "true") {
        terminal.dataset.completed = "true";
        terminal.classList.remove("cm-terminal-flash");
        void terminal.offsetWidth;
        terminal.classList.add("cm-terminal-flash");
      } else if (!complete) {
        terminal.dataset.completed = "false";
        terminal.classList.remove("cm-terminal-flash");
      }
      scheduled = false;
    }
    function requestUpdate() {
      if (!scheduled) { scheduled = true; requestAnimationFrame(update); }
    }
    addEventListener("scroll", requestUpdate, {passive: true});
    addEventListener("resize", requestUpdate, {passive: true});
    if ("ResizeObserver" in window) new ResizeObserver(requestUpdate).observe(document.body);
    update();
  }

  function initializeSymbolField() {
    if (document.querySelector(".cm-symbol-field")) return;
    const canvas = document.createElement("canvas");
    canvas.className = "cm-symbol-field";
    canvas.setAttribute("aria-hidden", "true");
    document.body.prepend(canvas);
    const ctx = canvas.getContext("2d");
    const glyphs = ["∫", "∇", "Σ", "∂", "∞", "0", "1", "λ", "Δ", "∏"];
    const pointer = {x: -999, y: -999, active: false};
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0, height = 0, particles = [], frame = 0;

    function createParticle(randomY = true) {
      return {
        glyph: glyphs[Math.floor(Math.random() * glyphs.length)],
        x: Math.random() * width,
        y: randomY ? Math.random() * height : height + 30,
        vx: (Math.random() - .5) * .025,
        vy: -(Math.random() * .055 + .025),
        size: Math.random() * 11 + 8,
        alpha: Math.random() * .09 + .025,
        gray: Math.floor(Math.random() * 130 + 80),
        phase: Math.random() * Math.PI * 2
      };
    }

    function resize() {
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      width = innerWidth; height = innerHeight;
      canvas.width = width * dpr; canvas.height = height * dpr;
      canvas.style.width = `${width}px`; canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = width < 680 ? 18 : Math.min(42, Math.round(width / 34));
      particles = Array.from({length: count}, () => createParticle(true));
      if (reduced) draw(true);
    }

    function draw(staticFrame = false) {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        if (!staticFrame) {
          if (pointer.active) {
            const dx = p.x - pointer.x, dy = p.y - pointer.y;
            const distance = Math.max(20, Math.hypot(dx, dy));
            if (distance < 150) {
              const force = (1 - distance / 150) * .006;
              p.vx += dx / distance * force;
              p.vy += dy / distance * force;
            }
          }
          p.vx *= .985;
          p.vy += (-.045 - p.vy) * .0025;
          p.x += p.vx;
          p.y += p.vy;
          if (p.y < -30) Object.assign(p, createParticle(false));
          if (p.x < -30) p.x = width + 30;
          if (p.x > width + 30) p.x = -30;
        }
        const shimmer = staticFrame ? .65 : .62 + Math.sin(performance.now() * .00025 + p.phase) * .18;
        ctx.font = `${p.size}px "Fira Code", "SFMono-Regular", Consolas, monospace`;
        ctx.fillStyle = `rgba(${p.gray},${p.gray},${p.gray},${Math.min(.15, p.alpha * shimmer)})`;
        ctx.fillText(p.glyph, p.x, p.y);
      });
      if (!staticFrame) frame = requestAnimationFrame(draw);
    }

    addEventListener("pointermove", (event) => {
      pointer.x = event.clientX; pointer.y = event.clientY; pointer.active = true;
    }, {passive: true});
    document.documentElement.addEventListener("pointerleave", () => { pointer.active = false; }, {passive: true});
    addEventListener("resize", resize, {passive: true});
    resize();
    if (!reduced) draw();
    document.addEventListener("visibilitychange", () => {
      cancelAnimationFrame(frame);
      if (!document.hidden && !reduced) draw();
    });
  }

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
      list.innerHTML = '<span>INDEX STATUS</span><h2>内容索引正在建立</h2><p>暂无内容。</p><a href="/research/">打开研究地图 →</a>';
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
      const isThreeBody = target.matches(".cm-home-hero, .cm-hero");
      let points = [], width = 0, height = 0, frame = 0, time = 0;
      const pointer = {x: 0, y: 0, active: false};
      let stateLabel = null;

      if (isThreeBody) {
        target.classList.add("cm-threebody-field");
        const label = document.createElement("div");
        label.className = "cm-threebody-label";
        label.innerHTML = "<span></span> THREE-BODY / 三体 <b>乱纪元</b>";
        stateLabel = label.querySelector("b");
        target.appendChild(label);
        if (target.matches(".cm-home-hero")) {
          const signal = document.createElement("div");
          signal.className = "cm-redcoast-signal";
          signal.innerHTML = '<span>红岸监听</span><i></i><i></i><i></i><i></i><i></i><strong>不要回答</strong>';
          target.appendChild(signal);
        }
      }

      function resize() {
        const dpr = Math.min(devicePixelRatio || 1, 1.5);
        width = target.clientWidth; height = target.clientHeight;
        canvas.width = width * dpr; canvas.height = height * dpr;
        canvas.style.width = `${width}px`; canvas.style.height = `${height}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const count = width < 700 ? 24 : Math.min(64, Math.round(width / 20));
        points = Array.from({length: count}, () => { const x=Math.random()*width,y=Math.random()*height; return {x,y,px:x,py:y,vx:(Math.random()-.5)*.2,vy:(Math.random()-.5)*.2,r:Math.random()*1.25+.35,z:Math.random()*.75+.25,phase:Math.random()*Math.PI*2}; });
      }

      function bodies(t) {
        const cx = width * .73, cy = height * .39, rx = Math.min(width * .18, 230), ry = Math.min(height * .24, 150);
        return [
          {x:cx + Math.cos(t*.47)*rx, y:cy + Math.sin(t*.61)*ry, r:5.2, color:"255,199,92"},
          {x:cx + Math.cos(t*.39+2.1)*rx*.72, y:cy + Math.sin(t*.53+2.1)*ry*.85, r:3.8, color:"255,116,82"},
          {x:cx + Math.cos(t*.59+4.2)*rx*.48, y:cy + Math.sin(t*.43+4.2)*ry*.62, r:3.2, color:"116,226,216"}
        ];
      }

      function draw() {
        ctx.clearRect(0, 0, width, height);
        time += .008;
        const dark = document.documentElement.dataset.cmTheme === "dark";
        const suns = isThreeBody ? bodies(time) : [];
        if (isThreeBody && stateLabel) {
          const distances = [Math.hypot(suns[0].x-suns[1].x,suns[0].y-suns[1].y), Math.hypot(suns[1].x-suns[2].x,suns[1].y-suns[2].y), Math.hypot(suns[2].x-suns[0].x,suns[2].y-suns[0].y)];
          stateLabel.textContent = Math.max(...distances) < Math.min(width,height)*.19 ? "三日凌空" : Math.sin(time*.7) > .15 ? "恒纪元" : "乱纪元";
        }
        if (isThreeBody) {
          suns.forEach((sun, index) => {
            ctx.strokeStyle = `rgba(${sun.color},.1)`;
            ctx.beginPath();
            ctx.ellipse(width*.73, height*.39, Math.min(width*.18,230)*(1-index*.2), Math.min(height*.24,150)*(1-index*.12), index*.55, 0, Math.PI*2);
            ctx.stroke();
            const glow = ctx.createRadialGradient(sun.x,sun.y,0,sun.x,sun.y,sun.r*6);
            glow.addColorStop(0,`rgba(${sun.color},.95)`); glow.addColorStop(.2,`rgba(${sun.color},.5)`); glow.addColorStop(1,`rgba(${sun.color},0)`);
            ctx.fillStyle=glow; ctx.beginPath(); ctx.arc(sun.x,sun.y,sun.r*6,0,Math.PI*2); ctx.fill();
          });
        }
        ctx.globalCompositeOperation = dark ? "screen" : "source-over";
        points.forEach((p, i) => {
          p.px=p.x; p.py=p.y;
          if (pointer.active) {
            const dx=p.x-pointer.x, dy=p.y-pointer.y, d=Math.max(18,Math.hypot(dx,dy));
            if (d<190) { const force=(1-d/190)*.04*p.z; p.vx+=dx/d*force-dy/d*force*.72; p.vy+=dy/d*force+dx/d*force*.72; }
          }
          suns.forEach(sun => {
            const dx=sun.x-p.x, dy=sun.y-p.y, d=Math.max(35,Math.hypot(dx,dy));
            if(d<240){ const force=(1-d/240)*.0028; p.vx+=dx/d*force; p.vy+=dy/d*force; }
          });
          p.vx*=.992; p.vy*=.992; p.x+=p.vx*p.z; p.y+=p.vy*p.z;
          if(p.x<0){p.x=0;p.vx=Math.abs(p.vx)} if(p.x>width){p.x=width;p.vx=-Math.abs(p.vx)}
          if(p.y<0){p.y=0;p.vy=Math.abs(p.vy)} if(p.y>height){p.y=height;p.vy=-Math.abs(p.vy)}
          const pulse=.58+Math.sin(time*2+p.phase)*.2;
          ctx.strokeStyle=dark?`rgba(112,235,224,${pulse*p.z*.38})`:`rgba(8,111,112,${pulse*p.z*.28})`;
          ctx.lineWidth=Math.max(.35,p.z*.9); ctx.beginPath(); ctx.moveTo(p.px,p.py); ctx.lineTo(p.x-(p.vx*9*p.z),p.y-(p.vy*9*p.z)); ctx.stroke();
          ctx.fillStyle=dark?`rgba(137,246,231,${.42+p.z*.42})`:`rgba(8,111,112,${.3+p.z*.34})`;
          ctx.beginPath(); ctx.arc(p.x,p.y,p.r*p.z,0,Math.PI*2); ctx.fill();
          for(let j=i+1;j<points.length;j++){
            const q=points[j], d=Math.hypot(p.x-q.x,p.y-q.y);
            if(d<78 && p.z>.55 && q.z>.55){ctx.strokeStyle=dark?`rgba(89,222,207,${.09*(1-d/78)})`:`rgba(8,111,112,${.065*(1-d/78)})`;ctx.lineWidth=.5;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke();}
          }
          if(pointer.active){
            const d=Math.hypot(p.x-pointer.x,p.y-pointer.y);
            if(d<145){ctx.strokeStyle=`rgba(255,199,92,${.22*(1-d/145)})`;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(pointer.x,pointer.y);ctx.stroke();}
          }
        });
        ctx.globalCompositeOperation = "source-over";
        if(pointer.active){const glow=ctx.createRadialGradient(pointer.x,pointer.y,0,pointer.x,pointer.y,105);glow.addColorStop(0,"rgba(255,199,92,.12)");glow.addColorStop(1,"rgba(255,199,92,0)");ctx.fillStyle=glow;ctx.beginPath();ctx.arc(pointer.x,pointer.y,90,0,Math.PI*2);ctx.fill();}
        frame=requestAnimationFrame(draw);
      }

      function locate(event) { const box=target.getBoundingClientRect(); pointer.x=event.clientX-box.left; pointer.y=event.clientY-box.top; pointer.active=true; }
      target.addEventListener("pointermove", locate, {passive:true});
      target.addEventListener("pointerleave", () => { pointer.active=false; }, {passive:true});
      resize(); draw();
      if ("ResizeObserver" in window) new ResizeObserver(resize).observe(target);
      else addEventListener("resize", resize, {passive:true});
      document.addEventListener("visibilitychange", () => { cancelAnimationFrame(frame); if(!document.hidden) draw(); });
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
    initializeTerminalProgress();
    initializeSymbolField();
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
