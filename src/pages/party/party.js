import { state, characterRoster, getEffectiveStats, saveToStorage, addReward, showFloatingText } from '../../core/state.js';
import { playSynthSound } from '../../core/audio.js';
import { openCharacterSheet } from '../roster/roster.js';

const dragSourcePool = document.getElementById("drag-source-pool");
const partySlots = document.querySelectorAll(".party-slot");
const btnSaveParty = document.getElementById("btn-save-party");

export function setupDragAndDrop() {
  renderDragPool();
  
  partySlots.forEach(slot => {
    slot.addEventListener("dragover", (e) => {
      e.preventDefault();
      if (!slot.querySelector(".slotted-character")) {
        slot.classList.add("drag-over");
      }
    });

    slot.addEventListener("dragleave", () => {
      slot.classList.remove("drag-over");
    });

    slot.addEventListener("drop", (e) => {
      e.preventDefault();
      slot.classList.remove("drag-over");
      
      const charId = e.dataTransfer.getData("text/plain");
      if (slot.querySelector(".slotted-character")) return;
      
      const slotRole = slot.getAttribute("data-role");
      removeCharacterFromAllSlots(charId);
      
      state.activeParty[slotRole] = charId;
      placeCharacterInSlot(charId, slot);
      calculatePartyPower();
      playSynthSound('party_slot');
    });
  });
  
  btnSaveParty.addEventListener("click", () => {
    playSynthSound('click');
    saveToStorage();
    showFloatingText("파티 배치가 성공적으로 저장되었습니다!", "var(--color-primary-hover)");
    
    const hasVanguard = state.activeParty.vanguard !== null;
    const hasStriker = state.activeParty.striker !== null;
    const hasSupporter = state.activeParty.supporter !== null;
    
    if (hasVanguard && hasStriker && hasSupporter && !state.completedQuests.apiQuest) {
      state.completedQuests.apiQuest = true;
      addReward(80, 150);
      showFloatingText("+150 Gold / +80 XP (파티 편성 퀘스트 완수!)", "var(--color-success)");
    }
  });

  restoreSlottedParty();
}

function renderDragPool() {
  dragSourcePool.innerHTML = "";
  
  characterRoster.forEach(char => {
    const item = document.createElement("div");
    item.className = "party-pool-item";
    item.setAttribute("draggable", "true");
    item.setAttribute("data-id", char.id);
    
    item.innerHTML = `
      <div class="item-avatar">${char.emoji}</div>
      <div class="item-info">
        <span class="item-name">${char.name}</span>
        <span class="item-class">${char.class}</span>
      </div>
    `;
    
    item.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", char.id);
      item.classList.add("dragging");
    });
    
    item.addEventListener("dragend", () => {
      item.classList.remove("dragging");
    });

    item.addEventListener("click", () => {
      let placed = false;
      const roles = ["vanguard", "striker", "supporter"];
      for (let role of roles) {
        if (!state.activeParty[role]) {
          removeCharacterFromAllSlots(char.id);
          state.activeParty[role] = char.id;
          placeCharacterInSlot(char.id, document.getElementById(`slot-${role}`));
          calculatePartyPower();
          playSynthSound('party_slot');
          placed = true;
          break;
        }
      }
      if (!placed) {
        openCharacterSheet(char);
      }
    });
    
    dragSourcePool.appendChild(item);
  });
}

function placeCharacterInSlot(charId, slotElement) {
  const char = characterRoster.find(c => c.id === charId);
  if (!char) return;
  
  slotElement.innerHTML = "";
  
  const slottedCard = document.createElement("div");
  slottedCard.className = "slotted-character";
  slottedCard.innerHTML = `
    <div class="slotted-main">
      <span class="item-avatar">${char.emoji}</span>
      <span class="item-name">${char.name}</span>
    </div>
    <button class="btn-remove-slotted" aria-label="해제">&times;</button>
  `;
  
  slottedCard.querySelector(".btn-remove-slotted").addEventListener("click", (e) => {
    e.stopPropagation();
    playSynthSound('click');
    const role = slotElement.getAttribute("data-role");
    state.activeParty[role] = null;
    slotElement.innerHTML = `<span class="slot-placeholder">여기에 길드원을 드래그해 놓으세요.</span>`;
    calculatePartyPower();
  });
  
  slotElement.appendChild(slottedCard);
}

function removeCharacterFromAllSlots(charId) {
  const roles = ["vanguard", "striker", "supporter"];
  roles.forEach(role => {
    if (state.activeParty[role] === charId) {
      state.activeParty[role] = null;
      document.getElementById(`slot-${role}`).innerHTML = `
        <span class="slot-placeholder">여기에 길드원을 드래그해 놓으세요.</span>
      `;
    }
  });
}

export function calculatePartyPower() {
  const roles = ["vanguard", "striker", "supporter"];
  let totalFrontend = 0;
  let totalBackend = 0;
  let totalCloud = 0;
  let totalInfra = 0;
  
  roles.forEach(role => {
    const charId = state.activeParty[role];
    if (charId) {
      const char = characterRoster.find(c => c.id === charId);
      if (char) {
        const stats = getEffectiveStats(char);
        let frontBonus = stats.frontend;
        let backBonus = stats.backend;
        let cloudBonus = stats.cloud;
        let infraBonus = stats.infra;
        
        if (role === "vanguard") frontBonus = Math.round(frontBonus * 1.2);
        if (role === "striker") backBonus = Math.round(backBonus * 1.2);
        if (role === "supporter") {
          cloudBonus = Math.round(cloudBonus * 1.2);
          infraBonus = Math.round(infraBonus * 1.2);
        }
        
        totalFrontend += frontBonus;
        totalBackend += backBonus;
        totalCloud += cloudBonus;
        totalInfra += infraBonus;
      }
    }
  });
  
  const totalPower = totalFrontend + totalBackend + totalCloud + totalInfra;
  
  document.getElementById("total-power-val").textContent = totalPower;
  
  document.getElementById("party-val-leadership").textContent = totalFrontend;
  const frontPercent = Math.min(100, (totalFrontend / 300) * 100);
  document.getElementById("party-bar-leadership").style.width = `${frontPercent}%`;
  
  document.getElementById("party-val-coding").textContent = totalBackend;
  const backPercent = Math.min(100, (totalBackend / 300) * 100);
  document.getElementById("party-bar-coding").style.width = `${backPercent}%`;
  
  document.getElementById("party-val-stability").textContent = totalCloud;
  const cloudPercent = Math.min(100, (totalCloud / 300) * 100);
  document.getElementById("party-bar-stability").style.width = `${cloudPercent}%`;

  document.getElementById("party-val-infra").textContent = totalInfra;
  const infraPercent = Math.min(100, (totalInfra / 300) * 100);
  document.getElementById("party-bar-infra").style.width = `${infraPercent}%`;
}

function restoreSlottedParty() {
  const roles = ["vanguard", "striker", "supporter"];
  roles.forEach(role => {
    const charId = state.activeParty[role];
    if (charId) {
      placeCharacterInSlot(charId, document.getElementById(`slot-${role}`));
    }
  });
  calculatePartyPower();
}
