import { loadFromStorage } from './src/core/state.js';
import { setupAudioAPI, playSynthSound } from './src/core/audio.js';
import { setupVideoAPI } from './src/core/video.js';
import { setupQuests } from './src/pages/tavern/tavern.js';
import { setupRoster } from './src/pages/roster/roster.js';
import { setupGeolocationAPI } from './src/pages/radar/radar.js';
import { setupDragAndDrop } from './src/pages/party/party.js';
import { setupDungeonGame } from './src/pages/dungeon/dungeon.js';

function setupNavigation() {
  const tabs = document.querySelectorAll(".nav-tab");
  const sections = document.querySelectorAll(".tab-section");

  tabs.forEach(tab => {
    tab.addEventListener("click", (e) => {
      if (e.target.closest("#bgm-player-panel")) return;
      
      const targetSectionId = tab.getAttribute("data-tab");
      
      tabs.forEach(t => t.classList.remove("active"));
      sections.forEach(s => s.classList.remove("active"));
      
      tab.classList.add("active");
      document.getElementById(targetSectionId).classList.add("active");
      
      playSynthSound('click');
    });
  });
}

window.addEventListener("DOMContentLoaded", () => {
  loadFromStorage();
  setupAudioAPI();
  setupVideoAPI();
  setupNavigation();
  setupRoster();
  setupGeolocationAPI();
  setupDragAndDrop();
  setupQuests();
  setupDungeonGame();
});
