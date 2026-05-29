// Battle encounter, quiz, and capture flow.
Object.assign(window.App.prototype, {
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
  },

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
  },

  drawBattleSprites() {
    window.GameEngine.drawPlayerBack("player-battle-canvas", this.battleAnimFrame);
    window.GameEngine.drawEnemyFront("enemy-battle-canvas", this.activeEnemy.id, this.battleAnimFrame);
  },

  bindPokeballThrowEvents() {
    const pokeball = document.getElementById("pokeball-actor");
    if (!pokeball) return;

    pokeball.addEventListener("pointerdown", (event) => this.handlePokeballPointerDown(event));
    window.addEventListener("pointermove", (event) => this.handlePokeballPointerMove(event));
    window.addEventListener("pointerup", (event) => this.handlePokeballPointerUp(event));
    window.addEventListener("pointercancel", (event) => this.handlePokeballPointerUp(event, true));
  },

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
  },

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
  },

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
  },

  getBattleArenaPoint(event) {
    const arena = document.querySelector("#panel-battle .battle-arena");
    if (!arena) return null;

    const rect = arena.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      rect
    };
  },

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
  },

  setPokeballCenter(x, y) {
    const pokeball = document.getElementById("pokeball-actor");
    if (!pokeball) return;
    pokeball.style.left = `${x - this.pokeballRadius}px`;
    pokeball.style.top = `${y - this.pokeballRadius}px`;
  },

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
  },

  clearPokeballTrajectory(trajectory = document.getElementById("pokeball-trajectory")) {
    if (!trajectory) return;
    trajectory.classList.add("hidden");
    trajectory.textContent = "";
  },

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
  },

  getPokeballLaunchVelocity(point) {
    const home = this.pokeballDragStart || this.getPokeballHomePoint();
    return {
      vx: (home.x - point.x) * this.pokeballPower,
      vy: (home.y - point.y) * this.pokeballPower
    };
  },

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
  },

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
  },

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
  },

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
  },

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
  },

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
  },

  handlePokeballMiss() {
    const pokeball = document.getElementById("pokeball-actor");
    window.audioManager.playTone(180, "sawtooth", 0.12, 0.04);
    if (pokeball) pokeball.classList.add("hidden");

    setTimeout(() => {
      this.preparePokeballThrow();
      this.typeWriter("battle-message", "아슬아슬하게 빗나갔다! 다시 드래그해서 던져보세요.");
    }, 400);
  },

  showQuizInterface() {
    if (this.isResolvingQuiz) return;

    const quizBox = document.getElementById("battle-quiz-box");
    if (quizBox && !quizBox.classList.contains("hidden")) return;

    const enemyQuiz = window.QUIZZES.find(quiz => quiz.developerId === this.activeEnemy?.id);
    this.activeQuiz = enemyQuiz || window.QUIZZES[Math.floor(Math.random() * window.QUIZZES.length)];

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
  },

  showQuizHint() {
    if (this.activeQuiz) {
      alert(`[오박사의 힌트💡]: ${this.activeQuiz.hint}`);
    } else {
      alert("싸운다(퀴즈)를 먼저 선택해주세요.");
    }
  },

  runFromBattle() {
    this.activeQuiz = null;
    this.isResolvingQuiz = false;
    window.audioManager.playTone(300, "sine", 0.15, 0.08);
    this.typeWriter("battle-message", "무사히 도망쳤다!", () => {
      setTimeout(() => { this.switchGameState(this.STATE_WORLD); }, 500);
    });
  },

  // 배틀 결과 연출 고도화 (흔들림 및 사망 연출 추가),

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
  },

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
});
