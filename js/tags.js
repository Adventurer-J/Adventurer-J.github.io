(function () {
  "use strict";
  const page = document.querySelector("[data-tags-page]");
  if (!page) return;
  fetch("/tags.json").then((response) => response.json()).then((data) => {
    const tags = data.tags || [];
    const posts = data.posts || [];
    const grid = document.querySelector("[data-tags-grid]");
    const postsRoot = document.querySelector("[data-topic-posts]");
    const filterButtons = Array.from(document.querySelectorAll("[data-tag-type]"));
    const topic = page.dataset.topic;
    const params = new URLSearchParams(location.search);
    const requestedSection = params.get("section");
    const requestedTopic = params.get("topic");
    const sectionNames = {
      "Numerical-method": "数值方法",
      "differential-equation": "微分方程",
      "Algorithm": "算法",
      "Software-system": "操作系统",
      "Sci-Fi": "科幻",
      "miles-and-memories": "在路上"
    };
    const sectionLinks = {
      "Numerical-method": "/Numerical-method",
      "differential-equation": "/differential-equation/",
      "Algorithm": "/Algorithm",
      "Software-system": "/Software-system",
      "Sci-Fi": "/Sci-Fi",
      "miles-and-memories": "/miles-and-memories/"
    };

    const siteNavigation = [
      ["数值方法", "/Numerical-method"], ["微分方程", "/differential-equation/"],
      ["算法", "/Algorithm"], ["操作系统", "/Software-system"],
      ["科幻", "/Sci-Fi"], ["在路上", "/miles-and-memories/"]
    ];
    const topicSubmenus = {
      "数值方法": [["差分方法", "/tags/?section=Numerical-method&topic=finite-difference"], ["有限元方法", "/tags/?section=Numerical-method&topic=finite-element"], ["谱方法", "/tags/?section=Numerical-method&topic=spectral-method"], ["谱元方法", "/tags/?section=Numerical-method&topic=spectral-element"], ["数值线性代数", "/tags/?section=Numerical-method&topic=numerical-linear-algebra"]],
      "微分方程": [["椭圆型 PDE", "/tags/?section=differential-equation&topic=elliptic-pde"], ["抛物型 PDE", "/tags/?section=differential-equation&topic=parabolic-pde"], ["双曲型 PDE", "/tags/?section=differential-equation&topic=hyperbolic-pde"], ["非线性 PDE", "/tags/?section=differential-equation&topic=nonlinear-pde"]],
      "算法": [["优化算法", "/tags/?section=Algorithm&topic=optimization"], ["机器学习算法", "/tags/?section=Algorithm&topic=machine-learning"], ["图算法", "/tags/?section=Algorithm&topic=graph-algorithms"], ["随机算法", "/tags/?section=Algorithm&topic=randomized-algorithms"], ["通用算法思想", "/tags/?section=Algorithm&topic=algorithmic-thinking"]],
      "操作系统": [["Linux", "/tags/?section=Software-system&topic=linux"], ["编译环境", "/tags/?section=Software-system&topic=compiler-toolchain"], ["求解器部署", "/tags/?section=Software-system&topic=solver-deployment"]],
      "科幻": [["书籍", "/tags/?section=Sci-Fi&topic=scifi-books"], ["影像", "/tags/?section=Sci-Fi&topic=scifi-screen"], ["文摘", "/tags/?section=Sci-Fi&topic=scifi-excerpts"], ["思考", "/tags/?section=Sci-Fi&topic=scifi-reflections"]],
      "在路上": [["旅行", "/tags/?section=miles-and-memories&topic=travel"], ["日志", "/tags/?section=miles-and-memories&topic=journal"], ["摄影", "/tags/?section=miles-and-memories&topic=photography"], ["生活记录", "/tags/?section=miles-and-memories&topic=life-records"]]
    };

    function ensureTopicHeader() {
      let header = document.querySelector(".head");
      if (!header) {
        header = document.createElement("header");
        header.className = "head head--sticky cm-topic-dossier-header";
        header.innerHTML = `<div class="nav"><a href="/" class="nav-logo" aria-label="返回首页"><img src="/images/logo.svg" alt="站点标志" width="42" height="42"></a><nav class="nav-menu" aria-label="主导航">${siteNavigation.map(([label, href]) => `<a class="nav-menu-item" href="${href}">${label}</a>`).join("")}</nav></div>`;
        document.body.prepend(header);
      }
      header.classList.add("cm-topic-dossier-header");
      const nav = header.querySelector(".nav");
      const menu = nav?.querySelector(".nav-menu");
      if (!nav || !menu || nav.querySelector(".cm-topic-nav-right")) return;
      menu.querySelectorAll(".nav-menu-item").forEach((link) => {
        const label = link.textContent.trim();
        const children = topicSubmenus[label];
        if (!children) return;
        const group = document.createElement("div");
        group.className = "cm-topic-nav-group";
        const toggle = document.createElement("button");
        toggle.type = "button";
        toggle.className = "cm-topic-nav-caret";
        toggle.setAttribute("aria-label", `展开${label}分类`);
        toggle.setAttribute("aria-expanded", "false");
        toggle.textContent = "⌄";
        const submenu = document.createElement("div");
        submenu.className = "cm-topic-submenu";
        submenu.setAttribute("aria-label", `${label}分类`);
        children.forEach(([title, href]) => {
          const child = document.createElement("a");
          child.href = href;
          child.textContent = title;
          submenu.appendChild(child);
        });
        toggle.addEventListener("click", (event) => {
          event.preventDefault();
          const next = group.dataset.open !== "true";
          menu.querySelectorAll(".cm-topic-nav-group[data-open='true']").forEach((item) => {
            item.dataset.open = "false";
            item.querySelector("button")?.setAttribute("aria-expanded", "false");
          });
          group.dataset.open = String(next);
          toggle.setAttribute("aria-expanded", String(next));
        });
        link.before(group);
        group.append(link, toggle, submenu);
      });
      document.addEventListener("click", (event) => {
        if (event.target.closest(".cm-topic-nav-group")) return;
        menu.querySelectorAll(".cm-topic-nav-group[data-open='true']").forEach((group) => {
          group.dataset.open = "false";
          group.querySelector("button")?.setAttribute("aria-expanded", "false");
        });
      });
      const right = document.createElement("div");
      right.className = "nav-right cm-topic-nav-right";
      const search = document.createElement("button");
      search.type = "button";
      search.className = "cm-topic-search-button";
      search.setAttribute("aria-label", "搜索文章");
      search.innerHTML = '<span aria-hidden="true">⌕</span><b>搜索</b><kbd>Ctrl K</kbd>';
      const theme = document.createElement("button");
      theme.type = "button";
      theme.className = "cm-topic-theme-toggle";
      const applyTheme = (value, persist) => {
        document.documentElement.dataset.cmTheme = value;
        theme.textContent = value === "dark" ? "☀" : "◐";
        theme.setAttribute("aria-label", value === "dark" ? "切换到浅色模式" : "切换到深色模式");
        if (persist) { try { localStorage.setItem("cm-theme", value); } catch (error) {} }
      };
      let savedTheme = null;
      try { savedTheme = localStorage.getItem("cm-theme"); } catch (error) {}
      applyTheme(savedTheme === "dark" || savedTheme === "light" ? savedTheme : (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"), false);
      theme.addEventListener("click", () => applyTheme(document.documentElement.dataset.cmTheme === "dark" ? "light" : "dark", true));
      const dialog = document.createElement("div");
      dialog.className = "cm-topic-search-dialog";
      dialog.hidden = true;
      dialog.innerHTML = '<div class="cm-topic-search-panel" role="dialog" aria-modal="true" aria-label="搜索文章"><div><span aria-hidden="true">⌕</span><input type="search" placeholder="搜索标题或标签…" autocomplete="off"><button type="button" aria-label="关闭搜索">Esc</button></div><section aria-live="polite"></section></div>';
      const input = dialog.querySelector("input");
      const results = dialog.querySelector("section");
      const close = () => { dialog.hidden = true; search.focus(); };
      let indexPromise = null;
      const renderSearch = () => {
        const query = input.value.trim().toLowerCase();
        if (!query) { results.replaceChildren(); return; }
        indexPromise = indexPromise || fetch("/search.json").then((response) => response.json()).catch(() => []);
        indexPromise.then((items) => {
          const matches = (Array.isArray(items) ? items : []).filter((item) => `${item.title || ""} ${item.content || ""} ${item.tags || ""}`.toLowerCase().includes(query)).slice(0, 8);
          results.replaceChildren();
          if (!matches.length) { results.textContent = "没有匹配的文章。"; return; }
          matches.forEach((item) => {
            const link = document.createElement("a");
            link.href = item.url || "/";
            const title = document.createElement("strong");
            title.textContent = item.title || "未命名文章";
            const meta = document.createElement("span");
            meta.textContent = item.tags || item.categories || "文章";
            link.append(title, meta);
            results.appendChild(link);
          });
        });
      };
      const open = () => { dialog.hidden = false; input.value = ""; results.replaceChildren(); requestAnimationFrame(() => input.focus()); };
      search.addEventListener("click", open);
      input.addEventListener("input", renderSearch);
      dialog.querySelector("button").addEventListener("click", close);
      dialog.addEventListener("click", (event) => { if (event.target === dialog) close(); });
      document.addEventListener("keydown", (event) => {
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); dialog.hidden ? open() : close(); }
        if (event.key === "Escape" && !dialog.hidden) close();
      });
      right.append(search, menu, theme);
      nav.appendChild(right);
      document.body.appendChild(dialog);
    }

    function ensureDossierStyles() {
      if (document.querySelector('link[data-cm-topic-dossier]')) return;
      const stylesheet = document.createElement("link");
      stylesheet.rel = "stylesheet";
      stylesheet.href = "/css/topic-dossier.css?v=20260826.3";
      stylesheet.dataset.cmTopicDossier = "true";
      document.head.appendChild(stylesheet);
    }

    ensureDossierStyles();
    ensureTopicHeader();

    function renderDossier(tag, matches) {
      if (!tag) return false;
      ensureDossierStyles();
      document.body.classList.add("cm-topic-dossier");
      document.body.dataset.topicSection = tag.section || "cross-section";
      page.dataset.topicSection = tag.section || "cross-section";
      document.title = `${tag.name} | ${sectionNames[tag.section] || "专题"} | Computational Mathematics Workspace`;
      const title = document.querySelector("[data-topic-title], .cm-tags-shell > h1");
      const lead = document.querySelector("[data-topic-description], .cm-tags-lead");
      const kicker = document.querySelector(".cm-tags-kicker");
      if (title) title.textContent = tag.name;
      if (lead) lead.textContent = tag.description;
      if (kicker) kicker.textContent = `${sectionNames[tag.section] || "交叉主题"} / TOPIC DOSSIER`;
      if (grid) grid.hidden = true;
      filterButtons.forEach((button) => { button.hidden = true; });

      const previous = page.querySelector(".cm-topic-dossier-content");
      if (previous) previous.remove();
      const sectionName = sectionNames[tag.section] || "标签索引";
      const sectionLink = sectionLinks[tag.section] || "/tags/";
      const indexLink = tag.section ? `/tags/?section=${encodeURIComponent(tag.section)}` : "/tags/";
      const dossier = document.createElement("div");
      dossier.className = "cm-topic-dossier-content";
      dossier.innerHTML = `
        <nav class="cm-topic-breadcrumb" aria-label="专题路径">
          <a href="${sectionLink}">${sectionName}</a><span aria-hidden="true">/</span><a href="${indexLink}">专题索引</a><span aria-hidden="true">/</span><strong>${tag.name}</strong>
        </nav>
        <section class="cm-topic-brief" aria-label="专题定位">
          <span>TOPIC TYPE / ${tag.type.toUpperCase()}</span>
          <p>${tag.description}</p>
          <a href="/tags/">查看交叉标签 <i aria-hidden="true">↗</i></a>
        </section>
        <section class="cm-topic-archive" aria-label="文章归档">
          <header><span>ARTICLE ARCHIVE</span><h2>文章归档</h2><b>${String(matches.length).padStart(2, "0")} POSTS</b></header>
          <div class="cm-topic-posts">${matches.length ? matches.map((post) => `<a class="cm-topic-post" href="${post.url}"><small>${post.category}</small><strong>${post.title}</strong><i aria-hidden="true">↗</i></a>`).join("") : '<div class="cm-topic-empty"><span>ARCHIVE PENDING</span><h3>尚无归档文章</h3><p>专题已建立；后续文章将归入此处，并同步出现在标签检索中。</p></div>'}</div>
        </section>`;
      const anchor = document.querySelector(".cm-tags-toolbar, [data-topic-posts]");
      if (anchor) anchor.after(dossier); else page.appendChild(dossier);
      return true;
    }
    function renderTags(type) {
      if (!grid) return;
      const shown = tags.filter((tag) => (type === "all" || tag.type === type) && (!requestedSection || tag.section === requestedSection) && (!requestedTopic || tag.slug === requestedTopic));
      grid.innerHTML = shown.map((tag) => `
        <a class="cm-tag-card" href="${tag.section ? `/tags/?section=${encodeURIComponent(tag.section)}&topic=${encodeURIComponent(tag.slug)}` : `/topics/${tag.slug}/`}">
          <small>${tag.type}</small><strong>${tag.name}</strong><span>${tag.description}</span>
        </a>`).join("");
    }
    function renderPosts() {
      if (!postsRoot || !topic) return;
      const tag = tags.find((item) => item.slug === topic);
      const matches = posts.filter((post) => post.tags.includes(topic));
      if (renderDossier(tag, matches)) postsRoot.hidden = true;
      else postsRoot.innerHTML = "<p>该专题暂时还没有文章。</p>";
    }
    filterButtons.forEach((button) => button.addEventListener("click", () => { filterButtons.forEach((item) => item.setAttribute("aria-pressed", String(item === button))); renderTags(button.dataset.tagType); }));
    const requestedTag = requestedTopic && requestedSection
      ? tags.find((item) => item.slug === requestedTopic && item.section === requestedSection)
      : null;
    if (requestedTag) {
      renderDossier(requestedTag, posts.filter((post) => post.tags.includes(requestedTag.slug)));
    } else {
      renderTags("all");
      renderPosts();
      if (!topic && requestedSection) {
        const title = document.querySelector(".cm-tags-shell > h1");
        const lead = document.querySelector(".cm-tags-lead");
        if (title) title.textContent = sectionNames[requestedSection] || "标签索引";
        if (lead) lead.textContent = "按当前主栏目浏览其固定二级目录。";
      }
    }
  }).catch(() => {
    const root = document.querySelector("[data-tags-grid], [data-topic-posts]");
    if (root) root.innerHTML = "<p>标签索引暂时不可用，请稍后重试。</p>";
  });
})();
