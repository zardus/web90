# Copilot Instructions for web90

This file provides guidance for GitHub Copilot coding agents working on the web90 repository.

## Project Overview

web90 is a drop-in JavaScript library that adds nostalgic 90s/2000s web aesthetics to any website. It's 100% vibecoded. Features include animated GIFs, visitor counters, mouse trails, WordArt, retro themes (Win98, macOS Classic, DOS, flash, others), and more.

**Project Type**: Static website with vanilla JavaScript/CSS/HTML
**Hosting**: GitHub Pages
**Build System**: None - pure vanilla code

## Commands

### Testing
```bash
npm test                    # Run all Playwright tests (all browsers)
npm test -- --project=chromium  # Run tests in Chromium only
npm run test:headed         # Run tests with browser UI visible
npm run test:debug          # Run tests in debug mode
npm run test:ui             # Open Playwright UI mode
npm run test:report         # Show HTML test report
```

### Development
```bash
npm run serve              # Start local HTTP server on port 8090
# Then open: http://localhost:8090/test.html
```

### Linting
No linting tools configured. Follow existing code style.

## Project Structure

```
web90/
├── retros.js              # Main orchestrator - loads retros, handles URL params
├── retros.css             # Base styles for all retros
├── retro-elements.html    # HTML templates for DOM-based retros
├── control-panel.html     # Windows 95 control panel template
├── chat-window.html       # AIM-style chat window template
├── clippy.html            # Clippy assistant template
├── badges/                # Badge GIF images
├── cursors/               # Cursor PNG images
├── dividers/              # Divider GIF images
├── retros/                # Individual retro modules (lazy-loaded)
│   ├── *.js               # JS-only retros
│   ├── *.css              # Styles for complex retros
│   └── ...
├── tests/                 # Playwright tests
│   ├── smoke.spec.ts      # Basic page load tests
│   ├── dom-retros.spec.ts # DOM-based retros tests
│   ├── js-effects.spec.ts # JS effects tests
│   ├── themes.spec.ts     # Theme tests
│   └── url-params.spec.ts # URL parameter tests
├── test.html              # Test page with all necessary elements
└── package.json           # Dependencies and scripts
```

## Architecture

### Core Components

**Main orchestrator** (`retros.js`):
- Loads retro elements based on URL parameters
- Handles lazy-loading of retro resources
- Manages the plugin registration system
- Contains the `RETROS` array (line ~271) - single source of truth for retro definitions

**Plugin System**:
- Retros in `/retros/` are lazy-loaded on demand via `loadRetroResources()`
- Plugins register via `web90.registerPlugin(name, initFn)`
- Each retro has metadata in the `RETROS` array

**Retro Types**:
- `dom` - HTML elements injected into slots (`data-retro-slot="0"`)
- `js` - JavaScript effects (mouse trails, cursors, etc.)
- `theme` - Full page transformations (Win98 desktop, DOS prompt, etc.)

**External Dependencies** (loaded at runtime):
- `98.css` from unpkg (scoped with `.win98` class)
- `system.css` from unpkg (scoped with `.macos-classic` class)

### Configuration

Users can set `window.WEB90_CONFIG` before loading the script to customize:
- Badge images
- Divider images
- Music tracks
- iframe URLs
- Custom cursors
- Counter glitch text
- Random retro selection

## Code Style

### JavaScript
- Use vanilla JavaScript (ES6+)
- No frameworks or build tools
- Use `const` and `let`, avoid `var`
- Prefer template literals for strings with variables
- Use arrow functions where appropriate
- Comment sparingly - code should be self-documenting
- Match existing patterns in the codebase

### CSS
- Use class names like `.retro-element-name`
- Scope theme styles with theme-specific classes (e.g., `.win98`, `.macos-classic`)
- Use CSS variables for theming where beneficial
- Keep animations performant
- Match existing naming conventions

### HTML
- Keep templates in separate HTML files for complex elements
- Use data attributes for configuration (e.g., `data-retro-slot`)
- Maintain semantic HTML structure

### Testing
- Use Playwright for all tests
- Test file naming: `*.spec.ts`
- Group related tests with `test.describe()`
- Use appropriate waits: `page.waitForSelector()`, `page.waitForTimeout()`
- For themes with boot sequences, wait for completion (e.g., Win98 ~5s boot)
- Test against `test.html` which has all necessary elements

## Git Workflow

- Work on feature branches
- Keep commits focused and atomic
- Write descriptive commit messages
- Test changes before committing
- Do not force push

## Boundaries - What NOT to Modify

### Never Touch
- `/node_modules/` (managed by npm)
- `/.git/` (git internal files)
- `/package-lock.json` (unless updating dependencies)

### Modify with Extreme Care
- `/retros.js` - Core orchestrator (changes can break everything)
- `/RETROS` array in `retros.js` - Single source of truth for retro definitions
- `/retros.css` - Base styles (changes affect all retros)
- Test infrastructure unless explicitly asked

### Avoid Breaking Changes
- Do not remove or rename existing retros without good reason
- Do not change URL parameter behavior without discussion
- Maintain backward compatibility with existing configurations
- Do not break the plugin registration system

## Technology Stack

- **JavaScript**: Vanilla ES6+ (no frameworks)
- **CSS**: Vanilla CSS3 (no preprocessors)
- **HTML**: Semantic HTML5
- **Testing**: Playwright 1.40+
- **Server**: http-server for local development
- **External Runtime Dependencies**:
  - 98.css (Windows 98 styles)
  - system.css (Mac OS Classic styles)

## Common Tasks

### Adding a New Retro
1. Create files in `/retros/` directory (e.g., `my-retro.js` and optionally `my-retro.css`)
2. Add entry to `RETROS` array in `retros.js`
3. Implement plugin registration: `web90.registerPlugin('my-retro', initFn)`
4. Add tests in appropriate test file
5. Update README.md with retro description

### Fixing a Bug
1. Write a test that reproduces the bug
2. Fix the bug with minimal changes
3. Verify the test passes
4. Run full test suite to check for regressions

### Updating Documentation
1. Update README.md for user-facing changes
2. Update CLAUDE.md for development guidance
3. Update this file for Copilot-specific guidance

## Testing Patterns

### Theme Tests
- Themes require specific HTML structure: `<header>` and `<section id="...">` elements
- Themes auto-load when `?theme=` param is specified
- Wait for theme initialization before assertions

### Toolbar Tests
- Toolbars require clicking through install dialog
- Wait for `#toolbar-install-dialog`, then click `#toolbar-install-yes`

### URL Parameter Tests
- Test with various combinations of `?retros=`, `?theme=`, `?trail-style=`, etc.
- Test `?retros=all` and `?retros=none` special cases
- Test legacy `?retro=` (singular) parameter

## Notes for AI Agents

- This is a fun, nostalgic project - embrace the 90s web aesthetic
- Code quality is "vibecoded" - functional but not necessarily pristine
- Preserve the playful nature of the project
- When in doubt, check existing retros for patterns
- Test thoroughly - retros can interact in unexpected ways
- The project values working features over perfect architecture
- Keep changes minimal and focused
- Always verify changes don't break existing functionality
