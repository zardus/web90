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
    var SCOPES = ['#control-panel', '#chat-window'];
    fetch('https://unpkg.com/98.css@0.1.21/dist/98.css')
      .then(function(r) { return r.text(); })
      .then(function(css) {
        // Prefix all selectors with our scope containers
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
            // Prefix with each scope
            return SCOPES.map(function(scope) {
              return scope + ' ' + sel;
            }).join(', ');
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

  // ============================================
  // Trail Style Definitions
  // ============================================

  var TRAIL_STYLES = {
    binary: {
      emoji: '🔟', label: 'Binary',
      chars: function() { return Math.random() < 0.001 ? '2' : (Math.random() < 0.5 ? '0' : '1'); }
    },
    sparkles: {
      emoji: '✨', label: 'Sparkles',
      chars: ['✦', '✧', '★', '✯', '⋆', '✶', '✴', '✹'],
      color: function() { return 'hsl(' + Math.random() * 360 + ', 100%, 70%)'; }
    },
    fire: {
      emoji: '🔥', label: 'Fire',
      chars: ['🔥', '💥', '✨', '⚡'],
      driftY: function() { return -(30 + Math.random() * 40) + 'px'; }
    },
    rainbow: {
      emoji: '🌈', label: 'Rainbow',
      chars: ['●'],
      throttle: 30,
      color: function(hue) { return 'hsl(' + hue + ', 100%, 60%)'; },
      textShadow: function(hue) { return '0 0 10px hsl(' + hue + ', 100%, 50%)'; },
      hueStep: 15
    },
    stars: {
      emoji: '⭐', label: 'Stars',
      chars: ['⭐', '🌟', '💫', '✨']
    },
    hearts: {
      emoji: '💖', label: 'Hearts',
      chars: ['❤️', '💖', '💕', '💗', '💜', '💙']
    },
    neon: {
      emoji: '💜', label: 'Neon',
      chars: ['◆', '◇', '○', '●', '□', '■'],
      color: function() {
        var colors = ['#ff00ff', '#00ffff', '#ff0080', '#80ff00', '#0080ff'];
        return randomFrom(colors);
      },
      textShadow: function(_, color) {
        return '0 0 5px ' + color + ', 0 0 10px ' + color + ', 0 0 20px ' + color;
      }
    },
    bubbles: {
      emoji: '○', label: 'Bubbles',
      chars: ['○', '◌', '◯', '⬤'],
      color: function() { return 'rgba(100, 200, 255, 0.7)'; },
      driftY: function() { return -(20 + Math.random() * 30) + 'px'; }
    },
    snow: {
      emoji: '❄', label: 'Snow',
      chars: ['❄', '❅', '❆', '✻'],
      color: function() { return '#fff'; },
      textShadow: function() { return '0 0 3px #08f, 0 0 6px #08f, 0 0 2px #000'; },
      driftY: function() { return (30 + Math.random() * 20) + 'px'; }
    },
    matrix: {
      emoji: '🕴️', label: 'Matrix',
      chars: function() { return String.fromCharCode(0x30A0 + Math.floor(Math.random() * 96)); },
      color: function() { return '#0f0'; },
      textShadow: function() { return '0 0 5px #0f0, 0 0 10px #0f0, 0 0 2px #000, 0 0 4px #000'; },
      driftY: function() { return (30 + Math.random() * 50) + 'px'; }
    },
    ghost: {
      emoji: '👻', label: 'Ghost Pointer'
    },
    elastic: {
      emoji: '🪀', label: 'Elastic Pointer'
    }
  };

  var TRAIL_STYLE_NAMES = Object.keys(TRAIL_STYLES);

  // ============================================
  // Theme Definitions (merged into RETROS below)
  // ============================================
  // Themes are now defined in RETROS with type: 'theme'
  // This section kept for backwards compatibility helpers

  function getThemeByName(name) {
    return RETROS.find(function(r) { return r.type === 'theme' && r.name === name; });
  }

  // ============================================
  // Visualization Definitions
  // ============================================

  var VIZ_MODES = {
    waveform: { label: 'Waveform', dataType: 'time', draw: drawWaveform },
    spectrogram: { label: 'Spectrogram', dataType: 'freq', draw: drawSpectrogram },
    spectrum: { label: 'Spectrum', dataType: 'freq', draw: drawSpectrum },
    psychedelic: { label: 'Psychedelic', dataType: 'freq', draw: drawPsychedelic },
    radial: { label: 'Radial', dataType: 'freq', draw: drawRadial }
  };

  var VIZ_MODE_NAMES = Object.keys(VIZ_MODES);

  // ============================================
  // WordArt Style Definitions
  // ============================================

  var WORDART_STYLES = {
    one: { label: 'Style 1 - Outlined' },
    two: { label: 'Style 2 - Slanted' },
    three: { label: 'Style 3 - Italic Shadow' },
    four: { label: 'Style 4 - Blue Serif' },
    five: { label: 'Style 5 - 3D Purple' },
    six: { label: 'Style 6 - Silver' },
    seven: { label: 'Style 7 - Impact Blue' },
    eight: { label: 'Style 8 - Sunset' },
    nine: { label: 'Style 9 - Purple Skew' },
    ten: { label: 'Style 10 - Green Echo' },
    eleven: { label: 'Style 11 - Blue 3D' },
    twelve: { label: 'Style 12 - Teal Serif' },
    thirteen: { label: 'Style 13 - Western' },
    fourteen: { label: 'Style 14 - Pink Depth' },
    fifteen: { label: 'Style 15 - Gold' },
    sixteen: { label: 'Style 16 - Cyan Navy' },
    seventeen: { label: 'Style 17 - Striped' },
    eighteen: { label: 'Style 18 - Chrome' },
    nineteen: { label: 'Style 19 - Green 3D' },
    twenty: { label: 'Style 20 - Silver 3D' },
    twentyone: { label: 'Style 21 - Fire' },
    twentytwo: { label: 'Style 22 - Ice & Fire' }
  };

  var WORDART_STYLE_NAMES = Object.keys(WORDART_STYLES);

  // ============================================
  // Retro Definitions - Single Source of Truth
  // ============================================

  var RETROS = [
    // DOM retros (have HTML elements)
    { name: 'badges', type: 'dom', emoji: '🏅', label: 'Badges' },
    { name: 'media-player', type: 'dom', emoji: '🎵', label: 'Media Player' },
    { name: 'webring', type: 'dom', emoji: '🔗', label: 'Webring' },
    { name: 'counter', type: 'dom', emoji: '👀', label: 'Visitor Counter' },
    { name: 'guestbook', type: 'dom', emoji: '📖', label: 'Guestbook' },
    // JS retros (initialize via JavaScript)
    { name: 'mouse-trail', type: 'js', emoji: '✨', label: 'Mouse Trail', init: initMouseTrail },
    { name: 'blink', type: 'js', emoji: '💡', label: 'Blink', init: initBlink },
    { name: 'marquee', type: 'js', emoji: '📜', label: 'Marquee', init: initMarquee },
    { name: 'wordart', type: 'js', emoji: '🔤', label: 'WordArt', init: initWordArt },
    { name: 'custom-cursor', type: 'js', emoji: '🖱️', label: 'Custom Cursor', init: initCustomCursor },
    { name: 'dividers', type: 'js', emoji: '〰️', label: 'Dividers', init: initDividers },
    { name: 'image-rotate', type: 'js', emoji: '🔄', label: 'Image Rotate', init: initImageRotate },
    { name: 'retheme', type: 'js', emoji: '🎨', label: 'Retheme', init: initRetheme },
    { name: 'perspective', type: 'js', emoji: '🎲', label: '3D Tilt', init: initPerspective },
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
    { name: 'flash', type: 'theme', emoji: '⚡', label: 'Flash Site', resources: { js: 'flash.js', css: 'flash.css' } }
  ];

  // Derived arrays
  var ALL_DOM_RETROS = RETROS.filter(function(r) { return r.type === 'dom'; }).map(function(r) { return r.name; });
  var ALL_JS_RETROS = RETROS.filter(function(r) { return r.type === 'js'; }).map(function(r) { return r.name; });
  var ALL_FUN_RETROS = RETROS.filter(function(r) { return r.type !== 'theme'; }).map(function(r) { return r.name; });
  var THEME_NAMES = RETROS.filter(function(r) { return r.type === 'theme'; }).map(function(r) { return r.name; });

  // Legacy THEMES object for backwards compatibility
  var THEMES = {};
  RETROS.filter(function(r) { return r.type === 'theme'; }).forEach(function(r) {
    THEMES[r.name] = { emoji: r.emoji, label: r.label, init: r.init, resources: r.resources };
  });

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
      if (Math.random() < 0.5) {
        selections.retros.push(retro.name);
      }
    });

    // Random dropdown selections
    function randomOption(options) {
      return randomFrom(options);
    }

    selections.styles.song = randomOption([''].concat(config.music.map(function(t) {
      return t.src.split('/').pop().replace(/\.[^.]+$/, '');
    })));
    selections.styles.viz = randomOption([''].concat(VIZ_MODE_NAMES));
    selections.styles.wordart = randomOption(['none', ''].concat(WORDART_STYLE_NAMES));
    selections.styles.cursor = randomOption(['none'].concat(CURSOR_STYLE_NAMES));
    selections.styles.trail = randomOption(['none', ''].concat(TRAIL_STYLE_NAMES));
    selections.styles.theme = randomOption(['none', ''].concat(THEME_NAMES));
    selections.styles.divider = randomOption(['none', ''].concat(config.dividers.map(function(_, i) {
      return (i + 1).toString();
    })));

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

    // Apply style selections as params
    var styleMap = {
      wordart: { retro: 'wordart', param: 'wordart-style' },
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
  // Mouse Trail
  // ============================================

  function initMouseTrail() {
    var trailParam = params.get('trail-style');
    var trailStyle = TRAIL_STYLE_NAMES.includes(trailParam) ? trailParam : randomFrom(TRAIL_STYLE_NAMES);

    if (trailStyle === 'ghost') {
      initCursorTrail('ghost');
      document.body.classList.add('trail-style-ghost');
      return;
    }
    if (trailStyle === 'elastic') {
      initCursorTrail('elastic');
      document.body.classList.add('trail-style-elastic');
      return;
    }

    var styleDef = TRAIL_STYLES[trailStyle];
    var lastSpawn = 0;
    var hue = 0;
    var throttle = styleDef.throttle || 50;

    function spawnTrail(x, y) {
      var now = Date.now();
      if (now - lastSpawn < throttle) return;
      lastSpawn = now;

      var el = createElement('span');
      el.className = 'mouse-trail trail-' + trailStyle;
      el.style.left = (x + (Math.random() - 0.5) * 10) + 'px';
      el.style.top = (y + (Math.random() - 0.5) * 10) + 'px';
      el.style.setProperty('--drift-x', (Math.random() - 0.5) * 30 + 'px');
      el.style.setProperty('--drift-y', styleDef.driftY ? styleDef.driftY() : (Math.random() - 0.5) * 30 + 'px');

      // Get character
      var chars = styleDef.chars;
      el.textContent = typeof chars === 'function' ? chars() : randomFrom(chars);

      // Get color
      if (styleDef.color) {
        if (styleDef.hueStep) {
          hue = (hue + styleDef.hueStep) % 360;
          el.style.color = styleDef.color(hue);
        } else {
          el.style.color = styleDef.color();
        }
      }

      // Get text shadow
      if (styleDef.textShadow) {
        el.style.textShadow = styleDef.textShadow(hue, el.style.color);
      }

      document.body.appendChild(el);
      setTimeout(function() {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 1000);
    }

    function handleMove(x, y) {
      spawnTrail(x, y);
    }

    document.addEventListener('mousemove', function(e) {
      handleMove(e.clientX, e.clientY);
    });

    document.addEventListener('touchstart', function(e) {
      var touch = e.touches[0];
      if (touch) handleMove(touch.clientX, touch.clientY);
    }, { passive: true });

    document.addEventListener('touchmove', function(e) {
      var touch = e.touches[0];
      if (touch) handleMove(touch.clientX, touch.clientY);
    }, { passive: true });

    document.body.classList.add('trail-style-' + trailStyle);
  }

  // ============================================
  // Cursor Image Trail - Ghost and Elastic modes
  // ============================================

  function initCursorTrail(mode) {
    var cursorImg = new Image();
    var cursorParam = params.get('cursor-style');

    if (cursorParam === 'custom' && config.cursorUrl) {
      cursorImg.src = config.cursorUrl;
    } else if (cursorParam && cursorParam !== 'none' && cursorParam !== 'custom') {
      cursorImg.src = config.basePath + '/cursors/' + cursorParam + '.png';
    } else {
      cursorImg.src = config.basePath + '/cursors/win95.png';
    }

    var result = createFullscreenCanvas(100002, undefined, false);
    var canvas = result.canvas;
    var ctx = result.ctx;
    var particles = [];
    var trailLength = 50;
    var cursorScale = 1.0;
    var lifeSpan = 65;
    var maxAge = 200;

    setupCanvasResize(canvas);

    function Particle(x, y) {
      this.x = x;
      this.y = y;
      this.lifeSpan = lifeSpan;
      this.initialLife = lifeSpan;
      this.birthTime = Date.now();
    }

    var cursorX = 0, cursorY = 0;
    var lastSpawn = 0;
    var spawnRate = mode === 'elastic' ? 3 : 6;

    document.addEventListener('mousemove', function(e) {
      cursorX = e.clientX;
      cursorY = e.clientY;

      var now = Date.now();
      if (now - lastSpawn > spawnRate) {
        lastSpawn = now;
        particles.push(new Particle(cursorX, cursorY));
        if (particles.length > trailLength) {
          particles.shift();
        }
      }
    });

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      var scaledWidth = cursorImg.width * cursorScale;
      var scaledHeight = cursorImg.height * cursorScale;
      var now = Date.now();

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];

        if (mode === 'ghost') {
          p.lifeSpan--;
          if (p.lifeSpan <= 0) {
            particles.splice(i, 1);
            i--;
            continue;
          }
          ctx.globalAlpha = (p.lifeSpan / p.initialLife) * 0.8;
        } else {
          var age = now - p.birthTime;
          if (age >= maxAge) {
            particles.splice(i, 1);
            i--;
            continue;
          }
          ctx.globalAlpha = 0.8;
        }

        ctx.drawImage(cursorImg, p.x, p.y, scaledWidth, scaledHeight);
      }

      ctx.globalAlpha = 1;
      requestAnimationFrame(animate);
    }

    cursorImg.onload = animate;
    if (cursorImg.complete) animate();
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
  // Theme: Flash Mode (lazy-loaded from retros/flash.js)
  // ============================================
  // Flash theme is now loaded on-demand via the plugin system.
  // See retros/flash.js for the implementation.

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
  // WordArt
  // ============================================

  function initWordArt() {
    var h1 = document.querySelector('h1');
    if (!h1) return;

    var styleParam = params.get('wordart-style');
    var selectedStyle = WORDART_STYLE_NAMES.includes(styleParam) ? styleParam : randomFrom(WORDART_STYLE_NAMES);

    var container = createElement('div');
    container.className = 'wordart-container';
    h1.classList.add('wordart');
    h1.setAttribute('data-content', h1.textContent);
    h1.parentNode.insertBefore(container, h1);
    container.appendChild(h1);
    document.body.classList.add('wordart-style-' + selectedStyle);
  }

  // ============================================
  // Enable JS Retros
  // ============================================

  function enableJsRetros(selectedRetros) {
    RETROS.forEach(function(retro) {
      if (retro.type === 'js' && retro.init && selectedRetros.indexOf(retro.name) !== -1) {
        retro.init();
      }
    });
  }

  // ============================================
  // Media Player - Visualization Functions
  // ============================================

  function drawWaveform(ctx, canvas, dataArray, analyser) {
    analyser.getByteTimeDomainData(dataArray);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#0f0';
    ctx.beginPath();
    var sliceWidth = canvas.width / dataArray.length;
    for (var i = 0; i < dataArray.length; i++) {
      var v = dataArray[i] / 128.0;
      var y = v * canvas.height / 2;
      if (i === 0) ctx.moveTo(0, y);
      else ctx.lineTo(i * sliceWidth, y);
    }
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
  }

  function drawSpectrogram(ctx, canvas, dataArray, analyser) {
    analyser.getByteFrequencyData(dataArray);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    var barWidth = canvas.width / dataArray.length;
    for (var i = 0; i < dataArray.length; i++) {
      var barHeight = (dataArray[i] / 255) * canvas.height;
      ctx.fillStyle = 'rgb(0,' + Math.floor(100 + (dataArray[i] / 255) * 155) + ',0)';
      ctx.fillRect(i * barWidth, canvas.height - barHeight, barWidth, barHeight);
    }
  }

  function drawSpectrum(ctx, canvas, dataArray, analyser) {
    analyser.getByteFrequencyData(dataArray);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    var sliceWidth = canvas.width / dataArray.length;

    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    for (var i = 0; i < dataArray.length; i++) {
      ctx.lineTo(i * sliceWidth, canvas.height - (dataArray[i] / 255) * canvas.height);
    }
    ctx.lineTo(canvas.width, canvas.height);
    ctx.closePath();
    ctx.fillStyle = 'rgba(0, 80, 0, 0.6)';
    ctx.fill();

    ctx.beginPath();
    for (var j = 0; j < dataArray.length; j++) {
      var y = canvas.height - (dataArray[j] / 255) * canvas.height;
      if (j === 0) ctx.moveTo(0, y);
      else ctx.lineTo(j * sliceWidth, y);
    }
    ctx.strokeStyle = '#0f0';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  var psychedelicHue = 0;

  function drawPsychedelic(ctx, canvas, dataArray, analyser) {
    analyser.getByteFrequencyData(dataArray);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    psychedelicHue = (psychedelicHue + 2) % 360;
    var barWidth = canvas.width / dataArray.length;
    var centerY = canvas.height / 2;
    for (var i = 0; i < dataArray.length; i++) {
      var amplitude = dataArray[i] / 255;
      var barHeight = amplitude * centerY;
      var hue = (psychedelicHue + (i / dataArray.length) * 360) % 360;
      ctx.fillStyle = 'hsl(' + hue + ', 100%, ' + (40 + amplitude * 30) + '%)';
      ctx.fillRect(i * barWidth, centerY - barHeight, barWidth - 1, barHeight);
      ctx.fillRect(i * barWidth, centerY, barWidth - 1, barHeight);
    }
  }

  var radialRotation = 0;

  function drawRadial(ctx, canvas, dataArray, analyser) {
    analyser.getByteFrequencyData(dataArray);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    radialRotation += 0.005;
    var centerX = canvas.width / 2, centerY = canvas.height / 2;
    var radius = Math.min(centerX, centerY) * 0.3;
    var bars = dataArray.length / 2;
    for (var i = 0; i < bars; i++) {
      var amplitude = dataArray[i] / 255;
      var angle = (i / bars) * Math.PI * 2 + radialRotation;
      var x1 = centerX + Math.cos(angle) * radius;
      var y1 = centerY + Math.sin(angle) * radius;
      var x2 = centerX + Math.cos(angle) * (radius + amplitude * radius * 2);
      var y2 = centerY + Math.sin(angle) * (radius + amplitude * radius * 2);
      ctx.strokeStyle = 'rgb(0,' + Math.floor(100 + amplitude * 155) + ',0)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  }

  // ============================================
  // Media Player
  // ============================================

  function initMediaPlayer() {
    var audio = document.getElementById('audioPlayer');
    var select = document.getElementById('trackSelector');
    var canvas = document.getElementById('waveformCanvas');

    if (!audio || !select || !canvas) return;

    select.innerHTML = '';
    config.music.forEach(function(track) {
      var option = createElement('option');
      option.value = track.src;
      option.textContent = track.label;
      select.appendChild(option);
    });

    select.onchange = function() {
      audio.src = select.value;
      audio.load();
    };

    var songParam = params.get('song');
    if (songParam) {
      var idx = [...select.options].findIndex(function(o) { return o.value.includes(songParam); });
      if (idx >= 0) select.selectedIndex = idx;
    } else {
      select.selectedIndex = Math.floor(Math.random() * select.options.length);
    }
    audio.src = select.value;

    var ctx = canvas.getContext('2d');
    var audioCtx, analyser, source, dataArray;
    var initialized = false;

    var vizOverride = params.get('viz');
    var vizMode = VIZ_MODE_NAMES.includes(vizOverride) ? vizOverride : randomFrom(VIZ_MODE_NAMES);

    function sizeCanvas() {
      var container = canvas.parentElement;
      if (container) {
        canvas.width = container.offsetWidth - 4;
        canvas.height = container.offsetHeight - 4;
      }
    }
    window.addEventListener('load', sizeCanvas);
    setTimeout(sizeCanvas, 0);

    function initAudio() {
      if (initialized) return;
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source = audioCtx.createMediaElementSource(audio);
      source.connect(analyser);
      analyser.connect(audioCtx.destination);
      dataArray = new Uint8Array(analyser.frequencyBinCount);
      initialized = true;
    }

    function draw() {
      requestAnimationFrame(draw);
      if (!initialized || audio.paused) {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        return;
      }

      var vizDef = VIZ_MODES[vizMode];
      if (vizDef && vizDef.draw) {
        vizDef.draw(ctx, canvas, dataArray, analyser);
      }
    }

    audio.addEventListener('play', function() {
      initAudio();
      if (audioCtx.state === 'suspended') audioCtx.resume();
    });

    draw();
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
  // Control Panel
  // ============================================

  var controlPanelInitialized = false;
  var THEME_CONTROLLED_RETROS = ['retheme', 'wordart', 'mouse-trail', 'custom-cursor', 'dividers'];

  function initControlPanel(retroList) {
    var panel = document.getElementById('control-panel');
    if (!panel || controlPanelInitialized) return;
    controlPanelInitialized = true;

    initRetroCheckboxes(retroList);
    initControlDropdowns(retroList);
    initDividerDropdown();
    initCustomSelects();
    initControlButtons(panel, retroList);

    if (retroList.indexOf('control-panel') !== -1) {
      panel.style.display = 'block';
    }
  }

  function initRetroCheckboxes(retroList) {
    var checkboxGrid = document.getElementById('retro-checkboxes');
    if (!checkboxGrid) return;

    RETROS.forEach(function(retro) {
      // Skip themes (controlled via theme dropdown) and dropdown-controlled retros
      if (retro.type === 'theme') return;
      if (THEME_CONTROLLED_RETROS.indexOf(retro.name) !== -1) return;

      var row = createElement('div');
      row.className = 'field-row checkbox-row';

      var checkbox = createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = 'ctrl-retro-' + retro.name;
      checkbox.checked = retroList.indexOf(retro.name) !== -1;

      var label = createElement('label');
      label.htmlFor = checkbox.id;
      label.textContent = retro.emoji + ' ' + retro.label;

      row.appendChild(checkbox);
      row.appendChild(label);
      checkboxGrid.appendChild(row);
    });
  }

  function initDropdownValue(selectEl, paramName, retroList, retroName, defaultForActive) {
    if (!selectEl) return;

    var paramValue = params.get(paramName);
    var hasRetro = retroList.indexOf(retroName) !== -1;

    if (paramValue !== null) {
      selectEl.value = paramValue;
    } else if (hasRetro) {
      selectEl.value = defaultForActive || '';
    } else {
      selectEl.value = 'none';
    }
  }

  function populateDropdown(selectEl, items, options) {
    if (!selectEl) return;
    options = options || {};

    // Add options from items object
    Object.keys(items).forEach(function(key) {
      var item = items[key];
      var option = createElement('option');
      option.value = key;
      var label = item.label || key;
      option.textContent = item.emoji ? item.emoji + ' ' + label : label;
      selectEl.appendChild(option);
    });
  }

  function initControlDropdowns(retroList) {
    var ctrlSong = document.getElementById('ctrl-song');
    var ctrlViz = document.getElementById('ctrl-viz');
    var ctrlWordart = document.getElementById('ctrl-wordart');
    var ctrlCursor = document.getElementById('ctrl-cursor');
    var ctrlTrail = document.getElementById('ctrl-trail');
    var ctrlTheme = document.getElementById('ctrl-theme');

    // Populate song options
    if (ctrlSong) {
      config.music.forEach(function(track) {
        var option = createElement('option');
        var filename = track.src.split('/').pop().replace(/\.[^.]+$/, '');
        option.value = filename;
        option.textContent = track.label;
        ctrlSong.appendChild(option);
      });
      ctrlSong.value = params.get('song') || '';
    }

    // Populate visualization options
    populateDropdown(ctrlViz, VIZ_MODES);
    if (ctrlViz) ctrlViz.value = params.get('viz') || '';

    // Populate wordart options
    populateDropdown(ctrlWordart, WORDART_STYLES);
    initDropdownValue(ctrlWordart, 'wordart-style', retroList, 'wordart', '');

    // Populate cursor options
    populateDropdown(ctrlCursor, CURSOR_STYLES);
    initDropdownValue(ctrlCursor, 'cursor-style', retroList, 'custom-cursor', 'custom');

    // Populate trail options
    populateDropdown(ctrlTrail, TRAIL_STYLES);
    initDropdownValue(ctrlTrail, 'trail-style', retroList, 'mouse-trail', '');

    // Populate theme options
    populateDropdown(ctrlTheme, THEMES);
    initDropdownValue(ctrlTheme, 'theme', retroList, 'retheme', '');
  }

  function initCustomSelects() {
    var panel = document.getElementById('control-panel');
    if (!panel) return;

    var selects = panel.querySelectorAll('select');
    selects.forEach(function(select) {
      var isDivider = select.id === 'ctrl-divider';

      // Create wrapper for positioning
      var wrapper = createElement('div');
      wrapper.className = 'custom-select-wrapper';
      if (isDivider) wrapper.classList.add('custom-select-divider');
      select.parentNode.insertBefore(wrapper, select);
      wrapper.appendChild(select);

      // Create selected preview overlay for dividers
      var selectedPreview = null;
      if (isDivider) {
        selectedPreview = createElement('div');
        selectedPreview.className = 'custom-select-preview';
        wrapper.appendChild(selectedPreview);
      }

      // Create custom dropdown list
      var dropdown = createElement('div');
      dropdown.className = 'custom-select-dropdown';

      function rebuildOptions() {
        dropdown.innerHTML = '';
        Array.prototype.forEach.call(select.options, function(opt) {
          var item = createElement('div');
          item.className = 'custom-select-option';
          item.dataset.value = opt.value;

          // Special rendering for divider options
          if (isDivider && opt.dataset.dividerSrc) {
            var preview = createElement('div');
            preview.className = 'divider-preview';
            preview.style.backgroundImage = 'url(' + opt.dataset.dividerSrc + ')';
            item.appendChild(preview);
          } else {
            item.textContent = opt.textContent;
          }

          dropdown.appendChild(item);
        });
      }

      function updateSelectedPreview() {
        if (!selectedPreview) return;
        var selectedOption = select.options[select.selectedIndex];
        if (selectedOption && selectedOption.dataset.dividerSrc) {
          selectedPreview.style.backgroundImage = 'url(' + selectedOption.dataset.dividerSrc + ')';
          selectedPreview.style.display = 'block';
        } else {
          selectedPreview.style.display = 'none';
        }
      }

      rebuildOptions();
      wrapper.appendChild(dropdown);

      // Observe changes to select options (for dynamically populated selects)
      var observer = new MutationObserver(function() {
        rebuildOptions();
        updateSelectedPreview();
      });
      observer.observe(select, { childList: true });

      // Update preview when select value changes
      select.addEventListener('change', updateSelectedPreview);

      // Initial preview update (delayed to allow options to populate)
      setTimeout(updateSelectedPreview, 0);

      // Prevent native dropdown
      select.addEventListener('mousedown', function(e) {
        e.preventDefault();
        select.focus();
        wrapper.classList.toggle('open');
      });

      // Handle keyboard
      select.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          wrapper.classList.toggle('open');
        } else if (e.key === 'Escape') {
          wrapper.classList.remove('open');
        }
      });

      // Option click
      dropdown.addEventListener('click', function(e) {
        var item = e.target.closest('.custom-select-option');
        if (item) {
          select.value = item.dataset.value;
          select.dispatchEvent(new Event('change'));
          rebuildOptions();
          wrapper.classList.remove('open');
        }
      });
    });

    // Close all dropdowns on outside click
    document.addEventListener('click', function(e) {
      if (!e.target.closest('.custom-select-wrapper')) {
        panel.querySelectorAll('.custom-select-wrapper.open').forEach(function(w) {
          w.classList.remove('open');
        });
      }
    });
  }

  function initDividerDropdown() {
    var ctrlDivider = document.getElementById('ctrl-divider');
    if (!ctrlDivider) return;

    // Populate divider options
    config.dividers.forEach(function(dividerSrc, index) {
      var option = createElement('option');
      option.value = (index + 1).toString();
      option.textContent = 'Divider ' + (index + 1);
      option.dataset.dividerSrc = dividerSrc;
      ctrlDivider.appendChild(option);
    });
  }

  function initControlButtons(panel, retroList) {
    var ctrlDivider = document.getElementById('ctrl-divider');

    // Initialize divider value
    var dividerParam = params.get('divider-style');
    var hasDividers = retroList.indexOf('dividers') !== -1;
    var initialValue = dividerParam !== null ? dividerParam : (hasDividers ? '' : 'none');
    if (ctrlDivider) ctrlDivider.value = initialValue;

    // Close button
    document.getElementById('ctrl-close').addEventListener('click', function() {
      var currentRetros = (params.get('retros') || params.get('retro') || '').split(',').map(function(r) {
        return r.trim();
      }).filter(Boolean);

      if (currentRetros.indexOf('control-panel') !== -1) {
        var newParams = new URLSearchParams(window.location.search);
        var filteredRetros = currentRetros.filter(function(r) { return r !== 'control-panel'; });
        newParams.delete('retro');
        newParams.set('retros', filteredRetros.length > 0 ? filteredRetros.join(',') : 'none');
        window.location.search = newParams.toString();
      } else {
        panel.style.display = 'none';
      }
    });

    // Random button
    document.getElementById('ctrl-random').addEventListener('click', function() {
      var selections = generateRandomSelections();

      // Apply retro checkboxes
      RETROS.forEach(function(retro) {
        var cb = document.getElementById('ctrl-retro-' + retro.name);
        if (cb) cb.checked = selections.retros.indexOf(retro.name) !== -1;
      });

      // Apply dropdown selections
      var dropdownMap = {
        'ctrl-song': 'song',
        'ctrl-viz': 'viz',
        'ctrl-wordart': 'wordart',
        'ctrl-cursor': 'cursor',
        'ctrl-trail': 'trail',
        'ctrl-theme': 'theme'
      };
      Object.keys(dropdownMap).forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.value = selections.styles[dropdownMap[id]];
      });

      // Apply divider
      if (ctrlDivider) {
        ctrlDivider.value = selections.styles.divider;
        ctrlDivider.dispatchEvent(new Event('change'));
      }
    });

    // Apply button
    document.getElementById('ctrl-apply').addEventListener('click', function() {
      var newParams = new URLSearchParams();
      var selectedRetros = [];

      RETROS.forEach(function(retro) {
        // Skip themes (controlled via theme dropdown) and dropdown-controlled retros
        if (retro.type === 'theme') return;
        if (THEME_CONTROLLED_RETROS.indexOf(retro.name) !== -1) return;
        var cb = document.getElementById('ctrl-retro-' + retro.name);
        if (cb && cb.checked) selectedRetros.push(retro.name);
      });

      var dropdownRetros = [
        { id: 'ctrl-wordart', retro: 'wordart', param: 'wordart-style' },
        { id: 'ctrl-cursor', retro: 'custom-cursor', param: 'cursor-style' },
        { id: 'ctrl-trail', retro: 'mouse-trail', param: 'trail-style' },
        { id: 'ctrl-theme', retro: 'retheme', param: 'theme' },
        { id: 'ctrl-divider', retro: 'dividers', param: 'divider-style' }
      ];

      dropdownRetros.forEach(function(d) {
        var el = document.getElementById(d.id);
        if (el && el.value !== 'none') {
          selectedRetros.push(d.retro);
          if (el.value) newParams.set(d.param, el.value);
        }
      });

      selectedRetros.push('control-panel');

      if (selectedRetros.length > 0) newParams.set('retros', selectedRetros.join(','));

      var ctrlSong = document.getElementById('ctrl-song');
      var ctrlViz = document.getElementById('ctrl-viz');
      if (ctrlSong && ctrlSong.value) newParams.set('song', ctrlSong.value);
      if (ctrlViz && ctrlViz.value) newParams.set('viz', ctrlViz.value);

      window.location.search = newParams.toString();
    });

    // Reset button
    document.getElementById('ctrl-reset').addEventListener('click', function() {
      window.location.search = 'retros=control-panel';
    });
  }

  function showControlPanel() {
    var panel = document.getElementById('control-panel');
    if (!panel) return;

    var retroParam = params.get('retros') || params.get('retro') || '';
    var retroList = retroParam.split(',').map(function(r) { return r.trim(); }).filter(Boolean);
    initControlPanel(retroList);

    panel.style.display = 'block';
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
          showControlPanel();
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
      if (dy > 100 && dt < 500) showControlPanel();
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
    initMediaPlayer();
    initVisitorCounter();
    initWebring();
    initGuestbook();
    enableJsRetros(selectedRetros);

    Promise.all([
      loadTemplate(config.basePath + '/control-panel.html'),
      loadTemplate(config.basePath + '/chat-window.html')
    ]).then(function(templates) {
      // Use documentElement to avoid stacking context issues with body transforms
      document.documentElement.appendChild(templates[0]);
      document.documentElement.appendChild(templates[1]);
      initControlPanel(selectedRetros);
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
