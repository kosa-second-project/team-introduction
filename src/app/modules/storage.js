// App storage, intro effects, and persistence helpers.
Object.assign(window.App.prototype, {
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
  },

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
  },

  loadGameState() {
    try {
      const saved = localStorage.getItem("dev_pokedex_save_fs");
      if (saved) {
        const parsed = JSON.parse(saved);
        this.registerCustomItems(parsed.customItems || []);
        const restored = this.developerState.applySavedState(parsed);
        this.capturedDevs = restored.capturedDevs;
      }
    } catch (e) {
      console.error("세이브 파싱 오류:", e);
    }
  },

  loadCustomItems() {
    try {
      const saved = localStorage.getItem("dev_pokedex_custom_items_fs");
      if (!saved) return;
      this.registerCustomItems(JSON.parse(saved));
    } catch (e) {
      console.error("커스텀 아이템 로드 오류:", e);
    }
  },

  registerCustomItems(items) {
    const normalizedItems = this.developerState.registerCustomItems(items);
    normalizedItems.forEach(normalized => {
      if (!this.customItems.some(saved => saved.id === normalized.id)) {
        this.customItems.push(normalized);
      }
    });
  },

  saveCustomItems() {
    try {
      localStorage.setItem("dev_pokedex_custom_items_fs", JSON.stringify(this.customItems));
    } catch (e) {
      console.error("커스텀 아이템 저장 오류:", e);
    }
  },

  saveGameState() {
    try {
      localStorage.setItem("dev_pokedex_save_fs", JSON.stringify(
        this.developerState.buildSave(this.capturedDevs, this.customItems),
      ));
    } catch (e) {
      console.error("세이브 작성 오류:", e);
    }
  },

  resetGameState() {
    if (confirm("모든 세이브 데이터를 정말로 삭제하시겠습니까?\n처음부터 모험을 다시 진행해야 합니다.")) {
      localStorage.removeItem("dev_pokedex_save_fs");
      localStorage.removeItem("dev_pokedex_custom_items_fs");
      if ("indexedDB" in window) indexedDB.deleteDatabase(this.captureDbName);
      location.reload();
    }
  },

  // 레트로 스타일 텍스트 한 자씩 타이핑하는 연출 (Typing Effect),

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
  },

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
  },

  renderSpriteElement(container, src, altText) {
    if (!container) return;
    container.textContent = "";

    const img = document.createElement("img");
    img.src = src;
    img.alt = altText || "";
    img.loading = "lazy";
    container.appendChild(img);
  },

  getDeveloperEmoji(devId) {
    const emojis = {
      dev_frontend: "💻",
      dev_backend: "🗄️",
      dev_fullstack: "🌐",
      dev_data: "📊"
    };
    return emojis[devId] || "💻";
  }
});
