import { playSynthSound } from './audio.js';

export const characterRoster = [
  {
    id: "yuyeong",
    name: "이유경",
    class: "Guild Master",
    emoji: "👑",
    weapon: "Figma의 방패 (Shield of Figma)",
    hobby: "디자인 템플릿 탐색, 반응형 웹 레이아웃 구상",
    address: "서울 마포구 공덕동 (길드 프론트 본부)",
    referenceLink: { label: "Figma 작업 공간", url: "https://www.figma.com" },
    bio: "길드의 총괄 리더이자 비전 제시자. 프로젝트의 마감 일정을 철통 엄호하며, 예측할 수 없는 스펙 폭주로부터 아군을 수호하는 신성한 방패를 가졌습니다.",
    skills: [
      { name: "Commanding Voice (소집령)", desc: "아군을 신속하게 집결시키고 단합력을 고취시켜 조별 마감 일정을 준수하도록 유도합니다." },
      { name: "Project Shield (일정 보호)", desc: "외부의 급격한 요구사항 변경 및 위험 요소를 차단하여 길드의 평화를 보장합니다." }
    ],
    stats: { frontend: 85, backend: 55, cloud: 75, infra: 68 },
    techInventory: [
      { id: "react", name: "React 코어", equipped: false, statBonus: { frontend: 10 }, desc: "프론트엔드+10" },
      { id: "figma", name: "Figma 시스템", equipped: false, statBonus: { frontend: 10, cloud: 5 }, desc: "프론트엔드+10, 클라우드+5" },
      { id: "tailwind", name: "Tailwind CSS", equipped: false, statBonus: { frontend: 10, infra: 5 }, desc: "프론트엔드+10, 인프라+5" }
    ],
    coords: { lat: 37.5635, lng: 126.9750 } // 서울시청 인근 가상 은신처
  },
  {
    id: "yeongman",
    name: "김영만",
    class: "Arch-Mage",
    emoji: "🔮",
    weapon: "SQL의 지팡이 (Staff of SQL)",
    hobby: "데이터 백업 주기 조율, 쿼리 최적화 기법 분석",
    address: "서울 강남구 역삼동 (길드 백엔드 관측소)",
    referenceLink: { label: "GitHub 블로그", url: "https://github.com" },
    bio: "강력한 마법으로 백엔드를 통제하는 대마법사. 대용량 데이터를 정렬하고 최적화의 주문을 휘둘러 서버의 안전을 다지는 백엔드 최정예 딜러입니다.",
    skills: [
      { name: "DOM Manipulation (데이터 변환)", desc: "다양한 형식의 데이터를 가공하고 가공된 결과를 가상 시각에 매핑합니다." },
      { name: "Database Alchemy (쿼리 연금술)", desc: "비효율적인 구조를 신속하게 구조조정하여 지연 현상을 원천 차단합니다." }
    ],
    stats: { frontend: 55, backend: 88, cloud: 82, infra: 78 },
    techInventory: [
      { id: "spring", name: "Spring Boot", equipped: false, statBonus: { backend: 10 }, desc: "백엔드+10" },
      { id: "jpa", name: "Spring JPA", equipped: false, statBonus: { backend: 10 }, desc: "백엔드+10" },
      { id: "postgres", name: "PostgreSQL", equipped: false, statBonus: { backend: 10, cloud: 5 }, desc: "백엔드+10, 클라우드+5" }
    ],
    coords: { lat: 37.5700, lng: 126.9850 } // 종로 인근 가상 은신처
  },
  {
    id: "junha",
    name: "김준하",
    class: "Shadow Assassin",
    emoji: "🗡️",
    weapon: "Next의 비수 (Daggers of Next)",
    hobby: "UI 라이브러리 테스트, 컴포넌트 모듈화 분석",
    address: "서울 영등포구 여의도동 (길드 UI 연구소)",
    referenceLink: { label: "개발자 포트폴리오", url: "https://github.com" },
    bio: "비밀스럽게 프론트엔드의 취약점을 감지해 최적화의 단도를 내리꽂는 UI 암살자. 컴포넌트의 성능 지연을 신속하게 해소합니다.",
    skills: [
      { name: "Render Shadowing (렌더 최적화)", desc: "렌더링 경로를 정확히 역추적하여 불필요한 리렌더링 버그의 배후를 제거합니다." },
      { name: "Next Gate (라우팅 통로)", desc: "유연하고 거침없는 UI 통로를 구성해 사용자의 접근 속도를 극대화합니다." }
    ],
    stats: { frontend: 88, backend: 60, cloud: 78, infra: 70 },
    techInventory: [
      { id: "nextjs", name: "Next.js 포탈", equipped: false, statBonus: { frontend: 10, backend: 5 }, desc: "프론트엔드+10, 백엔드+5" },
      { id: "typescript", name: "TypeScript", equipped: false, statBonus: { frontend: 10 }, desc: "프론트엔드+10" },
      { id: "vuejs", name: "Vue.js 코어", equipped: false, statBonus: { frontend: 10, infra: 5 }, desc: "프론트엔드+10, 인프라+5" }
    ],
    coords: { lat: 37.5665, lng: 126.9780 } // 본부 근처 가상 은신처
  },
  {
    id: "juyeong",
    name: "이주영",
    class: "High Priest",
    emoji: "⛪",
    weapon: "Docker의 성배 (Chalice of Docker)",
    hobby: "무중단 인프라 구축 시뮬레이션, 분산 웹 서버 아키텍처 연구",
    address: "서울 성동구 성수동 (길드 인프라 요새)",
    referenceLink: { label: "기술 블로그", url: "https://github.com" },
    bio: "길드의 성소를 정화하고 서버 안정을 보살피는 대사제. 시스템의 결함을 치유하고, 예기치 못한 에러와 널 포인터를 무효화하는 든든한 힐러입니다.",
    skills: [
      { name: "Query Blessing (쿼리 축복)", desc: "안정적이고 축복받은 데이터 파이프라인을 구축하여 에러 없는 서버 통신을 이룩합니다." },
      { name: "Null-pointer Ward (방어막)", desc: "프로그램 내 치명적인 에러와 비정상 종료로부터 코드를 보살피고 오류를 신속히 치유합니다." }
    ],
    stats: { frontend: 50, backend: 92, cloud: 88, infra: 94 },
    coords: { lat: 37.5580, lng: 126.9720 }, // 서대문 인근 가상 은신처
    techInventory: [
      { id: "docker", name: "Docker 코어", equipped: false, statBonus: { infra: 10 }, desc: "인프라+10" },
      { id: "nodejs", name: "Node.js 런타임", equipped: false, statBonus: { backend: 10 }, desc: "백엔드+10" },
      { id: "redis", name: "Redis 캐시", equipped: false, statBonus: { backend: 10, infra: 5 }, desc: "백엔드+10, 인프라+5" }
    ]
  }
];

