# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Static personal portfolio/landing site for "leotrax3d", deployed via GitHub Pages at https://leotrax3d.github.io/About_Me/. There is no build step, package manager, or test suite — pages are hand-written HTML files, mostly self-contained but sharing one runtime script. Edit files directly and open them in a browser to verify (e.g. `xdg-open index.html`).

Note: some features fetch at runtime (`blog.html`), so they only work over `http://` (a local static server), not a bare `file://` open — see the Blog section.
harald ritz

## Structure

- `index.html` — main landing page (hero, about, skills, projects). Has `class="page-home"` on `<body>` and the only `#xp-toggle` button.
- `site.js` — **shared runtime chrome** for the main pages (see below). The single most important file to understand.
- `styles.css` — shared dark "mono" theme (CSS custom properties under `:root`: `--bg`, `--text`, `--accent` `#c5f13e`, etc.; font JetBrains Mono).
- `xp.css` — alternate "Windows XP Luna" theme. Loaded as a `<link disabled id="xp-theme-link">` and toggled at runtime; overrides the same CSS variables plus component selectors.
- `blog.html` + `blog/` — markdown-driven blog (see Blog system below).
- `showcase.html` + `showcase.philosophy.md` — a wordless black/white motion design piece using **Three.js (r128)** and **GSAP + ScrollTrigger** from CDNs. Standalone; does not use `site.js`. The `.md` is its German design rationale (gitignored).
- `haraldritz.html` + `haraldritz.css` — a Windows-XP "System Properties" dialog gag page for the persona "Harald Ritz" (the same name the terminal's `whoami` prints). Standalone, own CSS.
- `internship.html`, `internship/internship_qr1.html`, `internship/internship_qr2.html` — internship report and QR sub-pages.
- `ClassChat.html`, `qr.html`, `gute-besserung.html` — standalone feature/joke pages.
- `link/001.html`, `link/002.html` — tiny redirect pages reading `data-target-url` from `<body>`; near-duplicates with the same hardcoded target.
- `privacy-policy.html` — fully self-contained, own `<style>` block (no `styles.css`/`xp.css`/`site.js`).
- `__shot_test.html` — a standalone snapshot page that still carries the **old inline copy** of the chrome plus a promo popup. A "before" artifact, not wired to `site.js`; do not treat it as live or sync changes into it.
- `maldesign.md` — a German design-critique "wall of shame" working doc, not shipped.
- `assets/` — images/SVGs.

## site.js — shared chrome (read this first)

The pages `index.html`, `internship.html`, `ClassChat.html`, `qr.html`, `gute-besserung.html`, and `blog.html` each include `<script src="site.js"></script>` and let it inject and wire up all shared chrome at runtime (`insertAdjacentHTML` into `<body>`; no fetch/CORS, so it works from `file://` too). This **replaces** the old pattern of copy-pasting the same HTML/JS into every page. When changing shared behaviour, edit `site.js` once — do not re-add inline copies.

What `site.js` provides (`init()` at the bottom calls each):

- **Nav** — logo, hamburger `.nav-menu` toggling `.nav-open`, links built from the `NAV_ITEMS` array (about/skills/projects/internship/qr/ClassChat/showcase/blog + GitHub). The active link is derived from the current filename.
- **Custom cursor** — `.cursor` ring + lagging `.cursor-dot`, `requestAnimationFrame`-driven; adds `custom-cursor` to `<body>`.
- **Background point-field** — a `<canvas id="bg-field">` grid of dots that breathe, flee the cursor, and emit an accent-coloured shockwave on `pointerdown`. Pure canvas + rAF, paused when the tab is hidden, rebuilt on resize, static fallback under `prefers-reduced-motion`. (Replaced the old static dot grid.)
- **Secret terminal** — `.terminal-overlay` opened by **triple-clicking any `.easter-trigger`**. Built-in commands: `help, about, skills, projects, github, internship, blog, qr, classchat, home, showcase, whoami` (prints `HARALD RITZ`)`, uptime, date, theme, ascii, echo, coin, rps, guess, clear, exit`.
- **Scramble text** — section headings decode from glyph noise on first view; project names re-scramble on hover; nav links flicker on hover. Exposed as `window.scrambleText`. Skipped under `prefers-reduced-motion`.
- **Fade-in** — `.fade` elements gain `.on` via `IntersectionObserver`.
- **XP theme toggle** — only activates on pages that ship both `#xp-toggle` and `#xp-theme-link` (just `index.html`); persists choice in `localStorage` key `theme` (`"xp"`/`"dark"`). Keep new XP overrides in `xp.css`, not inline.

### Per-page terminal commands

A page can define `window.terminalCommands` **before** `site.js` runs to add or override commands. Each handler receives `(args, t)` where `t = { print, close }`. Custom commands take priority over built-ins (so a page can override e.g. `github`). Example:

```js
window.terminalCommands = {
  overview(args, t) {
    t.print("jumping...");
    t.close();
    document.querySelector("#overview")?.scrollIntoView();
  },
};
```

## Blog system

`blog.html` renders markdown posts in `blog/`. It auto-discovers every `*.md` (except `README.md`) via the **GitHub contents API**, sorts newest-first, and renders them in-theme with a small custom markdown parser. `blog/posts.json` is an **optional fallback** filename list used only for local preview (no API); on the live site it is normally untouched.

Adding a post: drop `blog/YYYY-MM-DD-title.md` with optional frontmatter (`title`, `date`, `description`, `tag`) and push. Missing `title`/`date` are inferred from the first `# heading` and the filename date prefix. See `blog/README.md` for the supported markdown subset.

## Conventions & gotchas

- The shared `site.js` pages also copy the same `<head>` (Google Fonts: JetBrains Mono + Material Symbols, `styles.css`); only `index.html` additionally links `xp.css` (disabled).
- `index.html`'s nav once linked `tipptrainer.html`, which was deleted — watch for dead links.
- `showcase.html` and `haraldritz.html` are deliberately standalone (own deps/CSS, no `site.js`); shared-chrome changes do not apply to them.
- `CLAUDE.md` and `showcase.philosophy.md` are in `.gitignore`; `maldesign.md` and `site.js` may be untracked while iterating.
