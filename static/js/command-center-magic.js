(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function hashString(str) {
    var h = 0;
    for (var i = 0; i < str.length; i++) {
      h = (h << 5) - h + str.charCodeAt(i);
      h |= 0;
    }
    return Math.abs(h);
  }

  ready(function () {
    initTypedPrompt();
    initAmbientField();
    initCommandPalette();
    initRuntimePulse();
    initAgentFeed();
    initArtifactRail();
    enhanceExecutionLog();
    initTimelineFlow();
  });

  function initTypedPrompt() {
    var el = document.getElementById("typed-command");
    if (!el) return;

    var prompts = [
      "capture --signal --from-real-work --daily",
      "reflect --tradeoffs --context --consequences",
      "publish --small --often --without-perfectionism",
      "build --memory --through-writing --in-public"
    ];

    var p = 0;
    var c = 0;
    var deleting = false;

    function tick() {
      var full = prompts[p];

      if (!deleting) {
        c += 1;
        el.textContent = full.slice(0, c);
        if (c === full.length) {
          deleting = true;
          setTimeout(tick, 1300);
          return;
        }
      } else {
        c -= 1;
        el.textContent = full.slice(0, c);
        if (c === 0) {
          deleting = false;
          p = (p + 1) % prompts.length;
        }
      }

      setTimeout(tick, deleting ? 34 : 50);
    }

    tick();
  }

  function initAmbientField() {
    var canvas = document.getElementById("ambient-field");
    if (!canvas) return;

    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    var ratio = window.devicePixelRatio || 1;
    var dots = [];

    function resize() {
      var w = window.innerWidth;
      var h = window.innerHeight;
      canvas.width = Math.floor(w * ratio);
      canvas.height = Math.floor(h * ratio);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      initDots(w, h);
    }

    function initDots(w, h) {
      dots = [];
      var count = Math.floor((w * h) / 22000);
      for (var i = 0; i < count; i++) {
        dots.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          r: Math.random() * 1.8 + 0.6
        });
      }
    }

    function draw() {
      var w = canvas.clientWidth;
      var h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      for (var i = 0; i < dots.length; i++) {
        var d = dots[i];
        d.x += d.vx;
        d.y += d.vy;

        if (d.x < 0 || d.x > w) d.vx *= -1;
        if (d.y < 0 || d.y > h) d.vy *= -1;

        ctx.fillStyle = "rgba(120, 170, 255, 0.55)";
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
      }

      for (i = 0; i < dots.length; i++) {
        for (var j = i + 1; j < dots.length; j++) {
          var dx = dots[i].x - dots[j].x;
          var dy = dots[i].y - dots[j].y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.strokeStyle = "rgba(112, 226, 255," + (0.14 - dist / 1000) + ")";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize);
    draw();
  }

  function initCommandPalette() {
    var overlay = document.getElementById("command-palette");
    var input = document.getElementById("palette-input");
    var list = document.getElementById("palette-results");
    var trigger = document.getElementById("palette-trigger");

    if (!overlay || !input || !list || !trigger) return;

    var commands = [
      { label: "Go: Home", run: function () { location.href = "/"; } },
      { label: "Go: About", run: function () { location.href = "/about/"; } },
      { label: "Go: Projects", run: function () { location.href = "/projects/"; } },
      { label: "Go: Feed", run: function () { location.href = "/feed.xml"; } },
      { label: "View: Intro Turn", run: function () { scrollToSelector(".turn-system"); } },
      { label: "View: Runtime Telemetry", run: function () { scrollToSelector("#telemetry-turn"); } },
      { label: "View: Latest Artifact", run: function () { scrollToSelector(".turn-artifact"); } },
      { label: "View: Deep Timeline", run: function () { scrollToSelector("#timeline-sentinel"); } },
      { label: "Mode: Toggle Zen", run: function () { document.body.classList.toggle("zen-mode"); } },
      { label: "Action: Surprise Post", run: randomPost }
    ];

    var current = [];
    var activeIndex = 0;

    function open() {
      overlay.classList.add("open");
      overlay.setAttribute("aria-hidden", "false");
      input.value = "";
      render(commands);
      setTimeout(function () { input.focus(); }, 0);
    }

    function close() {
      overlay.classList.remove("open");
      overlay.setAttribute("aria-hidden", "true");
    }

    function render(items) {
      current = items;
      activeIndex = 0;
      list.innerHTML = "";
      for (var i = 0; i < items.length; i++) {
        var li = document.createElement("li");
        li.textContent = items[i].label;
        li.dataset.index = i;
        if (i === 0) li.classList.add("active");
        li.addEventListener("click", function () {
          execute(Number(this.dataset.index));
        });
        list.appendChild(li);
      }
    }

    function execute(index) {
      if (!current[index]) return;
      close();
      current[index].run();
    }

    function move(delta) {
      if (!current.length) return;
      activeIndex = (activeIndex + delta + current.length) % current.length;
      var items = list.querySelectorAll("li");
      for (var i = 0; i < items.length; i++) {
        items[i].classList.toggle("active", i === activeIndex);
      }
    }

    function filter() {
      var q = input.value.toLowerCase().trim();
      if (!q) {
        render(commands);
        return;
      }
      render(commands.filter(function (cmd) {
        return cmd.label.toLowerCase().indexOf(q) > -1;
      }));
    }

    trigger.addEventListener("click", open);
    input.addEventListener("input", filter);

    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) close();
    });

    document.addEventListener("keydown", function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (overlay.classList.contains("open")) close();
        else open();
        return;
      }

      if (!overlay.classList.contains("open")) return;

      if (e.key === "Escape") {
        e.preventDefault();
        close();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        move(1);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        move(-1);
      } else if (e.key === "Enter") {
        e.preventDefault();
        execute(activeIndex);
      }
    });

    function scrollToSelector(selector) {
      var node = document.querySelector(selector);
      if (!node) return;
      node.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function randomPost() {
      var links = Array.prototype.slice.call(document.querySelectorAll(".turn-artifact .log-title, .log-title, .posts a"));
      if (!links.length) return;
      var pick = links[Math.floor(Math.random() * links.length)];
      if (pick && pick.getAttribute("href")) {
        location.href = pick.getAttribute("href");
      }
    }
  }

  function initRuntimePulse() {
    var canvas = document.getElementById("runtime-pulse");
    if (!canvas) return;

    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    var ratio = window.devicePixelRatio || 1;

    function resize() {
      var rect = canvas.getBoundingClientRect();
      canvas.width = Math.floor(rect.width * ratio);
      canvas.height = Math.floor(rect.height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    }

    resize();
    window.addEventListener("resize", resize);

    var phase = 0;

    function draw() {
      var w = canvas.clientWidth;
      var h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      ctx.strokeStyle = "rgba(156, 180, 223, 0.24)";
      for (var gy = 0; gy < h; gy += 24) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(w, gy);
        ctx.stroke();
      }

      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(124, 140, 255, 0.82)";
      ctx.beginPath();
      for (var x = 0; x <= w; x += 3) {
        var y = h * 0.52 + Math.sin((x + phase) * 0.022) * 20 + Math.cos((x - phase * 0.6) * 0.009) * 9;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.lineWidth = 1.4;
      ctx.strokeStyle = "rgba(105, 227, 255, 0.95)";
      ctx.beginPath();
      for (x = 0; x <= w; x += 3) {
        y = h * 0.5 + Math.cos((x + phase * 1.1) * 0.016) * 14;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      phase += 2.5;
      requestAnimationFrame(draw);
    }

    draw();
  }

  function initAgentFeed() {
    var feed = document.getElementById("agent-feed");
    if (!feed) return;

    var lines = [
      "inspecting architecture decisions from prior notes...",
      "compiling edge-case learnings from production runs...",
      "distilling one practical principle per artifact...",
      "updating memory graph with fresh context...",
      "promoting durable insights to execution river...",
      "scheduling next writing checkpoint..."
    ];

    function push(text) {
      var li = document.createElement("li");
      li.textContent = "[" + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + "] " + text;
      feed.prepend(li);
      while (feed.children.length > 7) {
        feed.removeChild(feed.lastChild);
      }
    }

    for (var i = 0; i < 4; i++) push(lines[i]);

    var idx = 4;
    setInterval(function () {
      push(lines[idx % lines.length]);
      idx += 1;
    }, 2400);
  }

  function initArtifactRail() {
    var rail = document.getElementById("artifact-feed");
    if (!rail) return;

    var posts = document.querySelectorAll(".turn-artifact .log-title");
    rail.innerHTML = "";

    if (!posts.length) {
      posts = document.querySelectorAll(".log-title, .memory-nav a");
    }

    var seen = {};
    var count = 0;
    for (var i = 0; i < posts.length && count < 6; i++) {
      var titleNode = posts[i];
      var href = titleNode.getAttribute("href");
      if (!href || seen[href]) continue;
      seen[href] = true;
      var li = document.createElement("li");
      li.innerHTML = "<a href=\"" + href + "\">" + titleNode.textContent + "</a>";
      rail.appendChild(li);
      count += 1;
    }
  }

  function enhanceExecutionLog() {
    var entries = document.querySelectorAll(".log-entry");
    if (!entries.length) return;

    var statuses = [
      { text: "done", color: "var(--ok)" },
      { text: "stable", color: "var(--ok)" },
      { text: "iterating", color: "#fbbf24" }
    ];

    for (var i = 0; i < entries.length; i++) {
      var entry = entries[i];
      var title = entry.getAttribute("data-post-title") || "";
      var h = hashString(title);

      var confidence = 71 + (h % 27);
      var latency = ((h % 110) / 100 + 0.28).toFixed(2);
      var metric = entry.querySelector(".log-metrics");
      if (metric) {
        metric.textContent = "lat " + latency + "s | conf " + confidence + "%";
      }

      var status = statuses[h % statuses.length];
      var node = entry.querySelector(".log-status");
      if (node) {
        node.textContent = status.text;
        node.style.color = status.color;
      }
    }
  }

  function initTimelineFlow() {
    var turns = document.querySelectorAll(".timeline-turn.turn-artifact");
    if (!turns.length) return;

    var sentinel = document.getElementById("timeline-sentinel");
    var batch = 6;

    function revealBatch() {
      var hidden = document.querySelectorAll(".timeline-turn.turn-artifact.is-hidden");
      var max = Math.min(batch, hidden.length);
      for (var i = 0; i < max; i++) {
        hidden[i].classList.remove("is-hidden");
      }

      if (!document.querySelector(".timeline-turn.turn-artifact.is-hidden") && sentinel) {
        sentinel.textContent = "End of timeline";
      }
    }

    if (sentinel && "IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        for (var i = 0; i < entries.length; i++) {
          if (entries[i].isIntersecting) {
            revealBatch();
          }
        }
      }, { rootMargin: "180px 0px 180px 0px" });
      io.observe(sentinel);
    } else {
      revealBatch();
    }

    var toggles = document.querySelectorAll(".expand-turn");
    for (var t = 0; t < toggles.length; t++) {
      toggles[t].addEventListener("click", function () {
        var turn = this.closest(".timeline-turn");
        if (!turn) return;
        turn.classList.toggle("expanded");
        this.textContent = turn.classList.contains("expanded") ? "Collapse context" : "Expand context";
      });
    }
  }
})();