export function getEffectiveStats(char) {
  let effective = { ...char.stats };
  if (char.techInventory) {
    char.techInventory.forEach(tech => {
      if (tech.equipped) {
        for (let statKey in tech.statBonus) {
          effective[statKey] = (effective[statKey] || 0) + tech.statBonus[statKey];
        }
      }
    });
  }
  return effective;
}

export const guildHQCoords = { lat: 37.5665, lng: 126.9780 };

export let state = {
  level: 1,
  xp: 0,
  gold: 100,
  activeParty: {
    vanguard: null,
    striker: null,
    supporter: null
  },
  completedQuests: {
    apiQuest: false,
    gpsQuest: false
  },
  audio: {
    isPlaying: false,
    volume: 0.5,
    isMuted: false
  }
};

export function saveToStorage() {
  localStorage.setItem("guild_level", state.level);
  localStorage.setItem("guild_xp", state.xp);
  localStorage.setItem("guild_gold", state.gold);
  localStorage.setItem("guild_active_party", JSON.stringify(state.activeParty));
  localStorage.setItem("guild_completed_quests", JSON.stringify(state.completedQuests));
  localStorage.setItem("guild_volume", state.audio.volume);
  localStorage.setItem("guild_muted", state.audio.isMuted);
  
  const techEquipment = characterRoster.map(c => ({
    id: c.id,
    equippedTechIds: c.techInventory ? c.techInventory.filter(t => t.equipped).map(t => t.id) : []
  }));
  localStorage.setItem("guild_tech_equipment", JSON.stringify(techEquipment));
}

