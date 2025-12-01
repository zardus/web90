/**
 * Media Player Module
 * Lazy-loaded plugin for the media player and audio visualizations
 *
 * This module is loaded on-demand when the media-player retro is activated.
 */

(function() {
  'use strict';

  // Get utilities from the core
  var web90 = window.web90;
  var config = web90.config;
  var createElement = web90.createElement;
  var randomFrom = web90.randomFrom;
  var params = web90.params;

  // ============================================
  // Visualization Definitions
  // ============================================

  var VIZ_MODES = {
    waveform: { label: 'Waveform', dataType: 'time', draw: drawWaveform },
    spectrogram: { label: 'Spectrogram', dataType: 'freq', draw: drawSpectrogram },
    spectrum: { label: 'Spectrum', dataType: 'freq', draw: drawSpectrum },
    psychedelic: { label: 'Psychedelic', dataType: 'freq', draw: drawPsychedelic },
    radial: { label: 'Radial', dataType: 'freq', draw: drawRadial }
  };

  var VIZ_MODE_NAMES = Object.keys(VIZ_MODES);

  // Export for control panel
  web90.VIZ_MODES = VIZ_MODES;
  web90.VIZ_MODE_NAMES = VIZ_MODE_NAMES;

  // ============================================
  // Visualization Functions
  // ============================================

  function drawWaveform(ctx, canvas, dataArray, analyser) {
    analyser.getByteTimeDomainData(dataArray);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#0f0';
    ctx.beginPath();
    var sliceWidth = canvas.width / dataArray.length;
    for (var i = 0; i < dataArray.length; i++) {
      var v = dataArray[i] / 128.0;
      var y = v * canvas.height / 2;
      if (i === 0) ctx.moveTo(0, y);
      else ctx.lineTo(i * sliceWidth, y);
    }
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
  }

  function drawSpectrogram(ctx, canvas, dataArray, analyser) {
    analyser.getByteFrequencyData(dataArray);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    var barWidth = canvas.width / dataArray.length;
    for (var i = 0; i < dataArray.length; i++) {
      var barHeight = (dataArray[i] / 255) * canvas.height;
      ctx.fillStyle = 'rgb(0,' + Math.floor(100 + (dataArray[i] / 255) * 155) + ',0)';
      ctx.fillRect(i * barWidth, canvas.height - barHeight, barWidth, barHeight);
    }
  }

  function drawSpectrum(ctx, canvas, dataArray, analyser) {
    analyser.getByteFrequencyData(dataArray);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    var sliceWidth = canvas.width / dataArray.length;

    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    for (var i = 0; i < dataArray.length; i++) {
      ctx.lineTo(i * sliceWidth, canvas.height - (dataArray[i] / 255) * canvas.height);
    }
    ctx.lineTo(canvas.width, canvas.height);
    ctx.closePath();
    ctx.fillStyle = 'rgba(0, 80, 0, 0.6)';
    ctx.fill();

    ctx.beginPath();
    for (var j = 0; j < dataArray.length; j++) {
      var y = canvas.height - (dataArray[j] / 255) * canvas.height;
      if (j === 0) ctx.moveTo(0, y);
      else ctx.lineTo(j * sliceWidth, y);
    }
    ctx.strokeStyle = '#0f0';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  var psychedelicHue = 0;

  function drawPsychedelic(ctx, canvas, dataArray, analyser) {
    analyser.getByteFrequencyData(dataArray);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    psychedelicHue = (psychedelicHue + 2) % 360;
    var barWidth = canvas.width / dataArray.length;
    var centerY = canvas.height / 2;
    for (var i = 0; i < dataArray.length; i++) {
      var amplitude = dataArray[i] / 255;
      var barHeight = amplitude * centerY;
      var hue = (psychedelicHue + (i / dataArray.length) * 360) % 360;
      ctx.fillStyle = 'hsl(' + hue + ', 100%, ' + (40 + amplitude * 30) + '%)';
      ctx.fillRect(i * barWidth, centerY - barHeight, barWidth - 1, barHeight);
      ctx.fillRect(i * barWidth, centerY, barWidth - 1, barHeight);
    }
  }

  var radialRotation = 0;

  function drawRadial(ctx, canvas, dataArray, analyser) {
    analyser.getByteFrequencyData(dataArray);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    radialRotation += 0.005;
    var centerX = canvas.width / 2, centerY = canvas.height / 2;
    var radius = Math.min(centerX, centerY) * 0.3;
    var bars = dataArray.length / 2;
    for (var i = 0; i < bars; i++) {
      var amplitude = dataArray[i] / 255;
      var angle = (i / bars) * Math.PI * 2 + radialRotation;
      var x1 = centerX + Math.cos(angle) * radius;
      var y1 = centerY + Math.sin(angle) * radius;
      var x2 = centerX + Math.cos(angle) * (radius + amplitude * radius * 2);
      var y2 = centerY + Math.sin(angle) * (radius + amplitude * radius * 2);
      ctx.strokeStyle = 'rgb(0,' + Math.floor(100 + amplitude * 155) + ',0)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  }

  // ============================================
  // Media Player
  // ============================================

  function initMediaPlayer() {
    var audio = document.getElementById('audioPlayer');
    var select = document.getElementById('trackSelector');
    var canvas = document.getElementById('waveformCanvas');

    if (!audio || !select || !canvas) return;

    select.innerHTML = '';
    config.music.forEach(function(track) {
      var option = createElement('option');
      option.value = track.src;
      option.textContent = track.label;
      select.appendChild(option);
    });

    select.onchange = function() {
      audio.src = select.value;
      audio.load();
    };

    var songParam = params.get('song');
    if (songParam) {
      var idx = [...select.options].findIndex(function(o) { return o.value.includes(songParam); });
      if (idx >= 0) select.selectedIndex = idx;
    } else {
      select.selectedIndex = Math.floor(Math.random() * select.options.length);
    }
    audio.src = select.value;

    var ctx = canvas.getContext('2d');
    var audioCtx, analyser, source, dataArray;
    var initialized = false;

    var vizOverride = params.get('viz');
    var vizMode = VIZ_MODE_NAMES.includes(vizOverride) ? vizOverride : randomFrom(VIZ_MODE_NAMES);

    function sizeCanvas() {
      var container = canvas.parentElement;
      if (container) {
        canvas.width = container.offsetWidth - 4;
        canvas.height = container.offsetHeight - 4;
      }
    }
    window.addEventListener('load', sizeCanvas);
    setTimeout(sizeCanvas, 0);

    function initAudio() {
      if (initialized) return;
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source = audioCtx.createMediaElementSource(audio);
      source.connect(analyser);
      analyser.connect(audioCtx.destination);
      dataArray = new Uint8Array(analyser.frequencyBinCount);
      initialized = true;
    }

    function draw() {
      requestAnimationFrame(draw);
      if (!initialized || audio.paused) {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        return;
      }

      var vizDef = VIZ_MODES[vizMode];
      if (vizDef && vizDef.draw) {
        vizDef.draw(ctx, canvas, dataArray, analyser);
      }
    }

    audio.addEventListener('play', function() {
      initAudio();
      if (audioCtx.state === 'suspended') audioCtx.resume();
    });

    draw();
  }

  // Register the plugin
  web90.registerPlugin('media-player', initMediaPlayer);

})();
