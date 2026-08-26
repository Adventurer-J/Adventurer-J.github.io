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

    function ensureDossierStyles() {
      if (document.querySelector('link[data-cm-topic-dossier]')) return;
      const stylesheet = document.createElement("link");
      stylesheet.rel = "stylesheet";
      stylesheet.href = "/css/topic-dossier.css?v=20260826.1";
      stylesheet.dataset.cmTopicDossier = "true";
      document.head.appendChild(stylesheet);
    }

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
