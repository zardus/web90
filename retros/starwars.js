/**
 * Star Wars Crawl Theme
 *
 * THE KEY INSIGHT:
 * Content is placed on a plane that's rotated 65° in 3D space (tilted away from viewer).
 * When we translateY WITHIN that rotated plane, the content moves "up" the tilted surface,
 * which due to perspective appears as moving INTO THE DISTANCE (Z-axis).
 *
 * This is fundamentally different from the failed approaches that tried to:
 * - Use native scrolling (which is screen-space Y movement)
 * - Manually calculate per-element screen positions (still screen-space Y)
 *
 * Here, the translateY is applied to a container that's ALREADY in 3D-rotated space,
 * so the browser's perspective projection handles the Z-depth effect automatically.
 */

(function() {
  'use strict';

  // How fast scrolling moves the crawl
  var SCROLL_SPEED = 1.5;

  // Smoothing factor (0-1, lower = smoother but laggier)
  var SMOOTHING = 0.12;

  function initStarWars() {
    // ===== CREATE STARFIELD =====
    var stars = document.createElement('div');
    stars.className = 'starwars-stars';
    document.body.appendChild(stars);

    // ===== CREATE THE 3D STAGE =====
    var stage = document.createElement('div');
    stage.className = 'starwars-stage';

    // ===== CREATE THE TILTED PLANE =====
    var plane = document.createElement('div');
    plane.className = 'starwars-plane';

    // ===== CREATE THE SCROLLABLE CONTENT CONTAINER =====
    var content = document.createElement('div');
    content.className = 'starwars-content';

    // ===== GET AND MOVE MAIN CONTENT =====
    var main = document.getElementById('main') || document.querySelector('main');
    if (!main) {
      console.error('[StarWars] No main content element found');
      return;
    }

    // Clone nav elements first (if they exist)
    var navElements = document.querySelectorAll('nav');
    navElements.forEach(function(nav) {
      content.appendChild(nav.cloneNode(true));
    });

    // Clone the content into our container
    // Use cloneNode to avoid issues with moving nodes
    var children = Array.prototype.slice.call(main.children);
    children.forEach(function(child) {
      // Skip slots but keep dividers
      if (child.hasAttribute('data-retro-slot')) {
        return;
      }
      content.appendChild(child.cloneNode(true));
    });

    // Assemble the DOM
    plane.appendChild(content);
    stage.appendChild(plane);
    document.body.appendChild(stage);

    // ===== SETUP SCROLL CONTROL =====
    requestAnimationFrame(function() {
      setupScrollControl(content);
    });
  }

  function setupScrollControl(content) {
    // Measure content height after it's rendered
    var contentHeight = content.scrollHeight;
    var viewportHeight = window.innerHeight;

    // The crawl starts with content below the visible area (positive translateY)
    // and scrolls it up (negative translateY) into the distance
    var startOffset = viewportHeight * 0.3;  // Start just below visible
    var endOffset = -contentHeight - 200;    // End when all content has passed

    var currentY = startOffset;   // Current position (for smooth animation)
    var targetY = startOffset;    // Target position (from user input)

    console.log('[StarWars] Setup - contentHeight:', contentHeight, 'startOffset:', startOffset, 'endOffset:', endOffset);
    var animating = false;
    var autoScrolling = false;
    var userHasInteracted = false;

    function updateCrawl() {
      content.style.setProperty('--crawl-y', currentY + 'px');
    }

    function animate() {
      var diff = targetY - currentY;

      if (Math.abs(diff) > 0.5) {
        currentY += diff * SMOOTHING;
        updateCrawl();
        requestAnimationFrame(animate);
      } else {
        currentY = targetY;
        updateCrawl();
        animating = false;
      }
    }

    function startAnimation() {
      if (!animating) {
        animating = true;
        requestAnimationFrame(animate);
      }
    }

    function clampTarget() {
      // Don't let it scroll past the beginning or end
      if (targetY > startOffset) targetY = startOffset;
      if (targetY < endOffset) targetY = endOffset;
    }

    // ===== AUTO-SCROLL ON LOAD =====
    // After a brief delay, scroll in at constant speed like Star Wars
    // Continue until user interacts or content ends
    setTimeout(function() {
      var speed = 0.8;  // Pixels per frame (constant speed)
      autoScrolling = true;

      function autoScrollAnimate() {
        // Stop if user has interacted
        if (userHasInteracted) {
          autoScrolling = false;
          targetY = currentY;  // Sync targetY for manual scrolling
          console.log('[StarWars] Auto-scroll stopped by user interaction');
          return;
        }

        // Continue scrolling until we reach the end
        if (currentY > endOffset) {
          currentY -= speed;
          if (currentY < endOffset) currentY = endOffset;
          updateCrawl();
          requestAnimationFrame(autoScrollAnimate);
        } else {
          // Reached the end
          autoScrolling = false;
          targetY = currentY;
          console.log('[StarWars] Auto-scroll completed - reached end of content');
        }
      }
      autoScrollAnimate();
    }, 500);

    // ===== WHEEL SCROLL =====
    function onWheel(e) {
      e.preventDefault();

      // Stop auto-scroll on first interaction
      if (!userHasInteracted) {
        userHasInteracted = true;
      }

      // Scroll down (positive deltaY) = move content UP (negative Y) = into distance
      targetY -= e.deltaY * SCROLL_SPEED;
      clampTarget();
      startAnimation();
    }

    // ===== TOUCH SCROLL =====
    var touchStartY = 0;
    var touchLastY = 0;

    function onTouchStart(e) {
      touchStartY = e.touches[0].clientY;
      touchLastY = touchStartY;

      // Stop auto-scroll on first interaction
      if (!userHasInteracted) {
        userHasInteracted = true;
      }
    }

    function onTouchMove(e) {
      e.preventDefault();

      var touchY = e.touches[0].clientY;
      var deltaY = touchLastY - touchY;  // Positive when swiping up
      touchLastY = touchY;

      // Swipe up = move content up = into distance
      targetY -= deltaY * 2;
      clampTarget();
      startAnimation();
    }

    // ===== KEYBOARD SCROLL =====
    function onKeyDown(e) {
      var delta = 0;

      switch (e.key) {
        case 'ArrowDown':
        case 'j':
          delta = -80;
          break;
        case 'ArrowUp':
        case 'k':
          delta = 80;
          break;
        case ' ':
        case 'PageDown':
          delta = -300;
          break;
        case 'PageUp':
          delta = 300;
          break;
        case 'Home':
          e.preventDefault();
          // Stop auto-scroll on first interaction
          if (!userHasInteracted) {
            userHasInteracted = true;
          }
          targetY = startOffset;
          startAnimation();
          return;
        case 'End':
          e.preventDefault();
          // Stop auto-scroll on first interaction
          if (!userHasInteracted) {
            userHasInteracted = true;
          }
          targetY = endOffset;
          startAnimation();
          return;
        default:
          return;
      }

      e.preventDefault();
      // Stop auto-scroll on first interaction
      if (!userHasInteracted) {
        userHasInteracted = true;
      }
      targetY += delta;
      clampTarget();
      startAnimation();
    }

    // ===== RESIZE HANDLER =====
    function onResize() {
      viewportHeight = window.innerHeight;
      contentHeight = content.scrollHeight;
      startOffset = viewportHeight * 0.8;
      endOffset = -contentHeight - 200;
      clampTarget();
      updateCrawl();
    }

    // ===== ATTACH EVENT LISTENERS =====
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onResize);

    // ===== INITIAL RENDER =====
    updateCrawl();

    console.log('[StarWars] Crawl initialized. Content height:', contentHeight, 'px');
    console.log('[StarWars] Scroll range:', startOffset, 'to', endOffset);
  }

  // ===== REGISTER WITH WEB90 =====
  if (window.web90 && window.web90.registerPlugin) {
    window.web90.registerPlugin('starwars', initStarWars);
  }

})();
