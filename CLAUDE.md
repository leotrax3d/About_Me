# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a static personal portfolio/landing site for "leotrax3d", deployed via GitHub Pages at https://leotrax3d.github.io/About_Me/. There is no build step, package manager, or test suite — every page is a self-contained, hand-written HTML file with inline `<script>` blocks. Edit files directly and open them in a browser to verify changes (e.g. `xdg-open index.html` or any local static file server).

## Structure

- `index.html` — main landing page (hero, about, skills, projects sections), shares the global terminal/cursor/theme JS described below.
- `internship.html`, `internship/internship_qr1.html`, `internship/internship_qr2.html` — internship report pages and their QR-linked sub-pages.
- `ClassChat.html`, `qr.html`, `gute-besserung.html` — standalone feature/joke pages, each with their own inline JS.
- `link/001.html`, `link/002.html` — tiny redirect pages. Each reads `data-target-url` from `<body>` and either previews the link (when the URL ends in `/?`) or does `location.replace()` to it. Both currently point at the same target URL.
- `privacy-policy.html` — fully self-contained page with its own `<style>` block (does not use `styles.css`/`xp.css`).
- `styles.css` — shared dark "mono" theme (CSS custom properties under `:root`: `--bg`, `--text`, `--accent`, etc., font is JetBrains Mono).
- `xp.css` — alternate "Windows XP" theme that overrides the same CSS variables and component styles. Loaded as a `<link disabled>` stylesheet and toggled at runtime.
- `assets/` — images (internship photos, etc.).

## Shared page conventions

Most pages (`index.html`, `internship.html`, `ClassChat.html`, `qr.html`, `gute-besserung.html`) share the same boilerplate, copy-pasted per file rather than templated:

- Same `<head>` includes: Google Fonts (JetBrains Mono, Material Symbols), `styles.css`, and on `index.html` also `xp.css` (disabled by default).
- A `.terminal-overlay` "secret terminal" widget with a command parser (`runCommand`) supporting commands like `help`, `about`, `skills`, `projects`, `github`, `internship`, `whoami`, `uptime`, `date`, `theme`, `ascii`, `echo`, `coin`, `rps`, `guess`, `clear`, `exit`. Triple-clicking any element with class `easter-trigger` opens it.
- A custom mouse cursor (`.cursor` / `.cursor-dot`, class `custom-cursor` on `<body>`), driven by `requestAnimationFrame`.
- `nav` with `.nav-logo`, hamburger `.nav-menu` toggling `.nav-open`, and links back to `index.html#about` / `#skills` / `#projects`.
- `IntersectionObserver`-based fade-in for elements with class `.fade`.

Because this JS/HTML is duplicated across files, when changing shared behavior (terminal commands, cursor, nav, theme toggle) check whether the same block needs updating in every page that has it, not just `index.html`.

## Theme toggle (XP mode)

`index.html` has an `#xp-toggle` button that enables/disables the `xp.css` `<link>` (`#xp-theme-link`) and persists the choice in `localStorage` under `theme` (`"xp"` or `"dark"`). `xp.css` overrides the same `--bg`/`--text`/`--accent`/etc. variables plus specific component selectors to mimic a Windows XP Luna look — keep new XP-mode overrides in `xp.css`, not inline.

## Known inconsistencies to be aware of

- `index.html` links to `tipptrainer.html` in the nav, but that file was deleted from the repo (see git history) — the link is currently dead.
- `link/001.html` and `link/002.html` are near-duplicates with the same hardcoded `data-target-url`.
