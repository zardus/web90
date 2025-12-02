/**
 * 3D Pipes - Classic Windows Screensaver
 * Mesmerizing pipe construction
 */
(function() {
  'use strict';

  function initPipes() {
    // Enable dark mode for the page
    document.body.classList.toggle('dark-mode', true);

    var canvas = document.createElement('canvas');
    canvas.id = 'pipes-screensaver';
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:-1;pointer-events:none;background:#000;';
    document.documentElement.appendChild(canvas);

    var ctx = canvas.getContext('2d');

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    var pipes = [];
    var maxPipes = 5;
    var gridSize = 30;

    var colors = [
      { main: '#cc0000', light: '#ff4444', dark: '#880000' }, // Red
      { main: '#00cc00', light: '#44ff44', dark: '#008800' }, // Green
      { main: '#0000cc', light: '#4444ff', dark: '#000088' }, // Blue
      { main: '#cccc00', light: '#ffff44', dark: '#888800' }, // Yellow
      { main: '#cc00cc', light: '#ff44ff', dark: '#880088' }, // Magenta
      { main: '#00cccc', light: '#44ffff', dark: '#008888' }, // Cyan
      { main: '#cc6600', light: '#ff9944', dark: '#884400' }, // Orange
      { main: '#6600cc', light: '#9944ff', dark: '#440088' }  // Purple
    ];

    // Directions: 0=right, 1=down, 2=left, 3=up, 4=forward(fake), 5=back(fake)
    var dirs = [
      { dx: 1, dy: 0 },  // right
      { dx: 0, dy: 1 },  // down
      { dx: -1, dy: 0 }, // left
      { dx: 0, dy: -1 }  // up
    ];

    function Pipe() {
      this.reset();
    }

    Pipe.prototype.reset = function() {
      // Start position
      this.x = Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize;
      this.y = Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize;

      // Direction
      this.dir = Math.floor(Math.random() * 4);

      // Color
      this.color = colors[Math.floor(Math.random() * colors.length)];

      // Segments
      this.segments = [];
      this.segmentCount = 0;
      this.maxSegments = 50 + Math.floor(Math.random() * 100);

      // Size
      this.radius = 8 + Math.random() * 6;

      // Speed
      this.growTimer = 0;
      this.growDelay = 1;
    };

    Pipe.prototype.update = function() {
      this.growTimer++;
      if (this.growTimer < this.growDelay) return;
      this.growTimer = 0;

      // Move
      var d = dirs[this.dir];
      var newX = this.x + d.dx * gridSize;
      var newY = this.y + d.dy * gridSize;

      // Check bounds
      if (newX < 0 || newX > canvas.width || newY < 0 || newY > canvas.height) {
        // Turn
        this.turn();
        return;
      }

      // Random turn
      if (Math.random() < 0.2) {
        var oldDir = this.dir;
        this.turn();
        this.segments.push({
          type: 'joint',
          x: this.x,
          y: this.y,
          fromDir: oldDir,
          toDir: this.dir
        });
      } else {
        // Straight segment
        this.segments.push({
          type: 'straight',
          x1: this.x,
          y1: this.y,
          x2: newX,
          y2: newY,
          dir: this.dir
        });
        this.x = newX;
        this.y = newY;
      }

      this.segmentCount++;
      if (this.segmentCount >= this.maxSegments) {
        this.reset();
      }
    };

    Pipe.prototype.turn = function() {
      // Turn left or right
      var turnDir = Math.random() < 0.5 ? -1 : 1;
      this.dir = (this.dir + turnDir + 4) % 4;
    };

    Pipe.prototype.draw = function() {
      var self = this;
      var r = this.radius;

      this.segments.forEach(function(seg) {
        if (seg.type === 'straight') {
          // Draw pipe cylinder
          ctx.save();

          // Main pipe body
          ctx.strokeStyle = self.color.main;
          ctx.lineWidth = r * 2;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(seg.x1, seg.y1);
          ctx.lineTo(seg.x2, seg.y2);
          ctx.stroke();

          // Highlight
          ctx.strokeStyle = self.color.light;
          ctx.lineWidth = r * 0.8;
          ctx.beginPath();
          if (seg.dir === 0 || seg.dir === 2) {
            ctx.moveTo(seg.x1, seg.y1 - r * 0.4);
            ctx.lineTo(seg.x2, seg.y2 - r * 0.4);
          } else {
            ctx.moveTo(seg.x1 - r * 0.4, seg.y1);
            ctx.lineTo(seg.x2 - r * 0.4, seg.y2);
          }
          ctx.stroke();

          // Shadow
          ctx.strokeStyle = self.color.dark;
          ctx.lineWidth = r * 0.5;
          ctx.beginPath();
          if (seg.dir === 0 || seg.dir === 2) {
            ctx.moveTo(seg.x1, seg.y1 + r * 0.5);
            ctx.lineTo(seg.x2, seg.y2 + r * 0.5);
          } else {
            ctx.moveTo(seg.x1 + r * 0.5, seg.y1);
            ctx.lineTo(seg.x2 + r * 0.5, seg.y2);
          }
          ctx.stroke();

          ctx.restore();
        } else if (seg.type === 'joint') {
          // Draw joint ball
          ctx.save();

          // Gradient for 3D effect
          var gradient = ctx.createRadialGradient(
            seg.x - r * 0.3, seg.y - r * 0.3, 0,
            seg.x, seg.y, r * 1.3
          );
          gradient.addColorStop(0, self.color.light);
          gradient.addColorStop(0.5, self.color.main);
          gradient.addColorStop(1, self.color.dark);

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(seg.x, seg.y, r * 1.2, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        }
      });

      // Draw current head
      ctx.save();
      var gradient = ctx.createRadialGradient(
        this.x - r * 0.3, this.y - r * 0.3, 0,
        this.x, this.y, r * 1.5
      );
      gradient.addColorStop(0, '#ffffff');
      gradient.addColorStop(0.3, this.color.light);
      gradient.addColorStop(0.7, this.color.main);
      gradient.addColorStop(1, this.color.dark);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(this.x, this.y, r * 1.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    // Initialize pipes
    for (var i = 0; i < maxPipes; i++) {
      var p = new Pipe();
      // Stagger start
      p.segmentCount = -i * 20;
      pipes.push(p);
    }

    // Fade old pipes occasionally
    var frameCount = 0;

    function animate() {
      frameCount++;

      // Slow fade of background
      if (frameCount % 3 === 0) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.01)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      pipes.forEach(function(pipe) {
        pipe.update();
        pipe.draw();
      });

      requestAnimationFrame(animate);
    }

    animate();
  }

  // Register plugin
  if (window.web90 && window.web90.registerPlugin) {
    window.web90.registerPlugin('pipes', initPipes);
  }
})();
