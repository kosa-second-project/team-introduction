import { state, characterRoster, getEffectiveStats, addReward, showFloatingText } from '../../core/state.js';
import { audioCtx, initAudioContext, playSynthSound } from '../../core/audio.js';

const jsQuizDataset = [
  {
    question: "자바스크립트에서 호이스팅(Hoisting)이란 무엇인가요?",
    choices: [
      "변수와 함수 선언문이 해당 스코프의 최상단으로 끌어올려지는 것처럼 동작하는 현상",
      "코드가 실행되기 전에 오류를 모두 검출하여 컴파일하는 과정",
      "메모리 누수가 발생한 객체를 가비지 컬렉터가 수거하는 메커니즘",
      "비동기 콜백 함수를 이벤트 루프를 통해 실행 대기열에 추가하는 것"
    ],
    correct: 0,
    explanation: "호이스팅은 자바스크립트 엔진이 변수 및 함수 선언을 소스코드 평가 과정에서 렉시컬 환경에 미리 등록하기 때문에 마치 최상단으로 끌어올려진 것처럼 동작하는 현상입니다. (let, const도 호이스팅되나 TDZ로 인해 선언 전에 참조 시 ReferenceError 발생)"
  },
  {
    question: "클로저(Closure)의 정의와 주요 용도로 가장 올바른 것은 무엇인가요?",
    choices: [
      "객체의 프로토타입을 복사하여 새로운 인스턴스를 생성하는 메서드",
      "외부 함수의 변수에 접근할 수 있는 내부 함수와 그 내부 함수가 선언된 렉시컬 환경의 조합",
      "비동기 에러를 catch 문으로 포착하기 위해 사용하는 구문",
      "함수가 호출될 때 매개변수를 임시 저장하는 전역 메모리 영역"
    ],
    correct: 1,
    explanation: "클로저는 외부 함수의 실행 컨텍스트가 소멸하더라도 외부 함수의 스코프(렉시컬 환경)를 기억하여 접근할 수 있는 내부 함수를 의미합니다. 주로 상태 안전 유지 및 정보 은닉(캡슐화)에 활용됩니다."
  },
  {
    question: "자바스크립트의 프로토타입(Prototype)에 대한 설명 중 틀린 것은 무엇인가요?",
    choices: [
      "모든 객체는 자신의 부모 역할을 하는 프로토타입 객체([[Prototype]])를 가진다.",
      "객체의 프로퍼티를 참조할 때 없으면 상위 프로토타입을 따라 탐색하는 것이 프로토타입 체인이다.",
      "화살표 함수(Arrow Function)는 prototype 프로퍼티가 없으며 생성자 함수로 사용 불가능하다.",
      "프로토타입을 활용해 상속(Inheritance) 메커니즘을 가볍게 구현할 수 있다."
    ],
    correct: 2,
    explanation: "화살표 함수는 prototype 프로퍼티가 없으며, 생성자 함수(Constructor)로 호출할 수 없습니다. 또한 arguments 객체나 자신만의 this 바인딩도 갖지 않습니다."
  },
  {
    question: "일반 함수와 화살표 함수(Arrow Function)의 `this` 바인딩 차이점으로 올바른 것은 무엇인가요?",
    choices: [
      "일반 함수는 호출 방식에 따라 `this`가 동적으로 바인딩되지만, 화살표 함수는 상위 스코프의 `this`를 정적으로 바인딩한다.",
      "일반 함수는 언제나 전역 객체를 지칭하고, 화살표 함수는 호출한 객체를 가리킨다.",
      "화살표 함수는 `bind`, `call`, `apply` 메서드를 사용해 `this`를 명시적으로 바인딩할 수 있다.",
      "일반 함수는 화살표 함수보다 성능이 뛰어나며 `this` 바인딩 속도가 정적이다."
    ],
    correct: 0,
    explanation: "일반 함수는 함수가 어떻게 호출되는가에 따라 this가 동적으로 결정되나, 화살표 함수는 함수가 선언된 시점의 렉시컬 스코프 상의 상위 this를 정적으로 가리키며(Lexical this), 명시적 바인딩으로 바꿀 수 없습니다."
  },
  {
    question: "이벤트 루프(Event Loop)가 하는 주된 역할은 무엇인가요?",
    choices: [
      "자바스크립트 코드가 실행되기 전에 컴파일하여 실행 속도를 높여주는 역할",
      "다중 스레드를 생성하여 연산량이 많은 CPU 작업을 병렬로 처리하는 엔진",
      "콜 스택(Call Stack)이 비어 있을 때, 태스크 큐(Task Queue)의 비동기 콜백을 콜 스택으로 이동시키는 것",
      "가비지 컬렉션을 감시하고 메모리 부족 시 프로그램을 종료하는 기능"
    ],
    correct: 2,
    explanation: "이벤트 루프는 자바스크립트의 싱글 스레드 환경에서 비동기 처리를 지원하기 위해, 콜 스택과 태스크 큐를 지속적으로 감시하며 콜 스택이 완전히 비어 있을 때 대기 중인 콜백을 올려 실행시키는 역할을 합니다."
  },
  {
    question: "실행 컨텍스트(Execution Context)에 관한 설명 중 가장 올바르지 않은 것은 무엇인가요?",
    choices: [
      "실행 컨텍스트는 실행 가능한 코드가 평가되고 실행되는 환경을 제공하는 객체다.",
      "실행 컨텍스트 스택(Call Stack)의 가장 최하단에 쌓이는 것은 항상 함수 실행 컨텍스트이다.",
      "실행 컨텍스트는 Lexical Environment와 Variable Environment 등으로 구성된다.",
      "함수가 실행 완료되면 해당 함수의 실행 컨텍스트는 스택에서 팝(Pop)되어 소멸한다."
    ],
    correct: 1,
    explanation: "실행 컨텍스트 스택의 가장 최하단(첫 번째)에 쌓이는 것은 어플리케이션이 처음 실행될 때 생성되는 '전역 실행 컨텍스트(Global Execution Context)'입니다."
  },
  {
    question: "마이크로태스크 큐(Microtask Queue)와 태스크 큐(Task Queue)의 실행 우선순위는 어떻게 되나요?",
    choices: [
      "마이크로태스크 큐(Promise 등)가 태스크 큐(setTimeout 등)보다 우선순위가 높아 먼저 실행된다.",
      "태스크 큐가 언제나 마이크로태스크 큐보다 먼저 실행된다.",
      "두 큐의 우선순위는 동일하며 무작위 순서로 꺼내져 실행된다.",
      "브라우저가 유휴 상태일 때만 마이크로태스크 큐를 실행한다."
    ],
    correct: 0,
    explanation: "마이크로태스크 큐는 일반 태스크 큐보다 높은 우선순위를 가집니다. 이벤트 루프는 콜 스택이 비면 마이크로태스크 큐의 모든 작업을 먼저 처리한 후 일반 태스크 큐의 작업을 가져갑니다."
  },
  {
    question: "ES6에서 도입된 `let`, `const`와 기존 `var` 키워드의 차이점으로 틀린 것은 무엇인가요?",
    choices: [
      "var는 변수 중복 선언이 가능하지만, let과 const는 중복 선언 시 에러가 발생한다.",
      "var와 let은 함수 레벨 스코프를 따르고, const만 블록 레벨 스코프를 따른다.",
      "const는 선언과 동시에 초기화해야 하며 재할당이 금지된다.",
      "let과 const는 호이스팅이 발생하지만 일시적 사각지대(TDZ)로 인해 선언 전에 참조하면 에러가 발생한다."
    ],
    correct: 1,
    explanation: "var는 함수 레벨 스코프를 따르지만, let과 const는 모두 블록 레벨 스코프(Block-level Scope)를 따릅니다."
  },
  {
    question: "자바스크립트에서 비동기 처리를 위해 도입된 Promise의 3가지 상태(State)가 아닌 것은 무엇인가요?",
    choices: [
      "Resolved (완료 처리됨)",
      "Pending (대기 중)",
      "Fulfilled (이행됨)",
      "Rejected (거부됨)"
    ],
    correct: 0,
    explanation: "Promise의 공식 상태는 대기(Pending), 이행(Fulfilled), 거부(Rejected) 3가지입니다. Resolved는 상태가 아닌, Promise가 성공적으로 이행되거나 다른 Promise를 따르기로 결정된 시점의 동작 용어입니다."
  },
  {
    question: "strict mode(엄격 모드)가 활성화되었을 때 일어나는 현상으로 옳지 않은 것은 무엇인가요?",
    choices: [
      "선언하지 않은 변수에 값을 할당하면 ReferenceError가 발생한다.",
      "매개변수 이름을 중복해서 선언하면 SyntaxError가 발생한다.",
      "일반 함수 내부에서 `this`를 호출하면 언제나 전역 객체(window)를 가리킨다.",
      "writable이 false인 프로퍼티에 쓰기를 시도하면 TypeError가 발생한다."
    ],
    correct: 2,
    explanation: "strict mode에서는 일반 함수 내부에서 this를 호출할 때 전역 객체를 바인딩하지 않고 undefined가 바인딩되어 잠재적 실수를 방지합니다."
  }
];

