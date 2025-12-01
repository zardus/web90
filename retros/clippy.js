/**
 * Clippy Retro - A nostalgic Clippy assistant powered by an in-browser LLM
 *
 * Uses Transformers.js to run a small language model directly in the browser,
 * allowing users to chat with Clippy about the current page.
 */

(function() {
  'use strict';

  // Clippy image URL - using a well-known Clippy sprite
  var CLIPPY_IMAGE_URL = 'https://upload.wikimedia.org/wikipedia/en/d/db/Clippy-letter.PNG';

  // Model configuration - using a tiny model that runs fast in-browser
  var MODEL_ID = 'onnx-community/Qwen2.5-0.5B-Instruct';

  // State
  var pipeline = null;
  var tokenizer = null;
  var conversationHistory = [];
  var pageContext = '';
  var isGenerating = false;

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

    // Get main content text (limited)
    var mainEl = document.querySelector('main, article, #main, #content, .content');
    if (mainEl) {
      var mainText = mainEl.textContent.replace(/\s+/g, ' ').trim();
      if (mainText.length > 1500) {
        mainText = mainText.substring(0, 1500) + '...';
      }
      content.push('Content: ' + mainText);
    } else {
      // Fallback: get body text
      var bodyText = document.body.textContent.replace(/\s+/g, ' ').trim();
      if (bodyText.length > 1000) {
        bodyText = bodyText.substring(0, 1000) + '...';
      }
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
    return "You are Clippy, the helpful (and slightly annoying) Microsoft Office assistant from the late 1990s. " +
      "You're enthusiastic, eager to help, and occasionally make outdated tech references. " +
      "You use phrases like 'It looks like you're...', offer unsolicited tips, and are nostalgic about the 90s internet era. " +
      "Keep responses SHORT (1-3 sentences max). Be helpful but also quirky and fun. " +
      "You're currently helping a user browse a retro-styled webpage.\n\n" +
      "=== CURRENT PAGE CONTENT ===\n" + pageContext + "\n=== END PAGE CONTENT ===\n\n" +
      "Answer questions about this page or help the user in your classic Clippy way!";
  }

  /**
   * Load the LLM model with progress updates
   */
  async function loadModel(progressCallback) {
    try {
      // Dynamic import of Transformers.js from CDN
      progressCallback(5, 'Loading Transformers.js...');

      var transformers = await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.0.0');

      progressCallback(15, 'Initializing pipeline...');

      // Create text generation pipeline
      pipeline = await transformers.pipeline(
        'text-generation',
        MODEL_ID,
        {
          dtype: 'q4',  // Use 4-bit quantization for smaller size
          device: 'webgpu',  // Try WebGPU first
          progress_callback: function(progress) {
            if (progress.status === 'downloading' || progress.status === 'progress') {
              var pct = Math.round(15 + (progress.progress || 0) * 0.8);
              progressCallback(pct, 'Downloading model: ' + Math.round(progress.progress || 0) + '%');
            } else if (progress.status === 'loading') {
              progressCallback(95, 'Loading into memory...');
            }
          }
        }
      );

      progressCallback(100, 'Ready!');
      return true;
    } catch (webgpuError) {
      console.log('WebGPU not available, falling back to WASM:', webgpuError);

      try {
        // Retry with WASM backend
        var transformers = await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.0.0');

        pipeline = await transformers.pipeline(
          'text-generation',
          MODEL_ID,
          {
            dtype: 'q4',
            device: 'wasm',
            progress_callback: function(progress) {
              if (progress.status === 'downloading' || progress.status === 'progress') {
                var pct = Math.round(15 + (progress.progress || 0) * 0.8);
                progressCallback(pct, 'Downloading model: ' + Math.round(progress.progress || 0) + '%');
              }
            }
          }
        );

        progressCallback(100, 'Ready!');
        return true;
      } catch (wasmError) {
        console.error('Failed to load model:', wasmError);
        progressCallback(-1, 'Error: ' + wasmError.message);
        return false;
      }
    }
  }

  /**
   * Generate a response from Clippy
   */
  async function generateResponse(userMessage) {
    if (!pipeline || isGenerating) return null;

    isGenerating = true;

    try {
      // Build conversation with system prompt
      var messages = [
        { role: 'system', content: buildSystemPrompt() }
      ];

      // Add conversation history (keep last few turns)
      var recentHistory = conversationHistory.slice(-6);
      messages = messages.concat(recentHistory);

      // Add user message
      messages.push({ role: 'user', content: userMessage });

      // Generate response
      var output = await pipeline(messages, {
        max_new_tokens: 128,
        temperature: 0.7,
        top_p: 0.9,
        do_sample: true
      });

      // Extract assistant response
      var generatedMessages = output[0].generated_text;
      var lastMessage = generatedMessages[generatedMessages.length - 1];
      var response = lastMessage.content || '';

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

    // Set Clippy image
    var img = document.getElementById('clippy-img');
    if (img) {
      img.src = CLIPPY_IMAGE_URL;
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

    // Handle dismiss
    dismissBtn.addEventListener('click', function() {
      container.classList.add('minimized');
    });

    // Handle click on minimized Clippy to restore
    character.addEventListener('click', function() {
      if (container.classList.contains('minimized')) {
        container.classList.remove('minimized');
      }
    });

    // Handle chat button
    chatBtn.addEventListener('click', async function() {
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
        addMessage("I'm ready to help! Ask me anything about this page, or just chat! 📎", 'clippy');
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

      // Show typing indicator
      var typingMsg = addMessage('', 'clippy');
      typingMsg.classList.add('clippy-msg-typing');
      typingMsg.innerHTML = '<span class="clippy-thinking">Thinking</span>';

      var response = await generateResponse(text);

      // Replace typing with response
      typingMsg.classList.remove('clippy-msg-typing');
      typingMsg.textContent = response || "Hmm, I seem to have lost my train of thought!";
    }

    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });
  }

  // Register as a web90 plugin
  if (window.web90) {
    window.web90.registerPlugin('clippy', initClippy);
  }

})();