export function loadFromStorage() {
  try {
    if (localStorage.getItem("guild_level")) {
      state.level = parseInt(localStorage.getItem("guild_level"), 10);
      state.xp = parseInt(localStorage.getItem("guild_xp"), 10);
      state.gold = parseInt(localStorage.getItem("guild_gold"), 10);
      
      const savedParty = localStorage.getItem("guild_active_party");
      if (savedParty) state.activeParty = JSON.parse(savedParty);
      
      const savedQuests = localStorage.getItem("guild_completed_quests");
      if (savedQuests) state.completedQuests = JSON.parse(savedQuests);
      
      if (localStorage.getItem("guild_volume")) {
        state.audio.volume = parseFloat(localStorage.getItem("guild_volume"));
      }
      if (localStorage.getItem("guild_muted")) {
        state.audio.isMuted = localStorage.getItem("guild_muted") === "true";
      }

      const savedTech = localStorage.getItem("guild_tech_equipment");
      if (savedTech) {
        const parsed = JSON.parse(savedTech);
        if (Array.isArray(parsed)) {
          parsed.forEach(savedChar => {
            const char = characterRoster.find(c => c.id === savedChar.id);
            if (char && char.techInventory && Array.isArray(savedChar.equippedTechIds)) {
              char.techInventory.forEach(tech => {
                tech.equipped = savedChar.equippedTechIds.includes(tech.id);
              });
            }
          });
        }
      }
    }
  } catch (e) {
    console.error("Failed to load from storage:", e);
  }
  try {
    updateDashboardDOM();
  } catch (e) {
    console.error("Failed to update dashboard DOM:", e);
  }
}

export function updateDashboardDOM() {
  document.getElementById("player-level").textContent = state.level;
  document.getElementById("player-xp").textContent = state.xp;
  document.getElementById("player-gold").textContent = `${state.gold} G`;
  
  const xpPercent = Math.min(100, (state.xp / 100) * 100);
  document.getElementById("player-xp-bar").style.width = `${xpPercent}%`;
  
  const btnQ1 = document.getElementById("btn-complete-q1");
  const btnQ2 = document.getElementById("btn-complete-q2");
  
  if (state.completedQuests.apiQuest) {
    btnQ1.textContent = "의뢰 완료됨 (완료)";
    btnQ1.classList.add("disabled");
  }
  if (state.completedQuests.gpsQuest) {
    btnQ2.textContent = "의뢰 완료됨 (완료)";
    btnQ2.classList.add("disabled");
  }
}

export function addReward(xpVal, goldVal) {
  state.xp += xpVal;
  state.gold += goldVal;
  
  if (state.xp >= 100) {
    const levelsGained = Math.floor(state.xp / 100);
    state.level += levelsGained;
    state.xp = state.xp % 100;
    
    playSynthSound('level_up');
    showFloatingText(`LEVEL UP! Lv.${state.level}`, "var(--color-gold)");
  } else {
    playSynthSound('party_slot');
  }
  
  updateDashboardDOM();
  saveToStorage();
}

export function showFloatingText(text, color) {
  const container = document.getElementById("player-dashboard");
  const el = document.createElement("div");
  el.textContent = text;
  el.style.position = "absolute";
  el.style.color = color;
  el.style.fontFamily = "var(--font-mono)";
  el.style.fontWeight = "bold";
  el.style.fontSize = "12px";
  el.style.pointerEvents = "none";
  el.style.textShadow = "0 2px 4px rgba(0,0,0,0.8)";
  el.style.zIndex = "1000";
  el.style.animation = "floatUp 1.2s ease-out forwards";
  
  const rect = container.getBoundingClientRect();
  el.style.left = `${Math.random() * (rect.width - 150)}px`;
  el.style.top = "10px";
  
  container.appendChild(el);
  
  setTimeout(() => {
    el.remove();
  }, 1200);
}