let gameState = {
  bossMaxHp: 2000,
  bossHp: 2000,
  partyMaxHp: 1000,
  partyHp: 1000,
  isFighting: false,
  currentQuizIndex: 0,
  quizScore: 0,
  isQuizAnswered: false,
  partyStats: { frontend: 0, backend: 0, cloud: 0, infra: 0 }
};

function playQuizSound(isCorrect) {
  try {
    initAudioContext();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    const now = audioCtx.currentTime;
    const maxVolume = state.audio.isMuted ? 0 : state.audio.volume * 0.25;

    if (isCorrect) {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.1);
      osc.frequency.setValueAtTime(783.99, now + 0.2);
      gain.gain.setValueAtTime(maxVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(110, now + 0.4);
      gain.gain.setValueAtTime(maxVolume * 1.5, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
    }
  } catch (e) {
    console.warn("효과음 재생 실패:", e);
  }
}

export function setupDungeonGame() {
  const btnStart = document.getElementById("btn-game-start");
  const btnReset = document.getElementById("btn-game-reset");
  const logContent = document.getElementById("battle-log");
  const quizArea = document.getElementById("quiz-area");
  const quizProgress = document.getElementById("quiz-progress-text");
  const quizScore = document.getElementById("quiz-score-text");
  const quizQuestion = document.getElementById("quiz-question-text");
  const quizChoicesGrid = document.getElementById("quiz-choices-grid");
  const quizExplanationBox = document.getElementById("quiz-explanation-box");
  const quizResultTitle = document.getElementById("quiz-result-title");
  const quizExplanationText = document.getElementById("quiz-explanation-text");
  const btnNext = document.getElementById("btn-quiz-next");

  function appendLog(text, type = "") {
    const entry = document.createElement("p");
    entry.className = `log-entry ${type}`;
    entry.textContent = text;
    logContent.appendChild(entry);
    logContent.scrollTop = logContent.scrollHeight;
  }

  function syncGamePartyData() {
    const avatarsContainer = document.getElementById("game-party-avatars");
    avatarsContainer.innerHTML = "";
    
    let frontSum = 0;
    let backSum = 0;
    let cloudSum = 0;
    let infraSum = 0;
    
    const roles = ["vanguard", "striker", "supporter"];
    let loadedCount = 0;
    
    roles.forEach(role => {
      const charId = state.activeParty[role];
      if (charId) {
        const char = characterRoster.find(c => c.id === charId);
        if (char) {
          loadedCount++;
          const span = document.createElement("span");
          span.textContent = char.emoji;
          span.title = `${char.name} (${char.class})`;
          avatarsContainer.appendChild(span);
          
          const stats = getEffectiveStats(char);
          frontSum += stats.frontend;
          backSum += stats.backend;
          cloudSum += stats.cloud;
          infraSum += stats.infra;
        }
      }
    });

    if (loadedCount === 0) {
      avatarsContainer.innerHTML = "<span>👤</span><span>👤</span><span>👤</span>";
    }

    gameState.partyStats = {
      frontend: frontSum,
      backend: backSum,
      cloud: cloudSum,
      infra: infraSum
    };

    document.getElementById("game-stat-front").textContent = frontSum;
    document.getElementById("game-stat-back").textContent = backSum;
    document.getElementById("game-stat-cloud").textContent = cloudSum;
    document.getElementById("game-stat-infra").textContent = infraSum;

    const statsTotal = frontSum + backSum + cloudSum + infraSum;
    gameState.partyMaxHp = statsTotal > 0 ? statsTotal * 3 : 1000;
    if (!gameState.isFighting) {
      gameState.partyHp = gameState.partyMaxHp;
      updateGameUI();
    }
  }

  function updateGameUI() {
    const bossHpPercent = Math.max(0, (gameState.bossHp / gameState.bossMaxHp) * 100);
    document.getElementById("boss-hp-bar").style.width = `${bossHpPercent}%`;
    document.getElementById("boss-hp-text").textContent = `HP: ${gameState.bossHp} / ${gameState.bossMaxHp}`;

    const partyHpPercent = Math.max(0, (gameState.partyHp / gameState.partyMaxHp) * 100);
    document.getElementById("party-hp-bar").style.width = `${partyHpPercent}%`;
    document.getElementById("party-hp-text").textContent = `HP: ${gameState.partyHp} / ${gameState.partyMaxHp}`;
  }

  document.getElementById("tab-game").addEventListener("click", () => {
    syncGamePartyData();
  });

  function renderQuestion() {
    const q = jsQuizDataset[gameState.currentQuizIndex];
    quizProgress.textContent = `QUESTION: Q${gameState.currentQuizIndex + 1} / ${jsQuizDataset.length}`;
    quizScore.textContent = `SCORE: ${gameState.quizScore}점`;
    quizQuestion.textContent = q.question;

    const choiceButtons = quizChoicesGrid.querySelectorAll(".quiz-choice-btn");
    choiceButtons.forEach((btn, idx) => {
      btn.textContent = `${idx + 1}. ${q.choices[idx]}`;
      btn.className = "quiz-choice-btn";
      btn.disabled = false;
    });

    quizExplanationBox.classList.add("hidden");
    gameState.isQuizAnswered = false;
  }

  btnStart.addEventListener("click", () => {
    const hasVanguard = state.activeParty.vanguard !== null;
    const hasStriker = state.activeParty.striker !== null;
    const hasSupporter = state.activeParty.supporter !== null;

    if (!hasVanguard || !hasStriker || !hasSupporter) {
      playSynthSound('click');
      alert("⚠️ 파티가 준비되지 않았습니다. '파티 편성' 탭에서 3명의 모험가를 모두 배치하고 저장(Save)한 후에 도전할 수 있습니다!");
      return;
    }

    playSynthSound('party_slot');
    gameState.isFighting = true;
    gameState.bossHp = gameState.bossMaxHp;
    syncGamePartyData();
    gameState.partyHp = gameState.partyMaxHp;
    gameState.currentQuizIndex = 0;
    gameState.quizScore = 0;
    
    logContent.innerHTML = "";
    appendLog(`[시스템] 퀴즈 레이드가 개시되었습니다! 원정대 최대 HP: ${gameState.partyMaxHp}`, "log-entry-system");
    document.getElementById("boss-action-status").textContent = "🔥 폭주 준비 중! 👾";

    btnStart.classList.add("hidden");
    quizArea.classList.remove("hidden");
    btnReset.classList.add("hidden");

    updateGameUI();
    renderQuestion();
  });

  const choiceButtons = quizChoicesGrid.querySelectorAll(".quiz-choice-btn");
  choiceButtons.forEach(btn => {
    btn.addEventListener("click", (e) => {
      if (!gameState.isFighting || gameState.isQuizAnswered) return;
      gameState.isQuizAnswered = true;

      const selectedIdx = parseInt(e.target.getAttribute("data-index"), 10);
      const q = jsQuizDataset[gameState.currentQuizIndex];
      const correctIdx = q.correct;

      const allButtons = quizChoicesGrid.querySelectorAll(".quiz-choice-btn");
      allButtons.forEach(b => b.classList.add("disabled"));

      if (selectedIdx === correctIdx) {
        e.target.classList.add("correct");
        playQuizSound(true);

        const damage = Math.round(150 + (gameState.partyStats.backend * 1.0) + (gameState.partyStats.cloud * 0.5) + (Math.random() * 30));
        gameState.bossHp = Math.max(0, gameState.bossHp - damage);

        appendLog(`[정답! ✦] 파티원들이 코딩 비기 스킬을 시전하여 버그 대왕에게 ${damage}의 심각한 메모리 파괴를 주었습니다!`, "log-entry-heal");
        gameState.quizScore += 10;
        showFloatingText("정답! 대미지 전송!", "var(--color-success)");
        quizResultTitle.textContent = "🌟 정답입니다! (Perfect Hit!)";
        quizResultTitle.style.color = "var(--color-success)";
      } else {
        e.target.classList.add("incorrect");
        allButtons[correctIdx].classList.add("correct");
        playQuizSound(false);

        const defenseModifier = Math.max(0.3, 1 - (gameState.partyStats.frontend / 500));
        const damage = Math.round((350 + Math.random() * 100) * defenseModifier);
        gameState.partyHp = Math.max(0, gameState.partyHp - damage);

        appendLog(`[오답! 💀] 버그 대왕이 메모리 누수 강격을 가해 파티원들에게 ${damage}의 치명적인 에러 피해를 줬습니다!`, "log-entry-damage");
        showFloatingText("오답! 피해를 입음!", "var(--color-red)");
        quizResultTitle.textContent = "💀 오답입니다... (Critically Attacked)";
        quizResultTitle.style.color = "var(--color-red)";
      }

      quizExplanationText.textContent = q.explanation;
      quizExplanationBox.classList.remove("hidden");
      document.getElementById("boss-action-status").textContent = selectedIdx === correctIdx ? "💥 타격 완료! 👾" : "⚡ 반격 완료! 👾";

      updateGameUI();
      
      if (gameState.bossHp <= 0 || gameState.partyHp <= 0) {
        btnNext.textContent = "전투 종료 ➡️";
      } else {
        btnNext.textContent = gameState.currentQuizIndex === jsQuizDataset.length - 1 ? "최종 결과 ➡️" : "다음 문제로 ➡️";
      }
    });
  });

  btnNext.addEventListener("click", () => {
    if (gameState.bossHp <= 0 || gameState.partyHp <= 0) {
      checkBattleOver();
      return;
    }

    if (gameState.currentQuizIndex < jsQuizDataset.length - 1) {
      gameState.currentQuizIndex++;
      renderQuestion();
    } else {
      checkBattleOver();
    }
  });

  function checkBattleOver() {
    gameState.isFighting = false;
    quizArea.classList.add("hidden");
    btnReset.classList.remove("hidden");

    if (gameState.bossHp <= 0 || (gameState.partyHp > 0 && gameState.quizScore >= 60)) {
      gameState.bossHp = 0;
      updateGameUI();
      appendLog("🎉 [레이드 성공] 자바스크립트 면접 성소를 완전히 정화하여 버그 대왕을 물리쳤습니다!", "log-entry-heal");
      appendLog("[전투 보상] 골드 +300G / 경험치 +500XP를 획득했습니다!", "log-entry-system");
      
      addReward(500, 300);
      showFloatingText("레이드 성공! +300G / +500XP", "var(--color-success)");
      playSynthSound('level_up');
      document.getElementById("boss-action-status").textContent = "💀 쓰러짐 (Defeated)";
    } else {
      gameState.partyHp = 0;
      updateGameUI();
      appendLog("💀 [전멸] 무수한 컴파일 오류 공격을 견디지 못하고 원정대가 패배했습니다. 더 스터디하고 오십시오!", "log-entry-damage");
      showFloatingText("레이드 실패...", "var(--color-red)");
      
      try {
        initAudioContext();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        const now = audioCtx.currentTime;
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(75, now + 0.5);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
      } catch(e){}
      
      document.getElementById("boss-action-status").textContent = "😈 승리함 (Victory)";
    }
  }

  btnReset.addEventListener("click", () => {
    playSynthSound('click');
    gameState.isFighting = false;
    btnStart.classList.remove("hidden");
    btnReset.classList.add("hidden");
    quizArea.classList.add("hidden");
    document.getElementById("boss-action-status").textContent = "대기실에서 정비 중...";
    syncGamePartyData();
    logContent.innerHTML = `<p class="log-entry text-muted">[시스템] 원정대를 편성한 뒤 '퀴즈 레이드 시작' 버튼을 누르면 모험이 시작됩니다.</p>`;
  });
}
