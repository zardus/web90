/**
 * Zelda Mode - A Link to the Website
 * A configurable top-down RPG navigation theme for web90
 *
 * Configure via window.WEB90_CONFIG.zelda before loading web90:
 *
 * window.WEB90_CONFIG = {
 *   zelda: {
 *     title: "My Adventure",
 *     playerEmoji: '🧝',
 *     playerStart: { x: 12, y: 9 },
 *     mapWidth: 25,
 *     mapHeight: 18,
 *     npcs: [
 *       { id: 'guide', emoji: '🧙', name: 'The Guide', x: 12, y: 5,
 *         dialog: ['Hello!', 'Welcome to my site!'] }
 *     ],
 *     doors: [
 *       { id: 'home', emoji: '🏠', label: 'Home', url: '/', x: 12, y: 16,
 *         description: 'Return home' }
 *     ],
 *     decorations: [
 *       { x: 5, y: 5, type: 'TREE' }
 *     ]
 *   }
 * };
 *
 * Controls: Arrow keys / WASD to move, Space/Enter to interact, ESC to exit
 */

(function() {
  'use strict';

  // ============================================
  // Game Constants
  // ============================================

  const TILE_SIZE = 32;
  const PLAYER_SPEED = 4;
  const ANIMATION_FRAME_DURATION = 150;

  // Tile types
  const TILES = {
    GRASS: { emoji: '🌿', walkable: true },
    TREE: { emoji: '🌲', walkable: false },
    FLOWER: { emoji: '🌸', walkable: true },
    ROCK: { emoji: '🪨', walkable: false },
    WATER: { emoji: '🌊', walkable: false },
    PATH: { emoji: '🟫', walkable: true },
    SAND: { emoji: '🟨', walkable: true }
  };

  // ============================================
  // Default Configuration (minimal working example)
  // ============================================

  const DEFAULT_CONFIG = {
    title: 'Zelda Mode',
    playerEmoji: '🧝',
    playerStart: { x: 12, y: 9 },
    mapWidth: 25,
    mapHeight: 18,
    exitUrl: '/?retros=none',
    npcs: [
      {
        id: 'guide',
        emoji: '🧙',
        name: 'The Guide',
        x: 12,
        y: 5,
        dialog: [
          'Welcome to Zelda Mode!',
          'Walk around with Arrow Keys or WASD.',
          'Press SPACE to interact with characters and doors.',
          'Press ESC to exit.',
          'Configure this theme via WEB90_CONFIG.zelda!'
        ]
      }
    ],
    doors: [
      {
        id: 'exit',
        emoji: '🏠',
        label: 'Exit',
        url: null, // Will use exitUrl
        x: 12,
        y: 15,
        description: 'Exit Zelda Mode'
      }
    ],
    decorations: []
  };

  // ============================================
  // Configuration Loading
  // ============================================

  function getConfig() {
    const web90Config = window.WEB90_CONFIG || {};
    const zeldaConfig = web90Config.zelda || {};

    // Merge with defaults
    return {
      title: zeldaConfig.title || DEFAULT_CONFIG.title,
      playerEmoji: zeldaConfig.playerEmoji || DEFAULT_CONFIG.playerEmoji,
      playerStart: zeldaConfig.playerStart || DEFAULT_CONFIG.playerStart,
      mapWidth: zeldaConfig.mapWidth || DEFAULT_CONFIG.mapWidth,
      mapHeight: zeldaConfig.mapHeight || DEFAULT_CONFIG.mapHeight,
      exitUrl: zeldaConfig.exitUrl || DEFAULT_CONFIG.exitUrl,
      npcs: zeldaConfig.npcs || DEFAULT_CONFIG.npcs,
      doors: zeldaConfig.doors || DEFAULT_CONFIG.doors,
      decorations: zeldaConfig.decorations || DEFAULT_CONFIG.decorations
    };
  }

  // ============================================
  // Game State
  // ============================================

  let config = null;
  let gameMap = [];
  let player = { x: 0, y: 0, direction: 'down', moving: false };
  let keys = {};
  let gameContainer = null;
  let dialogBox = null;
  let currentDialog = null;
  let dialogIndex = 0;
  let interactables = [];
  let npcMap = {};
  let doorMap = {};
  let animationFrame = 0;
  let lastAnimationTime = 0;

  // ============================================
  // Map Generation
  // ============================================

  function generateMap() {
    const { mapWidth, mapHeight, npcs, doors, decorations } = config;

    // Initialize with grass
    gameMap = [];
    for (let y = 0; y < mapHeight; y++) {
      gameMap[y] = [];
      for (let x = 0; x < mapWidth; x++) {
        gameMap[y][x] = 'GRASS';
      }
    }

    // Border with trees
    for (let x = 0; x < mapWidth; x++) {
      gameMap[0][x] = 'TREE';
      gameMap[mapHeight - 1][x] = 'TREE';
    }
    for (let y = 0; y < mapHeight; y++) {
      gameMap[y][0] = 'TREE';
      gameMap[y][mapWidth - 1] = 'TREE';
    }

    // Create paths (crossroads layout)
    const midY = Math.floor(mapHeight / 2);
    const midX = Math.floor(mapWidth / 2);

    // Horizontal main path
    for (let x = 1; x < mapWidth - 1; x++) {
      gameMap[midY][x] = 'PATH';
    }
    // Vertical main path
    for (let y = 1; y < mapHeight - 1; y++) {
      gameMap[y][midX] = 'PATH';
    }

    // Add some default decorative elements
    const defaultDecorations = [
      // Corners
      { x: 2, y: 2, type: 'FLOWER' },
      { x: mapWidth - 3, y: 2, type: 'FLOWER' },
      { x: 2, y: mapHeight - 3, type: 'FLOWER' },
      { x: mapWidth - 3, y: mapHeight - 3, type: 'FLOWER' },
      // Some rocks and trees
      { x: 3, y: 3, type: 'ROCK' },
      { x: mapWidth - 4, y: 3, type: 'ROCK' },
      { x: 3, y: mapHeight - 4, type: 'ROCK' },
      { x: mapWidth - 4, y: mapHeight - 4, type: 'ROCK' },
      // Water features
      { x: Math.floor(mapWidth / 3), y: midY - 2, type: 'WATER' },
      { x: Math.floor(mapWidth / 3), y: midY - 1, type: 'WATER' },
      { x: Math.floor(mapWidth / 3), y: midY + 1, type: 'WATER' },
      { x: Math.floor(mapWidth / 3), y: midY + 2, type: 'WATER' },
      { x: Math.floor(2 * mapWidth / 3), y: midY - 2, type: 'WATER' },
      { x: Math.floor(2 * mapWidth / 3), y: midY - 1, type: 'WATER' },
      { x: Math.floor(2 * mapWidth / 3), y: midY + 1, type: 'WATER' },
      { x: Math.floor(2 * mapWidth / 3), y: midY + 2, type: 'WATER' }
    ];

    // Apply default decorations
    defaultDecorations.forEach(({ x, y, type }) => {
      if (x > 0 && x < mapWidth - 1 && y > 0 && y < mapHeight - 1) {
        if (TILES[type]) gameMap[y][x] = type;
      }
    });

    // Apply custom decorations from config
    decorations.forEach(({ x, y, type }) => {
      if (x > 0 && x < mapWidth - 1 && y > 0 && y < mapHeight - 1) {
        if (TILES[type]) gameMap[y][x] = type;
      }
    });

    // Build interactables list and maps
    interactables = [];
    npcMap = {};
    doorMap = {};

    npcs.forEach(npc => {
      interactables.push({ type: 'npc', id: npc.id, x: npc.x, y: npc.y });
      npcMap[npc.id] = npc;
    });

    doors.forEach(door => {
      interactables.push({ type: 'door', id: door.id, x: door.x, y: door.y });
      doorMap[door.id] = door;
    });

    // Mark interactable positions as walkable paths (if not already)
    interactables.forEach(item => {
      if (item.y > 0 && item.y < mapHeight - 1 && item.x > 0 && item.x < mapWidth - 1) {
        if (gameMap[item.y][item.x] === 'TREE') {
          gameMap[item.y][item.x] = 'PATH';
        }
      }
    });
  }

  // ============================================
  // Rendering
  // ============================================

  function createGameContainer() {
    const existing = document.getElementById('zelda-game');
    if (existing) existing.remove();

    gameContainer = document.createElement('div');
    gameContainer.id = 'zelda-game';
    gameContainer.innerHTML = `
      <div class="zelda-header">
        <span class="zelda-title">${config.title}</span>
        <span class="zelda-controls">Arrow Keys: Move | Space: Interact | ESC: Exit</span>
      </div>
      <div class="zelda-viewport">
        <div class="zelda-map"></div>
        <div class="zelda-player">${config.playerEmoji}</div>
      </div>
      <div class="zelda-dialog" style="display: none;">
        <div class="zelda-dialog-name"></div>
        <div class="zelda-dialog-text"></div>
        <div class="zelda-dialog-hint">Press SPACE to continue</div>
      </div>
      <div class="zelda-hud">
        <div class="zelda-minimap"></div>
        <div class="zelda-info">
          <div class="zelda-location">${config.title}</div>
          <div class="zelda-hint">Walk up to characters and doors!</div>
        </div>
      </div>
    `;

    document.documentElement.appendChild(gameContainer);
    dialogBox = gameContainer.querySelector('.zelda-dialog');

    renderMap();
    updatePlayerPosition();
  }

  function renderMap() {
    const mapEl = gameContainer.querySelector('.zelda-map');
    let html = '';

    for (let y = 0; y < config.mapHeight; y++) {
      html += '<div class="zelda-row">';
      for (let x = 0; x < config.mapWidth; x++) {
        const tile = TILES[gameMap[y][x]];
        const interactable = interactables.find(i => i.x === x && i.y === y);

        let cellContent = tile.emoji;
        let cellClass = 'zelda-cell';

        if (interactable) {
          if (interactable.type === 'npc') {
            cellContent = npcMap[interactable.id].emoji;
            cellClass += ' zelda-npc';
          } else if (interactable.type === 'door') {
            cellContent = doorMap[interactable.id].emoji;
            cellClass += ' zelda-door';
          }
        }

        html += `<div class="${cellClass}" data-x="${x}" data-y="${y}">${cellContent}</div>`;
      }
      html += '</div>';
    }

    mapEl.innerHTML = html;
    renderMinimap();
  }

  function renderMinimap() {
    const minimapEl = gameContainer.querySelector('.zelda-minimap');
    const { mapWidth, mapHeight } = config;

    // Set CSS grid columns dynamically
    minimapEl.style.gridTemplateColumns = `repeat(${mapWidth}, 1fr)`;
    minimapEl.style.gridTemplateRows = `repeat(${mapHeight}, 1fr)`;

    let html = '';

    for (let y = 0; y < mapHeight; y++) {
      for (let x = 0; x < mapWidth; x++) {
        const interactable = interactables.find(i => i.x === x && i.y === y);
        const isPlayer = (x === Math.round(player.x) && y === Math.round(player.y));

        let color = '#228b22'; // grass
        if (gameMap[y][x] === 'TREE') color = '#006400';
        else if (gameMap[y][x] === 'PATH') color = '#8b4513';
        else if (gameMap[y][x] === 'WATER') color = '#4169e1';
        else if (gameMap[y][x] === 'ROCK') color = '#696969';
        else if (gameMap[y][x] === 'FLOWER') color = '#ff69b4';

        if (interactable) {
          color = interactable.type === 'npc' ? '#ffd700' : '#ff4500';
        }
        if (isPlayer) color = '#00ff00';

        html += `<div class="minimap-cell" style="background:${color}"></div>`;
      }
    }

    minimapEl.innerHTML = html;
  }

  function updatePlayerPosition() {
    const playerEl = gameContainer.querySelector('.zelda-player');
    const mapEl = gameContainer.querySelector('.zelda-map');
    const viewport = gameContainer.querySelector('.zelda-viewport');

    playerEl.textContent = config.playerEmoji;

    const playerPixelX = player.x * TILE_SIZE;
    const playerPixelY = player.y * TILE_SIZE;

    playerEl.style.left = playerPixelX + 'px';
    playerEl.style.top = playerPixelY + 'px';

    // Scroll map to keep player centered
    const viewportWidth = viewport.clientWidth;
    const viewportHeight = viewport.clientHeight;

    let scrollX = playerPixelX - viewportWidth / 2 + TILE_SIZE / 2;
    let scrollY = playerPixelY - viewportHeight / 2 + TILE_SIZE / 2;

    const mapPixelWidth = config.mapWidth * TILE_SIZE;
    const mapPixelHeight = config.mapHeight * TILE_SIZE;

    scrollX = Math.max(0, Math.min(scrollX, mapPixelWidth - viewportWidth));
    scrollY = Math.max(0, Math.min(scrollY, mapPixelHeight - viewportHeight));

    mapEl.style.transform = `translate(${-scrollX}px, ${-scrollY}px)`;
    playerEl.style.transform = `translate(${-scrollX}px, ${-scrollY}px)`;

    renderMinimap();
    checkNearbyInteractables();
  }

  function checkNearbyInteractables() {
    const infoEl = gameContainer.querySelector('.zelda-hint');
    const px = Math.round(player.x);
    const py = Math.round(player.y);

    const adjacent = [
      { x: px, y: py - 1 },
      { x: px, y: py + 1 },
      { x: px - 1, y: py },
      { x: px + 1, y: py }
    ];

    for (const pos of adjacent) {
      const interactable = interactables.find(i => i.x === pos.x && i.y === pos.y);
      if (interactable) {
        if (interactable.type === 'npc') {
          infoEl.textContent = `Talk to ${npcMap[interactable.id].name} (SPACE)`;
        } else if (interactable.type === 'door') {
          const door = doorMap[interactable.id];
          infoEl.textContent = `Enter ${door.label}: ${door.description} (SPACE)`;
        }
        return;
      }
    }

    infoEl.textContent = 'Walk up to characters and doors!';
  }

  // ============================================
  // Movement & Collision
  // ============================================

  function canMove(x, y) {
    const { mapWidth, mapHeight } = config;

    if (x < 0 || x >= mapWidth || y < 0 || y >= mapHeight) return false;

    const tileX = Math.floor(x);
    const tileY = Math.floor(y);
    const tile = TILES[gameMap[tileY][tileX]];
    if (!tile.walkable) return false;

    const npc = interactables.find(i => i.type === 'npc' && i.x === tileX && i.y === tileY);
    if (npc) return false;

    return true;
  }

  function movePlayer(dx, dy) {
    if (currentDialog) return;

    if (dx < 0) player.direction = 'left';
    else if (dx > 0) player.direction = 'right';
    else if (dy < 0) player.direction = 'up';
    else if (dy > 0) player.direction = 'down';

    const newX = player.x + dx * PLAYER_SPEED / TILE_SIZE;
    const newY = player.y + dy * PLAYER_SPEED / TILE_SIZE;

    const canMoveX = canMove(newX, player.y) && canMove(newX + 0.5, player.y) && canMove(newX + 0.5, player.y + 0.5);
    const canMoveY = canMove(player.x, newY) && canMove(player.x + 0.5, newY) && canMove(player.x + 0.5, newY + 0.5);

    if (canMoveX) player.x = newX;
    if (canMoveY) player.y = newY;

    player.x = Math.max(0.5, Math.min(player.x, config.mapWidth - 1.5));
    player.y = Math.max(0.5, Math.min(player.y, config.mapHeight - 1.5));

    updatePlayerPosition();
  }

  // ============================================
  // Interaction
  // ============================================

  function interact() {
    if (currentDialog) {
      advanceDialog();
      return;
    }

    const px = Math.round(player.x);
    const py = Math.round(player.y);

    const facingPos = {
      up: { x: px, y: py - 1 },
      down: { x: px, y: py + 1 },
      left: { x: px - 1, y: py },
      right: { x: px + 1, y: py }
    }[player.direction];

    const adjacent = [
      facingPos,
      { x: px, y: py - 1 },
      { x: px, y: py + 1 },
      { x: px - 1, y: py },
      { x: px + 1, y: py }
    ];

    for (const pos of adjacent) {
      const interactable = interactables.find(i => i.x === pos.x && i.y === pos.y);
      if (interactable) {
        if (interactable.type === 'npc') {
          startDialog(interactable.id);
        } else if (interactable.type === 'door') {
          enterDoor(interactable.id);
        }
        return;
      }
    }
  }

  function startDialog(npcId) {
    const npc = npcMap[npcId];
    currentDialog = npc;
    dialogIndex = 0;

    dialogBox.style.display = 'block';
    dialogBox.querySelector('.zelda-dialog-name').textContent = npc.name;
    dialogBox.querySelector('.zelda-dialog-text').textContent = npc.dialog[0];
  }

  function advanceDialog() {
    if (!currentDialog) return;

    dialogIndex++;
    if (dialogIndex >= currentDialog.dialog.length) {
      closeDialog();
    } else {
      dialogBox.querySelector('.zelda-dialog-text').textContent = currentDialog.dialog[dialogIndex];
    }
  }

  function closeDialog() {
    currentDialog = null;
    dialogIndex = 0;
    dialogBox.style.display = 'none';
  }

  function enterDoor(doorId) {
    const door = doorMap[doorId];
    const url = door.url || config.exitUrl;

    gameContainer.classList.add('zelda-transition');

    setTimeout(() => {
      window.location.href = url;
    }, 500);
  }

  // ============================================
  // Input Handling
  // ============================================

  function handleKeyDown(e) {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space', 'Enter', 'Escape'].includes(e.code)) {
      e.preventDefault();
    }

    keys[e.code] = true;

    if (e.code === 'Space' || e.code === 'Enter') {
      interact();
    }

    if (e.code === 'Escape') {
      if (currentDialog) {
        closeDialog();
      } else {
        exitZeldaMode();
      }
    }
  }

  function handleKeyUp(e) {
    keys[e.code] = false;
  }

  // ============================================
  // Game Loop
  // ============================================

  function gameLoop(timestamp) {
    if (!gameContainer) return;

    let dx = 0, dy = 0;

    if (keys['ArrowUp'] || keys['KeyW']) dy = -1;
    if (keys['ArrowDown'] || keys['KeyS']) dy = 1;
    if (keys['ArrowLeft'] || keys['KeyA']) dx = -1;
    if (keys['ArrowRight'] || keys['KeyD']) dx = 1;

    if (dx !== 0 || dy !== 0) {
      if (dx !== 0 && dy !== 0) {
        dx *= 0.707;
        dy *= 0.707;
      }
      movePlayer(dx, dy);
    }

    if (timestamp - lastAnimationTime > ANIMATION_FRAME_DURATION) {
      animationFrame = (animationFrame + 1) % 4;
      lastAnimationTime = timestamp;
    }

    requestAnimationFrame(gameLoop);
  }

  // ============================================
  // Touch Controls (Mobile)
  // ============================================

  function setupTouchControls() {
    const touchZone = document.createElement('div');
    touchZone.className = 'zelda-touch-controls';
    touchZone.innerHTML = `
      <div class="zelda-dpad">
        <button class="dpad-up" data-dir="up">^</button>
        <button class="dpad-left" data-dir="left"><</button>
        <button class="dpad-right" data-dir="right">></button>
        <button class="dpad-down" data-dir="down">v</button>
      </div>
      <div class="zelda-action-buttons">
        <button class="action-btn" data-action="interact">A</button>
        <button class="action-btn" data-action="exit">X</button>
      </div>
    `;

    gameContainer.appendChild(touchZone);

    touchZone.querySelectorAll('.dpad-up, .dpad-down, .dpad-left, .dpad-right').forEach(btn => {
      const dir = btn.dataset.dir;

      const startMove = () => {
        const keyMap = { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight' };
        keys[keyMap[dir]] = true;
      };

      const stopMove = () => {
        const keyMap = { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight' };
        keys[keyMap[dir]] = false;
      };

      btn.addEventListener('touchstart', (e) => { e.preventDefault(); startMove(); });
      btn.addEventListener('touchend', (e) => { e.preventDefault(); stopMove(); });
      btn.addEventListener('mousedown', startMove);
      btn.addEventListener('mouseup', stopMove);
      btn.addEventListener('mouseleave', stopMove);
    });

    touchZone.querySelector('[data-action="interact"]').addEventListener('click', interact);
    touchZone.querySelector('[data-action="exit"]').addEventListener('click', exitZeldaMode);
  }

  // ============================================
  // Initialization & Cleanup
  // ============================================

  function initZeldaMode() {
    config = getConfig();

    player.x = config.playerStart.x;
    player.y = config.playerStart.y;

    document.body.style.overflow = 'hidden';

    generateMap();
    createGameContainer();
    setupTouchControls();

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    requestAnimationFrame(gameLoop);

    console.log('Zelda Mode activated! Configure via WEB90_CONFIG.zelda');
  }

  function exitZeldaMode() {
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('keyup', handleKeyUp);

    if (gameContainer) {
      gameContainer.remove();
      gameContainer = null;
    }

    document.body.style.overflow = '';

    window.location.href = config.exitUrl;
  }

  // Register with web90 system
  if (window.web90) {
    window.web90.registerPlugin('zelda', initZeldaMode);
  }

  window.initZeldaMode = initZeldaMode;

})();
