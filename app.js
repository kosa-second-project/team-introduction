// 메인 애플리케이션 제어 모듈 (애니메이션 퀄리티 업그레이드 및 타이핑 효과 적용)
class App {
  constructor() {
    this.capturedDevs = []; 
    this.currentSelectedDevId = null; 
    this.trainerLocation = "태초마을";
    this.activeEnemy = null;
    this.activeQuiz = null;
    this.isResolvingQuiz = false;
    
    this.STATE_INTRO = "INTRO";
    this.STATE_DIALOGUE = "DIALOGUE";
    this.STATE_WORLD = "WORLD";
    this.STATE_BATTLE = "BATTLE";
    this.STATE_ENDING = "ENDING";
    this.currentGameState = this.STATE_INTRO;

    // 대화 및 타이핑 제어
    this.dialogueQueue = [];
    this.dialogueIndex = 0;
    this.typingTimer = null; // 타자기 타이핑 타이머

    // 인게임 메뉴
    this.isMenuOpen = false;
    this.menuOptions = ["pokedex", "save", "mute", "close"];
    this.menuSelectedIndex = 0;
    this.isVolumeControlOpen = false;

    this.engine = null;
    this.dragDrop = null;
    this.stateBeforeOverlay = null;
    this.toastTimer = null;
    this.battleAnimTimer = null;
    this.isAwaitingPokeballThrow = false;
    this.isDraggingPokeball = false;
    this.pokeballThrowRaf = null;
    this.pokeballPointerId = null;
    this.pokeballDragStart = null;
    this.pokeballLastPoint = null;
    this.pokeballRenderSize = 32;
    this.pokeballRadius = 16;
    this.pokeballMaxPull = 170;
    this.pokeballPower = 0.34;
    this.pokeballGravity = 0.28;
    this.pokeballAirDrag = 0.995;
    this.pokeballTrajectoryDots = 44;
    this.selectedPokeballIndex = 0;
    this.pokeballChoices = [
      "몬스터볼", "슈퍼볼", "하이퍼볼", "마스터볼", "네이처볼", "스피드볼",
      "다이브볼", "문볼", "네스트볼", "러브볼", "헤비볼", "레벨볼",
      "퀵볼", "프리미어볼", "럭셔리볼", "다크볼", "사파리볼", "타이머볼",
      "넷볼", "울트라볼", "드림볼", "루어볼", "프렌드볼", "레드볼",
      "썬볼", "페어리볼"
    ];
    this.captureRecorder = null;
    this.captureChunks = [];
    this.captureFrameId = null;
    this.captureTimeoutId = null;
    this.captureCanvas = null;
    this.captureStream = null;
    this.captureVideoUrls = {};
    this.captureDbName = "dev_pokedex_capture_videos";
    this.captureStoreName = "videos";
    this.customItems = [];
    this.itemPixels = Array(16 * 16).fill("");
    this.itemDrawColor = "#2d5da8";
    this.itemPalette = ["#111111", "#ffffff", "#b81d24", "#f1c232", "#70a85f", "#2d5da8", "#8a4fb8", "#f28c28"];
  }

  init() {
    // 0. 배틀 스프라이트 이미지 선로드 (캐시)
    window.GameEngine.preloadBattleSprites();

    // 1. GPS 위치 확인 (Geolocation API)
    this.getTrainerLocation();

    // 2. 로컬 스토리지 데이터 로드 (Web Storage API)
    this.loadGameState();
    this.loadCaptureVideos();
    this.loadCustomItems();

    // 2-1. 인트로/엔딩 별 파티클 렌더
    this.createStarField("intro-star-field", 72);
    this.createStarField("ending-star-bg", 96);

    // 3. 엔진 구동
    this.engine = new window.GameEngine("world-canvas", () => this.startEncounter());

    // 4. 옷입히기 D&D 바인딩 (Drag & Drop API)
    this.dragDrop = new window.DragDropManager(this);

    // 5. 돔 이벤트 매핑
    this.bindDomEvents();
    this.initCustomItemMaker();
    this.renderItemInventory();

    // 6. 도감 목록 초기 렌더
    this.renderPokedexList();
  }

  createStarField(containerId, count) {
    const container = document.getElementById(containerId);
    if (!container || container.childElementCount > 0) return;

    for (let i = 0; i < count; i++) {
      const star = document.createElement("span");
      const size = Math.random() > 0.82 ? 3 : 2;
      star.className = "star";
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.setProperty("--dur", `${1.8 + Math.random() * 3.4}s`);
      star.style.setProperty("--delay", `${Math.random() * 2.5}s`);
      container.appendChild(star);
    }
  }


