/**
 * Windows 98 Theme Module
 * Lazy-loaded plugin for the Windows 98 desktop theme
 *
 * This module transforms the page into a full Windows 98 experience
 * complete with boot sequence, desktop, and Notepad windows.
 */

(function() {
  'use strict';

  var createElement = window.web90.createElement;

  // Window management state
  var windowState = {
    windows: [],
    zIndexCounter: 100,
    activeWindow: null,
    dragState: null
  };

  // ============================================
  // Main Initialization
  // ============================================

  function initWin98() {
    var header = document.querySelector('header');
    var nav = document.querySelector('nav');
    var sections = document.querySelectorAll('section[id]');
    var main = document.getElementById('main');

    if (!header || !sections.length) return;

    document.body.classList.add('win98-mode');

    // Extract content from existing page
    var headerContent = {
      title: header.querySelector('h1') ? header.querySelector('h1').textContent : 'My Computer',
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

    // Create main container (win98 class enables 98.css scoped styles)
    var win98Container = createElement('div');
    win98Container.id = 'win98-container';
    win98Container.className = 'win98';
    win98Container.innerHTML = buildWin98HTML(sectionData, navLinks, headerContent);

    if (main) main.style.display = 'none';
    document.body.appendChild(win98Container);

    // Move control panel if it exists
    var controlPanel = document.getElementById('control-panel');
    if (controlPanel) win98Container.appendChild(controlPanel);

    // Store section data for window creation
    win98Container.sectionData = sectionData;
    win98Container.headerContent = headerContent;
    win98Container.navLinks = navLinks;

    // Start boot sequence
    startBootSequence(win98Container);
  }

  // ============================================
  // HTML Structure
  // ============================================

  function buildWin98HTML(sectionData, navLinks, headerContent) {
    var desktopIcons = buildDesktopIconsHTML(sectionData, navLinks, headerContent);

    return '\
      <div id="win98-bios">\
        <div class="bios-content">\
          <div class="bios-header">Award Modular BIOS v4.51PG, An Energy Star Ally</div>\
          <div class="bios-copyright">Copyright (C) 1984-98, Award Software, Inc.</div>\
          <div class="bios-line"></div>\
          <div class="bios-cpu">Intel Pentium II MMX CPU at 233MHz</div>\
          <div class="bios-memory-test">Memory Test: <span id="bios-memory">0</span>K OK</div>\
          <div class="bios-line"></div>\
          <div class="bios-detecting">Detecting IDE drives...</div>\
          <div class="bios-drive">Primary Master: QUANTUM FIREBALL ST3.2A</div>\
          <div class="bios-drive">Primary Slave: ATAPI CD-ROM</div>\
          <div class="bios-line"></div>\
          <div class="bios-press">Press DEL to enter SETUP</div>\
        </div>\
      </div>\
      <div id="win98-boot" style="display:none;">\
        <div class="boot-content">\
          <div class="boot-logo">\
            <div class="boot-clouds"></div>\
            <div class="boot-text">Microsoft<sup>®</sup></div>\
            <div class="boot-windows">Windows 98</div>\
            <div class="boot-progress-container">\
              <div class="boot-progress-bar"></div>\
            </div>\
          </div>\
        </div>\
      </div>\
      <div id="win98-desktop" style="display:none;">\
        <div class="desktop-area">\
          <div class="desktop-icons">\
            ' + desktopIcons + '\
          </div>\
        </div>\
        <div class="win98-taskbar">\
          <button class="start-button">\
            <span class="start-logo"></span>\
            <span>Start</span>\
          </button>\
          <div class="taskbar-divider"></div>\
          <div class="taskbar-buttons"></div>\
          <div class="system-tray">\
            <div class="tray-icons">\
              <span class="tray-icon" title="Volume">🔊</span>\
            </div>\
            <div class="tray-clock"></div>\
          </div>\
        </div>\
        <div class="start-menu" style="display:none;">\
          <div class="start-menu-banner">\
            <span class="banner-text">Windows<span class="banner-98">98</span></span>\
          </div>\
          <div class="start-menu-items">\
            <div class="menu-item" data-action="programs">\
              <span class="menu-icon">📁</span>\
              <span class="menu-label">Programs</span>\
              <span class="menu-arrow">▶</span>\
            </div>\
            <div class="menu-item" data-action="documents">\
              <span class="menu-icon">📄</span>\
              <span class="menu-label">Documents</span>\
              <span class="menu-arrow">▶</span>\
            </div>\
            <div class="menu-item" data-action="settings">\
              <span class="menu-icon">⚙️</span>\
              <span class="menu-label">Settings</span>\
              <span class="menu-arrow">▶</span>\
            </div>\
            <div class="menu-item" data-action="find">\
              <span class="menu-icon">🔍</span>\
              <span class="menu-label">Find</span>\
              <span class="menu-arrow">▶</span>\
            </div>\
            <div class="menu-item" data-action="help">\
              <span class="menu-icon">❓</span>\
              <span class="menu-label">Help</span>\
            </div>\
            <div class="menu-item" data-action="run">\
              <span class="menu-icon">▶️</span>\
              <span class="menu-label">Run...</span>\
            </div>\
            <div class="menu-divider"></div>\
            <div class="menu-item" data-action="shutdown">\
              <span class="menu-icon">🔌</span>\
              <span class="menu-label">Shut Down...</span>\
            </div>\
          </div>\
        </div>\
      </div>\
    ';
  }

  function buildDesktopIconsHTML(sectionData, navLinks, headerContent) {
    var html = '';

    // My Computer icon
    html += '\
      <div class="desktop-icon" data-action="my-computer">\
        <div class="icon-image">💻</div>\
        <div class="icon-label">My Computer</div>\
      </div>\
    ';

    // Content sections as .txt files
    sectionData.forEach(function(section) {
      var ext = 'txt';
      var icon = '📄';

      // Make some sections look like different file types
      if (section.id === 'research' || section.id === 'publications') {
        ext = 'doc';
        icon = '📝';
      } else if (section.id === 'contact') {
        ext = 'rtf';
        icon = '📋';
      }

      html += '\
        <div class="desktop-icon" data-section="' + section.id + '" data-title="' + section.title + '">\
          <div class="icon-image">' + icon + '</div>\
          <div class="icon-label">' + section.title.toLowerCase() + '.' + ext + '</div>\
        </div>\
      ';
    });

    // External links folder
    if (navLinks.length > 0) {
      html += '\
        <div class="desktop-icon" data-action="links-folder">\
          <div class="icon-image">📁</div>\
          <div class="icon-label">Links</div>\
        </div>\
      ';
    }

    // Recycle Bin
    html += '\
      <div class="desktop-icon recycle-bin" data-action="recycle-bin">\
        <div class="icon-image">🗑️</div>\
        <div class="icon-label">Recycle Bin</div>\
      </div>\
    ';

    return html;
  }

  // ============================================
  // Boot Sequence
  // ============================================

  function startBootSequence(container) {
    var bios = container.querySelector('#win98-bios');
    var boot = container.querySelector('#win98-boot');
    var desktop = container.querySelector('#win98-desktop');
    var memoryEl = document.getElementById('bios-memory');

    // BIOS memory test animation
    var memory = 0;
    var targetMemory = 65536; // 64MB

    function updateMemory() {
      memory += Math.floor(Math.random() * 8192) + 4096;
      if (memory > targetMemory) memory = targetMemory;
      memoryEl.textContent = memory;

      if (memory < targetMemory) {
        setTimeout(updateMemory, 50);
      } else {
        // After memory test, wait then show Windows boot
        setTimeout(function() {
          bios.classList.add('fade-out');
          setTimeout(function() {
            bios.style.display = 'none';
            boot.style.display = 'flex';
            startWindowsBoot(container, boot, desktop);
          }, 500);
        }, 800);
      }
    }

    setTimeout(updateMemory, 300);
  }

  function startWindowsBoot(container, boot, desktop) {
    var progressBar = boot.querySelector('.boot-progress-bar');
    var progress = 0;
    var bootSounds = [
      'Loading system files...',
      'Initializing devices...',
      'Loading Windows 98...'
    ];
    var soundIndex = 0;

    function updateProgress() {
      progress += Math.random() * 8 + 2;
      if (progress > 100) progress = 100;
      progressBar.style.width = progress + '%';

      if (progress < 100) {
        setTimeout(updateProgress, 150 + Math.random() * 100);
      } else {
        // Boot complete, show desktop
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
    // Update clock
    updateClock(container);
    setInterval(function() { updateClock(container); }, 1000);

    // Desktop icon click handlers
    var icons = container.querySelectorAll('.desktop-icon');
    icons.forEach(function(icon) {
      icon.addEventListener('dblclick', function() {
        handleIconDoubleClick(container, this);
      });

      icon.addEventListener('click', function(e) {
        // Deselect all icons
        icons.forEach(function(i) { i.classList.remove('selected'); });
        // Select this one
        this.classList.add('selected');
        e.stopPropagation();
      });
    });

    // Click desktop to deselect icons
    container.querySelector('.desktop-area').addEventListener('click', function() {
      icons.forEach(function(i) { i.classList.remove('selected'); });
    });

    // Start button
    var startButton = container.querySelector('.start-button');
    var startMenu = container.querySelector('.start-menu');

    startButton.addEventListener('click', function(e) {
      e.stopPropagation();
      startMenu.style.display = startMenu.style.display === 'none' ? 'block' : 'none';
      startButton.classList.toggle('active', startMenu.style.display === 'block');
    });

    // Close start menu when clicking elsewhere
    document.addEventListener('click', function() {
      startMenu.style.display = 'none';
      startButton.classList.remove('active');
    });

    // Start menu items
    container.querySelectorAll('.menu-item').forEach(function(item) {
      item.addEventListener('click', function(e) {
        e.stopPropagation();
        var action = this.dataset.action;

        if (action === 'shutdown') {
          triggerShutdown(container);
        } else if (action === 'run') {
          openRunDialog(container);
        }

        startMenu.style.display = 'none';
        startButton.classList.remove('active');
      });
    });

    // Play startup sound effect (visual)
    playStartupAnimation(container);
  }

  function updateClock(container) {
    var clock = container.querySelector('.tray-clock');
    var now = new Date();
    var hours = now.getHours();
    var minutes = now.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    clock.textContent = hours + ':' + minutes + ' ' + ampm;
  }

  function playStartupAnimation(container) {
    // Add startup sound visual indicator
    var desktop = container.querySelector('#win98-desktop');
    desktop.classList.add('startup-chime');
    setTimeout(function() {
      desktop.classList.remove('startup-chime');
    }, 2000);
  }

  // ============================================
  // Icon Handlers
  // ============================================

  function handleIconDoubleClick(container, icon) {
    var sectionId = icon.dataset.section;
    var action = icon.dataset.action;

    if (sectionId) {
      // Open section in Notepad
      openNotepadWindow(container, sectionId, icon.dataset.title);
    } else if (action === 'my-computer') {
      openMyComputerWindow(container);
    } else if (action === 'recycle-bin') {
      openRecycleBinWindow(container);
    } else if (action === 'links-folder') {
      openLinksWindow(container);
    }
  }

  // ============================================
  // Window Management
  // ============================================

  function createWindow(container, options) {
    var windowId = 'win98-window-' + Date.now();
    var win = createElement('div');
    win.className = 'win98-window window';
    win.id = windowId;
    win.style.zIndex = ++windowState.zIndexCounter;
    win.style.left = (100 + windowState.windows.length * 30) + 'px';
    win.style.top = (50 + windowState.windows.length * 30) + 'px';

    if (options.width) win.style.width = options.width + 'px';
    if (options.height) win.style.height = options.height + 'px';

    var menuBarHTML = '';
    if (options.menuItems) {
      menuBarHTML = '<div class="window-menu-bar">';
      options.menuItems.forEach(function(item) {
        menuBarHTML += '<span class="menu-bar-item">' + item + '</span>';
      });
      menuBarHTML += '</div>';
    }

    win.innerHTML = '\
      <div class="title-bar">\
        <div class="title-bar-text">\
          ' + (options.icon || '') + ' ' + options.title + '\
        </div>\
        <div class="title-bar-controls">\
          <button aria-label="Minimize" class="win-minimize"></button>\
          <button aria-label="Maximize" class="win-maximize"></button>\
          <button aria-label="Close" class="win-close"></button>\
        </div>\
      </div>\
      ' + menuBarHTML + '\
      <div class="window-body">\
        ' + options.content + '\
      </div>\
      ' + (options.statusBar ? '<div class="status-bar"><p class="status-bar-field">' + options.statusBar + '</p></div>' : '') + '\
    ';

    container.querySelector('.desktop-area').appendChild(win);

    // Window controls
    win.querySelector('.win-close').addEventListener('click', function() {
      closeWindow(container, windowId);
    });

    win.querySelector('.win-minimize').addEventListener('click', function() {
      minimizeWindow(container, windowId);
    });

    win.querySelector('.win-maximize').addEventListener('click', function() {
      maximizeWindow(win);
    });

    // Make window draggable
    makeWindowDraggable(win);

    // Focus on click
    win.addEventListener('mousedown', function() {
      bringToFront(win);
    });

    // Add to taskbar
    addTaskbarButton(container, windowId, options.title, options.icon);

    windowState.windows.push({ id: windowId, title: options.title, minimized: false });
    bringToFront(win);

    return win;
  }

  function closeWindow(container, windowId) {
    var win = document.getElementById(windowId);
    if (win) {
      win.classList.add('window-closing');
      setTimeout(function() {
        win.remove();
      }, 200);
    }

    // Remove from taskbar
    var taskbarBtn = container.querySelector('.taskbar-btn[data-window="' + windowId + '"]');
    if (taskbarBtn) taskbarBtn.remove();

    // Remove from state
    windowState.windows = windowState.windows.filter(function(w) {
      return w.id !== windowId;
    });
  }

  function minimizeWindow(container, windowId) {
    var win = document.getElementById(windowId);
    if (win) {
      win.classList.add('window-minimized');
      win.style.display = 'none';
    }

    var windowData = windowState.windows.find(function(w) { return w.id === windowId; });
    if (windowData) windowData.minimized = true;
  }

  function restoreWindow(container, windowId) {
    var win = document.getElementById(windowId);
    if (win) {
      win.classList.remove('window-minimized');
      win.style.display = 'flex';
      bringToFront(win);
    }

    var windowData = windowState.windows.find(function(w) { return w.id === windowId; });
    if (windowData) windowData.minimized = false;
  }

  function maximizeWindow(win) {
    win.classList.toggle('window-maximized');
  }

  function bringToFront(win) {
    win.style.zIndex = ++windowState.zIndexCounter;

    // Update taskbar button states
    document.querySelectorAll('.taskbar-btn').forEach(function(btn) {
      btn.classList.remove('active');
    });

    var taskbarBtn = document.querySelector('.taskbar-btn[data-window="' + win.id + '"]');
    if (taskbarBtn) taskbarBtn.classList.add('active');
  }

  function makeWindowDraggable(win) {
    var titleBar = win.querySelector('.title-bar');
    var isDragging = false;
    var offsetX, offsetY;

    titleBar.addEventListener('mousedown', function(e) {
      if (e.target.closest('.title-bar-controls')) return;
      if (win.classList.contains('window-maximized')) return;

      isDragging = true;
      offsetX = e.clientX - win.offsetLeft;
      offsetY = e.clientY - win.offsetTop;
      win.classList.add('dragging');

      e.preventDefault();
    });

    document.addEventListener('mousemove', function(e) {
      if (!isDragging) return;

      var x = e.clientX - offsetX;
      var y = e.clientY - offsetY;

      // Keep window on screen
      x = Math.max(0, Math.min(x, window.innerWidth - 100));
      y = Math.max(0, Math.min(y, window.innerHeight - 100));

      win.style.left = x + 'px';
      win.style.top = y + 'px';
    });

    document.addEventListener('mouseup', function() {
      isDragging = false;
      win.classList.remove('dragging');
    });
  }

  function addTaskbarButton(container, windowId, title, icon) {
    var taskbarButtons = container.querySelector('.taskbar-buttons');
    var btn = createElement('button');
    btn.className = 'taskbar-btn active';
    btn.dataset.window = windowId;
    btn.innerHTML = (icon || '') + ' ' + title;

    btn.addEventListener('click', function() {
      var win = document.getElementById(windowId);
      var windowData = windowState.windows.find(function(w) { return w.id === windowId; });

      if (windowData && windowData.minimized) {
        restoreWindow(container, windowId);
      } else if (win && win.style.zIndex == windowState.zIndexCounter) {
        minimizeWindow(container, windowId);
      } else {
        bringToFront(win);
      }
    });

    taskbarButtons.appendChild(btn);
  }

  // ============================================
  // Specific Windows
  // ============================================

  function openNotepadWindow(container, sectionId, title) {
    var section = container.sectionData.find(function(s) { return s.id === sectionId; });
    if (!section) return;

    // Clone the section content
    var content = section.element.cloneNode(true);
    content.style.display = 'block';

    var wrapper = createElement('div');
    wrapper.className = 'notepad-content';
    wrapper.appendChild(content);

    createWindow(container, {
      title: title.toLowerCase() + '.txt - Notepad',
      icon: '📄',
      content: wrapper.outerHTML,
      menuItems: ['File', 'Edit', 'Search', 'Help'],
      statusBar: 'Ln 1, Col 1',
      width: 600,
      height: 450
    });
  }

  function openMyComputerWindow(container) {
    var content = '\
      <div class="explorer-content">\
        <div class="explorer-item">\
          <span class="explorer-icon">💾</span>\
          <span class="explorer-label">3½ Floppy (A:)</span>\
        </div>\
        <div class="explorer-item">\
          <span class="explorer-icon">💿</span>\
          <span class="explorer-label">(C:)</span>\
        </div>\
        <div class="explorer-item">\
          <span class="explorer-icon">📀</span>\
          <span class="explorer-label">(D:) CD-ROM</span>\
        </div>\
        <div class="explorer-item">\
          <span class="explorer-icon">🖨️</span>\
          <span class="explorer-label">Printers</span>\
        </div>\
        <div class="explorer-item">\
          <span class="explorer-icon">⚙️</span>\
          <span class="explorer-label">Control Panel</span>\
        </div>\
        <div class="explorer-item">\
          <span class="explorer-icon">📞</span>\
          <span class="explorer-label">Dial-Up Networking</span>\
        </div>\
      </div>\
    ';

    createWindow(container, {
      title: 'My Computer',
      icon: '💻',
      content: content,
      menuItems: ['File', 'Edit', 'View', 'Go', 'Favorites', 'Help'],
      statusBar: '6 object(s)',
      width: 500,
      height: 400
    });
  }

  function openRecycleBinWindow(container) {
    var content = '\
      <div class="explorer-content empty-folder">\
        <p>The Recycle Bin is empty.</p>\
      </div>\
    ';

    createWindow(container, {
      title: 'Recycle Bin',
      icon: '🗑️',
      content: content,
      menuItems: ['File', 'Edit', 'View', 'Help'],
      statusBar: '0 object(s)',
      width: 400,
      height: 300
    });
  }

  function openLinksWindow(container) {
    var navLinks = container.navLinks || [];
    var items = '';

    navLinks.forEach(function(link) {
      items += '\
        <div class="explorer-item" data-href="' + link.href + '">\
          <span class="explorer-icon">🔗</span>\
          <span class="explorer-label">' + link.text + '</span>\
        </div>\
      ';
    });

    var content = '<div class="explorer-content">' + items + '</div>';

    var win = createWindow(container, {
      title: 'Links',
      icon: '📁',
      content: content,
      menuItems: ['File', 'Edit', 'View', 'Help'],
      statusBar: navLinks.length + ' object(s)',
      width: 400,
      height: 350
    });

    // Make links clickable
    win.querySelectorAll('.explorer-item[data-href]').forEach(function(item) {
      item.addEventListener('dblclick', function() {
        window.open(this.dataset.href, '_blank');
      });
    });
  }

  function openRunDialog(container) {
    var content = '\
      <div class="run-dialog-content">\
        <div class="run-icon">▶️</div>\
        <div class="run-text">\
          <p>Type the name of a program, folder, document, or Internet resource, and Windows will open it for you.</p>\
          <label>Open:</label>\
          <input type="text" class="run-input" placeholder="Type a URL...">\
        </div>\
      </div>\
      <div class="run-buttons">\
        <button class="run-ok">OK</button>\
        <button class="run-cancel">Cancel</button>\
        <button class="run-browse">Browse...</button>\
      </div>\
    ';

    var win = createWindow(container, {
      title: 'Run',
      icon: '▶️',
      content: content,
      width: 400,
      height: 180
    });

    win.classList.add('dialog-window');

    var input = win.querySelector('.run-input');
    var okBtn = win.querySelector('.run-ok');
    var cancelBtn = win.querySelector('.run-cancel');

    okBtn.addEventListener('click', function() {
      var url = input.value;
      if (url) {
        if (!url.startsWith('http')) url = 'https://' + url;
        window.open(url, '_blank');
      }
      closeWindow(container, win.id);
    });

    cancelBtn.addEventListener('click', function() {
      closeWindow(container, win.id);
    });

    input.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') okBtn.click();
    });

    input.focus();
  }

  // ============================================
  // Shutdown
  // ============================================

  function triggerShutdown(container) {
    var desktop = container.querySelector('#win98-desktop');

    // Create shutdown screen
    var shutdown = createElement('div');
    shutdown.id = 'win98-shutdown';
    shutdown.innerHTML = '\
      <div class="shutdown-content">\
        <div class="shutdown-text">It\'s now safe to turn off</div>\
        <div class="shutdown-subtext">your computer.</div>\
      </div>\
    ';

    desktop.classList.add('shutting-down');

    setTimeout(function() {
      container.appendChild(shutdown);
      desktop.style.display = 'none';
    }, 1000);
  }

  // ============================================
  // Register Plugin
  // ============================================

  window.web90.registerPlugin('win98', initWin98);

})();
