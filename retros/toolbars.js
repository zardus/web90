/**
 * Early 2000s Browser Toolbar Infestation
 * Simulates the nightmare of bundled search bars and browser toolbars
 * that would stack up and consume half your screen.
 *
 * Remember when you'd help your grandma with her computer and Internet Explorer
 * had like 15 toolbars taking up 60% of the viewport? Good times.
 */

(function() {
  'use strict';

  var web90 = window.web90;

  // All the cursed toolbars from the early 2000s
  var TOOLBARS = [
    {
      id: 'askjeeves',
      name: 'Ask Jeeves Search',
      icon: '🎩',
      installName: 'Ask Jeeves Toolbar',
      installIcon: '🎩',
      features: ['Ask Jeeves web search', 'Daily Trivia', 'Weather updates', 'Free smileys'],
      content: function() {
        return '<div class="toolbar-brand"><span class="toolbar-brand-icon">🎩</span>Ask Jeeves</div>' +
          '<div class="toolbar-search-box">' +
          '<input type="text" class="toolbar-search-input" placeholder="Ask me anything...">' +
          '<button class="toolbar-search-btn">Ask!</button>' +
          '</div>' +
          '<span class="toolbar-separator"></span>' +
          btn('❓', 'Ask') +
          btn('🎯', 'Trivia') +
          btn('☁️', 'Weather');
      }
    },
    {
      id: 'yahoo',
      name: 'Yahoo! Toolbar',
      icon: '📣',
      installName: 'Yahoo! Companion Toolbar',
      installIcon: '📣',
      features: ['Yahoo! Search', 'Anti-Spy protection', 'Pop-Up Blocker', 'Yahoo! Mail alerts'],
      content: function() {
        return '<div class="toolbar-brand"><span class="toolbar-brand-icon">📣</span>Yahoo!</div>' +
          '<div class="toolbar-search-box">' +
          '<input type="text" class="toolbar-search-input" placeholder="Yahoo! Search">' +
          '<button class="toolbar-search-btn">Search</button>' +
          '</div>' +
          '<span class="toolbar-separator"></span>' +
          btn('📧', 'Mail') +
          btn('🔒', 'Anti-Spy') +
          btn('🚫', 'Pop-Ups') +
          btn('📰', 'News');
      }
    },
    {
      id: 'google',
      name: 'Google Toolbar',
      icon: '🔍',
      installName: 'Google Toolbar for Internet Explorer',
      installIcon: '🔍',
      features: ['Google Search from any page', 'PageRank display', 'Pop-up blocker', 'AutoFill'],
      content: function() {
        return '<div class="toolbar-brand">' +
          '<span>G</span><span>o</span><span>o</span><span>g</span><span>l</span><span>e</span>' +
          '</div>' +
          '<div class="toolbar-search-box">' +
          '<input type="text" class="toolbar-search-input" placeholder="Google Search">' +
          '<button class="toolbar-search-btn">Search</button>' +
          '</div>' +
          '<span class="toolbar-separator"></span>' +
          btn('📊', 'PageRank') +
          btn('🚫', 'Popups') +
          btn('✍️', 'AutoFill') +
          btn('⭐', 'BookMark');
      }
    },
    {
      id: 'bonzi',
      name: 'BonziBuddy',
      icon: '🦍',
      installName: 'BonziBuddy Web Assistant',
      installIcon: '🦍',
      features: ['Web searching', 'FREE email', 'Talk to Bonzi!', 'Fun sounds and songs'],
      content: function() {
        return '<div class="toolbar-brand"><span class="toolbar-brand-icon">🦍</span>BonziBuddy</div>' +
          '<div class="toolbar-search-box">' +
          '<input type="text" class="toolbar-search-input" placeholder="Search with Bonzi!">' +
          '<button class="toolbar-search-btn">Go!</button>' +
          '</div>' +
          '<span class="toolbar-separator"></span>' +
          btn('💬', 'Talk') +
          btn('📧', 'Email') +
          btn('🎵', 'Songs') +
          btn('😊', 'Jokes');
      }
    },
    {
      id: 'weatherbug',
      name: 'WeatherBug',
      icon: '🐛',
      installName: 'WeatherBug Desktop Weather',
      installIcon: '🐛',
      features: ['Live local weather', 'Severe weather alerts', 'Extended forecasts', '10-day outlook'],
      content: function() {
        return '<div class="toolbar-brand"><span class="toolbar-brand-icon">🐛</span>WeatherBug</div>' +
          '<span class="toolbar-temp">72°F</span>' +
          '<span class="toolbar-separator"></span>' +
          btn('☀️', 'Today') +
          btn('📅', '10-Day') +
          btn('🗺️', 'Maps') +
          btn('⚠️', 'Alerts') +
          btn('📍', 'Local');
      }
    },
    {
      id: 'mywebsearch',
      name: 'MyWebSearch',
      icon: '🔎',
      installName: 'MyWebSearch Toolbar',
      installIcon: '🔎',
      features: ['Web Search', 'FREE Smileys', 'FREE Screensavers', 'FREE Cursors'],
      content: function() {
        return '<div class="toolbar-brand"><span class="toolbar-brand-icon">🔎</span>MyWebSearch</div>' +
          '<div class="toolbar-search-box">' +
          '<input type="text" class="toolbar-search-input" placeholder="Search the Web">' +
          '<button class="toolbar-search-btn">Search</button>' +
          '</div>' +
          '<div class="toolbar-smileys">😀😎🎉💯</div>' +
          '<span class="toolbar-separator"></span>' +
          btn('😊', 'Smileys') +
          btn('🖼️', 'Screens') +
          btn('🎮', 'Games');
      }
    },
    {
      id: 'hotbar',
      name: 'Hotbar',
      icon: '🔥',
      installName: 'Hotbar Browser Enhancement',
      installIcon: '🔥',
      features: ['Email Skins', 'Browser Skins', 'Animated graphics', 'Cool effects'],
      content: function() {
        return '<div class="toolbar-brand"><span class="toolbar-brand-icon">🔥</span>Hotbar</div>' +
          '<div class="toolbar-skins">' +
          '<span class="toolbar-skin-dot" style="background:#ff0000"></span>' +
          '<span class="toolbar-skin-dot" style="background:#00ff00"></span>' +
          '<span class="toolbar-skin-dot" style="background:#0000ff"></span>' +
          '<span class="toolbar-skin-dot" style="background:#ffff00"></span>' +
          '<span class="toolbar-skin-dot" style="background:#ff00ff"></span>' +
          '</div>' +
          '<span class="toolbar-separator"></span>' +
          btn('🎨', 'Skins') +
          btn('📧', 'Email') +
          btn('✨', 'Effects') +
          btn('⚙️', 'Settings');
      }
    },
    {
      id: 'limewire',
      name: 'LimeWire',
      icon: '🍋',
      installName: 'LimeWire Search Toolbar',
      installIcon: '🍋',
      features: ['P2P File Search', 'FREE MP3 Downloads', 'Video downloads', 'Image search'],
      content: function() {
        return '<div class="toolbar-brand"><span class="toolbar-brand-icon">🍋</span>LimeWire</div>' +
          '<div class="toolbar-search-box">' +
          '<input type="text" class="toolbar-search-input" placeholder="Search for files...">' +
          '<button class="toolbar-search-btn">Search</button>' +
          '</div>' +
          '<span class="toolbar-separator"></span>' +
          btn('🎵', 'Music') +
          btn('🎬', 'Video') +
          btn('🖼️', 'Images') +
          btn('📁', 'Library');
      }
    },
    {
      id: 'cursormania',
      name: 'Cursor Mania',
      icon: '🖱️',
      installName: 'Cursor Mania - FREE Cursors!',
      installIcon: '🖱️',
      features: ['1000s of FREE cursors', 'Animated cursors', 'Holiday themes', 'Daily new cursors'],
      content: function() {
        return '<div class="toolbar-brand"><span class="toolbar-brand-icon">🖱️</span>Cursor Mania</div>' +
          '<div class="toolbar-cursors">' +
          '<span class="toolbar-cursor-option">👆</span>' +
          '<span class="toolbar-cursor-option">✋</span>' +
          '<span class="toolbar-cursor-option">👉</span>' +
          '</div>' +
          '<span class="toolbar-separator"></span>' +
          btn('🆕', 'New') +
          btn('⭐', 'Popular') +
          btn('🎄', 'Holiday');
      }
    },
    {
      id: 'gator',
      name: 'Gator eWallet',
      icon: '🐊',
      installName: 'Gator eWallet - Save Passwords',
      installIcon: '🐊',
      features: ['Save ALL passwords', 'AutoFill forms', 'Special offers!', 'Comparison shopping'],
      content: function() {
        return '<div class="toolbar-brand"><span class="toolbar-brand-icon">🐊</span>Gator</div>' +
          '<span class="toolbar-deals">★ HOT DEALS! ★</span>' +
          '<span class="toolbar-separator"></span>' +
          btn('🔐', 'Wallet') +
          btn('✍️', 'AutoFill') +
          btn('🛒', 'Deals') +
          btn('💰', 'Save $$$');
      }
    },
    {
      id: 'cometcursor',
      name: 'Comet Cursor',
      icon: '☄️',
      installName: 'Comet Cursor System',
      installIcon: '☄️',
      features: ['FREE animated cursors', 'Comet trails', 'Star effects', 'Space themes'],
      content: function() {
        return '<div class="toolbar-brand"><span class="toolbar-brand-icon">☄️</span>Comet Cursor</div>' +
          '<span class="toolbar-stars">✨ ⭐ 💫 ✨</span>' +
          '<span class="toolbar-separator"></span>' +
          btn('🌟', 'Cursors') +
          btn('🚀', 'Trails') +
          btn('🌌', 'Themes');
      }
    },
    {
      id: 'aol',
      name: 'AOL Toolbar',
      icon: '📧',
      installName: 'AOL Toolbar & AIM',
      installIcon: '📧',
      features: ['AOL Search', 'AIM buddy list', 'AOL Mail', 'Parental controls'],
      content: function() {
        return '<div class="toolbar-brand"><span class="toolbar-brand-icon">📧</span>AOL</div>' +
          '<div class="toolbar-search-box">' +
          '<input type="text" class="toolbar-search-input" placeholder="AOL Search">' +
          '<button class="toolbar-search-btn">Search</button>' +
          '</div>' +
          '<span class="toolbar-separator"></span>' +
          btn('📧', 'Mail') + '<span class="toolbar-mail-count">47</span>' +
          btn('💬', 'AIM') +
          btn('🏠', 'Home') +
          btn('👶', 'Kids');
      }
    },
    {
      id: 'realplayer',
      name: 'RealPlayer',
      icon: '▶️',
      installName: 'RealPlayer Cloud Toolbar',
      installIcon: '▶️',
      features: ['Download web videos', 'Convert formats', 'Burn CDs', 'Cloud storage'],
      content: function() {
        return '<div class="toolbar-brand"><span class="toolbar-brand-icon">▶️</span>RealPlayer</div>' +
          '<span class="toolbar-separator"></span>' +
          btn('📥', 'Download') +
          btn('🔄', 'Convert') +
          btn('💿', 'Burn') +
          btn('☁️', 'Cloud') +
          btn('📚', 'Library');
      }
    }
  ];

  // Helper to create toolbar button HTML
  function btn(icon, label) {
    return '<button class="toolbar-btn">' +
      '<span class="toolbar-btn-icon">' + icon + '</span>' +
      '<span class="toolbar-btn-label">' + label + '</span>' +
      '</button>';
  }

  var container;
  var installedToolbars = [];
  var installQueue = [];
  var isInstalling = false;
  var isRunning = false;
  var installInterval;

  function shuffleArray(arr) {
    var shuffled = arr.slice();
    for (var i = shuffled.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = shuffled[i];
      shuffled[i] = shuffled[j];
      shuffled[j] = temp;
    }
    return shuffled;
  }

  function createToolbar(toolbarDef) {
    var toolbar = document.createElement('div');
    toolbar.className = 'browser-toolbar toolbar-' + toolbarDef.id;
    toolbar.id = 'toolbar-' + toolbarDef.id;

    var content = document.createElement('div');
    content.className = 'toolbar-content';
    content.innerHTML = toolbarDef.content();

    toolbar.appendChild(content);
    return toolbar;
  }

  function showInstallDialog(toolbarDef, callback) {
    // Remove any existing dialog
    var existing = document.getElementById('toolbar-install-dialog');
    if (existing) existing.remove();

    var dialog = document.createElement('div');
    dialog.id = 'toolbar-install-dialog';

    var featuresHtml = toolbarDef.features.map(function(f) {
      return '<li>' + f + '</li>';
    }).join('');

    dialog.innerHTML =
      '<div class="window">' +
        '<div class="title-bar">' +
          '<div class="title-bar-text">Install ' + toolbarDef.installName + '</div>' +
          '<div class="title-bar-controls">' +
            '<button aria-label="Close" id="toolbar-dialog-close"></button>' +
          '</div>' +
        '</div>' +
        '<div class="window-body">' +
          '<div class="toolbar-install-header">' +
            '<span class="toolbar-install-icon">' + toolbarDef.installIcon + '</span>' +
            '<div class="toolbar-install-text">' +
              '<h3>' + toolbarDef.installName + '</h3>' +
              '<p>Do you want to install this FREE toolbar?</p>' +
              '<ul class="toolbar-install-features">' + featuresHtml + '</ul>' +
            '</div>' +
          '</div>' +
          '<div class="toolbar-install-checkbox">' +
            '<label><input type="checkbox" checked> Make ' + toolbarDef.name + ' my default search provider</label>' +
          '</div>' +
          '<div class="toolbar-install-checkbox">' +
            '<label><input type="checkbox" checked> Set ' + toolbarDef.name + ' as my homepage</label>' +
          '</div>' +
          '<div class="toolbar-install-btns">' +
            '<button id="toolbar-install-yes">Install</button>' +
            '<button id="toolbar-install-no">Cancel</button>' +
          '</div>' +
        '</div>' +
      '</div>';

    container.appendChild(dialog);

    // Wire up buttons
    var yesBtn = dialog.querySelector('#toolbar-install-yes');
    var noBtn = dialog.querySelector('#toolbar-install-no');
    var closeBtn = dialog.querySelector('#toolbar-dialog-close');

    yesBtn.addEventListener('click', function() {
      showProgressDialog(toolbarDef, dialog, callback);
    });

    // Cancel just means "install anyway after brief delay"
    noBtn.addEventListener('click', function() {
      // 70% chance it installs anyway
      if (Math.random() < 0.7) {
        showProgressDialog(toolbarDef, dialog, callback);
      } else {
        dialog.remove();
        callback(false);
      }
    });

    // Close button definitely installs it lol
    closeBtn.addEventListener('click', function() {
      showProgressDialog(toolbarDef, dialog, callback);
    });
  }

  function showProgressDialog(toolbarDef, dialog, callback) {
    var windowBody = dialog.querySelector('.window-body');
    windowBody.innerHTML =
      '<div class="toolbar-install-header">' +
        '<span class="toolbar-install-icon">' + toolbarDef.installIcon + '</span>' +
        '<div class="toolbar-install-text">' +
          '<h3>Installing ' + toolbarDef.installName + '...</h3>' +
          '<p>Please wait while the toolbar is installed.</p>' +
        '</div>' +
      '</div>' +
      '<div class="toolbar-install-progress">' +
        '<div class="toolbar-progress-bar"><div class="toolbar-progress-fill"></div></div>' +
        '<p id="toolbar-install-status">Preparing installation...</p>' +
      '</div>';

    var progressFill = windowBody.querySelector('.toolbar-progress-fill');
    var statusText = windowBody.querySelector('#toolbar-install-status');

    var stages = [
      { progress: 15, text: 'Downloading toolbar components...' },
      { progress: 30, text: 'Extracting files...' },
      { progress: 45, text: 'Registering browser extension...' },
      { progress: 60, text: 'Configuring search settings...' },
      { progress: 75, text: 'Updating homepage preferences...' },
      { progress: 90, text: 'Finalizing installation...' },
      { progress: 100, text: 'Installation complete!' }
    ];

    var stageIndex = 0;

    function nextStage() {
      if (stageIndex >= stages.length) {
        setTimeout(function() {
          dialog.remove();
          callback(true);
        }, 500);
        return;
      }

      var stage = stages[stageIndex];
      progressFill.style.width = stage.progress + '%';
      statusText.textContent = stage.text;
      stageIndex++;

      setTimeout(nextStage, 300 + Math.random() * 400);
    }

    setTimeout(nextStage, 200);
  }

  function installToolbar(toolbarDef) {
    // Skip if already installed
    if (installedToolbars.indexOf(toolbarDef.id) !== -1) {
      processNextInstall();
      return;
    }

    showInstallDialog(toolbarDef, function(installed) {
      if (installed) {
        var toolbar = createToolbar(toolbarDef);
        container.appendChild(toolbar);

        // Trigger animation
        setTimeout(function() {
          toolbar.classList.add('toolbar-visible');
          installedToolbars.push(toolbarDef.id);

          // Update body margin to push content down
          updatePageMargin();
        }, 50);
      }

      // Small delay before next install
      setTimeout(function() {
        processNextInstall();
      }, 1000 + Math.random() * 2000);
    });
  }

  function updatePageMargin() {
    var totalHeight = 0;
    var toolbars = container.querySelectorAll('.browser-toolbar.toolbar-visible');
    toolbars.forEach(function(t) {
      totalHeight += t.offsetHeight;
    });
    document.body.style.marginTop = totalHeight + 'px';
    document.body.classList.add('toolbar-infected');
  }

  function processNextInstall() {
    if (!isRunning) return;

    if (installQueue.length === 0) {
      isInstalling = false;
      // Restart the queue after a while
      setTimeout(function() {
        if (isRunning && installedToolbars.length < TOOLBARS.length) {
          startInstallCycle();
        }
      }, 5000 + Math.random() * 5000);
      return;
    }

    var next = installQueue.shift();
    installToolbar(next);
  }

  function startInstallCycle() {
    if (isInstalling) return;
    isInstalling = true;

    // Get toolbars not yet installed
    var available = TOOLBARS.filter(function(t) {
      return installedToolbars.indexOf(t.id) === -1;
    });

    if (available.length === 0) {
      isInstalling = false;
      return;
    }

    // Shuffle and queue 2-4 toolbars
    var shuffled = shuffleArray(available);
    var count = Math.min(shuffled.length, 2 + Math.floor(Math.random() * 3));
    installQueue = shuffled.slice(0, count);

    processNextInstall();
  }

  function removeAllToolbars() {
    isRunning = false;
    isInstalling = false;
    installQueue = [];

    // Clear any interval
    if (installInterval) {
      clearInterval(installInterval);
      installInterval = null;
    }

    // Remove install dialog if open
    var dialog = document.getElementById('toolbar-install-dialog');
    if (dialog) dialog.remove();

    // Animate out toolbars
    var toolbars = container.querySelectorAll('.browser-toolbar');
    toolbars.forEach(function(toolbar, index) {
      setTimeout(function() {
        toolbar.classList.add('toolbar-removing');
      }, index * 100);
    });

    // Remove after animation
    setTimeout(function() {
      toolbars.forEach(function(t) {
        if (t.parentNode) t.parentNode.removeChild(t);
      });
      installedToolbars = [];
      document.body.style.marginTop = '';
      document.body.classList.remove('toolbar-infected');
    }, toolbars.length * 100 + 500);
  }

  function createBlockerButton() {
    var blocker = document.createElement('div');
    blocker.id = 'toolbar-blocker';
    blocker.className = 'window';
    blocker.innerHTML =
      '<div class="title-bar">' +
        '<div class="title-bar-text">🛡️ Toolbar Cleaner</div>' +
      '</div>' +
      '<div class="window-body">' +
        '<p><b>Toolbars detected!</b></p>' +
        '<p>Remove all this crapware?</p>' +
        '<button id="toolbar-blocker-btn">🧹 Clean Up</button>' +
      '</div>';

    container.appendChild(blocker);

    var cleanBtn = blocker.querySelector('#toolbar-blocker-btn');
    cleanBtn.addEventListener('click', function() {
      removeAllToolbars();

      blocker.querySelector('.window-body').innerHTML =
        '<p style="color: green;"><b>✓ All toolbars removed!</b></p>' +
        '<p style="font-size: 10px;">Your viewport is yours again.</p>';

      setTimeout(function() {
        blocker.style.opacity = '0';
        setTimeout(function() {
          if (blocker.parentNode) blocker.parentNode.removeChild(blocker);
        }, 500);
      }, 2000);
    });
  }

  function initToolbars() {
    // Create container
    container = document.createElement('div');
    container.id = 'toolbar-container';
    container.className = 'win98';
    document.documentElement.appendChild(container);

    isRunning = true;

    // Add the cleanup button
    createBlockerButton();

    // Start installing toolbars after a short delay
    setTimeout(function() {
      startInstallCycle();

      // Periodically try to install more toolbars (like the old days!)
      installInterval = setInterval(function() {
        if (isRunning && !isInstalling && installedToolbars.length < TOOLBARS.length) {
          startInstallCycle();
        }
      }, 15000 + Math.random() * 10000);
    }, 2000);
  }

  // Register with web90
  web90.registerPlugin('toolbars', initToolbars);

})();
