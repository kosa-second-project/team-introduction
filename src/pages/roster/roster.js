import { characterRoster, getEffectiveStats, saveToStorage, showFloatingText } from '../../core/state.js';
import { playSynthSound } from '../../core/audio.js';
import { calculatePartyPower } from '../party/party.js';

const rosterContainer = document.getElementById("roster-container");
const charSheetModal = document.getElementById("character-sheet-modal");
const btnCloseModal = document.getElementById("btn-close-modal");

export function setupRoster() {
  rosterContainer.innerHTML = "";
  
  characterRoster.forEach(char => {
    const card = document.createElement("div");
    card.className = "character-card";
    card.setAttribute("data-id", char.id);
    
    const stats = getEffectiveStats(char);
    
    card.innerHTML = `
      <div class="character-avatar-box">${char.emoji}</div>
      <div class="char-title-row">
        <h3 class="char-name">${char.name}</h3>
        <span class="badge-gold">Lv. ${char.id === "yuyeong" ? 99 : 95}</span>
      </div>
      <span class="char-class-badge">${char.class}</span>
      <span class="char-weapon-text mono" style="font-size: 11px; color: var(--color-gold); display: block; margin-bottom: 8px;">⚔️ ${char.weapon}</span>
      
      <div class="char-stats-mini">
        <div class="mini-stat-row">
          <span class="stat-label-mini" style="width: 70px;">프론트엔드:</span>
          <div class="stat-bar-mini-bg">
            <div class="stat-bar-mini-fill bg-gold" style="width: ${stats.frontend}%"></div>
          </div>
          <span class="stat-val-mini">${stats.frontend}</span>
        </div>
        <div class="mini-stat-row">
          <span class="stat-label-mini" style="width: 70px;">백엔드:</span>
          <div class="stat-bar-mini-bg">
            <div class="stat-bar-mini-fill bg-mana" style="width: ${stats.backend}%"></div>
          </div>
          <span class="stat-val-mini">${stats.backend}</span>
        </div>
        <div class="mini-stat-row">
          <span class="stat-label-mini" style="width: 70px;">클라우드:</span>
          <div class="stat-bar-mini-bg">
            <div class="stat-bar-mini-fill bg-xp" style="width: ${stats.cloud}%"></div>
          </div>
          <span class="stat-val-mini">${stats.cloud}</span>
        </div>
        <div class="mini-stat-row">
          <span class="stat-label-mini" style="width: 70px;">인프라:</span>
          <div class="stat-bar-mini-bg">
            <div class="stat-bar-mini-fill bg-health" style="width: ${stats.infra}%"></div>
          </div>
          <span class="stat-val-mini">${stats.infra}</span>
        </div>
      </div>
      
      <button class="btn-card-action">상세 프로필 보기</button>
    `;
    
    card.addEventListener("click", () => {
      openCharacterSheet(char);
    });
    
    rosterContainer.appendChild(card);
  });
  
  btnCloseModal.addEventListener("click", () => {
    playSynthSound('click');
    charSheetModal.classList.remove("active");
  });
  
  charSheetModal.addEventListener("click", (e) => {
    if (e.target === charSheetModal) {
      playSynthSound('click');
      charSheetModal.classList.remove("active");
    }
  });
}

export function openCharacterSheet(char) {
  playSynthSound('party_slot');
  
  const lv = char.id === "yuyeong" ? 99 : 95;
  document.getElementById("modal-char-class").textContent = char.class;
  document.getElementById("modal-char-name").textContent = char.name;
  document.getElementById("modal-char-level").textContent = `Lv. ${lv}`;
  document.getElementById("modal-char-avatar").innerHTML = `<span id="modal-avatar-initial">${char.emoji}</span>`;
  document.getElementById("modal-char-bio").textContent = char.bio;
  document.getElementById("modal-char-weapon").textContent = char.weapon;
  
  document.getElementById("modal-char-hobby").textContent = char.hobby;
  document.getElementById("modal-char-address").textContent = char.address;
  const linkEl = document.getElementById("modal-char-link");
  if (char.referenceLink) {
    linkEl.textContent = char.referenceLink.label;
    linkEl.href = char.referenceLink.url;
    linkEl.parentElement.style.display = "block";
  } else {
    linkEl.parentElement.style.display = "none";
  }
  
  const skillsList = document.querySelector(".modal-skills-list");
  skillsList.innerHTML = "";
  char.skills.forEach(skill => {
    const item = document.createElement("div");
    item.className = "skill-item";
    item.innerHTML = `
      <span class="skill-name">${skill.name}</span>
      <span class="skill-desc">${skill.desc}</span>
    `;
    skillsList.appendChild(item);
  });

  const techContainer = document.getElementById("modal-tech-inventory");
  techContainer.innerHTML = "";
  
  if (char.techInventory) {
    char.techInventory.forEach(tech => {
      const runeBadge = document.createElement("div");
      runeBadge.className = `tech-rune-badge ${tech.equipped ? 'equipped' : ''}`;
      runeBadge.innerHTML = `
        ${tech.name} 
        <span class="tech-bonus-info">(${tech.desc})</span>
      `;
      
      runeBadge.addEventListener("click", () => {
        tech.equipped = !tech.equipped;
        playSynthSound('click');
        
        if (tech.equipped) {
          runeBadge.classList.add("equipped");
          showFloatingText(`${tech.name} 장착! 능력치 증가`, "var(--color-success)");
        } else {
          runeBadge.classList.remove("equipped");
          showFloatingText(`${tech.name} 해제`, "var(--color-ink-muted)");
        }
        
        updateModalStats(char);
        saveToStorage();
        setupRoster();
        calculatePartyPower();
      });
      
      techContainer.appendChild(runeBadge);
    });
  }
  
  updateModalStats(char);
  charSheetModal.classList.add("active");
}

function updateModalStats(char) {
  const stats = getEffectiveStats(char);
  document.getElementById("modal-bar-lead").style.width = `${stats.frontend}%`;
  document.getElementById("modal-val-lead").textContent = stats.frontend;
  
  document.getElementById("modal-bar-strat").style.width = `${stats.backend}%`;
  document.getElementById("modal-val-strat").textContent = stats.backend;
  
  document.getElementById("modal-bar-code").style.width = `${stats.cloud}%`;
  document.getElementById("modal-val-code").textContent = stats.cloud;
  
  document.getElementById("modal-bar-stab").style.width = `${stats.infra}%`;
  document.getElementById("modal-val-stab").textContent = stats.infra;
}
