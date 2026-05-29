// 개발자 도감 데이터 정의
const DEVELOPERS = [
  {
    id: "dev_frontend",
    name: "김영만 (Youngman)",
    type: "풀스택",
    image: "assets/battle/charmander.png",
    profileImage: "assets/profile/charmander-profile.png",
    equippedImage: {
      default: "assets/battle/charmander.png",
      youngman_arch_note: "assets/battle/charmander.png",
      youngman_cloud_map: "assets/battle/charmander.png",
      youngman_focus_timer: "assets/battle/charmander.png",
      youngman_review_pen: "assets/battle/charmander.png",
    },
    stats: { hp: 105, coding: 86, debugging: 82, design: 84, speed: 80 },
    description: "스터디 흐름을 차분하게 정리하고 팀의 페이스를 안정적으로 맞추는 개발자몬입니다. 복만이를 떠올리게 하는 든든함으로 어려운 내용도 천천히 자기 것으로 만듭니다.",
    projects: [
      {
        title: "스터디 흐름 정리",
        tech: "Architecture Study",
        desc: "아키텍처 스터디에서 나온 핵심 키워드와 역할 분리를 팀이 다시 볼 수 있게 정리합니다.",
      },
      {
        title: "팀 발표 안정화",
        tech: "Presentation Flow",
        desc: "발표 순서와 도감 내용을 자연스럽게 이어 팀 소개가 흔들리지 않도록 잡아줍니다.",
      }
    ],
    equipped: []
  },
  {
    id: "dev_backend",
    name: "이유경 (Yukyung)",
    type: "풀스택",
    image: "assets/battle/eevee.png",
    profileImage: "assets/profile/eevee-profile.png",
    equippedImage: {
      default: "assets/battle/eevee.png",
      yukyung_study_log: "assets/battle/eevee.png",
      yukyung_keyword_cards: "assets/battle/eevee.png",
      yukyung_soft_earbuds: "assets/battle/eevee.png",
      yukyung_check_stamp: "assets/battle/eevee.png",
    },
    stats: { hp: 102, coding: 83, debugging: 86, design: 90, speed: 78 },
    description: "꼼꼼하게 읽고 이해한 내용을 보기 좋게 다듬는 개발자몬입니다. 클라이밍처럼 한 칸씩 루트를 잡아가며 복잡한 개념도 차근차근 올라갑니다.",
    projects: [
      {
        title: "콘텐츠 구조 다듬기",
        tech: "UX Writing",
        desc: "팀원 소개, 퀴즈, 도감 문구가 한 화면 안에서 자연스럽게 읽히도록 정리합니다.",
      },
      {
        title: "정보 카드 구성",
        tech: "HTML, CSS",
        desc: "개발자 카드의 제목, 특징, 역할 태그를 사용자가 빠르게 파악할 수 있게 배치합니다.",
      }
    ],
    equipped: []
  },
  {
    id: "dev_fullstack",
    name: "이주영 (Jooyoung)",
    type: "풀스택",
    image: "assets/battle/squirtle.png",
    profileImage: "assets/profile/squirtle-profile.png",
    equippedImage: {
      default: "assets/battle/squirtle.png",
      jooyoung_runbook: "assets/battle/squirtle.png",
      jooyoung_toolkit: "assets/battle/squirtle.png",
      jooyoung_energy_drink: "assets/battle/squirtle.png",
      jooyoung_commit_badge: "assets/battle/squirtle.png",
    },
    stats: { hp: 108, coding: 91, debugging: 87, design: 76, speed: 86 },
    description: "필요한 기능을 빠르게 파악하고 실행으로 옮기는 개발자몬입니다. ISTJ다운 안정적인 루틴으로 퀴즈, 도감, 지도 같은 기능을 끝까지 연결합니다.",
    projects: [
      {
        title: "게임 흐름 연결",
        tech: "JavaScript, State",
        desc: "전투에서 퀴즈를 풀고 포획한 뒤 도감으로 이어지는 플레이 흐름을 자연스럽게 묶습니다.",
      },
      {
        title: "인터랙션 구현",
        tech: "DOM, Drag and Drop",
        desc: "메뉴, 도감, 장비 장착처럼 사용자가 직접 만지는 부분의 반응을 안정적으로 만듭니다.",
      }
    ],
    equipped: []
  },
  {
    id: "dev_data",
    name: "김준하 (Junha)",
    type: "프론트엔드",
    image: "assets/battle/pikachu.png",
    profileImage: "assets/profile/pikachu-profile.png",
    equippedImage: {
      default: "assets/battle/pikachu.png",
      junha_wireframe_note: "assets/battle/pikachu.png",
      junha_palette: "assets/battle/pikachu.png",
      junha_flow_lens: "assets/battle/pikachu.png",
      junha_layout_ruler: "assets/battle/pikachu.png",
    },
    stats: { hp: 99, coding: 84, debugging: 92, design: 82, speed: 79 },
    description: "화면에서 보이는 흐름과 사용자가 느끼는 어색함을 잘 잡아내는 프론트엔드 지망 개발자몬입니다. 6월생다운 산뜻한 에너지로 UI의 빈틈을 발견합니다.",
    projects: [
      {
        title: "도감 화면 점검",
        tech: "Frontend QA",
        desc: "개발자 카드, 팀 소개, 장비 영역이 한 화면 안에서 어색하지 않게 이어지는지 확인합니다.",
      },
      {
        title: "사용자 흐름 검증",
        tech: "Scenario Test",
        desc: "인트로, 전투, 포획, 도감 열람까지 실제 플레이 순서대로 확인하며 상태 오류를 줄입니다.",
      }
    ],
    equipped: []
  }
];

