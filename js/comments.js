(function () {
  "use strict";

  if (window.__cmReaderCommentsInitialized) return;
  window.__cmReaderCommentsInitialized = true;

  var repository = "Adventurer-J/Adventurer-J.github.io";
  var repositoryUrl = "https://github.com/" + repository;
  var apiRoot = "https://api.github.com/repos/" + repository;
  var path = location.pathname.replace(/\/+$/, "") + "/";
  var knownThreads = {
    "/Sci-Fi/tianyan/": 19,
    "/2025/01/16/hello/": 20
  };

  function articleTitle() {
    var heading = document.querySelector(".post-title, .cm-tianyan-hero .post-title, article h1");
    return (heading && heading.textContent.trim()) || document.title.split("|")[0].trim() || "未命名文章";
  }

  function issueConfig(number) {
    return {
      number: number,
      url: repositoryUrl + "/issues/" + number,
      endpoint: apiRoot + "/issues/" + number + "/comments?per_page=100"
    };
  }

  function newThreadConfig() {
    var title = "《" + articleTitle() + "》读者讨论 / READER / " + path;
    var body = "这是文章《" + articleTitle() + "》的公开读者讨论线程。\n\n对应页面：" + location.href.split("#")[0].split("?")[0] + "\n\n评论会由网页端只读同步展示；网页不会保存 GitHub 登录令牌。";
    return {
      title: title,
      createUrl: repositoryUrl + "/issues/new?title=" + encodeURIComponent(title) + "&body=" + encodeURIComponent(body),
      searchUrl: "https://api.github.com/search/issues?q=" + encodeURIComponent("repo:" + repository + " is:issue in:title \"" + path + "\"")
    };
  }

  function createCommentsRoot(thread) {
    var article = document.querySelector("article.post-content");
    if (!article) return null;
    var section = document.createElement("section");
    section.className = "cm-reader-comments cm-tianyan-comments cm-glass";
    section.id = "comments";
    section.setAttribute("data-cm-comments", "");
    section.setAttribute("aria-labelledby", "cm-comments-title");
    if (thread) {
      section.setAttribute("data-comments-endpoint", thread.endpoint);
      section.setAttribute("data-comments-issue-url", thread.url);
    }
    var number = thread ? thread.number : "--";
    section.innerHTML = '<div class="cm-tianyan-comments-head"><div><p class="cm-tianyan-comments-kicker">READER TRANSMISSION / 读者回波</p><h2 id="cm-comments-title">留下你的观测记录</h2><p>关于文章内容与方法的讨论，会从 GitHub 安全同步到这里。</p></div><div class="cm-tianyan-comments-signal" aria-label="评论区状态"><span><i aria-hidden="true"></i><b data-comments-count>--</b> 回波</span><span data-comments-thread>ISSUE / ' + number + '</span></div></div><div class="cm-tianyan-comments-toolbar"><a class="cm-tianyan-comment-compose" href="#" target="_blank" rel="noopener noreferrer">登录 GitHub 发表评论 <span aria-hidden="true">↗</span></a><button class="cm-tianyan-comment-refresh" type="button" data-comments-refresh><i aria-hidden="true"></i><span>同步最新回波</span></button><span class="cm-tianyan-comments-status" data-comments-status aria-live="polite">接近评论区时自动建立中继</span></div><div class="cm-tianyan-comments-body" data-comments-body aria-live="polite" aria-busy="true"><div class="cm-tianyan-comments-loading" data-comments-loading><div class="cm-tianyan-comment-wave" aria-hidden="true"><b></b><b></b><b></b><b></b><b></b><b></b><b></b></div><div><strong>正在监听读者回波</strong><span>CONNECTING TO GITHUB</span></div></div><ol class="cm-tianyan-comments-list" data-comments-list hidden></ol><div class="cm-tianyan-comments-empty" data-comments-empty hidden><span aria-hidden="true">∿</span><div><strong>尚未收到回波</strong><p>成为第一位留下观测记录的读者。</p></div></div><div class="cm-tianyan-comments-error" data-comments-error hidden><span>LINK INTERRUPTED</span><div><strong>暂时无法读取 GitHub 评论</strong><p data-comments-error-message>请稍后重新同步，或直接进入讨论页。</p></div><button type="button" data-comments-retry>重新连接</button></div></div><p class="cm-tianyan-comments-note">评论公开存储在对应的 GitHub Issue。发表需要 GitHub 账号；返回本页后会自动同步，不会在网页中保存登录令牌。</p>';
    var anchor = article.querySelector(".post-inner");
    if (anchor) anchor.insertAdjacentElement("afterend", section);
    else article.appendChild(section);
    return section;
  }

  var mappedIssue = knownThreads[path];
  var mappedThread = mappedIssue ? issueConfig(mappedIssue) : null;
  var root = document.querySelector("[data-cm-comments]") || createCommentsRoot(mappedThread);
  if (!root) return;

  root.classList.add("cm-reader-comments");
  var endpoint = root.getAttribute("data-comments-endpoint") || (mappedThread && mappedThread.endpoint) || "";
  var issueUrl = root.getAttribute("data-comments-issue-url") || (mappedThread && mappedThread.url) || "";
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
  var compose = root.querySelector(".cm-tianyan-comment-compose");
  var threadLabel = root.querySelector("[data-comments-thread]") || root.querySelector(".cm-tianyan-comments-signal span:last-child");
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
  var resolving = false;

  function configureThread(thread) {
    endpoint = thread.endpoint;
    issueUrl = thread.url;
    root.setAttribute("data-comments-endpoint", endpoint);
    root.setAttribute("data-comments-issue-url", issueUrl);
    compose.href = issueUrl + "#new_comment_field";
    compose.firstChild.nodeValue = "登录 GitHub 发表评论 ";
    if (threadLabel) threadLabel.textContent = "ISSUE / " + thread.number;
  }

  if (mappedThread) configureThread(mappedThread);
  else if (!endpoint) {
    var pendingThread = newThreadConfig();
    compose.href = pendingThread.createUrl;
    compose.firstChild.nodeValue = "创建 GitHub 讨论 ";
    if (threadLabel) threadLabel.textContent = "THREAD / AUTO";
  }

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

  function initializeCommentParticles() {
    var reduced = matchMedia("(prefers-reduced-motion: reduce)");
    var forcedColors = matchMedia("(forced-colors: active)");
    if (reduced.matches || forcedColors.matches) return;

    var canvas = document.createElement("canvas");
    canvas.className = "cm-tianyan-comments-particles";
    canvas.setAttribute("aria-hidden", "true");
    root.prepend(canvas);
    var context = canvas.getContext("2d");
    if (!context) {
      canvas.remove();
      return;
    }

    var coarse = matchMedia("(pointer: coarse)").matches;
    var finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
    var pointer = { x: -999, y: -999, active: false, energy: 0 };
    var nodes = [];
    var links = [];
    var packets = [];
    var ripples = [];
    var width = 0;
    var height = 0;
    var frame = 0;
    var lastFrame = 0;
    var clock = 0;
    var visible = true;
    var palette = [];
    var glyphs = ["∫", "∇", "Σ", "∞", "λ", "0", "1"];

    function resolvePalette() {
      return document.documentElement.dataset.cmTheme === "dark"
        ? ["86,182,194", "97,175,239", "224,108,117"]
        : ["13,118,116", "57,112,155", "185,82,93"];
    }

    function makeNode(index) {
      var x = width * (.04 + Math.random() * .92);
      var y = height * (.08 + Math.random() * .84);
      return {
        x: x, y: y, homeX: x, homeY: y,
        vx: (Math.random() - .5) * .06,
        vy: (Math.random() - .5) * .06,
        radius: .55 + Math.random() * 1.15,
        depth: .45 + Math.random() * .55,
        phase: Math.random() * Math.PI * 2,
        color: palette[index % palette.length],
        glyph: index % 8 === 0 ? glyphs[index % glyphs.length] : ""
      };
    }

    function rebuild() {
      var count = coarse ? 15 : Math.min(34, Math.max(23, Math.round(width / 38)));
      nodes = Array.from({ length: count }, function (_, index) { return makeNode(index); });
      links = [];
      var seen = new Set();
      nodes.forEach(function (node, index) {
        nodes.map(function (other, otherIndex) {
          return { index: otherIndex, distance: Math.hypot(node.x - other.x, node.y - other.y) };
        }).filter(function (item) { return item.index !== index && item.distance < 190; })
          .sort(function (a, b) { return a.distance - b.distance; })
          .slice(0, index % 4 === 0 ? 2 : 1)
          .forEach(function (item) {
            var a = Math.min(index, item.index);
            var b = Math.max(index, item.index);
            var key = a + ":" + b;
            if (!seen.has(key)) {
              seen.add(key);
              links.push([a, b]);
            }
          });
      });
      packets = Array.from({ length: coarse ? 2 : 4 }, function (_, index) {
        return { edge: index % Math.max(1, links.length), t: Math.random(), speed: .0022 + Math.random() * .0024 };
      });
    }

    function resize() {
      var nextWidth = Math.max(1, root.clientWidth);
      var nextHeight = Math.max(1, root.clientHeight);
      if (nextWidth === width && nextHeight === height) return;
      width = nextWidth;
      height = nextHeight;
      var ratio = Math.min(devicePixelRatio || 1, coarse ? 1.2 : 1.5);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      rebuild();
    }

    function updateNode(node, index) {
      node.vx += (node.homeX - node.x) * .006 + Math.cos(clock + node.phase) * .0009;
      node.vy += (node.homeY - node.y) * .006 + Math.sin(clock * .8 + node.phase) * .0009;
      if (pointer.active) {
        var dx = node.x - pointer.x;
        var dy = node.y - pointer.y;
        var distance = Math.max(18, Math.hypot(dx, dy));
        if (distance < 175) {
          var influence = 1 - distance / 175;
          var force = (.075 + pointer.energy * .09) * influence;
          node.vx += dx / distance * force - dy / distance * .015 * influence;
          node.vy += dy / distance * force + dx / distance * .015 * influence;
        }
      }
      node.vx *= .91;
      node.vy *= .91;
      node.x += node.vx;
      node.y += node.vy;
      return .68 + Math.sin(clock * 1.25 + node.phase + index * .17) * .24;
    }

    function drawLinks(dark) {
      links.forEach(function (link, index) {
        var first = nodes[link[0]];
        var second = nodes[link[1]];
        var midpointX = (first.x + second.x) / 2;
        var midpointY = (first.y + second.y) / 2;
        var near = pointer.active ? Math.max(0, 1 - Math.hypot(midpointX - pointer.x, midpointY - pointer.y) / 190) : 0;
        context.strokeStyle = "rgba(" + palette[index % palette.length] + "," + ((dark ? .075 : .058) + near * .12) + ")";
        context.lineWidth = .5 + near * .45;
        context.beginPath();
        context.moveTo(first.x, first.y);
        context.lineTo(second.x, second.y);
        context.stroke();
      });
      packets.forEach(function (packet, index) {
        if (!links.length) return;
        packet.t += packet.speed * (pointer.active ? 1.55 : 1);
        if (packet.t > 1) {
          packet.t = 0;
          packet.edge = (packet.edge + 1 + index) % links.length;
        }
        var link = links[packet.edge];
        var first = nodes[link[0]];
        var second = nodes[link[1]];
        var x = first.x + (second.x - first.x) * packet.t;
        var y = first.y + (second.y - first.y) * packet.t;
        var glow = context.createRadialGradient(x, y, 0, x, y, 8);
        glow.addColorStop(0, "rgba(" + palette[index % palette.length] + ",.68)");
        glow.addColorStop(1, "rgba(" + palette[index % palette.length] + ",0)");
        context.fillStyle = glow;
        context.beginPath();
        context.arc(x, y, 8, 0, Math.PI * 2);
        context.fill();
      });
    }

    function drawPointerField(dark) {
      if (!pointer.active || !finePointer) return;
      var halo = context.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, 130);
      halo.addColorStop(0, "rgba(" + palette[0] + "," + (dark ? .09 : .055) + ")");
      halo.addColorStop(1, "rgba(" + palette[0] + ",0)");
      context.fillStyle = halo;
      context.beginPath();
      context.arc(pointer.x, pointer.y, 130, 0, Math.PI * 2);
      context.fill();
      context.save();
      context.translate(pointer.x, pointer.y);
      context.rotate(clock * .42);
      context.strokeStyle = "rgba(" + palette[0] + "," + (dark ? .18 : .13) + ")";
      context.lineWidth = .65;
      context.beginPath();
      context.arc(0, 0, 38 + pointer.energy * 10, .2, Math.PI * 1.52);
      context.stroke();
      context.rotate(-clock * .9);
      context.strokeStyle = "rgba(" + palette[1] + "," + (dark ? .12 : .09) + ")";
      context.beginPath();
      context.arc(0, 0, 61 + pointer.energy * 14, Math.PI * .55, Math.PI * 1.9);
      context.stroke();
      context.restore();
    }

    function drawRipples() {
      ripples = ripples.filter(function (ripple) {
        ripple.radius += 2.25;
        ripple.life -= .027;
        if (ripple.life <= 0) return false;
        context.strokeStyle = "rgba(" + ripple.color + "," + (ripple.life * .34) + ")";
        context.lineWidth = .7 + ripple.life;
        context.beginPath();
        context.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
        context.stroke();
        return true;
      });
    }

    function draw(now) {
      frame = 0;
      if (!visible || document.hidden) return;
      var interval = coarse ? 50 : 33;
      if (now - lastFrame < interval) {
        frame = requestAnimationFrame(draw);
        return;
      }
      lastFrame = now;
      clock += interval * .001;
      pointer.energy *= .94;
      context.clearRect(0, 0, width, height);
      var dark = document.documentElement.dataset.cmTheme === "dark";
      context.globalCompositeOperation = dark ? "screen" : "source-over";
      drawLinks(dark);
      nodes.forEach(function (node, index) {
        var pulse = updateNode(node, index);
        if (node.glyph) {
          context.font = (9 + node.depth * 6) + 'px "Fira Code", ui-monospace, monospace';
          context.fillStyle = "rgba(" + node.color + "," + ((dark ? .13 : .085) * pulse) + ")";
          context.fillText(node.glyph, node.x, node.y);
        } else {
          context.fillStyle = "rgba(" + node.color + "," + ((dark ? .46 : .32) * pulse) + ")";
          context.beginPath();
          context.arc(node.x, node.y, node.radius * node.depth, 0, Math.PI * 2);
          context.fill();
        }
      });
      drawPointerField(dark);
      drawRipples();
      context.globalCompositeOperation = "source-over";
      start();
    }

    function start() {
      if (!frame && visible && !document.hidden && !reduced.matches && !forcedColors.matches) frame = requestAnimationFrame(draw);
    }

    function stop() {
      cancelAnimationFrame(frame);
      frame = 0;
    }

    if (finePointer) {
      root.addEventListener("pointermove", function (event) {
        var rect = root.getBoundingClientRect();
        var nextX = event.clientX - rect.left;
        var nextY = event.clientY - rect.top;
        var speed = pointer.active ? Math.hypot(nextX - pointer.x, nextY - pointer.y) : 0;
        pointer.x = nextX;
        pointer.y = nextY;
        pointer.active = true;
        pointer.energy += (Math.min(1, speed / 34) - pointer.energy) * .6;
      }, { passive: true });
      root.addEventListener("pointerleave", function () {
        pointer.active = false;
        pointer.energy = 0;
      }, { passive: true });
    }
    root.addEventListener("pointerdown", function (event) {
      var rect = root.getBoundingClientRect();
      ripples.push({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        radius: 4,
        life: 1,
        color: palette[ripples.length % palette.length]
      });
      if (ripples.length > 4) ripples.shift();
    }, { passive: true });

    palette = resolvePalette();
    resize();
    start();
    if ("ResizeObserver" in window) new ResizeObserver(resize).observe(root);
    else addEventListener("resize", resize, { passive: true });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible) start();
        else stop();
      }, { rootMargin: "160px" }).observe(root);
    }
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop();
      else start();
    });
    document.addEventListener("cm:themechange", function () {
      palette = resolvePalette();
      nodes.forEach(function (node, index) { node.color = palette[index % palette.length]; });
    });
    if ("MutationObserver" in window) {
      new MutationObserver(function () {
        palette = resolvePalette();
        nodes.forEach(function (node, index) { node.color = palette[index % palette.length]; });
      }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-cm-theme"] });
    }
    addEventListener("pagehide", stop);
  }

  initializeCommentParticles();

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
    if (response && response.status === 404) return "本文的评论源暂不可用，可直接进入对应的 GitHub Issue。";
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
    if (syncing) return Promise.resolve();
    if (!endpoint) return resolveThread();
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

  function showThreadBootstrap(config) {
    compose.href = config.createUrl;
    compose.firstChild.nodeValue = "创建 GitHub 讨论 ";
    if (threadLabel) threadLabel.textContent = "THREAD / NEW";
    count.textContent = "00";
    setHidden(loading, true);
    setHidden(list, true);
    setHidden(error, true);
    setHidden(empty, false);
    var strong = empty.querySelector("strong");
    var paragraph = empty.querySelector("p");
    if (strong) strong.textContent = "这篇文章还没有讨论线程";
    if (paragraph) paragraph.textContent = "在 GitHub 创建后，评论会自动回到这里。";
    body.setAttribute("aria-busy", "false");
    status.textContent = "等待第一位读者建立中继";
  }

  function resolveThread() {
    if (resolving || endpoint) return endpoint ? syncComments() : Promise.resolve();
    resolving = true;
    var config = newThreadConfig();
    status.textContent = "正在定位本文讨论线程…";
    showInitialLoading();
    return fetch(config.searchUrl, {
      headers: { Accept: "application/vnd.github+json" },
      cache: "no-store"
    }).then(function (response) {
      if (!response.ok) {
        var searchError = new Error("GitHub search " + response.status);
        searchError.response = response;
        throw searchError;
      }
      return response.json();
    }).then(function (payload) {
      var items = payload && Array.isArray(payload.items) ? payload.items : [];
      var issue = items.find(function (item) { return item.title === config.title && !item.pull_request; });
      if (!issue) {
        showThreadBootstrap(config);
        return;
      }
      configureThread(issueConfig(issue.number));
      return syncComments();
    }).catch(function (searchError) {
      showThreadBootstrap(config);
      status.textContent = "未能定位线程 · 可直接在 GitHub 建立";
    }).finally(function () {
      resolving = false;
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
