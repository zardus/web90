/**
 * AOL Dialup Connection Module
 * Classic Windows 3.1 era AOL connection sequence
 *
 * Shows the iconic dialup dialog with Running Man before revealing the page.
 * Uses 98.css for authentic Windows styling.
 */

(function() {
  'use strict';

  var web90 = window.web90;
  var createElement = web90.createElement;
  var randomFrom = web90.randomFrom;

  // Classic modem speeds
  var MODEM_SPEEDS = ['14.4', '28.8', '33.6', '56'];

  // Connection sequence steps with realistic timing
  var CONNECTION_STEPS = [
    { panel: 0, status: 'Initializing modem...', duration: 500 },
    { panel: 0, status: 'Detecting COM port...', duration: 400 },
    { panel: 0, status: 'Dialing 1-800-AOL-1234...', duration: 900, modem: true },
    { panel: 0, status: 'Establishing connection...', duration: 700, modem: true },
    { panel: 0, status: function() { return 'Connected at ' + randomFrom(MODEM_SPEEDS) + ' Kbps'; }, duration: 300, complete: true },
    { panel: 1, status: 'Sending username...', duration: 400 },
    { panel: 1, status: 'Verifying password...', duration: 500 },
    { panel: 1, status: 'Authenticating...', duration: 400 },
    { panel: 1, status: 'Authentication successful', duration: 300, complete: true },
    { panel: 2, status: 'Connecting to AOL network...', duration: 500 },
    { panel: 2, status: 'Checking for new mail...', duration: 400 },
    { panel: 2, status: 'Loading your profile...', duration: 300 },
    { panel: 2, status: 'Welcome to AOL!', duration: 300, complete: true }
  ];

  var currentStep = 0;
  var overlay = null;
  var panels = [];
  var progressBar = null;
  var connectionContent = null;
  var successScreen = null;

  function createDialogHTML() {
    return '\
      <div class="window aol-window">\
        <div class="title-bar">\
          <div class="title-bar-text">\
            <span class="aol-title-icon">📶</span> AOL Sign On\
          </div>\
          <div class="title-bar-controls">\
            <button aria-label="Minimize"></button>\
            <button aria-label="Maximize"></button>\
            <button aria-label="Close"></button>\
          </div>\
        </div>\
        <div class="window-body aol-body">\
          <div class="aol-connection-content">\
            <div class="sunken-panel aol-header">\
              <div class="aol-running-man">\
                <div class="aol-running-man-figure">🏃</div>\
              </div>\
              <div class="aol-logo-container">\
                <div class="aol-logo">AOL</div>\
                <div class="aol-logo-text">America Online</div>\
              </div>\
            </div>\
            <div class="aol-panels">\
              <div class="sunken-panel aol-panel waiting" data-panel="0">\
                <div class="aol-panel-icon">📞</div>\
                <div class="aol-panel-content">\
                  <div class="aol-panel-title">Network</div>\
                  <div class="aol-panel-status">Waiting...</div>\
                </div>\
              </div>\
              <div class="sunken-panel aol-panel waiting" data-panel="1">\
                <div class="aol-panel-icon">🔐</div>\
                <div class="aol-panel-content">\
                  <div class="aol-panel-title">Sign On</div>\
                  <div class="aol-panel-status">Waiting...</div>\
                </div>\
              </div>\
              <div class="sunken-panel aol-panel waiting" data-panel="2">\
                <div class="aol-panel-icon">🌐</div>\
                <div class="aol-panel-content">\
                  <div class="aol-panel-title">Services</div>\
                  <div class="aol-panel-status">Waiting...</div>\
                </div>\
              </div>\
            </div>\
            <div class="aol-progress-section">\
              <div class="aol-progress-container">\
                <div class="aol-progress-bar"></div>\
              </div>\
            </div>\
            <div class="aol-buttons">\
              <button>Setup</button>\
              <button>Help</button>\
              <button class="aol-btn-cancel">Cancel</button>\
            </div>\
          </div>\
          <div class="aol-success">\
            <div class="aol-success-icon">📬</div>\
            <div class="aol-success-text">Welcome!</div>\
            <div class="aol-success-subtext">You\'ve Got Mail!</div>\
            <button class="aol-btn-continue">Continue</button>\
          </div>\
        </div>\
      </div>\
    ';
  }

  function initElements() {
    panels = [
      overlay.querySelector('[data-panel="0"]'),
      overlay.querySelector('[data-panel="1"]'),
      overlay.querySelector('[data-panel="2"]')
    ];
    progressBar = overlay.querySelector('.aol-progress-bar');
    connectionContent = overlay.querySelector('.aol-connection-content');
    successScreen = overlay.querySelector('.aol-success');
  }

  function updatePanel(panelIndex, status, state) {
    var panel = panels[panelIndex];
    if (!panel) return;

    panel.classList.remove('waiting', 'active', 'complete', 'error');
    panel.classList.add(state);

    var statusEl = panel.querySelector('.aol-panel-status');
    if (statusEl) {
      statusEl.textContent = status;
    }
  }

  function updateProgress(percent) {
    if (progressBar) {
      progressBar.style.width = percent + '%';
    }
  }

  function processStep() {
    if (currentStep >= CONNECTION_STEPS.length) {
      showSuccess();
      return;
    }

    var step = CONNECTION_STEPS[currentStep];
    var progress = ((currentStep + 1) / CONNECTION_STEPS.length) * 100;

    // Get status text (can be string or function)
    var statusText = typeof step.status === 'function' ? step.status() : step.status;

    // Update panel state
    var panelState = step.complete ? 'complete' : 'active';
    updatePanel(step.panel, statusText, panelState);

    // Update progress bar
    updateProgress(progress);

    currentStep++;

    // Schedule next step
    setTimeout(processStep, step.duration);
  }

  function showSuccess() {
    updateProgress(100);

    // Hide connection content, show success
    connectionContent.classList.add('hidden');
    successScreen.classList.add('visible');

    // Auto-continue after a short delay, or wait for button click
    var continueBtn = overlay.querySelector('.aol-btn-continue');
    continueBtn.addEventListener('click', hideOverlay);

    // Auto-continue after 1.5 seconds
    setTimeout(hideOverlay, 1500);
  }

  function hideOverlay() {
    overlay.classList.add('fade-out');
    setTimeout(function() {
      if (overlay && overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    }, 500);
  }

  function handleCancel() {
    // Shake the dialog as if to say "no!"
    var dialog = overlay.querySelector('.aol-window');
    dialog.classList.add('shake');
    setTimeout(function() {
      dialog.classList.remove('shake');
    }, 300);
  }

  function initAolDialup() {
    // Create overlay
    overlay = createElement('div');
    overlay.id = 'aol-dialup-overlay';
    overlay.className = 'win98';
    overlay.innerHTML = createDialogHTML();

    // Append to documentElement to avoid any transform issues
    document.documentElement.appendChild(overlay);

    // Initialize element references
    initElements();

    // Set up cancel button (doesn't actually cancel, just shakes)
    var cancelBtn = overlay.querySelector('.aol-btn-cancel');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', handleCancel);
    }

    // Close button also shakes
    var closeBtn = overlay.querySelector('[aria-label="Close"]');
    if (closeBtn) {
      closeBtn.addEventListener('click', handleCancel);
    }

    // Start the connection sequence after a brief moment
    setTimeout(function() {
      processStep();
    }, 500);
  }

  // Register the plugin
  window.web90.registerPlugin('aol-dialup', initAolDialup);

})();
