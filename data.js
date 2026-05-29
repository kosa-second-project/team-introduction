// 개발자 도감 데이터 정의
const DEVELOPERS = [
  {
    id: "dev_frontend",
    name: "김영만 (Youngman)",
    type: "풀스택",
    image: "assets/battle/pikachu.png",
    equippedImage: {
      default: "assets/battle/pikachu.png",
      youngman_arch_note: "assets/battle/pikachu.png",
      youngman_cloud_map: "assets/battle/pikachu.png",
      youngman_focus_timer: "assets/battle/pikachu.png",
      youngman_review_pen: "assets/battle/pikachu.png",
    },
    stats: { hp: 105, coding: 86, debugging: 78, design: 88, speed: 82 },
    description: "2조에서 스터디를 함께 이어가는 풀스택 지망 개발자입니다. 차분하게 흐름을 정리하고 필요한 내용을 꾸준히 쌓아갑니다.",
    projects: [
      {
        title: "아키텍처 스터디 1주차",
        tech: "Architecture Study",
        desc: "서비스 구조를 바라보는 기본 관점과 역할 분리를 함께 정리했습니다.",
      },
      {
        title: "클라우드 스터디 예정",
        tech: "Cloud Study",
        desc: "배포 환경과 인프라 흐름을 이해하기 위한 다음 스터디를 준비하고 있습니다."
      }
    ],
    equipped: [] // 장착된 아이템 목록
  },
  {
    id: "dev_backend",
    name: "이유경 (Yukyung)",
    type: "풀스택",
    image: "assets/battle/charmander.png",
    equippedImage: {
      default: "assets/battle/charmander.png",
      yukyung_study_log: "assets/battle/charmander.png",
      yukyung_keyword_cards: "assets/battle/charmander.png",
      yukyung_soft_earbuds: "assets/battle/charmander.png",
      yukyung_check_stamp: "assets/battle/charmander.png",
    },
    stats: { hp: 102, coding: 82, debugging: 84, design: 91, speed: 76 },
    description: "2조에서 스터디를 함께 이어가는 풀스택 지망 개발자입니다. 내용을 꼼꼼히 읽고 팀 안에서 이해한 부분을 담백하게 정리합니다.",
    projects: [
      {
        title: "아키텍처 스터디 1주차",
        tech: "Architecture Study",
        desc: "서비스 구조를 바라보는 기본 관점과 역할 분리를 함께 정리했습니다.",
      },
      {
        title: "클라우드 스터디 예정",
        tech: "Cloud Study",
        desc: "배포 환경과 인프라 흐름을 이해하기 위한 다음 스터디를 준비하고 있습니다."
      }
    ],
    equipped: []
  },
  {
    id: "dev_fullstack",
    name: "이주영 (Jooyoung)",
    type: "풀스택",
    image: "assets/battle/squirtle.png",
    equippedImage: {
      default: "assets/battle/squirtle.png",
      jooyoung_runbook: "assets/battle/squirtle.png",
      jooyoung_toolkit: "assets/battle/squirtle.png",
      jooyoung_energy_drink: "assets/battle/squirtle.png",
      jooyoung_commit_badge: "assets/battle/squirtle.png",
    },
    stats: { hp: 108, coding: 90, debugging: 87, design: 74, speed: 86 },
    description: "2조에서 스터디를 함께 이어가는 풀스택 지망 개발자입니다. 필요한 내용을 빠르게 파악하고 실행으로 옮기는 편입니다.",
    projects: [
      {
        title: "아키텍처 스터디 1주차",
        tech: "Architecture Study",
        desc: "서비스 구조를 바라보는 기본 관점과 역할 분리를 함께 정리했습니다.",
      },
      {
        title: "클라우드 스터디 예정",
        tech: "Cloud Study",
        desc: "배포 환경과 인프라 흐름을 이해하기 위한 다음 스터디를 준비하고 있습니다."
      }
    ],
    equipped: []
  },
  {
    id: "dev_data",
    name: "김준하 (Junha)",
    type: "프론트엔드",
    image: "assets/battle/eevee.png",
    equippedImage: {
      default: "assets/battle/eevee.png",
      junha_wireframe_note: "assets/battle/eevee.png",
      junha_palette: "assets/battle/eevee.png",
      junha_flow_lens: "assets/battle/eevee.png",
      junha_layout_ruler: "assets/battle/eevee.png",
    },
    stats: { hp: 99, coding: 84, debugging: 92, design: 68, speed: 79 },
    description: "2조에서 스터디를 함께 이어가는 프론트엔드 지망 개발자입니다. 화면에서 보이는 흐름과 사용자 입장을 차분히 살핍니다.",
    projects: [
      {
        title: "아키텍처 스터디 1주차",
        tech: "Architecture Study",
        desc: "서비스 구조를 바라보는 기본 관점과 역할 분리를 함께 정리했습니다.",
      },
      {
        title: "클라우드 스터디 예정",
        tech: "Cloud Study",
        desc: "배포 환경과 인프라 흐름을 이해하기 위한 다음 스터디를 준비하고 있습니다."
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
    description: "흐름을 정리하는 힘이 올라갑니다.",
    icon: "📓",
    statsBoost: { design: 10, debugging: 5 }
  },
  {
    id: "youngman_cloud_map",
    ownerId: "dev_frontend",
    slot: "item-slot-hand",
    name: "클라우드 지도",
    description: "다음 스터디 방향을 잡는 아이템입니다.",
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

// 야생의 퀴즈 데이터 정의 (스터디 주제 기반 퀴즈)
const QUIZZES = [
  {
    question: "소프트웨어 아키텍처를 정리할 때 가장 먼저 확인하면 좋은 것은?",
    options: [
      "화면 색상만 정하기",
      "서비스가 해결하려는 문제와 주요 흐름 파악하기",
      "파일 이름을 먼저 전부 바꾸기",
      "배포 날짜만 정하기"
    ],
    answer: 1,
    hint: "구조는 목적과 흐름을 이해한 뒤에 잡는 편이 좋습니다."
  },
  {
    question: "계층형 구조에서 표현 영역과 데이터 처리 영역을 나누는 주된 이유는?",
    options: [
      "책임을 분리해 변경 영향을 줄이기 위해",
      "파일 수를 무조건 늘리기 위해",
      "이름을 어렵게 만들기 위해",
      "사용자 입력을 막기 위해"
    ],
    answer: 0,
    hint: "각 영역이 맡는 일을 분명히 하면 유지보수가 쉬워집니다."
  },
  {
    question: "클라우드 스터디에서 다루기 좋은 기본 주제로 가장 알맞은 것은?",
    options: [
      "서버 배포와 네트워크 흐름",
      "로고 색상 고르기",
      "팀 이름만 다시 정하기",
      "키보드 단축키 외우기"
    ],
    answer: 0,
    hint: "클라우드는 서비스를 어디에, 어떻게 올리고 연결하는지부터 보면 좋습니다."
  },
  {
    question: "아키텍처 스터디 내용을 팀 소개에 넣을 때 가장 자연스러운 방식은?",
    options: [
      "개인별 기능 목록처럼 과장해서 적기",
      "스터디 주제와 앞으로의 학습 방향을 간단히 적기",
      "아무 설명 없이 이름만 나열하기",
      "모든 용어를 길게 풀어쓰기"
    ],
    answer: 1,
    hint: "아직 프로젝트 전이라면 학습 과정과 방향을 담백하게 보여주는 편이 좋습니다."
  },
  {
    question: "협업 스터디에서 기록을 남기는 이유로 가장 적절한 것은?",
    options: [
      "나중에 다시 보고 팀의 이해도를 맞추기 위해",
      "회의 시간을 늘리기 위해",
      "누가 더 많이 말했는지 세기 위해",
      "자료를 숨기기 위해"
    ],
    answer: 0,
    hint: "기록은 다음 학습으로 이어지는 기준점이 됩니다."
  },
  {
    question: "Git에서 원격 저장소의 최신 변경 내용을 로컬에 다운로드하여 병합(Merge)까지 한 번에 수행하는 명령은?",
    options: [
      "git fetch",
      "git clone",
      "git pull",
      "git push"
    ],
    answer: 2,
    hint: "원격지 소스를 동기화하면서 병합을 자동으로 실행해 주는 명령어입니다."
  }
];

// ESM 모듈화 대신 바닐라 전역 객체로 사용 (여러 스크립트 로드 방식 고려)
const TEAM_PROFILE = {
  title: "2조 개발자 도감",
  subtitle: "김영만, 이유경, 이주영, 김준하가 함께 스터디를 이어가는 팀입니다.",
  motto: "아키텍처 스터디 1주차를 마쳤고, 다음은 클라우드 스터디로 이어갑니다.",
  members: [
    { id: "dev_frontend", name: "김영만", role: "풀스택", trait: "흐름을 차분히 정리하는 편" },
    { id: "dev_backend", name: "이유경", role: "풀스택", trait: "내용을 꼼꼼히 다듬는 편" },
    { id: "dev_fullstack", name: "이주영", role: "풀스택", trait: "빠르게 이해하고 실행하는 편" },
    { id: "dev_data", name: "김준하", role: "프론트엔드", trait: "사용자 관점으로 살피는 편" }
  ]
};

const DEVELOPER_PROFILES = {
  dev_frontend: {
    title: "김영만의 개발자 카드",
    headline: "풀스택을 목표로 공부하며 전체 흐름을 차분하게 정리합니다.",
    location: "2조 / Architecture Study",
    contact: "Team Member 01",
    stack: ["풀스택", "아키텍처", "클라우드 예정", "정리", "꾸준함"],
    links: [
      { label: "개인 포트폴리오", url: "https://nunomi0.github.io/" },
      { label: "역할: 스터디 참여" },
      { label: "특징: 안정감" }
    ]
  },
  dev_backend: {
    title: "이유경의 개발자 카드",
    headline: "풀스택을 목표로 공부하며 내용을 꼼꼼하게 이해하고 정리합니다.",
    location: "2조 / Architecture Study",
    contact: "Team Member 02",
    stack: ["풀스택", "아키텍처", "클라우드 예정", "기록", "섬세함"],
    links: [
      { label: "개인 포트폴리오", url: "https://nunomi0.github.io/" },
      { label: "역할: 스터디 참여" },
      { label: "특징: 꼼꼼함" }
    ]
  },
  dev_fullstack: {
    title: "이주영의 개발자 카드",
    headline: "풀스택을 목표로 공부하며 배운 내용을 빠르게 적용해 봅니다.",
    location: "2조 / Architecture Study",
    contact: "Team Member 03",
    stack: ["풀스택", "아키텍처", "클라우드 예정", "실행력", "적응력"],
    links: [
      { label: "개인 포트폴리오", url: "https://nunomi0.github.io/" },
      { label: "역할: 스터디 참여" },
      { label: "특징: 실행력" }
    ]
  },
  dev_data: {
    title: "김준하의 개발자 카드",
    headline: "프론트엔드를 목표로 공부하며 사용자에게 보이는 흐름을 중요하게 봅니다.",
    location: "2조 / Architecture Study",
    contact: "Team Member 04",
    stack: ["프론트엔드", "아키텍처", "클라우드 예정", "사용자 관점", "분석력"],
    links: [
      { label: "개인 포트폴리오", url: "https://nunomi0.github.io/" },
      { label: "역할: 스터디 참여" },
      { label: "특징: 관찰력" }
    ]
  }
};

const KAKAO_MAP_APP_KEY = "";

const FAVORITE_RESTAURANTS = [
  {
    id: "lunch_youngman",
    memberId: "dev_frontend",
    memberName: "김영만",
    placeName: "취영루 송파점",
    query: "취영루 송파점 경찰병원역",
    category: "중식",
    reason: "여럿이 가도 메뉴 선택이 편한 중식 픽입니다.",
    fallbackLat: 37.4951,
    fallbackLng: 127.1253
  },
  {
    id: "lunch_yukyung",
    memberId: "dev_backend",
    memberName: "이유경",
    placeName: "팔각도 송파가락점",
    query: "팔각도 송파가락점 경찰병원역",
    category: "닭구이",
    reason: "든든하게 먹고 오후 스터디로 넘어가기 좋은 선택입니다.",
    fallbackLat: 37.4978,
    fallbackLng: 127.1237
  },
  {
    id: "lunch_jooyoung",
    memberId: "dev_fullstack",
    memberName: "이주영",
    placeName: "토담",
    query: "토담 송이로17길 경찰병원역",
    category: "한식",
    reason: "집밥 느낌으로 조용히 한 끼 먹기 좋은 한식 픽입니다.",
    fallbackLat: 37.4972,
    fallbackLng: 127.1275
  },
  {
    id: "lunch_junha",
    memberId: "dev_data",
    memberName: "김준하",
    placeName: "함경도 찹쌀순대 가락시장",
    query: "함경도 찹쌀순대 가락시장 경찰병원역",
    category: "순댓국",
    reason: "빠르고 든든하게 먹기 좋은 점심 후보입니다.",
    fallbackLat: 37.4935,
    fallbackLng: 127.1186
  }
];

window.DEVELOPERS = DEVELOPERS;
window.ITEMS = ITEMS;
window.QUIZZES = QUIZZES;
window.TEAM_PROFILE = TEAM_PROFILE;
window.DEVELOPER_PROFILES = DEVELOPER_PROFILES;
window.KAKAO_MAP_APP_KEY = KAKAO_MAP_APP_KEY;
window.FAVORITE_RESTAURANTS = FAVORITE_RESTAURANTS;
