/**
 * Retro Features JavaScript
 * Handles all the nostalgic 90s/2000s web elements
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
    counterGlitchText: ''
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
    { name: 'wordart', type: 'js', emoji: '🎨', label: 'WordArt', init: initWordArt },
    { name: 'table', type: 'js', emoji: '📊', label: 'Table', init: initTable },
    { name: 'hampsterdance', type: 'js', emoji: '🐹', label: 'Hampster Dance', init: initHampsterDance },
    { name: 'custom-cursor', type: 'js', emoji: '🖱️', label: 'Custom Cursor', init: initCustomCursor },
    { name: 'dividers', type: 'js', emoji: '〰️', label: 'Dividers', init: initDividers }
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
    var allRetros = shuffle(ALL_FUN_RETROS.slice());
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
        return [selectRandomRetro()];
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
    var selected = ALL_FUN_RETROS[Math.floor(Math.random() * ALL_FUN_RETROS.length)];

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

  function initMouseTrail() {
    var lastSpawn = 0;
    document.addEventListener('mousemove', function(e) {
      var now = Date.now();
      if (now - lastSpawn < 50) return;
      lastSpawn = now;

      var digit = document.createElement('span');
      digit.className = 'binary-trail';
      digit.textContent = Math.random() < 0.001 ? '2' : (Math.random() < 0.5 ? '0' : '1');
      digit.style.left = (e.clientX + (Math.random() - 0.5) * 10) + 'px';
      digit.style.top = (e.clientY + (Math.random() - 0.5) * 10) + 'px';
      digit.style.setProperty('--drift-x', (Math.random() - 0.5) * 20 + 'px');
      document.body.appendChild(digit);

      setTimeout(function() {
        if (digit.parentNode) digit.parentNode.removeChild(digit);
      }, 1000);
    });
  }

  function initBlink() {
    var h1 = document.querySelector('h1');
    if (h1) h1.innerHTML = '<blink>' + h1.textContent + '</blink>';
  }

  function initMarquee() {
    var h1 = document.querySelector('h1');
    if (h1) h1.innerHTML = '<marquee>' + h1.textContent + '</marquee>';
  }

  function initCustomCursor() {
    if (!config.cursorUrl) return;
    var style = document.createElement('style');
    style.textContent = 'body, body * { cursor: url(' + config.cursorUrl + '), auto !important; }';
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
  function initControlPanel(retroList) {
    var panel = document.getElementById('control-panel');
    if (!panel || retroList.indexOf('control-panel') === -1) return;

    panel.style.display = 'block';

    // Generate checkboxes from RETROS array
    var checkboxGrid = document.getElementById('retro-checkboxes');
    if (checkboxGrid) {
      RETROS.forEach(function(retro) {
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
    ctrlWordart.value = params.get('wordart-style') || '';

    document.getElementById('ctrl-close').addEventListener('click', function() {
      var newParams = new URLSearchParams(window.location.search);
      var currentRetros = (newParams.get('retros') || newParams.get('retro') || '').split(',').filter(function(r) {
        return r.trim() && r.trim() !== 'control-panel';
      });
      newParams.delete('retro');
      newParams.set('retros', currentRetros.length > 0 ? currentRetros.join(',') : 'none');
      window.location.search = newParams.toString();
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
        var cb = document.getElementById('ctrl-retro-' + retro.name);
        if (cb && cb.checked) selectedRetros.push(retro.name);
      });
      selectedRetros.push('control-panel');

      if (selectedRetros.length > 0) newParams.set('retros', selectedRetros.join(','));
      if (ctrlSong.value) newParams.set('song', ctrlSong.value);
      if (ctrlViz.value) newParams.set('viz', ctrlViz.value);
      if (ctrlWordart.value) newParams.set('wordart-style', ctrlWordart.value);

      window.location.search = newParams.toString();
    });

    document.getElementById('ctrl-reset').addEventListener('click', function() {
      window.location.search = 'retros=control-panel';
    });

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
