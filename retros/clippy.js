/**
 * Clippy Retro - A nostalgic Clippy assistant powered by an in-browser LLM
 *
 * Uses Transformers.js to run a small language model directly in the browser,
 * allowing users to chat with Clippy about the current page.
 */

(function() {
  'use strict';

  // Clippy image URL - local asset
  var CLIPPY_IMAGE_URL = null; // Set dynamically from basePath

  // Model configuration - tiny instruction-tuned model, pre-converted to ONNX
  var MODEL_ID = 'onnx-community/SmolLM-135M-Instruct-ONNX';

  // State
  var worker = null;
  var conversationHistory = [];
  var pageContext = '';
  var isGenerating = false;
  var pendingResolve = null;
  var pendingOnToken = null;

  // Classic Clippy intro messages
  var INTRO_MESSAGES = [
    "It looks like you're browsing the web like it's 1999!",
    "It looks like you're trying to relive the glory days of the internet!",
    "It looks like you're experiencing PEAK web design!",
    "It looks like you're enjoying some vintage internet vibes!",
    "It looks like you're visiting a totally rad website!"
  ];

  /**
   * Extract text content from the page for LLM context
   */
  function extractPageContent() {
    var content = [];

    // Get page title
    var title = document.title || 'Untitled Page';
    content.push('Page Title: ' + title);

    // Get meta description if available
    var metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && metaDesc.content) {
      content.push('Description: ' + metaDesc.content);
    }

    // Get main headings
    var headings = document.querySelectorAll('h1, h2, h3');
    var headingTexts = [];
    headings.forEach(function(h) {
      var text = h.textContent.trim();
      if (text && text.length < 200) {
        headingTexts.push(text);
      }
    });
    if (headingTexts.length > 0) {
      content.push('Headings: ' + headingTexts.slice(0, 10).join(', '));
    }

    // Get main content text
    var mainEl = document.querySelector('main, article, #main, #content, .content');
    if (mainEl) {
      var mainText = mainEl.textContent.replace(/\s+/g, ' ').trim();
      content.push('Content: ' + mainText);
    } else {
      // Fallback: get body text
      var bodyText = document.body.textContent.replace(/\s+/g, ' ').trim();
      content.push('Content: ' + bodyText);
    }

    // Get any visible links
    var links = document.querySelectorAll('a[href]');
    var linkTexts = [];
    links.forEach(function(a) {
      var text = a.textContent.trim();
      if (text && text.length > 2 && text.length < 50 && !text.startsWith('http')) {
        linkTexts.push(text);
      }
    });
    if (linkTexts.length > 0) {
      content.push('Links: ' + linkTexts.slice(0, 15).join(', '));
    }

    return content.join('\n\n');
  }

  /**
   * Build the system prompt with Clippy persona and page context
   */
  function buildSystemPrompt() {
    return "You are Clippy, the Microsoft Office assistant from the 1990s. " +
      "You're enthusiastic and use phrases like 'It looks like you're...' " +
      "IMPORTANT: Keep responses to 1-2 sentences MAX. Be brief and punchy. " +
      "Your response will be shown directly to the user in a chat bubble - write conversationally, no formatting or meta-commentary. " +
      "You're helping a user browse this webpage:\n\n" +
      "=== PAGE CONTENT ===\n" + pageContext + "\n=== END ===\n\n" +
      "Answer questions about this page. Stay in character. 1-2 sentences only!";
  }

  /**
   * Load the LLM model in a Web Worker
   */
  async function loadModel(progressCallback) {
    return new Promise(function(resolve) {
      var basePath = window.web90 ? window.web90.config.basePath : '';
      worker = new Worker(basePath + '/retros/clippy-worker.js', { type: 'module' });

      worker.onmessage = function(e) {
        var msg = e.data;

        if (msg.type === 'progress') {
          progressCallback(msg.progress, msg.status);
        } else if (msg.type === 'loaded') {
          resolve(true);
        } else if (msg.type === 'error') {
          console.error('Worker error:', msg.error);
          progressCallback(-1, 'Error: ' + msg.error);
          resolve(false);
        } else if (msg.type === 'token') {
          if (pendingOnToken) pendingOnToken(msg.text);
        } else if (msg.type === 'done') {
          if (pendingResolve) {
            pendingResolve(msg.response);
            pendingResolve = null;
            pendingOnToken = null;
          }
        }
      };

      worker.onerror = function(err) {
        console.error('Worker error:', err);
        progressCallback(-1, 'Worker failed to load');
        resolve(false);
      };

      // Start loading the model
      worker.postMessage({ type: 'load', data: { modelId: MODEL_ID } });
    });
  }

  /**
   * Generate a response from Clippy (via Web Worker)
   */
  async function generateResponse(userMessage, onToken) {
    if (!worker || isGenerating) return null;

    isGenerating = true;

    try {
      // Build conversation with system prompt
      var messages = [
        { role: 'system', content: buildSystemPrompt() }
      ];

      // Add conversation history (keep last few turns)
      var recentHistory = conversationHistory.slice(-4);
      messages = messages.concat(recentHistory);

      // Add user message
      messages.push({ role: 'user', content: userMessage });

      // Log the full prompt to console for debugging
      console.log('=== CLIPPY PROMPT ===');
      messages.forEach(function(msg) {
        console.log('[' + msg.role.toUpperCase() + ']:', msg.content);
      });
      console.log('=====================');

      // Send to worker and wait for response
      var response = await new Promise(function(resolve) {
        pendingResolve = resolve;
        pendingOnToken = onToken;
        worker.postMessage({ type: 'generate', data: { messages: messages } });
      });

      console.log('[CLIPPY RESPONSE]:', response);

      // Update conversation history
      conversationHistory.push({ role: 'user', content: userMessage });
      conversationHistory.push({ role: 'assistant', content: response });

      return response;
    } catch (error) {
      console.error('Generation error:', error);
      return "Oops! It looks like my brain got a bit scrambled. Try asking again!";
    } finally {
      isGenerating = false;
    }
  }

  /**
   * Load HTML template and append to document
   */
  function loadTemplate() {
    var basePath = window.web90 ? window.web90.config.basePath : '';
    return fetch(basePath + '/clippy.html')
      .then(function(r) { return r.text(); })
      .then(function(html) {
        var container = document.createElement('div');
        container.innerHTML = html;
        document.documentElement.appendChild(container.firstElementChild);
      });
  }

  /**
   * Initialize Clippy UI and behavior
   */
  function initClippy() {
    // Load the template first, then initialize
    loadTemplate().then(function() {
      setupClippy();
    });
  }

  /**
   * Setup Clippy after template is loaded
   */
  function setupClippy() {
    var container = document.getElementById('clippy-container');
    if (!container) return;

    // Extract page content for context
    pageContext = extractPageContent();

    // Set Clippy image from local asset
    var basePath = window.web90 ? window.web90.config.basePath : '';
    var img = document.getElementById('clippy-img');
    if (img) {
      img.src = basePath + '/clippy.png';
      img.onerror = function() {
        // Fallback to a simple emoji representation
        img.style.display = 'none';
        var character = document.getElementById('clippy-character');
        character.innerHTML = '<div style="font-size:80px;text-align:center;">📎</div>';
      };
    }

    // Set random intro message
    var messageEl = document.getElementById('clippy-message');
    if (messageEl) {
      messageEl.textContent = INTRO_MESSAGES[Math.floor(Math.random() * INTRO_MESSAGES.length)];
    }

    // Show container with animation
    container.style.display = 'block';

    // Get UI elements
    var chatBtn = document.getElementById('clippy-chat-btn');
    var dismissBtn = document.getElementById('clippy-dismiss-btn');
    var introSection = document.getElementById('clippy-intro');
    var buttonsSection = document.getElementById('clippy-buttons');
    var loadingSection = document.getElementById('clippy-loading');
    var chatSection = document.getElementById('clippy-chat');
    var progressBar = document.getElementById('clippy-progress-bar');
    var progressText = document.getElementById('clippy-progress-text');
    var chatInput = document.getElementById('clippy-chat-input');
    var sendBtn = document.getElementById('clippy-send-btn');
    var messagesContainer = document.getElementById('clippy-chat-messages');
    var character = document.getElementById('clippy-character');

    // Smooth hide helper
    function hideClippy() {
      container.classList.add('hiding');
      setTimeout(function() {
        container.style.display = 'none';
        container.classList.remove('hiding');
      }, 300);
    }

    // Handle dismiss
    dismissBtn.addEventListener('click', hideClippy);

    // Handle click on minimized Clippy to restore
    character.addEventListener('click', function() {
      if (container.classList.contains('minimized')) {
        container.classList.remove('minimized');
      }
    });

    // Handle chat button
    chatBtn.addEventListener('click', async function() {
      // Check if user has previously confirmed download
      var hasConfirmed = localStorage.getItem('clippy-model-confirmed');

      if (!hasConfirmed) {
        // Show confirmation dialog for download
        var confirmed = confirm(
          "To chat with Clippy, I need to download a small AI model (~180MB).\n\n" +
          "This only happens once - it'll be cached for future visits.\n\n" +
          "Download now?"
        );
        if (!confirmed) {
          return;
        }
        localStorage.setItem('clippy-model-confirmed', 'true');
      }

      introSection.style.display = 'none';
      buttonsSection.style.display = 'none';
      loadingSection.style.display = 'block';

      var success = await loadModel(function(percent, status) {
        if (percent >= 0) {
          progressBar.style.width = percent + '%';
          progressText.textContent = status;
        } else {
          progressText.textContent = status;
          progressText.style.color = 'red';
        }
      });

      if (success) {
        loadingSection.style.display = 'none';
        chatSection.style.display = 'block';

        // Add initial Clippy greeting
        addMessage("I'm ready to help! Ask me anything about this page, or just chat!", 'clippy');
        chatInput.focus();
      } else {
        // Show error state with retry option
        progressText.innerHTML = 'Failed to load. <a href="#" id="clippy-retry">Retry?</a>';
        document.getElementById('clippy-retry').addEventListener('click', function(e) {
          e.preventDefault();
          progressBar.style.width = '0%';
          progressText.style.color = '';
          chatBtn.click();
        });
      }
    });

    // Add message to chat
    function addMessage(text, sender) {
      var msg = document.createElement('div');
      msg.className = 'clippy-msg clippy-msg-' + sender;
      msg.textContent = text;
      messagesContainer.appendChild(msg);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
      return msg;
    }

    // Handle sending messages
    async function sendMessage() {
      var text = chatInput.value.trim();
      if (!text || isGenerating) return;

      chatInput.value = '';
      addMessage(text, 'user');

      // Show bouncing dots indicator
      var typingMsg = addMessage('', 'clippy');
      typingMsg.classList.add('clippy-msg-typing');
      typingMsg.innerHTML = '<span class="clippy-dots"><span class="clippy-dot"></span><span class="clippy-dot"></span><span class="clippy-dot"></span></span>';

      // Stream tokens with bouncing dots at the end
      var dotsHtml = '<span class="clippy-dots"><span class="clippy-dot"></span><span class="clippy-dot"></span><span class="clippy-dot"></span></span>';
      var response = await generateResponse(text, function(fullText) {
        typingMsg.innerHTML = fullText + ' ' + dotsHtml;
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      });

      // Final update - remove dots, show complete response
      typingMsg.classList.remove('clippy-msg-typing');
      typingMsg.textContent = response || "Hmm, I seem to have lost my train of thought!";
    }

    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });

    // Handle close button in chat
    var closeBtn = document.getElementById('clippy-close-btn');
    closeBtn.addEventListener('click', hideClippy);
  }

  // Register as a web90 plugin
  if (window.web90) {
    window.web90.registerPlugin('clippy', initClippy);
  }

})();
