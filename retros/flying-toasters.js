/**
 * Flying Toasters - After Dark Screensaver Tribute
 * The iconic 1989 screensaver that defined an era
 */
(function() {
  'use strict';

  function initFlyingToasters() {
    var basePath = window.web90 ? window.web90.config.basePath : '/web90';

    // Create container for toasters
    var container = document.createElement('div');
    container.id = 'flying-toasters';
    container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:100001;pointer-events:none;overflow:hidden;';
    document.documentElement.appendChild(container);

    var toasters = [];
    var toasts = [];
    var toasterSrc = basePath + '/toaster.gif';

    // Toaster class using DOM elements
    function Toaster() {
      this.el = document.createElement('img');
      this.el.src = toasterSrc;
      this.el.style.cssText = 'position:absolute;pointer-events:none;';
      container.appendChild(this.el);
      this.reset();
      this.x = window.innerWidth + Math.random() * 200;
      this.y = Math.random() * window.innerHeight;
      this.updatePosition();
    }

    Toaster.prototype.reset = function() {
      this.x = window.innerWidth + 80;
      this.y = Math.random() * (window.innerHeight - 100);
      this.speed = 1.5 + Math.random() * 1.5;
      this.wobble = Math.random() * Math.PI * 2;
      this.scale = 0.6 + Math.random() * 0.4;
      this.el.style.width = (80 * this.scale) + 'px';
      this.el.style.height = 'auto';
    };

    Toaster.prototype.update = function() {
      this.x -= this.speed;
      this.y += Math.sin(this.wobble) * 0.5;
      this.wobble += 0.03;

      // Occasionally pop out some toast
      if (Math.random() < 0.003) {
        toasts.push(new Toast(this.x + 30 * this.scale, this.y + 10 * this.scale));
      }

      if (this.x < -100) {
        this.reset();
      }

      this.updatePosition();
    };

    Toaster.prototype.updatePosition = function() {
      this.el.style.left = this.x + 'px';
      this.el.style.top = this.y + 'px';
    };

    // Toast class - bread emoji that pops out
    function Toast(x, y) {
      this.el = document.createElement('div');
      this.el.textContent = '🍞';
      this.el.style.cssText = 'position:absolute;font-size:24px;pointer-events:none;';
      container.appendChild(this.el);

      this.x = x;
      this.y = y;
      this.vx = -1.5 - Math.random(); // Move left with toasters
      this.vy = -2 - Math.random() * 2; // Pop up initially
      this.rotation = -30; // Start tilted to match toaster direction
      this.rotationSpeed = (Math.random() - 0.5) * 8;
      this.updatePosition();
    }

    Toast.prototype.update = function() {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += 0.12; // Gravity
      this.rotation += this.rotationSpeed;
      this.updatePosition();

      // Return false when off screen
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

    // Animation loop
    function animate() {
      toasters.forEach(function(toaster) {
        toaster.update();
      });

      // Update toasts and remove dead ones
      toasts = toasts.filter(function(toast) {
        var alive = toast.update();
        if (!alive) toast.remove();
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
