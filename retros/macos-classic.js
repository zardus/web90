/**
 * macOS Classic Theme Module
 * Lazy-loaded plugin for the Mac OS 7/8/9 desktop theme
 *
 * Uses system.css (scoped to .macos-classic) for authentic Mac UI components.
 */

(function() {
  'use strict';

  var createElement = window.web90.createElement;

  // Window management state
  var windowState = {
    windows: [],
    zIndexCounter: 100,
    activeWindow: null
  };

  // ============================================
  // Main Initialization
  // ============================================

  function initMacOSClassic() {
    var header = document.querySelector('header');
    var nav = document.querySelector('nav');
    var sections = document.querySelectorAll('section[id]');
    var main = document.getElementById('main');

    if (!header || !sections.length) return;

    document.body.classList.add('macos-classic-mode');

    // Extract content from existing page
    var headerContent = {
      title: header.querySelector('h1') ? header.querySelector('h1').textContent : 'Macintosh HD',
      headshot: document.querySelector('.headshot') ? document.querySelector('.headshot').src : null
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

    // Create main container (macos-classic class enables scoped system.css styles)
    var container = createElement('div');
    container.id = 'macos-classic-container';
    container.className = 'macos-classic';
    container.innerHTML = buildMacHTML(sectionData, navLinks, headerContent);

    if (main) main.style.display = 'none';
    document.body.appendChild(container);

    // Move control panel if it exists
    var controlPanel = document.getElementById('control-panel');
    if (controlPanel) container.appendChild(controlPanel);

    // Store data for window creation
    container.sectionData = sectionData;
    container.headerContent = headerContent;
    container.navLinks = navLinks;

    // Start boot sequence
    startBootSequence(container);
  }

  // ============================================
  // HTML Structure - Uses system.css classes
  // ============================================

  function buildMacHTML(sectionData, navLinks, headerContent) {
    var desktopIcons = buildDesktopIconsHTML(sectionData, navLinks, headerContent);

    // Menu bar using system.css ul[role=menu-bar] pattern
    var menuBar = '\
      <ul role="menu-bar">\
        <li role="menu-item" class="apple-menu" aria-haspopup="true">\
          🍎\
          <ul role="menu">\
            <li role="menu-item"><button data-action="about">About This Macintosh</button></li>\
            <li role="menu-item" class="divider"></li>\
            <li role="menu-item"><button class="menu-disabled" disabled>Alarm Clock</button></li>\
            <li role="menu-item"><button class="menu-disabled" disabled>Calculator</button></li>\
            <li role="menu-item"><button class="menu-disabled" disabled>Chooser</button></li>\
            <li role="menu-item"><button class="menu-disabled" disabled>Control Panels</button></li>\
            <li role="menu-item"><button class="menu-disabled" disabled>Key Caps</button></li>\
            <li role="menu-item"><button class="menu-disabled" disabled>Scrapbook</button></li>\
          </ul>\
        </li>\
        <li role="menu-item" aria-haspopup="true">\
          File\
          <ul role="menu">\
            <li role="menu-item"><button class="menu-disabled" disabled>New Folder <span class="menu-shortcut">⌘N</span></button></li>\
            <li role="menu-item"><button class="menu-disabled" disabled>Open <span class="menu-shortcut">⌘O</span></button></li>\
            <li role="menu-item" class="divider"></li>\
            <li role="menu-item"><button data-action="close">Close Window <span class="menu-shortcut">⌘W</span></button></li>\
            <li role="menu-item"><button class="menu-disabled" disabled>Get Info <span class="menu-shortcut">⌘I</span></button></li>\
            <li role="menu-item" class="divider"></li>\
            <li role="menu-item"><button class="menu-disabled" disabled>Page Setup...</button></li>\
            <li role="menu-item"><button class="menu-disabled" disabled>Print... <span class="menu-shortcut">⌘P</span></button></li>\
          </ul>\
        </li>\
        <li role="menu-item" aria-haspopup="true">\
          Edit\
          <ul role="menu">\
            <li role="menu-item"><button class="menu-disabled" disabled>Undo <span class="menu-shortcut">⌘Z</span></button></li>\
            <li role="menu-item" class="divider"></li>\
            <li role="menu-item"><button class="menu-disabled" disabled>Cut <span class="menu-shortcut">⌘X</span></button></li>\
            <li role="menu-item"><button class="menu-disabled" disabled>Copy <span class="menu-shortcut">⌘C</span></button></li>\
            <li role="menu-item"><button class="menu-disabled" disabled>Paste <span class="menu-shortcut">⌘V</span></button></li>\
            <li role="menu-item"><button class="menu-disabled" disabled>Clear</button></li>\
            <li role="menu-item"><button class="menu-disabled" disabled>Select All <span class="menu-shortcut">⌘A</span></button></li>\
          </ul>\
        </li>\
        <li role="menu-item" aria-haspopup="true">\
          View\
          <ul role="menu">\
            <li role="menu-item"><button class="menu-disabled" disabled>by Small Icon</button></li>\
            <li role="menu-item"><button class="menu-disabled" disabled>by Icon</button></li>\
            <li role="menu-item"><button class="menu-disabled" disabled>by Name</button></li>\
            <li role="menu-item"><button class="menu-disabled" disabled>by Date</button></li>\
            <li role="menu-item"><button class="menu-disabled" disabled>by Size</button></li>\
            <li role="menu-item"><button class="menu-disabled" disabled>by Kind</button></li>\
          </ul>\
        </li>\
        <li role="menu-item" aria-haspopup="true">\
          Special\
          <ul role="menu">\
            <li role="menu-item"><button class="menu-disabled" disabled>Clean Up Window</button></li>\
            <li role="menu-item"><button class="menu-disabled" disabled>Empty Trash...</button></li>\
            <li role="menu-item" class="divider"></li>\
            <li role="menu-item"><button class="menu-disabled" disabled>Eject Disk <span class="menu-shortcut">⌘E</span></button></li>\
            <li role="menu-item"><button class="menu-disabled" disabled>Erase Disk...</button></li>\
            <li role="menu-item" class="divider"></li>\
            <li role="menu-item"><button data-action="restart">Restart</button></li>\
            <li role="menu-item"><button data-action="shutdown">Shut Down</button></li>\
          </ul>\
        </li>\
        <li class="menu-spacer"></li>\
        <li class="menu-clock"></li>\
      </ul>\
    ';

    return '\
      <div id="macos-boot">\
        <div class="happy-mac">\
          <div class="happy-mac-screen">\
            <div class="happy-mac-face">:)</div>\
          </div>\
          <div class="happy-mac-base"></div>\
        </div>\
        <div class="boot-progress">\
          <div class="boot-progress-bar" id="mac-boot-progress"></div>\
        </div>\
        <div class="boot-text">Starting up...</div>\
      </div>\
      <div id="macos-desktop" style="display:none;">\
        <div class="mac-menu-bar-container">\
          ' + menuBar + '\
        </div>\
        <div class="mac-desktop-area">\
          <div class="mac-desktop-icons">\
            ' + desktopIcons + '\
          </div>\
        </div>\
      </div>\
    ';
  }

  function buildDesktopIconsHTML(sectionData, navLinks, headerContent) {
    var html = '';

    // Profile icon (with headshot and name)
    if (headerContent && headerContent.title) {
      html += '\
        <div class="mac-desktop-icon" data-action="profile">\
          <div class="icon-image">' + (headerContent.headshot ? '<img src="' + headerContent.headshot + '" class="profile-icon-img">' : '👤') + '</div>\
          <div class="icon-label">' + headerContent.title + '</div>\
        </div>\
      ';
    }

    // Macintosh HD icon
    html += '\
      <div class="mac-desktop-icon" data-action="macintosh-hd">\
        <div class="icon-image">💾</div>\
        <div class="icon-label">Macintosh HD</div>\
      </div>\
    ';

    // Content sections as documents
    sectionData.forEach(function(section) {
      var icon = '📄';
      if (section.id === 'research' || section.id === 'publications') {
        icon = '📝';
      } else if (section.id === 'contact') {
        icon = '📋';
      }

      html += '\
        <div class="mac-desktop-icon" data-section="' + section.id + '" data-title="' + section.title + '">\
          <div class="icon-image">' + icon + '</div>\
          <div class="icon-label">' + section.title + '</div>\
        </div>\
      ';
    });

    // Links folder
    if (navLinks.length > 0) {
      html += '\
        <div class="mac-desktop-icon" data-action="links-folder">\
          <div class="icon-image">📁</div>\
          <div class="icon-label">Links</div>\
        </div>\
      ';
    }

    // Trash
    html += '\
      <div class="mac-desktop-icon trash-icon" data-action="trash">\
        <div class="icon-image">🗑️</div>\
        <div class="icon-label">Trash</div>\
      </div>\
    ';

    return html;
  }

  // ============================================
  // Boot Sequence
  // ============================================

  function startBootSequence(container) {
    var boot = container.querySelector('#macos-boot');
    var desktop = container.querySelector('#macos-desktop');
    var progressBar = document.getElementById('mac-boot-progress');
    var bootText = boot.querySelector('.boot-text');

    var progress = 0;
    var bootTexts = [
      'Starting up...',
      'Loading extensions...',
      'Loading System Folder...',
      'Loading Finder...',
      'Welcome to Macintosh'
    ];
    var textIndex = 0;

    function updateProgress() {
      progress += Math.random() * 8 + 2;
      if (progress > 100) progress = 100;
      progressBar.style.width = progress + '%';

      if (progress > 20 && textIndex === 0) { textIndex = 1; bootText.textContent = bootTexts[1]; }
      else if (progress > 40 && textIndex === 1) { textIndex = 2; bootText.textContent = bootTexts[2]; }
      else if (progress > 60 && textIndex === 2) { textIndex = 3; bootText.textContent = bootTexts[3]; }
      else if (progress > 90 && textIndex === 3) { textIndex = 4; bootText.textContent = bootTexts[4]; }

      if (progress < 100) {
        setTimeout(updateProgress, 100 + Math.random() * 100);
      } else {
        setTimeout(function() {
          boot.classList.add('fade-out');
          setTimeout(function() {
            boot.style.display = 'none';
            desktop.style.display = 'flex';
            desktop.classList.add('desktop-startup');
            initDesktop(container);
          }, 500);
        }, 500);
      }
    }

    setTimeout(updateProgress, 500);
  }

  // ============================================
  // Desktop Initialization
  // ============================================

  function initDesktop(container) {
    updateClock(container);
    setInterval(function() { updateClock(container); }, 1000);

    // Desktop icon handlers
    var icons = container.querySelectorAll('.mac-desktop-icon');
    icons.forEach(function(icon) {
      icon.addEventListener('dblclick', function() {
        handleIconDoubleClick(container, this);
      });

      icon.addEventListener('click', function(e) {
        icons.forEach(function(i) { i.classList.remove('selected'); });
        this.classList.add('selected');
        e.stopPropagation();
      });
    });

    container.querySelector('.mac-desktop-area').addEventListener('click', function() {
      icons.forEach(function(i) { i.classList.remove('selected'); });
    });

    // Menu bar click to toggle dropdowns
    var menuItems = container.querySelectorAll('ul[role=menu-bar] > li[role=menu-item]');
    var activeMenu = null;

    menuItems.forEach(function(item) {
      item.addEventListener('click', function(e) {
        e.stopPropagation();
        if (activeMenu === this) {
          this.classList.remove('active');
          activeMenu = null;
        } else {
          menuItems.forEach(function(m) { m.classList.remove('active'); });
          this.classList.add('active');
          activeMenu = this;
        }
      });

      // Hover to switch menus when one is open
      item.addEventListener('mouseenter', function() {
        if (activeMenu && activeMenu !== this) {
          menuItems.forEach(function(m) { m.classList.remove('active'); });
          this.classList.add('active');
          activeMenu = this;
        }
      });
    });

    // Close menus on click outside
    document.addEventListener('click', function() {
      menuItems.forEach(function(m) { m.classList.remove('active'); });
      activeMenu = null;
    });

    // Menu action handlers
    container.querySelectorAll('[role=menu] button[data-action]').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        var action = this.dataset.action;
        if (action === 'about') openAboutDialog(container);
        else if (action === 'shutdown') triggerShutdown(container);
        else if (action === 'restart') location.reload();
        else if (action === 'close') closeActiveWindow(container);

        // Close menu after action
        menuItems.forEach(function(m) { m.classList.remove('active'); });
        activeMenu = null;
        e.stopPropagation();
      });
    });
  }

  function updateClock(container) {
    var clock = container.querySelector('.menu-clock');
    if (!clock) return;

    var now = new Date();
    var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    var hours = now.getHours();
    var minutes = now.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    clock.textContent = days[now.getDay()] + ' ' + hours + ':' + minutes + ' ' + ampm;
  }

  // ============================================
  // Icon Handlers
  // ============================================

  function handleIconDoubleClick(container, icon) {
    var sectionId = icon.dataset.section;
    var action = icon.dataset.action;

    if (sectionId) {
      openSimpleTextWindow(container, sectionId, icon.dataset.title);
    } else if (action === 'profile') {
      openProfileWindow(container);
    } else if (action === 'macintosh-hd') {
      openMacintoshHDWindow(container);
    } else if (action === 'trash') {
      openTrashWindow(container);
    } else if (action === 'links-folder') {
      openLinksWindow(container);
    }
  }

  // ============================================
  // Window Management - Uses system.css .window
  // ============================================

  function createWindow(container, options) {
    var windowId = 'mac-window-' + Date.now();

    // Use system.css window structure
    var win = createElement('div');
    win.className = 'window';
    win.id = windowId;
    win.style.zIndex = ++windowState.zIndexCounter;
    win.style.left = (80 + windowState.windows.length * 25) + 'px';
    win.style.top = (40 + windowState.windows.length * 25) + 'px';

    if (options.width) win.style.width = options.width + 'px';
    if (options.height) win.style.height = options.height + 'px';

    // system.css title-bar structure with close and resize buttons
    win.innerHTML = '\
      <div class="title-bar">\
        <button class="close" aria-label="Close"></button>\
        <span class="title">' + options.title + '</span>\
        <button class="resize" aria-label="Zoom"></button>\
      </div>\
      <div class="window-pane">\
        ' + options.content + '\
      </div>\
    ';

    container.querySelector('.mac-desktop-area').appendChild(win);

    // Window controls
    win.querySelector('button.close').addEventListener('click', function() {
      closeWindow(container, windowId);
    });

    win.querySelector('button.resize').addEventListener('click', function() {
      toggleZoom(win);
    });

    // Make draggable
    makeWindowDraggable(win);

    // Focus on click
    win.addEventListener('mousedown', function() {
      bringToFront(win);
    });

    windowState.windows.push({ id: windowId, title: options.title });
    windowState.activeWindow = windowId;
    bringToFront(win);

    return win;
  }

  function closeWindow(container, windowId) {
    var win = document.getElementById(windowId);
    if (win) {
      win.classList.add('window-closing');
      setTimeout(function() { win.remove(); }, 150);
    }

    windowState.windows = windowState.windows.filter(function(w) {
      return w.id !== windowId;
    });

    if (windowState.activeWindow === windowId) {
      windowState.activeWindow = windowState.windows.length > 0
        ? windowState.windows[windowState.windows.length - 1].id
        : null;
    }
  }

  function closeActiveWindow(container) {
    if (windowState.activeWindow) {
      closeWindow(container, windowState.activeWindow);
    }
  }

  function toggleZoom(win) {
    if (win.dataset.zoomed === 'true') {
      win.style.left = win.dataset.origLeft;
      win.style.top = win.dataset.origTop;
      win.style.width = win.dataset.origWidth;
      win.style.height = win.dataset.origHeight;
      win.dataset.zoomed = 'false';
    } else {
      win.dataset.origLeft = win.style.left;
      win.dataset.origTop = win.style.top;
      win.dataset.origWidth = win.style.width;
      win.dataset.origHeight = win.style.height;
      win.style.left = '0';
      win.style.top = '0';
      win.style.width = '100%';
      win.style.height = '100%';
      win.dataset.zoomed = 'true';
    }
  }

  function bringToFront(win) {
    win.style.zIndex = ++windowState.zIndexCounter;
    windowState.activeWindow = win.id;
  }

  function makeWindowDraggable(win) {
    var titleBar = win.querySelector('.title-bar');
    var isDragging = false;
    var offsetX, offsetY;

    titleBar.addEventListener('mousedown', function(e) {
      if (e.target.closest('button')) return;
      if (win.dataset.zoomed === 'true') return;

      isDragging = true;
      offsetX = e.clientX - win.offsetLeft;
      offsetY = e.clientY - win.offsetTop;
      win.classList.add('dragging');
      e.preventDefault();
    });

    document.addEventListener('mousemove', function(e) {
      if (!isDragging) return;
      var x = Math.max(0, Math.min(e.clientX - offsetX, window.innerWidth - 100));
      var y = Math.max(20, Math.min(e.clientY - offsetY, window.innerHeight - 100));
      win.style.left = x + 'px';
      win.style.top = y + 'px';
    });

    document.addEventListener('mouseup', function() {
      isDragging = false;
      win.classList.remove('dragging');
    });
  }

  // ============================================
  // Specific Windows
  // ============================================

  function openSimpleTextWindow(container, sectionId, title) {
    var section = container.sectionData.find(function(s) { return s.id === sectionId; });
    if (!section) return;

    var content = section.element.cloneNode(true);
    content.style.display = 'block';

    var wrapper = createElement('div');
    wrapper.className = 'simpletext-content';
    wrapper.appendChild(content);

    createWindow(container, {
      title: title,
      content: wrapper.outerHTML,
      width: 700,
      height: 500
    });
  }

  function openMacintoshHDWindow(container) {
    var content = '\
      <div class="finder-list">\
        <div class="finder-item">\
          <span class="item-icon">📁</span>\
          <span class="item-name">System Folder</span>\
          <span class="item-size">--</span>\
          <span class="item-kind">folder</span>\
        </div>\
        <div class="finder-item">\
          <span class="item-icon">📁</span>\
          <span class="item-name">Applications</span>\
          <span class="item-size">--</span>\
          <span class="item-kind">folder</span>\
        </div>\
        <div class="finder-item">\
          <span class="item-icon">📁</span>\
          <span class="item-name">Documents</span>\
          <span class="item-size">--</span>\
          <span class="item-kind">folder</span>\
        </div>\
        <div class="finder-item">\
          <span class="item-icon">📄</span>\
          <span class="item-name">Read Me</span>\
          <span class="item-size">2 KB</span>\
          <span class="item-kind">SimpleText document</span>\
        </div>\
      </div>\
    ';

    createWindow(container, {
      title: 'Macintosh HD',
      content: content,
      width: 450,
      height: 300
    });
  }

  function openTrashWindow(container) {
    var content = '<div style="padding: 20px; text-align: center; color: #808080;">The Trash is empty.</div>';

    createWindow(container, {
      title: 'Trash',
      content: content,
      width: 300,
      height: 200
    });
  }

  function openLinksWindow(container) {
    var navLinks = container.navLinks || [];
    var items = navLinks.map(function(link) {
      return '\
        <div class="finder-item" data-href="' + link.href + '">\
          <span class="item-icon">🔗</span>\
          <span class="item-name">' + link.text + '</span>\
          <span class="item-size">--</span>\
          <span class="item-kind">Internet location</span>\
        </div>\
      ';
    }).join('');

    var win = createWindow(container, {
      title: 'Links',
      content: '<div class="finder-list">' + items + '</div>',
      width: 400,
      height: 250
    });

    win.querySelectorAll('.finder-item[data-href]').forEach(function(item) {
      item.addEventListener('dblclick', function() {
        window.open(this.dataset.href, '_blank');
      });
    });
  }

  function openProfileWindow(container) {
    var headerContent = container.headerContent || {};
    var title = headerContent.title || 'Profile';
    var headshot = headerContent.headshot;

    var profileHTML = '<div class="profile-window-content">';
    if (headshot) {
      profileHTML += '<img src="' + headshot + '" class="profile-headshot" alt="' + title + '">';
    }
    profileHTML += '<h1 class="profile-name">' + title + '</h1>';
    profileHTML += '</div>';

    createWindow(container, {
      title: title,
      content: profileHTML,
      width: 1000,
      height: headshot ? 500 : 200
    });
  }

  function openAboutDialog(container) {
    var content = '\
      <div class="about-mac">\
        <div class="mac-logo">🍎</div>\
        <h2>About This Macintosh</h2>\
        <p><strong>System Software 7.5.3</strong></p>\
        <p>Built-in Memory: 32 MB</p>\
        <p>Virtual Memory: 64 MB used on Macintosh HD</p>\
        <div class="memory-bar">\
          <div class="memory-used" style="width: 45%;"></div>\
        </div>\
        <p style="margin-top: 15px; font-size: 9px;">© Apple Computer, Inc. 1983-1996</p>\
      </div>\
    ';

    createWindow(container, {
      title: 'About This Macintosh',
      content: content,
      width: 350,
      height: 280
    });
  }

  // ============================================
  // Shutdown - Uses system.css .standard-dialog
  // ============================================

  function triggerShutdown(container) {
    var desktop = container.querySelector('#macos-desktop');

    var shutdown = createElement('div');
    shutdown.id = 'macos-shutdown';
    shutdown.innerHTML = '\
      <div class="standard-dialog shutdown-dialog">\
        <div class="power-icon">⚡</div>\
        <p>It is now safe to turn off</p>\
        <p>your Macintosh.</p>\
      </div>\
    ';

    desktop.style.opacity = '0';
    desktop.style.transition = 'opacity 0.5s ease';

    setTimeout(function() {
      desktop.style.display = 'none';
      container.appendChild(shutdown);
    }, 500);
  }

  // ============================================
  // Register Plugin
  // ============================================

  window.web90.registerPlugin('macos-classic', initMacOSClassic);

})();
