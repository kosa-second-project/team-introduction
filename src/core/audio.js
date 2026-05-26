import { state, saveToStorage } from './state.js';

export let audioCtx = null;

export function initAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

export function playSynthSound(type) {
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
    const maxVolume = state.audio.isMuted ? 0 : state.audio.volume * 0.2;
    
    if (type === 'hover') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.05);
      gain.gain.setValueAtTime(maxVolume * 0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } 
    else if (type === 'click') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.setValueAtTime(300, now + 0.03);
      gain.gain.setValueAtTime(maxVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    } 
    else if (type === 'party_slot') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.setValueAtTime(450, now + 0.06);
      osc.frequency.setValueAtTime(600, now + 0.12);
      gain.gain.setValueAtTime(maxVolume * 0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } 
    else if (type === 'level_up') {
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      
      osc.type = 'sawtooth';
      osc2.type = 'triangle';
      
      const melody = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
      let cumulativeTime = 0;
      
      melody.forEach((freq, index) => {
        osc.frequency.setValueAtTime(freq, now + cumulativeTime);
        osc2.frequency.setValueAtTime(freq * 1.5, now + cumulativeTime);
        cumulativeTime += 0.07;
      });
      
      gain.gain.setValueAtTime(maxVolume * 0.8, now);
      gain.gain.setValueAtTime(maxVolume * 0.8, now + cumulativeTime - 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + cumulativeTime);
      
      gain2.gain.setValueAtTime(maxVolume * 0.5, now);
      gain2.gain.setValueAtTime(maxVolume * 0.5, now + cumulativeTime - 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + cumulativeTime);
      
      osc.start(now);
      osc.stop(now + cumulativeTime);
      osc2.start(now);
      osc2.stop(now + cumulativeTime);
    }
  } catch (e) {
    console.warn("효과음 재생 실패 (오디오 컨텍스트가 활성화되지 않았음):", e);
  }
}

const bgmPlayer = document.getElementById("bgm-player");
const btnToggleBgm = document.getElementById("btn-toggle-bgm");
const sliderVolume = document.getElementById("slider-volume");
const svgPlay = document.getElementById("svg-audio-play");
const svgMute = document.getElementById("svg-audio-mute");

export function setupAudioAPI() {
  bgmPlayer.volume = state.audio.volume;
  sliderVolume.value = state.audio.volume;
  
  if (state.audio.isMuted) {
    bgmPlayer.muted = true;
    svgPlay.classList.add("hidden");
    svgMute.classList.remove("hidden");
  }

  sliderVolume.addEventListener("input", (e) => {
    const vol = parseFloat(e.target.value);
    state.audio.volume = vol;
    bgmPlayer.volume = vol;
    if (vol > 0 && state.audio.isMuted) {
      toggleMute(false);
    }
    saveToStorage();
  });

  btnToggleBgm.addEventListener("click", () => {
    initAudioContext();
    playSynthSound('click');
    
    if (bgmPlayer.paused && !state.audio.isPlaying) {
      startBGM();
    } else {
      toggleMute();
    }
  });
  
  document.querySelectorAll("button, .nav-tab, .character-card").forEach(el => {
    el.addEventListener("mouseenter", () => {
      playSynthSound('hover');
    });
  });
}

export function startBGM() {
  bgmPlayer.play().then(() => {
    state.audio.isPlaying = true;
    svgPlay.classList.add("hidden");
    svgMute.classList.remove("hidden");
    saveToStorage();
  }).catch(err => {
    console.warn("오디오 자동 재생이 제한되었습니다. 사용자가 인터랙션해야 합니다.", err);
  });
}

export function toggleMute(forceState) {
  const shouldMute = (forceState !== undefined) ? forceState : !state.audio.isMuted;
  state.audio.isMuted = shouldMute;
  bgmPlayer.muted = shouldMute;
  
  if (shouldMute) {
    svgPlay.classList.remove("hidden");
    svgMute.classList.add("hidden");
  } else {
    svgPlay.classList.add("hidden");
    svgMute.classList.remove("hidden");
    if (bgmPlayer.paused) {
      bgmPlayer.play();
      state.audio.isPlaying = true;
    }
  }
  saveToStorage();
}
