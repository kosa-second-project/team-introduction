import { state, characterRoster, guildHQCoords, addReward, showFloatingText } from '../../core/state.js';
import { playSynthSound } from '../../core/audio.js';

const btnGetLocation = document.getElementById("btn-get-location");
const locationCoords = document.getElementById("location-coords");
const distanceResults = document.getElementById("distance-results");
const radarHQ = document.getElementById("radar-blip-hq");
const radarUser = document.getElementById("radar-blip-user");

export function setupGeolocationAPI() {
  btnGetLocation.addEventListener("click", () => {
    playSynthSound('click');
    locationCoords.textContent = "위치 성소를 활성화하는 중... GPS 신호 수신 대기";
    
    if (!navigator.geolocation) {
      showFallbackLocation("GPS 마법이 브라우저에서 지원되지 않습니다. 가상 좌표로 동기화합니다.");
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        processCoordinates(userLat, userLng);
      },
      (error) => {
        console.warn("Geolocation 에러 코드:", error.code, error.message);
        showFallbackLocation("신호 수신 차단 또는 권한 거부. 임시 가상 좌표로 은신처 위치를 동기화합니다.");
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  });
}

function processCoordinates(lat, lng) {
  locationCoords.innerHTML = `📡 <strong>성공적으로 동기화됨!</strong><br>위도(Lat): ${lat.toFixed(6)} | 경도(Lng): ${lng.toFixed(6)}`;
  
  const distHQ = calculateDistance(lat, lng, guildHQCoords.lat, guildHQCoords.lng);
  
  distanceResults.innerHTML = `
    <div class="distance-row">
      <span class="distance-name">🏰 길드 본부 (강의실)</span>
      <span class="distance-val">${distHQ.toFixed(2)} km</span>
    </div>
  `;
  
  characterRoster.forEach(char => {
    const dist = calculateDistance(lat, lng, char.coords.lat, char.coords.lng);
    const row = document.createElement("div");
    row.className = "distance-row";
    row.innerHTML = `
      <span class="distance-name">${char.emoji} ${char.name}의 은신처 (${char.class})</span>
      <span class="distance-val">${dist.toFixed(2)} km</span>
    `;
    distanceResults.appendChild(row);
  });
  
  radarHQ.style.left = "50%";
  radarHQ.style.top = "50%";
  radarHQ.classList.remove("hidden");
  
  const latDiff = lat - guildHQCoords.lat;
  const lngDiff = lng - guildHQCoords.lng;
  
  const maxDiff = Math.max(Math.abs(latDiff), Math.abs(lngDiff), 0.0001);
  const scale = 40 / maxDiff;
  
  const userX = 50 + (lngDiff * scale);
  const userY = 50 - (latDiff * scale);
  
  radarUser.style.left = `${Math.max(10, Math.min(90, userX))}%`;
  radarUser.style.top = `${Math.max(10, Math.min(90, userY))}%`;
  radarUser.classList.remove("hidden");
  
  if (!state.completedQuests.gpsQuest) {
    state.completedQuests.gpsQuest = true;
    addReward(50, 200);
    showFloatingText("+200 Gold / +50 XP (위치 퀘스트 완수!)", "var(--color-success)");
  }
}

function showFallbackLocation(msg) {
  locationCoords.innerHTML = `⚠️ <strong>가상 좌표 연동 모드</strong><br>${msg}`;
  const fallbackLat = 37.5620;
  const fallbackLng = 126.9830;
  
  setTimeout(() => {
    processCoordinates(fallbackLat, fallbackLng);
  }, 1000);
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(value) {
  return value * Math.PI / 180;
}
