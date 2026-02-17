(function () {
  var structureController = {
    setMode: function () {},
    getMode: function () { return "latest"; }
  };

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
    structureController = initStructureSwitcher();
    initTypedPrompt();
    initCommandPalette(structureController);
    initRuntimePulse();
    initAgentFeed();
    enhanceExecutionLog();
  });

  function initStructureSwitcher() {
    var home = document.getElementById("home");
    var buttons = document.querySelectorAll(".structure-btn");
    var caption = document.getElementById("mode-caption");
    var key = "structure_mode";
    var labels = {
      latest: "Latest-first layout active",
      manifesto: "Manifesto-first layout active",
      stream: "Stream-first layout active"
    };

    if (!home || !buttons.length) {
      return structureController;
    }

    function setMode(mode) {
      if (!labels[mode]) mode = "latest";
      home.setAttribute("data-structure", mode);

      for (var i = 0; i < buttons.length; i++) {
        buttons[i].classList.toggle("active", buttons[i].getAttribute("data-structure") === mode);
      }

      if (caption) caption.textContent = labels[mode];

      try {
        localStorage.setItem(key, mode);
      } catch (e) {
        // Ignore storage restrictions.
      }

      if (mode === "stream") {
        setTimeout(function () {
          window.dispatchEvent(new Event("resize"));
        }, 80);
      }
    }

    function getMode() {
      return home.getAttribute("data-structure") || "latest";
    }

    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener("click", function () {
        setMode(this.getAttribute("data-structure"));
      });
    }

    var saved = "latest";
    try {
      saved = localStorage.getItem(key) || "latest";
    } catch (e) {
      saved = "latest";
    }

    setMode(saved);

    return {
      setMode: setMode,
      getMode: getMode
    };
  }

  function initTypedPrompt() {
    var el = document.getElementById("typed-command");
    if (!el) return;

    var prompts = [
      "publish --notes --in-public --build-in-progress",
      "analyze --systems --latency --tradeoffs",
      "ship --small --often --with-context",
      "learn --from-production --document --iterate"
    ];

    var promptIndex = 0;
    var charIndex = 0;
    var deleting = false;

    function tick() {
      var full = prompts[promptIndex];

      if (!deleting) {
        charIndex += 1;
        el.textContent = full.slice(0, charIndex);
        if (charIndex === full.length) {
          deleting = true;
          setTimeout(tick, 1200);
          return;
        }
      } else {
        charIndex -= 1;
        el.textContent = full.slice(0, charIndex);
        if (charIndex === 0) {
          deleting = false;
          promptIndex = (promptIndex + 1) % prompts.length;
        }
      }

      setTimeout(tick, deleting ? 35 : 48);
    }

    tick();
  }

  function initCommandPalette(structure) {
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
      { label: "View: Recent Outputs", run: function () { scrollToHeading("Recent Outputs"); } },
      { label: "View: Execution Log", run: function () { scrollToHeading("Execution Log"); } },
      { label: "Structure: Latest-first", run: function () { structure.setMode("latest"); } },
      { label: "Structure: Manifesto-first", run: function () { structure.setMode("manifesto"); } },
      { label: "Structure: Stream-first", run: function () { structure.setMode("stream"); } },
      { label: "Mode: Toggle Zen", run: function () { document.body.classList.toggle("zen-mode"); } },
      { label: "Action: Surprise Me", run: randomPost }
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
          var idx = Number(this.dataset.index);
          execute(idx);
        });
        list.appendChild(li);
      }
    }

    function move(delta) {
      if (!current.length) return;
      activeIndex = (activeIndex + delta + current.length) % current.length;
      var items = list.querySelectorAll("li");
      for (var i = 0; i < items.length; i++) {
        items[i].classList.toggle("active", i === activeIndex);
      }
    }

    function execute(index) {
      if (!current[index]) return;
      close();
      current[index].run();
    }

    function filter() {
      var q = input.value.toLowerCase().trim();
      if (!q) {
        render(commands);
        return;
      }
      var filtered = commands.filter(function (c) {
        return c.label.toLowerCase().indexOf(q) > -1;
      });
      render(filtered);
    }

    trigger.addEventListener("click", open);
    input.addEventListener("input", filter);

    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) close();
    });

    document.addEventListener("keydown", function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (overlay.classList.contains("open")) {
          close();
        } else {
          open();
        }
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

    function scrollToHeading(text) {
      var headers = document.querySelectorAll("h2");
      for (var i = 0; i < headers.length; i++) {
        if (headers[i].textContent.trim() === text && headers[i].getClientRects().length) {
          headers[i].scrollIntoView({ behavior: "smooth", block: "start" });
          return;
        }
      }
    }

    function randomPost() {
      var links = Array.prototype.slice.call(document.querySelectorAll(".log-title, .post-card h3 a, .posts a"));
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
      var rect = canvas.getBoundingClientRect();
      var w = rect.width;
      var h = rect.height;
      ctx.clearRect(0, 0, w, h);

      ctx.strokeStyle = "rgba(158, 181, 222, 0.24)";
      ctx.lineWidth = 1;
      for (var gx = 0; gx < w; gx += 24) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, h);
        ctx.stroke();
      }

      for (var gy = 0; gy < h; gy += 24) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(w, gy);
        ctx.stroke();
      }

      ctx.strokeStyle = "rgba(124, 140, 255, 0.85)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (var x = 0; x <= w; x += 4) {
        var y = h * 0.55 + Math.sin((x + phase) * 0.02) * 20 + Math.cos((x - phase) * 0.009) * 10;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.strokeStyle = "rgba(110, 231, 255, 0.95)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (x = 0; x <= w; x += 4) {
        y = h * 0.5 + Math.cos((x + phase * 0.9) * 0.015) * 14;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      phase += 2.8;
      requestAnimationFrame(draw);
    }

    draw();
  }

  function initAgentFeed() {
    var feed = document.getElementById("agent-feed");
    if (!feed) return;

    var messages = [
      "Parsing previous build notes...",
      "Extracting lessons from failure modes...",
      "Re-indexing architectural decisions...",
      "Shipping concise write-up...",
      "Comparing latency trade-offs...",
      "Capturing context before memory decay...",
      "Promoting signal, dropping noise...",
      "Committing another iteration..."
    ];

    function pushLine(msg) {
      var li = document.createElement("li");
      li.textContent = "[" + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + "] " + msg;
      feed.prepend(li);
      while (feed.children.length > 6) {
        feed.removeChild(feed.lastChild);
      }
    }

    for (var i = 0; i < 4; i++) {
      pushLine(messages[i]);
    }

    var idx = 4;
    setInterval(function () {
      pushLine(messages[idx % messages.length]);
      idx += 1;
    }, 2200);
  }

  function enhanceExecutionLog() {
    var entries = document.querySelectorAll(".log-entry");
    if (!entries.length) return;

    var statuses = [
      { text: "done", color: "var(--ok)" },
      { text: "stable", color: "var(--ok)" },
      { text: "iterating", color: "var(--warn)" }
    ];

    for (var i = 0; i < entries.length; i++) {
      var entry = entries[i];
      var title = entry.getAttribute("data-post-title") || "";
      var h = hashString(title);

      var confidence = 70 + (h % 29);
      var latency = ((h % 120) / 100 + 0.25).toFixed(2);
      var metricSlot = entry.querySelector(".log-metrics");
      if (metricSlot) {
        metricSlot.textContent = "lat " + latency + "s | conf " + confidence + "%";
      }

      var status = statuses[h % statuses.length];
      var statusNode = entry.querySelector(".log-status");
      if (statusNode) {
        statusNode.textContent = status.text;
        statusNode.style.color = status.color;
      }
    }
  }
})();
