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
 * Mobile: On-screen D-pad and action buttons
 */

(function() {
  'use strict';

  // ============================================
  // Game Constants
  // ============================================

  const TILE_SIZE = 32;
  const PLAYER_SPEED = 4;
  const ANIMATION_FRAME_DURATION = 150;

  // Touch device detection
  function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.matchMedia('(hover: none)').matches;
  }

  // Tile types - using CSS classes for colors instead of emojis for base tiles
  const TILES = {
    GRASS: { emoji: '', walkable: true, cssClass: 'tile-grass' },
    TREE: { emoji: '🌲', walkable: false, cssClass: 'tile-tree' },
    FLOWER: { emoji: '🌸', walkable: true, cssClass: 'tile-flower' },
    ROCK: { emoji: '🪨', walkable: false, cssClass: 'tile-rock' },
    WATER: { emoji: '🌊', walkable: false, cssClass: 'tile-water' },
    PATH: { emoji: '', walkable: true, cssClass: 'tile-path' },
    SAND: { emoji: '', walkable: true, cssClass: 'tile-sand' },
    WALL: { emoji: '', walkable: false, cssClass: 'tile-wall' },
    ROOF: { emoji: '', walkable: false, cssClass: 'tile-roof' },
    FLOOR: { emoji: '', walkable: true, cssClass: 'tile-floor' },
    FENCE: { emoji: '', walkable: false, cssClass: 'tile-fence' },
    WELL: { emoji: '⛲', walkable: false, cssClass: 'tile-well' }
  };

  // ============================================
  // Default Configuration (minimal working example)
  // ============================================

  const DEFAULT_CONFIG = {
    title: 'Zelda Mode',
    playerEmoji: '🧝',
    playerStart: { x: 12, y: 11 },
    mapWidth: 25,
    mapHeight: 18,
    exitUrl: '/?retros=none',
    npcs: [
      {
        id: 'guide',
        emoji: '🧙',
        name: 'The Guide',
        x: 12,
        y: 8,
        dialog: null // Will be generated dynamically based on device type
      }
    ],
    doors: [
      {
        id: 'exit',
        emoji: '🚪',
        label: 'Exit',
        url: null, // Will use exitUrl
        x: 12,
        y: 4,
        description: 'Exit Zelda Mode'
      },
      {
        id: 'shop',
        emoji: '🏪',
        label: 'Shop',
        url: null,
        x: 5,
        y: 6,
        description: 'Visit the shop'
      },
      {
        id: 'inn',
        emoji: '🏨',
        label: 'Inn',
        url: null,
        x: 19,
        y: 6,
        description: 'Rest at the inn'
      },
      {
        id: 'library',
        emoji: '📚',
        label: 'Library',
        url: null,
        x: 5,
        y: 14,
        description: 'Browse the archives'
      },
      {
        id: 'blacksmith',
        emoji: '⚒️',
        label: 'Smithy',
        url: null,
        x: 19,
        y: 14,
        description: 'Visit the blacksmith'
      }
    ],
    decorations: []
  };

  // ============================================
  // Configuration Loading
  // ============================================

  // Generate device-appropriate default dialog for the guide NPC
  function getDefaultGuideDialog() {
    if (isTouchDevice()) {
      return [
        'Welcome to Zelda Mode!',
        'Use the D-pad to walk around.',
        'Tap A to interact with characters and doors.',
        'Tap ✕ to exit.',
        'Configure this theme via WEB90_CONFIG.zelda!'
      ];
    }
    return [
      'Welcome to Zelda Mode!',
      'Walk around with Arrow Keys or WASD.',
      'Press SPACE to interact with characters and doors.',
      'Press ESC to exit.',
      'Configure this theme via WEB90_CONFIG.zelda!'
    ];
  }

  function getConfig() {
    const web90Config = window.WEB90_CONFIG || {};
    const zeldaConfig = web90Config.zelda || {};

    // Get NPCs, filling in null dialogs with defaults
    let npcs = zeldaConfig.npcs || DEFAULT_CONFIG.npcs;
    npcs = npcs.map(npc => {
      if (npc.id === 'guide' && npc.dialog === null) {
        return { ...npc, dialog: getDefaultGuideDialog() };
      }
      return npc;
    });

    // Merge with defaults
    return {
      title: zeldaConfig.title || DEFAULT_CONFIG.title,
      playerEmoji: zeldaConfig.playerEmoji || DEFAULT_CONFIG.playerEmoji,
      playerStart: zeldaConfig.playerStart || DEFAULT_CONFIG.playerStart,
      mapWidth: zeldaConfig.mapWidth || DEFAULT_CONFIG.mapWidth,
      mapHeight: zeldaConfig.mapHeight || DEFAULT_CONFIG.mapHeight,
      exitUrl: zeldaConfig.exitUrl || DEFAULT_CONFIG.exitUrl,
      npcs: npcs,
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

  // Helper to draw a building on the map
  function drawBuilding(startX, startY, width, height, doorX) {
    // Roof (top row)
    for (let x = startX; x < startX + width; x++) {
      gameMap[startY][x] = 'ROOF';
    }
    // Walls (middle rows)
    for (let y = startY + 1; y < startY + height; y++) {
      for (let x = startX; x < startX + width; x++) {
        if (y === startY + height - 1 && x === doorX) {
          // Door position - leave as path for door placement
          gameMap[y][x] = 'PATH';
        } else if (x === startX || x === startX + width - 1) {
          gameMap[y][x] = 'WALL';
        } else {
          gameMap[y][x] = 'WALL';
        }
      }
    }
  }

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

    // Border with trees (forest edge)
    for (let x = 0; x < mapWidth; x++) {
      gameMap[0][x] = 'TREE';
      gameMap[mapHeight - 1][x] = 'TREE';
    }
    for (let y = 0; y < mapHeight; y++) {
      gameMap[y][0] = 'TREE';
      gameMap[y][mapWidth - 1] = 'TREE';
    }
    // Extra trees for depth
    for (let x = 2; x < mapWidth - 2; x += 3) {
      if (gameMap[1]) gameMap[1][x] = 'TREE';
      if (gameMap[mapHeight - 2]) gameMap[mapHeight - 2][x] = 'TREE';
    }

    // === VILLAGE LAYOUT ===
    const midX = Math.floor(mapWidth / 2);
    const midY = Math.floor(mapHeight / 2);

    // Main village square (central plaza)
    for (let y = midY - 2; y <= midY + 2; y++) {
      for (let x = midX - 3; x <= midX + 3; x++) {
        if (y > 0 && y < mapHeight - 1 && x > 0 && x < mapWidth - 1) {
          gameMap[y][x] = 'PATH';
        }
      }
    }

    // Central well/fountain
    gameMap[midY][midX] = 'WELL';

    // Main paths leading out from plaza
    // North path
    for (let y = 2; y < midY - 2; y++) {
      gameMap[y][midX] = 'PATH';
    }
    // South path
    for (let y = midY + 3; y < mapHeight - 2; y++) {
      gameMap[y][midX] = 'PATH';
    }
    // West path
    for (let x = 2; x < midX - 3; x++) {
      gameMap[midY][x] = 'PATH';
    }
    // East path
    for (let x = midX + 4; x < mapWidth - 2; x++) {
      gameMap[midY][x] = 'PATH';
    }

    // === BUILDINGS ===
    // North building (main hall/exit) - centered at top
    drawBuilding(midX - 2, 2, 5, 3, midX);

    // West buildings
    // Shop (northwest)
    drawBuilding(3, 4, 4, 3, 5);
    // Library (southwest)
    drawBuilding(3, 12, 4, 3, 5);

    // East buildings
    // Inn (northeast)
    drawBuilding(17, 4, 4, 3, 19);
    // Blacksmith (southeast)
    drawBuilding(17, 12, 4, 3, 19);

    // Side paths to buildings
    // Path to shop
    for (let x = 5; x < midX - 3; x++) {
      gameMap[6][x] = 'PATH';
    }
    // Path to inn
    for (let x = midX + 4; x < 19; x++) {
      gameMap[6][x] = 'PATH';
    }
    // Path to library
    for (let x = 5; x < midX - 3; x++) {
      gameMap[14][x] = 'PATH';
    }
    // Path to smithy
    for (let x = midX + 4; x < 19; x++) {
      gameMap[14][x] = 'PATH';
    }

    // Decorative elements
    // Flowers around the plaza
    const flowerSpots = [
      { x: midX - 4, y: midY - 1 },
      { x: midX - 4, y: midY + 1 },
      { x: midX + 4, y: midY - 1 },
      { x: midX + 4, y: midY + 1 },
      { x: midX - 2, y: midY + 3 },
      { x: midX + 2, y: midY + 3 },
    ];
    flowerSpots.forEach(({ x, y }) => {
      if (gameMap[y] && gameMap[y][x] === 'GRASS') {
        gameMap[y][x] = 'FLOWER';
      }
    });

    // Some rocks for decoration
    const rockSpots = [
      { x: 2, y: 9 },
      { x: mapWidth - 3, y: 9 },
      { x: 8, y: 3 },
      { x: 16, y: 3 },
    ];
    rockSpots.forEach(({ x, y }) => {
      if (gameMap[y] && gameMap[y][x] === 'GRASS') {
        gameMap[y][x] = 'ROCK';
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

    // Ensure door/NPC positions are on walkable path
    interactables.forEach(item => {
      if (item.y > 0 && item.y < mapHeight - 1 && item.x > 0 && item.x < mapWidth - 1) {
        // Don't overwrite buildings, but ensure doors have path in front
        if (gameMap[item.y][item.x] === 'GRASS' || gameMap[item.y][item.x] === 'TREE') {
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
        <div class="zelda-dialog-hint">${isTouchDevice() ? 'Tap A to continue' : 'Press SPACE to continue'}</div>
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
        const tileType = gameMap[y][x];
        const tile = TILES[tileType];
        const interactable = interactables.find(i => i.x === x && i.y === y);

        let cellContent = tile.emoji || '';
        let cellClass = 'zelda-cell';

        // Add tile-specific CSS class
        if (tile.cssClass) {
          cellClass += ' ' + tile.cssClass;
        }

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

        let color = '#228b22'; // grass default
        const tileType = gameMap[y][x];

        // Map tile types to minimap colors
        const tileColors = {
          'GRASS': '#228b22',
          'TREE': '#006400',
          'PATH': '#c4a35a',
          'SAND': '#daa520',
          'WATER': '#4169e1',
          'ROCK': '#696969',
          'FLOWER': '#ff69b4',
          'WALL': '#8b7355',
          'ROOF': '#8b0000',
          'FLOOR': '#deb887',
          'FENCE': '#8b4513',
          'WELL': '#4682b4'
        };

        color = tileColors[tileType] || color;

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

  // Get nearby interactable with improved detection
  // Uses distance-based check to be more forgiving
  function findNearbyInteractable(interactionRange = 1.5) {
    const playerCenterX = player.x + 0.5;
    const playerCenterY = player.y + 0.5;

    let closest = null;
    let closestDist = Infinity;

    for (const interactable of interactables) {
      // Center of the interactable tile
      const ix = interactable.x + 0.5;
      const iy = interactable.y + 0.5;

      const dist = Math.sqrt((playerCenterX - ix) ** 2 + (playerCenterY - iy) ** 2);

      if (dist < interactionRange && dist < closestDist) {
        closestDist = dist;
        closest = interactable;
      }
    }

    return closest;
  }

  function checkNearbyInteractables() {
    const infoEl = gameContainer.querySelector('.zelda-hint');
    const actionKey = isTouchDevice() ? 'A' : 'SPACE';

    const nearby = findNearbyInteractable(1.8);

    if (nearby) {
      if (nearby.type === 'npc') {
        infoEl.textContent = `Talk to ${npcMap[nearby.id].name} (${actionKey})`;
      } else if (nearby.type === 'door') {
        const door = doorMap[nearby.id];
        infoEl.textContent = `Enter ${door.label}: ${door.description} (${actionKey})`;
      }
      return;
    }

    infoEl.textContent = isTouchDevice() ? 'Use D-pad to move, A to interact!' : 'Walk up to characters and doors!';
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

    // Use improved distance-based detection
    const interactable = findNearbyInteractable(1.8);

    if (interactable) {
      if (interactable.type === 'npc') {
        startDialog(interactable.id);
      } else if (interactable.type === 'door') {
        enterDoor(interactable.id);
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
        <button class="dpad-up" data-dir="up">▲</button>
        <button class="dpad-left" data-dir="left">◀</button>
        <button class="dpad-right" data-dir="right">▶</button>
        <button class="dpad-down" data-dir="down">▼</button>
      </div>
      <div class="zelda-action-buttons">
        <button class="action-btn" data-action="interact">A</button>
        <button class="action-btn" data-action="exit">✕</button>
      </div>
    `;

    gameContainer.appendChild(touchZone);

    const keyMap = { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight' };

    touchZone.querySelectorAll('.dpad-up, .dpad-down, .dpad-left, .dpad-right').forEach(btn => {
      const dir = btn.dataset.dir;

      const startMove = (e) => {
        if (e) e.preventDefault();
        keys[keyMap[dir]] = true;
      };

      const stopMove = (e) => {
        if (e) e.preventDefault();
        keys[keyMap[dir]] = false;
      };

      // Touch events with passive: false to allow preventDefault
      btn.addEventListener('touchstart', startMove, { passive: false });
      btn.addEventListener('touchend', stopMove, { passive: false });
      btn.addEventListener('touchcancel', stopMove, { passive: false });

      // Mouse fallback for desktop testing
      btn.addEventListener('mousedown', startMove);
      btn.addEventListener('mouseup', stopMove);
      btn.addEventListener('mouseleave', stopMove);
    });

    // Action buttons - use touchstart for immediate response
    const interactBtn = touchZone.querySelector('[data-action="interact"]');
    const exitBtn = touchZone.querySelector('[data-action="exit"]');

    interactBtn.addEventListener('touchstart', (e) => { e.preventDefault(); interact(); }, { passive: false });
    interactBtn.addEventListener('click', interact);

    exitBtn.addEventListener('touchstart', (e) => { e.preventDefault(); exitZeldaMode(); }, { passive: false });
    exitBtn.addEventListener('click', exitZeldaMode);

    // Clear all keys when touch ends anywhere (safety net)
    document.addEventListener('touchend', () => {
      // Small delay to let button-specific handlers run first
      setTimeout(() => {
        const activeTouch = document.querySelector('.dpad-up:active, .dpad-down:active, .dpad-left:active, .dpad-right:active');
        if (!activeTouch) {
          Object.keys(keyMap).forEach(dir => {
            keys[keyMap[dir]] = false;
          });
        }
      }, 50);
    }, { passive: true });
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
