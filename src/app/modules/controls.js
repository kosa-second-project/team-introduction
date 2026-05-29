// DOM and input event bindings for the main app.
Object.assign(window.App.prototype, {
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
        if (this.worldInput.isMovementKey(e.key)) {
          e.preventDefault();
        }
        this.worldInput.setMovementKey(this.engine.keysPressed, e.key, true);
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
      if (this.worldInput.setMovementKey(this.engine.keysPressed, e.key, false)) {
        e.preventDefault();
      }
    });

    // 모바일 조이스틱
    const mapTouchKey = (btnId, keyName) => {
      const btn = document.getElementById(btnId);
      const setPressed = (val) => {
        if (this.currentGameState === this.STATE_WORLD && !this.isMenuOpen) {
          this.worldInput.setMovementKey(this.engine.keysPressed, keyName, val);
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
  },

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
  },

  switchGameState(state) {
    if (state !== this.STATE_WORLD && this.engine) {
      this.worldInput.clearEngine(this.engine);
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
      if (video) video.play().catch(() => {});
      window.audioManager.playBgm("intro");
    } else if (state === this.STATE_DIALOGUE) {
      document.getElementById("panel-dialogue").classList.remove("hidden");
      window.audioManager.playBgm("oak");
    } else if (state === this.STATE_WORLD) {
      document.getElementById("panel-world").classList.remove("hidden");
      window.audioManager.playBgm("town");
      this.worldInput.clearEngine(this.engine);
      this.engine.start();
    } else if (state === this.STATE_BATTLE) {
      document.getElementById("panel-battle").classList.remove("hidden");
      window.audioManager.playBgm("battle");
    } else if (state === this.STATE_ENDING) {
      document.getElementById("panel-ending").classList.remove("hidden");
      window.audioManager.playBgm("town");
      this.renderEndingShowcase();
    }
  },

  advanceDialogue() {
    if (this.dialogueIndex < this.dialogueQueue.length) {
      this.typeWriter("dialogue-text-content", this.dialogueQueue[this.dialogueIndex]);
      this.dialogueIndex++;
    } else {
      this.switchGameState(this.STATE_WORLD);
    }
  },

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
  },

  handlePhysicalBButton() {
    if (this.currentGameState === this.STATE_BATTLE) {
      document.getElementById("battle-quiz-box").classList.add("hidden");
      document.getElementById("battle-main-controls").classList.remove("hidden");
    }
  },

  toggleInGameMenu(isOpen) {
    this.isMenuOpen = isOpen;
    const menuEl = document.getElementById("ingame-menu");
    
    if (isOpen) {
      this.worldInput.clearEngine(this.engine);
      this.engine.stop();
      menuEl.classList.remove("hidden");
      window.audioManager.playTone(660, "square", 0.06, 0.05);
      this.menuSelectedIndex = 0;
      this.updateMenuDom();
    } else {
      menuEl.classList.add("hidden");
      if (this.currentGameState === this.STATE_WORLD) {
        this.worldInput.clearEngine(this.engine);
        this.engine.start();
      }
    }
  },

  changeMenuSelection(dir) {
    this.menuSelectedIndex = (this.menuSelectedIndex + dir + this.menuOptions.length) % this.menuOptions.length;
    window.audioManager.playTone(440, "square", 0.04, 0.05);
    this.updateMenuDom();
  },

  updateMenuDom() {
    const listItems = document.querySelectorAll(".menu-item");
    listItems.forEach((li, idx) => {
      if (idx === this.menuSelectedIndex) {
        li.classList.add("active-item");
      } else {
        li.classList.remove("active-item");
      }
    });
  },

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
  },

  executeSaveReport() {
    window.audioManager.playTone(880, "square", 0.1, 0.05);
    setTimeout(() => { window.audioManager.playTone(1320, "square", 0.2, 0.05); }, 80);
    this.saveGameState();
    this.showTemporaryToast("리포트 저장 완료!");
    setTimeout(() => {
      this.toggleInGameMenu(false);
    }, 700);
  },

  executeMuteToggle() {
    const isMuted = window.audioManager.toggleMute();
    this.updateSoundToggleDom();
    window.audioManager.playTone(660, "square", 0.05, 0.05);
  },

  executeVolumeChange(value, playPreview = false) {
    const volume = window.audioManager.setVolume(Number(value) / 100);
    this.updateSoundToggleDom();
    if (playPreview && !window.audioManager.isMuted && volume > 0) {
      window.audioManager.playTone(660, "square", 0.05, 0.05);
    }
  },

  toggleVolumeControl(forceOpen = null) {
    this.isVolumeControlOpen = forceOpen === null ? !this.isVolumeControlOpen : forceOpen;
    this.updateSoundToggleDom();
  },

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
  },

  getControllerLayoutKey() {
    return window.matchMedia("(max-width: 900px), (max-aspect-ratio: 1.4)").matches ? "compact" : "wide";
  },

  getControllerStorageKey(baseKey, layoutKey) {
    return `${baseKey}:${layoutKey}`;
  },

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
  },

  saveControllerOffset(storageKey, offset) {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(offset));
    } catch (e) {}
  },

  getControllerOffset(el) {
    return {
      x: Number(el.dataset.dragX || 0),
      y: Number(el.dataset.dragY || 0)
    };
  },

  applyControllerOffset(el, offset) {
    const rounded = {
      x: Math.round(offset.x),
      y: Math.round(offset.y)
    };
    el.dataset.dragX = String(rounded.x);
    el.dataset.dragY = String(rounded.y);
    el.style.setProperty("--controller-drag-x", `${rounded.x}px`);
    el.style.setProperty("--controller-drag-y", `${rounded.y}px`);
  },

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
  },

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
});
