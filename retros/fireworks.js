/**
 * Fireworks Mouse Trail Module
 * Shoots fireworks from the bottom of the screen towards the mouse position
 * and explodes into colorful streamers when they reach the target.
 */

(function() {
  'use strict';

  var web90 = window.web90;

  // Configuration
  var LAUNCH_INTERVAL_MIN = 1500;  // Minimum ms between launches
  var LAUNCH_INTERVAL_MAX = 4000;  // Maximum ms between launches
  var ROCKET_SPEED = 8;            // Pixels per frame
  var STREAMER_COUNT = 30;         // Number of streamers per explosion
  var STREAMER_SPEED = 6;          // Initial speed of streamers
  var STREAMER_GRAVITY = 0.15;     // Gravity pulling streamers down
  var STREAMER_FRICTION = 0.98;    // Air resistance
  var STREAMER_LIFETIME = 80;      // Frames until streamer fades
  var TRAIL_LENGTH = 5;            // Length of rocket trail

  var canvas, ctx;
  var mouseX = window.innerWidth / 2;
  var mouseY = window.innerHeight / 2;
  var rockets = [];
  var streamers = [];
  var lastLaunch = 0;
  var nextLaunchDelay = getRandomLaunchDelay();

  // Bright, vibrant colors for the streamers
  var COLORS = [
    '#ff0040', '#ff0080', '#ff00bf', '#ff00ff',
    '#bf00ff', '#8000ff', '#4000ff', '#0000ff',
    '#0040ff', '#0080ff', '#00bfff', '#00ffff',
    '#00ffbf', '#00ff80', '#00ff40', '#00ff00',
    '#40ff00', '#80ff00', '#bfff00', '#ffff00',
    '#ffbf00', '#ff8000', '#ff4000'
  ];

  function getRandomLaunchDelay() {
    return LAUNCH_INTERVAL_MIN + Math.random() * (LAUNCH_INTERVAL_MAX - LAUNCH_INTERVAL_MIN);
  }

  function randomColor() {
    return COLORS[Math.floor(Math.random() * COLORS.length)];
  }

  function Rocket(targetX, targetY) {
    // Start from random position at bottom of screen
    this.x = Math.random() * canvas.width;
    this.y = canvas.height + 10;
    this.targetX = targetX;
    this.targetY = targetY;
    this.color = randomColor();
    this.trail = [];

    // Calculate angle and velocity towards target
    var dx = targetX - this.x;
    var dy = targetY - this.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    this.vx = (dx / dist) * ROCKET_SPEED;
    this.vy = (dy / dist) * ROCKET_SPEED;
  }

  Rocket.prototype.update = function() {
    // Store trail position
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > TRAIL_LENGTH) {
      this.trail.shift();
    }

    // Move rocket
    this.x += this.vx;
    this.y += this.vy;

    // Check if reached target (or close enough)
    var dx = this.targetX - this.x;
    var dy = this.targetY - this.y;
    var dist = Math.sqrt(dx * dx + dy * dy);

    return dist < 15; // Returns true when exploded
  };

  Rocket.prototype.draw = function() {
    // Draw trail
    for (var i = 0; i < this.trail.length; i++) {
      var t = this.trail[i];
      var alpha = (i + 1) / this.trail.length;
      ctx.beginPath();
      ctx.arc(t.x, t.y, 2 * alpha, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 200, 100, ' + (alpha * 0.7) + ')';
      ctx.fill();
    }

    // Draw rocket head
    ctx.beginPath();
    ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();

    // Glow effect
    ctx.beginPath();
    ctx.arc(this.x, this.y, 6, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 200, 0.3)';
    ctx.fill();
  };

  function Streamer(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;

    // Random direction
    var angle = Math.random() * Math.PI * 2;
    var speed = STREAMER_SPEED * (0.5 + Math.random() * 0.5);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;

    this.life = STREAMER_LIFETIME;
    this.maxLife = STREAMER_LIFETIME;
    this.trail = [];
  }

  Streamer.prototype.update = function() {
    // Store trail
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > 8) {
      this.trail.shift();
    }

    // Apply physics
    this.vy += STREAMER_GRAVITY;
    this.vx *= STREAMER_FRICTION;
    this.vy *= STREAMER_FRICTION;

    this.x += this.vx;
    this.y += this.vy;

    this.life--;
    return this.life <= 0;
  };

  Streamer.prototype.draw = function() {
    var alpha = this.life / this.maxLife;

    // Draw trail
    for (var i = 0; i < this.trail.length; i++) {
      var t = this.trail[i];
      var trailAlpha = ((i + 1) / this.trail.length) * alpha * 0.5;
      ctx.beginPath();
      ctx.arc(t.x, t.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = this.color.replace(')', ', ' + trailAlpha + ')').replace('rgb', 'rgba');
      ctx.fill();
    }

    // Draw streamer head
    ctx.beginPath();
    ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = this.color.replace(')', ', ' + alpha + ')').replace('rgb', 'rgba');
    ctx.fill();

    // Glow
    ctx.beginPath();
    ctx.arc(this.x, this.y, 5, 0, Math.PI * 2);
    var glowColor = this.color.replace(')', ', ' + (alpha * 0.3) + ')').replace('rgb', 'rgba');
    ctx.fillStyle = glowColor;
    ctx.fill();
  };

  function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? 'rgb(' + parseInt(result[1], 16) + ', ' + parseInt(result[2], 16) + ', ' + parseInt(result[3], 16) + ')' : 'rgb(255, 255, 255)';
  }

  function explode(x, y) {
    // Create streamers in various colors
    for (var i = 0; i < STREAMER_COUNT; i++) {
      var color = hexToRgb(randomColor());
      streamers.push(new Streamer(x, y, color));
    }
  }

  function launchRocket() {
    rockets.push(new Rocket(mouseX, mouseY));
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    var now = Date.now();

    // Check if it's time to launch a new rocket
    if (now - lastLaunch > nextLaunchDelay) {
      launchRocket();
      lastLaunch = now;
      nextLaunchDelay = getRandomLaunchDelay();
    }

    // Update and draw rockets
    for (var i = rockets.length - 1; i >= 0; i--) {
      var rocket = rockets[i];
      var exploded = rocket.update();

      if (exploded) {
        explode(rocket.x, rocket.y);
        rockets.splice(i, 1);
      } else {
        rocket.draw();
      }
    }

    // Update and draw streamers
    for (var j = streamers.length - 1; j >= 0; j--) {
      var streamer = streamers[j];
      var dead = streamer.update();

      if (dead) {
        streamers.splice(j, 1);
      } else {
        streamer.draw();
      }
    }

    requestAnimationFrame(animate);
  }

  function handleResize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function initFireworks() {
    // Create canvas
    canvas = document.createElement('canvas');
    canvas.id = 'fireworks-canvas';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');

    // Track mouse position
    document.addEventListener('mousemove', function(e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    document.addEventListener('touchmove', function(e) {
      var touch = e.touches[0];
      if (touch) {
        mouseX = touch.clientX;
        mouseY = touch.clientY;
      }
    }, { passive: true });

    window.addEventListener('resize', handleResize);

    // Start animation
    lastLaunch = Date.now();
    animate();
  }

  // Register the plugin
  window.web90.registerPlugin('fireworks', initFireworks);

})();
