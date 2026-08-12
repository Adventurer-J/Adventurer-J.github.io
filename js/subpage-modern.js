/* Shared enhancements for archive, guide, welcome, and story pages. */
(function () {
  "use strict";

  const path = decodeURIComponent(location.pathname).replace(/\/+$/, "/");
  const type = path.startsWith("/Sci-Fi/tianyan/")
    ? "story"
    : path.startsWith("/blog/")
      ? "archive"
      : path.includes("markdown-preview-enhanced-computational-math-theme")
        ? "guide"
        : "welcome";

  document.documentElement.classList.add("cm-subpage-active");
  document.body.classList.add("cm-subpage-modern", `cm-subpage-${type}`);

  const stylesheet = document.querySelector('link[href*="/css/subpage-modern.css"]');
  if (stylesheet) document.head.appendChild(stylesheet);

  document.querySelectorAll(".cm-symbol-field, .cm-particle-canvas--subpage").forEach((node) => node.remove());

  const routeLabels = {
    story: "SCI-FI / TIAN YAN",
    archive: "ARCHIVE / NOTES",
    guide: "GUIDE / MARKDOWN",
    welcome: "ENTRY / OPEN GARDEN"
  };

  if (!document.querySelector(".cm-subpage-route")) {
    const route = document.createElement("div");
    route.className = "cm-subpage-route";
    route.setAttribute("aria-hidden", "true");
    route.textContent = routeLabels[type];
    document.body.appendChild(route);
  }

  if (type !== "story") {
    document.querySelectorAll(".post-content__body h2").forEach((heading, index) => {
      if (!heading.dataset.spIndex) heading.dataset.spIndex = String(index + 1).padStart(2, "0");
    });
  }

  document.querySelectorAll('.post-content__body a[target="_blank"]').forEach((link) => {
    const values = new Set((link.getAttribute("rel") || "").split(/\s+/).filter(Boolean));
    values.add("noopener");
    values.add("noreferrer");
    link.setAttribute("rel", Array.from(values).join(" "));
  });

  document.querySelectorAll(".post-content__body img").forEach((image) => {
    if (!image.hasAttribute("loading")) image.loading = "lazy";
    if (!image.hasAttribute("decoding")) image.decoding = "async";
  });

  const updateProgress = () => {
    const max = Math.max(0, document.documentElement.scrollHeight - innerHeight);
    const value = max ? Math.min(1, Math.max(0, scrollY / max)) : 1;
    document.documentElement.style.setProperty("--sp-progress", value.toFixed(4));
  };

  let scheduled = false;
  const requestUpdate = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      updateProgress();
      scheduled = false;
    });
  };

  addEventListener("scroll", requestUpdate, { passive: true });
  addEventListener("resize", requestUpdate, { passive: true });
  updateProgress();
})();
