// Web Audio API를 활용한 레트로 8비트 효과음 합성 및 배경음악 관리
class AudioManager {
  constructor() {
    this.ctx = null;
    this.bgm = null;
    this.isMuted = true;
    this.currentBgmType = ""; // 'town', 'battle'
    this.masterVolume = this.loadSavedVolume();
    this.bgmBaseVolumes = {
      town: 0.15,
      battle: 0.25,
      intro: 0.20,
      oak: 0.20
    };
  }

  loadSavedVolume() {
    try {
      const saved = window.localStorage.getItem("pixelGameVolume");
      if (saved === null) return 0.8;
      return this.clampVolume(Number(saved));
    } catch (e) {
      return 0.8;
    }
  }

  clampVolume(value) {
    if (!Number.isFinite(value)) return 0.8;
    return Math.max(0, Math.min(1, value));
  }

  getEffectiveVolume(volume) {
    return this.clampVolume(volume) * this.masterVolume;
  }

  getBgmVolume(type = this.currentBgmType) {
    return (this.bgmBaseVolumes[type] || 0.20) * this.masterVolume;
  }

  setVolume(value) {
    this.masterVolume = this.clampVolume(value);
    try {
      window.localStorage.setItem("pixelGameVolume", String(this.masterVolume));
    } catch (e) {}

    if (this.bgm) {
      this.bgm.volume = this.getBgmVolume();
    }

    return this.masterVolume;
  }

  // 브라우저 제약(첫 클릭 후 실행)으로 인해 사용자 첫 클릭 시 오디오 컨텍스트 초기화
  initContext() {
    try {
      if (!this.ctx) {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume();
      }
    } catch (e) {
      console.warn("AudioContext 초기화 실패 (오디오 미지원 환경):", e);
    }
  }

  // Web Audio API를 사용해 사운드 톤(Tone)을 직접 합성 (8비트 복고풍 사운드)
  playTone(freq, type = "square", duration = 0.1, volume = 0.1) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const effectiveVolume = this.getEffectiveVolume(volume);
    if (effectiveVolume <= 0) return;

    try {
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      osc.type = type; // 'square'가 레트로한 패미컴/게임보이 느낌을 줍니다.
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gainNode.gain.setValueAtTime(effectiveVolume, this.ctx.currentTime);
      // 볼륨 페이드 아웃 (탁 끊기지 않고 자연스럽게 사라지도록)
      gainNode.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn("playTone 실행 실패:", e);
    }
  }

  // 효과음 1: 풀숲 걷기 소리 (낮고 투박한 잡음 느낌)
  playGrassRustle() {
    this.playTone(150, "triangle", 0.05, 0.15);
  }

  // 효과음 2: 벽 충돌음 (낮고 짧은 톤)
  playCollision() {
    this.playTone(80, "sawtooth", 0.08, 0.1);
  }

  // 효과음 3: 야생 포켓몬 조우 느낌표 소리 (삐-잉! 고음 급상승)
  playEncounter() {
    if (this.isMuted) return;
    this.initContext();
    const effectiveVolume = this.getEffectiveVolume(0.1);
    if (!this.ctx || effectiveVolume <= 0) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    
    osc.type = "square";
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(1500, now + 0.15);
    
    gainNode.gain.setValueAtTime(effectiveVolume, now);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
    
    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(now + 0.15);
  }

  // 효과음 4: 퀴즈 정답 사운드 (도-미-솔-도 계단식 고음)
  playCorrect() {
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, "square", 0.12, 0.08);
      }, idx * 100);
    });
  }

  // 효과음 5: 퀴즈 오답 사운드 (파#-파# 칙칙한 느낌)
  playIncorrect() {
    const notes = [370.0, 370.0]; // F#4
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, "sawtooth", 0.18, 0.12);
      }, idx * 150);
    });
  }

  // 효과음 6: 포획 성공 세레머니 (짜자잔~)
  playCatchSuccess() {
    const notes = [523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 987.77, 1046.50]; // 도레미파솔라시도
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, "square", 0.1, 0.08);
      }, idx * 80);
    });
    // 마지막 화음 피날레
    setTimeout(() => {
      this.playTone(1046.50, "square", 0.4, 0.05);
      this.playTone(1318.51, "square", 0.4, 0.05); // E6
    }, notes.length * 80);
  }

  // 효과음 7: 장비 장착 띠리링 소리
  playEquip() {
    this.playTone(880, "square", 0.08, 0.08);
    setTimeout(() => {
      this.playTone(1320, "square", 0.12, 0.08);
    }, 80);
  }

  // 배경음악(BGM) 재생 제어
  playBgm(type) {
    this.initContext();
    if (this.currentBgmType === type) return;

    this.stopBgm();
    this.currentBgmType = type;

    // 가상 오디오 태그 생성 또는 재사용
    if (!this.bgm) {
      this.bgm = new Audio();
      this.bgm.loop = true;
    }

    // 저작권 없는 무료 8비트 스타일 BGM 링크 매핑 (WAV / MP3)
    if (type === "intro") {
      // 게임 초기화면 BGM
      this.bgm.src = "pokemon_victory.mp4";
      this.bgm.volume = this.getBgmVolume(type);
    } else if (type === "oak") {
      // 오박사 대화 BGM
      this.bgm.src = "pokemon_oak.mp4";
      this.bgm.volume = this.getBgmVolume(type);
    } else if (type === "town") {
      // 태초마을 느낌의 부드러운 8bit 루프 음악
      this.bgm.src = "https://incompetech.com/music/royalty-free/mp3-royaltyfree/8bit%20Dungeon%20Level.mp3";
      this.bgm.volume = this.getBgmVolume(type); // 마일드하게 재생
    } else if (type === "battle") {
      // 배틀 느낌의 긴장감 넘치는 음악
      this.bgm.src = "pokemon_battle.mp4";
      this.bgm.volume = this.getBgmVolume(type);
    }

    if (!this.isMuted) {
      this.bgm.play().catch(err => {
        console.warn("Autoplay blocked by browser policy. Music will play on next interaction.", err);
      });
    }
  }

  stopBgm(clearType = true) {
    if (this.bgm) {
      this.bgm.pause();
    }
    if (clearType) {
      this.currentBgmType = "";
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopBgm(false);
    } else {
      if (this.currentBgmType) {
        const type = this.currentBgmType;
        this.currentBgmType = ""; // 강제 리로드 유도
        this.playBgm(type);
      }
    }
    return this.isMuted;
  }
}

// 전역 싱글톤 객체 등록
window.audioManager = new AudioManager();