// 장착 아이템 데이터 정의
const ITEMS = [
  {
    id: "youngman_arch_note",
    ownerId: "dev_frontend",
    slot: "item-slot-desk",
    name: "아키텍처 노트",
    description: "팀의 학습 흐름을 정리하는 힘이 올라갑니다.",
    icon: "📓",
    statsBoost: { design: 10, debugging: 5 }
  },
  {
    id: "youngman_cloud_map",
    ownerId: "dev_frontend",
    slot: "item-slot-hand",
    name: "클라우드 지도",
    description: "다음 스터디 방향을 또렷하게 잡아줍니다.",
    icon: "🗺️",
    statsBoost: { coding: 15, speed: 10 }
  },
  {
    id: "youngman_focus_timer",
    ownerId: "dev_frontend",
    slot: "item-slot-head",
    name: "집중 타이머",
    description: "꾸준히 공부하는 리듬을 만들어 줍니다.",
    icon: "⏱️",
    statsBoost: { speed: 10, hp: 5 }
  },
  {
    id: "youngman_review_pen",
    ownerId: "dev_frontend",
    slot: "item-slot-face",
    name: "리뷰 펜",
    description: "놓친 부분을 차분하게 다시 보는 힘이 생깁니다.",
    icon: "🖊️",
    statsBoost: { debugging: 15 }
  },
  {
    id: "yukyung_study_log",
    ownerId: "dev_backend",
    slot: "item-slot-desk",
    name: "스터디 기록장",
    description: "배운 내용을 깔끔하게 남기는 아이템입니다.",
    icon: "📒",
    statsBoost: { design: 10, debugging: 10 }
  },
  {
    id: "yukyung_keyword_cards",
    ownerId: "dev_backend",
    slot: "item-slot-hand",
    name: "키워드 카드",
    description: "어려운 내용을 핵심 단어로 정리합니다.",
    icon: "🗂️",
    statsBoost: { coding: 10, design: 5 }
  },
  {
    id: "yukyung_soft_earbuds",
    ownerId: "dev_backend",
    slot: "item-slot-head",
    name: "집중 이어버드",
    description: "조용히 몰입하는 시간을 도와줍니다.",
    icon: "🎧",
    statsBoost: { debugging: 15, hp: 5 }
  },
  {
    id: "yukyung_check_stamp",
    ownerId: "dev_backend",
    slot: "item-slot-face",
    name: "체크 스탬프",
    description: "확인한 내용을 빠짐없이 표시합니다.",
    icon: "✅",
    statsBoost: { debugging: 10, speed: 5 }
  },
  {
    id: "jooyoung_runbook",
    ownerId: "dev_fullstack",
    slot: "item-slot-desk",
    name: "실행 노트",
    description: "배운 내용을 바로 시도해 보는 힘이 올라갑니다.",
    icon: "📔",
    statsBoost: { coding: 10, speed: 10 }
  },
  {
    id: "jooyoung_toolkit",
    ownerId: "dev_fullstack",
    slot: "item-slot-hand",
    name: "작업 툴킷",
    description: "필요한 것을 빠르게 꺼내 쓰는 아이템입니다.",
    icon: "🧰",
    statsBoost: { coding: 15, debugging: 5 }
  },
  {
    id: "jooyoung_energy_drink",
    ownerId: "dev_fullstack",
    slot: "item-slot-head",
    name: "에너지 드링크",
    description: "실행력을 잠깐 끌어올립니다.",
    icon: "🥤",
    statsBoost: { speed: 15, hp: 5 }
  },
  {
    id: "jooyoung_commit_badge",
    ownerId: "dev_fullstack",
    slot: "item-slot-face",
    name: "커밋 배지",
    description: "작게라도 끝까지 남기는 습관을 더합니다.",
    icon: "🏷️",
    statsBoost: { debugging: 10, design: 5 }
  },
  {
    id: "junha_wireframe_note",
    ownerId: "dev_data",
    slot: "item-slot-desk",
    name: "와이어프레임 노트",
    description: "화면 흐름을 먼저 그려보게 해 줍니다.",
    icon: "📝",
    statsBoost: { design: 15, coding: 5 }
  },
  {
    id: "junha_palette",
    ownerId: "dev_data",
    slot: "item-slot-hand",
    name: "컬러 팔레트",
    description: "사용자가 보는 분위기를 차분히 조정합니다.",
    icon: "🎨",
    statsBoost: { design: 20 }
  },
  {
    id: "junha_flow_lens",
    ownerId: "dev_data",
    slot: "item-slot-head",
    name: "흐름 렌즈",
    description: "사용자 입장에서 어색한 지점을 찾습니다.",
    icon: "🔍",
    statsBoost: { debugging: 15, design: 5 }
  },
  {
    id: "junha_layout_ruler",
    ownerId: "dev_data",
    slot: "item-slot-face",
    name: "레이아웃 자",
    description: "간격과 균형을 살피는 데 도움을 줍니다.",
    icon: "📏",
    statsBoost: { design: 10, speed: 5 }
  }
];

