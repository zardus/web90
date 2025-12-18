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

  // ============================================
  // Toolbar Action Handlers
  // ============================================

  var SEARCH_ENGINES = {
    askjeeves: 'https://www.ask.com/web?q=',
    yahoo: 'https://search.yahoo.com/search?p=',
    google: 'https://www.google.com/search?q=',
    bonzi: 'https://www.bing.com/search?q=', // Bonzi used to redirect to random adware searches
    mywebsearch: 'https://www.mywebsearch.com/jsp/GGmain.jsp?searchfor=',
    limewire: 'https://archive.org/search?query=',
    aol: 'https://search.aol.com/aol/search?q='
  };

  function handleSearch(toolbarId, query) {
    if (!query.trim()) return;
    var searchUrl = SEARCH_ENGINES[toolbarId];
    if (searchUrl) {
      window.open(searchUrl + encodeURIComponent(query), '_blank');
    }
  }

  function enableMouseTrail(style) {
    // Load mouse-trail retro dynamically and set the style
    var web90 = window.web90;
    if (!web90) return;

    // Set the trail style parameter
    web90.params.set('trail-style', style);

    // Load the mouse trail resources
    var mouseTrailRetro = web90.RETROS.find(function(r) { return r.name === 'mouse-trail'; });
    if (mouseTrailRetro) {
      web90.loadRetroResources(mouseTrailRetro).then(function(initFn) {
        if (initFn) initFn();
      });
    }
  }

  function showToolbarPopup(title, content, icon) {
    var existingPopup = document.querySelector('.toolbar-action-popup');
    if (existingPopup) existingPopup.remove();

    var popup = document.createElement('div');
    popup.className = 'toolbar-action-popup win98';
    popup.innerHTML =
      '<div class="window">' +
        '<div class="title-bar">' +
          '<div class="title-bar-text">' + (icon ? icon + ' ' : '') + title + '</div>' +
          '<div class="title-bar-controls">' +
            '<button aria-label="Close" class="popup-close-btn"></button>' +
          '</div>' +
        '</div>' +
        '<div class="window-body" style="padding: 12px;">' + content + '</div>' +
      '</div>';

    container.appendChild(popup);

    // Position popup near center-top
    popup.style.position = 'fixed';
    popup.style.top = '120px';
    popup.style.left = '50%';
    popup.style.transform = 'translateX(-50%)';
    popup.style.zIndex = '100000';

    popup.querySelector('.popup-close-btn').addEventListener('click', function() {
      popup.remove();
    });

    // Auto-close after 10 seconds
    setTimeout(function() {
      if (popup.parentNode) popup.remove();
    }, 10000);

    return popup;
  }

  function showWeatherPopup() {
    var conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rainy', 'Stormy', 'Snowy', 'Foggy', 'Windy'];
    var icons = ['☀️', '⛅', '☁️', '🌧️', '⛈️', '🌨️', '🌫️', '💨'];
    var temp = Math.floor(Math.random() * 60) + 30; // 30-90°F
    var idx = Math.floor(Math.random() * conditions.length);

    var content =
      '<div style="text-align: center; font-family: Tahoma, sans-serif;">' +
        '<div style="font-size: 48px;">' + icons[idx] + '</div>' +
        '<div style="font-size: 24px; font-weight: bold; margin: 8px 0;">' + temp + '°F</div>' +
        '<div style="font-size: 14px;">' + conditions[idx] + '</div>' +
        '<div style="font-size: 11px; color: #666; margin-top: 8px;">Your Local Weather</div>' +
        '<div style="margin-top: 12px; font-size: 10px; color: #999;">Sponsored by WeatherBug</div>' +
      '</div>';

    showToolbarPopup('WeatherBug Forecast', content, '🐛');
  }

  function showGatorDeals() {
    var deals = [
      { item: 'FREE iPod Nano!!!', price: 'CLICK HERE', icon: '🎵' },
      { item: 'FREE Ringtones!', price: 'Download Now', icon: '📱' },
      { item: 'You Won $1,000,000!', price: 'Claim Prize', icon: '💰' },
      { item: 'Work From Home $$$', price: '$500/day', icon: '🏠' },
      { item: 'Win a FREE Cruise!', price: 'Enter Now', icon: '🚢' },
      { item: 'Lose Weight FAST!', price: 'Try Now', icon: '⚖️' }
    ];

    var deal = deals[Math.floor(Math.random() * deals.length)];

    var content =
      '<div style="text-align: center; font-family: Tahoma, sans-serif;">' +
        '<div style="font-size: 32px;">' + deal.icon + '</div>' +
        '<div style="font-size: 16px; font-weight: bold; color: #ff0000; margin: 8px 0;">' +
          '★ SPECIAL OFFER ★' +
        '</div>' +
        '<div style="font-size: 14px; margin: 8px 0;">' + deal.item + '</div>' +
        '<div style="font-size: 18px; font-weight: bold; color: #00aa00;">' + deal.price + '</div>' +
        '<button style="margin-top: 12px; padding: 4px 16px; cursor: pointer;" onclick="alert(\'Just kidding! This is web90 nostalgia.\')">GET IT NOW!</button>' +
        '<div style="font-size: 9px; color: #999; margin-top: 8px;">Powered by Gator eWallet</div>' +
      '</div>';

    showToolbarPopup('Hot Deals!', content, '🐊');
  }

  function showRealPlayerDownload() {
    var content =
      '<div style="font-family: Tahoma, sans-serif; font-size: 11px;">' +
        '<p style="margin: 0 0 8px 0;"><b>RealPlayer detected media on this page!</b></p>' +
        '<div style="background: #f0f0f0; border: 1px inset; padding: 8px; margin: 8px 0;">' +
          '<div>📹 video_final_FINAL_v2.rm</div>' +
          '<div style="color: #666;">Size: 14.2 MB | Duration: 3:42</div>' +
        '</div>' +
        '<div style="display: flex; gap: 8px; justify-content: center; margin-top: 12px;">' +
          '<button onclick="alert(\'Buffering... Buffering... (Remember RealPlayer?)\')">▶ Download</button>' +
          '<button onclick="alert(\'Converting to .rm format...\')">🔄 Convert</button>' +
        '</div>' +
        '<div style="font-size: 9px; color: #666; margin-top: 12px; text-align: center;">RealPlayer Cloud - Your media, everywhere</div>' +
      '</div>';

    showToolbarPopup('RealPlayer Downloader', content, '▶️');
  }

  function showLimeWireResults(query) {
    if (!query.trim()) {
      query = 'linkin_park_in_the_end';
    }

    var fakeFiles = [
      { name: query.replace(/\s+/g, '_') + '.mp3', size: '3.2 MB', seeds: Math.floor(Math.random() * 1000) },
      { name: query.replace(/\s+/g, '_') + '_FULL_ALBUM.zip', size: '89.4 MB', seeds: Math.floor(Math.random() * 500) },
      { name: query.replace(/\s+/g, '_') + '_(definitely_not_a_virus).exe', size: '12.1 KB', seeds: Math.floor(Math.random() * 2000) },
      { name: 'system32_' + query.replace(/\s+/g, '_') + '.exe', size: '1.2 MB', seeds: 1337 }
    ];

    var filesHtml = fakeFiles.map(function(f) {
      return '<div style="display: flex; justify-content: space-between; padding: 4px; border-bottom: 1px solid #ccc;">' +
        '<span>🎵 ' + f.name + '</span>' +
        '<span style="color: #666;">' + f.size + ' | ' + f.seeds + ' seeds</span>' +
      '</div>';
    }).join('');

    var content =
      '<div style="font-family: Tahoma, sans-serif; font-size: 11px;">' +
        '<p style="margin: 0 0 8px 0;"><b>Search results for: "' + query + '"</b></p>' +
        '<div style="background: #fff; border: 1px inset; max-height: 120px; overflow-y: auto;">' +
          filesHtml +
        '</div>' +
        '<div style="margin-top: 8px; text-align: center;">' +
          '<button onclick="alert(\'Download starting... WARNING: File may contain malware! (Just kidding, this is web90)\')">📥 Download Selected</button>' +
        '</div>' +
        '<div style="font-size: 9px; color: #ff0000; margin-top: 8px; text-align: center;">⚠️ Downloading copyrighted material is illegal!</div>' +
      '</div>';

    showToolbarPopup('LimeWire - P2P File Sharing', content, '🍋');
  }

  function showAOLMail() {
    var subjects = [
      'FW: FW: FW: HILARIOUS!!1!',
      'You have been selected!!!',
      'Urgent: Claim your prize now!',
      'RE: That thing we discussed',
      'FREE AOL HOURS - ACT NOW',
      'Your horoscope for today'
    ];

    var mailHtml = subjects.map(function(s, i) {
      return '<div style="display: flex; gap: 8px; padding: 4px; border-bottom: 1px solid #ccc; ' + (i === 0 ? 'font-weight: bold;' : '') + '">' +
        '<span>📧</span>' +
        '<span style="flex: 1;">' + s + '</span>' +
      '</div>';
    }).join('');

    var content =
      '<div style="font-family: Tahoma, sans-serif; font-size: 11px;">' +
        '<div style="text-align: center; margin-bottom: 8px;">' +
          '<span style="font-size: 18px;">📬</span>' +
          '<span style="font-size: 14px; font-weight: bold;"> You\'ve Got Mail!</span>' +
        '</div>' +
        '<div style="background: #fff; border: 1px inset; max-height: 120px; overflow-y: auto;">' +
          mailHtml +
        '</div>' +
        '<div style="margin-top: 8px; text-align: center; display: flex; gap: 8px; justify-content: center;">' +
          '<button onclick="alert(\'Opening AOL Desktop...\')">📥 Read Mail</button>' +
          '<button onclick="alert(\'✉️ New message composed!\')">✏️ Compose</button>' +
        '</div>' +
      '</div>';

    showToolbarPopup('AOL Mail', content, '📧');

    // Play the classic sound (if we had audio)
    try {
      var utterance = new SpeechSynthesisUtterance("You've got mail!");
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      // Speech synthesis not available
    }
  }

  function applyHotbarSkin(color) {
    // Create or update a style element for the skin
    var styleId = 'hotbar-skin-style';
    var style = document.getElementById(styleId);
    if (!style) {
      style = document.createElement('style');
      style.id = styleId;
      document.head.appendChild(style);
    }

    // Apply color tint to the page
    style.textContent =
      'body { background-color: ' + color + ' !important; }' +
      'a { color: ' + color + ' !important; }' +
      'h1, h2, h3 { text-shadow: 2px 2px 0 ' + color + '; }';

    showToolbarPopup('Hotbar Skin Applied!',
      '<div style="text-align: center;">' +
        '<div style="width: 50px; height: 50px; background: ' + color + '; margin: 8px auto; border: 2px outset;"></div>' +
        '<p style="margin: 8px 0;">Your new skin color has been applied!</p>' +
        '<button onclick="document.getElementById(\'hotbar-skin-style\').remove(); this.closest(\'.toolbar-action-popup\').remove();">Remove Skin</button>' +
      '</div>',
      '🔥');
  }

  function handleToolbarButtonClick(toolbarId, btnLabel) {
    switch (toolbarId) {
      case 'cursormania':
        if (btnLabel === 'New' || btnLabel === 'Popular') {
          enableMouseTrail('sparkles');
        } else if (btnLabel === 'Holiday') {
          enableMouseTrail('snow');
        }
        break;

      case 'cometcursor':
        if (btnLabel === 'Cursors' || btnLabel === 'Trails') {
          enableMouseTrail('ghost');
        } else if (btnLabel === 'Themes') {
          enableMouseTrail('neon');
        }
        break;

      case 'weatherbug':
        showWeatherPopup();
        break;

      case 'gator':
        showGatorDeals();
        break;

      case 'realplayer':
        showRealPlayerDownload();
        break;

      case 'aol':
        if (btnLabel === 'Mail' || btnLabel === 'AIM') {
          showAOLMail();
        } else if (btnLabel === 'Home') {
          window.open('https://www.aol.com', '_blank');
        }
        break;

      case 'yahoo':
        if (btnLabel === 'Mail') {
          window.open('https://mail.yahoo.com', '_blank');
        } else if (btnLabel === 'News') {
          window.open('https://news.yahoo.com', '_blank');
        }
        break;

      case 'google':
        if (btnLabel === 'PageRank') {
          var pr = Math.floor(Math.random() * 10) + 1;
          showToolbarPopup('PageRank', '<div style="text-align: center;"><div style="font-size: 36px; color: #34a853;">PR ' + pr + '/10</div><p>This page has a PageRank of ' + pr + '!</p></div>', '📊');
        }
        break;

      case 'bonzi':
        if (btnLabel === 'Talk') {
          try {
            var phrases = [
              "Hello! I'm Bonzi, your personal assistant!",
              "Would you like me to search the web for you?",
              "Let me sing you a song! La la la!",
              "I can help you send email!",
              "Expand dong!"
            ];
            var phrase = phrases[Math.floor(Math.random() * phrases.length)];
            var utterance = new SpeechSynthesisUtterance(phrase);
            utterance.rate = 0.8;
            utterance.pitch = 1.5;
            window.speechSynthesis.speak(utterance);
          } catch (e) {}
        } else if (btnLabel === 'Jokes') {
          var jokes = [
            "Why did the computer go to the doctor? Because it had a virus!",
            "What do you call a computer that sings? A-Dell!",
            "Why was the computer cold? It left its Windows open!"
          ];
          showToolbarPopup('Bonzi Joke Time!', '<div style="text-align: center;">🦍<p>' + jokes[Math.floor(Math.random() * jokes.length)] + '</p></div>', '🦍');
        } else if (btnLabel === 'Songs') {
          try {
            var utterance = new SpeechSynthesisUtterance("Daisy, Daisy, give me your answer do!");
            utterance.rate = 0.7;
            utterance.pitch = 1.3;
            window.speechSynthesis.speak(utterance);
          } catch (e) {}
        }
        break;

      case 'limewire':
        if (btnLabel === 'Music' || btnLabel === 'Video' || btnLabel === 'Images') {
          showLimeWireResults(btnLabel.toLowerCase() + ' downloads free');
        } else if (btnLabel === 'Library') {
          showToolbarPopup('LimeWire Library', '<div style="text-align: center;"><p>📁 Your library is empty!</p><p style="font-size: 10px;">Start downloading to build your collection.</p></div>', '🍋');
        }
        break;

      case 'mywebsearch':
        if (btnLabel === 'Smileys') {
          showToolbarPopup('FREE Smileys!', '<div style="text-align: center; font-size: 32px;">😀 😎 🎉 💯 🔥 💖 ✨ 🌈</div><p style="text-align: center; font-size: 11px;">Click to copy to clipboard!</p>', '😊');
        } else if (btnLabel === 'Screens') {
          showToolbarPopup('FREE Screensavers!', '<div style="text-align: center;"><p>🖥️ Amazing 3D screensavers!</p><button onclick="alert(\'Installing 3D Pipes screensaver...\')">Download Now</button></div>', '🖼️');
        } else if (btnLabel === 'Games') {
          showToolbarPopup('FREE Games!', '<div style="text-align: center;"><p>🎮 Play games now!</p><ul style="list-style: none; padding: 0;"><li>🃏 Solitaire Deluxe</li><li>💎 Bejeweled Clone</li><li>🐍 Snake 3D</li></ul></div>', '🎮');
        }
        break;

      case 'askjeeves':
        if (btnLabel === 'Trivia') {
          var trivia = [
            "The first web browser was called WorldWideWeb!",
            "The @ symbol was chosen for email because it was rarely used!",
            "The first domain ever registered was Symbolics.com in 1985!",
            "The first YouTube video was uploaded on April 23, 2005!"
          ];
          showToolbarPopup('Daily Trivia', '<div style="text-align: center;"><p>🎯 ' + trivia[Math.floor(Math.random() * trivia.length)] + '</p></div>', '❓');
        } else if (btnLabel === 'Weather') {
          showWeatherPopup();
        }
        break;

      default:
        // Generic button handler - show a popup
        showToolbarPopup(toolbarId.charAt(0).toUpperCase() + toolbarId.slice(1),
          '<div style="text-align: center;"><p>Feature: ' + btnLabel + '</p><p style="font-size: 10px; color: #666;">This would have done something in 2003!</p></div>',
          '📌');
    }
  }

  function createToolbar(toolbarDef) {
    var toolbar = document.createElement('div');
    toolbar.className = 'browser-toolbar toolbar-' + toolbarDef.id;
    toolbar.id = 'toolbar-' + toolbarDef.id;

    var content = document.createElement('div');
    content.className = 'toolbar-content';
    content.innerHTML = toolbarDef.content();

    // Wire up search functionality
    var searchInput = content.querySelector('.toolbar-search-input');
    var searchBtn = content.querySelector('.toolbar-search-btn');

    if (searchInput && searchBtn) {
      searchBtn.addEventListener('click', function() {
        handleSearch(toolbarDef.id, searchInput.value);
      });
      searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          handleSearch(toolbarDef.id, searchInput.value);
        }
      });
    }

    // Wire up button clicks
    content.querySelectorAll('.toolbar-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var label = btn.querySelector('.toolbar-btn-label');
        var labelText = label ? label.textContent : '';
        handleToolbarButtonClick(toolbarDef.id, labelText);
      });
    });

    // Wire up Cursor Mania cursor options
    if (toolbarDef.id === 'cursormania') {
      content.querySelectorAll('.toolbar-cursor-option').forEach(function(opt, idx) {
        opt.addEventListener('click', function() {
          var styles = ['sparkles', 'rainbow', 'stars'];
          enableMouseTrail(styles[idx] || 'sparkles');
        });
      });
    }

    // Wire up Hotbar skin dots
    if (toolbarDef.id === 'hotbar') {
      content.querySelectorAll('.toolbar-skin-dot').forEach(function(dot) {
        dot.addEventListener('click', function() {
          var color = dot.style.background || dot.style.backgroundColor;
          applyHotbarSkin(color);
        });
      });
    }

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
