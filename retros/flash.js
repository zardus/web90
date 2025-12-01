/**
 * Flash Theme Module
 * Lazy-loaded plugin for the Flash site theme
 *
 * This module is loaded on-demand when the flash theme is activated.
 */

(function() {
  'use strict';

  // Get utilities from the core
  var createElement = window.web90.createElement;
  var randomFrom = window.web90.randomFrom;

  // ============================================
  // Theme: Flash Mode
  // ============================================

  function initFlash() {
    var header = document.querySelector('header');
    var nav = document.querySelector('nav');
    var sections = document.querySelectorAll('section[id]');
    var main = document.getElementById('main');

    if (!header || !sections.length) return;

    document.body.classList.add('flash-mode');

    var headshotImg = document.querySelector('.headshot');
    var headerContent = {
      title: header.querySelector('h1') ? header.querySelector('h1').textContent : 'Welcome',
      headshot: headshotImg ? headshotImg.src : null
    };

    var navLinks = [];
    if (nav) {
      nav.querySelectorAll('a').forEach(function(a) {
        navLinks.push({ text: a.textContent, href: a.href });
      });
    }

    var sectionData = [];
    sections.forEach(function(section) {
      sectionData.push({
        id: section.id,
        title: section.dataset.title || section.id,
        element: section
      });
    });

    var flashContainer = createElement('div');
    flashContainer.id = 'flash-container';
    flashContainer.innerHTML = buildFlashHTML();

    if (main) main.style.display = 'none';
    document.body.appendChild(flashContainer);

    var controlPanel = document.getElementById('control-panel');
    if (controlPanel) flashContainer.appendChild(controlPanel);

    populateFlashContent(flashContainer, headerContent, navLinks, sectionData);
    setupFlashNavigation(flashContainer);
    startFlashLoader(flashContainer);
  }

  function buildFlashHTML() {
    return '\
      <div id="flash-loader">\
        <div class="flash-loader-content">\
          <div class="flash-logo">⚡</div>\
          <div class="flash-loading-text">Loading...</div>\
          <div class="flash-progress-container">\
            <div class="flash-progress-bar"></div>\
          </div>\
          <div class="flash-progress-percent">0%</div>\
          <div class="flash-macromedia">Made with Macromedia® Flash™</div>\
        </div>\
      </div>\
      <div id="flash-intro" style="display:none;">\
        <div class="flash-intro-content">\
          <div class="flash-intro-headshot"></div>\
          <div class="flash-intro-title"></div>\
          <div class="flash-intro-subtitle">ENTER SITE</div>\
          <button class="flash-enter-btn">► CLICK TO ENTER ◄</button>\
          <div class="flash-skip">[ skip intro ]</div>\
        </div>\
      </div>\
      <div id="flash-site" style="display:none;">\
        <div class="flash-header">\
          <div class="flash-header-left">\
            <div class="flash-header-headshot"></div>\
            <div class="flash-site-title"></div>\
          </div>\
          <div class="flash-nav"></div>\
        </div>\
        <div class="flash-main">\
          <div class="flash-sidebar"></div>\
          <div class="flash-content"></div>\
        </div>\
        <div class="flash-footer">\
          <span>© 2003 All Rights Reserved</span>\
          <span class="flash-visitor-count">Visitors: <span id="flash-visitors">0</span></span>\
          <span>Best viewed in 800x600</span>\
        </div>\
      </div>\
    ';
  }

  function populateFlashContent(container, headerContent, navLinks, sectionData) {
    var flashTitle = container.querySelector('.flash-site-title');
    var introTitle = container.querySelector('.flash-intro-title');
    if (flashTitle) flashTitle.textContent = headerContent.title;
    if (introTitle) {
      introTitle.textContent = headerContent.title;
      introTitle.setAttribute('data-text', headerContent.title);
    }

    if (headerContent.headshot) {
      addHeadshotToFlash(container, headerContent.headshot);
    }

    buildFlashNav(container, navLinks, sectionData);
    buildFlashSections(container, sectionData);
  }

  function addHeadshotToFlash(container, headshotSrc) {
    var introHeadshot = container.querySelector('.flash-intro-headshot');
    var headerHeadshot = container.querySelector('.flash-header-headshot');

    if (introHeadshot) {
      var img1 = createElement('img');
      img1.src = headshotSrc;
      img1.alt = 'Headshot';
      introHeadshot.appendChild(img1);
    }

    if (headerHeadshot) {
      var img2 = createElement('img');
      img2.src = headshotSrc;
      img2.alt = 'Headshot';
      img2.style.cursor = 'pointer';
      img2.title = 'Click me!';
      img2.addEventListener('click', function() {
        triggerHeadshotFreakout(container, headshotSrc);
      });
      headerHeadshot.appendChild(img2);
    }
  }

  function triggerHeadshotFreakout(container, imgSrc) {
    var overlay = createElement('div');
    overlay.className = 'flash-headshot-freakout';

    var bigHead = createElement('img');
    bigHead.src = imgSrc;
    bigHead.className = 'flash-freakout-head';
    overlay.appendChild(bigHead);

    // Particle explosion
    var particles = ['⭐', '✨', '💥', '🔥', '⚡', '💫', '🌟'];
    for (var i = 0; i < 30; i++) {
      var particle = createElement('div');
      particle.className = 'flash-freakout-particle';
      particle.style.cssText = '--angle:' + (Math.random() * 360) + 'deg;--distance:' + (100 + Math.random() * 300) + 'px;--duration:' + (0.5 + Math.random() * 0.5) + 's;--delay:' + (Math.random() * 0.2) + 's;--size:' + (10 + Math.random() * 20) + 'px';
      particle.textContent = randomFrom(particles);
      overlay.appendChild(particle);
    }

    // Matrix rain columns
    for (var j = 0; j < 20; j++) {
      var column = createElement('div');
      column.className = 'flash-freakout-matrix-col';
      column.style.cssText = 'left:' + (j * 5) + '%;animation-delay:' + (Math.random() * 2) + 's;animation-duration:' + (1 + Math.random() * 2) + 's';
      var chars = '';
      for (var k = 0; k < 30; k++) chars += String.fromCharCode(0x30A0 + Math.random() * 96) + '<br>';
      column.innerHTML = chars;
      overlay.appendChild(column);
    }

    // Lens flares
    for (var l = 0; l < 5; l++) {
      var flare = createElement('div');
      flare.className = 'flash-freakout-flare';
      flare.style.cssText = '--flare-delay:' + (l * 0.15) + 's;left:' + (20 + Math.random() * 60) + '%;top:' + (20 + Math.random() * 60) + '%';
      overlay.appendChild(flare);
    }

    // Epic text
    var epicText = createElement('div');
    epicText.className = 'flash-freakout-text';
    epicText.textContent = randomFrom(['EPIC!', 'AWESOME!', 'LEGENDARY!', 'ULTRA!', 'MAXIMUM!', 'EXTREME!']);
    overlay.appendChild(epicText);

    container.appendChild(overlay);

    setTimeout(function() {
      overlay.classList.add('ending');
      setTimeout(function() { overlay.remove(); }, 500);
    }, 2500);
  }

  function addCrumpleHandler(el) {
    el.addEventListener('click', function(e) {
      if (e.ctrlKey || e.metaKey || e.shiftKey) return;
      e.preventDefault();
      triggerPageCrumple(this.href);
    });
  }

  function buildFlashNav(container, navLinks, sectionData) {
    var flashNav = container.querySelector('.flash-nav');
    var flashSidebar = container.querySelector('.flash-sidebar');

    sectionData.forEach(function(section, index) {
      var btn = createElement('button');
      btn.className = 'flash-nav-btn';
      btn.textContent = section.title;
      btn.dataset.section = section.id;
      if (index === 0) btn.classList.add('active');
      flashNav.appendChild(btn);

      var sideBtn = createElement('div');
      sideBtn.className = 'flash-sidebar-btn';
      sideBtn.innerHTML = '► ' + section.title;
      sideBtn.dataset.section = section.id;
      if (index === 0) sideBtn.classList.add('active');
      flashSidebar.appendChild(sideBtn);
    });

    if (navLinks.length > 0) {
      var divider = createElement('div');
      divider.className = 'flash-sidebar-divider';
      flashSidebar.appendChild(divider);

      var linksHeader = createElement('div');
      linksHeader.className = 'flash-sidebar-header';
      linksHeader.textContent = '✦ LINKS ✦';
      flashSidebar.appendChild(linksHeader);

      var navDivider = createElement('span');
      navDivider.className = 'flash-nav-divider';
      navDivider.textContent = '|';
      flashNav.appendChild(navDivider);

      navLinks.forEach(function(link) {
        var sideLink = createElement('a');
        sideLink.className = 'flash-sidebar-link';
        sideLink.href = link.href;
        sideLink.innerHTML = '› ' + link.text;
        addCrumpleHandler(sideLink);
        flashSidebar.appendChild(sideLink);

        var navLink = createElement('a');
        navLink.className = 'flash-nav-link';
        navLink.href = link.href;
        navLink.textContent = link.text;
        addCrumpleHandler(navLink);
        flashNav.appendChild(navLink);
      });
    }
  }

  function buildFlashSections(container, sectionData) {
    var flashContent = container.querySelector('.flash-content');

    sectionData.forEach(function(section, index) {
      var div = createElement('div');
      div.className = 'flash-section';
      div.id = 'flash-' + section.id;

      var title = createElement('h2');
      title.className = 'flash-section-title';
      title.textContent = section.title;
      div.appendChild(title);

      div.appendChild(section.element);
      section.element.style.display = 'block';

      if (index === 0) div.classList.add('active');
      flashContent.appendChild(div);
    });
  }

  function setupFlashNavigation(container) {
    var flashContent = container.querySelector('.flash-content');

    function showSection(sectionId) {
      var currentActive = container.querySelector('.flash-section.active');
      var targetSection = container.querySelector('#flash-' + sectionId);

      if (currentActive && targetSection && currentActive === targetSection) return;

      flashContent.classList.add('flash-screen-shake');
      setTimeout(function() { flashContent.classList.remove('flash-screen-shake'); }, 300);

      if (currentActive) {
        currentActive.classList.add('exiting');
        currentActive.classList.remove('active');
      }

      container.querySelectorAll('.flash-nav-btn, .flash-sidebar-btn').forEach(function(b) {
        b.classList.remove('active');
      });
      container.querySelectorAll('[data-section="' + sectionId + '"]').forEach(function(b) {
        b.classList.add('active');
      });

      setTimeout(function() {
        if (currentActive) currentActive.classList.remove('exiting');
        if (targetSection) targetSection.classList.add('active');
      }, 250);
    }

    container.querySelectorAll('.flash-nav-btn[data-section], .flash-sidebar-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        showSection(this.dataset.section);
      });
    });
  }

  function startFlashLoader(container) {
    var progress = 0;
    var progressBar = container.querySelector('.flash-progress-bar');
    var progressPercent = container.querySelector('.flash-progress-percent');
    var loader = container.querySelector('#flash-loader');
    var intro = container.querySelector('#flash-intro');
    var site = container.querySelector('#flash-site');

    function updateProgress() {
      progress += Math.random() * 15 + 5;
      if (progress > 100) progress = 100;
      progressBar.style.width = progress + '%';
      progressPercent.textContent = Math.floor(progress) + '%';

      if (progress < 100) {
        setTimeout(updateProgress, 200 + Math.random() * 300);
      } else {
        setTimeout(function() {
          loader.classList.add('fade-out');
          setTimeout(function() {
            loader.style.display = 'none';
            intro.style.display = 'flex';
            intro.classList.add('fade-in');
          }, 500);
        }, 500);
      }
    }

    setTimeout(updateProgress, 500);

    function enterSite() {
      intro.classList.add('fade-out');
      setTimeout(function() {
        intro.style.display = 'none';
        site.style.display = 'flex';
        site.classList.add('flash-site-enter');

        var visitorEl = document.getElementById('flash-visitors');
        var targetCount = Math.floor(Math.random() * 50000) + 10000;
        var currentCount = 0;
        var increment = Math.ceil(targetCount / 50);
        var countInterval = setInterval(function() {
          currentCount += increment;
          if (currentCount >= targetCount) {
            currentCount = targetCount;
            clearInterval(countInterval);
          }
          visitorEl.textContent = currentCount.toLocaleString();
        }, 30);
      }, 500);
    }

    container.querySelector('.flash-enter-btn').addEventListener('click', enterSite);
    container.querySelector('.flash-skip').addEventListener('click', function() {
      loader.style.display = 'none';
      intro.style.display = 'none';
      site.style.display = 'flex';
      site.classList.add('flash-site-enter');
      document.getElementById('flash-visitors').textContent = (Math.floor(Math.random() * 50000) + 10000).toLocaleString();
    });

    // Set up external link crumple effect
    setupFlashExternalLinkCrumple(container);
  }

  function isExternalLink(href) {
    if (!href) return false;
    try {
      var url = new URL(href, window.location.origin);
      return url.origin !== window.location.origin;
    } catch (e) {
      return false;
    }
  }

  function setupFlashExternalLinkCrumple(container) {
    container.addEventListener('click', function(e) {
      var link = e.target.closest('a[href]');
      if (!link) return;

      var href = link.getAttribute('href');
      if (!isExternalLink(href)) return;

      // Don't interfere with modified clicks
      if (e.ctrlKey || e.metaKey || e.shiftKey) return;

      e.preventDefault();
      triggerPageCrumple(href);
    });
  }

  function triggerPageCrumple(destinationUrl) {
    var container = document.getElementById('flash-container');
    if (!container) {
      window.location.href = destinationUrl;
      return;
    }

    // Add crumpling class to body for the site animation
    container.classList.add('flash-crumpling');

    // Create the overlay
    var overlay = createElement('div');
    overlay.className = 'flash-crumple-overlay';

    // Add crumple texture
    var texture = createElement('div');
    texture.className = 'flash-crumple-texture';
    overlay.appendChild(texture);

    // Fold lines
    [
      'horizontal;top:30%;animation-delay:0s',
      'horizontal;top:60%;animation-delay:0.1s',
      'vertical;left:25%;animation-delay:0.05s',
      'vertical;left:75%;animation-delay:0.15s',
      'diagonal;top:20%;left:-25%;transform:rotate(35deg);animation-delay:0.2s',
      'diagonal;top:70%;left:-25%;transform:rotate(-25deg);animation-delay:0.25s'
    ].forEach(function(f) {
      var parts = f.split(';');
      var foldEl = createElement('div');
      foldEl.className = 'flash-crumple-fold ' + parts[0];
      foldEl.style.cssText = parts.slice(1).join(';');
      overlay.appendChild(foldEl);
    });

    // Shockwaves
    ['var(--gold)', 'var(--orange-red)', 'var(--cyan)'].forEach(function(color, i) {
      var wave = createElement('div');
      wave.className = 'flash-crumple-shockwave';
      wave.style.cssText = '--wave-delay:' + (i * 0.15) + 's;--wave-duration:0.8s;border-color:' + color;
      overlay.appendChild(wave);
    });

    // Add goodbye text
    var goodbyeText = createElement('div');
    goodbyeText.className = 'flash-crumple-text';
    goodbyeText.textContent = randomFrom(['LATER!', 'BYE!', 'PEACE!', 'ADIOS!', 'SEE YA!', 'CIAO!']);
    overlay.appendChild(goodbyeText);

    container.appendChild(overlay);

    // Navigate after animation
    setTimeout(function() {
      window.location.href = destinationUrl;
    }, 1100);
  }

  // Register the plugin
  window.web90.registerPlugin('flash', initFlash);

})();
