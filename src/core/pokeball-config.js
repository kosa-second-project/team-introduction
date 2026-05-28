const POKEBALL_CHOICES = [
  "몬스터볼", "슈퍼볼", "하이퍼볼", "마스터볼", "네이처볼", "스피드볼",
  "다이브볼", "문볼", "네스트볼", "러브볼", "헤비볼", "레벨볼",
  "퀵볼", "프리미어볼", "럭셔리볼", "다크볼", "사파리볼", "타이머볼",
  "넷볼", "울트라볼", "드림볼", "루어볼", "프렌드볼", "레드볼",
  "썬볼", "페어리볼",
];

const POKEBALL_THROW_CONFIG = {
  renderSize: 44,
  radius: 22,
  maxPull: 170,
  power: 0.34,
  gravity: 0.28,
  airDrag: 0.995,
  trajectoryDots: 44,
};

window.POKEBALL_CHOICES = POKEBALL_CHOICES;
window.POKEBALL_THROW_CONFIG = POKEBALL_THROW_CONFIG;
