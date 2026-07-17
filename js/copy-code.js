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
    if (document.documentElement.classList.contains("cm-deep-space-active") || document.querySelector(".cm-symbol-field")) return;
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


  function initializeSubpageCleanup() {
    document.querySelectorAll(".realated__body, .related__body").forEach((body) => {
      if (/DEBUG:|请安装插件/.test(body.textContent)) {
        const section = body.closest(".related-post");
        if (section) section.remove();
      }
    });
    document.querySelectorAll(".post-list").forEach((list) => {
      if (/DEBUG:|没有文章/.test(list.textContent) && !list.classList.contains("cm-empty-state")) {
        list.classList.add("cm-empty-state");
        list.innerHTML = '<span>INDEX STATUS</span><h2>暂无内容</h2>';
      }
    });
    const articleBody = document.querySelector(".post-content__body");
    if (articleBody && !articleBody.textContent.trim() && !articleBody.querySelector("img, video, iframe, canvas, figure")) {
      articleBody.hidden = true;
      document.documentElement.classList.add("cm-article-empty");
    }
    const tagShell = document.querySelector(".wall-category-tags");
    const tagOuter = document.querySelector("#tags-outer");
    if (tagOuter) { tagOuter.hidden = true; tagOuter.replaceChildren(); }
    if (tagShell) tagShell.hidden = true;
    const articleFoot = document.querySelector(".post__foot");
    if (articleFoot && !articleFoot.textContent.trim() && !articleFoot.querySelector("a[href], button, img")) articleFoot.hidden = true;
  }

  function initializeGlassSurfaces() {
    const selectors = [
      ".cm-hero", ".cm-quote", ".cm-analysis-equation", ".cm-controls",
      ".cm-card", ".cm-panel", ".wall-category", ".cm-category-card",
      ".post-content__head", ".post-content__body", ".post__foot", "#gitalk-container"
    ];
    document.querySelectorAll(selectors.join(",")).forEach((surface) => surface.classList.add("cm-glass"));
  }

  function initializeParallax() {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || innerWidth < 760) return;
    const layers = [
      [document.querySelector(".cm-hero"), .032],
      [document.querySelector(".wall-category .wall-main"), .045],
      [document.querySelector(".post-content__head"), .036],
      [document.querySelector(".cm-analysis-equation"), .022]
    ].filter(([element]) => element);
    if (!layers.length) return;
    layers.forEach(([element]) => element.classList.add("cm-parallax-target"));
    let scheduled = false;
    function update() {
      layers.forEach(([element, speed]) => {
        const rect = element.getBoundingClientRect();
        const distance = innerHeight * .5 - (rect.top + rect.height * .5);
        const offset = Math.max(-22, Math.min(22, distance * speed));
        element.style.setProperty("--cm-parallax-y", `${offset.toFixed(2)}px`);
      });
      scheduled = false;
    }
    function requestUpdate() {
      if (!scheduled) { scheduled = true; requestAnimationFrame(update); }
    }
    addEventListener("scroll", requestUpdate, {passive: true});
    addEventListener("resize", requestUpdate, {passive: true});
    update();
  }

  function initializeLoadingExperience() {
    if (document.querySelector(".cm-loader")) return;
    const loader = document.createElement("div");
    loader.className = "cm-loader";
    loader.setAttribute("role", "status");
    loader.setAttribute("aria-live", "polite");
    loader.innerHTML = '<span class="cm-loader-orbit" aria-hidden="true"><i></i><i></i><i></i></span><span><b>LOADING</b><small>resolving page</small></span>';
    document.body.appendChild(loader);
    let finished = false;
    const showTimer = window.setTimeout(() => {
      if (!finished) loader.classList.add("is-active");
    }, 140);
    const hide = () => {
      finished = true;
      clearTimeout(showTimer);
      loader.classList.remove("is-active");
    };
    if (document.readyState === "complete") hide();
    else addEventListener("load", hide, {once: true});
    document.addEventListener("click", (event) => {
      const link = event.target.closest("a[href]");
      if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || link.target === "_blank" || link.hasAttribute("download")) return;
      const next = new URL(link.href, location.href);
      if (next.origin !== location.origin || (next.pathname === location.pathname && next.hash)) return;
      loader.classList.add("is-active");
      loader.querySelector("small").textContent = "opening route";
    });
    addEventListener("pageshow", () => loader.classList.remove("is-active"));
  }


  function initializeSciFiDeepSpace() {
    const key = decodeURIComponent(location.pathname).split("/").filter(Boolean)[0];
    const wall = document.querySelector(".wall-category");
    if (key !== "Sci-Fi" || !wall || wall.querySelector(".cm-deep-space-canvas")) return;
    document.documentElement.classList.add("cm-deep-space-active");
    const canvas = document.createElement("canvas");
    canvas.className = "cm-deep-space-canvas";
    canvas.setAttribute("aria-hidden", "true");
    wall.prepend(canvas);
    const ctx = canvas.getContext("2d");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pointer = {x: .5, y: .5, tx: .5, ty: .5};
    const colors = ["185,215,255", "222,232,255", "255,244,225", "255,205,168"];
    let width = 0, height = 0, stars = [], meteor = null, frame = 0, visible = true, time = 0;

    function makeStar() {
      const depth = Math.random();
      return {x:Math.random(), y:Math.random(), depth, size:.24+depth*1.18, alpha:.14+Math.random()*.5, phase:Math.random()*Math.PI*2, color:colors[Math.floor(Math.random()*colors.length)], bright:Math.random()>.978};
    }
    function resize() {
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      width = wall.clientWidth; height = wall.clientHeight;
      canvas.width = width*dpr; canvas.height = height*dpr;
      canvas.style.width = `${width}px`; canvas.style.height = `${height}px`;
      ctx.setTransform(dpr,0,0,dpr,0,0);
      const count = width < 680 ? 84 : Math.min(180, Math.round(width/8.5));
      stars = Array.from({length:count}, makeStar);
      if (reduced) draw(true);
    }
    function spawnMeteor() {
      meteor = {x:width*(.15+Math.random()*.55),y:height*(.06+Math.random()*.24),vx:5+Math.random()*3,vy:2.2+Math.random()*1.8,life:1};
    }
    function draw(staticFrame=false) {
      frame=0; time+=.006;
      ctx.clearRect(0,0,width,height);
      ctx.globalCompositeOperation="screen";
      pointer.x+=(pointer.tx-pointer.x)*.045; pointer.y+=(pointer.ty-pointer.y)*.045;
      stars.forEach((star)=>{
        const shiftX=(pointer.x-.5)*34*star.depth;
        const shiftY=(pointer.y-.5)*22*star.depth;
        const x=star.x*width-shiftX, y=star.y*height-shiftY;
        const twinkle=staticFrame ? .72 : .68+Math.sin(time*(1.2+star.depth)+star.phase)*.22;
        const alpha=Math.min(.92,star.alpha*twinkle);
        ctx.fillStyle=`rgba(${star.color},${alpha})`;
        ctx.beginPath();ctx.arc(x,y,star.size,0,Math.PI*2);ctx.fill();
        if(star.bright){
          ctx.strokeStyle=`rgba(${star.color},${alpha*.28})`;ctx.lineWidth=.45;
          ctx.beginPath();ctx.moveTo(x-star.size*5,y);ctx.lineTo(x+star.size*5,y);ctx.moveTo(x,y-star.size*3.2);ctx.lineTo(x,y+star.size*3.2);ctx.stroke();
        }
      });
      if(!staticFrame && !meteor && Math.random()<.00065) spawnMeteor();
      if(meteor){
        const gradient=ctx.createLinearGradient(meteor.x-90,meteor.y-42,meteor.x,meteor.y);
        gradient.addColorStop(0,"rgba(160,210,255,0)");gradient.addColorStop(1,`rgba(230,246,255,${meteor.life*.72})`);
        ctx.strokeStyle=gradient;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(meteor.x-90,meteor.y-42);ctx.lineTo(meteor.x,meteor.y);ctx.stroke();
        if(!staticFrame){meteor.x+=meteor.vx;meteor.y+=meteor.vy;meteor.life-=.018;if(meteor.life<=0)meteor=null;}
      }
      ctx.globalCompositeOperation="source-over";
      if(!staticFrame&&visible&&!document.hidden)frame=requestAnimationFrame(draw);
    }
    wall.addEventListener("pointermove",(event)=>{const box=wall.getBoundingClientRect();pointer.tx=(event.clientX-box.left)/box.width;pointer.ty=(event.clientY-box.top)/box.height;},{passive:true});
    wall.addEventListener("pointerleave",()=>{pointer.tx=.5;pointer.ty=.5;},{passive:true});
    resize();
    if(!reduced)draw();
    if("ResizeObserver" in window)new ResizeObserver(resize).observe(wall);
    if("IntersectionObserver" in window)new IntersectionObserver(([entry])=>{const next=entry.isIntersecting;if(next===visible)return;visible=next;if(!visible){cancelAnimationFrame(frame);frame=0;}else if(!frame&&!reduced)draw();},{rootMargin:"160px"}).observe(wall);
    document.addEventListener("visibilitychange",()=>{cancelAnimationFrame(frame);frame=0;if(!document.hidden&&visible&&!reduced)draw();});
  }

  function initializeImageStretch() {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    document.querySelectorAll(".post-content__body img, .cm-sci-fi-observation img").forEach((image) => {
      if (image.closest(".cm-image-warp")) return;
      const wrap = document.createElement("span");
      wrap.className = "cm-image-warp";
      image.parentNode.insertBefore(wrap,image);
      wrap.appendChild(image);
    });
    document.querySelectorAll(".cm-image-warp").forEach((wrap) => {
      const image = wrap.querySelector("img");
      if (!image || wrap.dataset.stretchReady) return;
      wrap.dataset.stretchReady = "true";
      const state={rx:0,ry:0,sx:1,sy:1,sk:0},velocity={rx:0,ry:0,sx:0,sy:0,sk:0},target={rx:0,ry:0,sx:1,sy:1,sk:0};
      let frame=0;
      function tick(){
        frame=0;let moving=false;
        Object.keys(state).forEach((key)=>{velocity[key]+=(target[key]-state[key])*.105;velocity[key]*=.74;state[key]+=velocity[key];if(Math.abs(target[key]-state[key])>.001||Math.abs(velocity[key])>.001)moving=true;});
        image.style.setProperty("--warp-rx",`${state.rx.toFixed(3)}deg`);image.style.setProperty("--warp-ry",`${state.ry.toFixed(3)}deg`);
        image.style.setProperty("--warp-sx",state.sx.toFixed(4));image.style.setProperty("--warp-sy",state.sy.toFixed(4));image.style.setProperty("--warp-sk",`${state.sk.toFixed(3)}deg`);
        if(moving)frame=requestAnimationFrame(tick);
      }
      function start(){if(!frame)frame=requestAnimationFrame(tick);}
      wrap.addEventListener("pointermove",(event)=>{const box=wrap.getBoundingClientRect(),nx=(event.clientX-box.left)/box.width*2-1,ny=(event.clientY-box.top)/box.height*2-1;target.ry=nx*4.2;target.rx=-ny*3.4;target.sx=1+Math.abs(nx)*.032;target.sy=1+Math.abs(ny)*.022;target.sk=nx*1.15;wrap.style.setProperty("--warp-x",`${((nx+1)/2*100).toFixed(1)}%`);wrap.style.setProperty("--warp-y",`${((ny+1)/2*100).toFixed(1)}%`);image.style.transformOrigin=`${(nx+1)/2*100}% ${(ny+1)/2*100}%`;start();},{passive:true});
      wrap.addEventListener("pointerleave",()=>{target.rx=0;target.ry=0;target.sx=1;target.sy=1;target.sk=0;image.style.transformOrigin="50% 50%";start();},{passive:true});
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

  const categoryAccent = {
    "Numerical-method": "#57bdb6",
    "Differential equation": "#7299c8",
    "Algorithm": "#9181bd",
    "Software-system": "#68a982",
    "Sci-Fi": "#bd7f72",
    "Miles and Memories": "#af9158"
  };

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
    if (categoryAccent[key]) document.documentElement.style.setProperty("--cm-section-accent", categoryAccent[key]);
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
      const targetPath = decodeURIComponent(new URL(href, location.origin).pathname).replace(/\/$/, "") || "/";
      const currentPath = decodeURIComponent(location.pathname).replace(/\/$/, "") || "/";
      const isSelfLink = targetPath === currentPath;
      const card = document.createElement(isSelfLink ? "div" : "a");
      card.className = `cm-category-card cm-reveal${isSelfLink ? " cm-category-card--static" : ""}`;
      if (!isSelfLink) card.href = href;
      card.innerHTML = `<span>${String(index + 1).padStart(2, "0")}</span><strong></strong><small></small><i aria-hidden="true">${isSelfLink ? "·" : "↗"}</i>`;
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
    const targets = document.querySelectorAll(".cm-home-hero, .cm-hero");
    targets.forEach((target) => {
      if (target.querySelector(":scope > .cm-particle-canvas")) return;
      const canvas = document.createElement("canvas");
      canvas.className = "cm-particle-canvas";
      canvas.setAttribute("aria-hidden", "true");
      target.prepend(canvas);
      const ctx = canvas.getContext("2d");
      const isThreeBody = target.matches(".cm-home-hero, .cm-hero");
      let points = [], width = 0, height = 0, frame = 0, time = 0, inView = true;
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
        const count = width < 700 ? 20 : Math.min(46, Math.round(width / 28));
        points = Array.from({length: count}, () => { const x=Math.random()*width,y=Math.random()*height; return {x,y,px:x,py:y,vx:(Math.random()-.5)*.2,vy:(Math.random()-.5)*.2,r:Math.random()*1.25+.35,z:Math.random()*.75+.25,phase:Math.random()*Math.PI*2}; });
      }

      function bodies(t) {
        const cx = width * .78, cy = height * .36, rx = Math.min(width * .15, 190), ry = Math.min(height * .2, 118);
        return [
          {x:cx + Math.cos(t*.47)*rx, y:cy + Math.sin(t*.61)*ry, r:3.2, color:"205,222,240"},
          {x:cx + Math.cos(t*.39+2.1)*rx*.72, y:cy + Math.sin(t*.53+2.1)*ry*.85, r:2.6, color:"224,188,155"},
          {x:cx + Math.cos(t*.59+4.2)*rx*.48, y:cy + Math.sin(t*.43+4.2)*ry*.62, r:2.2, color:"126,202,198"}
        ];
      }

      function draw() {
        frame = 0;
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
            ctx.strokeStyle = `rgba(${sun.color},.045)`;
            ctx.beginPath();
            ctx.ellipse(width*.78, height*.36, Math.min(width*.15,190)*(1-index*.2), Math.min(height*.2,118)*(1-index*.12), index*.55, 0, Math.PI*2);
            ctx.stroke();
            const glowRadius = sun.r * 4.2;
            const glow = ctx.createRadialGradient(sun.x,sun.y,0,sun.x,sun.y,glowRadius);
            glow.addColorStop(0,`rgba(${sun.color},.76)`); glow.addColorStop(.24,`rgba(${sun.color},.22)`); glow.addColorStop(1,`rgba(${sun.color},0)`);
            ctx.fillStyle=glow; ctx.beginPath(); ctx.arc(sun.x,sun.y,glowRadius,0,Math.PI*2); ctx.fill();
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
        if (inView && !document.hidden) frame=requestAnimationFrame(draw);
      }

      function locate(event) { const box=target.getBoundingClientRect(); pointer.x=event.clientX-box.left; pointer.y=event.clientY-box.top; pointer.active=true; }
      target.addEventListener("pointermove", locate, {passive:true});
      target.addEventListener("pointerleave", () => { pointer.active=false; }, {passive:true});
      resize(); draw();
      if ("ResizeObserver" in window) new ResizeObserver(resize).observe(target);
      else addEventListener("resize", resize, {passive:true});
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(([entry]) => {
          const next = entry.isIntersecting;
          if (next === inView) return;
          inView = next;
          if (!inView) { cancelAnimationFrame(frame); frame = 0; }
          else if (!frame && !document.hidden) draw();
        }, {rootMargin: "120px"}).observe(target);
      }
      document.addEventListener("visibilitychange", () => {
        cancelAnimationFrame(frame); frame = 0;
        if (!document.hidden && inView) draw();
      });
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
    document.documentElement.classList.add("cm-motion-ready");
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); } }), {threshold: .08});
    nodes.forEach(node => { node.classList.add("cm-reveal"); observer.observe(node); });
  }


  function initializeRotatingMathQuotes() {
    const root = document.querySelector("[data-cm-quote-rotator]");
    if (!root) return;
    const quote = root.querySelector("[data-cm-rotating-quote]");
    const source = root.querySelector("[data-cm-quote-source]");
    const counter = root.querySelector("[data-cm-quote-index]");
    if (!quote || !source || !counter) return;

    const quotes = [
      ["计算的目的，是洞察，而非数字。", "Richard W. Hamming"],
      ["我们必须知道，我们终将知道。", "David Hilbert"],
      ["数学是赋予不同事物相同名称的艺术。", "Henri Poincaré"]
    ];
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let index = 0;
    let interval = 0;
    let transition = 0;

    function render(nextIndex, immediate) {
      index = nextIndex % quotes.length;
      const update = () => {
        quote.textContent = quotes[index][0];
        source.textContent = quotes[index][1];
        counter.textContent = `${String(index + 1).padStart(2, "0")} / ${String(quotes.length).padStart(2, "0")}`;
        root.classList.remove("is-changing");
      };
      clearTimeout(transition);
      if (immediate || reduced) {
        update();
        return;
      }
      root.classList.add("is-changing");
      transition = setTimeout(update, 260);
    }

    function stop() {
      clearInterval(interval);
      interval = 0;
    }

    function start() {
      if (reduced || document.hidden || interval) return;
      interval = setInterval(() => render(index + 1, false), 7600);
    }

    render(0, true);
    root.addEventListener("pointerenter", stop, {passive:true});
    root.addEventListener("pointerleave", start, {passive:true});
    root.addEventListener("focusin", stop);
    root.addEventListener("focusout", start);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stop();
      else start();
    });
    start();
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
    initializeLoadingExperience();
    initializeTerminalProgress();
    initializeTheme();
    initializeRotatingMathQuotes();
    initializeSubpageCleanup();
    initializeSearchInterface();
    initializeCodeCopy();
    initializeNestedNavigation();
    initializeResearchFilters();
    initializeCategoryPage();
    initializeSciFiDeepSpace();
    initializeGlassSurfaces();
    initializeImageStretch();
    initializeParallax();
    initializeSymbolField();
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
