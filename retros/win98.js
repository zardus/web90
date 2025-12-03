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
    var basePath = window.web90.config.basePath;
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
    win98Container.innerHTML = buildWin98HTML(sectionData, navLinks, headerContent, basePath);

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

  function buildWin98HTML(sectionData, navLinks, headerContent, basePath) {
    var desktopIcons = buildDesktopIconsHTML(sectionData, navLinks, headerContent);
    var programsSubmenu = buildProgramsSubmenu(sectionData, navLinks);
    var documentsSubmenu = buildDocumentsSubmenu(sectionData);
    var settingsSubmenu = buildSettingsSubmenu();
    var findSubmenu = buildFindSubmenu();

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
      <div id="win98-boot" style="display:none; background-color: #000; background-image: url(\'' + basePath + '/win98-boot.webp\'); background-position: center; background-size: cover; background-repeat: no-repeat;">\
        <div class="boot-wave-strip"></div>\
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
            <div class="menu-item has-submenu" data-action="programs">\
              <span class="menu-icon">📁</span>\
              <span class="menu-label">Programs</span>\
              <span class="menu-arrow">▶</span>\
              ' + programsSubmenu + '\
            </div>\
            <div class="menu-item has-submenu" data-action="documents">\
              <span class="menu-icon">📄</span>\
              <span class="menu-label">Documents</span>\
              <span class="menu-arrow">▶</span>\
              ' + documentsSubmenu + '\
            </div>\
            <div class="menu-item has-submenu" data-action="settings">\
              <span class="menu-icon">⚙️</span>\
              <span class="menu-label">Settings</span>\
              <span class="menu-arrow">▶</span>\
              ' + settingsSubmenu + '\
            </div>\
            <div class="menu-item has-submenu" data-action="find">\
              <span class="menu-icon">🔍</span>\
              <span class="menu-label">Find</span>\
              <span class="menu-arrow">▶</span>\
              ' + findSubmenu + '\
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

    // Profile icon (with headshot and name)
    if (headerContent.title) {
      html += '\
        <div class="desktop-icon" data-action="profile">\
          <div class="icon-image">' + (headerContent.headshot ? '<img src="' + headerContent.headshot + '" class="profile-icon-img">' : '👤') + '</div>\
          <div class="icon-label">' + headerContent.title + '</div>\
        </div>\
      ';
    }

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
  // Submenu Builders
  // ============================================

  function buildProgramsSubmenu(sectionData, navLinks) {
    var html = '<div class="submenu">';

    // Accessories submenu
    html += '\
      <div class="submenu-item has-submenu">\
        <span class="submenu-icon">📁</span>\
        <span class="submenu-label">Accessories</span>\
        <span class="menu-arrow">▶</span>\
        <div class="submenu submenu-nested">\
          <div class="submenu-item" data-open="notepad">\
            <span class="submenu-icon">📝</span>\
            <span class="submenu-label">Notepad</span>\
          </div>\
          <div class="submenu-item" data-open="calculator">\
            <span class="submenu-icon">🔢</span>\
            <span class="submenu-label">Calculator</span>\
          </div>\
          <div class="submenu-item" data-open="paint">\
            <span class="submenu-icon">🎨</span>\
            <span class="submenu-label">Paint</span>\
          </div>\
          <div class="submenu-item" data-open="wordpad">\
            <span class="submenu-icon">📄</span>\
            <span class="submenu-label">WordPad</span>\
          </div>\
        </div>\
      </div>\
    ';

    // Internet Explorer
    html += '\
      <div class="submenu-item" data-open="ie">\
        <span class="submenu-icon">🌐</span>\
        <span class="submenu-label">Internet Explorer</span>\
      </div>\
    ';

    // Windows Explorer
    html += '\
      <div class="submenu-item" data-open="explorer">\
        <span class="submenu-icon">📂</span>\
        <span class="submenu-label">Windows Explorer</span>\
      </div>\
    ';

    // MS-DOS Prompt
    html += '\
      <div class="submenu-item" data-open="dos">\
        <span class="submenu-icon">⬛</span>\
        <span class="submenu-label">MS-DOS Prompt</span>\
      </div>\
    ';

    html += '<div class="submenu-divider"></div>';

    // Site sections as "programs"
    sectionData.forEach(function(section) {
      html += '\
        <div class="submenu-item" data-section="' + section.id + '" data-title="' + section.title + '">\
          <span class="submenu-icon">📄</span>\
          <span class="submenu-label">' + section.title + '</span>\
        </div>\
      ';
    });

    // External links if available
    if (navLinks.length > 0) {
      html += '<div class="submenu-divider"></div>';
      navLinks.forEach(function(link) {
        html += '\
          <div class="submenu-item" data-href="' + link.href + '">\
            <span class="submenu-icon">🔗</span>\
            <span class="submenu-label">' + link.text + '</span>\
          </div>\
        ';
      });
    }

    html += '</div>';
    return html;
  }

  function buildDocumentsSubmenu(sectionData) {
    var html = '<div class="submenu">';

    if (sectionData.length === 0) {
      html += '\
        <div class="submenu-item disabled">\
          <span class="submenu-icon">📄</span>\
          <span class="submenu-label">(Empty)</span>\
        </div>\
      ';
    } else {
      sectionData.forEach(function(section) {
        html += '\
          <div class="submenu-item" data-section="' + section.id + '" data-title="' + section.title + '">\
            <span class="submenu-icon">📄</span>\
            <span class="submenu-label">' + section.title.toLowerCase() + '.txt</span>\
          </div>\
        ';
      });
    }

    html += '</div>';
    return html;
  }

  function buildSettingsSubmenu() {
    return '\
      <div class="submenu">\
        <div class="submenu-item" data-open="control-panel">\
          <span class="submenu-icon">⚙️</span>\
          <span class="submenu-label">Control Panel</span>\
        </div>\
        <div class="submenu-item" data-open="printers">\
          <span class="submenu-icon">🖨️</span>\
          <span class="submenu-label">Printers</span>\
        </div>\
        <div class="submenu-divider"></div>\
        <div class="submenu-item has-submenu">\
          <span class="submenu-icon">🖥️</span>\
          <span class="submenu-label">Taskbar</span>\
          <span class="menu-arrow">▶</span>\
          <div class="submenu submenu-nested">\
            <div class="submenu-item" data-action="taskbar-autohide">\
              <span class="submenu-icon">☐</span>\
              <span class="submenu-label">Auto hide</span>\
            </div>\
            <div class="submenu-item" data-action="taskbar-ontop">\
              <span class="submenu-icon">☑</span>\
              <span class="submenu-label">Always on top</span>\
            </div>\
          </div>\
        </div>\
        <div class="submenu-divider"></div>\
        <div class="submenu-item" data-open="display">\
          <span class="submenu-icon">🖥️</span>\
          <span class="submenu-label">Display Properties</span>\
        </div>\
      </div>\
    ';
  }

  function buildFindSubmenu() {
    return '\
      <div class="submenu">\
        <div class="submenu-item" data-open="find-files">\
          <span class="submenu-icon">📁</span>\
          <span class="submenu-label">Files or Folders...</span>\
        </div>\
        <div class="submenu-item" data-open="find-computer">\
          <span class="submenu-icon">💻</span>\
          <span class="submenu-label">Computer...</span>\
        </div>\
        <div class="submenu-item" data-open="find-internet">\
          <span class="submenu-icon">🌐</span>\
          <span class="submenu-label">On the Internet...</span>\
        </div>\
      </div>\
    ';
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
    // Wave animation runs via CSS, just wait then show desktop
    setTimeout(function() {
      boot.classList.add('fade-out');
      setTimeout(function() {
        boot.style.display = 'none';
        desktop.style.display = 'flex';
        desktop.classList.add('desktop-startup');
        initDesktop(container);
      }, 500);
    }, 3000); // Show boot screen for 3 seconds
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

    // Start menu items (top level only - not ones with submenus)
    container.querySelectorAll('.menu-item').forEach(function(item) {
      // Skip items with submenus - they show on hover
      if (item.classList.contains('has-submenu')) return;

      item.addEventListener('click', function(e) {
        e.stopPropagation();
        var action = this.dataset.action;

        if (action === 'shutdown') {
          openShutdownDialog(container);
        } else if (action === 'run') {
          openRunDialog(container);
        } else if (action === 'help') {
          openHelpWindow(container);
        }

        closeStartMenu(container);
      });
    });

    // Submenu item click handlers
    container.querySelectorAll('.submenu-item').forEach(function(item) {
      // Skip items that have nested submenus
      if (item.classList.contains('has-submenu')) return;

      item.addEventListener('click', function(e) {
        e.stopPropagation();

        var sectionId = this.dataset.section;
        var sectionTitle = this.dataset.title;
        var openType = this.dataset.open;
        var href = this.dataset.href;
        var action = this.dataset.action;

        if (sectionId) {
          // Open section in Notepad
          openNotepadWindow(container, sectionId, sectionTitle);
        } else if (href) {
          // Open external link
          window.open(href, '_blank');
        } else if (openType) {
          // Open specific application
          handleOpenApp(container, openType);
        } else if (action) {
          // Handle actions like taskbar settings
          handleMenuAction(container, action);
        }

        closeStartMenu(container);
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
    } else if (action === 'profile') {
      openProfileWindow(container);
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
      width: 800,
      height: 600
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
      title: title + ' - Profile',
      icon: '👤',
      content: profileHTML,
      width: 1000,
      height: headshot ? 500 : 400
    });
  }

  function openRunDialog(container) {
    // Using 98.css field-row and button styling
    var content = '\
      <div class="run-dialog-content">\
        <div class="run-icon">▶️</div>\
        <div class="run-text">\
          <p>Type the name of a program, folder, document, or Internet resource, and Windows will open it for you.</p>\
          <div class="field-row">\
            <label for="run-input">Open:</label>\
            <input type="text" id="run-input" class="run-input" placeholder="Type a URL...">\
          </div>\
        </div>\
      </div>\
      <div class="field-row run-buttons">\
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
  // Start Menu Helpers
  // ============================================

  function closeStartMenu(container) {
    var startMenu = container.querySelector('.start-menu');
    var startButton = container.querySelector('.start-button');
    startMenu.style.display = 'none';
    startButton.classList.remove('active');
  }

  function handleOpenApp(container, appType) {
    switch (appType) {
      case 'notepad':
        openEmptyNotepad(container);
        break;
      case 'calculator':
        openCalculator(container);
        break;
      case 'paint':
        openPaint(container);
        break;
      case 'wordpad':
        openWordPad(container);
        break;
      case 'ie':
        openInternetExplorer(container);
        break;
      case 'explorer':
        openMyComputerWindow(container);
        break;
      case 'dos':
        openDOSPrompt(container);
        break;
      case 'control-panel':
        openWeb90ControlPanel();
        break;
      case 'printers':
        openPrintersWindow(container);
        break;
      case 'display':
        openDisplayProperties(container);
        break;
      case 'find-files':
        openFindDialog(container);
        break;
      case 'find-computer':
        openFindComputer(container);
        break;
      case 'find-internet':
        window.open('https://www.google.com', '_blank');
        break;
    }
  }

  function handleMenuAction(container, action) {
    // Placeholder for taskbar settings etc
    if (action === 'taskbar-autohide') {
      var taskbar = container.querySelector('.win98-taskbar');
      taskbar.classList.toggle('autohide');
    }
  }

  // ============================================
  // Application Windows
  // ============================================

  function openEmptyNotepad(container) {
    var content = '\
      <textarea class="notepad-textarea" placeholder="Type here..."></textarea>\
    ';

    createWindow(container, {
      title: 'Untitled - Notepad',
      icon: '📝',
      content: content,
      menuItems: ['File', 'Edit', 'Search', 'Help'],
      statusBar: 'Ln 1, Col 1',
      width: 600,
      height: 400
    });
  }

  function openCalculator(container) {
    // Using 98.css button styling
    var content = '\
      <div class="calculator">\
        <input type="text" class="calc-display sunken-panel" value="0" readonly>\
        <div class="calc-buttons">\
          <button class="calc-btn calc-clear">C</button>\
          <button class="calc-btn calc-ce">CE</button>\
          <button class="calc-btn calc-back">←</button>\
          <button class="calc-btn calc-op">÷</button>\
          <button class="calc-btn calc-num">7</button>\
          <button class="calc-btn calc-num">8</button>\
          <button class="calc-btn calc-num">9</button>\
          <button class="calc-btn calc-op">×</button>\
          <button class="calc-btn calc-num">4</button>\
          <button class="calc-btn calc-num">5</button>\
          <button class="calc-btn calc-num">6</button>\
          <button class="calc-btn calc-op">−</button>\
          <button class="calc-btn calc-num">1</button>\
          <button class="calc-btn calc-num">2</button>\
          <button class="calc-btn calc-num">3</button>\
          <button class="calc-btn calc-op">+</button>\
          <button class="calc-btn calc-num calc-zero">0</button>\
          <button class="calc-btn calc-num">.</button>\
          <button class="calc-btn calc-equals">=</button>\
        </div>\
      </div>\
    ';

    var win = createWindow(container, {
      title: 'Calculator',
      icon: '🔢',
      content: content,
      width: 260,
      height: 360
    });

    // Calculator logic
    var display = win.querySelector('.calc-display');
    var currentValue = '0';
    var pendingOp = null;
    var pendingValue = null;
    var freshEntry = true;

    win.querySelectorAll('.calc-num').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var digit = this.textContent;
        if (freshEntry) {
          currentValue = digit === '.' ? '0.' : digit;
          freshEntry = false;
        } else {
          if (digit === '.' && currentValue.includes('.')) return;
          currentValue += digit;
        }
        display.value = currentValue;
      });
    });

    win.querySelectorAll('.calc-op').forEach(function(btn) {
      btn.addEventListener('click', function() {
        if (pendingOp && !freshEntry) {
          currentValue = String(calculate(pendingValue, parseFloat(currentValue), pendingOp));
          display.value = currentValue;
        }
        pendingValue = parseFloat(currentValue);
        pendingOp = this.textContent;
        freshEntry = true;
      });
    });

    win.querySelector('.calc-equals').addEventListener('click', function() {
      if (pendingOp) {
        currentValue = String(calculate(pendingValue, parseFloat(currentValue), pendingOp));
        display.value = currentValue;
        pendingOp = null;
        freshEntry = true;
      }
    });

    win.querySelector('.calc-clear').addEventListener('click', function() {
      currentValue = '0';
      pendingOp = null;
      pendingValue = null;
      freshEntry = true;
      display.value = '0';
    });

    win.querySelector('.calc-ce').addEventListener('click', function() {
      currentValue = '0';
      freshEntry = true;
      display.value = '0';
    });

    win.querySelector('.calc-back').addEventListener('click', function() {
      if (currentValue.length > 1) {
        currentValue = currentValue.slice(0, -1);
      } else {
        currentValue = '0';
      }
      display.value = currentValue;
    });

    function calculate(a, b, op) {
      switch (op) {
        case '+': return a + b;
        case '−': return a - b;
        case '×': return a * b;
        case '÷': return b !== 0 ? a / b : 'Error';
        default: return b;
      }
    }
  }

  function openPaint(container) {
    var content = '\
      <div class="paint-app">\
        <div class="paint-toolbar">\
          <button class="paint-tool active" data-tool="pencil" title="Pencil">✏️</button>\
          <button class="paint-tool" data-tool="brush" title="Brush">🖌️</button>\
          <button class="paint-tool" data-tool="eraser" title="Eraser">🧽</button>\
          <button class="paint-tool" data-tool="fill" title="Fill">🪣</button>\
        </div>\
        <div class="paint-colors">\
          <div class="paint-color active" data-color="#000000" style="background:#000000"></div>\
          <div class="paint-color" data-color="#ffffff" style="background:#ffffff"></div>\
          <div class="paint-color" data-color="#ff0000" style="background:#ff0000"></div>\
          <div class="paint-color" data-color="#00ff00" style="background:#00ff00"></div>\
          <div class="paint-color" data-color="#0000ff" style="background:#0000ff"></div>\
          <div class="paint-color" data-color="#ffff00" style="background:#ffff00"></div>\
          <div class="paint-color" data-color="#ff00ff" style="background:#ff00ff"></div>\
          <div class="paint-color" data-color="#00ffff" style="background:#00ffff"></div>\
        </div>\
        <canvas class="paint-canvas" width="500" height="300"></canvas>\
      </div>\
    ';

    var win = createWindow(container, {
      title: 'untitled - Paint',
      icon: '🎨',
      content: content,
      menuItems: ['File', 'Edit', 'View', 'Image', 'Colors', 'Help'],
      width: 600,
      height: 450
    });

    // Paint logic
    var canvas = win.querySelector('.paint-canvas');
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    var drawing = false;
    var currentColor = '#000000';
    var currentTool = 'pencil';
    var brushSize = 2;

    win.querySelectorAll('.paint-tool').forEach(function(btn) {
      btn.addEventListener('click', function() {
        win.querySelectorAll('.paint-tool').forEach(function(b) { b.classList.remove('active'); });
        this.classList.add('active');
        currentTool = this.dataset.tool;
        brushSize = currentTool === 'brush' ? 8 : currentTool === 'eraser' ? 15 : 2;
      });
    });

    win.querySelectorAll('.paint-color').forEach(function(btn) {
      btn.addEventListener('click', function() {
        win.querySelectorAll('.paint-color').forEach(function(b) { b.classList.remove('active'); });
        this.classList.add('active');
        currentColor = this.dataset.color;
      });
    });

    canvas.addEventListener('mousedown', function(e) {
      drawing = true;
      draw(e);
    });

    canvas.addEventListener('mousemove', function(e) {
      if (drawing) draw(e);
    });

    canvas.addEventListener('mouseup', function() { drawing = false; });
    canvas.addEventListener('mouseleave', function() { drawing = false; });

    function draw(e) {
      var rect = canvas.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;

      ctx.fillStyle = currentTool === 'eraser' ? '#ffffff' : currentColor;
      ctx.beginPath();
      ctx.arc(x, y, brushSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function openWordPad(container) {
    var content = '\
      <div class="wordpad-toolbar">\
        <button class="wp-btn" title="Bold"><b>B</b></button>\
        <button class="wp-btn" title="Italic"><i>I</i></button>\
        <button class="wp-btn" title="Underline"><u>U</u></button>\
        <span class="wp-sep">|</span>\
        <select class="wp-font">\
          <option>Arial</option>\
          <option>Times New Roman</option>\
          <option>Courier New</option>\
          <option selected>Comic Sans MS</option>\
        </select>\
        <select class="wp-size">\
          <option>8</option>\
          <option>10</option>\
          <option selected>12</option>\
          <option>14</option>\
          <option>18</option>\
          <option>24</option>\
        </select>\
      </div>\
      <div class="wordpad-content" contenteditable="true">\
        <p>Welcome to WordPad!</p>\
        <p>Start typing your document here...</p>\
      </div>\
    ';

    createWindow(container, {
      title: 'Document - WordPad',
      icon: '📄',
      content: content,
      menuItems: ['File', 'Edit', 'View', 'Insert', 'Format', 'Help'],
      width: 700,
      height: 500
    });
  }

  function openInternetExplorer(container) {
    var content = '\
      <div class="ie-toolbar">\
        <button class="ie-btn" title="Back">⬅️</button>\
        <button class="ie-btn" title="Forward">➡️</button>\
        <button class="ie-btn" title="Stop">⛔</button>\
        <button class="ie-btn" title="Refresh">🔄</button>\
        <button class="ie-btn" title="Home">🏠</button>\
        <input type="text" class="ie-address" value="about:blank">\
        <button class="ie-go">Go</button>\
      </div>\
      <div class="ie-content">\
        <div class="ie-welcome">\
          <h1>🌐 Internet Explorer</h1>\
          <p>Welcome to the Information Superhighway!</p>\
          <p style="font-size:12px;color:#666;">Enter a URL in the address bar above.</p>\
        </div>\
      </div>\
    ';

    var win = createWindow(container, {
      title: 'Microsoft Internet Explorer',
      icon: '🌐',
      content: content,
      menuItems: ['File', 'Edit', 'View', 'Go', 'Favorites', 'Help'],
      statusBar: 'Done',
      width: 800,
      height: 600
    });

    var addressBar = win.querySelector('.ie-address');
    var goBtn = win.querySelector('.ie-go');

    goBtn.addEventListener('click', function() {
      var url = addressBar.value;
      if (url && url !== 'about:blank') {
        if (!url.startsWith('http')) url = 'https://' + url;
        window.open(url, '_blank');
      }
    });

    addressBar.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') goBtn.click();
    });
  }

  function openDOSPrompt(container) {
    var content = '\
      <div class="dos-prompt">\
        <div class="dos-output">Microsoft(R) Windows 98\n   (C)Copyright Microsoft Corp 1981-1998.\n\nC:\\WINDOWS></div>\
        <div class="dos-input-line">\
          <span class="dos-prompt-text">C:\\WINDOWS></span>\
          <input type="text" class="dos-input">\
        </div>\
      </div>\
    ';

    var win = createWindow(container, {
      title: 'MS-DOS Prompt',
      icon: '⬛',
      content: content,
      width: 680,
      height: 400
    });

    win.classList.add('dos-window');

    var dosOutput = win.querySelector('.dos-output');
    var dosInput = win.querySelector('.dos-input');
    var currentDir = 'C:\\WINDOWS';

    dosInput.focus();

    dosInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        var cmd = dosInput.value.trim().toLowerCase();
        dosOutput.textContent += cmd + '\n';

        // Simple DOS command responses
        if (cmd === 'help') {
          dosOutput.textContent += 'DIR     - List directory contents\nCLS     - Clear screen\nVER     - Show version\nTIME    - Show time\nDATE    - Show date\nEXIT    - Close this window\n\n';
        } else if (cmd === 'dir') {
          dosOutput.textContent += ' Volume in drive C has no label\n Directory of ' + currentDir + '\n\n.              <DIR>\n..             <DIR>\nSYSTEM         <DIR>\nCOMMAND  COM     93,890\nWIN      COM     24,518\n\n' + currentDir + '>';
        } else if (cmd === 'cls') {
          dosOutput.textContent = currentDir + '>';
        } else if (cmd === 'ver') {
          dosOutput.textContent += '\nWindows 98 [Version 4.10.1998]\n\n' + currentDir + '>';
        } else if (cmd === 'time') {
          dosOutput.textContent += 'Current time is ' + new Date().toLocaleTimeString() + '\n\n' + currentDir + '>';
        } else if (cmd === 'date') {
          dosOutput.textContent += 'Current date is ' + new Date().toLocaleDateString() + '\n\n' + currentDir + '>';
        } else if (cmd === 'exit') {
          closeWindow(container, win.id);
          return;
        } else if (cmd) {
          dosOutput.textContent += 'Bad command or file name\n\n' + currentDir + '>';
        } else {
          dosOutput.textContent += currentDir + '>';
        }

        dosInput.value = '';
        dosOutput.scrollTop = dosOutput.scrollHeight;
      }
    });
  }

  function openWeb90ControlPanel() {
    // Use the web90 control panel instead of a custom window
    if (window.web90 && window.web90.showControlPanel) {
      window.web90.showControlPanel();
    }
  }

  function openPrintersWindow(container) {
    var content = '\
      <div class="explorer-content">\
        <div class="explorer-item">\
          <span class="explorer-icon">➕</span>\
          <span class="explorer-label">Add Printer</span>\
        </div>\
        <div class="explorer-item">\
          <span class="explorer-icon">🖨️</span>\
          <span class="explorer-label">HP LaserJet 4</span>\
        </div>\
      </div>\
    ';

    createWindow(container, {
      title: 'Printers',
      icon: '🖨️',
      content: content,
      menuItems: ['File', 'Edit', 'View', 'Help'],
      statusBar: '2 object(s)',
      width: 400,
      height: 300
    });
  }

  function openDisplayProperties(container) {
    // Using 98.css tabs and field-row
    var content = '\
      <div class="display-props">\
        <menu role="tablist">\
          <li role="tab" aria-selected="true">Background</li>\
          <li role="tab">Screen Saver</li>\
          <li role="tab">Appearance</li>\
          <li role="tab">Settings</li>\
        </menu>\
        <div class="window" role="tabpanel">\
          <div class="window-body">\
            <div class="display-preview">\
              <div class="preview-monitor sunken-panel">\
                <div class="preview-screen" style="background: #008080;"></div>\
              </div>\
            </div>\
            <div class="field-row">\
              <label for="wallpaper-select">Wallpaper:</label>\
              <select id="wallpaper-select" class="wallpaper-select">\
                <option>(None)</option>\
                <option selected>Teal</option>\
                <option>Clouds</option>\
                <option>Bubbles</option>\
                <option>Carved Stone</option>\
              </select>\
            </div>\
          </div>\
        </div>\
        <div class="field-row display-buttons">\
          <button class="dp-ok">OK</button>\
          <button class="dp-cancel">Cancel</button>\
          <button class="dp-apply">Apply</button>\
        </div>\
      </div>\
    ';

    var win = createWindow(container, {
      title: 'Display Properties',
      icon: '🖥️',
      content: content,
      width: 420,
      height: 450
    });

    win.classList.add('dialog-window');

    var cancelBtn = win.querySelector('.dp-cancel');
    cancelBtn.addEventListener('click', function() {
      closeWindow(container, win.id);
    });
  }

  function openFindDialog(container) {
    // Using 98.css tabs, field-row, sunken-panel
    var content = '\
      <div class="find-dialog">\
        <menu role="tablist">\
          <li role="tab" aria-selected="true">Name & Location</li>\
          <li role="tab">Date Modified</li>\
          <li role="tab">Advanced</li>\
        </menu>\
        <div class="window" role="tabpanel">\
          <div class="window-body">\
            <div class="field-row-stacked">\
              <label for="find-named">Named:</label>\
              <input type="text" id="find-named" class="find-input" placeholder="Enter filename">\
            </div>\
            <div class="field-row-stacked">\
              <label for="find-lookin">Look in:</label>\
              <select id="find-lookin" class="find-location">\
                <option>C:\\</option>\
                <option>My Documents</option>\
                <option>Desktop</option>\
              </select>\
            </div>\
            <div class="field-row">\
              <input type="checkbox" id="find-subfolders" checked>\
              <label for="find-subfolders">Include subfolders</label>\
            </div>\
          </div>\
        </div>\
        <div class="field-row find-buttons">\
          <button class="find-now">Find Now</button>\
          <button class="find-stop">Stop</button>\
          <button class="find-new">New Search</button>\
        </div>\
        <div class="sunken-panel find-results">\
          <div class="find-results-header">\
            <span>Name</span>\
            <span>In Folder</span>\
            <span>Size</span>\
          </div>\
          <div class="find-results-list"></div>\
        </div>\
      </div>\
    ';

    var win = createWindow(container, {
      title: 'Find: All Files',
      icon: '🔍',
      content: content,
      width: 500,
      height: 400
    });

    // Make Find Now show some fun results
    var findBtn = win.querySelector('.find-now');
    var resultsList = win.querySelector('.find-results-list');

    findBtn.addEventListener('click', function() {
      var query = win.querySelector('.find-input').value.toLowerCase();
      resultsList.innerHTML = '';

      // Search through site sections
      var sectionData = container.sectionData || [];
      sectionData.forEach(function(section) {
        if (!query || section.title.toLowerCase().includes(query) || section.id.toLowerCase().includes(query)) {
          var div = document.createElement('div');
          div.className = 'find-result-row';
          div.innerHTML = '<span>' + section.title.toLowerCase() + '.txt</span><span>C:\\Documents</span><span>2 KB</span>';
          div.addEventListener('dblclick', function() {
            openNotepadWindow(container, section.id, section.title);
          });
          resultsList.appendChild(div);
        }
      });

      if (resultsList.children.length === 0) {
        resultsList.innerHTML = '<div class="find-no-results">No files found.</div>';
      }
    });
  }

  function openFindComputer(container) {
    var content = '\
      <div class="find-computer-dialog">\
        <div class="find-row">\
          <label>Computer name:</label>\
          <input type="text" class="find-computer-input">\
        </div>\
        <div class="find-buttons">\
          <button class="find-now">Find Now</button>\
          <button class="find-stop">Stop</button>\
          <button class="find-new">New Search</button>\
        </div>\
        <div class="find-results">\
          <div class="find-results-list">\
            <div class="find-result-row">\
              <span>💻 MY-COMPUTER</span>\
              <span>Windows 98</span>\
            </div>\
          </div>\
        </div>\
      </div>\
    ';

    createWindow(container, {
      title: 'Find: Computer',
      icon: '💻',
      content: content,
      width: 400,
      height: 300
    });
  }

  function openHelpWindow(container) {
    var content = '\
      <div class="help-window">\
        <div class="help-sidebar">\
          <div class="help-item">📖 Getting Started</div>\
          <div class="help-item">🖱️ Using Your Mouse</div>\
          <div class="help-item">📁 Managing Files</div>\
          <div class="help-item">🌐 Exploring the Internet</div>\
          <div class="help-item">❓ Troubleshooting</div>\
        </div>\
        <div class="help-content">\
          <h2>Welcome to Windows 98 Help</h2>\
          <p>Windows 98 builds on the groundbreaking features of Windows 95, bringing you:</p>\
          <ul>\
            <li>Better Internet integration</li>\
            <li>Improved hardware support</li>\
            <li>Enhanced multimedia capabilities</li>\
            <li>The all-new Active Desktop</li>\
          </ul>\
          <p><b>Tip:</b> Click a topic on the left to learn more!</p>\
          <hr>\
          <p style="font-size:11px;color:#666;">This website was enhanced with web90.js - bringing back the glory days of the Information Superhighway!</p>\
        </div>\
      </div>\
    ';

    createWindow(container, {
      title: 'Windows Help',
      icon: '❓',
      content: content,
      menuItems: ['File', 'Edit', 'Bookmark', 'Options', 'Help'],
      width: 600,
      height: 450
    });
  }

  // ============================================
  // Shutdown Dialog
  // ============================================

  function openShutdownDialog(container) {
    // Using 98.css field-row for radio buttons
    var content = '\
      <div class="shutdown-dialog">\
        <div class="shutdown-icon">🖥️</div>\
        <div class="shutdown-options">\
          <p>What do you want the computer to do?</p>\
          <div class="field-row">\
            <input type="radio" id="sd-shutdown" name="shutdown" value="shutdown" checked>\
            <label for="sd-shutdown">Shut down</label>\
          </div>\
          <div class="field-row">\
            <input type="radio" id="sd-restart" name="shutdown" value="restart">\
            <label for="sd-restart">Restart</label>\
          </div>\
          <div class="field-row">\
            <input type="radio" id="sd-restart-dos" name="shutdown" value="restart-dos">\
            <label for="sd-restart-dos">Restart in MS-DOS mode</label>\
          </div>\
        </div>\
      </div>\
      <div class="field-row shutdown-buttons">\
        <button class="sd-ok">OK</button>\
        <button class="sd-cancel">Cancel</button>\
        <button class="sd-help">Help</button>\
      </div>\
    ';

    var win = createWindow(container, {
      title: 'Shut Down Windows',
      icon: '🔌',
      content: content,
      width: 350,
      height: 220
    });

    win.classList.add('dialog-window');

    var okBtn = win.querySelector('.sd-ok');
    var cancelBtn = win.querySelector('.sd-cancel');

    cancelBtn.addEventListener('click', function() {
      closeWindow(container, win.id);
    });

    okBtn.addEventListener('click', function() {
      var selected = win.querySelector('input[name="shutdown"]:checked').value;
      closeWindow(container, win.id);

      if (selected === 'shutdown') {
        triggerShutdown(container);
      } else if (selected === 'restart') {
        triggerRestart(container);
      } else if (selected === 'restart-dos') {
        triggerRestartDOS(container);
      }
    });
  }

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

  function triggerRestart(container) {
    var desktop = container.querySelector('#win98-desktop');
    desktop.classList.add('shutting-down');

    setTimeout(function() {
      // Hide desktop, show boot again
      desktop.style.display = 'none';
      desktop.classList.remove('shutting-down');

      // Close all windows
      container.querySelectorAll('.win98-window').forEach(function(w) { w.remove(); });
      container.querySelector('.taskbar-buttons').innerHTML = '';
      windowState.windows = [];

      // Show BIOS again
      var bios = container.querySelector('#win98-bios');
      bios.style.display = 'flex';
      bios.classList.remove('fade-out');
      document.getElementById('bios-memory').textContent = '0';

      startBootSequence(container);
    }, 1000);
  }

  function triggerRestartDOS(container) {
    var desktop = container.querySelector('#win98-desktop');
    desktop.classList.add('shutting-down');

    setTimeout(function() {
      desktop.style.display = 'none';

      var dosScreen = createElement('div');
      dosScreen.id = 'win98-dos-mode';
      dosScreen.innerHTML = '\
        <div class="dos-fullscreen">\
          <div>Microsoft(R) Windows 98</div>\
          <div>   (C)Copyright Microsoft Corp 1981-1998.</div>\
          <div></div>\
          <div>C:\\></div>\
        </div>\
      ';
      container.appendChild(dosScreen);
    }, 1000);
  }

  // ============================================
  // Register Plugin
  // ============================================

  window.web90.registerPlugin('win98', initWin98);

})();
