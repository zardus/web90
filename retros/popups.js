/**
 * Early 2000s Annoying Popups Module
 * The absolute worst of the early internet - fake virus warnings,
 * "You've Won!" scams, casino ads, and impossible-to-close dialogs.
 * Uses 98.css for authentic Windows styling.
 */

(function() {
  'use strict';

  var web90 = window.web90;

  // Popup templates - all the classics
  var POPUP_TEMPLATES = [
    {
      type: 'winner',
      title: 'CONGRATULATIONS!!!',
      content: '<div class="popup-winner">' +
        '<div class="popup-flash">YOU ARE THE 1,000,000th VISITOR!</div>' +
        '<div class="popup-trophy">🏆</div>' +
        '<div class="popup-prize">Click HERE to claim your FREE iPod Nano!</div>' +
        '<button class="popup-action">CLAIM PRIZE NOW!!!</button>' +
        '</div>'
    },
    {
      type: 'virus',
      title: 'Windows Security Alert',
      content: '<div class="popup-virus">' +
        '<div class="popup-virus-header"><span class="popup-virus-icon">⚠️</span> WARNING</div>' +
        '<div class="popup-virus-title">YOUR COMPUTER IS INFECTED!</div>' +
        '<p>We have detected <b>(47) viruses</b> on your computer!</p>' +
        '<div class="sunken-panel popup-virus-list">' +
        '<code>Trojan.Win32.Agent.btz<br>Worm.Win32.NetSky.q<br>Backdoor.IRC.Bot.gen<br>' +
        '<span class="popup-blink">...and 44 more threats!</span></code></div>' +
        '<button class="popup-action popup-btn-danger">SCAN NOW - FREE!!!</button>' +
        '<p class="popup-small">Powered by TotallyLegitAntivirus 2003</p>' +
        '</div>'
    },
    {
      type: 'casino',
      title: 'Golden Palace Casino',
      content: '<div class="popup-casino">' +
        '<div class="popup-casino-title">🎰 JACKPOT!!! 🎰</div>' +
        '<div class="popup-casino-slots">🎰 🎰 🎰</div>' +
        '<div class="popup-flash">$5,000 FREE BONUS - NO DEPOSIT!</div>' +
        '<p>Play BLACKJACK - POKER - SLOTS</p>' +
        '<button class="popup-action">PLAY NOW >>></button>' +
        '<p class="popup-small">Must be 18+ | Not available in all jurisdictions</p>' +
        '</div>'
    },
    {
      type: 'download',
      title: 'Download Complete!',
      content: '<div class="popup-download">' +
        '<div class="popup-download-icon">💾</div>' +
        '<div class="popup-download-title">FREE MUSIC DOWNLOAD</div>' +
        '<p>Download <b>Limewire Pro</b> - FREE!<br>Get unlimited MP3s, Movies & Games!</p>' +
        '<div class="popup-progress"><div class="popup-progress-bar"></div></div>' +
        '<button class="popup-action">DOWNLOAD NOW</button>' +
        '<p class="popup-small">100% FREE - No spyware guaranteed*</p>' +
        '</div>'
    },
    {
      type: 'toolbar',
      title: 'Enhance Your Browser!',
      content: '<div class="popup-toolbar">' +
        '<p><b>🔍 BonziBuddy Search Bar</b></p>' +
        '<p>Add the BEST toolbar to your browser!</p>' +
        '<ul class="tree-view">' +
        '<li>Free smileys</li>' +
        '<li>Weather updates</li>' +
        '<li>Popup blocker (ironic!)</li>' +
        '<li>FREE cursors!</li>' +
        '</ul>' +
        '<button class="popup-action">INSTALL NOW</button>' +
        '<p class="popup-small">By clicking Install, you agree to our Terms</p>' +
        '</div>'
    },
    {
      type: 'error',
      title: 'System Error',
      content: '<div class="popup-error">' +
        '<div class="popup-error-row">' +
        '<span class="popup-error-icon">❌</span>' +
        '<div class="popup-error-text">' +
        '<p><b>CRITICAL SYSTEM ERROR</b></p>' +
        '<p>Your system registry is corrupted!</p>' +
        '<p class="popup-small">Error Code: 0x80070005</p>' +
        '</div></div>' +
        '<p>Click OK to repair your computer.</p>' +
        '<div class="popup-error-btns">' +
        '<button class="popup-action">OK</button>' +
        '<button class="popup-action">OK</button>' +
        '</div>' +
        '</div>'
    },
    {
      type: 'survey',
      title: 'Quick Survey',
      content: '<div class="popup-survey">' +
        '<p><b>🎁 Win a FREE Xbox!</b></p>' +
        '<div class="popup-flash">Answer 3 quick questions!</div>' +
        '<fieldset>' +
        '<legend>Q1: Do you like FREE stuff?</legend>' +
        '<div class="field-row"><input type="radio" id="q1a" name="q1" checked><label for="q1a">Yes!</label></div>' +
        '<div class="field-row"><input type="radio" id="q1b" name="q1"><label for="q1b">YES!!!</label></div>' +
        '</fieldset>' +
        '<button class="popup-action">NEXT >></button>' +
        '<p class="popup-small">1 of 47 questions</p>' +
        '</div>'
    },
    {
      type: 'punch',
      title: 'YOU WIN!!!',
      content: '<div class="popup-punch">' +
        '<div class="popup-punch-title">PUNCH THE MONKEY!</div>' +
        '<div class="popup-monkey">🐵</div>' +
        '<div class="popup-flash">WIN A FREE iPHONE!!!</div>' +
        '<p class="popup-small">Click the monkey to claim your prize!</p>' +
        '</div>'
    },
    {
      type: 'congratulations',
      title: 'Congratulations User!',
      content: '<div class="popup-congrats">' +
        '<p>🎉 🎉 🎉</p>' +
        '<div class="popup-flash">You have been selected!</div>' +
        '<div class="sunken-panel">' +
        '<p>Dear AOL User,</p>' +
        '<p>You have won a <b>$1000 Walmart Gift Card!</b></p>' +
        '<p>This is NOT a joke!</p>' +
        '</div>' +
        '<button class="popup-action">CLAIM NOW!</button>' +
        '<p class="popup-timer">Offer expires in: <span class="popup-countdown">4:59</span></p>' +
        '</div>'
    }
  ];

  var activePopups = [];
  var popupCount = 0;
  var maxPopups = 8;
  var spawnInterval = null;
  var isRunning = false;
  var container;

  function createPopup(template, x, y) {
    if (activePopups.length >= maxPopups) return null;

    var popup = document.createElement('div');
    popup.className = 'popup-instance popup-type-' + template.type;
    popup.id = 'popup-' + (++popupCount);

    // Position with some randomness if not specified
    var posX = x !== undefined ? x : Math.random() * (window.innerWidth - 380);
    var posY = y !== undefined ? y : Math.random() * (window.innerHeight - 320);

    // Keep on screen
    posX = Math.max(10, Math.min(posX, window.innerWidth - 380));
    posY = Math.max(10, Math.min(posY, window.innerHeight - 280));

    popup.style.left = posX + 'px';
    popup.style.top = posY + 'px';

    // Create window using 98.css structure
    var windowEl = document.createElement('div');
    windowEl.className = 'window';

    // Title bar
    var titleBar = document.createElement('div');
    titleBar.className = 'title-bar';
    titleBar.innerHTML = '<div class="title-bar-text">' + template.title + '</div>' +
      '<div class="title-bar-controls">' +
      '<button aria-label="Minimize"></button>' +
      '<button aria-label="Maximize"></button>' +
      '<button aria-label="Close"></button>' +
      '</div>';

    // Window body
    var windowBody = document.createElement('div');
    windowBody.className = 'window-body popup-body';
    windowBody.innerHTML = template.content;

    windowEl.appendChild(titleBar);
    windowEl.appendChild(windowBody);
    popup.appendChild(windowEl);

    // Make draggable
    makeDraggable(popup, titleBar);

    // Close button behavior - sometimes spawns more!
    var closeBtn = titleBar.querySelector('[aria-label="Close"]');
    closeBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      closePopup(popup, template);
    });

    // Minimize does nothing useful
    var minBtn = titleBar.querySelector('[aria-label="Minimize"]');
    minBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      popup.classList.toggle('popup-minimized');
    });

    // Maximize makes it bigger and MORE annoying
    var maxBtn = titleBar.querySelector('[aria-label="Maximize"]');
    maxBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      popup.classList.toggle('popup-maximized');
    });

    // All action buttons inside spawn more popups
    var buttons = windowBody.querySelectorAll('.popup-action');
    buttons.forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        // Clicking any button spawns 1-3 more popups
        var spawnCount = Math.floor(Math.random() * 3) + 1;
        for (var i = 0; i < spawnCount; i++) {
          setTimeout(function() {
            spawnRandomPopup();
          }, i * 200);
        }
      });
    });

    // Monkey moves around
    if (template.type === 'punch') {
      var monkey = windowBody.querySelector('.popup-monkey');
      if (monkey) {
        monkey.addEventListener('mouseover', function() {
          this.style.transform = 'translate(' +
            (Math.random() * 100 - 50) + 'px, ' +
            (Math.random() * 60 - 30) + 'px)';
        });
      }
    }

    // Bring to front on click
    popup.addEventListener('mousedown', function() {
      bringToFront(popup);
    });

    container.appendChild(popup);
    activePopups.push(popup);

    // Animate in
    setTimeout(function() {
      popup.classList.add('popup-visible');
    }, 10);

    // Play annoying sound effect (just visual feedback)
    playPopupSound();

    return popup;
  }

  function closePopup(popup, template) {
    // 40% chance of spawning 2 more when closed
    if (Math.random() < 0.4) {
      var rect = popup.getBoundingClientRect();
      setTimeout(function() {
        spawnRandomPopup(rect.left + 30, rect.top + 30);
        spawnRandomPopup(rect.left - 30, rect.top - 30);
      }, 100);
    }

    // 20% chance the close button doesn't work
    if (Math.random() < 0.2) {
      popup.classList.add('popup-shake');
      setTimeout(function() {
        popup.classList.remove('popup-shake');
      }, 500);
      return;
    }

    popup.classList.remove('popup-visible');
    popup.classList.add('popup-closing');

    setTimeout(function() {
      if (popup.parentNode) {
        popup.parentNode.removeChild(popup);
      }
      var idx = activePopups.indexOf(popup);
      if (idx !== -1) {
        activePopups.splice(idx, 1);
      }
    }, 300);
  }

  function spawnRandomPopup(x, y) {
    if (!isRunning) return;
    var template = POPUP_TEMPLATES[Math.floor(Math.random() * POPUP_TEMPLATES.length)];
    createPopup(template, x, y);
  }

  function bringToFront(popup) {
    var maxZ = 100000;
    activePopups.forEach(function(p) {
      var z = parseInt(p.style.zIndex) || 100000;
      if (z > maxZ) maxZ = z;
    });
    popup.style.zIndex = maxZ + 1;
  }

  function makeDraggable(popup, handle) {
    var isDragging = false;
    var startX, startY, startLeft, startTop;

    handle.addEventListener('mousedown', function(e) {
      if (e.target.tagName === 'BUTTON') return;

      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      startLeft = parseInt(popup.style.left) || 0;
      startTop = parseInt(popup.style.top) || 0;

      popup.classList.add('popup-dragging');
      bringToFront(popup);

      e.preventDefault();
    });

    document.addEventListener('mousemove', function(e) {
      if (!isDragging) return;

      var dx = e.clientX - startX;
      var dy = e.clientY - startY;

      popup.style.left = (startLeft + dx) + 'px';
      popup.style.top = (startTop + dy) + 'px';
    });

    document.addEventListener('mouseup', function() {
      if (isDragging) {
        isDragging = false;
        popup.classList.remove('popup-dragging');
      }
    });
  }

  function playPopupSound() {
    // Create a visual "ding" effect since we can't play audio without user interaction
    var ding = document.createElement('div');
    ding.className = 'popup-ding';
    ding.textContent = '🔔';
    document.body.appendChild(ding);
    setTimeout(function() {
      ding.remove();
    }, 500);
  }

  function startCascade() {
    // Initial burst of 3-4 popups
    var initialCount = Math.floor(Math.random() * 2) + 3;
    for (var i = 0; i < initialCount; i++) {
      setTimeout(function() {
        spawnRandomPopup();
      }, i * 500);
    }

    // Spawn new popups periodically
    spawnInterval = setInterval(function() {
      if (activePopups.length < maxPopups && Math.random() < 0.3) {
        spawnRandomPopup();
      }
    }, 3000);
  }

  function killAllPopups() {
    isRunning = false;

    if (spawnInterval) {
      clearInterval(spawnInterval);
      spawnInterval = null;
    }

    // Animate out all popups
    activePopups.forEach(function(popup) {
      popup.classList.remove('popup-visible');
      popup.classList.add('popup-closing');
    });

    // Remove after animation
    setTimeout(function() {
      activePopups.forEach(function(popup) {
        if (popup.parentNode) {
          popup.parentNode.removeChild(popup);
        }
      });
      activePopups = [];
    }, 300);
  }

  function createKillButton() {
    var btn = document.createElement('div');
    btn.id = 'popup-killer';
    btn.className = 'window';
    btn.innerHTML =
      '<div class="title-bar">' +
        '<div class="title-bar-text">🛡️ AdAway Pro</div>' +
      '</div>' +
      '<div class="window-body popup-killer-body">' +
        '<p><b>Popups detected!</b></p>' +
        '<button id="popup-killer-btn">🚫 Block All</button>' +
      '</div>';

    container.appendChild(btn);

    var killBtn = btn.querySelector('#popup-killer-btn');
    killBtn.addEventListener('click', function() {
      killAllPopups();
      btn.querySelector('.popup-killer-body').innerHTML =
        '<p style="color: green;"><b>✓ All popups blocked!</b></p>' +
        '<p class="popup-small">You\'re welcome.</p>';

      // Fade out the killer button after a moment
      setTimeout(function() {
        btn.style.opacity = '0';
        setTimeout(function() {
          if (btn.parentNode) btn.parentNode.removeChild(btn);
        }, 500);
      }, 2000);
    });
  }

  function initPopups() {
    // Create container
    container = document.createElement('div');
    container.id = 'popup-container';
    container.className = 'win98';
    document.documentElement.appendChild(container);

    isRunning = true;

    // Add the kill button
    createKillButton();

    // Start the popup madness after a short delay
    setTimeout(startCascade, 1500);
  }

  window.web90.registerPlugin('popups', initPopups);

})();
