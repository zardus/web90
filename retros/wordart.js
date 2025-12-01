/**
 * WordArt Module
 * Lazy-loaded plugin for the WordArt retro effect
 *
 * This module is loaded on-demand when the wordart retro is activated.
 */

(function() {
  'use strict';

  // Get utilities from the core
  var createElement = window.web90.createElement;
  var randomFrom = window.web90.randomFrom;

  // ============================================
  // WordArt Style Definitions
  // ============================================

  var WORDART_STYLES = {
    one: { label: 'Style 1 - Outlined' },
    two: { label: 'Style 2 - Slanted' },
    three: { label: 'Style 3 - Italic Shadow' },
    four: { label: 'Style 4 - Blue Serif' },
    five: { label: 'Style 5 - 3D Purple' },
    six: { label: 'Style 6 - Silver' },
    seven: { label: 'Style 7 - Impact Blue' },
    eight: { label: 'Style 8 - Sunset' },
    nine: { label: 'Style 9 - Purple Skew' },
    ten: { label: 'Style 10 - Green Echo' },
    eleven: { label: 'Style 11 - Blue 3D' },
    twelve: { label: 'Style 12 - Teal Serif' },
    thirteen: { label: 'Style 13 - Western' },
    fourteen: { label: 'Style 14 - Pink Depth' },
    fifteen: { label: 'Style 15 - Gold' },
    sixteen: { label: 'Style 16 - Cyan Navy' },
    seventeen: { label: 'Style 17 - Striped' },
    eighteen: { label: 'Style 18 - Chrome' },
    nineteen: { label: 'Style 19 - Green 3D' },
    twenty: { label: 'Style 20 - Silver 3D' },
    twentyone: { label: 'Style 21 - Fire' },
    twentytwo: { label: 'Style 22 - Ice & Fire' }
  };

  var WORDART_STYLE_NAMES = Object.keys(WORDART_STYLES);

  // Export styles for control panel
  window.web90.WORDART_STYLES = WORDART_STYLES;
  window.web90.WORDART_STYLE_NAMES = WORDART_STYLE_NAMES;

  // ============================================
  // WordArt
  // ============================================

  function initWordArt() {
    var h1 = document.querySelector('h1');
    if (!h1) return;

    var params = new URLSearchParams(window.location.search);
    var styleParam = params.get('wordart-style');
    var selectedStyle = WORDART_STYLE_NAMES.includes(styleParam) ? styleParam : randomFrom(WORDART_STYLE_NAMES);

    var container = createElement('div');
    container.className = 'wordart-container';
    h1.classList.add('wordart');
    h1.setAttribute('data-content', h1.textContent);
    h1.parentNode.insertBefore(container, h1);
    container.appendChild(h1);
    document.body.classList.add('wordart-style-' + selectedStyle);
  }

  // Register the plugin
  window.web90.registerPlugin('wordart', initWordArt);

})();
