/**
 * Control Panel Module
 * Lazy-loaded plugin for the retro configuration UI
 *
 * This module is loaded on-demand when the control panel is needed.
 */

(function() {
  'use strict';

  // Get references from the core
  var web90 = window.web90;
  var config = web90.config;
  var createElement = web90.createElement;
  var RETROS = web90.RETROS;
  var THEMES = web90.THEMES;
  var TRAIL_STYLES = web90.TRAIL_STYLES;
  var CURSOR_STYLES = web90.CURSOR_STYLES;
  var VIZ_MODE_NAMES = web90.VIZ_MODE_NAMES;
  var params = web90.params;
  var loadRetroResources = web90.loadRetroResources;
  var generateRandomSelections = web90.generateRandomSelections;

  // ============================================
  // Control Panel State
  // ============================================

  var controlPanelInitialized = false;
  var THEME_CONTROLLED_RETROS = ['retheme', 'wordart', 'mouse-trail', 'custom-cursor', 'dividers'];

  // ============================================
  // Control Panel
  // ============================================

  function initControlPanel(retroList) {
    var panel = document.getElementById('control-panel');
    if (!panel || controlPanelInitialized) return;
    controlPanelInitialized = true;

    initRetroCheckboxes(retroList);
    initControlDropdowns(retroList);
    initDividerDropdown();
    initCustomSelects();
    initControlButtons(panel, retroList);

    if (retroList.indexOf('control-panel') !== -1) {
      panel.style.display = 'block';
    }
  }

  function initRetroCheckboxes(retroList) {
    var checkboxGrid = document.getElementById('retro-checkboxes');
    if (!checkboxGrid) return;

    RETROS.forEach(function(retro) {
      // Skip themes (controlled via theme dropdown) and dropdown-controlled retros
      if (retro.type === 'theme') return;
      if (THEME_CONTROLLED_RETROS.indexOf(retro.name) !== -1) return;

      var row = createElement('div');
      row.className = 'field-row checkbox-row';

      var checkbox = createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = 'ctrl-retro-' + retro.name;
      checkbox.checked = retroList.indexOf(retro.name) !== -1;

      var label = createElement('label');
      label.htmlFor = checkbox.id;
      label.textContent = retro.emoji + ' ' + retro.label;

      row.appendChild(checkbox);
      row.appendChild(label);
      checkboxGrid.appendChild(row);
    });
  }

  function initDropdownValue(selectEl, paramName, retroList, retroName, defaultForActive) {
    if (!selectEl) return;

    var paramValue = params.get(paramName);
    var hasRetro = retroList.indexOf(retroName) !== -1;

    if (paramValue !== null) {
      selectEl.value = paramValue;
    } else if (hasRetro) {
      selectEl.value = defaultForActive || '';
    } else {
      selectEl.value = 'none';
    }
  }

  function populateDropdown(selectEl, items, options) {
    if (!selectEl) return;
    options = options || {};

    // Add options from items object
    Object.keys(items).forEach(function(key) {
      var item = items[key];
      var option = createElement('option');
      option.value = key;
      var label = item.label || key;
      option.textContent = item.emoji ? item.emoji + ' ' + label : label;
      selectEl.appendChild(option);
    });
  }

  function initControlDropdowns(retroList) {
    var ctrlSong = document.getElementById('ctrl-song');
    var ctrlViz = document.getElementById('ctrl-viz');
    var ctrlWordart = document.getElementById('ctrl-wordart');
    var ctrlCursor = document.getElementById('ctrl-cursor');
    var ctrlTrail = document.getElementById('ctrl-trail');
    var ctrlTheme = document.getElementById('ctrl-theme');

    // Populate song options
    if (ctrlSong) {
      config.music.forEach(function(track) {
        var option = createElement('option');
        var filename = track.src.split('/').pop().replace(/\.[^.]+$/, '');
        option.value = filename;
        option.textContent = track.label;
        ctrlSong.appendChild(option);
      });
      ctrlSong.value = params.get('song') || '';
    }

    // Populate visualization options (lazy-load media-player resources first)
    if (ctrlViz) {
      var mediaPlayerRetro = RETROS.find(function(r) { return r.name === 'media-player'; });
      if (mediaPlayerRetro && mediaPlayerRetro.resources) {
        loadRetroResources(mediaPlayerRetro).then(function() {
          populateDropdown(ctrlViz, window.web90.VIZ_MODES);
          ctrlViz.value = params.get('viz') || '';
        });
      }
    }

    // Populate wordart options (lazy-load resources first)
    if (ctrlWordart) {
      var wordartRetro = RETROS.find(function(r) { return r.name === 'wordart'; });
      if (wordartRetro && wordartRetro.resources) {
        loadRetroResources(wordartRetro).then(function() {
          populateDropdown(ctrlWordart, window.web90.WORDART_STYLES);
          initDropdownValue(ctrlWordart, 'wordart-style', retroList, 'wordart', '');
        });
      }
    }

    // Populate cursor options
    populateDropdown(ctrlCursor, CURSOR_STYLES);
    initDropdownValue(ctrlCursor, 'cursor-style', retroList, 'custom-cursor', 'custom');

    // Populate trail options
    populateDropdown(ctrlTrail, TRAIL_STYLES);
    initDropdownValue(ctrlTrail, 'trail-style', retroList, 'mouse-trail', '');

    // Populate theme options
    populateDropdown(ctrlTheme, THEMES);
    initDropdownValue(ctrlTheme, 'theme', retroList, 'retheme', '');
  }

  function initCustomSelects() {
    var panel = document.getElementById('control-panel');
    if (!panel) return;

    var selects = panel.querySelectorAll('select');
    selects.forEach(function(select) {
      var isDivider = select.id === 'ctrl-divider';

      // Create wrapper for positioning
      var wrapper = createElement('div');
      wrapper.className = 'custom-select-wrapper';
      if (isDivider) wrapper.classList.add('custom-select-divider');
      select.parentNode.insertBefore(wrapper, select);
      wrapper.appendChild(select);

      // Create selected preview overlay for dividers
      var selectedPreview = null;
      if (isDivider) {
        selectedPreview = createElement('div');
        selectedPreview.className = 'custom-select-preview';
        wrapper.appendChild(selectedPreview);
      }

      // Create custom dropdown list
      var dropdown = createElement('div');
      dropdown.className = 'custom-select-dropdown';

      function rebuildOptions() {
        dropdown.innerHTML = '';
        Array.prototype.forEach.call(select.options, function(opt) {
          var item = createElement('div');
          item.className = 'custom-select-option';
          item.dataset.value = opt.value;

          // Special rendering for divider options
          if (isDivider && opt.dataset.dividerSrc) {
            var preview = createElement('div');
            preview.className = 'divider-preview';
            preview.style.backgroundImage = 'url(' + opt.dataset.dividerSrc + ')';
            item.appendChild(preview);
          } else {
            item.textContent = opt.textContent;
          }

          dropdown.appendChild(item);
        });
      }

      function updateSelectedPreview() {
        if (!selectedPreview) return;
        var selectedOption = select.options[select.selectedIndex];
        if (selectedOption && selectedOption.dataset.dividerSrc) {
          selectedPreview.style.backgroundImage = 'url(' + selectedOption.dataset.dividerSrc + ')';
          selectedPreview.style.display = 'block';
        } else {
          selectedPreview.style.display = 'none';
        }
      }

      rebuildOptions();
      wrapper.appendChild(dropdown);

      // Observe changes to select options (for dynamically populated selects)
      var observer = new MutationObserver(function() {
        rebuildOptions();
        updateSelectedPreview();
      });
      observer.observe(select, { childList: true });

      // Update preview when select value changes
      select.addEventListener('change', updateSelectedPreview);

      // Initial preview update (delayed to allow options to populate)
      setTimeout(updateSelectedPreview, 0);

      // Prevent native dropdown
      select.addEventListener('mousedown', function(e) {
        e.preventDefault();
        select.focus();
        wrapper.classList.toggle('open');
      });

      // Handle keyboard
      select.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          wrapper.classList.toggle('open');
        } else if (e.key === 'Escape') {
          wrapper.classList.remove('open');
        }
      });

      // Option click
      dropdown.addEventListener('click', function(e) {
        var item = e.target.closest('.custom-select-option');
        if (item) {
          select.value = item.dataset.value;
          select.dispatchEvent(new Event('change'));
          rebuildOptions();
          wrapper.classList.remove('open');
        }
      });
    });

    // Close all dropdowns on outside click
    document.addEventListener('click', function(e) {
      if (!e.target.closest('.custom-select-wrapper')) {
        panel.querySelectorAll('.custom-select-wrapper.open').forEach(function(w) {
          w.classList.remove('open');
        });
      }
    });
  }

  function initDividerDropdown() {
    var ctrlDivider = document.getElementById('ctrl-divider');
    if (!ctrlDivider) return;

    // Populate divider options
    config.dividers.forEach(function(dividerSrc, index) {
      var option = createElement('option');
      option.value = (index + 1).toString();
      option.textContent = 'Divider ' + (index + 1);
      option.dataset.dividerSrc = dividerSrc;
      ctrlDivider.appendChild(option);
    });
  }

  function initControlButtons(panel, retroList) {
    var ctrlDivider = document.getElementById('ctrl-divider');

    // Initialize divider value
    var dividerParam = params.get('divider-style');
    var hasDividers = retroList.indexOf('dividers') !== -1;
    var initialValue = dividerParam !== null ? dividerParam : (hasDividers ? '' : 'none');
    if (ctrlDivider) ctrlDivider.value = initialValue;

    // Close button
    document.getElementById('ctrl-close').addEventListener('click', function() {
      var currentRetros = (params.get('retros') || params.get('retro') || '').split(',').map(function(r) {
        return r.trim();
      }).filter(Boolean);

      if (currentRetros.indexOf('control-panel') !== -1) {
        var newParams = new URLSearchParams(window.location.search);
        var filteredRetros = currentRetros.filter(function(r) { return r !== 'control-panel'; });
        newParams.delete('retro');
        newParams.set('retros', filteredRetros.length > 0 ? filteredRetros.join(',') : 'none');
        window.location.search = newParams.toString();
      } else {
        panel.style.display = 'none';
      }
    });

    // Random button
    document.getElementById('ctrl-random').addEventListener('click', function() {
      var selections = generateRandomSelections();

      // Apply retro checkboxes
      RETROS.forEach(function(retro) {
        var cb = document.getElementById('ctrl-retro-' + retro.name);
        if (cb) cb.checked = selections.retros.indexOf(retro.name) !== -1;
      });

      // Apply dropdown selections
      var dropdownMap = {
        'ctrl-song': 'song',
        'ctrl-viz': 'viz',
        'ctrl-wordart': 'wordart',
        'ctrl-cursor': 'cursor',
        'ctrl-trail': 'trail',
        'ctrl-theme': 'theme'
      };
      Object.keys(dropdownMap).forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.value = selections.styles[dropdownMap[id]];
      });

      // Apply divider
      if (ctrlDivider) {
        ctrlDivider.value = selections.styles.divider;
        ctrlDivider.dispatchEvent(new Event('change'));
      }
    });

    // Apply button
    document.getElementById('ctrl-apply').addEventListener('click', function() {
      var newParams = new URLSearchParams();
      var selectedRetros = [];

      RETROS.forEach(function(retro) {
        // Skip themes (controlled via theme dropdown) and dropdown-controlled retros
        if (retro.type === 'theme') return;
        if (THEME_CONTROLLED_RETROS.indexOf(retro.name) !== -1) return;
        var cb = document.getElementById('ctrl-retro-' + retro.name);
        if (cb && cb.checked) selectedRetros.push(retro.name);
      });

      var dropdownRetros = [
        { id: 'ctrl-wordart', retro: 'wordart', param: 'wordart-style' },
        { id: 'ctrl-cursor', retro: 'custom-cursor', param: 'cursor-style' },
        { id: 'ctrl-trail', retro: 'mouse-trail', param: 'trail-style' },
        { id: 'ctrl-theme', retro: 'retheme', param: 'theme' },
        { id: 'ctrl-divider', retro: 'dividers', param: 'divider-style' }
      ];

      dropdownRetros.forEach(function(d) {
        var el = document.getElementById(d.id);
        if (el && el.value !== 'none') {
          selectedRetros.push(d.retro);
          if (el.value) newParams.set(d.param, el.value);
        }
      });

      selectedRetros.push('control-panel');

      if (selectedRetros.length > 0) newParams.set('retros', selectedRetros.join(','));

      var ctrlSong = document.getElementById('ctrl-song');
      var ctrlViz = document.getElementById('ctrl-viz');
      if (ctrlSong && ctrlSong.value) newParams.set('song', ctrlSong.value);
      if (ctrlViz && ctrlViz.value) newParams.set('viz', ctrlViz.value);

      window.location.search = newParams.toString();
    });

    // Reset button
    document.getElementById('ctrl-reset').addEventListener('click', function() {
      window.location.search = 'retros=control-panel';
    });
  }

  function showControlPanel() {
    var panel = document.getElementById('control-panel');
    if (!panel) return;

    var retroParam = params.get('retros') || params.get('retro') || '';
    var retroList = retroParam.split(',').map(function(r) { return r.trim(); }).filter(Boolean);
    initControlPanel(retroList);

    panel.style.display = 'block';
  }

  // ============================================
  // Export API
  // ============================================

  window.web90.initControlPanel = initControlPanel;
  window.web90.showControlPanel = showControlPanel;

  // Register the plugin
  window.web90.registerPlugin('control-panel', initControlPanel);

})();
