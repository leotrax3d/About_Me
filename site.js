/* ================================================================
   site.js — shared site chrome and behaviour.

   Every page that links this file gets the same background point
   field, custom cursor, secret terminal and navigation injected and
   wired up, so none of it has to be copy-pasted into each HTML file
   any more. There is no build step: the markup below is injected at
   runtime, which keeps the site working both from a plain file://
   open and from GitHub Pages (no fetch / CORS involved).

   Per-page terminal commands: a page may define a global
   `window.terminalCommands` before this script runs, e.g.

     window.terminalCommands = {
       overview(args, t) {
         t.print("jumping to overview...");
         t.close();
         document.querySelector("#overview")
           ?.scrollIntoView({ behavior: "smooth" });
       },
     };

   Each handler receives the parsed args array and a small helper
   object `t` ({ print, close }). Custom commands take priority over
   the built-ins, so a page can also override e.g. `github`.
================================================================ */
(function () {
  "use strict";

  /* ---------------------------------------------------------------
     Shared chrome markup — injected once at the top of <body>.
  --------------------------------------------------------------- */
  const NAV_ITEMS = [
    ["about", "index.html#about"],
    ["skills", "index.html#skills"],
    ["projects", "index.html#projects"],
    ["internship", "internship.html"],
    ["tools", "tools.html"],
    ["ClassChat", "ClassChat.html"],
    ["n-back", "n-back.html"],
    ["showcase", "showcase.html"],
    ["blog", "blog.html"],
  ];

  const GH_SVG =
    '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">' +
    '<path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>' +
    "</svg>";

  const TERMINAL_HTML =
    '<div class="terminal-overlay" aria-hidden="true">' +
    '<div class="terminal" role="dialog" aria-label="Secret terminal">' +
    '<div class="terminal-header"><span>leotrax3d / terminal</span>' +
    '<button class="terminal-close" type="button">esc</button></div>' +
    '<div class="terminal-body" role="log" aria-live="polite"></div>' +
    '<div class="terminal-input-row"><span class="terminal-prompt">&gt;</span>' +
    '<input class="terminal-input" type="text" spellcheck="false" ' +
    'autocomplete="off" inputmode="text" /></div>' +
    "</div></div>";

  function currentFile() {
    return location.pathname.split("/").pop() || "index.html";
  }

  // Sub-pages that live under the "tools" hub — visiting any of them keeps
  // the single "tools" nav tab highlighted.
  const TOOL_PAGES = [
    "tools.html",
    "qr.html",
    "urlhider.html",
    "checksum.html",
    "base64.html",
  ];

  function buildNav() {
    const file = currentFile();
    const items = NAV_ITEMS.map(([label, href]) => {
      const isSection = href.includes("#");
      const isActive =
        !isSection &&
        (href === file ||
          (href === "tools.html" && TOOL_PAGES.indexOf(file) !== -1));
      const active = isActive ? " active" : "";
      // n-back is the freshest project: its nav tab gets a subtle pulsing
      // "ping" dot (styled in styles.css) so it quietly draws the eye.
      const flag = label === "n-back" ? " nav-pulse" : "";
      return `<li><a class="easter-trigger${active}${flag}" href="${href}">${label}</a></li>`;
    }).join("");
    return (
      "<nav>" +
      '<a href="index.html" class="nav-logo">leotrax3d</a>' +
      '<button class="nav-menu" type="button" aria-label="Open menu" ' +
      'aria-expanded="false" aria-controls="site-nav">' +
      '<span class="material-symbols-outlined">menu</span></button>' +
      '<ul class="nav-links" id="site-nav">' +
      items +
      "<li>" +
      '<a href="https://github.com/leotrax3d" target="_blank" class="nav-gh">' +
      GH_SVG +
      " github</a></li>" +
      "</ul></nav>"
    );
  }

  // Phones / narrow screens get a lighter page: no custom cursor and no
  // live point-field canvas (the cursor-reactive accent background). The
  // static dotted texture (body::after) shows through instead.
  function isMobile() {
    return (
      window.matchMedia("(hover: none) and (pointer: coarse)").matches ||
      window.matchMedia("(max-width: 680px)").matches
    );
  }

  function injectChrome(mobile) {
    let markup = "";
    if (mobile) {
      document.body.classList.remove("custom-cursor", "has-bg-field");
    } else {
      document.body.classList.add("custom-cursor", "has-bg-field");
      markup +=
        '<canvas id="bg-field" aria-hidden="true"></canvas>' +
        '<div class="cursor"></div><div class="cursor-dot"></div>';
    }
    markup += TERMINAL_HTML + buildNav();
    document.body.insertAdjacentHTML("afterbegin", markup);
  }

  /* ---------------------------------------------------------------
     Custom cursor — a ring that follows the pointer and a dot that
     lags slightly behind it.
  --------------------------------------------------------------- */
  function initCursor() {
    const cursor = document.querySelector(".cursor");
    const cursorDot = document.querySelector(".cursor-dot");
    if (!cursor || !cursorDot) return;

    let mouseX = 0;
    let mouseY = 0;
    let dotX = 0;
    let dotY = 0;

    const moveCursor = () => {
      dotX += (mouseX - dotX) * 0.2;
      dotY += (mouseY - dotY) * 0.2;
      cursor.style.left = `${mouseX}px`;
      cursor.style.top = `${mouseY}px`;
      cursorDot.style.left = `${dotX}px`;
      cursorDot.style.top = `${dotY}px`;
      requestAnimationFrame(moveCursor);
    };

    window.addEventListener("mousemove", (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
      cursor.classList.add("is-on");
      cursorDot.classList.add("is-on");
    });

    window.addEventListener("mouseleave", () => {
      cursor.classList.remove("is-on");
      cursorDot.classList.remove("is-on");
    });

    document.querySelectorAll("a, button, .btn").forEach((el) => {
      el.addEventListener("mouseenter", () => cursor.classList.add("is-hover"));
      el.addEventListener("mouseleave", () =>
        cursor.classList.remove("is-hover"),
      );
    });

    moveCursor();
  }

  /* ---------------------------------------------------------------
     Secret terminal — opened by triple-clicking any .easter-trigger.
  --------------------------------------------------------------- */
  function initTerminal() {
    const terminalOverlay = document.querySelector(".terminal-overlay");
    const terminalBody = document.querySelector(".terminal-body");
    const terminalInput = document.querySelector(".terminal-input");
    const terminalClose = document.querySelector(".terminal-close");
    if (!terminalOverlay || !terminalBody || !terminalInput) return;

    const bootTime = Date.now();
    const guessGame = { active: false, target: 0, tries: 0 };

    const addTerminalLine = (text, strong = false) => {
      const line = document.createElement("div");
      line.className = "terminal-line";
      if (strong) {
        const strongEl = document.createElement("strong");
        strongEl.textContent = text;
        line.appendChild(strongEl);
      } else {
        line.textContent = text;
      }
      terminalBody.appendChild(line);
      terminalBody.scrollTop = terminalBody.scrollHeight;
    };

    const seedTerminal = () => {
      if (terminalBody.childElementCount === 0) {
        addTerminalLine("type 'help' for commands.");
      }
    };

    const openTerminal = () => {
      terminalOverlay.classList.add("is-open");
      terminalOverlay.setAttribute("aria-hidden", "false");
      document.body.classList.add("terminal-open");
      seedTerminal();
      setTimeout(() => terminalInput.focus(), 0);
    };

    const closeTerminal = () => {
      terminalOverlay.classList.remove("is-open");
      terminalOverlay.setAttribute("aria-hidden", "true");
      document.body.classList.remove("terminal-open");
    };

    const customApi = { print: addTerminalLine, close: closeTerminal };

    const runCommand = (raw) => {
      const input = raw.trim();
      if (!input) return;
      addTerminalLine(`> ${input}`, true);
      const normalized = input.toLowerCase();
      const parts = normalized.split(/\s+/).filter(Boolean);
      const command = parts[0];
      const args = parts.slice(1);

      // Page-specific commands win over the built-ins.
      const custom = window.terminalCommands || {};
      if (typeof custom[command] === "function") {
        custom[command](args, customApi);
        return;
      }

      if (command === "help") {
        const extra = Object.keys(custom);
        addTerminalLine(
          "commands: help, about, skills, projects, github, contact, internship, " +
            "blog, qr, classchat, nback, home, whoami, uptime, date, theme, " +
            "ascii, echo, coin, rps, guess, clear, exit" +
            (extra.length ? ", " + extra.join(", ") : ""),
        );
        return;
      }
      if (command === "echo") {
        if (args.length === 0) {
          addTerminalLine("usage: echo <text>");
          return;
        }
        addTerminalLine(input.slice(input.indexOf(" ") + 1));
        return;
      }
      const jumps = {
        about: "index.html#about",
        skills: "index.html#skills",
        projects: "index.html#projects",
        home: "index.html",
        internship: "internship.html",
        blog: "blog.html",
        qr: "qr.html",
        classchat: "ClassChat.html",
        showcase: "showcase.html",
        "n-back": "n-back.html",
        nback: "n-back.html",
      };
      if (jumps[command]) {
        addTerminalLine(`opening ${command}...`);
        closeTerminal();
        window.location.href = jumps[command];
        return;
      }
      if (command === "github") {
        addTerminalLine("opening github...");
        window.open("https://github.com/leotrax3d", "_blank");
        return;
      }
      if (command === "contact") {
        addTerminalLine("github.com/leotrax3d");
        addTerminalLine("no other contact — open an issue or a discussion.");
        return;
      }
      if (
        command === "whoami" ||
        command === "who am i" ||
        command === "whoam i"
      ) {
        addTerminalLine("HARALD RITZ");
        return;
      }
      if (command === "uptime") {
        const seconds = Math.floor((Date.now() - bootTime) / 1000);
        const mins = Math.floor(seconds / 60);
        const hrs = Math.floor(mins / 60);
        const days = Math.floor(hrs / 24);
        const out = [];
        if (days) out.push(`${days}d`);
        if (hrs % 24 || days) out.push(`${hrs % 24}h`);
        if (mins % 60 || hrs) out.push(`${mins % 60}m`);
        out.push(`${seconds % 60}s`);
        addTerminalLine(`uptime: ${out.join(" ")}`);
        return;
      }
      if (command === "date") {
        addTerminalLine(new Date().toLocaleString());
        return;
      }
      if (command === "theme") {
        addTerminalLine("theme: mono, accent #c5f13e, bg #0d0e0f");
        return;
      }
      if (command === "ascii") {
        addTerminalLine("  _            _     ");
        addTerminalLine(" | | ___  __ _| |__  ");
        addTerminalLine(" | |/ _ \\/ _` | '_ \\ ");
        addTerminalLine(" | |  __/ (_| | |_) |");
        addTerminalLine(" |_|\\___|\\__,_|_.__/ ");
        return;
      }
      if (command === "coin") {
        addTerminalLine(`coin: ${Math.random() < 0.5 ? "heads" : "tails"}`);
        return;
      }
      if (command === "rps") {
        const pick = args[0];
        if (!pick || !["rock", "paper", "scissors"].includes(pick)) {
          addTerminalLine("usage: rps rock|paper|scissors");
          return;
        }
        const options = ["rock", "paper", "scissors"];
        const cpu = options[Math.floor(Math.random() * options.length)];
        if (pick === cpu) {
          addTerminalLine(`rps: ${pick} vs ${cpu} -> draw`);
          return;
        }
        const win =
          (pick === "rock" && cpu === "scissors") ||
          (pick === "paper" && cpu === "rock") ||
          (pick === "scissors" && cpu === "paper");
        addTerminalLine(`rps: ${pick} vs ${cpu} -> ${win ? "win" : "lose"}`);
        return;
      }
      if (command === "guess" || (guessGame.active && /^\d+$/.test(command))) {
        const arg = args[0];
        const value = command === "guess" ? arg : command;
        if (!value) {
          guessGame.active = true;
          guessGame.target = Math.floor(Math.random() * 20) + 1;
          guessGame.tries = 0;
          addTerminalLine("guess: pick a number 1-20");
          return;
        }
        if (value === "stop") {
          guessGame.active = false;
          guessGame.tries = 0;
          addTerminalLine("guess: stopped");
          return;
        }
        if (!guessGame.active) {
          addTerminalLine("guess: start a game with 'guess'");
          return;
        }
        const num = Number(value);
        if (!Number.isInteger(num)) {
          addTerminalLine("guess: enter a number");
          return;
        }
        guessGame.tries += 1;
        if (num === guessGame.target) {
          addTerminalLine(`guess: correct in ${guessGame.tries} tries`);
          guessGame.active = false;
          return;
        }
        addTerminalLine(
          num < guessGame.target ? "guess: higher" : "guess: lower",
        );
        return;
      }
      if (command === "clear") {
        terminalBody.innerHTML = "";
        guessGame.active = false;
        guessGame.tries = 0;
        seedTerminal();
        return;
      }
      if (command === "exit") {
        closeTerminal();
        return;
      }
      addTerminalLine("unknown command. type 'help'.");
    };

    if (terminalClose) terminalClose.addEventListener("click", closeTerminal);
    terminalOverlay.addEventListener("click", (event) => {
      if (event.target === terminalOverlay) closeTerminal();
    });
    terminalInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        runCommand(terminalInput.value);
        terminalInput.value = "";
      }
    });
    document.addEventListener("keydown", (event) => {
      if (
        event.key === "Escape" &&
        terminalOverlay.classList.contains("is-open")
      ) {
        closeTerminal();
      }
    });

    // Triple-click any .easter-trigger to open the terminal.
    let easterCount = 0;
    let easterTimer;
    const handleEasterClick = () => {
      easterCount += 1;
      if (easterCount >= 3) {
        easterCount = 0;
        openTerminal();
      }
      clearTimeout(easterTimer);
      easterTimer = setTimeout(() => {
        easterCount = 0;
      }, 1200);
    };
    document.querySelectorAll(".easter-trigger").forEach((trigger) => {
      trigger.addEventListener("click", handleEasterClick);
    });
  }

  /* ---------------------------------------------------------------
     Navigation — hamburger toggle and close-on-outside / Escape.
  --------------------------------------------------------------- */
  function initNav() {
    const nav = document.querySelector("nav");
    const navMenu = document.querySelector(".nav-menu");
    if (!nav) return;
    const navLinks = document.querySelectorAll(".nav-links a");

    if (navMenu) {
      navMenu.addEventListener("click", () => {
        nav.classList.toggle("nav-open");
        const isOpen = nav.classList.contains("nav-open");
        navMenu.setAttribute("aria-expanded", isOpen ? "true" : "false");
      });
    }

    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("nav-open");
        if (navMenu) navMenu.setAttribute("aria-expanded", "false");
      });
    });

    document.addEventListener("click", (event) => {
      if (!nav.classList.contains("nav-open")) return;
      if (nav.contains(event.target)) return;
      nav.classList.remove("nav-open");
      if (navMenu) navMenu.setAttribute("aria-expanded", "false");
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      if (!nav.classList.contains("nav-open")) return;
      nav.classList.remove("nav-open");
      if (navMenu) navMenu.setAttribute("aria-expanded", "false");
    });
  }

  /* ---------------------------------------------------------------
     Text-decode ("scramble") — section headings resolve from
     terminal noise into their real text; project cards and nav links
     re-scramble on hover. Skipped for prefers-reduced-motion.
  --------------------------------------------------------------- */
  function initScramble() {
    const reduceMotionMQ = window.matchMedia("(prefers-reduced-motion: reduce)");
    // Letters + digits only: every glyph is one fixed-width mono cell, so a
    // scrambled word always occupies exactly the real word's footprint.
    // (Symbols like < > / # would form JetBrains Mono coding ligatures and
    // flicker/render wider than a single cell.)
    const GLYPHS = "abcdefghijklmnopqrstuvwxyz0123456789";

    const scrambleText = (el, duration = 550) => {
      if (reduceMotionMQ.matches) return;
      if (!el.dataset.scrambleText) el.dataset.scrambleText = el.textContent;
      const original = el.dataset.scrambleText;
      const start = performance.now();
      cancelAnimationFrame(el._scrambleRaf || 0);
      const step = (now) => {
        const progress = Math.min(1, (now - start) / duration);
        const reveal = Math.floor(progress * original.length);
        let out = original.slice(0, reveal);
        for (let i = reveal; i < original.length; i++) {
          out +=
            original[i] === " "
              ? " "
              : GLYPHS[(Math.random() * GLYPHS.length) | 0];
        }
        el.textContent = out;
        if (progress < 1) el._scrambleRaf = requestAnimationFrame(step);
      };
      el._scrambleRaf = requestAnimationFrame(step);
    };
    // Expose for page-specific scripts that want the same effect.
    window.scrambleText = scrambleText;

    const headingIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          scrambleText(entry.target, 700);
          headingIo.unobserve(entry.target);
        });
      },
      { threshold: 0.4 },
    );
    document.querySelectorAll(".sec-head h2").forEach((el) => {
      headingIo.observe(el);
      // Re-scramble the heading whenever it is hovered (about, skills, ...).
      el.addEventListener("mouseenter", () => scrambleText(el, 420));
    });

    document.querySelectorAll(".project").forEach((card) => {
      const name = card.querySelector(".project-name");
      if (!name) return;
      card.addEventListener("mouseenter", () => scrambleText(name, 420));
    });

    // .nav-gh contains an SVG — a textContent scramble would destroy it.
    document.querySelectorAll(".nav-links a:not(.nav-gh)").forEach((link) => {
      link.addEventListener("mouseenter", () => scrambleText(link, 350));
    });
  }

  /* ---------------------------------------------------------------
     Fade-in on scroll for anything with class .fade.
  --------------------------------------------------------------- */
  function initFade() {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("on");
        });
      },
      { threshold: 0.08 },
    );
    document.querySelectorAll(".fade").forEach((el) => io.observe(el));
  }

  /* ---------------------------------------------------------------
     XP theme toggle — only active on pages that ship the button and
     the (disabled) xp.css link.
  --------------------------------------------------------------- */
  function initXpToggle() {
    const xpToggleBtn = document.getElementById("xp-toggle");
    const xpThemeLink = document.getElementById("xp-theme-link");
    if (!xpToggleBtn || !xpThemeLink) return;

    const applyTheme = (isXP) => {
      xpThemeLink.disabled = !isXP;
      localStorage.setItem("theme", isXP ? "xp" : "dark");
    };

    if (localStorage.getItem("theme") === "xp") applyTheme(true);

    xpToggleBtn.addEventListener("click", () => {
      applyTheme(xpThemeLink.disabled);
    });
  }

  /* ================================================================
     BACKGROUND POINT-FIELD — a grid of white points that breathes
     gently and flees the cursor; pointerdown sends an accent-coloured
     shockwave through it. Pure canvas + requestAnimationFrame,
     rebuilt on resize and paused when the tab is hidden. Sits behind
     all content (pointer-events: none) so it never blocks clicks.
  ================================================================ */
  function initBgField() {
    const canvas = document.getElementById("bg-field");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const GAP = 30; // grid spacing in CSS px
    const DOT = 1.3; // base dot radius
    const FLEE_R = 220; // cursor influence radius
    const FLEE = 22; // cursor push strength
    const SPRING = 0.05; // pull back to rest
    const DAMP = 0.86; // velocity damping
    const PARALLAX = 0.18; // dots drift opposite to scroll
    const COLOR = "rgba(255, 255, 255, 0.5)";
    const HILITE = "197, 241, 62"; // --accent: #c5f13e
    const HILITE_BUCKETS = 4;

    let dpr = 1;
    let width = 0;
    let height = 0;
    let points = [];
    let running = true;
    let t = 0;

    const pointer = { x: 0, y: 0, active: false };

    const WAVE_SPEED = 520; // ring expansion in px/s
    const WAVE_BAND = 110; // ring thickness
    const WAVE_FORCE = 30; // outward push strength
    const WAVE_LIFE = 1.4; // seconds until a wave fades out
    const waves = [];

    function build() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const cols = Math.ceil(width / GAP) + 2;
      const rows = Math.ceil(height / GAP) + 2;
      const offX = (width - (cols - 1) * GAP) / 2;
      const offY = (height - (rows - 1) * GAP) / 2;

      points = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const ox = offX + c * GAP;
          const oy = offY + r * GAP;
          points.push({
            ox,
            oy,
            x: ox,
            y: oy,
            vx: 0,
            vy: 0,
            phase: (c + r) * 0.6,
          });
        }
      }
    }

    function drawStatic() {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = COLOR;
      ctx.beginPath();
      for (const p of points) {
        ctx.moveTo(p.x + DOT, p.y);
        ctx.arc(p.x, p.y, DOT, 0, Math.PI * 2);
      }
      ctx.fill();
    }

    function frame() {
      if (!running) return;
      t += 0.016;

      const scroll = window.scrollY || window.pageYOffset || 0;
      let oy = (scroll * PARALLAX) % GAP;
      if (oy < 0) oy += GAP;
      const py = pointer.y - oy;

      for (let i = waves.length - 1; i >= 0; i--) {
        waves[i].t += 0.016;
        if (waves[i].t > WAVE_LIFE) waves.splice(i, 1);
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.setTransform(dpr, 0, 0, dpr, 0, oy * dpr);

      const buckets = Array.from({ length: HILITE_BUCKETS }, () => []);

      ctx.fillStyle = COLOR;
      ctx.beginPath();
      for (const p of points) {
        let ax = (p.ox - p.x) * SPRING;
        let ay = (p.oy - p.y) * SPRING;
        let intensity = 0;

        if (pointer.active) {
          const dx = p.x - pointer.x;
          const dy = p.y - py;
          const d2 = dx * dx + dy * dy;
          if (d2 < FLEE_R * FLEE_R) {
            const d = Math.sqrt(d2);
            intensity = 1 - d / FLEE_R;
            if (d2 > 0.01) {
              const f = intensity * FLEE;
              ax += (dx / d) * f * SPRING;
              ay += (dy / d) * f * SPRING;
            }
          }
        }

        for (const w of waves) {
          const wdx = p.x - w.x;
          const wdy = p.y - (w.y - oy);
          const wd = Math.sqrt(wdx * wdx + wdy * wdy);
          const ring = Math.abs(wd - w.t * WAVE_SPEED);
          if (ring < WAVE_BAND && wd > 0.01) {
            const k = (1 - ring / WAVE_BAND) * (1 - w.t / WAVE_LIFE);
            ax += (wdx / wd) * k * WAVE_FORCE * SPRING;
            ay += (wdy / wd) * k * WAVE_FORCE * SPRING;
            if (k > intensity) intensity = k;
          }
        }

        p.vx = (p.vx + ax) * DAMP;
        p.vy = (p.vy + ay) * DAMP;
        p.x += p.vx;
        p.y += p.vy;

        const disp = Math.abs(p.x - p.ox) + Math.abs(p.y - p.oy);
        const r =
          DOT + Math.sin(t * 1.6 + p.phase) * 0.25 + Math.min(disp * 0.05, 2);

        if (intensity > 0) {
          const idx = Math.min(
            HILITE_BUCKETS - 1,
            Math.floor(intensity * HILITE_BUCKETS),
          );
          buckets[idx].push(p.x, p.y, r);
        } else {
          ctx.moveTo(p.x + r, p.y);
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        }
      }
      ctx.fill();

      for (let i = 0; i < HILITE_BUCKETS; i++) {
        const b = buckets[i];
        if (!b.length) continue;
        const alpha = 0.3 + (i / (HILITE_BUCKETS - 1)) * 0.6;
        ctx.fillStyle = `rgba(${HILITE}, ${alpha})`;
        ctx.beginPath();
        for (let j = 0; j < b.length; j += 3) {
          ctx.moveTo(b[j] + b[j + 2], b[j + 1]);
          ctx.arc(b[j], b[j + 1], b[j + 2], 0, Math.PI * 2);
        }
        ctx.fill();
      }

      requestAnimationFrame(frame);
    }

    window.addEventListener(
      "pointermove",
      (e) => {
        pointer.x = e.clientX;
        pointer.y = e.clientY;
        pointer.active = true;
      },
      { passive: true },
    );
    window.addEventListener("blur", () => {
      pointer.active = false;
    });
    window.addEventListener(
      "pointerdown",
      (e) => {
        if (reduceMotion) return;
        waves.push({ x: e.clientX, y: e.clientY, t: 0 });
        if (waves.length > 4) waves.shift();
      },
      { passive: true },
    );

    build();
    if (reduceMotion) {
      drawStatic();
    } else {
      requestAnimationFrame(frame);
    }

    document.addEventListener("visibilitychange", () => {
      if (reduceMotion) return;
      if (document.hidden) {
        running = false;
      } else if (!running) {
        running = true;
        requestAnimationFrame(frame);
      }
    });

    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        build();
        if (reduceMotion) drawStatic();
      }, 150);
    });
  }

  /* --------------------------------------------------------------- */
  function init() {
    const mobile = isMobile();
    injectChrome(mobile);
    if (!mobile) initCursor();
    initTerminal();
    initNav();
    initScramble();
    initFade();
    initXpToggle();
    if (!mobile) initBgField();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
