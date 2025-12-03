# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

web90 is a drop-in JavaScript library that adds nostalgic 90s/2000s web aesthetics to any website. It's 100% vibecoded. Features include animated GIFs, visitor counters, mouse trails, WordArt, retro themes (Win98, macOS Classic, DOS, flash, others), and more.

## Development

This is a static site hosted via GitHub Pages. No build system - just vanilla JS/CSS/HTML.

## Architecture

**Core files:**
- `retros.js` - Main orchestrator. Loads retro elements, handles URL params, manages lazy-loading
- `retros.css` - Base styles for all retros
- `retro-elements.html` - HTML templates for DOM-based retros (badges, counter, etc.)

**Plugin system:**
- Retros in `/retros/` are lazy-loaded on demand via `loadRetroResources()`
- Plugins register via `web90.registerPlugin(name, initFn)`
- The `RETROS` array at ~line 271 is the single source of truth for all retro definitions

**Retro types:**
- `dom` - HTML elements injected into slots (`data-retro-slot="0"`)
- `js` - JavaScript effects (mouse trails, cursors, etc.)
- `theme` - Full page transformations (Win98 desktop, DOS prompt, etc.)

**External dependencies (loaded at runtime):**
- `98.css` from unpkg (scoped with `.win98` class)
- `system.css` from unpkg (scoped with `.macos-classic` class)

## Configuration

Set `window.WEB90_CONFIG` before loading the script to customize badges, dividers, music, iframe URLs, etc.

## Testing

Tests use Playwright. Run with `npm test` (all browsers) or `npm test -- --project=chromium` (Chromium only).

**Test files:**
- `tests/smoke.spec.ts` - Basic page load and initialization
- `tests/dom-retros.spec.ts` - DOM-based retros (badges, counter, media player, etc.)
- `tests/js-effects.spec.ts` - JS effects (mouse trail, blink, marquee, dividers, etc.)
- `tests/themes.spec.ts` - Theme tests (matrix, win98, macos-classic, dos, etc.)
- `tests/url-params.spec.ts` - URL parameter handling

**Test page:**
- `test.html` - Contains all elements needed for testing (header, sections with IDs, retro slots, etc.)
- Some themes (win98, macos-classic) require `<header>` and `<section id="...">` elements to initialize

**Key test patterns:**
- Toolbars require clicking through install dialog - use `page.waitForSelector('#toolbar-install-dialog')` then click `#toolbar-install-yes`
- Win98 theme has ~5s boot sequence - wait for `#win98-desktop:not([style*="display: none"])`
- Themes auto-load when `?theme=` param is specified (no need for `?retros=retheme`)
