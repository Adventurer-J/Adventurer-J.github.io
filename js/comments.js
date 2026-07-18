(function () {
  "use strict";

  var root = document.querySelector("[data-cm-comments]");
  if (!root) return;

  var endpoint = root.getAttribute("data-comments-endpoint");
  var issueUrl = root.getAttribute("data-comments-issue-url");
  var body = root.querySelector("[data-comments-body]");
  var loading = root.querySelector("[data-comments-loading]");
  var list = root.querySelector("[data-comments-list]");
  var empty = root.querySelector("[data-comments-empty]");
  var error = root.querySelector("[data-comments-error]");
  var errorMessage = root.querySelector("[data-comments-error-message]");
  var count = root.querySelector("[data-comments-count]");
  var status = root.querySelector("[data-comments-status]");
  var refresh = root.querySelector("[data-comments-refresh]");
  var retry = root.querySelector("[data-comments-retry]");
  var formatter = new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
  var controller = null;
  var hasLoaded = false;
  var syncing = false;
  var lastSync = 0;

  function setHidden(element, hidden) {
    if (element) element.hidden = hidden;
  }

  function showInitialLoading() {
    setHidden(loading, false);
    setHidden(list, true);
    setHidden(empty, true);
    setHidden(error, true);
    body.setAttribute("aria-busy", "true");
  }

  function avatarUrl(url) {
    if (!url) return "/images/logo.svg";
    try {
      var parsed = new URL(url);
      parsed.searchParams.set("s", "96");
      return parsed.toString();
    } catch (_) {
      return url;
    }
  }

  function createComment(comment, index) {
    var item = document.createElement("li");
    var article = document.createElement("article");
    var avatarLink = document.createElement("a");
    var avatar = document.createElement("img");
    var content = document.createElement("div");
    var meta = document.createElement("header");
    var identity = document.createElement("div");
    var author = document.createElement("a");
    var time = document.createElement("time");
    var permalink = document.createElement("a");
    var text = document.createElement("div");

    var user = comment.user || {};
    var authorUrl = user.html_url || "https://github.com/";
    var commentUrl = comment.html_url || issueUrl;
    var createdAt = comment.created_at ? new Date(comment.created_at) : new Date();

    item.className = "cm-tianyan-comment";
    item.style.setProperty("--comment-delay", Math.min(index * 45, 360) + "ms");
    article.className = "cm-tianyan-comment-card";

    avatarLink.className = "cm-tianyan-comment-avatar";
    avatarLink.href = authorUrl;
    avatarLink.target = "_blank";
    avatarLink.rel = "noopener noreferrer nofollow";
    avatarLink.setAttribute("aria-label", "查看 " + (user.login || "GitHub 用户") + " 的 GitHub 主页");
    avatar.src = avatarUrl(user.avatar_url);
    avatar.alt = "";
    avatar.width = 44;
    avatar.height = 44;
    avatar.loading = "lazy";
    avatarLink.appendChild(avatar);

    content.className = "cm-tianyan-comment-content";
    meta.className = "cm-tianyan-comment-meta";
    identity.className = "cm-tianyan-comment-identity";
    author.href = authorUrl;
    author.target = "_blank";
    author.rel = "noopener noreferrer nofollow";
    author.textContent = user.login || "ghost";
    time.dateTime = comment.created_at || "";
    time.textContent = formatter.format(createdAt);
    identity.appendChild(author);

    if (comment.author_association === "OWNER") {
      var owner = document.createElement("span");
      owner.className = "cm-tianyan-comment-owner";
      owner.textContent = "作者";
      identity.appendChild(owner);
    }

    identity.appendChild(time);
    permalink.className = "cm-tianyan-comment-permalink";
    permalink.href = commentUrl;
    permalink.target = "_blank";
    permalink.rel = "noopener noreferrer nofollow";
    permalink.textContent = "ECHO / " + String(index + 1).padStart(2, "0");
    permalink.setAttribute("aria-label", "在 GitHub 查看第 " + (index + 1) + " 条评论");
    meta.appendChild(identity);
    meta.appendChild(permalink);

    text.className = "cm-tianyan-comment-text";
    text.textContent = comment.body || "（空白回波）";
    content.appendChild(meta);
    content.appendChild(text);
    article.appendChild(avatarLink);
    article.appendChild(content);
    item.appendChild(article);
    return item;
  }

  function renderComments(comments) {
    list.replaceChildren();
    comments.forEach(function (comment, index) {
      list.appendChild(createComment(comment, index));
    });

    count.textContent = String(comments.length).padStart(2, "0");
    setHidden(loading, true);
    setHidden(error, true);
    setHidden(list, comments.length === 0);
    setHidden(empty, comments.length !== 0);
    body.setAttribute("aria-busy", "false");
    root.classList.add("is-comments-ready");
  }

  function describeError(response) {
    if (!navigator.onLine) return "当前处于离线状态，恢复网络后可重新同步。";
    if (response && response.status === 403) return "GitHub 公共接口请求频率暂时达到上限，可直接进入讨论页查看。";
    if (response && response.status === 404) return "评论源暂不可用，可直接进入 GitHub Issue #19。";
    return "中继暂时没有响应，请稍后重试或直接进入讨论页。";
  }

  function showError(message) {
    if (!hasLoaded) {
      setHidden(loading, true);
      setHidden(list, true);
      setHidden(empty, true);
      setHidden(error, false);
      body.setAttribute("aria-busy", "false");
    }
    errorMessage.textContent = message;
  }

  function syncComments() {
    if (syncing || !endpoint) return Promise.resolve();
    syncing = true;
    root.classList.add("is-comments-syncing");
    refresh.disabled = true;
    status.textContent = "正在同步 GitHub 回波…";
    if (!hasLoaded) showInitialLoading();

    if (controller) controller.abort();
    controller = typeof AbortController === "function" ? new AbortController() : null;

    return fetch(endpoint, {
      headers: { Accept: "application/vnd.github+json" },
      cache: "no-store",
      signal: controller ? controller.signal : undefined
    }).then(function (response) {
      if (!response.ok) {
        var httpError = new Error("GitHub API " + response.status);
        httpError.response = response;
        throw httpError;
      }
      return response.json();
    }).then(function (comments) {
      if (!Array.isArray(comments)) throw new Error("Invalid comments payload");
      renderComments(comments);
      hasLoaded = true;
      lastSync = Date.now();
      status.textContent = comments.length
        ? "已同步 " + comments.length + " 条回波"
        : "中继在线 · 等待第一条回波";
    }).catch(function (requestError) {
      if (requestError && requestError.name === "AbortError") return;
      var message = describeError(requestError && requestError.response);
      showError(message);
      status.textContent = hasLoaded ? "同步失败 · 保留上次结果" : "连接中断";
    }).finally(function () {
      syncing = false;
      root.classList.remove("is-comments-syncing");
      refresh.disabled = false;
    });
  }

  refresh.addEventListener("click", syncComments);
  retry.addEventListener("click", syncComments);

  document.addEventListener("visibilitychange", function () {
    if (!document.hidden && hasLoaded && Date.now() - lastSync > 5000) syncComments();
  });
  window.addEventListener("online", function () {
    if (root.getBoundingClientRect().top < innerHeight * 1.5) syncComments();
  }, { passive: true });

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      if (!entries.some(function (entry) { return entry.isIntersecting; })) return;
      observer.disconnect();
      syncComments();
    }, { rootMargin: "700px 0px" });
    observer.observe(root);
  } else {
    syncComments();
  }
})();
