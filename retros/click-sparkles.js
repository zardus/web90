/**
 * Click Sparkles - Explosion of particles on mouse click
 * Because every click should feel magical
 *
 * Now with COMBO SYSTEM - rapid clicks = bigger explosions!
 */
(function() {
  'use strict';

  function initClickSparkles() {
    var canvas = document.createElement('canvas');
    canvas.id = 'click-sparkles';
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:100003;pointer-events:none;';
    document.documentElement.appendChild(canvas);

    var ctx = canvas.getContext('2d');
    var particles = [];
    var shockwaves = [];

    // COMBO SYSTEM
    var combo = 0;
    var maxCombo = 10;
    var comboTimeout = null;
    var comboDecayMs = 800; // Time before combo starts dropping
    var lastClickTime = 0;
    var comboDisplay = null;
    var screenShakeAmount = 0;
    var screenShakeDecay = 0.9;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    var params = window.web90 ? window.web90.params : new URLSearchParams(window.location.search);
    var sparkleStyle = params.get('sparkle-style') || 'rainbow';

    // Create combo display element
    function createComboDisplay() {
      comboDisplay = document.createElement('div');
      comboDisplay.id = 'combo-display';
      comboDisplay.style.cssText = 'position:fixed;top:20px;right:20px;z-index:100004;pointer-events:none;' +
        'font-family:"Press Start 2P",monospace,sans-serif;font-size:24px;color:#fff;text-shadow:0 0 10px #f0f,0 0 20px #f0f,0 0 30px #f0f,2px 2px 0 #000;' +
        'opacity:0;transition:opacity 0.2s,transform 0.1s;transform:scale(1);';
      document.documentElement.appendChild(comboDisplay);

      // Try to load the retro font
      var fontLink = document.createElement('link');
      fontLink.href = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap';
      fontLink.rel = 'stylesheet';
      document.head.appendChild(fontLink);
    }
    createComboDisplay();

    function updateComboDisplay() {
      if (!comboDisplay) return;
      if (combo > 1) {
        var hue = (combo / maxCombo) * 60; // Goes from red to yellow
        var scale = 1 + (combo / maxCombo) * 0.5;
        comboDisplay.textContent = combo + 'x COMBO!';
        comboDisplay.style.opacity = '1';
        comboDisplay.style.transform = 'scale(' + scale + ')';
        comboDisplay.style.color = 'hsl(' + hue + ', 100%, 60%)';
        comboDisplay.style.textShadow = '0 0 10px hsl(' + hue + ',100%,50%),0 0 20px hsl(' + hue + ',100%,50%),0 0 30px hsl(' + hue + ',100%,50%),2px 2px 0 #000';

        if (combo >= maxCombo) {
          comboDisplay.textContent = '★ MAX COMBO ★';
          comboDisplay.style.color = '#fff';
          comboDisplay.style.textShadow = '0 0 10px #ff0,0 0 20px #f80,0 0 40px #f00,0 0 60px #f0f,2px 2px 0 #000';
        }
      } else {
        comboDisplay.style.opacity = '0';
      }
    }

    function incrementCombo() {
      var now = Date.now();
      var timeSinceLastClick = now - lastClickTime;
      lastClickTime = now;

      // Rapid clicks (under 300ms) build combo faster
      if (timeSinceLastClick < 300 && combo < maxCombo) {
        combo = Math.min(combo + 1, maxCombo);
      } else if (timeSinceLastClick < comboDecayMs && combo > 0) {
        // Maintain combo
      } else {
        // Reset combo on slow click
        combo = 1;
      }

      // Clear existing timeout and set new one
      if (comboTimeout) clearTimeout(comboTimeout);
      comboTimeout = setTimeout(function() {
        combo = 0;
        updateComboDisplay();
      }, comboDecayMs);

      updateComboDisplay();
      return combo;
    }

    // Flash effect class - bright burst at click point
    function Flash(x, y, comboLevel) {
      this.x = x;
      this.y = y;
      this.size = 30 + comboLevel * 10;
      this.life = 1;
      this.decay = 0.15;
    }

    Flash.prototype.update = function() {
      this.life -= this.decay;
      return this.life > 0;
    };

    Flash.prototype.draw = function() {
      ctx.save();
      var gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * this.life);
      gradient.addColorStop(0, 'rgba(255, 255, 255, ' + this.life + ')');
      gradient.addColorStop(0.4, 'rgba(255, 255, 200, ' + (this.life * 0.6) + ')');
      gradient.addColorStop(1, 'rgba(255, 200, 100, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    var flashes = [];

    // Shockwave class
    function Shockwave(x, y, comboLevel) {
      this.x = x;
      this.y = y;
      this.radius = 5;
      this.maxRadius = 80 + comboLevel * 20;
      this.life = 1;
      this.lineWidth = 3 + comboLevel * 0.5;
      this.hue = (comboLevel / maxCombo) * 60;
    }

    Shockwave.prototype.update = function() {
      this.radius += 8 + (this.maxRadius / 20);
      this.life -= 0.05;
      return this.life > 0;
    };

    Shockwave.prototype.draw = function() {
      ctx.save();
      ctx.globalAlpha = this.life * 0.6;
      ctx.strokeStyle = 'hsl(' + this.hue + ', 100%, 70%)';
      ctx.lineWidth = this.lineWidth * this.life;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.stroke();

      // Inner glow ring
      ctx.globalAlpha = this.life * 0.3;
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius * 0.8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    };

    // Screen shake
    function triggerScreenShake(intensity) {
      screenShakeAmount = Math.min(screenShakeAmount + intensity, 20);
    }

    function applyScreenShake() {
      if (screenShakeAmount > 0.5) {
        var shakeX = (Math.random() - 0.5) * screenShakeAmount * 2;
        var shakeY = (Math.random() - 0.5) * screenShakeAmount * 2;
        canvas.style.transform = 'translate(' + shakeX + 'px, ' + shakeY + 'px)';
        screenShakeAmount *= screenShakeDecay;
      } else {
        screenShakeAmount = 0;
        canvas.style.transform = '';
      }
    }

    var SPARKLE_STYLES = {
      rainbow: {
        colors: ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#9400d3'],
        shape: 'star',
        glow: true
      },
      gold: {
        colors: ['#ffd700', '#ffec8b', '#daa520', '#b8860b', '#fff8dc'],
        shape: 'star',
        glow: true
      },
      hearts: {
        colors: ['#ff69b4', '#ff1493', '#ff0066', '#ff99cc', '#ffb6c1'],
        shape: 'heart',
        glow: true
      },
      pixel: {
        colors: ['#00ff00', '#00cc00', '#00ff66', '#33ff33', '#66ff66'],
        shape: 'square',
        glow: false
      },
      fire: {
        colors: ['#ff4500', '#ff6600', '#ff8800', '#ffaa00', '#ffcc00', '#ff3300'],
        shape: 'circle',
        glow: true
      },
      ice: {
        colors: ['#00ffff', '#87ceeb', '#add8e6', '#b0e0e6', '#e0ffff', '#ffffff'],
        shape: 'star',
        glow: true
      },
      confetti: {
        colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ff8800', '#8800ff'],
        shape: 'rect',
        glow: false
      }
    };

    function Particle(x, y, style) {
      this.x = x;
      this.y = y;
      var angle = Math.random() * Math.PI * 2;
      var speed = 2 + Math.random() * 6;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.life = 1;
      this.decay = 0.015 + Math.random() * 0.015;
      this.size = 4 + Math.random() * 8;
      this.color = style.colors[Math.floor(Math.random() * style.colors.length)];
      this.shape = style.shape;
      this.glow = style.glow;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotationSpeed = (Math.random() - 0.5) * 0.3;
    }

    Particle.prototype.update = function() {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += 0.15; // gravity
      this.vx *= 0.98; // friction
      this.life -= this.decay;
      this.rotation += this.rotationSpeed;
      return this.life > 0;
    };

    Particle.prototype.draw = function() {
      ctx.save();
      ctx.globalAlpha = this.life;
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);

      if (this.glow) {
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
      }

      ctx.fillStyle = this.color;

      var s = this.size * this.life;

      switch (this.shape) {
        case 'star':
          drawStar(ctx, 0, 0, 5, s, s / 2);
          break;
        case 'heart':
          drawHeart(ctx, 0, 0, s);
          break;
        case 'square':
          ctx.fillRect(-s / 2, -s / 2, s, s);
          break;
        case 'rect':
          ctx.fillRect(-s / 2, -s / 4, s, s / 2);
          break;
        case 'circle':
        default:
          ctx.beginPath();
          ctx.arc(0, 0, s / 2, 0, Math.PI * 2);
          ctx.fill();
      }

      ctx.restore();
    };

    function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
      var rot = Math.PI / 2 * 3;
      var step = Math.PI / spikes;

      ctx.beginPath();
      ctx.moveTo(cx, cy - outerRadius);

      for (var i = 0; i < spikes; i++) {
        var x = cx + Math.cos(rot) * outerRadius;
        var y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
      }

      ctx.lineTo(cx, cy - outerRadius);
      ctx.closePath();
      ctx.fill();
    }

    function drawHeart(ctx, x, y, size) {
      var s = size / 2;
      ctx.beginPath();
      ctx.moveTo(x, y + s / 4);
      ctx.bezierCurveTo(x, y - s / 2, x - s, y - s / 2, x - s, y + s / 4);
      ctx.bezierCurveTo(x - s, y + s, x, y + s * 1.2, x, y + s * 1.5);
      ctx.bezierCurveTo(x, y + s * 1.2, x + s, y + s, x + s, y + s / 4);
      ctx.bezierCurveTo(x + s, y - s / 2, x, y - s / 2, x, y + s / 4);
      ctx.fill();
    }

    function spawnExplosion(x, y) {
      var currentCombo = incrementCombo();
      var style = SPARKLE_STYLES[sparkleStyle] || SPARKLE_STYLES.rainbow;

      // Base particles + bonus based on combo
      var baseCount = 20 + Math.floor(Math.random() * 15);
      var comboBonus = currentCombo * 5;
      var count = baseCount + comboBonus;

      // Particle speed/size multiplier based on combo
      var powerMultiplier = 1 + (currentCombo / maxCombo) * 0.8;

      for (var i = 0; i < count; i++) {
        var p = new Particle(x, y, style);
        // Boost particles based on combo
        p.vx *= powerMultiplier;
        p.vy *= powerMultiplier;
        p.size *= (1 + currentCombo * 0.1);
        particles.push(p);
      }

      // Add shockwave at combo 3+
      if (currentCombo >= 3) {
        shockwaves.push(new Shockwave(x, y, currentCombo));
      }

      // Flash effect at combo 5+
      if (currentCombo >= 5) {
        flashes.push(new Flash(x, y, currentCombo));
      }

      // Screen shake scales with combo
      if (currentCombo >= 2) {
        triggerScreenShake(currentCombo * 1.5);
      }

      // MEGA EXPLOSION at max combo - spiral burst!
      if (currentCombo >= maxCombo) {
        spawnMegaExplosion(x, y, style);
      }
    }

    // Special mega explosion with spiral pattern
    function spawnMegaExplosion(x, y, style) {
      var spiralCount = 60;
      for (var i = 0; i < spiralCount; i++) {
        var angle = (i / spiralCount) * Math.PI * 6; // 3 full rotations
        var speed = 4 + (i / spiralCount) * 8;
        var p = new Particle(x, y, style);
        p.vx = Math.cos(angle) * speed;
        p.vy = Math.sin(angle) * speed;
        p.size = 8 + Math.random() * 6;
        p.decay = 0.008; // Slower decay for mega explosion
        particles.push(p);
      }

      // Add cross-burst pattern for extra drama
      var crossCount = 8;
      for (var j = 0; j < crossCount; j++) {
        var crossAngle = (j / crossCount) * Math.PI * 2;
        for (var k = 0; k < 5; k++) {
          var crossP = new Particle(x, y, style);
          var crossSpeed = 8 + k * 2;
          crossP.vx = Math.cos(crossAngle) * crossSpeed;
          crossP.vy = Math.sin(crossAngle) * crossSpeed;
          crossP.size = 10 - k;
          crossP.decay = 0.012;
          particles.push(crossP);
        }
      }

      // BIG flash
      var megaFlash = new Flash(x, y, maxCombo * 1.5);
      megaFlash.size = 150;
      megaFlash.decay = 0.08;
      flashes.push(megaFlash);

      // Add extra shockwaves
      shockwaves.push(new Shockwave(x, y, maxCombo));
      setTimeout(function() {
        shockwaves.push(new Shockwave(x, y, maxCombo * 0.7));
      }, 50);
      setTimeout(function() {
        shockwaves.push(new Shockwave(x, y, maxCombo * 0.5));
      }, 100);

      // BIG shake
      triggerScreenShake(15);
    }

    // Click handler
    document.addEventListener('click', function(e) {
      spawnExplosion(e.clientX, e.clientY);
    });

    // Touch support
    document.addEventListener('touchstart', function(e) {
      var touch = e.touches[0];
      if (touch) {
        spawnExplosion(touch.clientX, touch.clientY);
      }
    });

    // Animation loop
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Apply screen shake
      applyScreenShake();

      // Update and draw flashes (behind everything)
      flashes = flashes.filter(function(f) {
        var alive = f.update();
        if (alive) f.draw();
        return alive;
      });

      // Update and draw shockwaves
      shockwaves = shockwaves.filter(function(s) {
        var alive = s.update();
        if (alive) s.draw();
        return alive;
      });

      // Update and draw particles
      particles = particles.filter(function(p) {
        var alive = p.update();
        if (alive) p.draw();
        return alive;
      });

      requestAnimationFrame(animate);
    }

    animate();
  }

  // Register plugin
  if (window.web90 && window.web90.registerPlugin) {
    window.web90.registerPlugin('click-sparkles', initClickSparkles);
  }
})();
