/**
 * Retro Features JavaScript
 * Handles all the nostalgic 90s/2000s web elements
 *
 * https://github.com/zardus/web90
 *
 * Base path is auto-detected from script location.
 *
 * Usage:
 *   1. Include CSS: <link rel="stylesheet" href="web90/retros.css">
 *   2. Add slots with data-retro-slot attribute:
 *      <div data-retro-slot="0"></div>  <!-- Primary slot, receives retro elements -->
 *      <div data-retro-slot="1"></div>  <!-- Overflow slot (default for extras) -->
 *      <div data-retro-slot="2"></div>  <!-- Additional overflow slots -->
 *   3. Include JS: <script src="web90/retros.js"></script>
 *
 * Configuration: Set window.WEB90_CONFIG before loading this script to customize:
 *
 * window.WEB90_CONFIG = {
 *   badges: [                              // Array of badge objects
 *     { src: '/path/to/badge.gif', href: 'https://example.com', onclick: null }
 *   ],
 *   dividers: ['/path/to/divider.gif'],    // Array of divider image URLs
 *   music: [                               // Array of music track objects
 *     { src: '/music/track.ogg', label: '♪ track' }
 *   ]
 * };
 */

(function() {
  'use strict';

  // ============================================
  // Inject Scoped 98.css Stylesheet
  // ============================================

  (function() {
    fetch('https://unpkg.com/98.css@0.1.21/dist/98.css')
      .then(function(r) { return r.text(); })
      .then(function(css) {
        // Prefix all selectors with .win98 scope class
        var scoped = css.replace(/([^{}]+)(\{[^{}]*\})/g, function(match, selectorBlock, rules) {
          // Skip @-rules and font-face
          var trimmed = selectorBlock.trim();
          if (trimmed.charAt(0) === '@' || trimmed.indexOf('@font-face') !== -1) {
            return match;
          }
          // Handle each selector
          var selectors = selectorBlock.split(',');
          var prefixed = selectors.map(function(sel) {
            sel = sel.trim();
            if (!sel || sel.charAt(0) === '@') return sel;
            // Prefix with .win98 scope
            return '.win98 ' + sel;
          }).join(', ');
          return prefixed + rules;
        });
        var style = document.createElement('style');
        style.id = 'scoped-98css';
        style.textContent = scoped;
        document.head.appendChild(style);
      });
  })();

  // ============================================
  // Utility Functions
  // ============================================

  function randomFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
    }
    return arr;
  }

  function createElement(tag, styles, parent) {
    var el = document.createElement(tag);
    if (styles) el.style.cssText = styles;
    if (parent) parent.appendChild(el);
    return el;
  }

  function createCanvas(styles, parent) {
    var canvas = createElement('canvas', styles, parent || document.body);
    return { canvas: canvas, ctx: canvas.getContext('2d') };
  }

  function createFullscreenCanvas(zIndex, opacity, pointerEvents) {
    var styles = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:' + (zIndex || 100002) + ';';
    if (opacity !== undefined) styles += 'opacity:' + opacity + ';';
    if (pointerEvents === false) styles += 'pointer-events:none;';
    // Use documentElement to avoid perspective-wrapper transform breaking position:fixed
    return createCanvas(styles, document.documentElement);
  }

  function setupCanvasResize(canvas, scaleFactor) {
    scaleFactor = scaleFactor || 1;
    function resize() {
      canvas.width = window.innerWidth / scaleFactor;
      canvas.height = window.innerHeight / scaleFactor;
    }
    resize();
    window.addEventListener('resize', resize);
    return resize;
  }

  // ============================================
  // On-Demand Resource Loader
  // ============================================

  var loadedResources = {};
  var pluginRegistry = {};

  function loadResource(url, type) {
    if (loadedResources[url]) {
      return loadedResources[url];
    }

    var promise = new Promise(function(resolve, reject) {
      if (type === 'js') {
        var script = document.createElement('script');
        script.src = url;
        script.onload = function() { resolve(url); };
        script.onerror = function() { reject(new Error('Failed to load ' + url)); };
        document.head.appendChild(script);
      } else if (type === 'css') {
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = url;
        link.onload = function() { resolve(url); };
        link.onerror = function() { reject(new Error('Failed to load ' + url)); };
        document.head.appendChild(link);
      } else {
        reject(new Error('Unknown resource type: ' + type));
      }
    });

    loadedResources[url] = promise;
    return promise;
  }

  function loadRetroResources(retro) {
    if (!retro.resources) {
      return Promise.resolve(retro.init || null);
    }

    var basePath = config.basePath;
    var promises = [];

    if (retro.resources.css) {
      promises.push(loadResource(basePath + '/retros/' + retro.resources.css, 'css'));
    }
    if (retro.resources.js) {
      promises.push(loadResource(basePath + '/retros/' + retro.resources.js, 'js'));
    }

    return Promise.all(promises).then(function() {
      return pluginRegistry[retro.name] || retro.init || null;
    });
  }

  function registerPlugin(name, initFn) {
    pluginRegistry[name] = initFn;
  }

  // ============================================
  // Configuration
  // ============================================

  var scripts = document.getElementsByTagName('script');
  var currentScript = scripts[scripts.length - 1];
  var scriptSrc = currentScript.src || '';
  var detectedBasePath = scriptSrc.substring(0, scriptSrc.lastIndexOf('/')) || '/web90';

  var DEFAULT_CONFIG = {
    basePath: detectedBasePath,
    badges: [
      { src: detectedBasePath + '/badges/construction.gif' },
      { src: detectedBasePath + '/badges/vi-vim.gif', href: 'https://neovim.io/' },
      { src: detectedBasePath + '/badges/anybrowser6.gif', href: 'https://firefox.com' },
      { src: detectedBasePath + '/badges/aimlink.gif', onclick: 'openChatWindow' }
    ],
    dividers: [
      detectedBasePath + '/dividers/1.gif',
      detectedBasePath + '/dividers/2.gif',
      detectedBasePath + '/dividers/3.gif',
      detectedBasePath + '/dividers/4.gif',
      detectedBasePath + '/dividers/5.gif',
      detectedBasePath + '/dividers/6.gif',
      detectedBasePath + '/dividers/7.gif',
      detectedBasePath + '/dividers/8.gif'
    ],
    music: [],
    webringUrl: '',
    guestbookUrl: '',
    chatUrl: '',
    cursorUrl: '',
    counterGlitchText: '',
    randomRetros: null,
    aprilFoolsRetros: null
  };

  var config = (function() {
    var userConfig = window.WEB90_CONFIG || {};
    var merged = {};
    for (var key in DEFAULT_CONFIG) {
      merged[key] = userConfig.hasOwnProperty(key) ? userConfig[key] : DEFAULT_CONFIG[key];
    }
    return merged;
  })();

  var params = new URLSearchParams(window.location.search);

  // Trail style names (full TRAIL_STYLES with definitions lazy-loaded from mouse-trail.js)
  var TRAIL_STYLE_NAMES = ['binary', 'sparkles', 'fire', 'rainbow', 'stars', 'hearts', 'neon', 'bubbles', 'snow', 'matrix', 'ghost', 'elastic'];

  // Visualization mode names (full VIZ_MODES with draw functions lazy-loaded from media-player.js)
  var VIZ_MODE_NAMES = ['waveform', 'spectrogram', 'spectrum', 'psychedelic', 'radial'];

  function getThemeByName(name) {
    return RETROS.find(function(r) { return r.type === 'theme' && r.name === name; });
  }

  // ============================================
  // Retro Definitions - Single Source of Truth
  // ============================================

  var RETROS = [
    // DOM retros (have HTML elements)
    { name: 'badges', type: 'dom', emoji: '🏅', label: 'Badges' },
    { name: 'media-player', type: 'dom', emoji: '🎵', label: 'Media Player', resources: { js: 'media-player.js', css: 'media-player.css' } },
    { name: 'webring', type: 'dom', emoji: '🔗', label: 'Webring' },
    { name: 'counter', type: 'dom', emoji: '👀', label: 'Visitor Counter' },
    { name: 'guestbook', type: 'dom', emoji: '📖', label: 'Guestbook' },
    // JS retros (initialize via JavaScript)
    { name: 'mouse-trail', type: 'js', emoji: '✨', label: 'Mouse Trail', resources: { js: 'mouse-trail.js', css: 'mouse-trail.css' } },
    { name: 'fireworks', type: 'js', emoji: '🎆', label: 'Fireworks', resources: { js: 'fireworks.js', css: 'fireworks.css' } },
    { name: 'blink', type: 'js', emoji: '💡', label: 'Blink', init: initBlink },
    { name: 'marquee', type: 'js', emoji: '📜', label: 'Marquee', init: initMarquee },
    { name: 'wordart', type: 'js', emoji: '🔤', label: 'WordArt', resources: { js: 'wordart.js', css: 'wordart.css' } },
    { name: 'custom-cursor', type: 'js', emoji: '🖱️', label: 'Custom Cursor', init: initCustomCursor },
    { name: 'dividers', type: 'js', emoji: '〰️', label: 'Dividers', init: initDividers },
    { name: 'image-rotate', type: 'js', emoji: '🔄', label: 'Image Rotate', init: initImageRotate },
    { name: 'retheme', type: 'js', emoji: '🎨', label: 'Retheme', init: initRetheme },
    { name: 'perspective', type: 'js', emoji: '🎲', label: '3D Tilt', init: initPerspective },
    { name: 'clippy', type: 'js', emoji: '📎', label: 'Clippy', resources: { js: 'clippy.js', css: 'clippy.css' } },
    { name: 'popups', type: 'js', emoji: '🪟', label: 'Popups', resources: { js: 'popups.js', css: 'popups.css' } },
    { name: 'toolbars', type: 'js', emoji: '🔍', label: 'Toolbars', resources: { js: 'toolbars.js', css: 'toolbars.css' } },
    // Themes (inline init)
    { name: 'matrix', type: 'theme', emoji: '🕴️', label: 'Matrix', init: initThemeMatrix },
    { name: 'crt', type: 'theme', emoji: '📺', label: 'CRT Monitor', init: initThemeCRT },
    { name: 'neon', type: 'theme', emoji: '💜', label: 'Neon Cyberpunk', init: initThemeNeon },
    { name: 'y2k', type: 'theme', emoji: '💿', label: 'Y2K Chrome', init: initThemeY2K },
    { name: 'hampsterdance', type: 'theme', emoji: '🐹', label: 'Hampster Dance', init: initHampsterDance },
    { name: 'table', type: 'theme', emoji: '📊', label: 'Table Mode', init: initTable },
    { name: 'snow', type: 'theme', emoji: '📡', label: 'TV Snow', init: initThemeTVSnow },
    { name: 'vhs', type: 'theme', emoji: '📼', label: 'VHS Glitch', init: initThemeVHS },
    // Themes (external/lazy-loaded)
    { name: 'flash', type: 'theme', emoji: '⚡', label: 'Flash Site', resources: { js: 'flash.js', css: 'flash.css' } },
    { name: 'starwars', type: 'theme', emoji: '⭐', label: 'Star Wars Crawl', resources: { js: 'starwars.js', css: 'starwars.css' } },
    { name: 'cascade', type: 'theme', emoji: '🦠', label: 'Cascade Virus', resources: { js: 'cascade.js', css: 'cascade.css' } }
  ];

  // Derived arrays
  var ALL_DOM_RETROS = RETROS.filter(function(r) { return r.type === 'dom'; }).map(function(r) { return r.name; });
  var ALL_JS_RETROS = RETROS.filter(function(r) { return r.type === 'js'; }).map(function(r) { return r.name; });
  var ALL_FUN_RETROS = RETROS.filter(function(r) { return r.type !== 'theme'; }).map(function(r) { return r.name; });
  var THEME_NAMES = RETROS.filter(function(r) { return r.type === 'theme'; }).map(function(r) { return r.name; });

  // Legacy THEMES object for backwards compatibility (used by control-panel.js)
  var THEMES = RETROS.filter(function(r) { return r.type === 'theme'; }).reduce(function(acc, r) {
    acc[r.name] = { emoji: r.emoji, label: r.label, init: r.init, resources: r.resources };
    return acc;
  }, {});

  // ============================================
  // Slot Management
  // ============================================

  function getSlots() {
    var slots = Array.from(document.querySelectorAll('[data-retro-slot]'));
    slots.sort(function(a, b) {
      var orderA = parseInt(a.dataset.retroSlot, 10);
      var orderB = parseInt(b.dataset.retroSlot, 10);
      if (isNaN(orderA)) orderA = 999;
      if (isNaN(orderB)) orderB = 999;
      return orderA - orderB;
    });
    return slots;
  }

  // ============================================
  // April Fools Detection & Selection
  // ============================================

  function isAprilFools() {
    var today = new Date();
    return today.getMonth() === 3 && today.getDate() === 1;
  }

  function selectFromPool(configPool, allRetros) {
    if (Array.isArray(configPool)) {
      if (configPool.length === 0) return [];
      var filtered = configPool.filter(function(r) { return allRetros.indexOf(r) !== -1; });
      return filtered.length > 0 ? filtered : [];
    }
    return allRetros.slice();
  }

  function generateRandomSelections() {
    var selections = { retros: [], styles: {} };

    // 50% chance for each retro (excluding themes, which are controlled via dropdown)
    RETROS.forEach(function(retro) {
      if (retro.type === 'theme') return;
      if (Math.random() < 0.5) selections.retros.push(retro.name);
    });

    // Random dropdown selections
    var songNames = config.music.map(function(t) { return t.src.split('/').pop().replace(/\.[^.]+$/, ''); });
    var dividerNums = config.dividers.map(function(_, i) { return (i + 1).toString(); });

    selections.styles.song = randomFrom([''].concat(songNames));
    selections.styles.viz = randomFrom([''].concat(VIZ_MODE_NAMES));
    selections.styles.cursor = randomFrom(['none'].concat(CURSOR_STYLE_NAMES));
    selections.styles.trail = randomFrom(['none', ''].concat(TRAIL_STYLE_NAMES));
    selections.styles.theme = randomFrom(['none', ''].concat(THEME_NAMES));
    selections.styles.divider = randomFrom(['none', ''].concat(dividerNums));

    return selections;
  }

  function selectAprilFoolsRetros() {
    var pool = selectFromPool(config.aprilFoolsRetros, ALL_FUN_RETROS);
    if (pool.length === 0) return [];

    var selections = generateRandomSelections();
    var selectedRetros = [];

    // Filter to only retros in the pool
    selections.retros.forEach(function(name) {
      if (pool.indexOf(name) !== -1) {
        selectedRetros.push(name);
      }
    });

    var styleMap = {
      cursor: { retro: 'custom-cursor', param: 'cursor-style' },
      trail: { retro: 'mouse-trail', param: 'trail-style' },
      theme: { retro: 'retheme', param: 'theme' },
      divider: { retro: 'dividers', param: 'divider-style' }
    };

    Object.keys(styleMap).forEach(function(key) {
      var value = selections.styles[key];
      var mapping = styleMap[key];
      // Remove from retros if was randomly added (we'll add back based on style selection)
      var idx = selectedRetros.indexOf(mapping.retro);
      if (idx !== -1) selectedRetros.splice(idx, 1);
      // Add back if style isn't 'none' and retro is in pool
      if (value !== 'none' && pool.indexOf(mapping.retro) !== -1) {
        selectedRetros.push(mapping.retro);
        if (value !== '') params.set(mapping.param, value);
      }
    });

    // Always include control-panel during April Fools
    selectedRetros.push('control-panel');

    return selectedRetros;
  }

  // ============================================
  // Retro List Parser
  // ============================================

  function parseRetroList() {
    var retroParam = params.get('retros') || params.get('retro');
    if (!retroParam) return null;

    var retros = retroParam.split(',').map(function(r) { return r.trim().toLowerCase(); });

    if (retros.length === 1 && retros[0] === 'none') return [];

    if (retros.indexOf('april-fools') !== -1) {
      var aprilFoolsRetros = selectAprilFoolsRetros();
      var extras = retros.filter(function(r) {
        return r !== 'april-fools' && ALL_FUN_RETROS.indexOf(r) === -1;
      });
      retros = aprilFoolsRetros.concat(extras);
      return retros.filter(function(r, i, arr) { return arr.indexOf(r) === i; });
    }

    if (retros.indexOf('all') !== -1) {
      retros.splice(retros.indexOf('all'), 1);
      retros = ALL_FUN_RETROS.concat(retros);
    }

    return retros.filter(function(r, i, arr) { return arr.indexOf(r) === i; });
  }

  // ============================================
  // Retro Element Enabler
  // ============================================

  function initRetroSelector() {
    var retroList = parseRetroList();

    if (retroList === null) {
      if (isAprilFools()) {
        retroList = selectAprilFoolsRetros();
      } else {
        var randomRetro = selectRandomRetro();
        return randomRetro ? [randomRetro] : [];
      }
    }

    if (retroList.length === 0) return [];

    var domRetrosSelected = retroList.filter(function(r) {
      return ALL_DOM_RETROS.indexOf(r) !== -1;
    });

    if (domRetrosSelected.length > 1) {
      distributeRetros(domRetrosSelected);
    } else {
      domRetrosSelected.forEach(function(r) {
        var el = document.getElementById('retro-' + r);
        if (el) el.style.display = 'flex';
      });
    }

    return retroList;
  }

  // ============================================
  // Random Retro Selection
  // ============================================

  function selectRandomRetro() {
    var pool = selectFromPool(config.randomRetros, ALL_FUN_RETROS);
    if (pool.length === 0) return null;

    var selected = randomFrom(pool);

    if (ALL_DOM_RETROS.indexOf(selected) !== -1) {
      var el = document.getElementById('retro-' + selected);
      if (el) el.style.display = 'flex';
    }

    return selected;
  }

  // ============================================
  // Distribute DOM Retros
  // ============================================

  function distributeRetros(domRetros) {
    var shuffled = shuffle(domRetros.slice());
    var slots = getSlots();

    shuffled.forEach(function(name, index) {
      var el = document.getElementById('retro-' + name);
      if (!el) return;

      if (index > 0 && slots.length > 1) {
        var slotIndex = index < slots.length ? index : 1;
        var slot = slots[slotIndex];
        if (slot) {
          slot.appendChild(el);
          slot.style.display = 'block';
          el.style.justifyContent = 'center';
        }
      }

      el.style.display = 'flex';
    });
  }

  // ============================================
  // Simple JS Retros
  // ============================================

  function wrapH1(tag) {
    var h1 = document.querySelector('h1');
    if (h1) h1.innerHTML = '<' + tag + '>' + h1.textContent + '</' + tag + '>';
  }

  function initBlink() { wrapH1('blink'); }
  function initMarquee() { wrapH1('marquee'); }

  // ============================================
  // Custom Cursor
  // ============================================

  var CURSOR_STYLES = {
    'custom': { emoji: '🎯', label: 'Custom', path: null },
    'hourglass': { emoji: '⏳', label: 'Hourglass', path: '/cursors/hourglass.png' }
  };

  var CURSOR_STYLE_NAMES = Object.keys(CURSOR_STYLES);

  function initCustomCursor() {
    var cursorParam = params.get('cursor-style');
    var cursorUrl;

    if (cursorParam && CURSOR_STYLES.hasOwnProperty(cursorParam)) {
      var cursorDef = CURSOR_STYLES[cursorParam];
      cursorUrl = cursorDef.path === null ? config.cursorUrl : config.basePath + cursorDef.path;
    } else {
      cursorUrl = config.cursorUrl;
    }

    if (!cursorUrl) return;
    var style = createElement('style');
    style.textContent = '*, *::before, *::after { cursor: url(' + cursorUrl + '), auto !important; }';
    document.head.appendChild(style);
  }

  // ============================================
  // Iframe Loaders
  // ============================================

  function initIframe(elementId, configUrl) {
    var iframe = document.getElementById(elementId);
    if (iframe && configUrl) {
      iframe.src = configUrl;
    }
  }

  function initWebring() { initIframe('webring', config.webringUrl); }
  function initGuestbook() { initIframe('guestbook', config.guestbookUrl); }

  // ============================================
  // Image Rotate & Dividers
  // ============================================

  function initImageRotate() {
    document.querySelectorAll('img[data-image-rotate="true"]').forEach(function(img) {
      img.classList.add('retro-image-rotate');
    });
  }

  function initDividers() {
    document.querySelectorAll('div.divider hr').forEach(function(hr) {
      if (config.dividers.length === 0) return;

      var dividerParam = params.get('divider-style');
      var src;
      if (dividerParam && !isNaN(parseInt(dividerParam))) {
        var idx = parseInt(dividerParam) - 1;
        src = config.dividers[idx] || config.dividers[0];
      } else {
        src = randomFrom(config.dividers);
      }

      var img = new Image();
      img.onload = function() {
        var div = createElement('div');
        div.style.width = '100%';
        div.style.height = img.naturalHeight + 'px';
        div.style.backgroundImage = 'url(' + src + ')';
        div.style.backgroundRepeat = 'repeat-x';
        hr.parentNode.replaceChild(div, hr);
      };
      img.src = src;
    });
  }

  // ============================================
  // Retheme - Unified theming system
  // ============================================

  function initRetheme() {
    var themeParam = params.get('theme');
    var theme = THEME_NAMES.includes(themeParam) ? themeParam : randomFrom(THEME_NAMES);

    document.body.classList.add('retheme-' + theme);

    var themeRetro = getThemeByName(theme);
    if (!themeRetro) return;

    // If theme has external resources, load them first
    if (themeRetro.resources) {
      loadRetroResources(themeRetro).then(function(initFn) {
        if (initFn) initFn();
      });
    } else if (themeRetro.init) {
      themeRetro.init();
    }
  }

  // ============================================
  // Theme: Matrix
  // ============================================

  function initThemeMatrix() {
    var result = createCanvas(
      'position:fixed;top:0;left:0;width:100%;height:100%;z-index:-1;opacity:0;transition:opacity 1s ease;background:#000;',
      document.documentElement
    );
    var canvas = result.canvas;
    var ctx = result.ctx;
    canvas.id = 'matrix-bg';

    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()+-=[]{}|;:,.<>?~`\u30A0\u30A1\u30A2\u30A3\u30A4\u30A5\u30A6\u30A7\u30A8\u30A9\u30AA\u30AB\u30AC\u30AD\u30AE\u30AF';
    var fontSize = 16;
    var columns, drops;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      columns = Math.floor(canvas.width / fontSize);
      drops = Array(columns).fill(1);
    }

    function draw() {
      ctx.fillStyle = 'rgba(0,0,0,0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = fontSize + 'px monospace';
      for (var i = 0; i < drops.length; i++) {
        ctx.fillStyle = Math.random() > 0.98 ? '#fff' : '#0f0';
        ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
    }

    resize();
    window.addEventListener('resize', resize);
    requestAnimationFrame(function() { canvas.style.opacity = '1'; });
    setInterval(draw, 50);
  }

  // ============================================
  // Theme: CRT
  // ============================================

  function initThemeCRT() {
    var overlay = createElement('div');
    overlay.className = 'crt-overlay';
    document.documentElement.appendChild(overlay);

    var curvature = createElement('div');
    curvature.className = 'crt-curvature';
    document.documentElement.appendChild(curvature);
  }

  // ============================================
  // Theme: Neon
  // ============================================

  function initThemeNeon() {
    var colors = ['#ff00ff', '#00ffff', '#ff0080', '#80ff00'];
    colors.forEach(function(color, i) {
      var line = createElement('div');
      line.className = 'neon-line';
      line.style.setProperty('--neon-color', color);
      line.style.top = (10 + i * 25) + '%';
      line.style.animationDelay = (i * 0.5) + 's';
      document.body.appendChild(line);
    });
  }

  // ============================================
  // Theme: Y2K
  // ============================================

  function initThemeY2K() {
    var shapes = ['💿', '🔮', '💎', '⚪', '🌐'];
    for (var i = 0; i < 8; i++) {
      var shape = createElement('div');
      shape.className = 'y2k-shape';
      shape.textContent = randomFrom(shapes);
      shape.style.left = Math.random() * 100 + '%';
      shape.style.top = Math.random() * 100 + '%';
      shape.style.animationDuration = (5 + Math.random() * 10) + 's';
      shape.style.animationDelay = (Math.random() * 5) + 's';
      shape.style.fontSize = (20 + Math.random() * 40) + 'px';
      document.body.appendChild(shape);
    }
  }

  // ============================================
  // Theme: TV Snow / Static
  // ============================================

  function initThemeTVSnow() {
    var result = createCanvas(
      'position:fixed;top:0;left:0;width:100%;height:100%;z-index:99999;pointer-events:none;opacity:0.06;mix-blend-mode:overlay;',
      document.documentElement // Use documentElement to avoid perspective-wrapper transform issues
    );
    var canvas = result.canvas;
    var ctx = result.ctx;
    canvas.id = 'tv-snow';

    setupCanvasResize(canvas, 4);

    function draw() {
      var imageData = ctx.createImageData(canvas.width, canvas.height);
      var data = imageData.data;
      for (var i = 0; i < data.length; i += 4) {
        var val = Math.random() * 255;
        data[i] = val;
        data[i + 1] = val;
        data[i + 2] = val;
        data[i + 3] = 255;
      }
      ctx.putImageData(imageData, 0, 0);
      requestAnimationFrame(draw);
    }

    draw();
  }

  // ============================================
  // 3D Perspective Tilt
  // ============================================

  function initPerspective() {
    document.body.style.perspective = '1000px';
    document.body.style.perspectiveOrigin = '50% 50%';

    var wrapper = createElement('div');
    wrapper.className = 'perspective-wrapper';

    while (document.body.firstChild) {
      wrapper.appendChild(document.body.firstChild);
    }
    document.body.appendChild(wrapper);

    document.addEventListener('mousemove', function(e) {
      var x = (e.clientX / window.innerWidth - 0.5) * 10;
      var y = (e.clientY / window.innerHeight - 0.5) * 10;
      wrapper.style.transform = 'rotateY(' + x + 'deg) rotateX(' + (-y) + 'deg)';
    });

    document.addEventListener('mouseleave', function() {
      wrapper.style.transform = 'rotateY(0deg) rotateX(0deg)';
    });
  }

  // ============================================
  // Theme: VHS Glitch Effect
  // ============================================

  function initThemeVHS() {
    var overlay = createElement('div');
    overlay.className = 'glitch-overlay';
    document.documentElement.appendChild(overlay);

    function triggerGlitch() {
      document.body.classList.add('glitch-active');
      setTimeout(function() {
        document.body.classList.remove('glitch-active');
      }, 100 + Math.random() * 200);
      setTimeout(triggerGlitch, 2000 + Math.random() * 5000);
    }

    setTimeout(triggerGlitch, 1000);
  }

  // ============================================
  // Theme: Table
  // ============================================

  function initTable() {
    document.querySelectorAll('.tableable').forEach(function(el) {
      el.classList.add('table-cell');
    });
    document.querySelectorAll('.untableable').forEach(function(el) {
      el.style.display = 'none';
    });
    document.querySelectorAll('.divider').forEach(function(el) {
      el.style.display = 'none';
    });
  }

  // ============================================
  // Theme: Hampster Dance
  // ============================================

  function initHampsterDance() {
    var computedStyle = window.getComputedStyle(document.body);
    var originalBackground = computedStyle.background;
    var originalBackgroundColor = computedStyle.backgroundColor;
    var originalBackgroundImage = computedStyle.backgroundImage;

    document.body.style.backgroundImage = 'url("' + config.basePath + '/hampsters.gif")';
    document.body.style.backgroundRepeat = 'repeat';
    document.body.style.backgroundSize = 'auto';

    var overlay = createElement('div',
      'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(128, 128, 128, 0.5); pointer-events: none; z-index: 0;'
    );
    document.documentElement.appendChild(overlay);

    var main = document.getElementById('main');
    if (main) {
      if (originalBackgroundImage && originalBackgroundImage !== 'none') {
        main.style.background = originalBackground;
      } else {
        main.style.backgroundColor = originalBackgroundColor || 'white';
      }
      main.style.position = 'relative';
      main.style.zIndex = '1';
    }
  }


  // ============================================
  // Badges
  // ============================================

  function initBadges() {
    var container = document.getElementById('retro-badges');
    if (!container || config.badges.length === 0) return;

    var firstBadge = config.badges[0];
    var restBadges = config.badges.slice(1);

    if (firstBadge) {
      var row1 = createElement('div');
      row1.appendChild(createBadgeElement(firstBadge));
      container.appendChild(row1);
    }

    if (restBadges.length > 0) {
      var row2 = createElement('div');
      restBadges.forEach(function(badge) {
        row2.appendChild(createBadgeElement(badge));
      });
      container.appendChild(row2);
    }
  }

  function createBadgeElement(badge) {
    var img = createElement('img');
    img.src = badge.src;
    img.className = 'badges';

    if (badge.onclick) {
      img.style.cursor = 'pointer';
      img.onclick = function() {
        if (typeof window[badge.onclick] === 'function') {
          window[badge.onclick]();
        }
      };
      return img;
    }

    if (badge.href) {
      var link = createElement('a');
      link.href = badge.href;
      link.appendChild(img);
      return link;
    }

    return img;
  }


  // ============================================
  // Enable JS Retros
  // ============================================

  function enableJsRetros(selectedRetros) {
    RETROS.forEach(function(retro) {
      if (retro.type === 'js' && selectedRetros.indexOf(retro.name) !== -1) {
        if (retro.resources) {
          // Lazy-load external resources then init
          loadRetroResources(retro).then(function(initFn) {
            if (initFn) initFn();
          });
        } else if (retro.init) {
          retro.init();
        }
      }
    });
  }

  // ============================================
  // Visitor Counter
  // ============================================

  function initVisitorCounter() {
    var countEl = document.getElementById('visitorCount');
    var labelEl = document.getElementById('visitorLabel');
    if (!countEl || !labelEl) return;

    var count = Math.floor(Math.random() * 900000) + 100000;
    var delays = [200, 300, 400, 500, 600, 700, 800, 900, 1000, 1500, 2000, 2500, 3000, 4000, 5000, 7000, 9000];

    function animateCounter(from, to, callback) {
      var current = from;
      var increment = Math.ceil((to - from) / 50);
      var timer = setInterval(function() {
        current += increment;
        if (current >= to) {
          current = to;
          clearInterval(timer);
          if (callback) callback();
        }
        countEl.textContent = current.toString().padStart(6, '0');
      }, 20);
    }

    function incrementCounter() {
      var next = count + Math.floor(Math.random() * 10) + 1;
      animateCounter(count, next, function() {
        count = next;
        setTimeout(incrementCounter, randomFrom(delays));
      });
    }

    function flicker() {
      if (!config.counterGlitchText) return;
      var origColor = labelEl.style.color;
      labelEl.classList.add('glitch-active');
      labelEl.textContent = config.counterGlitchText;
      labelEl.style.color = '#0ff';
      setTimeout(function() {
        labelEl.classList.remove('glitch-active');
        labelEl.textContent = 'Visitors';
        labelEl.style.color = origColor;
        setTimeout(flicker, Math.random() * 4000 + 2000);
      }, Math.random() * 300 + 300);
    }

    animateCounter(0, count, incrementCounter);
    setTimeout(flicker, Math.random() * 4000 + 2000);
  }


  // ============================================
  // Chat Window
  // ============================================

  window.openChatWindow = function() {
    document.getElementById('chat-window').style.display = 'flex';
  };

  window.loadChatIframe = function() {
    var container = document.getElementById('chat-content');
    var confirm = document.getElementById('chat-confirm');
    if (confirm) confirm.style.display = 'none';

    if (!container.querySelector('iframe')) {
      var iframe = createElement('iframe');
      iframe.src = config.chatUrl;
      iframe.width = '100%';
      iframe.height = '100%';
      container.appendChild(iframe);
    }
  };

  window.closeChatWindow = function() {
    document.getElementById('chat-window').style.display = 'none';
  };

  // ============================================
  // Template Loader
  // ============================================

  function loadTemplate(url) {
    return fetch(url)
      .then(function(r) { return r.text(); })
      .then(function(html) {
        var container = createElement('div');
        container.innerHTML = html;
        return container.firstElementChild;
      });
  }

  // ============================================
  // Public API
  // ============================================

  window.web90 = {
    config: config,
    // Plugin registration for lazy-loaded modules
    registerPlugin: registerPlugin,
    loadRetroResources: loadRetroResources,
    // Data for plugins
    RETROS: RETROS,
    THEMES: THEMES,
    TRAIL_STYLE_NAMES: TRAIL_STYLE_NAMES,
    CURSOR_STYLES: CURSOR_STYLES,
    VIZ_MODE_NAMES: VIZ_MODE_NAMES,
    params: params,
    generateRandomSelections: generateRandomSelections,
    // Utility functions for plugins
    createElement: createElement,
    randomFrom: randomFrom,
    getRandomDivider: function() {
      return config.dividers.length === 0 ? null : randomFrom(config.dividers);
    }
  };

  // ============================================
  // Konami Code - Shows Control Panel
  // ============================================

  (function() {
    var CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
    var ki = 0;

    document.addEventListener('keydown', function(e) {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
      if (e.code === CODE[ki]) {
        if (++ki === CODE.length) {
          ki = 0;
          if (window.web90.showControlPanel) {
            window.web90.showControlPanel();
          }
        }
      } else {
        ki = 0;
      }
    });
  })();

  // ============================================
  // Swipe Up from Bottom - Shows Control Panel (Mobile)
  // ============================================

  (function() {
    var touchStartY = 0, touchStartTime = 0;

    document.addEventListener('touchstart', function(e) {
      var t = e.touches[0];
      if (t.clientY > window.innerHeight * 0.85) {
        touchStartY = t.clientY;
        touchStartTime = Date.now();
      } else {
        touchStartY = 0;
      }
    });

    document.addEventListener('touchend', function(e) {
      if (!touchStartY) return;
      var t = e.changedTouches[0];
      var dy = touchStartY - t.clientY;
      var dt = Date.now() - touchStartTime;
      if (dy > 100 && dt < 500 && window.web90.showControlPanel) {
        window.web90.showControlPanel();
      }
      touchStartY = 0;
    });
  })();

  // ============================================
  // Initialize
  // ============================================

  var primarySlot = document.querySelector('[data-retro-slot="0"]');

  function initAll() {
    initBadges();
    var selectedRetros = initRetroSelector();
    // Load media-player resources and init (lazy-loaded)
    var mediaPlayerRetro = RETROS.find(function(r) { return r.name === 'media-player'; });
    if (mediaPlayerRetro && mediaPlayerRetro.resources) {
      loadRetroResources(mediaPlayerRetro).then(function(initFn) {
        if (initFn) initFn();
      });
    }
    initVisitorCounter();
    initWebring();
    initGuestbook();
    enableJsRetros(selectedRetros);

    Promise.all([
      loadTemplate(config.basePath + '/control-panel.html'),
      loadTemplate(config.basePath + '/chat-window.html'),
      loadResource(config.basePath + '/retros/control-panel.js', 'js'),
      loadResource(config.basePath + '/retros/control-panel.css', 'css')
    ]).then(function(results) {
      // Use documentElement to avoid stacking context issues with body transforms
      document.documentElement.appendChild(results[0]);
      document.documentElement.appendChild(results[1]);
      if (window.web90.initControlPanel) {
        window.web90.initControlPanel(selectedRetros);
      }
    });
  }

  if (primarySlot) {
    fetch(config.basePath + '/retro-elements.html')
      .then(function(r) { return r.text(); })
      .then(function(html) {
        primarySlot.innerHTML = html;
        initAll();
      });
  } else {
    initAll();
  }

})();
