// Image-driven 2D field map and battle sprite renderer.
const WORLD_ASSET_BASE = "assets/map";
const PLAYER_ASSET_BASE = `${WORLD_ASSET_BASE}/player`;
const BATTLE_ASSET_BASE = "assets/battle";
const STORY_ASSET_BASE = "assets/story";

const WORLD_TILE_ASSETS = {
  grass: `${WORLD_ASSET_BASE}/tiles/grass.png`,
  floor: `${WORLD_ASSET_BASE}/tiles/floor.png`,
  tree: `${WORLD_ASSET_BASE}/tiles/tree.png`,
  tallGrass: `${WORLD_ASSET_BASE}/tiles/tall-grass.png`,
  cliff: `${WORLD_ASSET_BASE}/tiles/cliff.png`,
  water: `${WORLD_ASSET_BASE}/tiles/water.png`,
  bridge: `${WORLD_ASSET_BASE}/tiles/bridge.png`,
  labRidge: `${WORLD_ASSET_BASE}/tiles/lab-ridge.png`,
  lab: `${WORLD_ASSET_BASE}/tiles/lab.png`,
  house: `${WORLD_ASSET_BASE}/tiles/house.png`,
  store: `${WORLD_ASSET_BASE}/tiles/store.png`,
  cave: `${WORLD_ASSET_BASE}/tiles/cave.png`,
  rock: `${WORLD_ASSET_BASE}/tiles/rock.png`,
  sign: `${WORLD_ASSET_BASE}/tiles/sign.png`,
  flower: `${WORLD_ASSET_BASE}/tiles/flower.png`,
  isoStairs: `${WORLD_ASSET_BASE}/tiles/extra/objects/kenney-isometric/stairs_S.png`,
  isoChest: `${WORLD_ASSET_BASE}/tiles/extra/objects/kenney-isometric/chestClosed_S.png`,
  isoBarrels: `${WORLD_ASSET_BASE}/tiles/extra/objects/kenney-isometric/barrelsStacked_S.png`,
  isoStoneHalf: `${WORLD_ASSET_BASE}/tiles/extra/objects/kenney-isometric/stoneWallHalf_S.png`,
  isoStoneColumn: `${WORLD_ASSET_BASE}/tiles/extra/objects/kenney-isometric/stoneWallColumn_S.png`,
};

const PLAYER_IDLE_ASSETS = {
  down: "playerFront1",
  up: "playerBack1",
  left: "playerLeft1",
  right: "playerRight1",
};

const PLAYER_WALK_ASSETS = {
  down: ["playerFront2", "playerFront1", "playerFront2", "playerFront1"],
  up: ["playerBack2", "playerBack1", "playerBack2", "playerBack1"],
  left: ["playerLeft2", "playerLeft1", "playerLeft2", "playerLeft1"],
  right: ["playerRight2", "playerRight1", "playerRight2", "playerRight1"],
};

const PLAYER_ASSETS = {
  playerFront1: `${PLAYER_ASSET_BASE}/front-1.png`,
  playerFront2: `${PLAYER_ASSET_BASE}/front-2.png`,
  playerBack1: `${PLAYER_ASSET_BASE}/back-1.png`,
  playerBack2: `${PLAYER_ASSET_BASE}/back-2.png`,
  playerLeft1: `${PLAYER_ASSET_BASE}/left-1.png`,
  playerLeft2: `${PLAYER_ASSET_BASE}/left-2.png`,
  playerRight1: `${PLAYER_ASSET_BASE}/right-1.png`,
  playerRight2: `${PLAYER_ASSET_BASE}/right-2.png`,
  playerFront: `${PLAYER_ASSET_BASE}/front.png`,
  playerBack: `${PLAYER_ASSET_BASE}/back.png`,
  playerLeft: `${PLAYER_ASSET_BASE}/left.png`,
  playerRight: `${PLAYER_ASSET_BASE}/right.png`,
  playerWalkFront1: `${PLAYER_ASSET_BASE}/walk-front-1.png`,
  playerWalkFront2: `${PLAYER_ASSET_BASE}/walk-front-2.png`,
  playerWalkBack1: `${PLAYER_ASSET_BASE}/walk-back-1.png`,
  playerWalkBack2: `${PLAYER_ASSET_BASE}/walk-back-2.png`,
  playerWalkLeft1: `${PLAYER_ASSET_BASE}/walk-left-1.png`,
  playerWalkLeft2: `${PLAYER_ASSET_BASE}/walk-left-2.png`,
  playerWalkRight1: `${PLAYER_ASSET_BASE}/walk-right-1.png`,
  playerWalkRight2: `${PLAYER_ASSET_BASE}/walk-right-2.png`,
};

