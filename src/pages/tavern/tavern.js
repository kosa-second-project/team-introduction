import { state, addReward, showFloatingText } from '../../core/state.js';
import { playSynthSound } from '../../core/audio.js';

export function setupQuests() {
  const btnQ1 = document.getElementById("btn-complete-q1");
  const btnQ2 = document.getElementById("btn-complete-q2");
  const radarUser = document.getElementById("radar-blip-user");
  
  btnQ1.addEventListener("click", () => {
    if (state.completedQuests.apiQuest) return;
    
    const hasVanguard = state.activeParty.vanguard !== null;
    const hasStriker = state.activeParty.striker !== null;
    const hasSupporter = state.activeParty.supporter !== null;
    
    if (hasVanguard && hasStriker && hasSupporter) {
      state.completedQuests.apiQuest = true;
      addReward(80, 150);
      showFloatingText("퀘스트 완료! +150G / +80XP", "var(--color-success)");
    } else {
      playSynthSound('click');
      alert("⚠️ 파티 편성 탭에서 모험가들을 3개 전투 슬롯에 모두 배치하고 저장한 후에 완료 보고를 해야 합니다!");
    }
  });

  btnQ2.addEventListener("click", () => {
    if (state.completedQuests.gpsQuest) return;
    
    const isRadarActive = !radarUser.classList.contains("hidden");
    if (isRadarActive) {
      state.completedQuests.gpsQuest = true;
      addReward(50, 200);
      showFloatingText("퀘스트 완료! +200G / +50XP", "var(--color-success)");
    } else {
      playSynthSound('click');
      alert("⚠️ 세계 지도 탭에서 '내 위치 분석 및 동기화' 버튼을 눌러 GPS 수신을 완료한 후에 완료 보고를 해야 합니다!");
    }
  });
}