// 각 개발자몬 전용 퀴즈 데이터
const QUIZZES = [
  {
    developerId: "dev_fullstack",
    question: "이주영 개발자몬의 MBTI는?",
    options: ["ISFJ", "ENTJ", "ESFP", "ISTJ"],
    answer: 3,
    hint: "계획적이고 차분하게 끝까지 해내는 타입입니다."
  },
  {
    developerId: "dev_backend",
    question: "이유경 개발자몬의 취미는?",
    options: ["줄넘기", "클라이밍", "배드민턴", "축구"],
    answer: 1,
    hint: "손끝과 집중력으로 한 칸씩 올라가는 운동입니다."
  },
  {
    developerId: "dev_frontend",
    question: "김영만 개발자몬이 키우는 강아지 이름은?",
    options: ["복만이", "복복이", "복슬이", "복덩이"],
    answer: 0,
    hint: "영만과 이름 운율이 가장 잘 맞는 친구입니다."
  },
  {
    developerId: "dev_data",
    question: "김준하 개발자몬이 태어난 달은?",
    options: ["2월", "4월", "6월", "8월"],
    answer: 2,
    hint: "여름이 막 시작되는 달입니다."
  }
];

const TEAM_PROFILE = {
  title: "2조 개발자 도감",
  subtitle: "김영만, 김준하, 이유경, 이주영이 함께 만든 레트로 개발자몬 모험팀입니다.",
  motto: "퀴즈를 풀고 개발자몬을 영입하며 2조의 성향, 취미, 취향, 스터디 기록을 하나씩 모아갑니다.",
  members: [
    { id: "dev_frontend", name: "김영만", role: "풀스택", trait: "흐름을 차분하게 잡아주는 안정형 개발자몬" },
    { id: "dev_backend", name: "이유경", role: "풀스택", trait: "정보를 꼼꼼하게 읽고 다듬는 클라이밍형 개발자몬" },
    { id: "dev_fullstack", name: "이주영", role: "풀스택", trait: "계획적으로 기능을 연결하는 ISTJ 개발자몬" },
    { id: "dev_data", name: "김준하", role: "프론트엔드", trait: "사용자 흐름을 빠르게 발견하는 프론트엔드 개발자몬" }
  ]
};

const DEVELOPER_PROFILES = {
  dev_frontend: {
    title: "김영만의 개발자 카드",
    headline: "스터디 내용을 차분히 정리하고 팀이 같은 방향을 보도록 돕습니다.",
    location: "2조 / Developer Town",
    contact: "좋아하는 식당: 뚱가의정부부대찌개 가락점",
    stack: ["풀스택", "스터디 정리", "아키텍처", "클라우드", "복만이"],
    links: [
      { label: "GitHub Pages", url: "https://sksn12.github.io/" },
      { label: "역할: 흐름 정리" },
      { label: "퀴즈 키워드: 복만이" },
      { label: "점심 픽: 부대찌개" }
    ]
  },
  dev_backend: {
    title: "이유경의 개발자 카드",
    headline: "복잡한 내용을 꼼꼼히 읽고 누구나 보기 좋은 카드로 다듬습니다.",
    location: "2조 / Content Lab",
    contact: "좋아하는 식당: K밥상",
    stack: ["풀스택", "콘텐츠", "UX Writing", "기록", "클라이밍"],
    links: [
      { label: "GitHub Pages", url: "https://nunomi0.github.io/" },
      { label: "역할: 소개 구성" },
      { label: "퀴즈 키워드: 클라이밍" },
      { label: "점심 픽: 한식" }
    ]
  },
  dev_fullstack: {
    title: "이주영의 개발자 카드",
    headline: "필요한 기능을 계획적으로 연결하고 플레이 가능한 흐름으로 완성합니다.",
    location: "2조 / Interaction Lab",
    contact: "좋아하는 식당: 샤브로21 가락시장",
    stack: ["풀스택", "JavaScript", "상태 관리", "인터랙션", "ISTJ"],
    links: [
      { label: "GitHub Pages", url: "https://0-x-14.github.io/" },
      { label: "역할: 기능 연결" },
      { label: "퀴즈 키워드: ISTJ" },
      { label: "점심 픽: 샤브샤브" }
    ]
  },
  dev_data: {
    title: "김준하의 개발자 카드",
    headline: "사용자가 실제로 보는 화면의 흐름과 빈틈을 꼼꼼하게 확인합니다.",
    location: "2조 / Frontend Lab",
    contact: "좋아하는 식당: 함경도찹쌀순대",
    stack: ["프론트엔드", "UI 점검", "디버깅", "사용자 흐름", "6월생"],
    links: [
      { label: "GitHub Pages", url: "https://kimjunha1231.github.io/" },
      { label: "역할: 화면 검증" },
      { label: "퀴즈 키워드: 6월" },
      { label: "점심 픽: 순댓국" }
    ]
  }
};

