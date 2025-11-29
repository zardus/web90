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

  // Auto-detect base path from script location
  var scripts = document.getElementsByTagName('script');
  var currentScript = scripts[scripts.length - 1];
  var scriptSrc = currentScript.src || '';
  var detectedBasePath = scriptSrc.substring(0, scriptSrc.lastIndexOf('/')) || '/web90';

  // Default configuration
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
    randomRetros: null,      // Array of retro names to randomly choose from (null = all retros)
    aprilFoolsRetros: null   // Array of retro names for April Fools chaos (null = all retros)
  };

  // Merge user config with defaults
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
    { name: 'glitch', type: 'js', emoji: '📼', label: 'VHS Glitch', init: initGlitch }
  ];

  // Slots are detected from DOM via data-retro-slot attribute
  // First slot (primary container) keeps elements in place, others receive overflow
  function getSlots() {
    var slots = Array.from(document.querySelectorAll('[data-retro-slot]'));
    // Sort by slot number
    slots.sort(function(a, b) {
      var orderA = parseInt(a.dataset.retroSlot, 10);
      var orderB = parseInt(b.dataset.retroSlot, 10);
      if (isNaN(orderA)) orderA = 999;
      if (isNaN(orderB)) orderB = 999;
      return orderA - orderB;
    });
    return slots;
  }

  // Derived arrays
  var ALL_DOM_RETROS = RETROS.filter(function(r) { return r.type === 'dom'; }).map(function(r) { return r.name; });
  var ALL_JS_RETROS = RETROS.filter(function(r) { return r.type === 'js'; }).map(function(r) { return r.name; });
  var ALL_FUN_RETROS = RETROS.map(function(r) { return r.name; });

  // Shuffle array in place (Fisher-Yates)
  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
    }
    return arr;
  }

  // ============================================
  // April Fools Detection
  // ============================================
  function isAprilFools() {
    var today = new Date();
    return today.getMonth() === 3 && today.getDate() === 1;
  }

  // ============================================
  // April Fools Random Selection
  // Selects a random number of retros for maximum chaos
  // ============================================
  function selectAprilFoolsRetros() {
    // null/undefined = all retros; empty array = no retros; array = only those retros
    var pool;
    if (Array.isArray(config.aprilFoolsRetros)) {
      if (config.aprilFoolsRetros.length === 0) {
        return []; // Empty array = no April Fools retros
      }
      pool = config.aprilFoolsRetros.filter(function(r) { return ALL_FUN_RETROS.indexOf(r) !== -1; });
      if (pool.length === 0) {
        return []; // All specified retros were invalid
      }
    } else {
      pool = ALL_FUN_RETROS.slice();
    }

    var allRetros = shuffle(pool);
    // Pick random count, weighted toward chaos (sqrt biases toward more)
    var minRetros = 2;
    var maxRetros = allRetros.length;
    var count = Math.floor(Math.sqrt(Math.random()) * (maxRetros - minRetros + 1)) + minRetros;
    return allRetros.slice(0, count);
  }

  // ============================================
  // Retro List Parser
  // ============================================
  function parseRetroList() {
    var retroParam = params.get('retros') || params.get('retro');
    if (!retroParam) return null;

    var retros = retroParam.split(',').map(function(r) { return r.trim().toLowerCase(); });

    if (retros.length === 1 && retros[0] === 'none') return [];

    // Handle "april-fools"
    if (retros.indexOf('april-fools') !== -1) {
      var aprilFoolsRetros = selectAprilFoolsRetros();
      var extras = retros.filter(function(r) {
        return r !== 'april-fools' && ALL_FUN_RETROS.indexOf(r) === -1;
      });
      retros = aprilFoolsRetros.concat(extras);
      return retros.filter(function(r, i, arr) { return arr.indexOf(r) === i; });
    }

    // Handle "all"
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

    // Handle DOM retros
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
    // null/undefined = all retros; empty array = no retros; array = only those retros
    if (Array.isArray(config.randomRetros)) {
      if (config.randomRetros.length === 0) {
        return null; // Empty array = no random retro
      }
      var pool = config.randomRetros.filter(function(r) { return ALL_FUN_RETROS.indexOf(r) !== -1; });
      if (pool.length === 0) {
        return null; // All specified retros were invalid
      }
    } else {
      var pool = ALL_FUN_RETROS;
    }

    var selected = pool[Math.floor(Math.random() * pool.length)];

    if (ALL_DOM_RETROS.indexOf(selected) !== -1) {
      var el = document.getElementById('retro-' + selected);
      if (el) el.style.display = 'flex';
    }

    return selected;
  }

  // ============================================
  // Distribute DOM Retros
  // Randomizes order and fills slots detected via data-retro-slot
  // ============================================
  function distributeRetros(domRetros) {
    var shuffled = shuffle(domRetros.slice());
    var slots = getSlots();

    shuffled.forEach(function(name, index) {
      var el = document.getElementById('retro-' + name);
      if (!el) return;

      // First element stays in primary container (index 0)
      // Others go to overflow slots, defaulting to slot[1] if available
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
  // JS Retro Initializers
  // ============================================

  // Mouse trail styles - selectable via ?trail-style=xxx
  var TRAIL_STYLES = ['binary', 'sparkles', 'fire', 'rainbow', 'stars', 'hearts', 'neon', 'bubbles', 'snow', 'matrix', 'ghost', 'elastic'];

  function initMouseTrail() {
    var trailParam = params.get('trail-style');
    var trailStyle = TRAIL_STYLES.includes(trailParam) ? trailParam : TRAIL_STYLES[Math.floor(Math.random() * TRAIL_STYLES.length)];

    // Ghost and elastic trails use canvas-based cursor image rendering
    if (trailStyle === 'ghost') {
      initGhostTrail();
      document.body.classList.add('trail-style-ghost');
      return;
    }
    if (trailStyle === 'elastic') {
      initElasticTrail();
      document.body.classList.add('trail-style-elastic');
      return;
    }

    var lastSpawn = 0;
    var hue = 0;

    function spawnTrail(x, y) {
      var now = Date.now();
      var throttle = trailStyle === 'rainbow' ? 30 : 50;
      if (now - lastSpawn < throttle) return;
      lastSpawn = now;

      var el = document.createElement('span');
      el.className = 'mouse-trail trail-' + trailStyle;
      el.style.left = (x + (Math.random() - 0.5) * 10) + 'px';
      el.style.top = (y + (Math.random() - 0.5) * 10) + 'px';
      el.style.setProperty('--drift-x', (Math.random() - 0.5) * 30 + 'px');
      el.style.setProperty('--drift-y', (Math.random() - 0.5) * 30 + 'px');

      switch (trailStyle) {
        case 'binary':
          el.textContent = Math.random() < 0.001 ? '2' : (Math.random() < 0.5 ? '0' : '1');
          break;
        case 'sparkles':
          el.textContent = ['✦', '✧', '★', '✯', '⋆', '✶', '✴', '✹'][Math.floor(Math.random() * 8)];
          el.style.color = 'hsl(' + Math.random() * 360 + ', 100%, 70%)';
          break;
        case 'fire':
          el.textContent = ['🔥', '💥', '✨', '⚡'][Math.floor(Math.random() * 4)];
          el.style.setProperty('--drift-y', -(30 + Math.random() * 40) + 'px');
          break;
        case 'rainbow':
          el.textContent = '●';
          hue = (hue + 15) % 360;
          el.style.color = 'hsl(' + hue + ', 100%, 60%)';
          el.style.textShadow = '0 0 10px hsl(' + hue + ', 100%, 50%)';
          break;
        case 'stars':
          el.textContent = ['⭐', '🌟', '💫', '✨'][Math.floor(Math.random() * 4)];
          break;
        case 'hearts':
          el.textContent = ['❤️', '💖', '💕', '💗', '💜', '💙'][Math.floor(Math.random() * 6)];
          break;
        case 'neon':
          el.textContent = ['◆', '◇', '○', '●', '□', '■'][Math.floor(Math.random() * 6)];
          var neonColors = ['#ff00ff', '#00ffff', '#ff0080', '#80ff00', '#0080ff'];
          var neonColor = neonColors[Math.floor(Math.random() * neonColors.length)];
          el.style.color = neonColor;
          el.style.textShadow = '0 0 5px ' + neonColor + ', 0 0 10px ' + neonColor + ', 0 0 20px ' + neonColor;
          break;
        case 'bubbles':
          el.textContent = ['○', '◌', '◯', '⬤'][Math.floor(Math.random() * 4)];
          el.style.color = 'rgba(100, 200, 255, 0.7)';
          el.style.setProperty('--drift-y', -(20 + Math.random() * 30) + 'px');
          break;
        case 'snow':
          el.textContent = ['❄', '❅', '❆', '✻'][Math.floor(Math.random() * 4)];
          el.style.color = '#fff';
          el.style.setProperty('--drift-y', (30 + Math.random() * 20) + 'px');
          break;
        case 'matrix':
          el.textContent = String.fromCharCode(0x30A0 + Math.floor(Math.random() * 96));
          el.style.color = '#0f0';
          el.style.textShadow = '0 0 5px #0f0, 0 0 10px #0f0, 0 0 2px #000, 0 0 4px #000';
          el.style.setProperty('--drift-y', (30 + Math.random() * 50) + 'px');
          break;
      }

      document.body.appendChild(el);
      setTimeout(function() {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 1000);
    }

    document.addEventListener('mousemove', function(e) {
      spawnTrail(e.clientX, e.clientY);
    });

    document.addEventListener('touchstart', function(e) {
      var touch = e.touches[0];
      if (touch) spawnTrail(touch.clientX, touch.clientY);
    }, { passive: true });

    document.addEventListener('touchmove', function(e) {
      var touch = e.touches[0];
      if (touch) spawnTrail(touch.clientX, touch.clientY);
    }, { passive: true });

    // Add trail style class to body for CSS
    document.body.classList.add('trail-style-' + trailStyle);
  }

  // ============================================
  // Cursor Image Trail - Ghost (fading) and Elastic (timed vanish)
  // ============================================
  function initCursorTrail(mode) {
    var cursorImg = new Image();

    // Use the active custom cursor if set, otherwise fall back to win95
    var cursorParam = params.get('cursor-style');
    if (cursorParam === 'custom' && config.cursorUrl) {
      cursorImg.src = config.cursorUrl;
    } else if (cursorParam && cursorParam !== 'none' && cursorParam !== 'custom') {
      // Named cursor style (e.g., 'hourglass')
      cursorImg.src = config.basePath + '/cursors/' + cursorParam + '.png';
    } else {
      cursorImg.src = config.basePath + '/cursors/win95.png';
    }

    var canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;';
    document.body.appendChild(canvas);

    var ctx = canvas.getContext('2d');
    var particles = [];
    var trailLength = 50;
    var cursorScale = 1.0; // 32x32 matches native cursor size

    // Ghost: fades out over lifeSpan frames
    // Elastic: vanishes after maxAge ms
    var lifeSpan = 65; // frames for ghost
    var maxAge = 200;  // ms for elastic

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

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

      // Draw oldest first so newest appears on top
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];

        if (mode === 'ghost') {
          // Ghost mode: fade out over lifeSpan frames
          p.lifeSpan--;
          if (p.lifeSpan <= 0) {
            particles.splice(i, 1);
            i--;
            continue;
          }
          var alpha = (p.lifeSpan / p.initialLife) * 0.8;
          ctx.globalAlpha = alpha;
        } else {
          // Elastic mode: vanish after maxAge ms
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

    cursorImg.onload = function() {
      animate();
    };

    if (cursorImg.complete) {
      animate();
    }
  }

  function initGhostTrail() {
    initCursorTrail('ghost');
  }

  function initElasticTrail() {
    initCursorTrail('elastic');
  }

  function initBlink() {
    var h1 = document.querySelector('h1');
    if (h1) h1.innerHTML = '<blink>' + h1.textContent + '</blink>';
  }

  function initMarquee() {
    var h1 = document.querySelector('h1');
    if (h1) h1.innerHTML = '<marquee>' + h1.textContent + '</marquee>';
  }

  // Cursor styles - selectable via ?cursor-style=xxx
  var CURSOR_STYLES = {
    'custom': null, // Uses config.cursorUrl
    'hourglass': '/cursors/hourglass.png'
  };

  function initCustomCursor() {
    var cursorParam = params.get('cursor-style');
    var cursorUrl;

    if (cursorParam && CURSOR_STYLES.hasOwnProperty(cursorParam)) {
      if (cursorParam === 'custom') {
        cursorUrl = config.cursorUrl;
      } else {
        cursorUrl = config.basePath + CURSOR_STYLES[cursorParam];
      }
    } else {
      // Default to config.cursorUrl for backwards compatibility
      cursorUrl = config.cursorUrl;
    }

    if (!cursorUrl) return;
    var style = document.createElement('style');
    style.textContent = 'body, body * { cursor: url(' + cursorUrl + '), auto !important; }';
    document.head.appendChild(style);
  }

  function initWebring() {
    var iframe = document.getElementById('webring');
    if (iframe && config.webringUrl) {
      iframe.src = config.webringUrl;
    }
  }

  function initGuestbook() {
    var iframe = document.getElementById('guestbook');
    if (iframe && config.guestbookUrl) {
      iframe.src = config.guestbookUrl;
    }
  }

  function initImageRotate() {
    document.querySelectorAll('img[data-image-rotate="true"]').forEach(function(img) {
      img.classList.add('retro-image-rotate');
    });
  }

  function initDividers() {
    // Replace hr elements inside .divider with tiling divider images
    document.querySelectorAll('div.divider hr').forEach(function(hr) {
      if (config.dividers.length === 0) return;
      var src = config.dividers[Math.floor(Math.random() * config.dividers.length)];
      var img = new Image();
      img.onload = function() {
        var div = document.createElement('div');
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
  // Themes: matrix, crt, neon, y2k, hampsterdance, table, flash, snow
  // ============================================
  var RETHEME_STYLES = ['matrix', 'crt', 'neon', 'y2k', 'hampsterdance', 'table', 'flash', 'snow'];

  function initRetheme() {
    var themeParam = params.get('theme');
    var theme = RETHEME_STYLES.includes(themeParam) ? themeParam : RETHEME_STYLES[Math.floor(Math.random() * RETHEME_STYLES.length)];

    document.body.classList.add('retheme-' + theme);

    switch (theme) {
      case 'matrix':
        initThemeMatrix();
        break;
      case 'crt':
        initThemeCRT();
        break;
      case 'neon':
        initThemeNeon();
        break;
      case 'y2k':
        initThemeY2K();
        break;
      case 'hampsterdance':
        initHampsterDance();
        break;
      case 'table':
        initTable();
        break;
      case 'flash':
        initFlash();
        break;
      case 'snow':
        initThemeTVSnow();
        break;
    }
  }

  function initThemeMatrix() {
    var canvas = document.createElement('canvas');
    canvas.id = 'matrix-bg';
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:-1;opacity:0;transition:opacity 1s ease;background:#000;';
    document.body.insertBefore(canvas, document.body.firstChild);

    var ctx = canvas.getContext('2d');
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

  function initThemeCRT() {
    // Add CRT overlay
    var overlay = document.createElement('div');
    overlay.className = 'crt-overlay';
    document.body.appendChild(overlay);

    // Add screen curvature effect
    var curvature = document.createElement('div');
    curvature.className = 'crt-curvature';
    document.body.appendChild(curvature);
  }

  function initThemeNeon() {
    // Add neon glow lines
    var colors = ['#ff00ff', '#00ffff', '#ff0080', '#80ff00'];
    for (var i = 0; i < 4; i++) {
      var line = document.createElement('div');
      line.className = 'neon-line';
      line.style.setProperty('--neon-color', colors[i]);
      line.style.top = (10 + i * 25) + '%';
      line.style.animationDelay = (i * 0.5) + 's';
      document.body.appendChild(line);
    }
  }

  function initThemeY2K() {
    // Add floating 3D shapes
    var shapes = ['💿', '🔮', '💎', '⚪', '🌐'];
    for (var i = 0; i < 8; i++) {
      var shape = document.createElement('div');
      shape.className = 'y2k-shape';
      shape.textContent = shapes[Math.floor(Math.random() * shapes.length)];
      shape.style.left = Math.random() * 100 + '%';
      shape.style.top = Math.random() * 100 + '%';
      shape.style.animationDuration = (5 + Math.random() * 10) + 's';
      shape.style.animationDelay = (Math.random() * 5) + 's';
      shape.style.fontSize = (20 + Math.random() * 40) + 'px';
      document.body.appendChild(shape);
    }
  }

  // ============================================
  // TV Snow / Static Effect Theme
  // ============================================
  function initThemeTVSnow() {
    var canvas = document.createElement('canvas');
    canvas.id = 'tv-snow';
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:99999;pointer-events:none;opacity:0.06;mix-blend-mode:overlay;';
    document.body.appendChild(canvas);

    var ctx = canvas.getContext('2d');

    function resize() {
      canvas.width = window.innerWidth / 4;
      canvas.height = window.innerHeight / 4;
    }

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

    resize();
    window.addEventListener('resize', resize);
    draw();
  }

  // ============================================
  // 3D Perspective - Tilt whole page on mouse move
  // ============================================
  function initPerspective() {
    // Wrap everything in a perspective container
    document.body.style.perspective = '1000px';
    document.body.style.perspectiveOrigin = '50% 50%';

    var wrapper = document.createElement('div');
    wrapper.className = 'perspective-wrapper';

    // Move all body children into wrapper
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
  // VHS Glitch Effect
  // ============================================
  function initGlitch() {
    document.body.classList.add('glitch-mode');

    var overlay = document.createElement('div');
    overlay.className = 'glitch-overlay';
    document.body.appendChild(overlay);

    // Random glitch bursts
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
  // Flash Mode - Y2K Macromedia Flash Experience
  // ============================================
  function initFlash() {
    // Extract semantic content from the page
    var header = document.querySelector('header');
    var nav = document.querySelector('nav');
    var sections = document.querySelectorAll('section[id]');
    var main = document.getElementById('main');

    if (!header || !sections.length) return;

    // Hide everything first
    document.body.classList.add('flash-mode');

    // Extract content data before we nuke everything
    var headshotImg = document.querySelector('.headshot');
    var headerContent = {
      title: header.querySelector('h1') ? header.querySelector('h1').textContent : 'Welcome',
      headshot: headshotImg ? headshotImg.src : null
    };

    var navLinks = [];
    if (nav) {
      nav.querySelectorAll('a').forEach(function(a) {
        navLinks.push({ text: a.textContent, href: a.href });
      });
    }

    var sectionData = [];
    sections.forEach(function(section) {
      sectionData.push({
        id: section.id,
        title: section.dataset.title || section.id,
        element: section // Keep reference to watch for dynamic content
      });
    });

    // Create the Flash container
    var flashContainer = document.createElement('div');
    flashContainer.id = 'flash-container';
    flashContainer.innerHTML = '\
      <div id="flash-loader">\
        <div class="flash-loader-content">\
          <div class="flash-logo">⚡</div>\
          <div class="flash-loading-text">Loading...</div>\
          <div class="flash-progress-container">\
            <div class="flash-progress-bar"></div>\
          </div>\
          <div class="flash-progress-percent">0%</div>\
          <div class="flash-macromedia">Made with Macromedia® Flash™</div>\
        </div>\
      </div>\
      <div id="flash-intro" style="display:none;">\
        <div class="flash-intro-content">\
          <div class="flash-intro-headshot"></div>\
          <div class="flash-intro-title"></div>\
          <div class="flash-intro-subtitle">ENTER SITE</div>\
          <button class="flash-enter-btn">► CLICK TO ENTER ◄</button>\
          <div class="flash-skip">[ skip intro ]</div>\
        </div>\
      </div>\
      <div id="flash-site" style="display:none;">\
        <div class="flash-header">\
          <div class="flash-header-left">\
            <div class="flash-header-headshot"></div>\
            <div class="flash-site-title"></div>\
          </div>\
          <div class="flash-nav"></div>\
        </div>\
        <div class="flash-main">\
          <div class="flash-sidebar"></div>\
          <div class="flash-content"></div>\
        </div>\
        <div class="flash-footer">\
          <span>© 2003 All Rights Reserved</span>\
          <span class="flash-visitor-count">Visitors: <span id="flash-visitors">0</span></span>\
          <span>Best viewed in 800x600</span>\
        </div>\
      </div>\
    ';

    // Hide the original content
    if (main) main.style.display = 'none';
    document.body.appendChild(flashContainer);

    // Keep control panel visible in flash mode - move it into flash container
    var controlPanel = document.getElementById('control-panel');
    if (controlPanel) {
      flashContainer.appendChild(controlPanel);
    }

    // Populate the Flash site with extracted content
    var flashTitle = flashContainer.querySelector('.flash-site-title');
    var introTitle = flashContainer.querySelector('.flash-intro-title');
    if (flashTitle) flashTitle.textContent = headerContent.title;
    if (introTitle) {
      introTitle.textContent = headerContent.title;
      introTitle.setAttribute('data-text', headerContent.title); // For glitch effect
    }

    // Add headshot to intro and header
    if (headerContent.headshot) {
      var introHeadshot = flashContainer.querySelector('.flash-intro-headshot');
      var headerHeadshot = flashContainer.querySelector('.flash-header-headshot');
      if (introHeadshot) {
        var img1 = document.createElement('img');
        img1.src = headerContent.headshot;
        img1.alt = 'Headshot';
        introHeadshot.appendChild(img1);
      }
      if (headerHeadshot) {
        var img2 = document.createElement('img');
        img2.src = headerContent.headshot;
        img2.alt = 'Headshot';
        img2.style.cursor = 'pointer';
        img2.title = 'Click me!';
        img2.addEventListener('click', function() {
          triggerHeadshotFreakout(headerContent.headshot);
        });
        headerHeadshot.appendChild(img2);
      }
    }

    // INSANE headshot click effect
    function triggerHeadshotFreakout(imgSrc) {
      // Create the freakout overlay
      var overlay = document.createElement('div');
      overlay.className = 'flash-headshot-freakout';

      // Giant spinning headshot
      var bigHead = document.createElement('img');
      bigHead.src = imgSrc;
      bigHead.className = 'flash-freakout-head';
      overlay.appendChild(bigHead);

      // Particle explosion
      for (var i = 0; i < 30; i++) {
        var particle = document.createElement('div');
        particle.className = 'flash-freakout-particle';
        particle.style.setProperty('--angle', (Math.random() * 360) + 'deg');
        particle.style.setProperty('--distance', (100 + Math.random() * 300) + 'px');
        particle.style.setProperty('--duration', (0.5 + Math.random() * 0.5) + 's');
        particle.style.setProperty('--delay', (Math.random() * 0.2) + 's');
        particle.style.setProperty('--size', (10 + Math.random() * 20) + 'px');
        particle.textContent = ['⭐', '✨', '💥', '🔥', '⚡', '💫', '🌟'][Math.floor(Math.random() * 7)];
        overlay.appendChild(particle);
      }

      // Matrix rain columns
      for (var j = 0; j < 20; j++) {
        var column = document.createElement('div');
        column.className = 'flash-freakout-matrix-col';
        column.style.left = (j * 5) + '%';
        column.style.animationDelay = (Math.random() * 2) + 's';
        column.style.animationDuration = (1 + Math.random() * 2) + 's';

        var chars = '';
        for (var k = 0; k < 30; k++) {
          chars += String.fromCharCode(0x30A0 + Math.random() * 96) + '<br>';
        }
        column.innerHTML = chars;
        overlay.appendChild(column);
      }

      // Lens flare bursts
      for (var l = 0; l < 5; l++) {
        var flare = document.createElement('div');
        flare.className = 'flash-freakout-flare';
        flare.style.setProperty('--flare-delay', (l * 0.15) + 's');
        flare.style.left = (20 + Math.random() * 60) + '%';
        flare.style.top = (20 + Math.random() * 60) + '%';
        overlay.appendChild(flare);
      }

      // "EPIC" text that flies in
      var epicText = document.createElement('div');
      epicText.className = 'flash-freakout-text';
      epicText.textContent = ['EPIC!', 'AWESOME!', 'LEGENDARY!', 'ULTRA!', 'MAXIMUM!', 'EXTREME!'][Math.floor(Math.random() * 6)];
      overlay.appendChild(epicText);

      flashContainer.appendChild(overlay);

      // Remove after animation
      setTimeout(function() {
        overlay.classList.add('ending');
        setTimeout(function() {
          overlay.remove();
        }, 500);
      }, 2500);
    }

    // Build navigation
    var flashNav = flashContainer.querySelector('.flash-nav');
    var flashSidebar = flashContainer.querySelector('.flash-sidebar');

    // Add section links to nav and sidebar
    sectionData.forEach(function(section, index) {
      var btn = document.createElement('button');
      btn.className = 'flash-nav-btn';
      btn.textContent = section.title;
      btn.dataset.section = section.id;
      if (index === 0) btn.classList.add('active');
      flashNav.appendChild(btn);

      var sideBtn = document.createElement('div');
      sideBtn.className = 'flash-sidebar-btn';
      sideBtn.innerHTML = '► ' + section.title;
      sideBtn.dataset.section = section.id;
      if (index === 0) sideBtn.classList.add('active');
      flashSidebar.appendChild(sideBtn);
    });

    // Add external links to sidebar and top nav
    if (navLinks.length > 0) {
      var divider = document.createElement('div');
      divider.className = 'flash-sidebar-divider';
      flashSidebar.appendChild(divider);

      var linksHeader = document.createElement('div');
      linksHeader.className = 'flash-sidebar-header';
      linksHeader.textContent = '✦ LINKS ✦';
      flashSidebar.appendChild(linksHeader);

      // Add divider to top nav for external links (visible on mobile)
      var navDivider = document.createElement('span');
      navDivider.className = 'flash-nav-divider';
      navDivider.textContent = '|';
      flashNav.appendChild(navDivider);

      navLinks.forEach(function(link) {
        var sideLink = document.createElement('a');
        sideLink.className = 'flash-sidebar-link';
        sideLink.href = link.href;
        sideLink.innerHTML = '› ' + link.text;
        flashSidebar.appendChild(sideLink);

        // Also add to top nav for mobile visibility
        var navLink = document.createElement('a');
        navLink.className = 'flash-nav-link';
        navLink.href = link.href;
        navLink.textContent = link.text;
        flashNav.appendChild(navLink);
      });
    }

    // Build content sections - move the actual elements instead of copying innerHTML
    // This preserves dynamically loaded content like paper emojis
    var flashContent = flashContainer.querySelector('.flash-content');
    sectionData.forEach(function(section, index) {
      var div = document.createElement('div');
      div.className = 'flash-section';
      div.id = 'flash-' + section.id;

      var title = document.createElement('h2');
      title.className = 'flash-section-title';
      title.textContent = section.title;
      div.appendChild(title);

      // Move the original section element into the flash container
      // This preserves all event listeners and dynamic content
      div.appendChild(section.element);
      section.element.style.display = 'block';

      if (index === 0) div.classList.add('active');
      flashContent.appendChild(div);
    });

    // Navigation functionality with INSANE transitions
    function showSection(sectionId) {
      var currentActive = flashContainer.querySelector('.flash-section.active');
      var targetSection = flashContainer.querySelector('#flash-' + sectionId);

      // Don't do anything if clicking the same section
      if (currentActive && targetSection && currentActive === targetSection) return;

      // Add screen shake to content area
      flashContent.classList.add('flash-screen-shake');
      setTimeout(function() {
        flashContent.classList.remove('flash-screen-shake');
      }, 300);

      // Exit animation for current section
      if (currentActive) {
        currentActive.classList.add('exiting');
        currentActive.classList.remove('active');
      }

      // Update nav buttons immediately
      flashContainer.querySelectorAll('.flash-nav-btn, .flash-sidebar-btn').forEach(function(b) {
        b.classList.remove('active');
      });
      flashContainer.querySelectorAll('[data-section="' + sectionId + '"]').forEach(function(b) {
        b.classList.add('active');
      });

      // Delay the new section entrance for dramatic effect
      setTimeout(function() {
        // Remove exiting class from old section
        if (currentActive) {
          currentActive.classList.remove('exiting');
        }

        // Enter the new section
        if (targetSection) {
          targetSection.classList.add('active');
        }
      }, 250);
    }

    flashContainer.querySelectorAll('.flash-nav-btn[data-section], .flash-sidebar-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        showSection(this.dataset.section);
      });
    });

    // Loading animation
    var progress = 0;
    var progressBar = flashContainer.querySelector('.flash-progress-bar');
    var progressPercent = flashContainer.querySelector('.flash-progress-percent');
    var loader = flashContainer.querySelector('#flash-loader');
    var intro = flashContainer.querySelector('#flash-intro');
    var site = flashContainer.querySelector('#flash-site');

    function updateProgress() {
      progress += Math.random() * 15 + 5;
      if (progress > 100) progress = 100;
      progressBar.style.width = progress + '%';
      progressPercent.textContent = Math.floor(progress) + '%';

      if (progress < 100) {
        setTimeout(updateProgress, 200 + Math.random() * 300);
      } else {
        setTimeout(function() {
          loader.classList.add('fade-out');
          setTimeout(function() {
            loader.style.display = 'none';
            intro.style.display = 'flex';
            intro.classList.add('fade-in');
          }, 500);
        }, 500);
      }
    }

    setTimeout(updateProgress, 500);

    // Enter site button
    var enterBtn = flashContainer.querySelector('.flash-enter-btn');
    var skipBtn = flashContainer.querySelector('.flash-skip');

    function enterSite() {
      intro.classList.add('fade-out');
      setTimeout(function() {
        intro.style.display = 'none';
        site.style.display = 'flex';
        site.classList.add('flash-site-enter');

        // Animate visitor counter
        var visitorEl = document.getElementById('flash-visitors');
        var targetCount = Math.floor(Math.random() * 50000) + 10000;
        var currentCount = 0;
        var increment = Math.ceil(targetCount / 50);
        var countInterval = setInterval(function() {
          currentCount += increment;
          if (currentCount >= targetCount) {
            currentCount = targetCount;
            clearInterval(countInterval);
          }
          visitorEl.textContent = currentCount.toLocaleString();
        }, 30);
      }, 500);
    }

    enterBtn.addEventListener('click', enterSite);
    skipBtn.addEventListener('click', function() {
      loader.style.display = 'none';
      intro.style.display = 'none';
      site.style.display = 'flex';
      site.classList.add('flash-site-enter');
      document.getElementById('flash-visitors').textContent = (Math.floor(Math.random() * 50000) + 10000).toLocaleString();
    });
  }


  // ============================================
  // Initialize Badges
  // ============================================
  function initBadges() {
    var container = document.getElementById('retro-badges');
    if (!container || config.badges.length === 0) return;

    // Group badges: first one solo, rest together
    var firstBadge = config.badges[0];
    var restBadges = config.badges.slice(1);

    if (firstBadge) {
      var row1 = document.createElement('div');
      row1.appendChild(createBadgeElement(firstBadge));
      container.appendChild(row1);
    }

    if (restBadges.length > 0) {
      var row2 = document.createElement('div');
      restBadges.forEach(function(badge) {
        row2.appendChild(createBadgeElement(badge));
      });
      container.appendChild(row2);
    }
  }

  function createBadgeElement(badge) {
    var img = document.createElement('img');
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
      var link = document.createElement('a');
      link.href = badge.href;
      link.appendChild(img);
      return link;
    }

    return img;
  }

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

  function initHampsterDance() {
    // Save the original body background styles before overwriting
    var computedStyle = window.getComputedStyle(document.body);
    var originalBackground = computedStyle.background;
    var originalBackgroundColor = computedStyle.backgroundColor;
    var originalBackgroundImage = computedStyle.backgroundImage;

    document.body.style.backgroundImage = 'url("' + config.basePath + '/hampsters.gif")';
    document.body.style.backgroundRepeat = 'repeat';
    document.body.style.backgroundSize = 'auto';

    var overlay = document.createElement('div');
    overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(128, 128, 128, 0.5); pointer-events: none; z-index: 0;';
    document.body.insertBefore(overlay, document.body.firstChild);

    var main = document.getElementById('main');
    if (main) {
      // Apply the original body background to main instead of white
      if (originalBackgroundImage && originalBackgroundImage !== 'none') {
        main.style.background = originalBackground;
      } else {
        main.style.backgroundColor = originalBackgroundColor || 'white';
      }
      main.style.position = 'relative';
      main.style.zIndex = '1';
    }
  }

  function initWordArt() {
    var h1 = document.querySelector('h1');
    if (!h1) return;

    var styles = [
      'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight',
      'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen',
      'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty', 'twentyone', 'twentytwo'
    ];

    var styleParam = params.get('wordart-style');
    var selectedStyle = styles.includes(styleParam) ? styleParam : styles[Math.floor(Math.random() * styles.length)];

    var container = document.createElement('div');
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
  // Media Player
  // ============================================
  function initMediaPlayer() {
    var audio = document.getElementById('audioPlayer');
    var select = document.getElementById('trackSelector');
    var canvas = document.getElementById('waveformCanvas');

    if (!audio || !select || !canvas) return;

    // Populate tracks from config
    select.innerHTML = '';
    config.music.forEach(function(track) {
      var option = document.createElement('option');
      option.value = track.src;
      option.textContent = track.label;
      select.appendChild(option);
    });

    // Set up track change handler
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

    var vizModes = ['waveform', 'spectrogram', 'spectrum', 'psychedelic', 'radial'];
    var vizOverride = params.get('viz');
    var vizMode = vizModes.includes(vizOverride) ? vizOverride : vizModes[Math.floor(Math.random() * vizModes.length)];

    var hueOffset = 0, rotation = 0;

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

    function drawWaveform() {
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

    function drawSpectrogram() {
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

    function drawSpectrum() {
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
      for (var i = 0; i < dataArray.length; i++) {
        var y = canvas.height - (dataArray[i] / 255) * canvas.height;
        if (i === 0) ctx.moveTo(0, y);
        else ctx.lineTo(i * sliceWidth, y);
      }
      ctx.strokeStyle = '#0f0';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    function drawPsychedelic() {
      analyser.getByteFrequencyData(dataArray);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      hueOffset = (hueOffset + 2) % 360;
      var barWidth = canvas.width / dataArray.length;
      var centerY = canvas.height / 2;
      for (var i = 0; i < dataArray.length; i++) {
        var amplitude = dataArray[i] / 255;
        var barHeight = amplitude * centerY;
        var hue = (hueOffset + (i / dataArray.length) * 360) % 360;
        ctx.fillStyle = 'hsl(' + hue + ', 100%, ' + (40 + amplitude * 30) + '%)';
        ctx.fillRect(i * barWidth, centerY - barHeight, barWidth - 1, barHeight);
        ctx.fillRect(i * barWidth, centerY, barWidth - 1, barHeight);
      }
    }

    function drawRadial() {
      analyser.getByteFrequencyData(dataArray);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      rotation += 0.005;
      var centerX = canvas.width / 2, centerY = canvas.height / 2;
      var radius = Math.min(centerX, centerY) * 0.3;
      var bars = dataArray.length / 2;
      for (var i = 0; i < bars; i++) {
        var amplitude = dataArray[i] / 255;
        var angle = (i / bars) * Math.PI * 2 + rotation;
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

    function draw() {
      requestAnimationFrame(draw);
      if (!initialized || audio.paused) {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        return;
      }
      if (vizMode === 'waveform') drawWaveform();
      else if (vizMode === 'spectrogram') drawSpectrogram();
      else if (vizMode === 'spectrum') drawSpectrum();
      else if (vizMode === 'psychedelic') drawPsychedelic();
      else drawRadial();
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
        setTimeout(incrementCounter, delays[Math.floor(Math.random() * delays.length)]);
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

  function initControlPanel(retroList) {
    var panel = document.getElementById('control-panel');
    if (!panel || controlPanelInitialized) return;
    controlPanelInitialized = true;

    // Generate checkboxes from RETROS array
    // Skip retros controlled by Themes dropdowns: retheme, wordart, mouse-trail, custom-cursor
    var checkboxGrid = document.getElementById('retro-checkboxes');
    var themeControlledRetros = ['retheme', 'wordart', 'mouse-trail', 'custom-cursor'];
    if (checkboxGrid) {
      RETROS.forEach(function(retro) {
        // Skip retros controlled by Themes dropdowns
        if (themeControlledRetros.indexOf(retro.name) !== -1) return;

        var row = document.createElement('div');
        row.className = 'win95-checkbox-row';

        var checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = 'ctrl-retro-' + retro.name;
        checkbox.checked = retroList.indexOf(retro.name) !== -1;

        var label = document.createElement('label');
        label.htmlFor = checkbox.id;
        label.textContent = retro.emoji + ' ' + retro.label;

        row.appendChild(checkbox);
        row.appendChild(label);
        checkboxGrid.appendChild(row);
      });
    }

    // Other controls
    var ctrlSong = document.getElementById('ctrl-song');
    var ctrlViz = document.getElementById('ctrl-viz');
    var ctrlWordart = document.getElementById('ctrl-wordart');
    var ctrlCursor = document.getElementById('ctrl-cursor');
    var ctrlTrail = document.getElementById('ctrl-trail');
    var ctrlTheme = document.getElementById('ctrl-theme');

    // Populate song options from config
    if (ctrlSong) {
      config.music.forEach(function(track) {
        var option = document.createElement('option');
        // Extract filename without extension for URL param matching
        var filename = track.src.split('/').pop().replace(/\.[^.]+$/, '');
        option.value = filename;
        option.textContent = track.label;
        ctrlSong.appendChild(option);
      });
    }

    ctrlSong.value = params.get('song') || '';
    ctrlViz.value = params.get('viz') || '';

    // WordArt: if wordart retro is active but no style param, show "Random"
    // Otherwise default to "none"
    if (ctrlWordart) {
      var wordartParam = params.get('wordart-style');
      var hasWordart = retroList.indexOf('wordart') !== -1;
      if (wordartParam !== null) {
        ctrlWordart.value = wordartParam;
      } else if (hasWordart) {
        ctrlWordart.value = ''; // Random
      } else {
        ctrlWordart.value = 'none'; // None
      }
    }

    // Cursor: if custom-cursor retro is active, check cursor-style param
    // Otherwise default to "none" (Default)
    if (ctrlCursor) {
      var cursorParam = params.get('cursor-style');
      var hasCursor = retroList.indexOf('custom-cursor') !== -1;
      if (cursorParam !== null) {
        ctrlCursor.value = cursorParam;
      } else if (hasCursor) {
        ctrlCursor.value = 'custom'; // Default to custom if retro is active but no param
      } else {
        ctrlCursor.value = 'none'; // Default
      }
    }

    // Trail: if mouse-trail retro is active but no style param, show "Random"
    // Otherwise default to "none"
    if (ctrlTrail) {
      var trailParam = params.get('trail-style');
      var hasTrail = retroList.indexOf('mouse-trail') !== -1;
      if (trailParam !== null) {
        ctrlTrail.value = trailParam;
      } else if (hasTrail) {
        ctrlTrail.value = ''; // Random
      } else {
        ctrlTrail.value = 'none'; // None
      }
    }

    // Page theme: if retheme is active but no theme param, show "Random"
    // Otherwise default to "none" (Default)
    if (ctrlTheme) {
      var themeParam = params.get('theme');
      var hasRetheme = retroList.indexOf('retheme') !== -1;
      if (themeParam !== null) {
        ctrlTheme.value = themeParam;
      } else if (hasRetheme) {
        ctrlTheme.value = ''; // Random
      } else {
        ctrlTheme.value = 'none'; // Default
      }
    }

    document.getElementById('ctrl-close').addEventListener('click', function() {
      var currentRetros = (params.get('retros') || params.get('retro') || '').split(',').map(function(r) {
        return r.trim();
      }).filter(Boolean);

      if (currentRetros.indexOf('control-panel') !== -1) {
        // control-panel is in URL, remove it and reload
        var newParams = new URLSearchParams(window.location.search);
        var filteredRetros = currentRetros.filter(function(r) {
          return r !== 'control-panel';
        });
        newParams.delete('retro');
        newParams.set('retros', filteredRetros.length > 0 ? filteredRetros.join(',') : 'none');
        window.location.search = newParams.toString();
      } else {
        // Just hide it
        panel.style.display = 'none';
      }
    });

    document.getElementById('ctrl-select-all').addEventListener('click', function() {
      RETROS.forEach(function(retro) {
        var cb = document.getElementById('ctrl-retro-' + retro.name);
        if (cb) cb.checked = true;
      });
    });

    document.getElementById('ctrl-select-random').addEventListener('click', function() {
      RETROS.forEach(function(retro) {
        var cb = document.getElementById('ctrl-retro-' + retro.name);
        if (cb) cb.checked = Math.random() < 0.5;
      });
    });

    document.getElementById('ctrl-apply').addEventListener('click', function() {
      var newParams = new URLSearchParams();
      var selectedRetros = [];

      RETROS.forEach(function(retro) {
        // Skip retros controlled by Themes dropdowns
        if (themeControlledRetros.indexOf(retro.name) !== -1) return;
        var cb = document.getElementById('ctrl-retro-' + retro.name);
        if (cb && cb.checked) selectedRetros.push(retro.name);
      });

      // Auto-add wordart if a style is selected (not "none")
      if (ctrlWordart && ctrlWordart.value !== 'none') {
        selectedRetros.push('wordart');
      }

      // Auto-add custom-cursor if not "none" (Default)
      if (ctrlCursor && ctrlCursor.value !== 'none') {
        selectedRetros.push('custom-cursor');
      }

      // Auto-add mouse-trail if a style is selected (not "none")
      if (ctrlTrail && ctrlTrail.value !== 'none') {
        selectedRetros.push('mouse-trail');
      }

      // Auto-add retheme if a page theme is selected (not "none")
      if (ctrlTheme && ctrlTheme.value && ctrlTheme.value !== 'none') {
        selectedRetros.push('retheme');
      }

      selectedRetros.push('control-panel');

      if (selectedRetros.length > 0) newParams.set('retros', selectedRetros.join(','));
      if (ctrlSong.value) newParams.set('song', ctrlSong.value);
      if (ctrlViz.value) newParams.set('viz', ctrlViz.value);
      if (ctrlWordart && ctrlWordart.value && ctrlWordart.value !== 'none') newParams.set('wordart-style', ctrlWordart.value);
      if (ctrlCursor && ctrlCursor.value && ctrlCursor.value !== 'none') newParams.set('cursor-style', ctrlCursor.value);
      if (ctrlTrail && ctrlTrail.value && ctrlTrail.value !== 'none') newParams.set('trail-style', ctrlTrail.value);
      if (ctrlTheme && ctrlTheme.value && ctrlTheme.value !== 'none') newParams.set('theme', ctrlTheme.value);

      window.location.search = newParams.toString();
    });

    document.getElementById('ctrl-reset').addEventListener('click', function() {
      window.location.search = 'retros=control-panel';
    });

    // Show if control-panel is in retroList
    if (retroList.indexOf('control-panel') !== -1) {
      panel.style.display = 'block';
    }
  }

  function showControlPanel() {
    var panel = document.getElementById('control-panel');
    if (!panel) return;

    // Initialize if needed (with current retros from URL)
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
      var iframe = document.createElement('iframe');
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
  // Load HTML Templates
  // ============================================
  function loadTemplate(url) {
    return fetch(url)
      .then(function(r) { return r.text(); })
      .then(function(html) {
        var container = document.createElement('div');
        container.innerHTML = html;
        return container.firstElementChild;
      });
  }

  // ============================================
  // Public API
  // ============================================
  window.web90 = {
    config: config,
    getRandomDivider: function() {
      if (config.dividers.length === 0) return null;
      return config.dividers[Math.floor(Math.random() * config.dividers.length)];
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
      // Only trigger if starting from bottom 15% of screen
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
      // Swipe up at least 100px within 500ms
      if (dy > 100 && dt < 500) showControlPanel();
      touchStartY = 0;
    });
  })();

  // ============================================
  // Initialize
  // ============================================

  // Load retro elements into primary slot (data-retro-slot="0"), then initialize
  var primarySlot = document.querySelector('[data-retro-slot="0"]');

  function initAll() {
    initBadges();
    var selectedRetros = initRetroSelector();
    initMediaPlayer();
    initVisitorCounter();
    initWebring();
    initGuestbook();
    enableJsRetros(selectedRetros);

    // Load control panel and chat window templates
    Promise.all([
      loadTemplate(config.basePath + '/control-panel.html'),
      loadTemplate(config.basePath + '/chat-window.html')
    ]).then(function(templates) {
      document.body.appendChild(templates[0]);
      document.body.appendChild(templates[1]);
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
