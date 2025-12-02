/**
 * Cascade Virus Theme Module
 * Simulates the classic DOS Cascade virus effect where text
 * characters fall from the screen and pile up at the bottom.
 */

(function() {
  'use strict';

  var web90 = window.web90;

  // Configuration
  var FALL_INTERVAL = 150;       // ms between each character starting to fall
  var GRAVITY = 0.5;             // acceleration
  var TERMINAL_VELOCITY = 12;    // max fall speed

  var container;
  var fallingChars = [];
  var landedChars = [];
  var pendingChars = [];
  var fallTimer = null;
  var animationId = null;
  var isRunning = false;
  var pageHeight;

  function FallingChar(charInfo) {
    this.char = charInfo.char;
    this.x = charInfo.x;
    this.y = charInfo.y;
    this.width = charInfo.width;
    this.height = charInfo.height;
    this.vy = 0;
    this.rotation = 0;
    this.rotationSpeed = (Math.random() - 0.5) * 8; // random spin: -4 to +4 degrees per frame
    this.landed = false;

    // Create DOM element by cloning style from original
    this.el = document.createElement('span');
    this.el.textContent = this.char;
    this.el.style.cssText = 'position:absolute;left:' + this.x + 'px;top:' + this.y + 'px;' +
      'margin:0;padding:0;line-height:1;pointer-events:none;white-space:pre;' +
      'font-size:' + charInfo.fontSize + 'px;' +
      'font-family:' + charInfo.fontFamily + ';' +
      'font-weight:' + charInfo.fontWeight + ';' +
      'color:' + charInfo.color + ';';
    container.appendChild(this.el);
  }

  FallingChar.prototype.getBottom = function() {
    return this.y + this.height;
  };

  FallingChar.prototype.getRight = function() {
    return this.x + this.width;
  };

  FallingChar.prototype.update = function() {
    if (this.landed) return true;

    // Apply gravity
    this.vy += GRAVITY;
    if (this.vy > TERMINAL_VELOCITY) this.vy = TERMINAL_VELOCITY;

    // Apply rotation
    this.rotation += this.rotationSpeed;

    var newY = this.y + this.vy;
    var newBottom = newY + this.height;

    // Use a tighter height for stacking (glyphs don't fill the full line-height)
    var stackHeight = this.height * 0.4;

    // Check collision with bottom of page
    var floorY = pageHeight - stackHeight;
    if (newY >= floorY) {
      this.y = floorY;
      this.landed = true;
      this.el.style.top = this.y + 'px';
      return true;
    }

    // Check collision with landed characters
    var collisionY = null;

    for (var i = 0; i < landedChars.length; i++) {
      var other = landedChars[i];

      // Check horizontal overlap
      var horizOverlap = !(this.getRight() <= other.x || this.x >= other.getRight());

      if (horizOverlap) {
        var otherTop = other.y;

        // If our bottom would pass their top, and we're currently above them
        if (newY + stackHeight >= otherTop && this.y + stackHeight <= otherTop) {
          var landY = otherTop - stackHeight;
          if (collisionY === null || landY < collisionY) {
            collisionY = landY;
          }
        }
      }
    }

    if (collisionY !== null) {
      this.y = collisionY;
      this.landed = true;
      this.el.style.top = this.y + 'px';
      return true;
    }

    this.y = newY;
    this.el.style.top = this.y + 'px';
    this.el.style.transform = 'rotate(' + this.rotation + 'deg)';
    return false;
  };

  function collectAllCharacters() {
    var chars = [];

    function processElement(element) {
      if (!element) return;

      var tagName = element.tagName ? element.tagName.toLowerCase() : '';
      if (tagName === 'script' || tagName === 'style' || tagName === 'noscript') return;
      if (element.id === 'cascade-container') return;
      if (element.id === 'control-panel') return;

      var style = window.getComputedStyle ? window.getComputedStyle(element) : null;
      if (style && (style.display === 'none' || style.visibility === 'hidden')) return;

      var childNodes = element.childNodes;
      for (var i = 0; i < childNodes.length; i++) {
        var node = childNodes[i];
        if (node.nodeType === Node.TEXT_NODE) {
          var text = node.textContent;
          if (text && text.trim().length > 0) {
            var fontStyle = getComputedFontStyle(element);

            for (var j = 0; j < text.length; j++) {
              var char = text[j];
              if (char.trim().length === 0) continue;

              // Skip non-printable or problematic characters
              var code = char.charCodeAt(0);
              if (code < 32 || (code >= 0xD800 && code <= 0xDFFF)) continue;

              var pos = getCharacterPosition(node, j);
              if (pos && pos.width > 0 && pos.height > 0) {
                chars.push({
                  node: node,
                  charIndex: j,
                  char: char,
                  x: pos.x,
                  y: pos.y,
                  width: pos.width,
                  height: pos.height,
                  fontSize: fontStyle.fontSize,
                  fontFamily: fontStyle.fontFamily,
                  color: fontStyle.color,
                  fontWeight: fontStyle.fontWeight,
                  lineHeight: fontStyle.lineHeight,
                  dropped: false
                });
              }
            }
          }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          processElement(node);
        }
      }
    }

    processElement(document.body);

    // Shuffle for random order
    for (var i = chars.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = chars[i];
      chars[i] = chars[j];
      chars[j] = temp;
    }

    return chars;
  }

  function getCharacterPosition(node, charIndex) {
    var range = document.createRange();
    try {
      range.setStart(node, charIndex);
      range.setEnd(node, charIndex + 1);
      var rect = range.getBoundingClientRect();
      return {
        x: rect.left + window.scrollX,
        y: rect.top + window.scrollY,
        width: rect.width,
        height: rect.height
      };
    } catch (e) {
      return null;
    }
  }

  function getComputedFontStyle(element) {
    var style = window.getComputedStyle(element);
    return {
      fontSize: parseFloat(style.fontSize) || 16,
      fontFamily: style.fontFamily || 'monospace',
      color: style.color || '#00ff00',
      fontWeight: style.fontWeight || 'normal',
      lineHeight: style.lineHeight || 'normal'
    };
  }

  function hideCharacterInDOM(charInfo) {
    var node = charInfo.node;
    var idx = charInfo.charIndex;
    var text = node.textContent;

    try {
      var before = text.substring(0, idx);
      var char = text[idx];
      var after = text.substring(idx + 1);

      var wrapper = document.createElement('span');
      wrapper.style.visibility = 'hidden';
      wrapper.textContent = char;

      var parent = node.parentNode;
      if (!parent) return;

      var beforeNode = document.createTextNode(before);
      var afterNode = document.createTextNode(after);

      parent.insertBefore(beforeNode, node);
      parent.insertBefore(wrapper, node);
      parent.insertBefore(afterNode, node);
      parent.removeChild(node);

      // Update references for other pending chars
      for (var i = 0; i < pendingChars.length; i++) {
        var other = pendingChars[i];
        if (other.node === node) {
          if (other.charIndex < idx) {
            other.node = beforeNode;
          } else if (other.charIndex > idx) {
            other.node = afterNode;
            other.charIndex = other.charIndex - idx - 1;
          }
        }
      }
    } catch (e) {
      // Continue on error
    }
  }

  function dropNextCharacter() {
    if (!isRunning) return;

    var charInfo = null;
    for (var i = 0; i < pendingChars.length; i++) {
      if (!pendingChars[i].dropped) {
        charInfo = pendingChars[i];
        break;
      }
    }

    if (!charInfo) {
      fallTimer = null;
      return;
    }

    charInfo.dropped = true;

    // Re-measure position right before dropping (DOM may have changed since collection)
    var currentPos = getCharacterPosition(charInfo.node, charInfo.charIndex);
    if (currentPos && currentPos.width > 0 && currentPos.height > 0) {
      charInfo.x = currentPos.x;
      charInfo.y = currentPos.y;
      charInfo.width = currentPos.width;
      charInfo.height = currentPos.height;
    }

    // Verify the character is still valid (charIndex may have been corrupted)
    var text = charInfo.node.textContent;
    var actualChar = text[charInfo.charIndex];
    if (!actualChar || actualChar !== charInfo.char) {
      // Skip this character, it's been corrupted
      fallTimer = setTimeout(dropNextCharacter, FALL_INTERVAL);
      return;
    }

    var falling = new FallingChar(charInfo);
    fallingChars.push(falling);

    hideCharacterInDOM(charInfo);

    fallTimer = setTimeout(dropNextCharacter, FALL_INTERVAL);
  }

  function animate() {
    if (!isRunning) return;

    for (var i = fallingChars.length - 1; i >= 0; i--) {
      var fc = fallingChars[i];
      var landed = fc.update();

      if (landed) {
        landedChars.push(fc);
        fallingChars.splice(i, 1);
      }
    }

    animationId = requestAnimationFrame(animate);
  }

  function initCascade() {
    pageHeight = Math.max(document.documentElement.scrollHeight, window.innerHeight);

    // Create container for falling characters
    container = document.createElement('div');
    container.id = 'cascade-container';
    container.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:' + pageHeight + 'px;pointer-events:none;z-index:9999;';
    document.body.appendChild(container);

    // Collect all characters (shuffled randomly)
    pendingChars = collectAllCharacters();

    isRunning = true;

    setTimeout(function() {
      dropNextCharacter();
      animate();
    }, 1000);
  }

  window.web90.registerPlugin('cascade', initCascade);

})();
