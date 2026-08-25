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
    function renderTags(type) {
      if (!grid) return;
      grid.innerHTML = tags.filter((tag) => type === "all" || tag.type === type).map((tag) => `
        <a class="cm-tag-card" href="/topics/${tag.slug}/">
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
  }).catch(() => {
    const root = document.querySelector("[data-tags-grid], [data-topic-posts]");
    if (root) root.innerHTML = "<p>标签索引暂时不可用，请稍后重试。</p>";
  });
})();