const NPC_ASSETS = Object.fromEntries(
  Array.from({ length: 16 }, (_, index) => {
    const id = String(index + 1).padStart(2, "0");
    return [`extraNpc${id}`, `${WORLD_ASSET_BASE}/npcs/extra-npc-${id}.png`];
  }),
);

const MAP_ASSET_PACK = {
  ...WORLD_TILE_ASSETS,
  ...PLAYER_ASSETS,
  ...NPC_ASSETS,
};

const TILE_ASSET_NAMES = {
  grass: "grass",
  path: "floor",
  treeTop: "tree",
  tallGrass: "tallGrass",
  cliffFace: "cliff",
  water: "water",
  bridge: "bridge",
  sign: "sign",
  flower: "flower",
  playerDown: "playerFront1",
};

const COLLISION_TILES = new Set([1, 3, 5, 6, 7, 10]);
const GRASS_ENCOUNTER_RATE = 0.14;

const BATTLE_SPRITES = {
  playerBack: `${PLAYER_ASSET_BASE}/back-1.png`,
  professor: `${STORY_ASSET_BASE}/professor.png`,
  wildbyte: `${BATTLE_ASSET_BASE}/snorlax.png`,
  dev_frontend: `${BATTLE_ASSET_BASE}/pikachu.png`,
  dev_backend: `${BATTLE_ASSET_BASE}/charmander.png`,
  dev_fullstack: `${BATTLE_ASSET_BASE}/squirtle.png`,
  dev_data: `${BATTLE_ASSET_BASE}/eevee.png`,
};

class GameEngine {
  constructor(canvasId, onEncounter) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d");
    this.ctx.imageSmoothingEnabled = false;
    this.onEncounter = onEncounter;
    this.mapAssetImages = this.loadMapAssets();

    this.tileSize = 24;
    this.cols = 36;
    this.rows = 36;
    this.camera = { x: 0, y: 0 };
    this.map = this.createWorldMap();

    this.player = {
      x: 10,
      y: 13,
      px: 10 * this.tileSize,
      py: 13 * this.tileSize,
      targetPx: 10 * this.tileSize,
      targetPy: 13 * this.tileSize,
      dir: "down",
      isMoving: false,
      moveProgress: 0,
      walkSpeed: 0.005,
      animFrame: 0,
      animTimer: 0,
    };

