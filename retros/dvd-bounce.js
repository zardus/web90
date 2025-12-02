/**
 * DVD Bounce - Classic DVD Screensaver
 * Uses the first image on the page as the bouncing element
 */
(function() {
  'use strict';

  function initDVDBounce() {
    // Find the first visible image on the page
    var images = document.querySelectorAll('img');
    var sourceImg = null;

    for (var i = 0; i < images.length; i++) {
      var img = images[i];
      var style = window.getComputedStyle(img);
      var rect = img.getBoundingClientRect();

      // Check if image is visible
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

    // Wait for image to load if needed
    function startBounce() {
      // Get original position before hiding (use client coords since container is position:fixed)
      var originalRect = sourceImg.getBoundingClientRect();
      var startX = originalRect.left;
      var startY = originalRect.top;

      // Hide the original image (use opacity to preserve layout)
      sourceImg.style.opacity = '0';

      var container = document.createElement('div');
      container.id = 'dvd-bounce';
      container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:100000;pointer-events:none;';
      document.documentElement.appendChild(container);

      // Create bouncing image container
      var bouncer = document.createElement('div');
      bouncer.style.cssText = 'position:absolute;display:inline-block;';
      container.appendChild(bouncer);

      // Clone the image (keep original size)
      var img = sourceImg.cloneNode(true);
      img.style.cssText = 'display:block;transition:filter 0.1s ease;';
      bouncer.appendChild(img);

      // Add DVD Video overlay in corner
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

      // Get actual rendered dimensions from the original image's rect
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
        started: false
      };

      // Randomly flip direction
      if (Math.random() > 0.5) logo.vx *= -1;
      if (Math.random() > 0.5) logo.vy *= -1;

      // Set initial position
      bouncer.style.left = logo.x + 'px';
      bouncer.style.top = logo.y + 'px';

      // Start moving after a delay
      setTimeout(function() {
        logo.started = true;
      }, 2000);

      // Corner hit celebration element
      var celebration = document.createElement('div');
      celebration.style.cssText = [
        'position:fixed',
        'top:50%',
        'left:50%',
        'transform:translate(-50%,-50%)',
        'font-size:48px',
        'font-weight:bold',
        'color:#fff',
        'text-shadow:0 0 20px currentColor',
        'pointer-events:none',
        'opacity:0',
        'transition:opacity 0.3s ease',
        'z-index:100001'
      ].join(';');
      celebration.textContent = '🎉 CORNER! 🎉';
      container.appendChild(celebration);

      function update() {
        if (!logo.started) {
          requestAnimationFrame(update);
          return;
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
          img.style.filter = colors[logo.colorIndex];
          updateOverlayColor();

          // CORNER HIT!
          if (hitX && hitY) {
            celebration.style.opacity = '1';
            celebration.style.color = ['#ff0', '#0ff', '#f0f', '#0f0'][Math.floor(Math.random() * 4)];
            setTimeout(function() {
              celebration.style.opacity = '0';
            }, 1500);
          }
        }

        // Update position
        bouncer.style.left = logo.x + 'px';
        bouncer.style.top = logo.y + 'px';

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
