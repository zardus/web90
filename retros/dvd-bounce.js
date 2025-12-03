/**
 * DVD Bounce - Classic DVD Screensaver
 * Uses the first image on the page as the bouncing element
 *
 * ULTRA ENHANCED with:
 * - Persistent corner hit tracking (localStorage)
 * - EPIC corner celebrations (confetti, flash, shake)
 * - Achievement toasts
 * - Trail visualization
 * - Corner proximity indicator
 */
(function() {
  'use strict';

  // ============= ACHIEVEMENT DEFINITIONS =============
  var ACHIEVEMENTS = [
    { hits: 1, title: 'FIRST CORNER!', subtitle: 'The prophecy begins...', color: '#00ff00' },
    { hits: 3, title: 'TRIPLE THREAT', subtitle: 'Corner collector', color: '#00ffff' },
    { hits: 5, title: 'CORNER MASTER', subtitle: 'You have the patience', color: '#ffff00' },
    { hits: 10, title: '★ LEGENDARY ★', subtitle: 'DVD whisperer status achieved', color: '#ff00ff' },
    { hits: 25, title: '⚡ CORNER GOD ⚡', subtitle: 'Corners fear you', color: '#ff8800' },
    { hits: 50, title: '🌟 TRANSCENDENT 🌟', subtitle: 'You have seen too much', color: '#ffffff' },
    { hits: 100, title: '💀 CORNER ADDICT 💀', subtitle: 'Seek help (but keep watching)', color: '#ff0000' }
  ];

  // ============= STORAGE =============
  var STORAGE_KEY = 'web90_dvd_corner_hits';

  function getLifetimeHits() {
    try {
      return parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);
    } catch(e) {
      return 0;
    }
  }

  function saveLifetimeHits(hits) {
    try {
      localStorage.setItem(STORAGE_KEY, hits.toString());
    } catch(e) { /* ignore */ }
  }

  // Themes that transform the page in ways incompatible with fixed-position overlays
  var INCOMPATIBLE_THEMES = ['starwars', 'dos', 'win98', 'macos-classic', 'flash'];

  function getActiveTheme() {
    var classList = document.body.className.split(/\s+/);
    for (var i = 0; i < classList.length; i++) {
      var match = classList[i].match(/^retheme-(.+)$/);
      if (match) return match[1];
    }
    return null;
  }

  function initDVDBounce() {
    // Check for incompatible themes
    var activeTheme = getActiveTheme();
    if (activeTheme && INCOMPATIBLE_THEMES.indexOf(activeTheme) !== -1) {
      console.warn('DVD Bounce: Incompatible with ' + activeTheme + ' theme, skipping');
      return;
    }

    // Find the first visible image on the page
    var images = document.querySelectorAll('img');
    var sourceImg = null;

    for (var i = 0; i < images.length; i++) {
      var img = images[i];
      var style = window.getComputedStyle(img);
      var rect = img.getBoundingClientRect();

      if (style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          style.opacity !== '0' &&
          rect.width > 0 &&
          rect.height > 0) {
        sourceImg = img;
        break;
      }
    }

    if (!sourceImg) {
      console.warn('DVD Bounce: No visible image found on page');
      return;
    }

    function startBounce() {
      var originalRect = sourceImg.getBoundingClientRect();
      var startX = originalRect.left;
      var startY = originalRect.top;

      sourceImg.style.opacity = '0';

      // ============= MAIN CONTAINER =============
      var container = document.createElement('div');
      container.id = 'dvd-bounce';
      container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:100000;pointer-events:none;overflow:hidden;';
      document.documentElement.appendChild(container);

      // ============= TRAIL CANVAS =============
      var trailCanvas = document.createElement('canvas');
      trailCanvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;';
      container.appendChild(trailCanvas);
      var trailCtx = trailCanvas.getContext('2d');

      function resizeTrailCanvas() {
        trailCanvas.width = window.innerWidth;
        trailCanvas.height = window.innerHeight;
      }
      resizeTrailCanvas();
      window.addEventListener('resize', resizeTrailCanvas);

      // Trail history
      var trailPoints = [];
      var maxTrailPoints = 500;

      // ============= CONFETTI CANVAS =============
      var confettiCanvas = document.createElement('canvas');
      confettiCanvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;';
      container.appendChild(confettiCanvas);
      var confettiCtx = confettiCanvas.getContext('2d');

      function resizeConfettiCanvas() {
        confettiCanvas.width = window.innerWidth;
        confettiCanvas.height = window.innerHeight;
      }
      resizeConfettiCanvas();
      window.addEventListener('resize', resizeConfettiCanvas);

      var confettiParticles = [];

      // ============= BOUNCER ELEMENT =============
      var bouncer = document.createElement('div');
      bouncer.style.cssText = 'position:absolute;display:inline-block;transition:filter 0.1s ease;';
      container.appendChild(bouncer);

      var imgEl = sourceImg.cloneNode(true);
      imgEl.style.cssText = 'display:block;';
      bouncer.appendChild(imgEl);

      // DVD Video overlay
      var overlay = document.createElement('div');
      overlay.innerHTML = 'DVD<span style="font-size:0.6em;display:block;margin-top:-2px;">VIDEO</span>';

      var glowColors = [
        { color: '#ff0000', glow: '#ff0000' },
        { color: '#ff7f00', glow: '#ff7f00' },
        { color: '#ffff00', glow: '#ffff00' },
        { color: '#00ff00', glow: '#00ff00' },
        { color: '#00ffff', glow: '#00ffff' },
        { color: '#0080ff', glow: '#0080ff' },
        { color: '#8000ff', glow: '#8000ff' },
        { color: '#ff00ff', glow: '#ff00ff' },
        { color: '#ff0080', glow: '#ff0080' },
        { color: '#ffffff', glow: '#ffffff' }
      ];

      function updateOverlayColor() {
        var c = glowColors[logo.colorIndex % glowColors.length];
        overlay.style.color = c.color;
        overlay.style.textShadow = '0 0 10px ' + c.glow + ', 0 0 20px ' + c.glow + ', 0 0 30px ' + c.glow + ', 2px 2px 4px #000';
      }

      overlay.style.cssText = [
        'position:absolute',
        'bottom:5px',
        'right:8px',
        'font-family:Arial Black,Arial,sans-serif',
        'font-size:24px',
        'font-weight:bold',
        'text-align:center',
        'line-height:1',
        'pointer-events:none',
        'color:#ff0000',
        'text-shadow:0 0 10px #ff0000, 0 0 20px #ff0000, 0 0 30px #ff0000, 2px 2px 4px #000'
      ].join(';');
      bouncer.appendChild(overlay);

      var colors = [
        'hue-rotate(0deg)',
        'hue-rotate(30deg)',
        'hue-rotate(60deg)',
        'hue-rotate(90deg)',
        'hue-rotate(120deg)',
        'hue-rotate(150deg)',
        'hue-rotate(180deg)',
        'hue-rotate(210deg)',
        'hue-rotate(240deg)',
        'hue-rotate(270deg)',
        'hue-rotate(300deg)',
        'hue-rotate(330deg)'
      ];

      var imgWidth = originalRect.width;
      var imgHeight = originalRect.height;

      var logo = {
        x: startX,
        y: startY,
        vx: 2 + Math.random(),
        vy: 2 + Math.random(),
        width: imgWidth,
        height: imgHeight,
        colorIndex: 0,
        cornerHits: 0,
        totalBounces: 0,
        started: false
      };

      // Load lifetime stats
      var lifetimeCornerHits = getLifetimeHits();
      var sessionCornerHits = 0;
      var unlockedAchievements = [];

      if (Math.random() > 0.5) logo.vx *= -1;
      if (Math.random() > 0.5) logo.vy *= -1;

      bouncer.style.left = logo.x + 'px';
      bouncer.style.top = logo.y + 'px';

      // ============= STATS HUD (appears when hovering near logo) =============
      var statsHud = document.createElement('div');
      statsHud.style.cssText = [
        'position:fixed',
        'bottom:20px',
        'left:20px',
        'font-family:monospace',
        'font-size:12px',
        'color:#00ff00',
        'background:rgba(0,0,0,0.85)',
        'padding:10px 15px',
        'border-radius:5px',
        'border:1px solid #00ff00',
        'text-shadow:0 0 10px #00ff00',
        'z-index:100002',
        'opacity:0',
        'pointer-events:none',
        'transition:opacity 0.3s ease'
      ].join(';');
      container.appendChild(statsHud);

      var statsVisible = false;
      var mouseX = 0, mouseY = 0;
      var hoverDistance = 150; // pixels from logo center to show stats

      document.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
      });

      function updateStatsVisibility() {
        var logoCenterX = logo.x + logo.width / 2;
        var logoCenterY = logo.y + logo.height / 2;
        var dx = mouseX - logoCenterX;
        var dy = mouseY - logoCenterY;
        var dist = Math.sqrt(dx * dx + dy * dy);

        var shouldShow = dist < hoverDistance;
        if (shouldShow !== statsVisible) {
          statsVisible = shouldShow;
          statsHud.style.opacity = shouldShow ? '0.9' : '0';
        }
      }

      function updateStatsHud() {
        var padNum = function(n, len) {
          var s = String(n);
          while (s.length < len) s = ' ' + s;
          return s;
        };
        statsHud.innerHTML = [
          '<div style="white-space:pre;font-family:monospace;">',
          '┌─────────────────────┐',
          '│ DVD CORNER TRACKER  │',
          '├─────────────────────┤',
          '│ Session:  <span style="color:#ffff00">' + padNum(sessionCornerHits, 4) + '</span>      │',
          '│ Lifetime: <span style="color:#ff00ff">' + padNum(lifetimeCornerHits, 4) + '</span>      │',
          '│ Bounces:  <span style="color:#00ffff">' + padNum(logo.totalBounces, 4) + '</span>      │',
          '└─────────────────────┘',
          '</div>'
        ].join('\n');
      }
      updateStatsHud();

      // ============= CORNER PROXIMITY INDICATOR (fades in when getting close) =============
      var proximityIndicator = document.createElement('div');
      proximityIndicator.style.cssText = [
        'position:fixed',
        'top:20px',
        'right:20px',
        'font-family:monospace',
        'font-size:14px',
        'color:#888',
        'background:rgba(0,0,0,0.85)',
        'padding:8px 12px',
        'border-radius:5px',
        'z-index:100002',
        'pointer-events:none',
        'opacity:0',
        'transition:opacity 0.3s ease,color 0.2s,text-shadow 0.2s'
      ].join(';');
      proximityIndicator.textContent = 'CORNER: ---';
      container.appendChild(proximityIndicator);

      // ============= SCREEN FLASH OVERLAY =============
      var flashOverlay = document.createElement('div');
      flashOverlay.style.cssText = [
        'position:fixed',
        'top:0',
        'left:0',
        'width:100%',
        'height:100%',
        'background:#fff',
        'pointer-events:none',
        'opacity:0',
        'transition:opacity 0.1s ease-out',
        'z-index:100001'
      ].join(';');
      container.appendChild(flashOverlay);

      // ============= ACHIEVEMENT TOAST =============
      var toastContainer = document.createElement('div');
      toastContainer.style.cssText = [
        'position:fixed',
        'top:50%',
        'left:50%',
        'transform:translate(-50%,-50%) scale(0)',
        'z-index:100003',
        'pointer-events:none',
        'text-align:center',
        'transition:transform 0.4s cubic-bezier(0.68,-0.55,0.265,1.55),opacity 0.3s'
      ].join(';');
      container.appendChild(toastContainer);

      // ============= CELEBRATION ELEMENT =============
      var celebration = document.createElement('div');
      celebration.style.cssText = [
        'position:fixed',
        'top:50%',
        'left:50%',
        'transform:translate(-50%,-50%)',
        'font-size:72px',
        'font-weight:bold',
        'font-family:Arial Black,Arial,sans-serif',
        'color:#fff',
        'text-shadow:0 0 20px currentColor,0 0 40px currentColor,0 0 60px currentColor',
        'pointer-events:none',
        'opacity:0',
        'transition:opacity 0.2s,transform 0.3s',
        'z-index:100002'
      ].join(';');
      container.appendChild(celebration);

      // Screen shake state
      var screenShake = { amount: 0, decay: 0.9 };

      // ============= CONFETTI SYSTEM =============
      function ConfettiParticle(x, y) {
        this.x = x;
        this.y = y;
        var angle = Math.random() * Math.PI * 2;
        var speed = 8 + Math.random() * 15;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed - 10; // initial upward boost
        this.life = 1;
        this.decay = 0.008 + Math.random() * 0.008;
        this.size = 6 + Math.random() * 8;
        this.color = ['#ff0000','#ff7700','#ffff00','#00ff00','#00ffff','#0077ff','#ff00ff','#ffffff'][Math.floor(Math.random()*8)];
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.4;
        this.shape = Math.random() > 0.5 ? 'rect' : 'circle';
      }

      ConfettiParticle.prototype.update = function() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.4; // gravity
        this.vx *= 0.98; // air resistance
        this.life -= this.decay;
        this.rotation += this.rotationSpeed;
        return this.life > 0;
      };

      ConfettiParticle.prototype.draw = function(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.fillStyle = this.color;

        var s = this.size * this.life;
        if (this.shape === 'rect') {
          ctx.fillRect(-s/2, -s/4, s, s/2);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, s/2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      };

      function spawnConfetti(x, y, count) {
        for (var i = 0; i < count; i++) {
          confettiParticles.push(new ConfettiParticle(x, y));
        }
      }

      // ============= SHOCKWAVE EFFECT =============
      var shockwaves = [];

      function Shockwave(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 10;
        this.maxRadius = 300;
        this.life = 1;
      }

      Shockwave.prototype.update = function() {
        this.radius += 15;
        this.life = 1 - (this.radius / this.maxRadius);
        return this.life > 0;
      };

      Shockwave.prototype.draw = function(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life * 0.5;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 4 * this.life;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Inner glow
        ctx.globalAlpha = this.life * 0.3;
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 8 * this.life;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      };

      // ============= ACHIEVEMENT DISPLAY =============
      function showAchievement(achievement) {
        toastContainer.innerHTML = [
          '<div style="font-size:48px;margin-bottom:10px;">' + achievement.title + '</div>',
          '<div style="font-size:24px;color:' + achievement.color + ';text-shadow:0 0 20px ' + achievement.color + ';">' + achievement.subtitle + '</div>',
          '<div style="font-size:16px;margin-top:15px;color:#888;">Lifetime corners: ' + lifetimeCornerHits + '</div>'
        ].join('');
        toastContainer.style.color = achievement.color;
        toastContainer.style.textShadow = '0 0 30px ' + achievement.color + ',0 0 60px ' + achievement.color;
        toastContainer.style.transform = 'translate(-50%,-50%) scale(1)';
        toastContainer.style.opacity = '1';

        setTimeout(function() {
          toastContainer.style.transform = 'translate(-50%,-50%) scale(0)';
          toastContainer.style.opacity = '0';
        }, 3000);
      }

      function checkAchievements() {
        for (var i = 0; i < ACHIEVEMENTS.length; i++) {
          var ach = ACHIEVEMENTS[i];
          if (lifetimeCornerHits === ach.hits && unlockedAchievements.indexOf(ach.hits) === -1) {
            unlockedAchievements.push(ach.hits);
            setTimeout(function() { showAchievement(ach); }, 500);
            return;
          }
        }
      }

      // ============= CORNER HIT CELEBRATION =============
      function celebrateCornerHit() {
        sessionCornerHits++;
        lifetimeCornerHits++;
        saveLifetimeHits(lifetimeCornerHits);

        // Get corner position
        var cornerX, cornerY;
        if (logo.x <= 5) cornerX = 50;
        else cornerX = window.innerWidth - 50;
        if (logo.y <= 5) cornerY = 50;
        else cornerY = window.innerHeight - 50;

        // MASSIVE SCREEN FLASH
        flashOverlay.style.opacity = '0.8';
        setTimeout(function() { flashOverlay.style.opacity = '0'; }, 100);

        // SCREEN SHAKE
        screenShake.amount = 25;

        // CELEBRATION TEXT
        var celebColors = ['#ff0', '#0ff', '#f0f', '#0f0', '#ff8800', '#00ff88'];
        celebration.style.color = celebColors[Math.floor(Math.random() * celebColors.length)];
        celebration.textContent = '🎉 CORNER! 🎉';
        celebration.style.opacity = '1';
        celebration.style.transform = 'translate(-50%,-50%) scale(1.2)';

        setTimeout(function() {
          celebration.style.transform = 'translate(-50%,-50%) scale(1)';
        }, 100);

        setTimeout(function() {
          celebration.style.opacity = '0';
        }, 2000);

        // CONFETTI EXPLOSION
        spawnConfetti(cornerX, cornerY, 150);

        // Multiple shockwaves
        shockwaves.push(new Shockwave(cornerX, cornerY));
        setTimeout(function() {
          shockwaves.push(new Shockwave(cornerX, cornerY));
        }, 100);
        setTimeout(function() {
          shockwaves.push(new Shockwave(cornerX, cornerY));
        }, 200);

        // Update stats
        updateStatsHud();

        // Check achievements
        checkAchievements();
      }

      // ============= PROXIMITY CALCULATION =============
      function getCornerProximity() {
        var corners = [
          { x: 0, y: 0 },
          { x: window.innerWidth - logo.width, y: 0 },
          { x: 0, y: window.innerHeight - logo.height },
          { x: window.innerWidth - logo.width, y: window.innerHeight - logo.height }
        ];

        var minDist = Infinity;
        for (var i = 0; i < corners.length; i++) {
          var dx = logo.x - corners[i].x;
          var dy = logo.y - corners[i].y;
          var dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < minDist) minDist = dist;
        }

        // Normalize to percentage (0 = at corner, 100 = far away)
        var maxDist = Math.sqrt(Math.pow(window.innerWidth/2, 2) + Math.pow(window.innerHeight/2, 2));
        return Math.min(100, Math.round((minDist / maxDist) * 100));
      }

      function updateProximityIndicator() {
        var proximity = getCornerProximity();
        var invertedProximity = 100 - proximity;

        // Only show when getting really close (>80%)
        if (invertedProximity < 80) {
          proximityIndicator.style.opacity = '0';
          return;
        }

        // Fade in based on how close we are (80-90% range for fade)
        var fadeAmount = Math.min(1, (invertedProximity - 80) / 10);
        proximityIndicator.style.opacity = fadeAmount.toString();

        proximityIndicator.textContent = 'CORNER: ' + invertedProximity + '%';

        if (invertedProximity > 85) {
          proximityIndicator.style.color = '#ff0000';
          proximityIndicator.style.textShadow = '0 0 20px #ff0000';
          proximityIndicator.style.animation = 'pulse 0.15s infinite';
        } else if (invertedProximity > 70) {
          proximityIndicator.style.color = '#ffff00';
          proximityIndicator.style.textShadow = '0 0 10px #ffff00';
          proximityIndicator.style.animation = 'none';
        } else {
          proximityIndicator.style.color = '#00ff00';
          proximityIndicator.style.textShadow = '0 0 5px #00ff00';
          proximityIndicator.style.animation = 'none';
        }
      }

      // Add pulse animation
      var pulseStyle = document.createElement('style');
      pulseStyle.textContent = '@keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }';
      document.head.appendChild(pulseStyle);

      setTimeout(function() {
        logo.started = true;
      }, 2000);

      // ============= MAIN UPDATE LOOP =============
      function update() {
        if (!logo.started) {
          requestAnimationFrame(update);
          return;
        }

        // Record trail position
        trailPoints.push({
          x: logo.x + logo.width/2,
          y: logo.y + logo.height/2,
          color: glowColors[logo.colorIndex % glowColors.length].color
        });
        if (trailPoints.length > maxTrailPoints) {
          trailPoints.shift();
        }

        logo.x += logo.vx;
        logo.y += logo.vy;

        var hitX = false;
        var hitY = false;

        // Bounce off walls
        if (logo.x <= 0) {
          logo.x = 0;
          logo.vx *= -1;
          hitX = true;
        } else if (logo.x + logo.width >= window.innerWidth) {
          logo.x = window.innerWidth - logo.width;
          logo.vx *= -1;
          hitX = true;
        }

        if (logo.y <= 0) {
          logo.y = 0;
          logo.vy *= -1;
          hitY = true;
        } else if (logo.y + logo.height >= window.innerHeight) {
          logo.y = window.innerHeight - logo.height;
          logo.vy *= -1;
          hitY = true;
        }

        // Change color on bounce
        if (hitX || hitY) {
          logo.colorIndex = (logo.colorIndex + 1) % colors.length;
          imgEl.style.filter = colors[logo.colorIndex];
          updateOverlayColor();
          logo.totalBounces++;
          updateStatsHud();

          // CORNER HIT!
          if (hitX && hitY) {
            logo.cornerHits++;
            celebrateCornerHit();
          }
        }

        // Update proximity indicator
        updateProximityIndicator();

        // Update stats visibility (shows when mouse is near logo)
        updateStatsVisibility();

        // Apply screen shake
        if (screenShake.amount > 0.5) {
          var shakeX = (Math.random() - 0.5) * screenShake.amount * 2;
          var shakeY = (Math.random() - 0.5) * screenShake.amount * 2;
          container.style.transform = 'translate(' + shakeX + 'px, ' + shakeY + 'px)';
          screenShake.amount *= screenShake.decay;
        } else {
          screenShake.amount = 0;
          container.style.transform = '';
        }

        bouncer.style.left = logo.x + 'px';
        bouncer.style.top = logo.y + 'px';

        // ============= DRAW TRAIL (subtle, chill vibes) =============
        trailCtx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);

        if (trailPoints.length > 1) {
          for (var i = 1; i < trailPoints.length; i++) {
            // Very subtle trail - max 20% opacity, thin line
            var alpha = (i / trailPoints.length) * 0.2;
            trailCtx.strokeStyle = trailPoints[i].color;
            trailCtx.globalAlpha = alpha;
            trailCtx.lineWidth = 1;
            trailCtx.beginPath();
            trailCtx.moveTo(trailPoints[i-1].x, trailPoints[i-1].y);
            trailCtx.lineTo(trailPoints[i].x, trailPoints[i].y);
            trailCtx.stroke();
          }
        }
        trailCtx.globalAlpha = 1;

        // ============= DRAW CONFETTI =============
        confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

        confettiParticles = confettiParticles.filter(function(p) {
          var alive = p.update();
          if (alive) p.draw(confettiCtx);
          return alive;
        });

        // Draw shockwaves
        shockwaves = shockwaves.filter(function(s) {
          var alive = s.update();
          if (alive) s.draw(confettiCtx);
          return alive;
        });

        requestAnimationFrame(update);
      }

      update();
    }

    // Wait for image to be ready
    if (sourceImg.complete) {
      startBounce();
    } else {
      sourceImg.addEventListener('load', startBounce);
    }
  }

  // Register plugin
  if (window.web90 && window.web90.registerPlugin) {
    window.web90.registerPlugin('dvd-bounce', initDVDBounce);
  }
})();
