/**
 * News Ticker - Breaking news style scrolling ticker
 * Classic early 2000s news ticker effect at the bottom of the page
 */

(function() {
  'use strict';

  // Configuration constants
  var DUPLICATION_FACTOR = 2; // Duplicate news items for seamless loop
  var SCROLL_SPEED = 50; // pixels per second
  
  // Default news items if none configured
  var DEFAULT_NEWS = [
    '🔥 BREAKING: Y2K bug still not fixed!',
    '📰 Scientists discover new GeoCities page still under construction',
    '💾 Internet Explorer 6 declared "best browser ever"',
    '⚡ Flash Player required to view this message',
    '🎵 MIDI files making a comeback, experts say',
    '📞 AOL reports "You\'ve Got Mail" still getting clicks',
    '🖼️ Animated GIFs reach all-time high popularity',
    '💿 CD-ROMs now available in amazing 700MB capacity!',
    '🔊 RealPlayer buffer: 99%... 98%... 99%...',
    '⭐ Web rings: The future of internet navigation',
    '🎨 Comic Sans font usage up 400% this year',
    '📱 Nokia 3310: Indestructible phone turns 25 years old',
    '🕹️ New study: Video games don\'t cause violence, lag does',
    '💻 Floppy disk saves: Revolutionary 1.44MB storage',
    '📺 Welcome to the World Wide Web!',
  ];

  function init() {
    var config = window.WEB90_CONFIG || {};
    var newsItems = config.newsTickerItems || DEFAULT_NEWS;
    
    // Create ticker container
    var tickerContainer = document.createElement('div');
    tickerContainer.id = 'news-ticker';
    tickerContainer.className = 'news-ticker-container';
    
    // Create inner ticker element
    var ticker = document.createElement('div');
    ticker.className = 'news-ticker';
    
    // Create breaking news label
    var label = document.createElement('div');
    label.className = 'news-ticker-label';
    label.textContent = 'BREAKING NEWS';
    
    // Create scrolling content
    var content = document.createElement('div');
    content.className = 'news-ticker-content';
    
    // Duplicate news items to create seamless loop
    var allNews = newsItems.concat(newsItems);
    
    // Build news items HTML
    allNews.forEach(function(item, index) {
      var newsItem = document.createElement('span');
      newsItem.className = 'news-item';
      newsItem.textContent = item;
      content.appendChild(newsItem);
      
      // Add separator between items
      if (index < allNews.length - 1) {
        var separator = document.createElement('span');
        separator.className = 'news-separator';
        separator.textContent = ' • ';
        content.appendChild(separator);
      }
    });
    
    ticker.appendChild(label);
    ticker.appendChild(content);
    tickerContainer.appendChild(ticker);
    
    // Add to page
    document.body.appendChild(tickerContainer);
    
    // Start animation
    setTimeout(function() {
      content.classList.add('scrolling');
    }, 100);
    
    // Calculate animation duration based on content width
    // Longer content = slower scroll for readability
    var updateAnimationDuration = function() {
      var contentWidth = content.scrollWidth / DUPLICATION_FACTOR;
      var duration = contentWidth / SCROLL_SPEED;
      content.style.animationDuration = duration + 's';
    };
    
    // Update duration after fonts load
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(updateAnimationDuration);
    } else {
      setTimeout(updateAnimationDuration, 500);
    }
    
    // Handle window resize
    var resizeTimer;
    window.addEventListener('resize', function() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(updateAnimationDuration, 250);
    });
  }

  // Register the plugin
  if (window.web90 && window.web90.registerPlugin) {
    window.web90.registerPlugin('news-ticker', init);
  } else {
    // Fallback if called directly
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }
})();
