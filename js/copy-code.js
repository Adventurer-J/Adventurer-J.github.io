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

  function initialize() {
    initializeCodeCopy();
    initializeNestedNavigation();
    initializeTheme();
    initializeResearchFilters();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();