  getTrainerLocation() {
    const geoText = document.getElementById("geo-info");
    if (!navigator.geolocation) {
      geoText.textContent = "GPS 미지원 브라우저입니다.";
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(2);
        const lon = position.coords.longitude.toFixed(2);
        this.trainerLocation = `${lat}, ${lon}`;
        geoText.textContent = `GPS 감지: 트레이너 위치 [${this.trainerLocation}]`;
        document.getElementById("hud-trainer-name").textContent = `트레이너 (L.35)`;
        document.getElementById("player-trainer-name").textContent = `지우 (GPS:${lat})`;
      },
      (error) => {
        console.warn("GPS 수신 동의 안 됨:", error);
        geoText.textContent = "위치 미동의: 태초마을 트레이너로 등록됨.";
        document.getElementById("hud-trainer-name").textContent = "트레이너 지우";
        document.getElementById("player-trainer-name").textContent = "지우";
      }
    );
  }

  loadGameState() {
    try {
      const saved = localStorage.getItem("dev_pokedex_save_fs");
      if (saved) {
        const parsed = JSON.parse(saved);
        this.capturedDevs = parsed.capturedDevs || [];
        if (parsed.developersState) {
          window.DEVELOPERS.forEach(dev => {
            const savedState = parsed.developersState.find(s => s.id === dev.id);
            if (savedState) {
              dev.equipped = savedState.equipped || [];
              dev.stats = savedState.stats || dev.stats;
            }
          });
        }
        console.log("세이브 파일 정상 로드:", this.capturedDevs);
      }
    } catch (e) {
      console.error("세이브 파싱 오류:", e);
    }
  }

  loadCustomItems() {
    try {
      const saved = localStorage.getItem("dev_pokedex_custom_items_fs");
      if (!saved) return;
      this.registerCustomItems(JSON.parse(saved));
    } catch (e) {
      console.error("커스텀 아이템 로드 오류:", e);
    }
  }

  registerCustomItems(items) {
    if (!Array.isArray(items)) return;

    items.forEach(item => {
      if (!item || !item.id || !item.imageData || !item.statsBoost) return;
      if (!item.id.startsWith("custom_")) return;

      const normalized = {
        id: item.id,
        name: item.name || "직접 그린 아이템",
        description: item.description || "직접 그려 만든 커스텀 장비입니다.",
        imageData: item.imageData,
        statsBoost: item.statsBoost,
        isCustom: true
      };

      if (!this.customItems.some(saved => saved.id === normalized.id)) {
        this.customItems.push(normalized);
      }

      const itemIndex = window.ITEMS.findIndex(saved => saved.id === normalized.id);
      if (itemIndex >= 0) {
        window.ITEMS[itemIndex] = normalized;
      } else {
        window.ITEMS.push(normalized);
      }
    });
  }

  saveCustomItems() {
    try {
      localStorage.setItem("dev_pokedex_custom_items_fs", JSON.stringify(this.customItems));
    } catch (e) {
      console.error("커스텀 아이템 저장 오류:", e);
    }
  }

  saveGameState() {
    try {
      const stateToSave = {
        capturedDevs: this.capturedDevs,
        customItems: this.customItems,
        developersState: window.DEVELOPERS.map(d => ({
          id: d.id,
          equipped: d.equipped,
          stats: d.stats
        }))
      };
      localStorage.setItem("dev_pokedex_save_fs", JSON.stringify(stateToSave));
    } catch (e) {
      console.error("세이브 작성 오류:", e);
    }
  }

  openCaptureDb() {
    return new Promise((resolve, reject) => {
      if (!("indexedDB" in window)) {
        reject(new Error("IndexedDB is not supported"));
        return;
      }

      const request = indexedDB.open(this.captureDbName, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.captureStoreName)) {
          db.createObjectStore(this.captureStoreName, { keyPath: "id" });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async loadCaptureVideos() {
    try {
      const db = await this.openCaptureDb();
      const tx = db.transaction(this.captureStoreName, "readonly");
      const store = tx.objectStore(this.captureStoreName);
      const request = store.getAll();
      request.onsuccess = () => {
        request.result.forEach(record => this.setCaptureVideoUrl(record.id, record.blob));
      };
      tx.oncomplete = () => db.close();
      tx.onerror = () => db.close();
    } catch (e) {
      console.warn("capture video load skipped:", e);
    }
  }

  async loadCaptureVideoForDev(devId) {
    if (this.captureVideoUrls[devId]) return this.captureVideoUrls[devId];

    try {
      const db = await this.openCaptureDb();
      const tx = db.transaction(this.captureStoreName, "readonly");
      const store = tx.objectStore(this.captureStoreName);
      const record = await new Promise((resolve, reject) => {
        const request = store.get(devId);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      db.close();
      if (record?.blob) return this.setCaptureVideoUrl(devId, record.blob);
    } catch (e) {
      console.warn("capture video load failed:", e);
    }

    return null;
  }

  setCaptureVideoUrl(devId, blob) {
    if (!devId || !blob) return null;
    if (this.captureVideoUrls[devId]) URL.revokeObjectURL(this.captureVideoUrls[devId]);
    const url = URL.createObjectURL(blob);
    this.captureVideoUrls[devId] = url;
    return url;
  }

  async saveCaptureVideo(devId, blob) {
    if (!devId || !blob || blob.size === 0) return;

    this.setCaptureVideoUrl(devId, blob);
    if (this.currentSelectedDevId === devId) {
      const dev = window.DEVELOPERS.find(item => item.id === devId);
      if (dev) this.updatePokedexVideo(dev);
    }

    try {
      const db = await this.openCaptureDb();
      const tx = db.transaction(this.captureStoreName, "readwrite");
      tx.objectStore(this.captureStoreName).put({
        id: devId,
        blob,
        mimeType: blob.type,
        updatedAt: Date.now()
      });
      await new Promise((resolve, reject) => {
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
      });
      db.close();
    } catch (e) {
      console.warn("capture video save failed:", e);
    }
  }

  getRecorderMimeType() {
    const candidates = [
      "video/webm;codecs=vp9",
      "video/webm;codecs=vp8",
      "video/webm"
    ];
    return candidates.find(type => window.MediaRecorder?.isTypeSupported(type)) || "";
  }

  startCaptureRecording(devId) {
    if (!window.MediaRecorder || this.captureRecorder) return;

    try {
      const canvas = document.createElement("canvas");
      canvas.width = 768;
      canvas.height = 432;
      const ctx = canvas.getContext("2d");
      const stream = canvas.captureStream(30);
      const mimeType = this.getRecorderMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

      this.captureCanvas = canvas;
      this.captureStream = stream;
      this.captureChunks = [];
      this.captureRecorder = recorder;
      this.captureRecordingDevId = devId;

      recorder.ondataavailable = event => {
        if (event.data && event.data.size > 0) this.captureChunks.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(this.captureChunks, { type: recorder.mimeType || "video/webm" });
        this.saveCaptureVideo(this.captureRecordingDevId, blob);
        this.cleanupCaptureRecording();
      };

      const draw = () => {
        this.drawCaptureFrame(ctx, canvas);
        this.captureFrameId = requestAnimationFrame(draw);
      };

      draw();
      recorder.start(250);
      this.captureTimeoutId = setTimeout(() => this.stopCaptureRecording(), 9000);
    } catch (e) {
      console.warn("capture recording could not start:", e);
      this.cleanupCaptureRecording();
    }
  }

  stopCaptureRecording() {
    if (!this.captureRecorder) return;
    if (this.captureTimeoutId) clearTimeout(this.captureTimeoutId);
    this.captureTimeoutId = null;

    try {
      if (this.captureRecorder.state !== "inactive") {
        this.captureRecorder.stop();
      }
    } catch (e) {
      console.warn("capture recording could not stop:", e);
      this.cleanupCaptureRecording();
    }
  }

  cleanupCaptureRecording() {
    if (this.captureFrameId) cancelAnimationFrame(this.captureFrameId);
    this.captureFrameId = null;
    this.captureTimeoutId = null;
    if (this.captureStream) {
      this.captureStream.getTracks().forEach(track => track.stop());
    }
    this.captureRecorder = null;
    this.captureChunks = [];
    this.captureCanvas = null;
    this.captureStream = null;
    this.captureRecordingDevId = null;
  }

  drawCaptureFrame(ctx, canvas) {
    const panel = document.getElementById("panel-battle");
    const panelRect = panel?.getBoundingClientRect();
    if (!panelRect || panelRect.width === 0 || panelRect.height === 0) return;

    const sx = canvas.width / panelRect.width;
    const sy = canvas.height / panelRect.height;
    const mapRect = rect => ({
      x: (rect.left - panelRect.left) * sx,
      y: (rect.top - panelRect.top) * sy,
      w: rect.width * sx,
      h: rect.height * sy
    });

    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const arena = panel.querySelector(".battle-arena");
    const arenaBox = mapRect(arena.getBoundingClientRect());
    const sky = ctx.createLinearGradient(0, arenaBox.y, 0, arenaBox.y + arenaBox.h);
    sky.addColorStop(0, "#cfefff");
    sky.addColorStop(0.43, "#cfefff");
    sky.addColorStop(0.48, "#fff8d8");
    sky.addColorStop(1, "#b9d976");
    ctx.fillStyle = sky;
    ctx.fillRect(arenaBox.x, arenaBox.y, arenaBox.w, arenaBox.h);
    this.drawCaptureFieldOval(ctx, arenaBox.x + arenaBox.w * 0.25, arenaBox.y + arenaBox.h * 0.78, arenaBox.w * 0.22, arenaBox.h * 0.08);
    this.drawCaptureFieldOval(ctx, arenaBox.x + arenaBox.w * 0.72, arenaBox.y + arenaBox.h * 0.36, arenaBox.w * 0.19, arenaBox.h * 0.08);

    this.drawCaptureHud(ctx, panel, ".enemy-hud", mapRect);
    this.drawCaptureHud(ctx, panel, ".player-hud", mapRect);
    this.drawCaptureSprite(ctx, "enemy-battle-canvas", mapRect);
    this.drawCaptureSprite(ctx, "player-battle-canvas", mapRect);
    this.drawCapturePokeball(ctx, mapRect);
    this.drawCaptureDialogue(ctx, panel, mapRect);
  }

  drawCaptureFieldOval(ctx, cx, cy, rx, ry) {
    ctx.fillStyle = "#7fa85a";
    ctx.strokeStyle = "rgba(39,80,32,0.6)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  drawCaptureHud(ctx, panel, selector, mapRect) {
    const hud = panel.querySelector(selector);
    if (!hud) return;
    const box = mapRect(hud.getBoundingClientRect());
    const name = hud.querySelector(".hud-name")?.textContent || "";
    const level = hud.querySelector(".hud-lv")?.textContent || "";
    const hpFill = hud.querySelector(".hud-hp-fill");
    const hpPercent = hpFill ? parseFloat(hpFill.style.width || "100") : 100;

    ctx.fillStyle = "#fffdf4";
    ctx.strokeStyle = "#1f2933";
    ctx.lineWidth = 3;
    ctx.fillRect(box.x, box.y, box.w, box.h);
    ctx.strokeRect(box.x, box.y, box.w, box.h);
    ctx.fillStyle = "#1f2933";
    ctx.font = "bold 14px monospace";
    ctx.fillText(name.slice(0, 18), box.x + 12, box.y + 20);
    ctx.fillText(level, box.x + box.w - 52, box.y + 20);
    ctx.fillText("HP:", box.x + 12, box.y + 44);
    ctx.strokeRect(box.x + 48, box.y + 34, box.w - 70, 12);
    ctx.fillStyle = "#55c76a";
    ctx.fillRect(box.x + 50, box.y + 36, Math.max(0, (box.w - 74) * hpPercent / 100), 8);
  }

  drawCaptureSprite(ctx, canvasId, mapRect) {
    const sprite = document.getElementById(canvasId);
    if (!sprite || sprite.style.visibility === "hidden") return;
    const box = mapRect(sprite.getBoundingClientRect());
    ctx.drawImage(sprite, box.x, box.y, box.w, box.h);
  }

  drawCapturePokeball(ctx, mapRect) {
    const pokeball = document.getElementById("pokeball-actor");
    if (!pokeball || pokeball.classList.contains("hidden")) return;
    const box = mapRect(pokeball.getBoundingClientRect());
    const radius = Math.min(box.w, box.h) / 2;
    const cx = box.x + box.w / 2;
    const cy = box.y + box.h / 2;

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = "#f34747";
    ctx.fillRect(cx - radius, cy - radius, radius * 2, radius);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(cx - radius, cy, radius * 2, radius);
    ctx.restore();

    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - radius, cy);
    ctx.lineTo(cx + radius, cy);
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  drawCaptureDialogue(ctx, panel, mapRect) {
    const dialogue = panel.querySelector(".battle-dialogue-container");
    const message = document.getElementById("battle-message")?.textContent || "";
    if (!dialogue) return;
    const box = mapRect(dialogue.getBoundingClientRect());
    ctx.fillStyle = "#fffdf4";
    ctx.strokeStyle = "#1f2933";
    ctx.lineWidth = 4;
    ctx.fillRect(box.x + 8, box.y + 10, box.w - 16, box.h - 20);
    ctx.strokeRect(box.x + 8, box.y + 10, box.w - 16, box.h - 20);
    ctx.fillStyle = "#1f2933";
    ctx.font = "bold 16px monospace";
    this.drawWrappedCaptureText(ctx, message, box.x + 28, box.y + 42, box.w - 56, 22);
  }

  drawWrappedCaptureText(ctx, text, x, y, maxWidth, lineHeight) {
    const chars = [...text];
    let line = "";
    let currentY = y;

    chars.forEach(char => {
      const testLine = line + char;
      if (ctx.measureText(testLine).width > maxWidth && line) {
        ctx.fillText(line, x, currentY);
        line = char;
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    });

    if (line) ctx.fillText(line, x, currentY);
  }

  resetGameState() {
    if (confirm("모든 세이브 데이터를 정말로 삭제하시겠습니까?\n처음부터 모험을 다시 진행해야 합니다.")) {
      localStorage.removeItem("dev_pokedex_save_fs");
      localStorage.removeItem("dev_pokedex_custom_items_fs");
      if ("indexedDB" in window) indexedDB.deleteDatabase(this.captureDbName);
      location.reload();
    }
  }

  // 레트로 스타일 텍스트 한 자씩 타이핑하는 연출 (Typing Effect)
  typeWriter(elementId, text, callback = null) {
    const el = document.getElementById(elementId);
    if (!el) return;

    // 기존 타이핑 타이머가 돌고 있다면 취소
    if (this.typingTimer) {
      clearInterval(this.typingTimer);
    }

    el.textContent = "";
    let charIndex = 0;

    this.typingTimer = setInterval(() => {
      if (charIndex < text.length) {
        el.textContent += text.charAt(charIndex);
        // 타이핑 시 미세한 retro 틱음 재생
        if (charIndex % 2 === 0) {
          window.audioManager.playTone(350, "sine", 0.02, 0.02);
        }
        charIndex++;
      } else {
        clearInterval(this.typingTimer);
        this.typingTimer = null;
        if (callback) callback();
      }
    }, 45); // 적당히 긴박하고 빠른 출력 속도
  }

  bindDomEvents() {
    document.getElementById("btn-reset-save").addEventListener("click", () => this.resetGameState());
    document.getElementById("btn-close-dex").addEventListener("click", () => this.closePokedexOverlay());
    const triggerStart = (e) => {
      this.handleStartAction();
    };
    const introPanel = document.getElementById("panel-intro");
    introPanel.addEventListener("click", triggerStart);
    introPanel.addEventListener("touchstart", triggerStart, { passive: true });
    document.getElementById("panel-dialogue").addEventListener("click", () => this.advanceDialogue());

    // 배틀 기본 조작 단추
    document.getElementById("btn-fight").addEventListener("click", () => this.showQuizInterface());
    document.getElementById("btn-hint").addEventListener("click", () => this.showQuizHint());
    document.getElementById("btn-battle-dex").addEventListener("click", () => this.openPokedexOverlay());
    document.getElementById("btn-run").addEventListener("click", () => this.runFromBattle());
    this.bindPokeballThrowEvents();
    this.renderPokeballPicker();

    // 키보드 실시간 체크 등록
    document.addEventListener("keydown", (e) => {
      if (this.isPokedexOpen()) {
        if (e.key === "Escape" || e.key === "b" || e.key === "B") {
          e.preventDefault();
          this.closePokedexOverlay();
        }
        return;
      }

      if (this.isMenuOpen) {
        if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
          e.preventDefault();
          this.changeMenuSelection(-1);
        } else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
          e.preventDefault();
          this.changeMenuSelection(1);
        } else if (e.key === "Enter" || e.key === "a" || e.key === "A" || e.key === " ") {
          e.preventDefault();
          this.executeMenuAction();
        } else if (e.key === "Escape" || e.key === "b" || e.key === "B") {
          e.preventDefault();
          this.toggleInGameMenu(false);
        }
        return;
      }

      if (this.currentGameState === this.STATE_WORLD) {
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "s", "a", "d", "W", "S", "A", "D"].includes(e.key)) {
          e.preventDefault();
        }
        this.engine.keysPressed[e.key] = true;
        if (e.key === "Enter") {
          e.preventDefault();
          this.toggleInGameMenu(true);
        }
      } else if (this.currentGameState === this.STATE_INTRO) {
        if (e.key === "Enter") this.handleStartAction();
      } else if (this.currentGameState === this.STATE_DIALOGUE) {
        if (e.key === "Enter" || e.key === "a" || e.key === "A" || e.key === " ") {
          this.advanceDialogue();
        }
      } else if (this.currentGameState === this.STATE_BATTLE) {
        const quizBox = document.getElementById("battle-quiz-box");
        const isQuizOpen = quizBox && !quizBox.classList.contains("hidden");

        if (["1", "2", "3", "4"].includes(e.key) && isQuizOpen) {
          e.preventDefault();
          this.handleQuizAnswer(Number(e.key) - 1);
        } else if (e.key === "Enter" || e.key === "a" || e.key === "A" || e.key === " ") {
          e.preventDefault();
          if (!isQuizOpen) this.showQuizInterface();
        } else if (e.key === "Escape" || e.key === "b" || e.key === "B") {
          e.preventDefault();
          this.handlePhysicalBButton();
        }
      } else if (this.currentGameState === this.STATE_ENDING) {
        if (e.key === "Enter" || e.key === "a" || e.key === "A") {
          e.preventDefault();
          this.openPokedexOverlay();
        } else if (e.key === "Escape" || e.key === "b" || e.key === "B") {
          e.preventDefault();
          this.switchGameState(this.STATE_WORLD);
        }
      }
    });

    document.addEventListener("keyup", (e) => {
      if (this.currentGameState === this.STATE_WORLD) {
        this.engine.keysPressed[e.key] = false;
      }
    });

    // 모바일 조이스틱
    const mapTouchKey = (btnId, keyName) => {
      const btn = document.getElementById(btnId);
      const setPressed = (val) => {
        if (this.currentGameState === this.STATE_WORLD && !this.isMenuOpen) {
          this.engine.keysPressed[keyName] = val;
        }
      };
      btn.addEventListener("mousedown", (e) => { e.preventDefault(); setPressed(true); });
      btn.addEventListener("mouseup", (e) => { e.preventDefault(); setPressed(false); });
      btn.addEventListener("touchstart", (e) => { e.preventDefault(); setPressed(true); });
      btn.addEventListener("touchend", (e) => { e.preventDefault(); setPressed(false); });
    };

    mapTouchKey("touch-up", "ArrowUp");
    mapTouchKey("touch-down", "ArrowDown");
    mapTouchKey("touch-left", "ArrowLeft");
    mapTouchKey("touch-right", "ArrowRight");

    // 모바일 터치 단추
    const bindTouchAction = (id, callback) => {
      const btn = document.getElementById(id);
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        callback();
      });
    };

    bindTouchAction("touch-a", () => {
      if (this.isPokedexOpen()) {
        return;
      } else if (this.isMenuOpen) {
        this.executeMenuAction();
      } else if (this.currentGameState === this.STATE_ENDING) {
        this.openPokedexOverlay();
      } else {
        this.handlePhysicalAButton();
      }
    });
    bindTouchAction("touch-b", () => {
      if (this.isPokedexOpen()) {
        this.closePokedexOverlay();
      } else if (this.isMenuOpen) {
        this.toggleInGameMenu(false);
      } else if (this.currentGameState === this.STATE_ENDING) {
        this.switchGameState(this.STATE_WORLD);
      } else {
        this.handlePhysicalBButton();
      }
    });
    bindTouchAction("touch-start", () => {
      if (this.currentGameState === this.STATE_WORLD) {
        this.toggleInGameMenu(!this.isMenuOpen);
      }
    });
    bindTouchAction("touch-sound", () => this.executeMuteToggle());
    bindTouchAction("touch-volume-toggle", () => this.toggleVolumeControl());
    const volumeSlider = document.getElementById("touch-volume");
    if (volumeSlider) {
      volumeSlider.addEventListener("input", (e) => this.executeVolumeChange(e.target.value));
      volumeSlider.addEventListener("change", (e) => this.executeVolumeChange(e.target.value, true));
    }
    document.addEventListener("click", (e) => {
      if (!this.isVolumeControlOpen) return;
      const buttonPad = document.querySelector(".button-pad");
      if (buttonPad && !buttonPad.contains(e.target)) {
        this.toggleVolumeControl(false);
      }
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isVolumeControlOpen) {
        this.toggleVolumeControl(false);
      }
    });
    this.initControllerWidgets();

    // 도감 열기
    document.getElementById("dex-list-ul").addEventListener("click", (e) => {
      const item = e.target.closest(".dex-li-item");
      if (!item || item.classList.contains("locked")) return;
      this.selectPokedexDeveloper(item.getAttribute("data-id"));
    });

    document.getElementById("menu-opt-pokedex").addEventListener("click", () => {
      this.toggleInGameMenu(false);
      this.openPokedexOverlay();
    });
    document.getElementById("menu-opt-save").addEventListener("click", () => this.executeSaveReport());
    document.getElementById("menu-opt-mute").addEventListener("click", () => this.executeMuteToggle());
    document.getElementById("menu-opt-close").addEventListener("click", () => this.toggleInGameMenu(false));
    document.getElementById("btn-ending-dex").addEventListener("click", () => this.openPokedexOverlay());
    document.getElementById("btn-ending-world").addEventListener("click", () => this.switchGameState(this.STATE_WORLD));
    this.updateSoundToggleDom();
  }

  handleStartAction() {
    if (this.currentGameState !== this.STATE_INTRO) return;

    const video = document.getElementById("intro-video");
    if (video) video.pause();
    window.audioManager.initContext();
    window.audioManager.playTone(880, "square", 0.12, 0.1);

    this.dialogueQueue = [
      "오박사: 앗! 안녕하신가! 포켓몬스터 개발자 월드에 오신 것을 대환영하네!",
      `오박사: 자네는 GPS [ ${this.trainerLocation} ] 근처에서 온 신예 트레이너로군!`,
      "오박사: 이 숲 속의 무성한 수풀을 돌아다니다 보면 전설의 개발자몬들이 출현한다네.",
      "오박사: 출현한 개발자몬들에게 퀴즈를 내어 정답을 맞추면 동료로 영입할 수 있지!",
      "오박사: 숲을 걷다가 [Enter 키 / MENU 버튼]을 누르면 메뉴창을 열 수 있어.",
      "오박사: 영입 완료한 개발자몬에게는 도감에서 최적의 고성능 장비를 장착시켜줄 수 있다네.",
      "오박사: 자! 그럼 전설의 도감을 완성하러 모험의 세계로 출발하세!"
    ];
    this.dialogueIndex = 0;

    this.switchGameState(this.STATE_DIALOGUE);
    this.advanceDialogue();
  }

  switchGameState(state) {
    if (state !== this.STATE_WORLD && this.engine) {
      this.engine.stop();
    }

    if (state !== this.STATE_BATTLE) {
      this.activeQuiz = null;
      this.isResolvingQuiz = false;
      this.resetPokeballThrowState();
    }

    this.currentGameState = state;
    
    // 배틀 상태가 아닐 때 배틀 애니메이션 루프 해제
    if (state !== this.STATE_BATTLE && this.battleAnimTimer) {
      clearInterval(this.battleAnimTimer);
      this.battleAnimTimer = null;
    }

    document.getElementById("panel-intro").classList.add("hidden");
    document.getElementById("panel-dialogue").classList.add("hidden");
    document.getElementById("panel-world").classList.add("hidden");
    document.getElementById("panel-battle").classList.add("hidden");
    document.getElementById("panel-ending").classList.add("hidden");

    if (state === this.STATE_INTRO) {
      document.getElementById("panel-intro").classList.remove("hidden");
      const video = document.getElementById("intro-video");
      if (video) video.play().catch(() => console.log("인트로 비디오 차단 우회"));
    } else if (state === this.STATE_DIALOGUE) {
      document.getElementById("panel-dialogue").classList.remove("hidden");
      window.audioManager.playBgm("town");
    } else if (state === this.STATE_WORLD) {
      document.getElementById("panel-world").classList.remove("hidden");
      window.audioManager.playBgm("town");
      this.engine.start();
    } else if (state === this.STATE_BATTLE) {
      document.getElementById("panel-battle").classList.remove("hidden");
      window.audioManager.playBgm("battle");
    } else if (state === this.STATE_ENDING) {
      document.getElementById("panel-ending").classList.remove("hidden");
      window.audioManager.playBgm("town");
      this.renderEndingShowcase();
    }
  }

  advanceDialogue() {
    if (this.dialogueIndex < this.dialogueQueue.length) {
      this.typeWriter("dialogue-text-content", this.dialogueQueue[this.dialogueIndex]);
      this.dialogueIndex++;
    } else {
      this.switchGameState(this.STATE_WORLD);
    }
  }

  handlePhysicalAButton() {
    if (this.currentGameState === this.STATE_INTRO) {
      this.handleStartAction();
    } else if (this.currentGameState === this.STATE_DIALOGUE) {
      this.advanceDialogue();
    } else if (this.currentGameState === this.STATE_BATTLE) {
      if (document.getElementById("battle-quiz-box").classList.contains("hidden")) {
        this.showQuizInterface();
      }
    }
  }

  handlePhysicalBButton() {
    if (this.currentGameState === this.STATE_BATTLE) {
      document.getElementById("battle-quiz-box").classList.add("hidden");
      document.getElementById("battle-main-controls").classList.remove("hidden");
    }
  }

  toggleInGameMenu(isOpen) {
    this.isMenuOpen = isOpen;
    const menuEl = document.getElementById("ingame-menu");
    
    if (isOpen) {
      this.engine.stop();
      menuEl.classList.remove("hidden");
      window.audioManager.playTone(660, "square", 0.06, 0.05);
      this.menuSelectedIndex = 0;
      this.updateMenuDom();
    } else {
      menuEl.classList.add("hidden");
      if (this.currentGameState === this.STATE_WORLD) {
        this.engine.start();
      }
    }
  }

  changeMenuSelection(dir) {
    this.menuSelectedIndex = (this.menuSelectedIndex + dir + this.menuOptions.length) % this.menuOptions.length;
    window.audioManager.playTone(440, "square", 0.04, 0.05);
    this.updateMenuDom();
  }

  updateMenuDom() {
    const listItems = document.querySelectorAll(".menu-item");
    listItems.forEach((li, idx) => {
      if (idx === this.menuSelectedIndex) {
        li.classList.add("active-item");
      } else {
        li.classList.remove("active-item");
      }
    });
  }

  executeMenuAction() {
    const action = this.menuOptions[this.menuSelectedIndex];
    if (action === "pokedex") {
      this.toggleInGameMenu(false);
      this.openPokedexOverlay();
    } else if (action === "save") {
      this.executeSaveReport();
    } else if (action === "mute") {
      this.executeMuteToggle();
    } else if (action === "close") {
      this.toggleInGameMenu(false);
    }
  }

  executeSaveReport() {
    window.audioManager.playTone(880, "square", 0.1, 0.05);
    setTimeout(() => { window.audioManager.playTone(1320, "square", 0.2, 0.05); }, 80);
    this.saveGameState();
    this.showTemporaryToast("리포트 저장 완료!");
    setTimeout(() => {
      this.toggleInGameMenu(false);
    }, 700);
  }

  executeMuteToggle() {
    const isMuted = window.audioManager.toggleMute();
    this.updateSoundToggleDom();
    window.audioManager.playTone(660, "square", 0.05, 0.05);
  }

  executeVolumeChange(value, playPreview = false) {
    const volume = window.audioManager.setVolume(Number(value) / 100);
    this.updateSoundToggleDom();
    if (playPreview && !window.audioManager.isMuted && volume > 0) {
      window.audioManager.playTone(660, "square", 0.05, 0.05);
    }
  }

  toggleVolumeControl(forceOpen = null) {
    this.isVolumeControlOpen = forceOpen === null ? !this.isVolumeControlOpen : forceOpen;
    this.updateSoundToggleDom();
  }

  initControllerWidgets() {
    const widgets = [
      { key: "arrow", selector: ".arrow-key-pad", storageKey: "pixelGameArrowPadOffset" },
      { key: "buttons", selector: ".button-pad", storageKey: "pixelGameButtonPadOffset" }
    ];
    let activeLayoutKey = this.getControllerLayoutKey();

    widgets.forEach((widget) => {
      const el = document.querySelector(widget.selector);
      const handle = document.querySelector(`[data-controller-drag="${widget.key}"]`);
      if (!el || !handle) return;

      this.applyControllerOffset(el, this.loadControllerOffset(this.getControllerStorageKey(widget.storageKey, activeLayoutKey)));
      requestAnimationFrame(() => {
        const clamped = this.clampControllerOffset(el, this.getControllerOffset(el));
        this.applyControllerOffset(el, clamped);
        this.saveControllerOffset(this.getControllerStorageKey(widget.storageKey, activeLayoutKey), clamped);
      });

      let dragState = null;
      const startDrag = (e, pointerId = null) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleVolumeControl(false);
        if (pointerId !== null && handle.setPointerCapture) {
          try {
            handle.setPointerCapture(pointerId);
          } catch (captureError) {}
        }
        handle.classList.add("is-dragging");
        dragState = {
          pointerId,
          startX: e.clientX,
          startY: e.clientY,
          offset: this.getControllerOffset(el)
        };
      };
      const updateDrag = (clientX, clientY) => {
        if (!dragState) return;
        const nextOffset = this.clampControllerOffset(el, {
          x: dragState.offset.x + clientX - dragState.startX,
          y: dragState.offset.y + clientY - dragState.startY
        });
        this.applyControllerOffset(el, nextOffset);
      };
      const endDrag = () => {
        if (!dragState) return;
        handle.classList.remove("is-dragging");
        this.saveControllerOffset(this.getControllerStorageKey(widget.storageKey, activeLayoutKey), this.getControllerOffset(el));
        dragState = null;
      };

      handle.addEventListener("pointerdown", (e) => {
        if (e.button !== undefined && e.button !== 0) return;
        startDrag(e, e.pointerId);
      });
      document.addEventListener("pointermove", (e) => {
        if (!dragState || (dragState.pointerId !== null && e.pointerId !== dragState.pointerId)) return;
        e.preventDefault();
        updateDrag(e.clientX, e.clientY);
      });
      document.addEventListener("pointerup", endDrag);
      document.addEventListener("pointercancel", endDrag);
      handle.addEventListener("mousedown", (e) => {
        if (e.button !== 0) return;
        startDrag(e, null);
      });
      document.addEventListener("mousemove", (e) => {
        if (!dragState) return;
        e.preventDefault();
        updateDrag(e.clientX, e.clientY);
      });
      document.addEventListener("mouseup", endDrag);
      handle.addEventListener("touchstart", (e) => {
        const touch = e.changedTouches[0];
        if (!touch) return;
        startDrag(touch, touch.identifier);
      }, { passive: false });
      document.addEventListener("touchmove", (e) => {
        if (!dragState) return;
        const touch = Array.from(e.changedTouches).find((item) => item.identifier === dragState.pointerId);
        if (!touch) return;
        e.preventDefault();
        updateDrag(touch.clientX, touch.clientY);
      }, { passive: false });
      document.addEventListener("touchend", endDrag);
      document.addEventListener("touchcancel", endDrag);
      handle.addEventListener("dblclick", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.applyControllerOffset(el, { x: 0, y: 0 });
        this.saveControllerOffset(this.getControllerStorageKey(widget.storageKey, activeLayoutKey), { x: 0, y: 0 });
      });
    });

    window.addEventListener("resize", () => {
      const nextLayoutKey = this.getControllerLayoutKey();
      const didLayoutChange = nextLayoutKey !== activeLayoutKey;
      activeLayoutKey = nextLayoutKey;

      widgets.forEach((widget) => {
        const el = document.querySelector(widget.selector);
        if (!el) return;
        if (didLayoutChange) {
          this.applyControllerOffset(el, this.loadControllerOffset(this.getControllerStorageKey(widget.storageKey, activeLayoutKey)));
        }
        const clamped = this.clampControllerOffset(el, this.getControllerOffset(el));
        this.applyControllerOffset(el, clamped);
        this.saveControllerOffset(this.getControllerStorageKey(widget.storageKey, activeLayoutKey), clamped);
      });
    });
  }

  getControllerLayoutKey() {
    return window.matchMedia("(max-width: 900px), (max-aspect-ratio: 1.4)").matches ? "compact" : "wide";
  }

  getControllerStorageKey(baseKey, layoutKey) {
    return `${baseKey}:${layoutKey}`;
  }

  loadControllerOffset(storageKey) {
    try {
      const saved = JSON.parse(window.localStorage.getItem(storageKey) || "null");
      if (!saved || !Number.isFinite(saved.x) || !Number.isFinite(saved.y)) {
        return { x: 0, y: 0 };
      }
      return { x: saved.x, y: saved.y };
    } catch (e) {
      return { x: 0, y: 0 };
    }
  }

  saveControllerOffset(storageKey, offset) {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(offset));
    } catch (e) {}
  }

  getControllerOffset(el) {
    return {
      x: Number(el.dataset.dragX || 0),
      y: Number(el.dataset.dragY || 0)
    };
  }

  applyControllerOffset(el, offset) {
    const rounded = {
      x: Math.round(offset.x),
      y: Math.round(offset.y)
    };
    el.dataset.dragX = String(rounded.x);
    el.dataset.dragY = String(rounded.y);
    el.style.setProperty("--controller-drag-x", `${rounded.x}px`);
    el.style.setProperty("--controller-drag-y", `${rounded.y}px`);
  }

  clampControllerOffset(el, nextOffset) {
    const currentOffset = this.getControllerOffset(el);
    const rect = el.getBoundingClientRect();
    const margin = 8;
    const projected = {
      left: rect.left + nextOffset.x - currentOffset.x,
      right: rect.right + nextOffset.x - currentOffset.x,
      top: rect.top + nextOffset.y - currentOffset.y,
      bottom: rect.bottom + nextOffset.y - currentOffset.y
    };

    let x = nextOffset.x;
    let y = nextOffset.y;

    if (projected.left < margin) x += margin - projected.left;
    if (projected.right > window.innerWidth - margin) x -= projected.right - (window.innerWidth - margin);
    if (projected.top < margin) y += margin - projected.top;
    if (projected.bottom > window.innerHeight - margin) y -= projected.bottom - (window.innerHeight - margin);

    return { x, y };
  }

  updateSoundToggleDom() {
    const isMuted = window.audioManager.isMuted;
    const volumePercent = Math.round(window.audioManager.masterVolume * 100);
    const menuItem = document.getElementById("menu-opt-mute");
    const soundButton = document.getElementById("touch-sound");
    const buttonPad = document.querySelector(".button-pad");
    const volumeToggle = document.getElementById("touch-volume-toggle");
    const volumeSlider = document.getElementById("touch-volume");
    const volumeValue = document.getElementById("touch-volume-value");

    if (menuItem) {
      menuItem.textContent = isMuted ? "🎵 소리 켜기" : "🔇 소리 끄기";
    }
    if (soundButton) {
      soundButton.textContent = isMuted ? "소리 OFF" : "소리 ON";
      soundButton.setAttribute("aria-pressed", String(!isMuted));
      soundButton.classList.toggle("sound-off", isMuted);
      soundButton.classList.toggle("sound-on", !isMuted);
    }
    if (buttonPad) {
      buttonPad.classList.toggle("is-volume-open", this.isVolumeControlOpen);
    }
    if (volumeToggle) {
      volumeToggle.textContent = isMuted || volumePercent === 0 ? "🔇" : volumePercent < 50 ? "🔉" : "🔊";
      volumeToggle.setAttribute("aria-expanded", String(this.isVolumeControlOpen));
      volumeToggle.setAttribute("aria-label", `음량 조절: ${volumePercent}%`);
    }
    if (volumeSlider) {
      volumeSlider.value = String(volumePercent);
    }
    if (volumeValue) {
      volumeValue.textContent = `${volumePercent}%`;
    }
  }

  // ==========================================================================
  // ⚔️ 배틀 시스템 (슬라이드 인 애니메이션 퀄리티 업)
  // ==========================================================================
  startEncounter() {
    const uncaptured = window.DEVELOPERS.filter(d => !this.capturedDevs.includes(d.id));

    if (uncaptured.length === 0) {
      this.showEndingScreen();
      return;
    }

    this.activeEnemy = uncaptured[Math.floor(Math.random() * uncaptured.length)];
    this.activeQuiz = null;
    this.isResolvingQuiz = false;
    this.resetPokeballThrowState();
    this.switchGameState(this.STATE_BATTLE);
    this.showEncounterSplash();

    // 슬라이드 애니메이션 클래스 초기화 후 부착
    const enemyBox = document.querySelector(".enemy-sprite-box");
    const playerBox = document.querySelector(".player-sprite-box");
    enemyBox.className = "battle-sprite-box enemy-sprite-box";
    playerBox.className = "battle-sprite-box player-sprite-box";
    
    // 강제 리플로우를 통한 애니메이션 트리거
    void enemyBox.offsetWidth;
    void playerBox.offsetWidth;

    enemyBox.classList.add("slide-in");
    playerBox.classList.add("slide-in");

    // UI 매핑
    document.getElementById("enemy-name").textContent = this.activeEnemy.name;
    document.getElementById("enemy-level-tag").textContent = "L99";
    document.getElementById("enemy-hp-fill").style.width = "100%";

    // 8비트 스프라이트 드로잉 트리거 및 2프레임 루프 가동
    this.battleAnimFrame = 0;
    setTimeout(() => {
      this.drawBattleSprites();
    }, 100);

    if (this.battleAnimTimer) clearInterval(this.battleAnimTimer);
    this.battleAnimTimer = setInterval(() => {
      this.battleAnimFrame = this.battleAnimFrame === 0 ? 1 : 0;
      this.drawBattleSprites();
    }, 450); // 450ms 간격으로 숨쉬기 루프

    // 대사창 타이핑 효과 적용
    this.typeWriter("battle-message", `야생의 ${this.activeEnemy.name}(이)가 승부를 걸어왔다! 퀴즈를 풀어 영입해보자!`);

    document.getElementById("battle-quiz-box").classList.add("hidden");
    document.getElementById("battle-main-controls").classList.remove("hidden");
  }

  showEncounterSplash() {
    const splash = document.getElementById("encounter-splash");
    if (!splash) return;

    splash.classList.remove("hidden");
    splash.style.animation = "none";
    void splash.offsetWidth;
    splash.style.animation = "";

    setTimeout(() => {
      splash.classList.add("hidden");
    }, 1150);
  }

  drawBattleSprites() {
    window.GameEngine.drawPlayerBack("player-battle-canvas", this.battleAnimFrame);
    window.GameEngine.drawEnemyFront("enemy-battle-canvas", this.activeEnemy.id, this.battleAnimFrame);
  }

  bindPokeballThrowEvents() {
    const pokeball = document.getElementById("pokeball-actor");
    if (!pokeball) return;

    pokeball.addEventListener("pointerdown", (event) => this.handlePokeballPointerDown(event));
    window.addEventListener("pointermove", (event) => this.handlePokeballPointerMove(event));
    window.addEventListener("pointerup", (event) => this.handlePokeballPointerUp(event));
    window.addEventListener("pointercancel", (event) => this.handlePokeballPointerUp(event, true));
  }

  renderPokeballPicker() {
    const picker = document.getElementById("pokeball-picker");
    if (!picker || picker.childElementCount > 0) return;

    const windowEl = document.createElement("div");
    windowEl.className = "pokeball-picker-window";

    const header = document.createElement("div");
    header.className = "pokeball-picker-header";
    header.innerHTML = `<span>볼 가방</span><span>${this.pokeballChoices.length}</span>`;

    const grid = document.createElement("div");
    grid.className = "pokeball-picker-grid";

    this.pokeballChoices.forEach((name, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "pokeball-choice";
      button.title = name;
      button.setAttribute("aria-label", name);
      button.dataset.ballIndex = String(index);
      button.style.setProperty("--ball-col", String(index % 6));
      button.style.setProperty("--ball-row", String(Math.floor(index / 6)));
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.selectPokeball(index, true);
      });
      grid.appendChild(button);
    });

    windowEl.appendChild(header);
    windowEl.appendChild(grid);
    picker.appendChild(windowEl);

    this.selectPokeball(this.selectedPokeballIndex);
  }

  selectPokeball(index, confirmSelection = false) {
    this.selectedPokeballIndex = Math.max(0, Math.min(this.pokeballChoices.length - 1, index));
    const col = this.selectedPokeballIndex % 6;
    const row = Math.floor(this.selectedPokeballIndex / 6);
    const pokeball = document.getElementById("pokeball-actor");
    if (pokeball) {
      pokeball.style.setProperty("--ball-col", String(col));
      pokeball.style.setProperty("--ball-row", String(row));
    }

    document.querySelectorAll(".pokeball-choice").forEach((button) => {
      button.classList.toggle("selected", Number(button.dataset.ballIndex) === this.selectedPokeballIndex);
    });

    if (this.isAwaitingPokeballThrow) {
      window.audioManager.playTone(620, "square", 0.05, 0.04);
    }

    if (confirmSelection && this.isAwaitingPokeballThrow) {
      const picker = document.getElementById("pokeball-picker");
      if (picker) picker.classList.add("hidden");
      this.clearPokeballTrajectory();
      this.setPokeballCenter(this.pokeballDragStart.x, this.pokeballDragStart.y);
      this.typeWriter("battle-message", `${this.pokeballChoices[this.selectedPokeballIndex]} 선택! 공을 뒤로 당겼다가 놓으세요!`);
    }
  }

  resetPokeballThrowState() {
    if (this.pokeballThrowRaf) cancelAnimationFrame(this.pokeballThrowRaf);
    this.pokeballThrowRaf = null;
    this.isAwaitingPokeballThrow = false;
    this.isDraggingPokeball = false;
    this.pokeballPointerId = null;
    this.pokeballDragStart = null;
    this.pokeballLastPoint = null;

    const pokeball = document.getElementById("pokeball-actor");
    const picker = document.getElementById("pokeball-picker");
    const trajectory = document.getElementById("pokeball-trajectory");
    if (pokeball) {
      pokeball.className = "pokeball-actor hidden";
      pokeball.style.left = "";
      pokeball.style.top = "";
      pokeball.style.transform = "";
    }
    if (picker) picker.classList.add("hidden");
    this.clearPokeballTrajectory(trajectory);
  }

  getBattleArenaPoint(event) {
    const arena = document.querySelector("#panel-battle .battle-arena");
    if (!arena) return null;

    const rect = arena.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      rect
    };
  }

  getPokeballHomePoint() {
    const arena = document.querySelector("#panel-battle .battle-arena");
    const playerBox = document.querySelector(".player-sprite-box");
    if (!arena || !playerBox) return { x: 76, y: 230 };

    const arenaRect = arena.getBoundingClientRect();
    const playerRect = playerBox.getBoundingClientRect();
    return {
      x: playerRect.left - arenaRect.left + playerRect.width * 0.82,
      y: playerRect.top - arenaRect.top + playerRect.height * 0.72
    };
  }

  setPokeballCenter(x, y) {
    const pokeball = document.getElementById("pokeball-actor");
    if (!pokeball) return;
    pokeball.style.left = `${x - this.pokeballRadius}px`;
    pokeball.style.top = `${y - this.pokeballRadius}px`;
  }

  preparePokeballThrow() {
    const pokeball = document.getElementById("pokeball-actor");
    const trajectory = document.getElementById("pokeball-trajectory");
    const picker = document.getElementById("pokeball-picker");
    if (!pokeball) return;

    this.isAwaitingPokeballThrow = true;
    this.isDraggingPokeball = false;
    this.pokeballPointerId = null;
    this.pokeballDragStart = this.getPokeballHomePoint();
    this.pokeballLastPoint = this.pokeballDragStart;

    this.clearPokeballTrajectory(trajectory);
    if (picker) picker.classList.remove("hidden");
    this.selectPokeball(this.selectedPokeballIndex);
    pokeball.className = "pokeball-actor throw-ready";
    this.setPokeballCenter(this.pokeballDragStart.x, this.pokeballDragStart.y);
    this.typeWriter("battle-message", "정답! 먼저 몬스터볼을 고르고, 뒤로 당겼다가 놓아 포물선으로 던지세요!");
  }

  clearPokeballTrajectory(trajectory = document.getElementById("pokeball-trajectory")) {
    if (!trajectory) return;
    trajectory.classList.add("hidden");
    trajectory.textContent = "";
  }

  getClampedPullPoint(point) {
    const home = this.pokeballDragStart || this.getPokeballHomePoint();
    const dx = point.x - home.x;
    const dy = point.y - home.y;
    const distance = Math.hypot(dx, dy);
    if (distance <= this.pokeballMaxPull) return point;

    const scale = this.pokeballMaxPull / distance;
    return {
      x: home.x + dx * scale,
      y: home.y + dy * scale
    };
  }

  getPokeballLaunchVelocity(point) {
    const home = this.pokeballDragStart || this.getPokeballHomePoint();
    return {
      vx: (home.x - point.x) * this.pokeballPower,
      vy: (home.y - point.y) * this.pokeballPower
    };
  }

  updatePokeballTrajectory(start) {
    const trajectory = document.getElementById("pokeball-trajectory");
    if (!trajectory || !start || !this.pokeballDragStart) return;

    const pullDistance = Math.hypot(
      start.x - this.pokeballDragStart.x,
      start.y - this.pokeballDragStart.y
    );
    if (pullDistance < 16) {
      this.clearPokeballTrajectory(trajectory);
      return;
    }

    trajectory.classList.remove("hidden");
    trajectory.textContent = "";

    let x = start.x;
    let y = start.y;
    let { vx, vy } = this.getPokeballLaunchVelocity(start);
    const stepSize = 2;

    for (let i = 0; i < this.pokeballTrajectoryDots; i++) {
      for (let step = 0; step < stepSize; step++) {
        x += vx;
        y += vy;
        vx *= this.pokeballAirDrag;
        vy = vy * this.pokeballAirDrag + this.pokeballGravity;
      }

      const dot = document.createElement("span");
      dot.className = "pokeball-trajectory-dot";
      dot.style.left = `${x}px`;
      dot.style.top = `${y}px`;
      dot.style.setProperty("--dot-alpha", String(Math.max(0.12, 0.9 - i * 0.018)));
      trajectory.appendChild(dot);
    }
  }

  handlePokeballPointerDown(event) {
    if (!this.isAwaitingPokeballThrow || this.isDraggingPokeball) return;

    const point = this.getBattleArenaPoint(event);
    if (!point) return;

    event.preventDefault();
    const pokeball = document.getElementById("pokeball-actor");
    const picker = document.getElementById("pokeball-picker");
    if (picker) picker.classList.add("hidden");
    this.isDraggingPokeball = true;
    this.pokeballPointerId = event.pointerId;
    this.pokeballDragStart = this.getPokeballHomePoint();
    this.pokeballLastPoint = this.getClampedPullPoint({ x: point.x, y: point.y });
    if (pokeball) {
      pokeball.setPointerCapture?.(event.pointerId);
      pokeball.classList.add("dragging");
    }
    this.setPokeballCenter(this.pokeballLastPoint.x, this.pokeballLastPoint.y);
    this.updatePokeballTrajectory(this.pokeballLastPoint);
  }

  handlePokeballPointerMove(event) {
    if (!this.isDraggingPokeball || event.pointerId !== this.pokeballPointerId) return;

    const point = this.getBattleArenaPoint(event);
    if (!point) return;

    event.preventDefault();
    const arenaClamped = {
      x: Math.max(this.pokeballRadius, Math.min(point.rect.width - this.pokeballRadius, point.x)),
      y: Math.max(this.pokeballRadius, Math.min(point.rect.height - this.pokeballRadius, point.y))
    };
    const clamped = this.getClampedPullPoint(arenaClamped);
    this.pokeballLastPoint = clamped;
    this.setPokeballCenter(clamped.x, clamped.y);
    this.updatePokeballTrajectory(clamped);
  }

  handlePokeballPointerUp(event, cancelled = false) {
    if (!this.isDraggingPokeball || event.pointerId !== this.pokeballPointerId) return;

    event.preventDefault();
    const pokeball = document.getElementById("pokeball-actor");
    const trajectory = document.getElementById("pokeball-trajectory");
    if (pokeball) {
      pokeball.releasePointerCapture?.(event.pointerId);
      pokeball.classList.remove("dragging");
    }
    this.clearPokeballTrajectory(trajectory);

    this.isDraggingPokeball = false;
    this.pokeballPointerId = null;

    if (cancelled) {
      this.preparePokeballThrow();
      return;
    }

    this.startManualPokeballThrow();
  }

  startManualPokeballThrow() {
    const pokeball = document.getElementById("pokeball-actor");
    const arena = document.querySelector("#panel-battle .battle-arena");
    if (!pokeball || !arena || !this.pokeballDragStart || !this.pokeballLastPoint) return;

    const pullDx = this.pokeballDragStart.x - this.pokeballLastPoint.x;
    const pullDy = this.pokeballDragStart.y - this.pokeballLastPoint.y;
    const pullDistance = Math.hypot(pullDx, pullDy);
    if (pullDistance < 32) {
      this.typeWriter("battle-message", "조금 더 길게 드래그해서 던져주세요!");
      this.preparePokeballThrow();
      return;
    }

    this.isAwaitingPokeballThrow = false;
    pokeball.className = "pokeball-actor manual-flying";
    window.audioManager.playTone(520, "square", 0.08, 0.05);

    const arenaRect = arena.getBoundingClientRect();
    let x = this.pokeballLastPoint.x;
    let y = this.pokeballLastPoint.y;
    let { vx, vy } = this.getPokeballLaunchVelocity(this.pokeballLastPoint);

    let frame = 0;
    const step = () => {
      frame++;
      const prevX = x;
      const prevY = y;
      x += vx;
      y += vy;
      vx *= this.pokeballAirDrag;
      vy = vy * this.pokeballAirDrag + this.pokeballGravity;

      this.setPokeballCenter(x, y);
      pokeball.style.transform = `rotate(${frame * 24}deg)`;

      if (this.checkProjectileCollision(x, y, prevX, prevY)) {
        this.pokeballThrowRaf = null;
        this.triggerPokeballCaptureSequence({ skipThrow: true });
        return;
      }

      const outOfBounds = x < -30 || x > arenaRect.width + 30 || y < -30 || y > arenaRect.height + 38;
      if (outOfBounds || frame > 140) {
        this.pokeballThrowRaf = null;
        this.handlePokeballMiss();
        return;
      }

      this.pokeballThrowRaf = requestAnimationFrame(step);
    };

    this.typeWriter("battle-message", "몬스터볼을 던졌다!");
    this.pokeballThrowRaf = requestAnimationFrame(step);
  }

  checkProjectileCollision(x, y, prevX = x, prevY = y) {
    const arena = document.querySelector("#panel-battle .battle-arena");
    const enemyBox = document.querySelector(".enemy-sprite-box");
    if (!arena || !enemyBox) return false;

    const arenaRect = arena.getBoundingClientRect();
    const enemyRect = enemyBox.getBoundingClientRect();
    const target = {
      left: enemyRect.left - arenaRect.left + enemyRect.width * 0.12 - this.pokeballRadius,
      right: enemyRect.left - arenaRect.left + enemyRect.width * 0.88 + this.pokeballRadius,
      top: enemyRect.top - arenaRect.top + enemyRect.height * 0.08 - this.pokeballRadius,
      bottom: enemyRect.top - arenaRect.top + enemyRect.height * 0.88 + this.pokeballRadius
    };

    const samples = Math.max(1, Math.ceil(Math.hypot(x - prevX, y - prevY) / 8));
    for (let i = 0; i <= samples; i++) {
      const t = i / samples;
      const sx = prevX + (x - prevX) * t;
      const sy = prevY + (y - prevY) * t;
      if (sx >= target.left && sx <= target.right && sy >= target.top && sy <= target.bottom) {
        return true;
      }
    }
    return false;
  }

  handlePokeballMiss() {
    const pokeball = document.getElementById("pokeball-actor");
    window.audioManager.playTone(180, "sawtooth", 0.12, 0.04);
    if (pokeball) pokeball.classList.add("hidden");

    setTimeout(() => {
      this.preparePokeballThrow();
      this.typeWriter("battle-message", "아슬아슬하게 빗나갔다! 다시 드래그해서 던져보세요.");
    }, 400);
  }

  showQuizInterface() {
    if (this.isResolvingQuiz) return;

    const quizBox = document.getElementById("battle-quiz-box");
    if (quizBox && !quizBox.classList.contains("hidden")) return;

    this.activeQuiz = window.QUIZZES[Math.floor(Math.random() * window.QUIZZES.length)];

    document.getElementById("battle-main-controls").classList.add("hidden");
    quizBox.classList.remove("hidden");

    document.getElementById("quiz-question-text").textContent = this.activeQuiz.question;
    const optionsList = document.getElementById("quiz-options-list");
    optionsList.innerHTML = "";

    this.activeQuiz.options.forEach((opt, idx) => {
      const btn = document.createElement("button");
      btn.className = "quiz-opt-btn";
      btn.textContent = `${idx + 1}. ${opt}`;
      
      // 클릭 씹힘 및 이벤트 버블링 우회 해결
      const selectAnswer = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.handleQuizAnswer(idx);
      };

      btn.addEventListener("click", selectAnswer);
      optionsList.appendChild(btn);
    });
  }

  showQuizHint() {
    if (this.activeQuiz) {
      alert(`[오박사의 힌트💡]: ${this.activeQuiz.hint}`);
    } else {
      alert("싸운다(퀴즈)를 먼저 선택해주세요.");
    }
  }

  runFromBattle() {
    this.activeQuiz = null;
    this.isResolvingQuiz = false;
    window.audioManager.playTone(300, "sine", 0.15, 0.08);
    this.typeWriter("battle-message", "무사히 도망쳤다!", () => {
      setTimeout(() => { this.switchGameState(this.STATE_WORLD); }, 500);
    });
  }

  // 배틀 결과 연출 고도화 (흔들림 및 사망 연출 추가)
  handleQuizAnswer(selectedIdx) {
    if (this.isResolvingQuiz || !this.activeQuiz) return;

    const correctIdx = Number(this.activeQuiz.answer);
    if (!Number.isInteger(correctIdx) || correctIdx < 0 || correctIdx >= this.activeQuiz.options.length) {
      console.error("퀴즈 정답 인덱스가 잘못되었습니다.", this.activeQuiz);
      this.showTemporaryToast("퀴즈 데이터 오류: 정답 인덱스를 확인해 주세요.");
      return;
    }

    this.isResolvingQuiz = true;
    const optionButtons = [...document.querySelectorAll("#quiz-options-list .quiz-opt-btn")];
    optionButtons.forEach((btn, idx) => {
      btn.disabled = true;
      btn.classList.toggle("correct", idx === correctIdx);
      btn.classList.toggle("wrong", idx === selectedIdx && idx !== correctIdx);
    });

    const isCorrect = selectedIdx === correctIdx;

    if (isCorrect) {
      // 정답 ➡️ 적 타격 흔들림 적용
      window.audioManager.playCorrect();
      
      const enemyBox = document.querySelector(".enemy-sprite-box");
      enemyBox.classList.remove("slide-in");
      void enemyBox.offsetWidth; // 리플로우
      enemyBox.classList.add("hit"); // 타격 흔들림 가동
      
      setTimeout(() => {
        document.getElementById("enemy-hp-fill").style.width = "0%";
        document.getElementById("battle-quiz-box").classList.add("hidden");
        this.activeQuiz = null;
        enemyBox.classList.remove("hit");
        this.preparePokeballThrow();
      }, 650);

    } else {
      // 오답 ➡️ 아군(지우) 타격 흔들림 적용
      window.audioManager.playIncorrect();
      
      const playerBox = document.querySelector(".player-sprite-box");
      playerBox.classList.remove("slide-in");
      void playerBox.offsetWidth;
      playerBox.classList.add("hit");

      setTimeout(() => {
        document.getElementById("battle-quiz-box").classList.add("hidden");
        document.getElementById("battle-main-controls").classList.remove("hidden");
        this.activeQuiz = null;
        this.isResolvingQuiz = false;
        playerBox.classList.remove("hit");
        this.typeWriter("battle-message", "틀렸습니다! 개발자몬의 버그 공격! 오답을 분석하고 다시 대전해봅시다.");
      }, 650);
    }
  }

  triggerPokeballCaptureSequence(options = {}) {
    // 배틀 애니메이션 루프 중단 (정지 모션)
    if (this.battleAnimTimer) {
      clearInterval(this.battleAnimTimer);
      this.battleAnimTimer = null;
    }
    if (this.pokeballThrowRaf) cancelAnimationFrame(this.pokeballThrowRaf);
    this.pokeballThrowRaf = null;
    this.isAwaitingPokeballThrow = false;
    this.isDraggingPokeball = false;
    this.startCaptureRecording(this.activeEnemy?.id);

    const pokeball = document.getElementById("pokeball-actor");
    const enemyBox = document.querySelector(".enemy-sprite-box");
    const enemyCanvas = document.getElementById("enemy-battle-canvas");
    const picker = document.getElementById("pokeball-picker");
    const skipThrow = options.skipThrow === true;
    const throwDelay = skipThrow ? 220 : 800;
    if (picker) picker.classList.add("hidden");

    // 1단계: 몬스터볼 보이기 및 던지기 애니메이션 시작
    pokeball.classList.remove("hidden");
    pokeball.className = skipThrow ? "pokeball-actor" : "pokeball-actor throw";
    pokeball.style.transform = "";
    if (skipThrow) {
      this.typeWriter("battle-message", `명중! ${this.activeEnemy.name}을(를) 몬스터볼 안으로 끌어들인다!`);
    }
    this.typeWriter("battle-message", `지우는 몬스터볼을 던졌다!`);

    // 0.8초 후 (던지기 완료)
    setTimeout(() => {
      // 2단계: 몬스터볼이 적에 닿으면 적 스프라이트 빨려들어감
      enemyBox.classList.add("captured-suck");

      // 0.8초 후 (흡수 완료)
      setTimeout(() => {
        // 적 스프라이트 숨기기
        if (enemyCanvas) {
          enemyCanvas.style.visibility = "hidden";
        }
        
        // 몬스터볼 던지기 클래스 제거 후 흔들림 준비
        pokeball.classList.remove("throw");
        pokeball.className = "pokeball-actor";

        // 바닥 흔들림 루프 실행 (3회)
        let shakeCount = 0;
        const runShakeCycle = () => {
          if (shakeCount < 3) {
            shakeCount++;
            pokeball.classList.add("shake-once");
            
            // 흔들릴 때 미세한 효과음 재생 및 메시지 출력
            setTimeout(() => {
              window.audioManager.playTone(280, "square", 0.08, 0.05); // 딸깍 톤
              this.typeWriter("battle-message", `딸깍... ${".".repeat(shakeCount)}`);
            }, 100);

            // 0.5초 흔들림 완료 후 다음 흔들림 대기
            setTimeout(() => {
              pokeball.classList.remove("shake-once");
              setTimeout(runShakeCycle, 400); // 흔들림 간격 400ms
            }, 500);
          } else {
            // 3번 흔들림 성공 후 포획 확정!
            // 팅! 효과음
            setTimeout(() => {
              window.audioManager.playTone(987.77, "square", 0.1, 0.08); // B5
              setTimeout(() => { window.audioManager.playTone(1318.51, "square", 0.3, 0.08); }, 80); // E6
              
              this.typeWriter("battle-message", `성공! ${this.activeEnemy.name}을(를) 영입했다!`, () => {
                if (!this.capturedDevs.includes(this.activeEnemy.id)) {
                  this.capturedDevs.push(this.activeEnemy.id);
                }
                this.saveGameState();
                this.renderPokedexList();

                setTimeout(() => {
                  window.audioManager.playCatchSuccess();
                }, 200);

                setTimeout(() => {
                  // 원래대로 가시성 초기화 및 복귀
                  this.stopCaptureRecording();
                  pokeball.classList.add("hidden");
                  if (enemyCanvas) enemyCanvas.style.visibility = "visible";
                  enemyBox.classList.remove("captured-suck");
                  if (this.hasCompletedDex()) {
                    this.showEndingScreen();
                  } else {
                    this.switchGameState(this.STATE_WORLD);
                  }
                }, 2200);
              });
            }, 200);
          }
        };

        // 흔들기 시작
        runShakeCycle();

      }, 800); // 흡수 완료 시간 대기

    }, throwDelay); // 볼 비행 시간 대기
  }

  // ==========================================================================
  // 📕 전체화면 오버레이 도감 제어
  // ==========================================================================
  isPokedexOpen() {
    const overlay = document.getElementById("pokedex-overlay");
    return !!overlay && !overlay.classList.contains("hidden");
  }

  hasCompletedDex() {
    return window.DEVELOPERS.every(dev => this.capturedDevs.includes(dev.id));
  }

  showEndingScreen() {
    this.renderEndingShowcase();
    this.switchGameState(this.STATE_ENDING);
    window.audioManager.playCatchSuccess();
  }

  renderEndingShowcase() {
    const showcase = document.getElementById("ending-dev-showcase");
    if (!showcase) return;

    showcase.innerHTML = "";
    window.DEVELOPERS.forEach((dev, idx) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "ending-dev-card";
      card.addEventListener("click", () => {
        this.openPokedexOverlay();
        this.selectPokedexDeveloper(dev.id);
      });

      const img = document.createElement("img");
      img.src = dev.image;
      img.alt = dev.name;

      const no = document.createElement("span");
      no.className = "ending-dev-no";
      no.textContent = `No.${String(idx + 1).padStart(3, "0")}`;

      const name = document.createElement("strong");
      name.textContent = dev.name;

      const type = document.createElement("span");
      type.className = "ending-dev-type";
      type.textContent = dev.type;

      card.appendChild(img);
      card.appendChild(no);
      card.appendChild(name);
      card.appendChild(type);
      showcase.appendChild(card);
    });
  }

  openPokedexOverlay() {
    this.stateBeforeOverlay = this.currentGameState;
    if (this.engine) this.engine.stop();
    document.getElementById("pokedex-overlay").classList.remove("hidden");
    window.audioManager.playTone(700, "square", 0.1, 0.06);
    this.renderPokedexList();
    this.closeAllActiveVideos();
  }

  closePokedexOverlay() {
    document.getElementById("pokedex-overlay").classList.add("hidden");
    this.closeAllActiveVideos();
    const returnState = this.stateBeforeOverlay || this.STATE_WORLD;
    this.stateBeforeOverlay = null;
    this.switchGameState(returnState);
  }

  closeAllActiveVideos() {
    const video = document.getElementById("project-video");
    if (video) video.pause();
  }

  renderItemInventory() {
    const itemBox = document.getElementById("items-drag-box");
    if (!itemBox) return;

    const activeDev = window.DEVELOPERS.find(dev => dev.id === this.currentSelectedDevId);
    itemBox.innerHTML = "";

    window.ITEMS.forEach(item => {
      const node = document.createElement("div");
      node.className = "drag-item-node";
      node.draggable = true;
      node.setAttribute("data-item-id", item.id);

      if (activeDev?.equipped?.includes(item.id)) {
        node.classList.add("equipped");
      }

      const icon = document.createElement("span");
      icon.className = "drag-node-ico";
      if (item.imageData) {
        const img = document.createElement("img");
        img.src = item.imageData;
        img.alt = item.name;
        icon.appendChild(img);
      } else {
        icon.textContent = item.icon || "◇";
      }

      const details = document.createElement("div");
      details.className = "drag-node-details";

      const name = document.createElement("div");
      name.className = "node-name";
      name.textContent = item.name;

      const boost = document.createElement("div");
      boost.className = "node-boost";
      boost.textContent = `${this.formatStatsBoost(item.statsBoost)}${activeDev?.equipped?.includes(item.id) ? " · 착용중" : ""}`;

      details.appendChild(name);
      details.appendChild(boost);
      node.appendChild(icon);
      node.appendChild(details);
      itemBox.appendChild(node);
    });
  }

  formatStatsBoost(statsBoost = {}) {
    const labelMap = {
      coding: "코딩",
      debugging: "디버깅",
      design: "디자인",
      speed: "스피드",
      hp: "HP"
    };

    return Object.entries(statsBoost)
      .map(([stat, value]) => `${labelMap[stat] || stat}+${value}`)
      .join(" ");
  }

  initCustomItemMaker() {
    const canvas = document.getElementById("item-draw-canvas");
    const palette = document.getElementById("item-color-palette");
    const clearButton = document.getElementById("btn-clear-item-canvas");
    const createButton = document.getElementById("btn-create-custom-item");
    if (!canvas || !palette || !clearButton || !createButton) return;

    palette.innerHTML = "";
    this.itemPalette.forEach(color => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "item-color-swatch";
      button.style.background = color;
      button.setAttribute("aria-label", `${color} 색상`);
      if (color === this.itemDrawColor) button.classList.add("active");
      button.addEventListener("click", () => {
        this.itemDrawColor = color;
        palette.querySelectorAll(".item-color-swatch").forEach(swatch => swatch.classList.remove("active"));
        button.classList.add("active");
      });
      palette.appendChild(button);
    });

    const eraser = document.createElement("button");
    eraser.type = "button";
    eraser.className = "item-color-swatch eraser";
    eraser.textContent = "×";
    eraser.setAttribute("aria-label", "지우개");
    eraser.addEventListener("click", () => {
      this.itemDrawColor = "";
      palette.querySelectorAll(".item-color-swatch").forEach(swatch => swatch.classList.remove("active"));
      eraser.classList.add("active");
    });
    palette.appendChild(eraser);

    const drawFromEvent = (event) => {
      const point = event.touches ? event.touches[0] : event;
      const rect = canvas.getBoundingClientRect();
      const x = Math.floor(((point.clientX - rect.left) / rect.width) * 16);
      const y = Math.floor(((point.clientY - rect.top) / rect.height) * 16);
      this.paintItemPixel(x, y);
    };

    let drawing = false;
    canvas.addEventListener("mousedown", (event) => {
      drawing = true;
      drawFromEvent(event);
    });
    canvas.addEventListener("mousemove", (event) => {
      if (drawing) drawFromEvent(event);
    });
    document.addEventListener("mouseup", () => {
      drawing = false;
    });
    canvas.addEventListener("touchstart", (event) => {
      event.preventDefault();
      drawing = true;
      drawFromEvent(event);
    }, { passive: false });
    canvas.addEventListener("touchmove", (event) => {
      event.preventDefault();
      if (drawing) drawFromEvent(event);
    }, { passive: false });
    document.addEventListener("touchend", () => {
      drawing = false;
    });

    clearButton.addEventListener("click", () => {
      this.itemPixels = Array(16 * 16).fill("");
      this.renderItemDrawingCanvas();
    });
    createButton.addEventListener("click", () => this.createCustomItemFromDrawing());

    this.renderItemDrawingCanvas();
  }

  paintItemPixel(x, y) {
    if (x < 0 || x >= 16 || y < 0 || y >= 16) return;
    this.itemPixels[y * 16 + x] = this.itemDrawColor;
    this.renderItemDrawingCanvas();
  }

  renderItemDrawingCanvas() {
    const canvas = document.getElementById("item-draw-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const cell = canvas.width / 16;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#f8f8d8";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < 16; y += 1) {
      for (let x = 0; x < 16; x += 1) {
        const color = this.itemPixels[y * 16 + x];
        if (color) {
          ctx.fillStyle = color;
          ctx.fillRect(x * cell, y * cell, cell, cell);
        }
      }
    }

    ctx.strokeStyle = "rgba(0,0,0,0.16)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 16; i += 1) {
      ctx.beginPath();
      ctx.moveTo(i * cell + 0.5, 0);
      ctx.lineTo(i * cell + 0.5, canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * cell + 0.5);
      ctx.lineTo(canvas.width, i * cell + 0.5);
      ctx.stroke();
    }
  }

  exportCustomItemImage() {
    const canvas = document.createElement("canvas");
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext("2d");

    this.itemPixels.forEach((color, index) => {
      if (!color) return;
      ctx.fillStyle = color;
      ctx.fillRect(index % 16, Math.floor(index / 16), 1, 1);
    });

    return canvas.toDataURL("image/png");
  }

  createCustomItemFromDrawing() {
    if (!this.itemPixels.some(Boolean)) {
      this.showTemporaryToast("먼저 캔버스에 아이템을 그려 주세요.");
      return;
    }

    const nameInput = document.getElementById("custom-item-name");
    const statSelect = document.getElementById("custom-item-stat");
    const boostSelect = document.getElementById("custom-item-boost");
    const stat = statSelect?.value || "coding";
    const boost = Number(boostSelect?.value || 10);
    const name = nameInput?.value.trim() || `그린 아이템 ${this.customItems.length + 1}`;
    const item = {
      id: `custom_${Date.now()}`,
      name,
      description: "직접 그려 만든 커스텀 장비입니다.",
      imageData: this.exportCustomItemImage(),
      statsBoost: { [stat]: boost },
      isCustom: true
    };

    this.registerCustomItems([item]);
    this.saveCustomItems();
    this.saveGameState();
    this.renderItemInventory();

    if (nameInput) nameInput.value = "";
    this.itemPixels = Array(16 * 16).fill("");
    this.renderItemDrawingCanvas();
    this.showTemporaryToast(`${name} 아이템을 보관함에 추가했습니다.`);
  }

  renderPokedexList() {
    const listUl = document.getElementById("dex-list-ul");
    listUl.innerHTML = "";
    let capCount = 0;

    window.DEVELOPERS.forEach((dev, idx) => {
      const li = document.createElement("li");
      const isCap = this.capturedDevs.includes(dev.id);
      
      li.className = isCap ? "dex-li-item" : "dex-li-item locked";
      li.setAttribute("data-id", dev.id);
      
      const noStr = String(idx + 1).padStart(3, "0");
      if (isCap) {
        li.textContent = `No.${noStr} ${dev.name}`;
        if (this.currentSelectedDevId === dev.id) {
          li.classList.add("active");
        }
        capCount++;
      } else {
        li.textContent = `No.${noStr} ??? (잠김)`;
      }
      
      listUl.appendChild(li);
    });

    document.getElementById("captured-count").textContent = capCount;
  }

  selectPokedexDeveloper(devId) {
    this.currentSelectedDevId = devId;
    this.renderPokedexList();

    const detailArea = document.getElementById("dex-detail-area");
    detailArea.className = "dex-content";

    document.getElementById("dex-detail-placeholder-msg").classList.add("hidden");
    document.getElementById("dex-detail-content-view").classList.remove("hidden");

    this.updatePokedexDetail(devId);
  }

  updatePokedexDetail(devId) {
    const dev = window.DEVELOPERS.find(d => d.id === devId);
    if (!dev) return;

    const noMap = { dev_frontend: "No.001", dev_backend: "No.002", dev_fullstack: "No.003", dev_data: "No.004" };
    document.getElementById("detail-no-text").textContent = noMap[devId];
    document.getElementById("detail-name-text").textContent = dev.name;
    document.getElementById("detail-type-badge").textContent = dev.type;
    document.getElementById("detail-bio-text").textContent = dev.description;

    this.renderSpriteElement(document.getElementById("character-base-emoji"), dev.image, dev.name);
    this.renderPersonalProfile(dev);
    this.renderTeamIntro(dev.id);

    const layerBox = document.getElementById("equipped-visuals-container");
    layerBox.innerHTML = "";

    if (dev.equipped && dev.equipped.length > 0) {
      dev.equipped.forEach(itemId => {
        const item = window.ITEMS.find(i => i.id === itemId);
        if (item) {
          const el = document.createElement("div");
          el.className = `equipped-layer ${itemId}${item.isCustom ? " custom-equipped" : ""}`;
          if (item.imageData) {
            const img = document.createElement("img");
            img.src = item.imageData;
            img.alt = item.name;
            el.appendChild(img);
          } else {
            el.textContent = item.icon;
          }
          layerBox.appendChild(el);
        }
      });
      const names = dev.equipped
        .map(id => window.ITEMS.find(i => i.id === id)?.name)
        .filter(Boolean)
        .join(", ");
      document.getElementById("equipped-items-list-text").textContent = `장착 장비: [ ${names} ]`;
    } else {
      document.getElementById("equipped-items-list-text").textContent = "장착 장비: 없음";
    }

    this.renderItemInventory();

    const setStat = (barId, valId, val) => {
      document.getElementById(barId).style.width = `${Math.min(100, Math.max(0, val))}%`;
      document.getElementById(valId).textContent = val;
    };
    setStat("stat-bar-coding", "stat-val-coding", dev.stats.coding);
    setStat("stat-bar-debugging", "stat-val-debugging", dev.stats.debugging);
    setStat("stat-bar-design", "stat-val-design", dev.stats.design);
    setStat("stat-bar-speed", "stat-val-speed", dev.stats.speed);

    const projContainer = document.getElementById("detail-projects-container");
    projContainer.innerHTML = "";

    dev.projects.forEach(p => {
      const card = document.createElement("div");
      card.className = "project-card";
      
      const title = document.createElement("div");
      title.className = "project-title";
      title.textContent = p.title;

      const tech = document.createElement("span");
      tech.className = "project-tech";
      tech.textContent = p.tech;

      const desc = document.createElement("div");
      desc.className = "project-desc";
      desc.textContent = p.desc;

      card.appendChild(title);
      card.appendChild(tech);
      card.appendChild(desc);
      projContainer.appendChild(card);
    });

    const videoArea = document.getElementById("project-video-area");
    const videoEl = document.getElementById("project-video");

    this.updatePokedexVideo(dev, videoArea, videoEl);
  }

  updatePokedexVideo(dev, videoArea = document.getElementById("project-video-area"), videoEl = document.getElementById("project-video")) {
    if (!videoArea || !videoEl || !dev) return;

    const title = videoArea.querySelector(".box-title");
    if (title) title.textContent = "포획 순간 녹화 영상";

    const captureUrl = this.captureVideoUrls[dev.id];
    if (captureUrl) {
      videoArea.classList.remove("hidden");
      if (videoEl.src !== captureUrl) {
        videoEl.src = captureUrl;
        videoEl.load();
      }
      return;
    }

    videoArea.classList.add("hidden");
    videoEl.pause();
    videoEl.removeAttribute("src");
    videoEl.load();

    this.loadCaptureVideoForDev(dev.id).then(url => {
      if (url && this.currentSelectedDevId === dev.id) {
        this.updatePokedexVideo(dev, videoArea, videoEl);
      }
    });
  }

  renderTeamIntro(activeDevId) {
    const team = window.TEAM_PROFILE;
    if (!team) return;

    const titleEl = document.getElementById("team-title-text");
    const subtitleEl = document.getElementById("team-subtitle-text");
    const mottoEl = document.getElementById("team-motto-text");
    const memberList = document.getElementById("team-member-list");

    if (!titleEl || !subtitleEl || !mottoEl || !memberList) {
      return;
    }

    titleEl.textContent = team.title;
    subtitleEl.textContent = team.subtitle;
    mottoEl.textContent = team.motto;

    memberList.innerHTML = "";
    team.members.forEach(member => {
      const card = document.createElement("div");
      card.className = `team-member-card${member.id === activeDevId ? " active" : ""}`;

      const no = document.createElement("span");
      no.className = "team-member-no";
      no.textContent = String(team.members.indexOf(member) + 1).padStart(2, "0");

      const name = document.createElement("strong");
      name.textContent = member.name;

      const role = document.createElement("span");
      role.className = "team-member-role";
      role.textContent = member.role;

      const trait = document.createElement("p");
      trait.textContent = member.trait;

      card.appendChild(no);
      card.appendChild(name);
      card.appendChild(role);
      card.appendChild(trait);
      memberList.appendChild(card);
    });
  }

  renderPersonalProfile(dev) {
    const profile = window.DEVELOPER_PROFILES?.[dev.id];
    if (!profile) return;

    const personalAvatar = document.getElementById("personal-avatar");
    const personalTitle = document.getElementById("personal-title-text");
    const personalHeadline = document.getElementById("personal-headline-text");
    const personalLocation = document.getElementById("personal-location-text");
    const personalContact = document.getElementById("personal-contact-text");
    const stackList = document.getElementById("personal-stack-list");
    const linkList = document.getElementById("personal-link-list");

    if (!personalAvatar || !personalTitle || !personalHeadline || !personalLocation || !personalContact || !stackList || !linkList) {
      return;
    }

    this.renderSpriteElement(personalAvatar, dev.image, dev.name);
    personalTitle.textContent = profile.title;
    personalHeadline.textContent = profile.headline;
    personalLocation.textContent = profile.location;
    personalContact.textContent = profile.contact;

    stackList.innerHTML = "";
    profile.stack.forEach(label => {
      const chip = document.createElement("span");
      chip.className = "personal-chip";
      chip.textContent = label;
      stackList.appendChild(chip);
    });

    linkList.innerHTML = "";
    profile.links.forEach(link => {
      if (!link.url) {
        const badge = document.createElement("span");
        badge.className = "personal-link personal-link-static";
        badge.textContent = link.label;
        linkList.appendChild(badge);
        return;
      }

      const anchor = document.createElement("a");
      anchor.className = "personal-link";
      anchor.href = link.url;
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
      anchor.textContent = link.label;
      linkList.appendChild(anchor);
    });
  }

  renderSpriteElement(container, src, altText) {
    if (!container) return;
    container.textContent = "";

    const img = document.createElement("img");
    img.src = src;
    img.alt = altText || "";
    img.loading = "lazy";
    container.appendChild(img);
  }

  showTemporaryToast(message) {
    let toast = document.getElementById("game-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "game-toast";
      toast.className = "game-toast";
      document.getElementById("game-screen").appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add("show");

    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      toast.classList.remove("show");
    }, 1600);
  }

  getDeveloperEmoji(devId) {
    const emojis = {
      dev_frontend: "💻",
      dev_backend: "🗄️",
      dev_fullstack: "🌐",
      dev_data: "📊"
    };
    return emojis[devId] || "💻";
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const app = new App();
  window.app = app;
  app.init();
  app.switchGameState(app.STATE_INTRO);
});
