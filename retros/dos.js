/**
 * DOS Theme Module
 * Lazy-loaded plugin for the DOS command line theme
 *
 * This module transforms the page into a full MS-DOS experience
 * complete with BIOS POST, boot sequence, and command prompt.
 */

(function() {
  'use strict';

  var createElement = window.web90.createElement;

  // State
  var state = {
    sections: [],
    navLinks: [],
    headshot: null,
    commandHistory: [],
    historyIndex: -1,
    currentView: 'prompt' // 'prompt', 'viewer', 'filemanager'
  };

  // ============================================
  // Main Initialization
  // ============================================

  function initDOS() {
    var header = document.querySelector('header');
    var nav = document.querySelector('nav');
    var sections = document.querySelectorAll('section[id]');
    var main = document.getElementById('main');

    if (!sections.length) return;

    document.body.classList.add('dos-mode');

    // Extract content from existing page
    var headerContent = {
      title: header && header.querySelector('h1') ? header.querySelector('h1').textContent : 'DOS',
      headshot: document.querySelector('.headshot') ? document.querySelector('.headshot').src : null
    };

    // Store headshot for later use
    state.headshot = headerContent.headshot;

    if (nav) {
      nav.querySelectorAll('a').forEach(function(a) {
        state.navLinks.push({ text: a.textContent, href: a.href });
      });
    }

    // Store section data
    sections.forEach(function(section) {
      state.sections.push({
        id: section.id,
        title: section.dataset.title || section.id,
        element: section
      });
    });

    // Create main container
    var dosContainer = createElement('div');
    dosContainer.id = 'dos-container';
    dosContainer.innerHTML = buildDOSHTML(headerContent);

    if (main) main.style.display = 'none';
    document.body.appendChild(dosContainer);

    // Move control panel if it exists
    var controlPanel = document.getElementById('control-panel');
    if (controlPanel) dosContainer.appendChild(controlPanel);

    // Start boot sequence
    startBIOSSequence(dosContainer);
  }

  // ============================================
  // HTML Structure
  // ============================================

  function buildDOSHTML(headerContent) {
    return '\
      <div id="dos-bios">\
        <div class="bios-content">\
          <div class="bios-header">Award Modular BIOS v4.51PG, An Energy Star Ally</div>\
          <div class="bios-copyright">Copyright (C) 1984-95, Award Software, Inc.</div>\
          <div class="bios-line"></div>\
          <div class="bios-cpu">Intel 80486DX CPU at 66MHz</div>\
          <div class="bios-memory-test">Memory Test: <span id="dos-bios-memory">0</span>K OK</div>\
          <div class="bios-line"></div>\
          <div class="bios-detecting">Detecting IDE drives...</div>\
          <div class="bios-drive">Primary Master: MAXTOR 7245A</div>\
          <div class="bios-drive">Primary Slave: None</div>\
          <div class="bios-drive">Secondary Master: ATAPI CD-ROM</div>\
          <div class="bios-line"></div>\
          <div class="bios-press">Press DEL to enter SETUP</div>\
        </div>\
      </div>\
      <div id="dos-boot">\
        <div class="boot-messages"></div>\
      </div>\
      <div id="dos-prompt">\
        <div class="dos-terminal"></div>\
      </div>\
      <div id="dos-viewer">\
        <div class="viewer-header">\
          <span class="viewer-title"></span>\
        </div>\
        <div class="viewer-content"></div>\
        <div class="viewer-statusbar">\
          <span class="viewer-quit-btn">Quit</span>\
          <span class="viewer-hint">ESC or Q to exit | PgUp/PgDn to scroll</span>\
        </div>\
      </div>\
    ';
  }

  // ============================================
  // BIOS POST Sequence
  // ============================================

  function startBIOSSequence(container) {
    var bios = container.querySelector('#dos-bios');
    var boot = container.querySelector('#dos-boot');
    var memoryEl = document.getElementById('dos-bios-memory');

    var memory = 0;
    var targetMemory = 16384; // 16MB

    function updateMemory() {
      memory += Math.floor(Math.random() * 2048) + 1024;
      if (memory > targetMemory) memory = targetMemory;
      memoryEl.textContent = memory;

      if (memory < targetMemory) {
        setTimeout(updateMemory, 30);
      } else {
        setTimeout(function() {
          bios.classList.add('fade-out');
          setTimeout(function() {
            bios.style.display = 'none';
            boot.style.display = 'flex';
            startDOSBoot(container);
          }, 300);
        }, 500);
      }
    }

    setTimeout(updateMemory, 200);
  }

  // ============================================
  // DOS Boot Sequence
  // ============================================

  function startDOSBoot(container) {
    var boot = container.querySelector('#dos-boot');
    var messages = boot.querySelector('.boot-messages');
    var prompt = container.querySelector('#dos-prompt');

    var bootLines = [
      { text: 'Starting MS-DOS...', class: 'msdos', delay: 400 },
      { text: '', delay: 100 },
      { text: 'HIMEM is testing extended memory...done.', delay: 300 },
      { text: 'EMM386 Active.', delay: 200 },
      { text: '', delay: 100 },
      { text: 'C:\\>MSCDEX Version 2.23', delay: 200 },
      { text: 'Copyright (C) Microsoft Corp. 1986-1993.', delay: 100 },
      { text: '    Drive D: = Driver MSCD001 unit 0', delay: 200 },
      { text: '', delay: 100 },
      { text: 'C:\\>MOUSE', delay: 200 },
      { text: 'Microsoft Mouse Driver Version 8.20', delay: 100 },
      { text: 'Mouse driver installed.', class: 'success', delay: 300 },
      { text: '', delay: 100 },
      { text: 'C:\\>DOSKEY', delay: 200 },
      { text: 'DOSKey installed.', class: 'success', delay: 300 },
      { text: '', delay: 200 }
    ];

    var lineIndex = 0;

    function showNextLine() {
      if (lineIndex >= bootLines.length) {
        setTimeout(function() {
          boot.style.display = 'none';
          prompt.style.display = 'flex';
          initPrompt(container);
        }, 500);
        return;
      }

      var line = bootLines[lineIndex];
      var div = createElement('div');
      div.className = 'boot-line' + (line.class ? ' ' + line.class : '');
      div.textContent = line.text;
      messages.appendChild(div);

      lineIndex++;
      setTimeout(showNextLine, line.delay);
    }

    setTimeout(showNextLine, 300);
  }

  // ============================================
  // Command Prompt
  // ============================================

  function initPrompt(container) {
    var terminal = container.querySelector('.dos-terminal');

    // Show welcome message
    addOutput(terminal, 'Microsoft(R) MS-DOS(R) Version 6.22', 'white');
    addOutput(terminal, '             (C)Copyright Microsoft Corp 1981-1994.');
    addOutput(terminal, '');

    // Show clickable quick commands
    addOutputHTML(terminal, 'Quick commands: ' + cmdLink('DIR') + ' | ' + cmdLink('HELP') + ' | ' + cmdLink('EXIT'));
    addOutput(terminal, '');

    // Show file listing with clickable files
    showQuickFiles(terminal);

    // Show nav links
    showQuickLinks(terminal);

    // Create input line
    showPromptLine(terminal);

    // Setup keyboard handling and click handlers
    setupKeyboardHandler(container, terminal);
    setupCmdLinks(terminal, container);
  }

  function showQuickFiles(terminal) {
    if (state.sections.length === 0 && !state.headshot) return;

    addOutput(terminal, 'Files available:', 'cyan');

    // Show headshot first if available
    if (state.headshot) {
      addOutputHTML(terminal, '  ' + cmdLink('VIEW HEADSHOT.BMP', 'HEADSHOT.BMP'));
    }

    var fileLinks = state.sections.map(function(section) {
      var filename = section.title.toUpperCase().substring(0, 8);
      return '  ' + cmdLink('VIEW ' + filename + '.TXT', filename + '.TXT');
    });
    addOutputHTML(terminal, fileLinks.join('\n'));
    addOutput(terminal, '');
  }

  function showQuickLinks(terminal) {
    if (state.navLinks.length === 0) return;

    addOutput(terminal, 'Links:', 'cyan');
    state.navLinks.forEach(function(link) {
      addOutputHTML(terminal, '  ' + extLink(link.href, link.text));
    });
    addOutput(terminal, '');
  }

  // Create an external link (opens in new tab)
  function extLink(href, label) {
    return '<a class="dos-ext-link" href="' + href + '" target="_blank">' + label + '</a>';
  }

  // ============================================
  // ASCII Art Generator
  // ============================================

  function imageToAscii(imgSrc, callback, options) {
    options = options || {};
    var width = options.width || 60;  // characters wide
    var chars = options.chars || ' .:-=+*#%@';  // dark to light
    var colored = options.colored !== false;  // default to colored

    var img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function() {
      var canvas = document.createElement('canvas');
      var ctx = canvas.getContext('2d');

      // Calculate height to maintain aspect ratio (chars are ~2x tall as wide)
      var aspectRatio = img.height / img.width;
      var height = Math.floor(width * aspectRatio * 0.5);

      canvas.width = width;
      canvas.height = height;

      // Fill with black background first
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, width, height);

      // Draw image scaled down
      ctx.drawImage(img, 0, 0, width, height);

      // Get pixel data
      var imageData = ctx.getImageData(0, 0, width, height);
      var pixels = imageData.data;

      var ascii = '';
      for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
          var idx = (y * width + x) * 4;
          var r = pixels[idx];
          var g = pixels[idx + 1];
          var b = pixels[idx + 2];

          // Calculate brightness (0-255)
          var brightness = (r + g + b) / 3;

          // Map brightness to character
          var charIdx = Math.floor((brightness / 255) * (chars.length - 1));
          var char = chars[charIdx];

          if (colored && char !== ' ') {
            // Output colored span
            ascii += '<span style="color:rgb(' + r + ',' + g + ',' + b + ')">' + char + '</span>';
          } else {
            ascii += char;
          }
        }
        ascii += '\n';
      }

      callback(ascii, colored);
    };

    img.onerror = function() {
      callback(null);
    };

    img.src = imgSrc;
  }

  function showHeadshot(terminal) {
    if (!state.headshot) {
      addOutput(terminal, 'No headshot image found.', 'white');
      addOutput(terminal, '');
      return;
    }

    addOutput(terminal, 'Loading HEADSHOT.BMP...', 'cyan');

    imageToAscii(state.headshot, function(ascii, isColored) {
      if (ascii) {
        // Clear the "Loading..." message
        var outputs = terminal.querySelectorAll('.dos-output');
        var lastOutput = outputs[outputs.length - 1];
        if (lastOutput && lastOutput.textContent.includes('Loading')) {
          lastOutput.remove();
        }

        addOutput(terminal, '');
        var pre = createElement('pre');
        pre.className = 'dos-ascii-art';
        if (isColored) {
          pre.innerHTML = ascii;
        } else {
          pre.textContent = ascii;
        }
        terminal.appendChild(pre);
        addOutput(terminal, '');
      } else {
        addOutput(terminal, 'Error loading image.', 'white');
        addOutput(terminal, '');
      }

      // Re-show prompt and scroll
      showPromptLine(terminal);
      terminal.scrollTop = terminal.scrollHeight;
    }, { width: 120, colored: true });
  }

  function showPromptLine(terminal) {
    var inputLine = createElement('div');
    inputLine.className = 'dos-input-line';
    inputLine.innerHTML = '\
      <span class="dos-prompt-text">C:\\&gt;</span>\
      <input type="text" class="dos-input" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">\
      <span class="dos-cursor"></span>\
    ';
    terminal.appendChild(inputLine);

    var input = inputLine.querySelector('.dos-input');
    input.focus();

    // Scroll to bottom
    terminal.scrollTop = terminal.scrollHeight;
  }

  function addOutput(terminal, text, colorClass) {
    var div = createElement('div');
    div.className = 'dos-output' + (colorClass ? ' ' + colorClass : '');
    div.textContent = text;
    terminal.appendChild(div);
  }

  function addOutputHTML(terminal, html, colorClass) {
    var div = createElement('div');
    div.className = 'dos-output' + (colorClass ? ' ' + colorClass : '');
    div.innerHTML = html;
    terminal.appendChild(div);
  }

  // Create a clickable command link
  function cmdLink(command, label) {
    label = label || command;
    return '<span class="dos-cmd-link" data-cmd="' + command + '">' + label + '</span>';
  }

  // Setup click handlers for command links in terminal
  function setupCmdLinks(terminal, container) {
    terminal.querySelectorAll('.dos-cmd-link').forEach(function(link) {
      if (link.dataset.bound) return;
      link.dataset.bound = 'true';
      link.addEventListener('click', function(e) {
        e.stopPropagation();
        var cmd = this.dataset.cmd;
        executeCommand(container, terminal, cmd);
      });
    });
  }

  // ============================================
  // Command Handler
  // ============================================

  function setupKeyboardHandler(container, terminal) {
    document.addEventListener('keydown', function(e) {
      if (state.currentView === 'viewer') {
        handleViewerKeydown(container, e);
        return;
      }

      var input = terminal.querySelector('.dos-input');
      if (!input) return;

      // Focus input if typing
      if (document.activeElement !== input && e.key.length === 1) {
        input.focus();
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        executeCommand(container, terminal, input.value);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        navigateHistory(input, -1);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        navigateHistory(input, 1);
      }
    });

    // Click to focus
    terminal.addEventListener('click', function() {
      var input = terminal.querySelector('.dos-input');
      if (input) input.focus();
    });
  }

  function navigateHistory(input, direction) {
    if (state.commandHistory.length === 0) return;

    state.historyIndex += direction;

    if (state.historyIndex < 0) {
      state.historyIndex = 0;
    } else if (state.historyIndex >= state.commandHistory.length) {
      state.historyIndex = state.commandHistory.length;
      input.value = '';
      return;
    }

    input.value = state.commandHistory[state.historyIndex] || '';
  }

  function executeCommand(container, terminal, command) {
    // Remove current input line
    var inputLine = terminal.querySelector('.dos-input-line');
    if (inputLine) inputLine.remove();

    // Show what was typed
    addOutput(terminal, 'C:\\>' + command);

    // Add to history
    if (command.trim()) {
      state.commandHistory.push(command);
      state.historyIndex = state.commandHistory.length;
    }

    // Parse and execute
    var parts = command.trim().toLowerCase().split(/\s+/);
    var cmd = parts[0];
    var args = parts.slice(1);

    switch (cmd) {
      case 'help':
      case '?':
        showHelp(terminal);
        break;
      case 'dir':
        showDir(terminal);
        break;
      case 'cls':
        clearScreen(terminal);
        break;
      case 'type':
      case 'view':
      case 'more':
        // Join all args to support filenames with spaces
        viewFile(container, terminal, args.join(' '));
        break;
      case 'ver':
        addOutput(terminal, '');
        addOutput(terminal, 'MS-DOS Version 6.22', 'white');
        addOutput(terminal, '');
        break;
      case 'date':
        addOutput(terminal, 'Current date is ' + new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'numeric', day: 'numeric' }));
        addOutput(terminal, '');
        break;
      case 'time':
        addOutput(terminal, 'Current time is ' + new Date().toLocaleTimeString());
        addOutput(terminal, '');
        break;
      case 'mem':
        showMem(terminal);
        break;
      case 'photo':
      case 'headshot':
        showHeadshot(terminal);
        return; // Don't show prompt, showHeadshot will do it async
      case 'exit':
        addOutput(terminal, '');
        addOutput(terminal, 'Thanks for using DOS!', 'white');
        addOutput(terminal, 'Refreshing page...', 'cyan');
        setTimeout(function() {
          location.reload();
        }, 1500);
        return;
      case 'cd':
        addOutput(terminal, 'C:\\');
        addOutput(terminal, '');
        break;
      case 'echo':
        addOutput(terminal, args.join(' '), 'white');
        addOutput(terminal, '');
        break;
      case '':
        // Empty command
        break;
      default:
        addOutput(terminal, "Bad command or file name");
        addOutput(terminal, '');
    }

    // Show new prompt and wire up any new command links
    showPromptLine(terminal);
    setupCmdLinks(terminal, container);
  }

  // ============================================
  // Commands
  // ============================================

  function showHelp(terminal) {
    addOutput(terminal, '');
    addOutput(terminal, 'Available commands:', 'white');
    addOutput(terminal, '');
    addOutputHTML(terminal, '  ' + cmdLink('DIR') + '          Lists files in current directory');
    addOutput(terminal, '  TYPE <file>  Display contents of a file');
    addOutput(terminal, '  VIEW <file>  View file in Norton Commander style');
    addOutputHTML(terminal, '  ' + cmdLink('CLS') + '          Clear screen');
    addOutputHTML(terminal, '  ' + cmdLink('VER') + '          Display DOS version');
    addOutputHTML(terminal, '  ' + cmdLink('DATE') + '         Display current date');
    addOutputHTML(terminal, '  ' + cmdLink('TIME') + '         Display current time');
    addOutputHTML(terminal, '  ' + cmdLink('MEM') + '          Display memory usage');
    addOutputHTML(terminal, '  ' + cmdLink('PHOTO') + '        Display headshot as ASCII art');
    addOutput(terminal, '  ECHO <text>  Display text');
    addOutputHTML(terminal, '  ' + cmdLink('EXIT') + '         Exit DOS and return to normal page');
    addOutputHTML(terminal, '  ' + cmdLink('HELP') + '         Display this help');
    addOutput(terminal, '');

    // Also show clickable file list
    if (state.sections.length > 0 || state.headshot) {
      addOutput(terminal, 'Click a file to view:', 'cyan');
      if (state.headshot) {
        addOutputHTML(terminal, '  ' + cmdLink('VIEW HEADSHOT.BMP', 'HEADSHOT.BMP'));
      }
      state.sections.forEach(function(section) {
        var filename = section.title.toUpperCase().substring(0, 8);
        addOutputHTML(terminal, '  ' + cmdLink('VIEW ' + filename + '.TXT', filename + '.TXT'));
      });
      addOutput(terminal, '');
    }
  }

  function showDir(terminal) {
    addOutput(terminal, '');
    addOutput(terminal, ' Volume in drive C is WEBSITE');
    addOutput(terminal, ' Volume Serial Number is 1337-BEEF');
    addOutput(terminal, ' Directory of C:\\');
    addOutput(terminal, '');

    var totalSize = 0;
    var fileCount = 0;

    // Show headshot if available
    if (state.headshot) {
      var headshotSize = '     4,096';  // Fake size for BMP
      addOutputHTML(terminal, cmdLink('VIEW HEADSHOT.BMP', 'HEADSHOT') + ' BMP   ' + headshotSize + '  12-25-95  10:30a');
      totalSize += 4096;
      fileCount++;
    }

    state.sections.forEach(function(section) {
      var size = section.element.textContent.length;
      totalSize += size;
      fileCount++;
      var sizeStr = size.toString().padStart(10, ' ');
      var name = section.title.toUpperCase().substring(0, 8);
      var namePadded = name.padEnd(8, ' ');
      var ext = 'TXT';
      var date = '12-25-95  10:30a';

      // Make filename clickable
      var clickableName = cmdLink('VIEW ' + name + '.TXT', namePadded);
      addOutputHTML(terminal, clickableName + ' ' + ext + '   ' + sizeStr + '  ' + date);
    });

    addOutput(terminal, '        ' + fileCount + ' file(s)    ' + totalSize.toLocaleString().padStart(10, ' ') + ' bytes');
    addOutput(terminal, '        0 dir(s)    524,288,000 bytes free');
    addOutput(terminal, '');
  }

  function clearScreen(terminal) {
    terminal.innerHTML = '';
    // Show quick commands after clearing
    addOutputHTML(terminal, 'Quick commands: ' + cmdLink('DIR') + ' | ' + cmdLink('HELP') + ' | ' + cmdLink('EXIT'));
    addOutput(terminal, '');
  }

  function showMem(terminal) {
    addOutput(terminal, '');
    addOutput(terminal, 'Memory Type        Total  =     Used   +    Free');
    addOutput(terminal, '----------------  ------       ------       ------');
    addOutput(terminal, 'Conventional       640K         128K         512K');
    addOutput(terminal, 'Upper              155K          95K          60K');
    addOutput(terminal, 'Extended (XMS)   15,360K       4,096K      11,264K');
    addOutput(terminal, '----------------  ------       ------       ------');
    addOutput(terminal, 'Total memory     16,155K       4,319K      11,836K');
    addOutput(terminal, '');
    addOutput(terminal, 'Total under 1 MB    795K         223K         572K');
    addOutput(terminal, '');
  }

  // ============================================
  // File Viewer (Norton Commander Style)
  // ============================================

  function viewFile(container, terminal, filename) {
    if (!filename) {
      addOutput(terminal, 'Required parameter missing', 'white');
      addOutput(terminal, '');
      return;
    }

    // Check for headshot
    var lowerFilename = filename.toLowerCase().trim();
    if (lowerFilename === 'headshot.bmp' || lowerFilename === 'headshot' ||
        lowerFilename === 'photo.bmp' || lowerFilename === 'photo') {
      showHeadshot(terminal);
      return;
    }

    // Strip .txt extension and normalize
    var searchName = filename.replace(/\.txt$/i, '').toLowerCase().trim();

    // Find section by title (truncated to 8 chars like DOS), full title, or id
    var section = state.sections.find(function(s) {
      var title8 = s.title.substring(0, 8).toLowerCase();
      return title8 === searchName ||
             s.title.toLowerCase() === searchName ||
             s.id.toLowerCase() === searchName;
    });

    if (!section) {
      addOutput(terminal, 'File not found - ' + filename.toUpperCase());
      addOutput(terminal, '');
      return;
    }

    // Switch to viewer
    showViewer(container, section);
  }

  function showViewer(container, section) {
    var prompt = container.querySelector('#dos-prompt');
    var viewer = container.querySelector('#dos-viewer');

    // Set title
    viewer.querySelector('.viewer-title').textContent = ' ' + section.title.toUpperCase() + '.TXT ';

    // Clone and format content
    var content = section.element.cloneNode(true);
    content.style.display = 'block';

    // Remove images and other non-text elements
    content.querySelectorAll('img, .headshot, script, style').forEach(function(el) {
      el.remove();
    });

    var viewerContent = viewer.querySelector('.viewer-content');
    viewerContent.innerHTML = '';
    viewerContent.appendChild(content);

    // Show viewer, hide prompt
    prompt.style.display = 'none';
    viewer.style.display = 'flex';
    state.currentView = 'viewer';

    // Setup quit button handler
    var quitBtn = viewer.querySelector('.viewer-quit-btn');
    if (quitBtn) {
      quitBtn.onclick = function() {
        closeViewer(container);
      };
    }
  }

  function handleViewerKeydown(container, e) {
    if (e.key === 'Escape' || e.key === 'q' || e.key === 'Q') {
      closeViewer(container);
    }
  }

  function closeViewer(container) {
    var prompt = container.querySelector('#dos-prompt');
    var viewer = container.querySelector('#dos-viewer');

    viewer.style.display = 'none';
    prompt.style.display = 'flex';
    state.currentView = 'prompt';

    // Focus input
    var input = prompt.querySelector('.dos-input');
    if (input) input.focus();
  }

  // ============================================
  // Register Plugin
  // ============================================

  window.web90.registerPlugin('dos', initDOS);

})();
