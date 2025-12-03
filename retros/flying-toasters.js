/**
 * Flying Toasters - After Dark Screensaver Tribute
 * The iconic 1989 screensaver that defined an era
 *
 * ULTRA ENHANCED with:
 * - Mouse interaction (click to burn, hover to scare)
 * - Smoke & fire particle effects
 * - Golden/Rainbow rare toasters with sparkles
 * - Stats HUD with persistent tracking
 * - Visual "POP!" effects
 * - Toaster panic mode
 * - Achievement system
 */
(function() {
  'use strict';

  // ============= STORAGE =============
  var STORAGE_KEY = 'web90_toaster_stats';

  function getStats() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { burned: 0, golden: 0 };
    } catch (e) {
      return { burned: 0, golden: 0 };
    }
  }

  function saveStats(stats) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch (e) { /* ignore */ }
  }

  // ============= ACHIEVEMENTS =============
  var ACHIEVEMENTS = [
    { stat: 'burned', count: 1, title: '🔥 FIRST BURN', subtitle: 'That toaster had a family' },
    { stat: 'burned', count: 10, title: '🔥 ARSONIST', subtitle: 'The toasters fear you' },
    { stat: 'burned', count: 50, title: '🔥 INFERNO', subtitle: 'You monster' },
    { stat: 'golden', count: 1, title: '✨ GOLDEN CATCH', subtitle: 'Luck is on your side' },
    { stat: 'golden', count: 5, title: '✨ MIDAS TOUCH', subtitle: 'Everything you touch...' }
  ];

  function initFlyingToasters() {
    var basePath = window.web90 ? window.web90.config.basePath : '/web90';
    var stats = getStats();
    var shownAchievements = [];

    // Create container for toasters
    var container = document.createElement('div');
    container.id = 'flying-toasters';
    container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:100001;pointer-events:none;overflow:hidden;';
    document.documentElement.appendChild(container);

    // ============= PARTICLE CANVAS =============
    var particleCanvas = document.createElement('canvas');
    particleCanvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;';
    container.appendChild(particleCanvas);
    var pCtx = particleCanvas.getContext('2d');

    function resizeCanvas() {
      particleCanvas.width = window.innerWidth;
      particleCanvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    var particles = [];
    var popTexts = [];
    var toasters = [];
    var toasts = [];
    var toasterSrc = basePath + '/toaster.gif';

    // Mouse tracking
    var mouseX = -1000, mouseY = -1000;
    var mouseDown = false;

    document.addEventListener('mousemove', function(e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    document.addEventListener('mousedown', function() { mouseDown = true; });
    document.addEventListener('mouseup', function() { mouseDown = false; });

    // ============= STATS HUD =============
    var statsHud = document.createElement('div');
    statsHud.style.cssText = [
      'position:fixed',
      'bottom:20px',
      'left:20px',
      'font-family:monospace',
      'font-size:11px',
      'color:#ff8800',
      'background:rgba(0,0,0,0.8)',
      'padding:8px 12px',
      'border-radius:5px',
      'border:1px solid #ff8800',
      'z-index:100002',
      'pointer-events:none',
      'opacity:0.8',
      'text-shadow:0 0 5px #ff8800'
    ].join(';');
    container.appendChild(statsHud);

    function updateStatsHud() {
      statsHud.innerHTML = '🔥 Burned: ' + stats.burned + ' | ✨ Golden: ' + stats.golden;
    }
    updateStatsHud();

    // ============= ACHIEVEMENT TOAST (lol) =============
    var achievementEl = document.createElement('div');
    achievementEl.style.cssText = [
      'position:fixed',
      'top:50%',
      'left:50%',
      'transform:translate(-50%,-50%) scale(0)',
      'z-index:100003',
      'pointer-events:none',
      'text-align:center',
      'font-family:Arial Black,sans-serif',
      'transition:transform 0.4s cubic-bezier(0.68,-0.55,0.265,1.55),opacity 0.3s',
      'opacity:0'
    ].join(';');
    container.appendChild(achievementEl);

    function showAchievement(ach) {
      achievementEl.innerHTML = [
        '<div style="font-size:36px;color:#fff;text-shadow:0 0 20px #ff8800,0 0 40px #ff8800;">' + ach.title + '</div>',
        '<div style="font-size:18px;color:#ff8800;margin-top:10px;">' + ach.subtitle + '</div>'
      ].join('');
      achievementEl.style.transform = 'translate(-50%,-50%) scale(1)';
      achievementEl.style.opacity = '1';
      setTimeout(function() {
        achievementEl.style.transform = 'translate(-50%,-50%) scale(0)';
        achievementEl.style.opacity = '0';
      }, 2500);
    }

    function checkAchievements() {
      ACHIEVEMENTS.forEach(function(ach) {
        var key = ach.stat + '_' + ach.count;
        if (stats[ach.stat] >= ach.count && shownAchievements.indexOf(key) === -1) {
          shownAchievements.push(key);
          setTimeout(function() { showAchievement(ach); }, 300);
        }
      });
    }

    // ============= SMOKE PARTICLE =============
    function SmokeParticle(x, y) {
      this.x = x;
      this.y = y;
      this.vx = (Math.random() - 0.5) * 2;
      this.vy = -1 - Math.random() * 2;
      this.life = 1;
      this.decay = 0.02 + Math.random() * 0.02;
      this.size = 8 + Math.random() * 12;
      this.gray = Math.floor(Math.random() * 60 + 40);
    }

    SmokeParticle.prototype.update = function() {
      this.x += this.vx;
      this.y += this.vy;
      this.vy *= 0.98;
      this.vx += (Math.random() - 0.5) * 0.3;
      this.life -= this.decay;
      this.size += 0.5;
      return this.life > 0;
    };

    SmokeParticle.prototype.draw = function(ctx) {
      ctx.save();
      ctx.globalAlpha = this.life * 0.6;
      ctx.fillStyle = 'rgb(' + this.gray + ',' + this.gray + ',' + this.gray + ')';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * this.life, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    // ============= SPARKLE PARTICLE (for golden toasters) =============
    function SparkleParticle(x, y) {
      this.x = x;
      this.y = y;
      var angle = Math.random() * Math.PI * 2;
      var speed = 1 + Math.random() * 3;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.life = 1;
      this.decay = 0.03 + Math.random() * 0.02;
      this.size = 3 + Math.random() * 4;
      this.hue = 40 + Math.random() * 20; // Gold hues
    }

    SparkleParticle.prototype.update = function() {
      this.x += this.vx;
      this.y += this.vy;
      this.life -= this.decay;
      return this.life > 0;
    };

    SparkleParticle.prototype.draw = function(ctx) {
      ctx.save();
      ctx.globalAlpha = this.life;
      ctx.fillStyle = 'hsl(' + this.hue + ', 100%, 60%)';
      ctx.shadowColor = 'hsl(' + this.hue + ', 100%, 50%)';
      ctx.shadowBlur = 10;
      // Star shape
      ctx.beginPath();
      var s = this.size * this.life;
      for (var i = 0; i < 4; i++) {
        var a = (i / 4) * Math.PI * 2 - Math.PI / 2;
        ctx.lineTo(this.x + Math.cos(a) * s, this.y + Math.sin(a) * s);
        var a2 = a + Math.PI / 4;
        ctx.lineTo(this.x + Math.cos(a2) * s * 0.4, this.y + Math.sin(a2) * s * 0.4);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    // ============= FIRE PARTICLE (burning toaster) =============
    function FireParticle(x, y) {
      this.x = x;
      this.y = y;
      this.vx = (Math.random() - 0.5) * 3;
      this.vy = -3 - Math.random() * 4;
      this.life = 1;
      this.decay = 0.04 + Math.random() * 0.03;
      this.size = 6 + Math.random() * 8;
    }

    FireParticle.prototype.update = function() {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += 0.1; // slight gravity
      this.life -= this.decay;
      return this.life > 0;
    };

    FireParticle.prototype.draw = function(ctx) {
      ctx.save();
      ctx.globalAlpha = this.life;
      var hue = 20 + (1 - this.life) * 30; // Orange to red
      ctx.fillStyle = 'hsl(' + hue + ', 100%, 50%)';
      ctx.shadowColor = 'hsl(' + hue + ', 100%, 50%)';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * this.life, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    // ============= POP TEXT =============
    function PopText(x, y, text, color) {
      this.x = x;
      this.y = y;
      this.text = text || 'POP!';
      this.color = color || '#ffff00';
      this.life = 1;
      this.decay = 0.025;
      this.scale = 0.5;
    }

    PopText.prototype.update = function() {
      this.y -= 2;
      this.life -= this.decay;
      this.scale = Math.min(1.5, this.scale + 0.1);
      return this.life > 0;
    };

    PopText.prototype.draw = function(ctx) {
      ctx.save();
      ctx.globalAlpha = this.life;
      ctx.font = 'bold ' + Math.floor(24 * this.scale) + 'px Arial Black';
      ctx.fillStyle = this.color;
      ctx.textAlign = 'center';
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 15;
      ctx.fillText(this.text, this.x, this.y);
      ctx.restore();
    };

    // ============= TOASTER CLASS =============
    function Toaster() {
      this.el = document.createElement('img');
      this.el.src = toasterSrc;
      this.el.className = 'toaster';
      this.el.style.cssText = 'position:absolute;transition:filter 0.2s;';
      container.appendChild(this.el);

      // Determine rarity
      var roll = Math.random();
      this.isGolden = roll < 0.03; // 3% chance
      this.isRainbow = roll < 0.005; // 0.5% chance

      this.reset();
      this.x = window.innerWidth + Math.random() * 200;
      this.y = Math.random() * window.innerHeight;
      this.updatePosition();
    }

    Toaster.prototype.reset = function() {
      this.x = window.innerWidth + 80;
      this.y = Math.random() * (window.innerHeight - 150);
      this.speed = 1.5 + Math.random() * 1.5;
      this.wobble = Math.random() * Math.PI * 2;
      this.scale = 0.6 + Math.random() * 0.4;
      this.el.style.width = (80 * this.scale) + 'px';
      this.el.style.height = 'auto';

      this.burned = false;
      this.burnProgress = 0;
      this.scared = false;
      this.scareVy = 0;
      this.dead = false;
      this.fallSpeed = 0;
      this.hue = 0;

      // Re-roll rarity
      var roll = Math.random();
      this.isGolden = roll < 0.03;
      this.isRainbow = roll < 0.005;

      this.updateFilter();
    };

    Toaster.prototype.updateFilter = function() {
      if (this.burned) {
        this.el.style.filter = 'brightness(0.2) sepia(1) saturate(0)';
      } else if (this.isRainbow) {
        this.el.style.filter = 'hue-rotate(' + this.hue + 'deg) saturate(2) brightness(1.3)';
      } else if (this.isGolden) {
        this.el.style.filter = 'sepia(1) saturate(3) brightness(1.2) hue-rotate(-10deg)';
      } else if (this.scared) {
        this.el.style.filter = 'brightness(1.3)';
      } else {
        this.el.style.filter = '';
      }
    };

    Toaster.prototype.burn = function() {
      if (this.burned || this.dead) return;

      this.burned = true;
      this.dead = true;
      this.updateFilter();

      // Fire explosion
      for (var i = 0; i < 20; i++) {
        particles.push(new FireParticle(
          this.x + 40 * this.scale,
          this.y + 30 * this.scale
        ));
      }

      // Pop text
      popTexts.push(new PopText(
        this.x + 40 * this.scale,
        this.y,
        '🔥 BURN!',
        '#ff4400'
      ));

      // Update stats
      if (this.isGolden || this.isRainbow) {
        stats.golden++;
        popTexts.push(new PopText(
          this.x + 40 * this.scale,
          this.y - 30,
          '✨ GOLDEN! ✨',
          '#ffd700'
        ));
      }
      stats.burned++;
      saveStats(stats);
      updateStatsHud();
      checkAchievements();
    };

    Toaster.prototype.update = function() {
      // Check for mouse interaction
      var cx = this.x + 40 * this.scale;
      var cy = this.y + 30 * this.scale;
      var dx = mouseX - cx;
      var dy = mouseY - cy;
      var dist = Math.sqrt(dx * dx + dy * dy);

      // Click to burn
      if (mouseDown && dist < 60 * this.scale && !this.dead) {
        this.burn();
      }

      // Hover to scare (veer away)
      if (dist < 150 && !this.dead && !this.burned) {
        this.scared = true;
        // Flee from mouse
        var fleeAngle = Math.atan2(cy - mouseY, cx - mouseX);
        this.scareVy += Math.sin(fleeAngle) * 0.8;
        this.speed = Math.max(this.speed, 3); // Speed up when scared
      } else {
        this.scared = false;
        this.scareVy *= 0.95; // Calm down
      }

      // Dead toaster falls
      if (this.dead) {
        this.fallSpeed += 0.5;
        this.y += this.fallSpeed;

        // Smoke trail
        if (Math.random() < 0.3) {
          particles.push(new SmokeParticle(cx, cy));
        }

        if (this.y > window.innerHeight + 100) {
          this.reset();
        }
        this.updatePosition();
        return;
      }

      // Normal movement
      this.x -= this.speed;
      this.y += Math.sin(this.wobble) * 0.5 + this.scareVy;
      this.wobble += 0.03;

      // Keep in bounds vertically
      if (this.y < 0) { this.y = 0; this.scareVy = Math.abs(this.scareVy); }
      if (this.y > window.innerHeight - 100) { this.y = window.innerHeight - 100; this.scareVy = -Math.abs(this.scareVy); }

      // Rainbow hue cycle
      if (this.isRainbow) {
        this.hue = (this.hue + 3) % 360;
        this.updateFilter();
      }

      // Golden sparkles
      if ((this.isGolden || this.isRainbow) && Math.random() < 0.15) {
        particles.push(new SparkleParticle(
          cx + (Math.random() - 0.5) * 60 * this.scale,
          cy + (Math.random() - 0.5) * 40 * this.scale
        ));
      }

      // Occasionally pop out some toast
      if (Math.random() < 0.004) {
        var brownness = Math.random();
        toasts.push(new Toast(
          this.x + 30 * this.scale,
          this.y + 10 * this.scale,
          brownness,
          this.isGolden || this.isRainbow
        ));

        // POP! text
        popTexts.push(new PopText(
          this.x + 40 * this.scale,
          this.y - 10,
          'POP!',
          this.isGolden ? '#ffd700' : '#ffff00'
        ));
      }

      if (this.x < -100) {
        this.reset();
      }

      this.updateFilter();
      this.updatePosition();
    };

    Toaster.prototype.updatePosition = function() {
      this.el.style.left = this.x + 'px';
      this.el.style.top = this.y + 'px';
    };

    Toaster.prototype.remove = function() {
      if (this.el.parentNode) {
        this.el.parentNode.removeChild(this.el);
      }
    };

    // ============= TOAST CLASS =============
    function Toast(x, y, brownness, isGolden) {
      this.el = document.createElement('div');

      // Different toast states based on brownness
      if (brownness < 0.3) {
        this.el.textContent = '🍞'; // Light
        this.state = 'light';
      } else if (brownness < 0.7) {
        this.el.textContent = '🥪'; // Perfect (well, sandwich but looks toasted)
        this.state = 'perfect';
      } else {
        this.el.textContent = '🥯'; // Dark (bagel looks burnt-ish)
        this.state = 'burnt';
      }

      this.isGolden = isGolden;
      this.el.style.cssText = 'position:absolute;font-size:24px;';
      if (isGolden) {
        this.el.style.filter = 'drop-shadow(0 0 10px gold)';
        this.el.style.fontSize = '28px';
      }
      container.appendChild(this.el);

      this.x = x;
      this.y = y;
      this.vx = -1.5 - Math.random();
      this.vy = -3 - Math.random() * 3;
      this.rotation = -30;
      this.rotationSpeed = (Math.random() - 0.5) * 10;
      this.updatePosition();
    }

    Toast.prototype.update = function() {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += 0.15;
      this.rotation += this.rotationSpeed;
      this.updatePosition();

      // Off screen
      return this.y < window.innerHeight + 50 && this.x > -50;
    };

    Toast.prototype.updatePosition = function() {
      this.el.style.left = this.x + 'px';
      this.el.style.top = this.y + 'px';
      this.el.style.transform = 'rotate(' + this.rotation + 'deg)';
    };

    Toast.prototype.remove = function() {
      if (this.el.parentNode) {
        this.el.parentNode.removeChild(this.el);
      }
    };

    // Spawn toasters
    var numToasters = Math.min(8, Math.floor(window.innerWidth / 150));
    for (var i = 0; i < numToasters; i++) {
      var t = new Toaster();
      t.x = Math.random() * window.innerWidth;
      t.updatePosition();
      toasters.push(t);
    }

    // ============= ANIMATION LOOP =============
    function animate() {
      // Clear particle canvas
      pCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);

      // Update toasters
      toasters.forEach(function(toaster) {
        toaster.update();
      });

      // Update toasts
      toasts = toasts.filter(function(toast) {
        var alive = toast.update();
        if (!alive) toast.remove();
        return alive;
      });

      // Update particles
      particles = particles.filter(function(p) {
        var alive = p.update();
        if (alive) p.draw(pCtx);
        return alive;
      });

      // Update pop texts
      popTexts = popTexts.filter(function(p) {
        var alive = p.update();
        if (alive) p.draw(pCtx);
        return alive;
      });

      requestAnimationFrame(animate);
    }

    animate();
  }

  // Register plugin
  if (window.web90 && window.web90.registerPlugin) {
    window.web90.registerPlugin('flying-toasters', initFlyingToasters);
  }
})();
