import { playSynthSound } from './audio.js';

const guildVideo = document.getElementById("guild-video");
const btnVideoPlay = document.getElementById("btn-video-play");
const btnVideoPause = document.getElementById("btn-video-pause");
const videoProgressFill = document.getElementById("video-progress-fill");
const videoProgressBar = document.querySelector(".video-progress-bar");
const btnVideoMute = document.getElementById("btn-video-mute");
const svgVideoUnmute = document.getElementById("svg-video-unmute");
const svgVideoMuted = document.getElementById("svg-video-muted");
const videoTimeDisplay = document.getElementById("video-time-display");

export function setupVideoAPI() {
  btnVideoPlay.addEventListener("click", () => {
    playSynthSound('click');
    guildVideo.play();
    btnVideoPlay.classList.add("hidden");
    btnVideoPause.classList.remove("hidden");
  });

  btnVideoPause.addEventListener("click", () => {
    playSynthSound('click');
    guildVideo.pause();
    btnVideoPause.classList.add("hidden");
    btnVideoPlay.classList.remove("hidden");
  });

  guildVideo.addEventListener("timeupdate", () => {
    const percent = (guildVideo.currentTime / guildVideo.duration) * 100;
    videoProgressFill.style.width = `${percent}%`;
    updateVideoTime();
  });

  videoProgressBar.addEventListener("click", (e) => {
    const rect = videoProgressBar.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    guildVideo.currentTime = pos * guildVideo.duration;
  });

  btnVideoMute.addEventListener("click", () => {
    playSynthSound('click');
    guildVideo.muted = !guildVideo.muted;
    if (guildVideo.muted) {
      svgVideoUnmute.classList.add("hidden");
      svgVideoMuted.classList.remove("hidden");
    } else {
      svgVideoUnmute.classList.remove("hidden");
      svgVideoMuted.classList.add("hidden");
    }
  });

  guildVideo.addEventListener("loadedmetadata", updateVideoTime);
}

function updateVideoTime() {
  const current = formatTime(guildVideo.currentTime);
  const duration = formatTime(guildVideo.duration || 0);
  videoTimeDisplay.textContent = `${current} / ${duration}`;
}

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}