const KAKAO_MAP_APP_KEY = "6d7b76cc96d7ca7daa92386444932c44";

const FAVORITE_RESTAURANTS = [
  {
    id: "lunch_youngman",
    memberId: "dev_frontend",
    memberName: "김영만",
    placeName: "뚱가의정부부대찌개 가락점",
    query: "뚱가 의정부부대찌게 서울 송파구 양재대로62길 42",
    queryCandidates: [
      "뚱가 의정부부대찌게 가락동",
      "뚱가의정부부대찌개 가락점",
      "뚱가 의정부부대찌개 서울 송파구 양재대로62길 42",
      "서울 송파구 양재대로62길 42 부대찌개"
    ],
    address: "서울 송파구 양재대로62길 42",
    category: "부대찌개",
    reason: "든든하고 빠르게 에너지를 채우기 좋은 영만의 점심 픽입니다.",
    fallbackLat: 37.4969824,
    fallbackLng: 127.1197239
  },
  {
    id: "lunch_yukyung",
    memberId: "dev_backend",
    memberName: "이유경",
    placeName: "K밥상",
    query: "K밥상 서울 송파구 중대로 135",
    address: "서울 송파구 중대로 135 지하1층 113호",
    category: "한식",
    reason: "스터디 전후에 부담 없이 먹기 좋은 유경의 한식 픽입니다.",
    fallbackLat: 37.4951285,
    fallbackLng: 127.1224488
  },
  {
    id: "lunch_jooyoung",
    memberId: "dev_fullstack",
    memberName: "이주영",
    placeName: "샤브로21 가락시장",
    query: "샤브로21 가락시장 서울 송파구 송파대로28길 27",
    queryCandidates: [
      "샤브로21 가락시장점",
      "샤브로 21 가락시장",
      "샤브로21 서울 송파구 송파대로28길 27",
      "서울 송파구 송파대로28길 27 102동 114호 샤브샤브"
    ],
    address: "서울 송파구 송파대로28길 27 102동 114호",
    category: "샤브샤브",
    reason: "따뜻한 국물로 집중력을 다시 채우기 좋은 주영의 샤브샤브 픽입니다.",
    fallbackLat: 37.4950793,
    fallbackLng: 127.1206578
  },
  {
    id: "lunch_junha",
    memberId: "dev_data",
    memberName: "김준하",
    placeName: "함경도찹쌀순대",
    query: "함경도찹쌀순대 서울 송파구 송파대로28길 32",
    address: "서울 송파구 송파대로28길 32",
    category: "순댓국",
    reason: "뜨끈하고 든든하게 회복하기 좋은 준하의 점심 픽입니다.",
    fallbackLat: 37.4945055,
    fallbackLng: 127.1204267
  }
];

const sortByKoreanName = (a, b) => a.name.localeCompare(b.name, "ko");
DEVELOPERS.sort(sortByKoreanName);
TEAM_PROFILE.members.sort(sortByKoreanName);
FAVORITE_RESTAURANTS.sort((a, b) => a.memberName.localeCompare(b.memberName, "ko"));

window.DEVELOPERS = DEVELOPERS;
window.ITEMS = ITEMS;
window.QUIZZES = QUIZZES;
window.TEAM_PROFILE = TEAM_PROFILE;
window.DEVELOPER_PROFILES = DEVELOPER_PROFILES;
window.KAKAO_MAP_APP_KEY = KAKAO_MAP_APP_KEY;
window.FAVORITE_RESTAURANTS = FAVORITE_RESTAURANTS;
