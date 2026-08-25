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
      if (tag) {
        document.title = `${tag.name} | Computational Mathematics Workspace`;
        const title = document.querySelector("[data-topic-title]");
        const lead = document.querySelector("[data-topic-description]");
        if (title) title.textContent = tag.name;
        if (lead) lead.textContent = tag.description;
      }
      postsRoot.innerHTML = matches.length ? matches.map((post) => `<a class="cm-topic-post" href="${post.url}"><strong>${post.title}</strong><small>${post.category}</small></a>`).join("") : "<p>该专题暂时还没有文章。</p>";
    }
    filterButtons.forEach((button) => button.addEventListener("click", () => { filterButtons.forEach((item) => item.setAttribute("aria-pressed", String(item === button))); renderTags(button.dataset.tagType); }));
    renderTags("all");
    renderPosts();
    if (!topic && requestedSection) {
      const title = document.querySelector(".cm-tags-shell > h1");
      const lead = document.querySelector(".cm-tags-lead");
      const tag = tags.find((item) => item.slug === requestedTopic && item.section === requestedSection);
      if (title) title.textContent = tag ? `${sectionNames[requestedSection]} · ${tag.name}` : (sectionNames[requestedSection] || "标签索引");
      if (lead) lead.textContent = tag ? `${tag.description} 当前为固定目录；文章发布后会在这里聚合。` : "按当前主栏目浏览其固定二级目录。";
      if (requestedTopic && grid) {
        const matches = posts.filter((post) => post.tags.includes(requestedTopic));
        const results = document.createElement("section");
        results.className = "cm-tags-query-results";
        results.innerHTML = matches.length
          ? `<h2>已归档文章</h2>${matches.map((post) => `<a href="${post.url}"><strong>${post.title}</strong><span>${post.category}</span></a>`).join("")}`
          : "<h2>已归档文章</h2><p>该二级主题已建立，暂时还没有文章。</p>";
        grid.after(results);
      }
    }
  }).catch(() => {
    const root = document.querySelector("[data-tags-grid], [data-topic-posts]");
    if (root) root.innerHTML = "<p>标签索引暂时不可用，请稍后重试。</p>";
  });
})();
