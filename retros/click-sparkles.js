/**
 * Click Sparkles - Explosion of particles on mouse click
 * Because every click should feel magical
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

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    var params = window.web90 ? window.web90.params : new URLSearchParams(window.location.search);
    var sparkleStyle = params.get('sparkle-style') || 'rainbow';

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
      var style = SPARKLE_STYLES[sparkleStyle] || SPARKLE_STYLES.rainbow;
      var count = 20 + Math.floor(Math.random() * 15);

      for (var i = 0; i < count; i++) {
        particles.push(new Particle(x, y, style));
      }
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
