/**
 * Mouse Trail Module
 * Lazy-loaded plugin for various mouse trail effects
 *
 * This module is loaded on-demand when the mouse-trail retro is activated.
 */

(function() {
  'use strict';

  // Get utilities from the core
  var web90 = window.web90;
  var createElement = web90.createElement;
  var randomFrom = web90.randomFrom;
  var config = web90.config;
  var params = web90.params;

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

  // Export styles for control panel
  window.web90.TRAIL_STYLES = TRAIL_STYLES;
  window.web90.TRAIL_STYLE_NAMES = TRAIL_STYLE_NAMES;

  function createTrailCanvas(zIndex) {
    var canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = zIndex;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    window.addEventListener('resize', function() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });
    return { canvas: canvas, ctx: canvas.getContext('2d') };
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

    var result = createTrailCanvas(100002);
    var canvas = result.canvas;
    var ctx = result.ctx;
    var particles = [];
    var trailLength = 50;
    var cursorScale = 1.0;
    var lifeSpan = 65;
    var maxAge = 200;

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

  // Register the plugin
  window.web90.registerPlugin('mouse-trail', initMouseTrail);

})();
