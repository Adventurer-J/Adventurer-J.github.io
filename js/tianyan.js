(function () {
  "use strict";

  function initializeNovelReading() {
    const novel = document.querySelector("#novel");
    if (!novel) return;

    const tocLinks = Array.from(document.querySelectorAll("#TOC a[href^='#']"));
    const headings = tocLinks
      .map((link) => document.getElementById(decodeURIComponent(link.hash.slice(1))))
      .filter(Boolean);
    const linkById = new Map(tocLinks.map((link) => [decodeURIComponent(link.hash.slice(1)), link]));

    if ("IntersectionObserver" in window && headings.length) {
      const visible = new Map();
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visible.set(entry.target.id, entry.boundingClientRect.top);
          else visible.delete(entry.target.id);
        });
        const current = Array.from(visible.entries()).sort((a, b) => Math.abs(a[1]) - Math.abs(b[1]))[0];
        if (!current) return;
        tocLinks.forEach((link) => link.removeAttribute("aria-current"));
        const active = linkById.get(current[0]);
        if (active) active.setAttribute("aria-current", "true");
      }, { rootMargin: "-18% 0px -68% 0px", threshold: [0, 1] });
      headings.forEach((heading) => observer.observe(heading));
    }

    let progressFrame = 0;
    function updateProgress() {
      progressFrame = 0;
      const rect = novel.getBoundingClientRect();
      const start = scrollY + rect.top - innerHeight * .28;
      const end = start + novel.offsetHeight - innerHeight * .45;
      const progress = Math.max(0, Math.min(1, (scrollY - start) / Math.max(1, end - start)));
      document.documentElement.style.setProperty("--ty-read-progress", `${(progress * 100).toFixed(2)}%`);
    }
    function requestProgress() {
      if (!progressFrame) progressFrame = requestAnimationFrame(updateProgress);
    }
    addEventListener("scroll", requestProgress, { passive: true });
    addEventListener("resize", requestProgress, { passive: true });
    updateProgress();

    const figures = Array.from(novel.querySelectorAll(".cm-tianyan-illustration"));
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      figures.forEach((figure) => figure.classList.add("is-visible"));
      return;
    }
    document.documentElement.classList.add("cm-tianyan-motion-ready");
    const figureObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "80px 0px", threshold: .12 });
    figures.forEach((figure) => figureObserver.observe(figure));
  }

  function initializeArchiveCard() {
    const entry = document.querySelector(".cm-sci-fi-entry");
    if (!entry || !matchMedia("(hover:hover) and (pointer:fine)").matches) return;
    entry.addEventListener("pointermove", (event) => {
      const rect = entry.getBoundingClientRect();
      entry.style.setProperty("--entry-x", `${((event.clientX - rect.left) / rect.width * 100).toFixed(1)}%`);
      entry.style.setProperty("--entry-y", `${((event.clientY - rect.top) / rect.height * 100).toFixed(1)}%`);
    }, { passive: true });
  }

  function initialize() {
    initializeNovelReading();
    initializeArchiveCard();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true });
  else initialize();
})();
