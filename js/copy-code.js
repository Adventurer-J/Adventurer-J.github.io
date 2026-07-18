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
    if (!ctx) { canvas.remove(); return; }
    const isHome = !!document.querySelector(".cm-home");
    const glyphs = isHome
      ? ["∫", "∇", "Σ", "∂", "∞", "0", "1", "λ", "Δ", "∏"]
      : ["∫", "∇", "Σ", "∂", "∞", "0", "1", "λ", "Δ", "∏", "ε", "π", "⊗", "∥"];
    const interactionRadius = isHome ? 150 : 195;
    const interactionForce = isHome ? .006 : .01;
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
      if (reduced || isHome) draw(true, performance.now());
    }

    function draw(staticFrame = false, now = performance.now()) {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        if (!staticFrame) {
          if (pointer.active) {
            const dx = p.x - pointer.x, dy = p.y - pointer.y;
            const distance = Math.max(20, Math.hypot(dx, dy));
            if (distance < interactionRadius) {
              const force = (1 - distance / interactionRadius) * interactionForce;
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
        const shimmer = staticFrame ? .65 : .62 + Math.sin(now * .00025 + p.phase) * .18;
        ctx.font = `${p.size}px "Fira Code", "SFMono-Regular", Consolas, monospace`;
        ctx.fillStyle = `rgba(${p.gray},${p.gray},${p.gray},${Math.min(.15, p.alpha * shimmer)})`;
        ctx.fillText(p.glyph, p.x, p.y);
      });
      if (!staticFrame) frame = requestAnimationFrame(animate);
    }

    function animate(now) { draw(false, now); }

    addEventListener("pointermove", (event) => {
      pointer.x = event.clientX; pointer.y = event.clientY; pointer.active = true;
    }, {passive: true});
    document.documentElement.addEventListener("pointerleave", () => { pointer.active = false; }, {passive: true});
    addEventListener("resize", resize, {passive: true});
    resize();
    if (!reduced && !isHome) animate(performance.now());
    document.addEventListener("visibilitychange", () => {
      cancelAnimationFrame(frame);
      frame = 0;
      if (!document.hidden && !reduced && !isHome && !frame) animate(performance.now());
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
    document.querySelectorAll(selectors.join(",")).forEach((surface) => {
      if (surface.matches(".cm-sci-fi-stage")) return;
      surface.classList.add("cm-glass");
    });
  }

  function initializeParallax() {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || innerWidth < 760) return;
    const layers = [
      [document.querySelector(".cm-hero"), .032],
      [document.documentElement.classList.contains("cm-deep-space-active") ? null : document.querySelector(".wall-category .wall-main"), .045],
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
    const wall = document.querySelector("[data-sci-fi-viewport]") || document.querySelector(".wall-category");
    if (key !== "Sci-Fi" || !wall || wall.querySelector(".cm-deep-space-canvas")) return;
    document.documentElement.classList.add("cm-deep-space-active");
    const canvas = document.createElement("canvas");
    canvas.className = "cm-deep-space-canvas";
    canvas.setAttribute("aria-hidden", "true");
    wall.prepend(canvas);
    const ctx = canvas.getContext("2d");
    if (!ctx) { canvas.remove(); return; }
    const reducedQuery = matchMedia("(prefers-reduced-motion: reduce)");
    const forcedColorsQuery = matchMedia("(forced-colors: active)");
    const coarse = matchMedia("(pointer: coarse)").matches;
    let reduced = reducedQuery.matches;
    const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
    const lowPower = coarse || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) || (navigator.deviceMemory && navigator.deviceMemory <= 4);
    const pointer = {x:.5, y:.5, tx:.5, ty:.5, vx:0, vy:0, inside:false};
    const starPalettes = {
      dark: ["185,215,255", "222,232,255", "255,244,225", "255,205,168"],
      light: ["30,54,84", "13,102,100", "57,111,159", "83,111,120"]
    };
    let width = 0, height = 0, stars = [], dust = [], meteor = null, ripples = [], bursts = [];
    let frame = 0, visible = true, time = 0, lastFrame = 0, interfaceFrame = 0;

    function makeStar() {
      const depth = Math.random();
      return {x:Math.random(), y:Math.random(), depth, size:.22+depth*1.05, alpha:.12+Math.random()*.42, phase:Math.random()*Math.PI*2, tone:Math.floor(Math.random()*4), bright:Math.random()>.984};
    }
    function makeDust() {
      const depth = .25 + Math.random() * .75;
      return {x:Math.random(), y:Math.random(), depth, size:.18+Math.random()*.42, alpha:.035+Math.random()*.09, phase:Math.random()*Math.PI*2, tone:Math.floor(Math.random()*4)};
    }
    function resize() {
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      const nextWidth = wall.clientWidth, nextHeight = wall.clientHeight;
      if (nextWidth === width && nextHeight === height) return;
      width = nextWidth; height = nextHeight;
      canvas.width = width*dpr; canvas.height = height*dpr;
      canvas.style.width = `${width}px`; canvas.style.height = `${height}px`;
      ctx.setTransform(dpr,0,0,dpr,0,0);
      const count = width < 680 ? 48 : lowPower ? Math.min(76,Math.round(width/19)) : Math.min(112,Math.round(width/13));
      stars = Array.from({length:count}, makeStar);
      dust = Array.from({length:width < 680 ? 18 : lowPower ? 30 : 52}, makeDust);
      if (reduced) draw(true, performance.now());
    }
    function spawnMeteor() {
      meteor = {x:width*(.15+Math.random()*.55),y:height*(.06+Math.random()*.24),vx:5+Math.random()*3,vy:2.2+Math.random()*1.8,life:1};
    }

    function drawNebula(dark) {
      const driftX=(pointer.x-.5)*width*.018, driftY=(pointer.y-.5)*height*.014;
      const first=ctx.createRadialGradient(width*.76-driftX,height*.16-driftY,0,width*.76-driftX,height*.16-driftY,Math.max(width,height)*.48);
      first.addColorStop(0,dark?"rgba(86,182,194,.052)":"rgba(13,102,100,.035)");
      first.addColorStop(.42,dark?"rgba(97,175,239,.022)":"rgba(57,111,159,.016)");
      first.addColorStop(1,"rgba(0,0,0,0)");
      ctx.fillStyle=first;ctx.fillRect(0,0,width,height);
      const second=ctx.createRadialGradient(width*.22+driftX,height*.82+driftY,0,width*.22+driftX,height*.82+driftY,Math.max(width,height)*.38);
      second.addColorStop(0,dark?"rgba(198,120,221,.028)":"rgba(116,85,138,.018)");
      second.addColorStop(1,"rgba(0,0,0,0)");
      ctx.fillStyle=second;ctx.fillRect(0,0,width,height);
    }

    function drawDust(colors,dark) {
      const px=pointer.x*width,py=pointer.y*height;
      dust.forEach((mote,index)=>{
        const drift=time*.18+mote.phase;
        let x=mote.x*width+Math.cos(time*.19+mote.phase)*11*mote.depth;
        let y=mote.y*height+Math.sin(time*.13+mote.phase)*8*mote.depth;
        if(pointer.inside&&finePointer){
          const dx=x-px,dy=y-py,distance=Math.max(22,Math.hypot(dx,dy));
          if(distance<210){
            const influence=(1-distance/210)*mote.depth;
            const radial=(7+Math.min(18,Math.hypot(pointer.vx,pointer.vy)*.18))*influence;
            const swirl=5.5*influence;
            x+=dx/distance*radial-dy/distance*swirl;
            y+=dy/distance*radial+dx/distance*swirl;
          }
        }
        const pulse=.64+Math.sin(drift+index*.37)*.26;
        ctx.fillStyle=`rgba(${colors[mote.tone%colors.length]},${mote.alpha*pulse*(dark?1:.68)})`;
        ctx.beginPath();ctx.arc(x,y,mote.size*(.7+mote.depth),0,Math.PI*2);ctx.fill();
      });
    }

    function drawGravityRing(dark,tracePrimary,traceSecondary) {
      if(!pointer.inside||!finePointer)return;
      const px=pointer.x*width,py=pointer.y*height;
      const energy=Math.min(1,Math.hypot(pointer.vx,pointer.vy)/30);
      ctx.save();ctx.translate(px,py);ctx.rotate(time*.48);
      ctx.lineCap="round";
      ctx.strokeStyle=`rgba(${tracePrimary},${(dark?.12:.095)+energy*.055})`;
      ctx.lineWidth=.65+energy*.55;
      ctx.beginPath();ctx.arc(0,0,52+energy*8,.18,Math.PI*1.36);ctx.stroke();
      ctx.rotate(-time*.9);
      ctx.strokeStyle=`rgba(${traceSecondary},${(dark?.075:.065)+energy*.035})`;
      ctx.lineWidth=.5;
      ctx.beginPath();ctx.arc(0,0,78+energy*12,Math.PI*.72,Math.PI*1.94);ctx.stroke();
      for(let i=0;i<3;i++){
        const angle=time*(.56+i*.12)+i*Math.PI*2/3;
        const radius=52+i*13+energy*5;
        ctx.fillStyle=`rgba(${i%2?traceSecondary:tracePrimary},${dark?.42:.34})`;
        ctx.beginPath();ctx.arc(Math.cos(angle)*radius,Math.sin(angle)*radius,.85+i*.12,0,Math.PI*2);ctx.fill();
      }
      ctx.restore();
    }

    function drawBursts(dark) {
      bursts=bursts.filter((spark)=>{
        if(!spark.static){spark.x+=spark.vx;spark.y+=spark.vy;spark.vx*=.982;spark.vy*=.982;spark.life-=.032;}
        if(spark.life<=0)return false;
        ctx.strokeStyle=`rgba(${spark.color},${spark.life*(dark?.48:.32)})`;
        ctx.lineWidth=.55+spark.life*.5;
        ctx.beginPath();ctx.moveTo(spark.x,spark.y);ctx.lineTo(spark.x-spark.vx*7,spark.y-spark.vy*7);ctx.stroke();
        return true;
      });
    }

    function draw(staticFrame=false, now=performance.now()) {
      frame=0;
      if(!staticFrame){
        const interval=lowPower?50:33;
        if(lastFrame&&now-lastFrame<interval){frame=requestAnimationFrame(animate);return;}
        const delta=lastFrame?Math.min(3,Math.max(.4,(now-lastFrame)/16.667)):1;
        lastFrame=now;
        time+=.006*delta;
      }
      ctx.clearRect(0,0,width,height);
      const dark=document.documentElement.dataset.cmTheme!=="light";
      const colors=starPalettes[dark?"dark":"light"];
      const tracePrimary=dark?"126,202,198":"13,102,100";
      const traceSecondary=dark?"97,175,239":"57,111,159";
      ctx.globalCompositeOperation="source-over";
      drawNebula(dark);
      ctx.globalCompositeOperation=dark?"screen":"source-over";
      pointer.x+=(pointer.tx-pointer.x)*.045; pointer.y+=(pointer.ty-pointer.y)*.045;
      pointer.vx*=.88;pointer.vy*=.88;
      const nearStars=[];
      stars.forEach((star,index)=>{
        if(!dark&&index%3===0)return;
        const shiftX=(pointer.x-.5)*18*star.depth;
        const shiftY=(pointer.y-.5)*11*star.depth;
        let x=star.x*width-shiftX, y=star.y*height-shiftY;
        const twinkle=staticFrame ? .72 : .68+Math.sin(time*(1.2+star.depth)+star.phase)*.22;
        const alpha=Math.min(dark?.92:.46,star.alpha*twinkle*(dark?1:.72));
        const color=colors[star.tone%colors.length];
        if(pointer.inside&&finePointer){
          const px=pointer.x*width,py=pointer.y*height,dx=x-px,dy=y-py,distance=Math.max(18,Math.hypot(dx,dy));
          if(distance<205){
            const influence=(1-distance/205)*star.depth;
            const lens=(8+Math.min(18,Math.hypot(pointer.vx,pointer.vy)*.16))*influence;
            const swirl=6.5*influence;
            x+=dx/distance*lens-dy/distance*swirl;
            y+=dy/distance*lens+dx/distance*swirl;
          }
          if(distance<215&&star.depth>.5)nearStars.push({x:x,y:y,distance:distance,alpha:alpha,color:color});
        }
        ctx.fillStyle=`rgba(${color},${alpha})`;
        ctx.beginPath();ctx.arc(x,y,star.size,0,Math.PI*2);ctx.fill();
        if(star.bright){
          ctx.strokeStyle=`rgba(${color},${alpha*(dark?.28:.42)})`;ctx.lineWidth=.45;
          ctx.beginPath();ctx.moveTo(x-star.size*5,y);ctx.lineTo(x+star.size*5,y);ctx.moveTo(x,y-star.size*3.2);ctx.lineTo(x,y+star.size*3.2);ctx.stroke();
        }
      });
      drawDust(colors,dark);
      if(pointer.inside&&nearStars.length){
        const px=pointer.x*width,py=pointer.y*height;
        nearStars.sort((a,b)=>a.distance-b.distance).slice(0,8).forEach((star,index,list)=>{
          ctx.strokeStyle=`rgba(${tracePrimary},${(dark?.105:.13)*(1-star.distance/215)})`;ctx.lineWidth=.45;
          ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(star.x,star.y);ctx.stroke();
          if(index){const previous=list[index-1];ctx.strokeStyle=`rgba(${traceSecondary},${(dark?.055:.075)*(1-star.distance/215)})`;ctx.beginPath();ctx.moveTo(previous.x,previous.y);ctx.lineTo(star.x,star.y);ctx.stroke();}
        });
      }
      drawGravityRing(dark,tracePrimary,traceSecondary);
      if(!staticFrame && !meteor && Math.random()<(lowPower?.00065:.00125)) spawnMeteor();
      if(meteor){
        const gradient=ctx.createLinearGradient(meteor.x-90,meteor.y-42,meteor.x,meteor.y);
        gradient.addColorStop(0,dark?"rgba(160,210,255,0)":"rgba(57,111,159,0)");gradient.addColorStop(1,dark?`rgba(230,246,255,${meteor.life*.72})`:`rgba(30,84,112,${meteor.life*.42})`);
        ctx.strokeStyle=gradient;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(meteor.x-90,meteor.y-42);ctx.lineTo(meteor.x,meteor.y);ctx.stroke();
        if(!staticFrame){meteor.x+=meteor.vx;meteor.y+=meteor.vy;meteor.life-=.018;if(meteor.life<=0)meteor=null;}
      }
      ripples=ripples.filter((ripple)=>{
        if(!staticFrame){ripple.radius+=2.4;ripple.life-=.018;}
        if(ripple.life<=0)return false;
        ctx.strokeStyle=`rgba(${tracePrimary},${ripple.life*(dark?.28:.18)})`;ctx.lineWidth=.65+ripple.life;
        ctx.beginPath();ctx.arc(ripple.x,ripple.y,ripple.radius,0,Math.PI*2);ctx.stroke();
        return true;
      });
      drawBursts(dark);
      ctx.globalCompositeOperation="source-over";
      if(!staticFrame&&visible&&!document.hidden&&!forcedColorsQuery.matches)frame=requestAnimationFrame(animate);
    }
    function animate(now){draw(false,now);}
    const interfacePointer = {clientX:0, clientY:0, target:null};
    wall.addEventListener("pointermove",(event)=>{
      const box=wall.getBoundingClientRect();
      const nextX=(event.clientX-box.left)/box.width;
      const nextY=(event.clientY-box.top)/box.height;
      pointer.vx=Math.max(-42,Math.min(42,pointer.vx+(nextX-pointer.tx)*box.width));
      pointer.vy=Math.max(-42,Math.min(42,pointer.vy+(nextY-pointer.ty)*box.height));
      pointer.tx=nextX;
      pointer.ty=nextY;
      pointer.inside=true;
      if(reduced||!finePointer)return;
      interfacePointer.clientX=event.clientX;
      interfacePointer.clientY=event.clientY;
      interfacePointer.target=event.target;
      if(interfaceFrame)return;
      interfaceFrame=requestAnimationFrame(()=>{
        interfaceFrame=0;
        const x=Math.max(0,Math.min(1,pointer.tx));
        const y=Math.max(0,Math.min(1,pointer.ty));
        wall.style.setProperty("--sf-pointer-x",(x*100).toFixed(2)+"%");
        wall.style.setProperty("--sf-pointer-y",(y*100).toFixed(2)+"%");
        wall.style.setProperty("--sf-shift-x",((x-.5)*8).toFixed(2)+"px");
        wall.style.setProperty("--sf-shift-y",((y-.5)*6).toFixed(2)+"px");
        wall.style.setProperty("--sf-orbit-x",((.5-x)*5).toFixed(2)+"px");
        wall.style.setProperty("--sf-orbit-y",((.5-y)*4).toFixed(2)+"px");
        const target=interfacePointer.target&&interfacePointer.target.closest?interfacePointer.target.closest("[data-sci-fi-sector]"):null;
        if(!target)return;
        const cardBox=target.getBoundingClientRect();
        const localX=Math.max(0,Math.min(1,(interfacePointer.clientX-cardBox.left)/cardBox.width));
        const localY=Math.max(0,Math.min(1,(interfacePointer.clientY-cardBox.top)/cardBox.height));
        target.style.setProperty("--sf-card-x",(localX*100).toFixed(2)+"%");
        target.style.setProperty("--sf-card-y",(localY*100).toFixed(2)+"%");
        target.style.setProperty("--sf-tilt-x",((.5-localY)*3).toFixed(2)+"deg");
        target.style.setProperty("--sf-tilt-y",((localX-.5)*3).toFixed(2)+"deg");
      });
    },{passive:true});
    wall.addEventListener("pointerleave",()=>{
      pointer.tx=.5;pointer.ty=.5;pointer.vx=0;pointer.vy=0;pointer.inside=false;
      cancelAnimationFrame(interfaceFrame);interfaceFrame=0;
      wall.style.setProperty("--sf-pointer-x","50%");
      wall.style.setProperty("--sf-pointer-y","34%");
      wall.style.setProperty("--sf-shift-x","0px");
      wall.style.setProperty("--sf-shift-y","0px");
      wall.style.setProperty("--sf-orbit-x","0px");
      wall.style.setProperty("--sf-orbit-y","0px");
    },{passive:true});
    wall.addEventListener("pointerdown",(event)=>{
      if(reduced||forcedColorsQuery.matches)return;
      const box=wall.getBoundingClientRect();
      const x=event.clientX-box.left,y=event.clientY-box.top;
      const dark=document.documentElement.dataset.cmTheme!=="light";
      const colors=starPalettes[dark?"dark":"light"];
      ripples.push({x:x,y:y,radius:5,life:1});
      if(ripples.length>4)ripples.shift();
      for(let i=0;i<(lowPower?7:12);i++){
        const angle=Math.PI*2*i/(lowPower?7:12)+(Math.random()-.5)*.24;
        const speed=.7+Math.random()*1.8;
        bursts.push({x:x,y:y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,life:.72+Math.random()*.28,color:colors[i%colors.length]});
      }
      if(bursts.length>24)bursts.splice(0,bursts.length-24);
      if(!frame&&visible&&!document.hidden)animate(performance.now());
    },{passive:true});
    resize();
    if(!reduced&&!forcedColorsQuery.matches)animate(performance.now());
    else draw(true,performance.now());
    let resizeObserver=null,visibilityObserver=null;
    if("ResizeObserver" in window){resizeObserver=new ResizeObserver(resize);resizeObserver.observe(wall);}
    else addEventListener("resize",resize,{passive:true});
    if("IntersectionObserver" in window){visibilityObserver=new IntersectionObserver(([entry])=>{const next=entry.isIntersecting;if(next===visible)return;visible=next;if(!visible){cancelAnimationFrame(frame);frame=0;}else if(!frame&&!reduced&&!forcedColorsQuery.matches)animate(performance.now());},{rootMargin:"160px"});visibilityObserver.observe(wall);}
    document.addEventListener("visibilitychange",()=>{cancelAnimationFrame(frame);frame=0;lastFrame=0;if(!document.hidden&&visible&&!reduced&&!forcedColorsQuery.matches)animate(performance.now());});
    document.addEventListener("cm:themechange",()=>{if(reduced)draw(true,performance.now());});
    const onReducedChange=(event)=>{reduced=event.matches;cancelAnimationFrame(frame);frame=0;lastFrame=0;if(reduced)draw(true,performance.now());else if(visible&&!document.hidden&&!forcedColorsQuery.matches)animate(performance.now());};
    const onForcedColorsChange=(event)=>{canvas.hidden=event.matches;cancelAnimationFrame(frame);frame=0;lastFrame=0;if(!event.matches&&!reduced&&visible&&!document.hidden)animate(performance.now());};
    if(reducedQuery.addEventListener)reducedQuery.addEventListener("change",onReducedChange);
    else if(reducedQuery.addListener)reducedQuery.addListener(onReducedChange);
    if(forcedColorsQuery.addEventListener)forcedColorsQuery.addEventListener("change",onForcedColorsChange);
    else if(forcedColorsQuery.addListener)forcedColorsQuery.addListener(onForcedColorsChange);
    addEventListener("pagehide",()=>{cancelAnimationFrame(frame);cancelAnimationFrame(interfaceFrame);frame=0;interfaceFrame=0;if(resizeObserver)resizeObserver.disconnect();if(visibilityObserver)visibilityObserver.disconnect();});
    addEventListener("pageshow",(event)=>{
      if(!event.persisted)return;
      lastFrame=0;resize();
      if(resizeObserver)resizeObserver.observe(wall);
      if(visibilityObserver)visibilityObserver.observe(wall);
      canvas.hidden=forcedColorsQuery.matches;
      if(reduced)draw(true,performance.now());
      else if(visible&&!document.hidden&&!forcedColorsQuery.matches)animate(performance.now());
    });
  }

  function initializeSciFiInteractions() {
    const stage = document.querySelector("[data-sci-fi-viewport]");
    if (!stage || stage.dataset.sciFiInteractionsReady) return;
    const tabs = Array.from(stage.querySelectorAll("[role=tab][data-sci-fi-sector]"));
    const panel = stage.querySelector("#cm-sci-fi-sector-panel");
    if (!tabs.length || !panel) return;
    stage.dataset.sciFiInteractionsReady = "true";

    const channels = {
      civilization: {
        code:"01 / ERA",
        title:"文明与时间",
        copy:"沿文明兴衰、记忆保存与历史选择，观察个体如何进入漫长时间尺度。",
        detail:"TIME SCALE / CIVILIZATION MEMORY",
        listen:"1420.405 MHz",
        vector:"α CENTAURI",
        distance:"4.37 LY",
        era:"CHAOTIC",
        traceTitle:"RED COAST / SIGNAL TRACE",
        traceWarning:"DO NOT ANSWER / 不要回答",
        traceStatus:"LISTENING · ΔT 00:00:08.74"
      },
      unknown: {
        code:"02 / SIGNAL",
        title:"科技与未知",
        copy:"从智能、计算边界与未知信号出发，用想象力检验技术乐观主义的盲区。",
        detail:"TECH FRONTIER / MODEL UNCERTAINTY",
        listen:"2.45 GHz",
        vector:"TECH FRONTIER",
        distance:"0.00 AU",
        era:"EMERGENT",
        traceTitle:"TECHNOLOGY / UNKNOWN SIGNAL",
        traceWarning:"MODEL INCOMPLETE / 边界未定",
        traceStatus:"PROBING · CONFIDENCE 0.61"
      },
      cosmos: {
        code:"03 / VECTOR",
        title:"宇宙尺度",
        copy:"把人类放回行星、恒星与宇宙时间坐标，重新衡量距离、风险与意义。",
        detail:"COSMIC FRAME / OBSERVER SCALE",
        listen:"10⁻²¹ Hz",
        vector:"LOCAL GROUP",
        distance:"2.54 MLY",
        era:"COSMIC",
        traceTitle:"COSMIC FRAME / SCALE TRACE",
        traceWarning:"OBSERVER INCLUDED / 观察者在内",
        traceStatus:"MAPPING · FRAME CMB"
      }
    };
    const hooks = {
      code:panel.querySelector("[data-sci-fi-detail-code]"),
      title:panel.querySelector("[data-sci-fi-detail-title]"),
      copy:panel.querySelector("[data-sci-fi-detail-copy]"),
      detail:panel.querySelector("[data-sci-fi-detail-metric]"),
      listen:stage.querySelector("[data-sci-fi-metric=listen]"),
      vector:stage.querySelector("[data-sci-fi-metric=vector]"),
      distance:stage.querySelector("[data-sci-fi-metric=distance]"),
      era:stage.querySelector("[data-sci-fi-metric=era]"),
      traceTitle:stage.querySelector("[data-sci-fi-trace-title]"),
      traceWarning:stage.querySelector("[data-sci-fi-trace-warning]"),
      traceStatus:stage.querySelector("[data-sci-fi-trace-status]"),
      announcer:stage.querySelector("[data-sci-fi-announcer]")
    };
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

    function activate(tab, announce) {
      const channel = channels[tab.dataset.sciFiSector];
      if (!channel) return;
      tabs.forEach((item)=>{
        const selected=item===tab;
        item.classList.toggle("is-active",selected);
        item.setAttribute("aria-selected",String(selected));
        item.tabIndex=selected?0:-1;
      });
      panel.setAttribute("aria-labelledby",tab.id);
      Object.keys(channel).forEach((key)=>{
        if(hooks[key])hooks[key].textContent=channel[key];
      });
      stage.dataset.sciFiChannel=tab.dataset.sciFiSector;
      if(!reduced){
        panel.classList.add("is-switching");
        requestAnimationFrame(()=>requestAnimationFrame(()=>panel.classList.remove("is-switching")));
      }
      if(announce&&hooks.announcer)hooks.announcer.textContent="已切换到"+channel.title+"观察频道";
    }

    tabs.forEach((tab,index)=>{
      tab.addEventListener("click",()=>activate(tab,true));
      tab.addEventListener("keydown",(event)=>{
        let next=index;
        if(event.key==="ArrowRight"||event.key==="ArrowDown")next=(index+1)%tabs.length;
        else if(event.key==="ArrowLeft"||event.key==="ArrowUp")next=(index-1+tabs.length)%tabs.length;
        else if(event.key==="Home")next=0;
        else if(event.key==="End")next=tabs.length-1;
        else return;
        event.preventDefault();
        tabs[next].focus();
        activate(tabs[next],true);
      });
    });
    activate(tabs.find((tab)=>tab.getAttribute("aria-selected")==="true")||tabs[0],false);
  }

  function initializeImageStretch() {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    document.querySelectorAll(".post-content__body img").forEach((image) => {
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
    let saved = null;
    try {
      const candidate = localStorage.getItem("cm-theme");
      if (candidate === "light" || candidate === "dark") saved = candidate;
    } catch (error) {}
    const preferredDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = saved || (preferredDark ? "dark" : "light");

    const button = document.createElement("button");
    button.className = "cm-theme-toggle";
    button.type = "button";

    function render(theme) {
      const dark = theme === "dark";
      button.textContent = dark ? "☀" : "◐";
      button.setAttribute("aria-label", dark ? "切换到浅色模式" : "切换到深色模式");
      button.title = dark ? "浅色模式" : "深色模式";
    }

    function applyTheme(theme, persist) {
      document.documentElement.dataset.cmTheme = theme;
      render(theme);
      if (persist) {
        try { localStorage.setItem("cm-theme", theme); } catch (error) {}
      }
      document.dispatchEvent(new CustomEvent("cm:themechange", { detail: { theme: theme } }));
    }

    applyTheme(initial, false);
    button.addEventListener("click", () => {
      const next = document.documentElement.dataset.cmTheme === "dark" ? "light" : "dark";
      applyTheme(next, true);
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

  const categoryKickerMap = Object.freeze({
    "Numerical-method": "NUMERICS / 数值计算",
    "Differential equation": "EQUATIONS / 方程与模型",
    "Algorithm": "ALGORITHMS / 计算策略",
    "Software-system": "WORKFLOW / 科研工作流",
    "Miles and Memories": "FIELD NOTES / 行路札记"
  });

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
    if (key === "Sci-Fi") return;
    const items = categoryMap[key];
    if (categoryAccent[key]) document.documentElement.style.setProperty("--cm-section-accent", categoryAccent[key]);
    const wall = document.querySelector(".wall-category");
    if (!items || !wall || wall.querySelector(".cm-category-grid")) return;
    wall.classList.add("cm-category-shell");
    const main = wall.querySelector(".wall-main") || wall;
    const kicker = document.createElement("p");
    kicker.className = "cm-category-kicker";
    kicker.textContent = categoryKickerMap[key] ?? "EXPLORE / 内容导航";
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


  function initializeSubpageParticleFields() {
    if (document.querySelector(".cm-home") || document.documentElement.classList.contains("cm-deep-space-active")) return;
    const reducedQuery = matchMedia("(prefers-reduced-motion: reduce)");
    const forcedColorsQuery = matchMedia("(forced-colors: active)");
    if (reducedQuery.matches || forcedColorsQuery.matches) return;
    const coarse = matchMedia("(pointer: coarse)").matches;
    const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
    const key = decodeURIComponent(location.pathname).split("/").filter(Boolean)[0];
    const categoryProfiles = {
      "Numerical-method": "mesh",
      "Differential equation": "flow",
      "Algorithm": "signal",
      "Software-system": "signal",
      "Miles and Memories": "waypoint"
    };
    let target = null;
    let profile = "";
    if (document.documentElement.classList.contains("cm-page-research")) {
      target = document.querySelector(".cm-hub .cm-hero");
      profile = "signal";
    } else if (document.documentElement.classList.contains("cm-page-category") && key !== "Sci-Fi") {
      target = document.querySelector(".wall-category:not(.cm-sci-fi-stage)");
      profile = categoryProfiles[key] || "mesh";
    } else if (document.documentElement.classList.contains("cm-page-article")) {
      target = document.querySelector(".post-content__head");
      profile = "glyph";
    }
    if (!target || target.matches("[data-sci-fi-viewport], .cm-sci-fi-stage") || target.querySelector(":scope > .cm-particle-canvas--subpage")) return;

    const canvas = document.createElement("canvas");
    canvas.className = "cm-particle-canvas cm-particle-canvas--subpage";
    canvas.dataset.particleProfile = profile;
    canvas.setAttribute("aria-hidden", "true");
    target.classList.add("cm-subpage-particle-field", "cm-subpage-particle-field--" + profile);
    target.prepend(canvas);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const profilePalettes = {
      dark: {
        mesh: ["86,182,194", "97,175,239"],
        flow: ["97,175,239", "86,182,194"],
        signal: key === "Software-system" ? ["229,192,123", "86,182,194"] : ["198,120,221", "86,182,194"],
        waypoint: ["229,192,123", "86,182,194"],
        glyph: ["97,175,239", "198,120,221"]
      },
      light: {
        mesh: ["13,102,100", "57,111,159"],
        flow: ["57,111,159", "13,102,100"],
        signal: key === "Software-system" ? ["142,91,28", "13,102,100"] : ["116,85,138", "13,102,100"],
        waypoint: ["142,91,28", "13,102,100"],
        glyph: ["57,111,159", "116,85,138"]
      }
    };
    function resolvePalette() {
      const theme=document.documentElement.dataset.cmTheme==="dark"?"dark":"light";
      return profilePalettes[theme][profile] || profilePalettes[theme].mesh;
    }
    let palette = resolvePalette();
    const glyphs = ["∫", "∇", "Σ", "∂", "∞", "λ", "Δ", "0", "1"];
    const pointer = {x:-999, y:-999, clientX:0, clientY:0, active:false, lastX:-999, lastY:-999, vx:0, vy:0, energy:0};
    let width = 0, height = 0, points = [], links = [], pulses = [], ripples = [], sparks = [];
    let frame = 0, pointerFrame = 0, visible = true, lastFrame = 0, time = 0;

    function point(x, y, index) {
      return {
        x:x, y:y, homeX:x, homeY:y, px:x, py:y,
        vx:(Math.random()-.5)*.08, vy:(Math.random()-.5)*.08,
        radius:.55+Math.random()*1.05, depth:.42+Math.random()*.58,
        phase:Math.random()*Math.PI*2, tone:index%palette.length, color:palette[index%palette.length],
        glyph:glyphs[index%glyphs.length]
      };
    }

    function buildMesh() {
      const gap = coarse ? 116 : 96;
      const cols = Math.max(5, Math.round(width/gap));
      const rows = Math.max(4, Math.round(height/gap));
      const stepX = width/(cols+1), stepY = height/(rows+1);
      points = [];
      links = [];
      for (let row=0; row<rows; row++) {
        for (let col=0; col<cols; col++) {
          const jitterX = (Math.random()-.5)*stepX*.34;
          const jitterY = (Math.random()-.5)*stepY*.34;
          points.push(point(stepX*(col+1)+jitterX, stepY*(row+1)+jitterY, row*cols+col));
          const index = row*cols+col;
          if (col) links.push([index-1,index]);
          if (row) links.push([index-cols,index]);
          if (row && col && (row+col)%2===0) links.push([index-cols-1,index]);
        }
      }
    }

    function buildFlow() {
      const count = coarse ? 24 : Math.min(48, Math.max(34, Math.round(width/25)));
      points = Array.from({length:count}, (_, index) => point(Math.random()*width, Math.random()*height, index));
      links = [];
    }

    function buildSignal() {
      const count = coarse ? 17 : Math.min(30, Math.max(22, Math.round(width/42)));
      points = Array.from({length:count}, (_, index) => point(width*(.05+Math.random()*.9), height*(.12+Math.random()*.76), index));
      const edgeSet = new Set();
      links = [];
      points.forEach((p, index) => {
        const nearest = points.map((q, qIndex) => [qIndex, Math.hypot(p.x-q.x,p.y-q.y)])
          .filter(([qIndex]) => qIndex !== index)
          .sort((a,b) => a[1]-b[1])
          .slice(0, index%3===0 ? 2 : 1);
        nearest.forEach(([qIndex]) => {
          const a=Math.min(index,qIndex), b=Math.max(index,qIndex), edge=a+":"+b;
          if (!edgeSet.has(edge)) { edgeSet.add(edge); links.push([a,b]); }
        });
      });
      pulses = Array.from({length:coarse ? 2 : 4}, (_, index) => ({
        edge:index%Math.max(1,links.length), t:Math.random(), speed:.0028+Math.random()*.0022
      }));
    }

    function buildDrift() {
      const count = coarse ? 10 : profile === "glyph" ? 18 : 22;
      const left = profile === "glyph" ? width*.48 : width*.06;
      points = Array.from({length:count}, (_, index) => {
        const p=point(left+Math.random()*(width-left-width*.04), height*(.12+Math.random()*.76), index);
        p.vx=(Math.random()-.5)*.035;
        p.vy=-(.025+Math.random()*.045);
        return p;
      });
      links = [];
    }

    function rebuild() {
      if (profile === "mesh") buildMesh();
      else if (profile === "flow") buildFlow();
      else if (profile === "signal") buildSignal();
      else buildDrift();
    }

    function resize() {
      const nextWidth = Math.max(1,target.clientWidth);
      const nextHeight = Math.max(1,target.clientHeight);
      if (nextWidth === width && nextHeight === height) return;
      width=nextWidth; height=nextHeight;
      const dpr=Math.min(devicePixelRatio||1,coarse?1.25:1.5);
      canvas.width=Math.round(width*dpr);
      canvas.height=Math.round(height*dpr);
      canvas.style.width=width+"px";
      canvas.style.height=height+"px";
      ctx.setTransform(dpr,0,0,dpr,0,0);
      rebuild();
    }

    function applyPointer(p, radius, strength, swirl) {
      if (!pointer.active) return 0;
      const dx=p.x-pointer.x, dy=p.y-pointer.y;
      const distance=Math.max(16,Math.hypot(dx,dy));
      if (distance>=radius) return 0;
      const influence=1-distance/radius;
      const boost=1+pointer.energy*.85;
      p.vx+=(dx/distance*strength*influence-dy/distance*swirl*influence)*boost;
      p.vy+=(dy/distance*strength*influence+dx/distance*swirl*influence)*boost;
      return influence;
    }

    function updatePoint(p, index) {
      p.px=p.x; p.py=p.y;
      if (profile === "mesh" || profile === "signal") {
        const spring=profile==="mesh"?.018:.009;
        p.vx+=(p.homeX-p.x)*spring;
        p.vy+=(p.homeY-p.y)*spring;
        applyPointer(p,profile==="mesh"?165:145,profile==="mesh"?.13:.07,profile==="signal"?.018:0);
        p.vx*=profile==="mesh"?.88:.92;
        p.vy*=profile==="mesh"?.88:.92;
      } else if (profile === "flow") {
        const nx=p.x/width-.5, ny=p.y/height-.5;
        const angle=Math.sin(ny*4.2+time*.7)*.82+Math.cos(nx*3.6-time*.45)*.62;
        p.vx+=Math.cos(angle)*.008;
        p.vy+=Math.sin(angle)*.008;
        applyPointer(p,180,.025,.085);
        p.vx*=.982; p.vy*=.982;
        const speed=Math.max(.001,Math.hypot(p.vx,p.vy));
        if (speed>.62) { p.vx=p.vx/speed*.62; p.vy=p.vy/speed*.62; }
      } else {
        applyPointer(p,190,.04,profile==="waypoint"?.012:0);
        p.vx*=.992; p.vy+=(profile==="glyph"?-.0004:.00015);
        p.vy*=.995;
      }
      p.x+=p.vx; p.y+=p.vy;
      if (profile === "flow") {
        if (p.x<-12) p.x=width+12; else if (p.x>width+12) p.x=-12;
        if (p.y<-12) p.y=height+12; else if (p.y>height+12) p.y=-12;
      } else if (profile === "glyph" || profile === "waypoint") {
        if (p.y<-24) { p.y=height+24; p.x=(profile==="glyph"?width*.48:0)+Math.random()*(profile==="glyph"?width*.48:width); }
        if (p.x<-24) p.x=width+24; else if (p.x>width+24) p.x=-24;
      }
      return .58+Math.sin(time*1.7+p.phase+index*.13)*.2;
    }

    function drawLinks(dark) {
      links.forEach(([a,b], index) => {
        const p=points[a], q=points[b];
        if (!p || !q) return;
        const distance=Math.hypot(p.x-q.x,p.y-q.y);
        const nearPointer=pointer.active ? Math.max(0,1-Math.min(Math.hypot((p.x+q.x)/2-pointer.x,(p.y+q.y)/2-pointer.y)/180,1)) : 0;
        let alpha=(profile==="signal"?.075:.06)+nearPointer*.105;
        if (profile==="mesh" && distance>Math.max(width,height)*.24) alpha*=.25;
        ctx.strokeStyle="rgba("+palette[index%palette.length]+","+alpha+")";
        ctx.lineWidth=nearPointer>.2?.85:.5;
        ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke();
      });
      if (profile==="signal") {
        pulses.forEach((pulse,index)=>{
          if (!links.length) return;
          pulse.t+=pulse.speed*(pointer.active?1.45:1);
          if (pulse.t>1) { pulse.t=0; pulse.edge=(pulse.edge+1+index)%links.length; }
          const edge=links[pulse.edge], a=points[edge[0]], b=points[edge[1]];
          const x=a.x+(b.x-a.x)*pulse.t, y=a.y+(b.y-a.y)*pulse.t;
          const glow=ctx.createRadialGradient(x,y,0,x,y,7);
          glow.addColorStop(0,"rgba("+palette[index%palette.length]+",.62)");
          glow.addColorStop(1,"rgba("+palette[index%palette.length]+",0)");
          ctx.fillStyle=glow;ctx.beginPath();ctx.arc(x,y,7,0,Math.PI*2);ctx.fill();
        });
      }
    }

    function drawMeshRefinement() {
      if (!pointer.active || profile!=="mesh") return;
      ctx.strokeStyle="rgba("+palette[0]+",.13)";
      ctx.fillStyle="rgba("+palette[1]+",.36)";
      ctx.lineWidth=.45;
      for (let i=0;i<6;i++) {
        const angle=i*Math.PI/3+time*.12;
        const radius=26+(i%2)*12;
        const x=pointer.x+Math.cos(angle)*radius, y=pointer.y+Math.sin(angle)*radius;
        ctx.beginPath();ctx.moveTo(pointer.x,pointer.y);ctx.lineTo(x,y);ctx.stroke();
        ctx.beginPath();ctx.arc(x,y,1.1,0,Math.PI*2);ctx.fill();
      }
    }

    function drawWaypoints() {
      if (profile!=="waypoint") return;
      const order=points.slice().sort((a,b)=>a.x-b.x);
      ctx.setLineDash([2,7]);
      ctx.strokeStyle="rgba("+palette[0]+",.11)";
      ctx.lineWidth=.7;ctx.beginPath();
      order.slice(0,12).forEach((p,index)=>index?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));
      ctx.stroke();ctx.setLineDash([]);
    }

    function drawProfileSweep(dark) {
      if (profile!=="signal") return;
      const x=((time*.072)%1)*width;
      const gradient=ctx.createLinearGradient(x-54,0,x+10,0);
      gradient.addColorStop(0,"rgba("+palette[0]+",0)");
      gradient.addColorStop(1,"rgba("+palette[0]+","+(dark?".085":".06")+")");
      ctx.fillStyle=gradient;
      ctx.fillRect(x-54,0,64,height);
      ctx.strokeStyle="rgba("+palette[1]+","+(dark?".15":".11")+")";
      ctx.lineWidth=.55;ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,height);ctx.stroke();
    }

    function drawPointerConstellation(dark) {
      if (!pointer.active || !finePointer) return;
      const radius=profile==="glyph"?235:215;
      const nearby=points.map((p,index)=>({p:p,index:index,distance:Math.hypot(p.x-pointer.x,p.y-pointer.y)}))
        .filter((item)=>item.distance<radius)
        .sort((a,b)=>a.distance-b.distance)
        .slice(0,coarse?5:7);
      const energy=.35+pointer.energy*.65;
      nearby.forEach((item,index,list)=>{
        const alpha=(1-item.distance/radius)*(dark?.18:.13)*energy;
        ctx.strokeStyle="rgba("+palette[index%palette.length]+","+alpha+")";
        ctx.lineWidth=.45+pointer.energy*.42;
        ctx.beginPath();ctx.moveTo(pointer.x,pointer.y);ctx.lineTo(item.p.x,item.p.y);ctx.stroke();
        if(index){
          const previous=list[index-1].p;
          ctx.strokeStyle="rgba("+palette[(index+1)%palette.length]+","+(alpha*.58)+")";
          ctx.beginPath();ctx.moveTo(previous.x,previous.y);ctx.lineTo(item.p.x,item.p.y);ctx.stroke();
        }
      });
      ctx.save();ctx.translate(pointer.x,pointer.y);ctx.rotate(time*.65);
      ctx.strokeStyle="rgba("+palette[0]+","+(dark?.13:.095)*energy+")";
      ctx.lineWidth=.65;ctx.beginPath();ctx.arc(0,0,42+pointer.energy*12,.12,Math.PI*1.5);ctx.stroke();
      ctx.rotate(-time*1.1);
      ctx.strokeStyle="rgba("+palette[1]+","+(dark?.09:.07)*energy+")";
      ctx.beginPath();ctx.arc(0,0,67+pointer.energy*15,Math.PI*.62,Math.PI*1.92);ctx.stroke();
      for(let i=0;i<4;i++){
        const angle=time*(.8+i*.07)+i*Math.PI/2;
        const orbit=43+i*7+pointer.energy*8;
        ctx.fillStyle="rgba("+palette[i%palette.length]+","+(dark?.52:.4)*energy+")";
        ctx.beginPath();ctx.arc(Math.cos(angle)*orbit,Math.sin(angle)*orbit,.72+i*.08,0,Math.PI*2);ctx.fill();
      }
      ctx.restore();
    }

    function drawRipples() {
      ripples= ripples.filter((r)=>{
        r.radius+=2.3; r.life-=.026;
        if (r.life<=0) return false;
        ctx.strokeStyle="rgba("+r.color+","+(r.life*.34)+")";
        ctx.lineWidth=.7+r.life;
        ctx.beginPath();ctx.arc(r.x,r.y,r.radius,0,Math.PI*2);ctx.stroke();
        return true;
      });
      sparks=sparks.filter((spark)=>{
        spark.x+=spark.vx; spark.y+=spark.vy; spark.life-=.045;
        if (spark.life<=0) return false;
        ctx.fillStyle="rgba("+spark.color+","+(spark.life*.42)+")";
        ctx.beginPath();ctx.arc(spark.x,spark.y,.7+spark.life,0,Math.PI*2);ctx.fill();
        return true;
      });
    }

    function draw(now) {
      frame=0;
      if (!visible || document.hidden) return;
      const interval=coarse?50:33;
      if (now-lastFrame<interval) { frame=requestAnimationFrame(draw); return; }
      lastFrame=now;
      time+=interval*.001;
      pointer.energy*=.94;
      ctx.clearRect(0,0,width,height);
      const dark=document.documentElement.dataset.cmTheme==="dark";
      ctx.globalCompositeOperation=dark?"screen":"source-over";
      drawLinks(dark);
      drawWaypoints();
      drawProfileSweep(dark);
      points.forEach((p,index)=>{
        const pulse=updatePoint(p,index);
        if (profile==="flow") {
          ctx.strokeStyle="rgba("+p.color+","+(dark?.16:.12)*p.depth+")";
          ctx.lineWidth=.45+p.depth*.45;
          ctx.beginPath();ctx.moveTo(p.px,p.py);ctx.lineTo(p.x-p.vx*8,p.y-p.vy*8);ctx.stroke();
        } else if (profile==="glyph") {
          ctx.font=(10+p.depth*8)+'px "Fira Code","SFMono-Regular",Consolas,monospace';
          ctx.fillStyle="rgba("+p.color+","+(dark?.16:.11)*pulse+")";
          ctx.fillText(p.glyph,p.x,p.y);
        } else {
          ctx.fillStyle="rgba("+p.color+","+(dark?.42:.34)*pulse+")";
          ctx.beginPath();ctx.arc(p.x,p.y,p.radius*(.7+p.depth),0,Math.PI*2);ctx.fill();
        }
      });
      drawMeshRefinement();
      drawPointerConstellation(dark);
      drawRipples();
      if (pointer.active) {
        const haloRadius=(profile==="glyph"?132:112)+pointer.energy*24;
        const halo=ctx.createRadialGradient(pointer.x,pointer.y,0,pointer.x,pointer.y,haloRadius);
        halo.addColorStop(0,"rgba("+palette[0]+","+(dark?".09":".065")+")");
        halo.addColorStop(1,"rgba("+palette[0]+",0)");
        ctx.fillStyle=halo;ctx.beginPath();ctx.arc(pointer.x,pointer.y,haloRadius,0,Math.PI*2);ctx.fill();
      }
      ctx.globalCompositeOperation="source-over";
      start();
    }

    function effectsDisabled() {
      return reducedQuery.matches||forcedColorsQuery.matches;
    }
    function start() {
      if (!frame && visible && !document.hidden && !effectsDisabled()) frame=requestAnimationFrame(draw);
    }
    function stop() {
      cancelAnimationFrame(frame); frame=0;
    }
    function updatePointer() {
      pointerFrame=0;
      const box=target.getBoundingClientRect();
      const nextX=pointer.clientX-box.left, nextY=pointer.clientY-box.top;
      const dx=pointer.active?nextX-pointer.x:0,dy=pointer.active?nextY-pointer.y:0;
      const speed=Math.hypot(dx,dy);
      pointer.vx=dx;pointer.vy=dy;
      pointer.energy+=(Math.min(1,speed/36)-pointer.energy)*.58;
      if (finePointer && pointer.active && Math.hypot(nextX-pointer.lastX,nextY-pointer.lastY)>14) {
        sparks.push({x:nextX,y:nextY,vx:-dx*.045+(Math.random()-.5)*.7,vy:-dy*.045+(Math.random()-.5)*.7,life:.72,color:palette[sparks.length%palette.length]});
        if (sparks.length>24) sparks.shift();
        pointer.lastX=nextX;pointer.lastY=nextY;
      }
      pointer.x=nextX;pointer.y=nextY;pointer.active=true;
    }
    function queuePointer(event) {
      if(effectsDisabled())return;
      pointer.clientX=event.clientX;pointer.clientY=event.clientY;
      if (!pointerFrame) pointerFrame=requestAnimationFrame(updatePointer);
    }
    function addRipple(event) {
      if(effectsDisabled())return;
      const box=target.getBoundingClientRect();
      const x=event.clientX-box.left, y=event.clientY-box.top;
      ripples.push({x:x,y:y,radius:4,life:1,color:palette[ripples.length%palette.length]});
      if (ripples.length>4) ripples.shift();
      const burstCount=coarse?6:10;
      for(let i=0;i<burstCount;i++){
        const angle=Math.PI*2*i/burstCount+(Math.random()-.5)*.28;
        const speed=.45+Math.random()*.9;
        sparks.push({x:x,y:y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,life:.82,color:palette[i%palette.length]});
      }
      if(sparks.length>24)sparks.splice(0,sparks.length-24);
      pointer.energy=1;
      if (!finePointer) { pointer.x=x;pointer.y=y;pointer.active=true;setTimeout(()=>{pointer.active=false;},650); }
    }

    if (finePointer) target.addEventListener("pointermove",queuePointer,{passive:true});
    target.addEventListener("pointerdown",addRipple,{passive:true});
    target.addEventListener("pointerleave",()=>{
      pointer.active=false;pointer.lastX=-999;pointer.lastY=-999;pointer.vx=0;pointer.vy=0;pointer.energy=0;
      cancelAnimationFrame(pointerFrame);pointerFrame=0;
    },{passive:true});
    resize();
    start();
    if ("ResizeObserver" in window) new ResizeObserver(resize).observe(target);
    else addEventListener("resize",resize,{passive:true});
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([entry])=>{
        visible=entry.isIntersecting;
        if (visible) start(); else stop();
      },{rootMargin:"140px"}).observe(target);
    }
    document.addEventListener("visibilitychange",()=>document.hidden?stop():start());
    document.addEventListener("cm:themechange",()=>{
      palette=resolvePalette();
      points.forEach((p,index)=>{p.tone=index%palette.length;p.color=palette[p.tone];});
      ripples=[];sparks=[];
    });
    const onMotionPreference=()=>{const disabled=effectsDisabled();canvas.hidden=disabled;if(disabled)stop();else start();};
    if(reducedQuery.addEventListener)reducedQuery.addEventListener("change",onMotionPreference);
    else if(reducedQuery.addListener)reducedQuery.addListener(onMotionPreference);
    if(forcedColorsQuery.addEventListener)forcedColorsQuery.addEventListener("change",onMotionPreference);
    else if(forcedColorsQuery.addListener)forcedColorsQuery.addListener(onMotionPreference);
    addEventListener("pagehide",()=>{stop();cancelAnimationFrame(pointerFrame);pointerFrame=0;});
    addEventListener("pageshow",(event)=>{if(event.persisted){resize();start();}});
  }

  function initializeParticles() {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const targets = document.querySelectorAll(".cm-home-hero");
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


  function initializeEquationGallery() {
    const root=document.querySelector("[data-cm-equation-gallery]");
    if(!root)return;
    const label=root.querySelector("[data-cm-equation-label]");
    const expression=root.querySelector("[data-cm-equation-expression]");
    const note=root.querySelector("[data-cm-equation-note]");
    if(!label||!expression||!note)return;
    const frames=[
      {label:"EULER / IDENTITY",expression:"e<sup>iπ</sup> + 1 = 0",note:"five constants · one line"},
      {label:"GAUSS / INTEGRAL",expression:"∫<sub>−∞</sub><sup>∞</sup> e<sup>−x²</sup> dx = √π",note:"area beneath a bell"},
      {label:"BASEL / SERIES",expression:"Σ<sub>n=1</sub><sup>∞</sup> 1/n² = π²/6",note:"an infinite sum · a finite form"},
      {label:"VARIATION / STATIONARY",expression:"δ𝒥(u) = 0",note:"equilibrium in one symbol"}
    ];
    const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
    let active=0,timer=0,transition=0;

    function render(index,immediate){
      active=(index+frames.length)%frames.length;
      const update=()=>{
        const frameData=frames[active];
        label.textContent=frameData.label;
        expression.innerHTML=frameData.expression;
        note.textContent=frameData.note;
        root.classList.remove("is-changing");
        transition=0;
      };
      clearTimeout(transition);
      if(immediate||reduced)update();
      else{root.classList.add("is-changing");transition=setTimeout(update,220);}
    }
    function stop(){clearInterval(timer);timer=0;}
    function start(){if(reduced||document.hidden||timer)return;timer=setInterval(()=>render(active+1,false),10800);}

    root.title="点击切换公式";
    root.addEventListener("pointerdown",()=>render(active+1,false));
    root.addEventListener("keydown",(event)=>{
      if(event.key!=="Enter"&&event.key!==" ")return;
      event.preventDefault();render(active+1,false);
    });
    root.addEventListener("pointerenter",stop,{passive:true});
    root.addEventListener("pointerleave",start,{passive:true});
    document.addEventListener("visibilitychange",()=>document.hidden?stop():start());
    addEventListener("pagehide",()=>{stop();clearTimeout(transition);transition=0;root.classList.remove("is-changing");});
    addEventListener("pageshow",(event)=>{if(event.persisted){render(active,true);start();}});
    render(0,true);start();
  }


  function initializeQuoteRotators() {
    const library = window.CMQuoteLibrary;
    const roots = Array.from(document.querySelectorAll("[data-cm-quote-rotator]"));
    if (!library || !roots.length) return;

    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timers = new Set();
    const transitions = new Set();
    const schedulers = new Set();
    const modeLabels = {exact:"原句", translated:"中译", paraphrase:"主题意译"};

    function localSlot(date) {
      const day = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);
      return day * 2 + (date.getHours() >= 12 ? 1 : 0);
    }

    function delayToNextBoundary(date) {
      const next = new Date(date.getTime());
      if (date.getHours() < 12) next.setHours(12, 0, 0, 0);
      else {
        next.setDate(next.getDate() + 1);
        next.setHours(0, 0, 0, 0);
      }
      return Math.max(1000, next.getTime() - date.getTime() + 80);
    }

    roots.forEach((root) => {
      if (root.dataset.cmQuoteReady === "true") return;
      const kind = root.dataset.cmQuoteKind === "scifi" ? "scifi" : "math";
      const entries = Array.isArray(library[kind]) ? library[kind] : [];
      const quote = root.querySelector("[data-cm-rotating-quote]");
      const source = root.querySelector("[data-cm-quote-source]");
      const counter = root.querySelector("[data-cm-quote-index]");
      if (entries.length !== 100 || !quote || !source || !counter) return;

      root.dataset.cmQuoteReady = "true";
      let activeIndex = -1;
      let timer = 0;
      let transition = 0;

      function clearTimer() {
        if (!timer) return;
        clearTimeout(timer);
        timers.delete(timer);
        timer = 0;
      }

      function clearTransition() {
        if (!transition) return;
        clearTimeout(transition);
        transitions.delete(transition);
        transition = 0;
      }

      function render(immediate) {
        const slot = localSlot(new Date());
        const offset = kind === "scifi" ? 47 : 11;
        const nextIndex = ((slot * 37 + offset) % entries.length + entries.length) % entries.length;
        if (nextIndex === activeIndex && !immediate) return;
        activeIndex = nextIndex;
        const entry = entries[activeIndex];
        const length = Array.from(entry.text).length;
        const width = String(entries.length).length;
        const mode = modeLabels[entry.note] || "摘录";
        const isHero = root.classList.contains("cm-home-quote-rotator");

        const update = () => {
          quote.textContent = entry.text;
          source.textContent = isHero
            ? `${entry.author} · ${mode}`
            : `${entry.author} · ${entry.source} · ${mode}`;
          source.title = `${entry.author} · ${entry.source} · ${mode}`;
          counter.textContent = `${String(activeIndex + 1).padStart(width, "0")} / ${entries.length}`;
          root.classList.toggle("is-long-quote", length > 24);
          root.classList.toggle("is-very-long-quote", length > 34);
          root.classList.remove("is-changing");
          transitions.delete(transition);
          transition = 0;
        };

        clearTransition();
        if (immediate || reduced) update();
        else {
          root.classList.add("is-changing");
          transition = setTimeout(update, 260);
          transitions.add(transition);
        }
      }

      function schedule(immediate) {
        clearTimer();
        render(immediate);
        if (document.hidden) return;
        timer = setTimeout(() => schedule(false), delayToNextBoundary(new Date()));
        timers.add(timer);
      }

      schedule(true);
      schedulers.add(schedule);
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) clearTimer();
        else schedule(false);
      });
    });

    addEventListener("pagehide", () => {
      timers.forEach(clearTimeout);
      transitions.forEach(clearTimeout);
      timers.clear();
      transitions.clear();
      roots.forEach((root)=>root.classList.remove("is-changing"));
    });
    addEventListener("pageshow", (event) => {
      if(event.persisted)schedulers.forEach((schedule)=>schedule(true));
    });
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

  function initializeArticleComments() {
    if (!document.documentElement.classList.contains("cm-page-article")) return;
    const version = "20260718.3";
    if (!document.querySelector('link[href*="/css/comments.css"]')) {
      const stylesheet = document.createElement("link");
      stylesheet.rel = "stylesheet";
      stylesheet.href = `/css/comments.css?v=${version}`;
      document.head.appendChild(stylesheet);
    }
    if (window.__cmReaderCommentsInitialized || document.querySelector('script[src*="/js/comments.js"]')) return;
    const script = document.createElement("script");
    script.src = `/js/comments.js?v=${version}`;
    script.defer = true;
    document.body.appendChild(script);
  }

  function initialize() {
    document.documentElement.classList.add(`cm-page-${document.querySelector(".cm-home") ? "home" : document.querySelector(".cm-hub") ? "research" : document.querySelector(".post-content") ? "article" : document.querySelector(".wall-category") ? "category" : "default"}`);
    initializeLoadingExperience();
    initializeTerminalProgress();
    initializeTheme();
    initializeEquationGallery();
    initializeQuoteRotators();
    initializeSubpageCleanup();
    initializeSearchInterface();
    initializeCodeCopy();
    initializeNestedNavigation();
    initializeResearchFilters();
    initializeCategoryPage();
    initializeSciFiDeepSpace();
    initializeSciFiInteractions();
    initializeGlassSurfaces();
    initializeImageStretch();
    initializeParallax();
    initializeSymbolField();
    initializeSubpageParticleFields();
    initializeParticles();
    initializeMotion();
    initializeReadingProgress();
    initializeArticleComments();
    initializeBackToTop();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();
