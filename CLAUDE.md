# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

web90 is a drop-in JavaScript library that adds nostalgic 90s/2000s web aesthetics to any website. It's 100% vibecoded. Features include animated GIFs, visitor counters, mouse trails, WordArt, retro themes (Win98, macOS Classic, DOS), and more.

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