    this.active = false;
    this.lastTime = 0;
    this.keysPressed = {};
  }

  loadMapAssets() {
    return Object.fromEntries(Object.entries(MAP_ASSET_PACK).map(([name, src]) => {
      const image = new Image();
      image.src = src;
      return [name, { image, src }];
    }));
  }

  createWorldMap() {
    const map = Array.from({ length: this.rows }, () => Array(this.cols).fill(0));
    const set = (x, y, tile) => {
      if (x >= 0 && x < this.cols && y >= 0 && y < this.rows) map[y][x] = tile;
    };
    const rect = (x, y, w, h, tile) => {
      for (let yy = y; yy < y + h; yy++) {
        for (let xx = x; xx < x + w; xx++) set(xx, yy, tile);
      }
    };

    // Starter town and first route: lab village, avoidable grass,
    // a stream bridge, raised cliff, and a few pseudo-3D props.
    for (let x = 0; x < this.cols; x++) {
      set(x, 0, 1);
      set(x, this.rows - 1, 1);
    }
    for (let y = 0; y < this.rows; y++) {
      set(0, y, 1);
      set(this.cols - 1, y, 1);
    }

    rect(1, 1, 4, 8, 1);
    rect(1, 27, 5, 8, 1);
    rect(27, 1, 8, 11, 1);
    rect(30, 21, 5, 14, 1);
    rect(2, 14, 3, 8, 1);

    rect(5, 10, 8, 3, 8);
    rect(9, 7, 4, 16, 8);
    rect(12, 17, 12, 3, 8);
    rect(20, 8, 3, 11, 8);
    rect(22, 8, 7, 3, 8);
    rect(8, 23, 11, 3, 8);
    rect(15, 25, 3, 6, 8);
    rect(18, 28, 11, 3, 8);

    rect(6, 15, 6, 5, 2);
    rect(13, 12, 5, 4, 2);
    rect(23, 13, 5, 5, 2);
    rect(26, 25, 4, 3, 2);

    rect(4, 29, 11, 4, 6);
    rect(15, 30, 3, 3, 4);
    rect(18, 31, 4, 2, 6);
    rect(2, 31, 2, 2, 6);

    rect(26, 14, 6, 7, 3);
    rect(25, 13, 8, 1, 10);
    rect(25, 20, 8, 1, 10);
    rect(25, 21, 8, 2, 1);
    rect(27, 16, 2, 4, 8);

    rect(6, 3, 7, 6, 7);
    rect(16, 4, 5, 5, 7);
    rect(23, 4, 5, 5, 7);
    rect(29, 18, 4, 5, 7);

    rect(5, 22, 3, 2, 9);
    rect(18, 21, 5, 2, 9);
    rect(24, 23, 5, 1, 9);
    rect(13, 27, 2, 2, 9);

    set(8, 14, 5);
    set(19, 10, 5);
    set(23, 20, 5);
    set(29, 25, 5);
    set(29, 17, 4);

    return map;
  }

  start() {
    if (this.active) return;
    this.active = true;
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  }

  stop() {
    this.active = false;
  }

  loop(timestamp) {
    if (!this.active) return;

    const dt = timestamp - this.lastTime;
    this.lastTime = timestamp;

    this.update(dt);
    this.render();

    requestAnimationFrame((t) => this.loop(t));
  }

  update(dt) {
    if (this.player.isMoving) {
      this.player.moveProgress += dt * this.player.walkSpeed;
      if (this.player.moveProgress >= 1.0) {
        this.player.moveProgress = 1.0;
      }

      const startPx = this.player.x * this.tileSize;
      const startPy = this.player.y * this.tileSize;
      
      let dx = 0;
      let dy = 0;
      if (this.player.dir === "up") dy = -1;
      if (this.player.dir === "down") dy = 1;
      if (this.player.dir === "left") dx = -1;
      if (this.player.dir === "right") dx = 1;

      this.player.px = startPx + (dx * this.tileSize * this.player.moveProgress);
      this.player.py = startPy + (dy * this.tileSize * this.player.moveProgress);

      this.player.animTimer += dt;
      if (this.player.animTimer > 50) {
        this.player.animFrame = (this.player.animFrame + 1) % 4;
        this.player.animTimer = 0;
      }

      if (this.player.moveProgress >= 1.0) {
        this.player.x += dx;
        this.player.y += dy;
        this.player.px = this.player.x * this.tileSize;
        this.player.py = this.player.y * this.tileSize;
        this.player.isMoving = false;
        this.player.moveProgress = 0;
        this.player.animFrame = 0;

        this.checkTileTrigger();

        if (this.active) {
          this.handleContinuousInput();
        }
      }
    } else {
      this.handleContinuousInput();
    }

    this.updateCamera();
  }

  updateCamera() {
    this.camera.x = this.player.px - this.canvas.width / 2 + this.tileSize / 2;
    this.camera.y = this.player.py - this.canvas.height / 2 + this.tileSize / 2;

    const maxCamX = (this.cols * this.tileSize) - this.canvas.width;
    const maxCamY = (this.rows * this.tileSize) - this.canvas.height;
    
    this.camera.x = Math.max(0, Math.min(this.camera.x, maxCamX));
    this.camera.y = Math.max(0, Math.min(this.camera.y, maxCamY));
  }

  handleContinuousInput() {
    let dx = 0;
    let dy = 0;
    let dir = "";

    if (this.keysPressed["ArrowUp"] || this.keysPressed["w"] || this.keysPressed["W"]) {
      dy = -1; dir = "up";
    } else if (this.keysPressed["ArrowDown"] || this.keysPressed["s"] || this.keysPressed["S"]) {
      dy = 1; dir = "down";
    } else if (this.keysPressed["ArrowLeft"] || this.keysPressed["a"] || this.keysPressed["A"]) {
      dx = -1; dir = "left";
    } else if (this.keysPressed["ArrowRight"] || this.keysPressed["d"] || this.keysPressed["D"]) {
      dx = 1; dir = "right";
    }

    if (dx !== 0 || dy !== 0) {
      this.requestMove(dx, dy, dir);
    }
  }

  requestMove(dx, dy, dir) {
    if (this.player.isMoving) return;

    this.player.dir = dir;
    const targetX = this.player.x + dx;
    const targetY = this.player.y + dy;

    if (targetX < 0 || targetX >= this.cols || targetY < 0 || targetY >= this.rows) {
      window.audioManager.playCollision();
      return;
    }

    const targetTile = this.map[targetY][targetX];
    if (COLLISION_TILES.has(targetTile)) {
      window.audioManager.playCollision();
      this.shakeScreen();
      return;
    }

    this.player.isMoving = true;
    this.player.moveProgress = 0.0;
    this.player.targetPx = targetX * this.tileSize;
    this.player.targetPy = targetY * this.tileSize;
  }

  checkTileTrigger() {
    const currentTile = this.map[this.player.y][this.player.x];
    if (currentTile === 2) {
      window.audioManager.playGrassRustle();
      if (Math.random() < GRASS_ENCOUNTER_RATE) {
        this.triggerBattle();
      }
    }
  }

  shakeScreen() {
    const screenEl = document.getElementById("game-screen");
    screenEl.classList.add("shake");
    setTimeout(() => { screenEl.classList.remove("shake"); }, 300);
  }

  triggerBattle() {
    this.stop();
    this.keysPressed = {};
    
    window.audioManager.playEncounter();
    const screenEl = document.getElementById("game-screen");
    screenEl.classList.add("flash-effect");
    
    setTimeout(() => {
      screenEl.classList.remove("flash-effect");
      if (this.onEncounter) this.onEncounter();
    }, 850);
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.imageSmoothingEnabled = false;

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const tileType = this.map[r][c];
        
        const tx = c * this.tileSize - this.camera.x;
        const ty = r * this.tileSize - this.camera.y;

        if (tx < -this.tileSize || tx > this.canvas.width || ty < -this.tileSize || ty > this.canvas.height) {
          continue;
        }

        this.drawSinnohGrass(tx, ty, c, r);

        if (tileType === 8) {
          this.drawSinnohPath(tx, ty, c, r);
        } else if (tileType === 9) {
          this.drawSpriteTile("flower", tx, ty);
        } else if (tileType === 10) {
          this.drawSinnohCliff(tx, ty, c, r, true);
        } else if (tileType === 1) {
          this.drawSinnohTree(tx, ty, c, r);
        } else if (tileType === 2) {
          this.drawSinnohTallGrass(tx, ty, c, r);
        } else if (tileType === 3) {
          this.drawSinnohCliff(tx, ty, c, r, false);
        } else if (tileType === 4) {
          this.drawSinnohBridge(tx, ty, c, r);
        } else if (tileType === 5) {
          this.drawSpriteTile("sign", tx, ty, { shadow: "rgba(21, 18, 14, 0.28)" });
        } else if (tileType === 6) {
          this.drawSinnohWater(tx, ty, c, r);
        } else if (tileType === 7) {
          this.drawSinnohGrass(tx, ty, c, r);
        }
      }
    }

    this.drawBMapLandmarks();
    this.drawExtraMapCharacters();

    this.drawGoldPlayer(this.player.px - this.camera.x, this.player.py - this.camera.y);
  }

  drawMapAsset(name, x, y, width, height, options = {}) {
    const asset = this.mapAssetImages && this.mapAssetImages[name];
    const image = asset && asset.image;
    if (!image || !image.complete || image.naturalWidth === 0) return false;

    const dx = Math.round(x);
    const dy = Math.round(y);
    const dw = width || image.naturalWidth;
    const dh = height || image.naturalHeight;
    const shadow = options.shadow;
    if (shadow) {
      this.ctx.fillStyle = shadow;
      this.ctx.fillRect(dx + 4, dy + dh - 8, Math.max(8, dw - 8), 6);
    }
    this.ctx.drawImage(image, dx, dy, dw, dh);
    return true;
  }

  drawBMapLandmarks() {
    const tile = this.tileSize;
    const drawObject = (name, mapX, mapY, width, height) => {
      const x = mapX * tile - this.camera.x;
      const y = mapY * tile - this.camera.y;
      this.drawMapAsset(name, x, y, width, height);
    };
    drawObject("lab", 6.2, 3.1, tile * 6, tile * 6);
    drawObject("house", 15.6, 3.8, tile * 5.3, tile * 5.3);
    drawObject("store", 22.7, 3.8, tile * 5.3, tile * 5.3);
    drawObject("cave", 29.1, 17.3, tile * 3, tile * 5);
    drawObject("isoStairs", 27.1, 16.3, tile * 2.5, Math.round(tile * 1.8));
    drawObject("isoChest", 27.2, 24.7, tile * 1.5, tile);
    drawObject("isoBarrels", 12.3, 25.6, tile * 1.7, Math.round(tile * 1.15));
    drawObject("isoStoneHalf", 21.5, 22.6, tile * 2.4, Math.round(tile * 1.25));
    drawObject("isoStoneColumn", 24.4, 22.1, tile * 1.4, Math.round(tile * 1.7));
    drawObject("rock", 13.8, 27.4, Math.round(tile * 1.45), tile);
    drawObject("rock", 18.5, 31.6, Math.round(tile * 1.45), tile);
  }

  drawExtraMapCharacters() {
    const tile = this.tileSize;
    const placements = [
      ["extraNpc01", 10.0, 21.4],
      ["extraNpc02", 17.3, 10.5],
      ["extraNpc03", 22.0, 16.0],
      ["extraNpc04", 24.5, 9.6],
      ["extraNpc05", 7.0, 13.2],
      ["extraNpc06", 28.1, 28.7],
      ["extraNpc07", 15.3, 22.3],
      ["extraNpc08", 29.0, 14.1],
      ["extraNpc09", 5.2, 24.0],
      ["extraNpc10", 19.0, 27.5],
      ["extraNpc11", 23.2, 20.3],
      ["extraNpc12", 31.0, 24.5],
    ];
    for (const [name, mapX, mapY] of placements) {
      this.drawMapAsset(
        name,
        mapX * tile - this.camera.x,
        mapY * tile - this.camera.y,
        tile * 2,
        Math.round(tile * 2.1),
        { shadow: "rgba(18, 20, 16, 0.28)" },
      );
    }
  }

  drawSpriteTile(name, x, y, options = {}) {
    const tile = this.tileSize;
    const shadow = options.shadow;
    if (shadow) {
      this.ctx.fillStyle = shadow;
      this.ctx.fillRect(x + 3, y + tile - 5, tile - 6, 4);
    }
    const assetName = TILE_ASSET_NAMES[name];
    if (assetName) this.drawMapAsset(assetName, x, y, tile, tile);
  }

  drawSinnohGrass(x, y, col, row) {
    this.drawSpriteTile("grass", x, y);
  }

  drawSinnohPath(x, y, col, row) {
    this.drawSpriteTile("path", x, y);
  }

  drawSinnohTree(x, y) {
    if (this.drawMapAsset("tree", x - 24, y - 48, 72, 72)) return;
    this.drawSpriteTile("treeTop", x, y, { shadow: "rgba(21, 24, 18, 0.38)" });
  }

  drawSinnohTallGrass(x, y, col, row) {
    this.drawSpriteTile("tallGrass", x, y);
  }

  drawSinnohCliff(x, y, col, row, ledgeOnly = false) {
    if (ledgeOnly) {
      this.drawSpriteTile("grass", x, y);
      this.drawSpriteTile("cliffFace", x, y);
      return;
    }
    this.drawSpriteTile("cliffFace", x, y);
  }

  drawSinnohWater(x, y, col, row) {
    this.drawSpriteTile("water", x, y);
  }

  drawSinnohBridge(x, y) {
    this.drawSpriteTile("bridge", x, y);
  }

  drawGoldPlayer(x, y) {
    const frames = this.player.isMoving ? PLAYER_WALK_ASSETS[this.player.dir] : null;
    const assetName = frames
      ? frames[this.player.animFrame % frames.length]
      : PLAYER_IDLE_ASSETS[this.player.dir] || PLAYER_IDLE_ASSETS.down;

    if (this.drawMapAsset(assetName, x - 10, y - 27, 37, 50)) return;
    if (this.drawMapAsset("playerFront", x - 10, y - 27, 37, 50)) return;
    this.drawSpriteTile("playerDown", x, y);
  }

  static _imgCache = {};

  static _loadImage(src) {
    if (!GameEngine._imgCache[src]) {
      const img = new Image();
      img.src = src;
      GameEngine._imgCache[src] = img;
    }
    return GameEngine._imgCache[src];
  }

  static preloadBattleSprites() {
    Object.values(BATTLE_SPRITES).forEach((src) => GameEngine._loadImage(src));
  }

  static keyOutLightBackground(ctx, canvas) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      if (data[i] > 238 && data[i + 1] > 238 && data[i + 2] > 238) {
        data[i + 3] = 0;
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }

  static drawPlayerBack(canvasId, frame = 0) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const size = Math.min(canvas.width, canvas.height);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = false;
    const dy = (frame === 1) ? -3 : 0;
    const img = GameEngine._loadImage(BATTLE_SPRITES.playerBack);
    if (img.complete && img.naturalWidth > 0) {
      ctx.drawImage(img, 0, dy, size, size - dy);
    } else {
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, dy, size, size - dy);
      };
    }
  }

  static drawEnemyFront(canvasId, devId, frame = 0) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const size = Math.min(canvas.width, canvas.height);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = false;

    const src = BATTLE_SPRITES[devId] || BATTLE_SPRITES.dev_frontend;
    const dy = (frame === 1) ? -4 : 0;
    const img = GameEngine._loadImage(src);
    if (img.complete && img.naturalWidth > 0) {
      ctx.drawImage(img, 0, dy, size, size - dy);
    } else {
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, dy, size, size - dy);
      };
    }
  }
}

window.GameEngine = GameEngine;
