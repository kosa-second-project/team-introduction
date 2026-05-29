// 개발자 도감 데이터 정의
const DEVELOPERS = [
  {
    id: "dev_frontend",
    name: "김영만 (Youngman)",
    type: "기획 · 프론트엔드",
    image: "assets/battle/pikachu.png",
    profileImage: "assets/profile/pikachu-profile.png",
    equippedImage: {
      default: "assets/battle/pikachu.png",
      macbook: "assets/battle/pikachu.png",
      headphones: "assets/battle/pikachu.png",
      glasses: "assets/battle/pikachu.png",
      coffee: "assets/battle/pikachu.png",
    },
    stats: { hp: 105, coding: 86, debugging: 78, design: 88, speed: 82 },
    description: "팀의 아이디어를 실제 화면 흐름으로 옮기는 개발자몬입니다. 레트로 게임 감성과 사용자가 길을 잃지 않는 인터페이스를 함께 챙깁니다.",
    projects: [
      {
        title: "도감 메인 플로우 설계",
        tech: "Vanilla JS, CSS, Canvas",
        desc: "포획한 조원을 자연스럽게 확인할 수 있도록 리스트, 상세 정보, 장비 장착 흐름을 정리했습니다.",
      },
      {
        title: "레트로 UI 디테일 튜닝",
        tech: "HTML, CSS, Interaction",
        desc: "픽셀풍 카드, 배지, 상태 표시를 다듬어 도감 화면의 완성도를 높였습니다."
      }
    ],
    equipped: [] // 장착된 아이템 목록
  },
  {
    id: "dev_backend",
    name: "이유경 (Yukyung)",
    type: "콘텐츠 · UI 설계",
    image: "assets/battle/charmander.png",
    profileImage: "assets/profile/charmander-profile.png",
    equippedImage: {
      default: "assets/battle/charmander.png",
      macbook: "assets/battle/charmander.png",
      headphones: "assets/battle/charmander.png",
      glasses: "assets/battle/charmander.png",
      coffee: "assets/battle/charmander.png",
    },
    stats: { hp: 102, coding: 82, debugging: 84, design: 91, speed: 76 },
    description: "조 소개에 필요한 말맛과 화면 구성을 정리하는 개발자몬입니다. 정보가 딱딱하게 보이지 않도록 카드의 리듬과 문장을 세심하게 다룹니다.",
    projects: [
      {
        title: "조원 소개 콘텐츠 구성",
        tech: "UX Writing, HTML, CSS",
        desc: "각 조원의 특징이 한눈에 들어오도록 소개 문장, 역할 배지, 프로젝트 설명을 정리했습니다.",
      },
      {
        title: "도감 상세 페이지 정보 구조",
        tech: "Layout, Component, Copy",
        desc: "팀 소개와 개인 소개가 서로 겹치지 않도록 정보의 순서와 강조점을 설계했습니다."
      }
    ],
    equipped: []
  },
  {
    id: "dev_fullstack",
    name: "이주영 (Jooyoung)",
    type: "인터랙션 · 기능 구현",
    image: "assets/battle/squirtle.png",
    profileImage: "assets/profile/squirtle-profile.png",
    equippedImage: {
      default: "assets/battle/squirtle.png",
      macbook: "assets/battle/squirtle.png",
      headphones: "assets/battle/squirtle.png",
      glasses: "assets/battle/squirtle.png",
      coffee: "assets/battle/squirtle.png",
    },
    stats: { hp: 108, coding: 90, debugging: 87, design: 74, speed: 86 },
    description: "아이디어가 실제로 움직이게 만드는 실행형 개발자몬입니다. 클릭, 드래그, 상태 변화처럼 손맛이 필요한 기능을 안정적으로 연결합니다.",
    projects: [
      {
        title: "장비 장착 인터랙션 구현",
        tech: "JavaScript, Drag and Drop, State",
        desc: "아이템을 끌어다 놓거나 클릭해서 조원 카드에 장착하는 인터랙션을 구성했습니다.",
      },
      {
        title: "포획 후 도감 갱신 로직",
        tech: "LocalStorage, IndexedDB, DOM",
        desc: "포획 상태와 녹화 영상을 도감에서 다시 볼 수 있도록 저장 흐름을 연결했습니다."
      }
    ],
    equipped: []
  },
  {
    id: "dev_data",
    name: "김준하 (Junha)",
    type: "데이터 · 테스트",
    image: "assets/battle/eevee.png",
    profileImage: "assets/profile/eevee-profile.png",
    equippedImage: {
      default: "assets/battle/eevee.png",
      macbook: "assets/battle/eevee.png",
      headphones: "assets/battle/eevee.png",
      glasses: "assets/battle/eevee.png",
      coffee: "assets/battle/eevee.png",
    },
    stats: { hp: 99, coding: 84, debugging: 92, design: 68, speed: 79 },
    description: "작은 오류와 흐름의 빈틈을 찾아내는 분석형 개발자몬입니다. 저장 데이터, 퀴즈 진행, 도감 상태가 어긋나지 않도록 꼼꼼히 확인합니다.",
    projects: [
      {
        title: "도감 상태 검증",
        tech: "JavaScript, LocalStorage, QA",
        desc: "포획 여부, 장착 아이템, 선택된 조원 정보가 새로고침 후에도 유지되는지 확인했습니다.",
      },
      {
        title: "퀴즈와 전투 흐름 테스트",
        tech: "Scenario Test, Debugging",
        desc: "전투에서 도감으로 이어지는 플레이 흐름을 점검하고 어색한 문구와 상태 표시를 다듬었습니다."
      }
    ],
    equipped: []
  }
];

// 장착 아이템 데이터 정의
const ITEMS = [
  {
    id: "macbook",
    name: "M3 맥북 프로",
    description: "장착 시 코딩 속도와 스탯이 크게 증가합니다.",
    icon: "💻",
    statsBoost: { coding: 15, speed: 10 }
  },
  {
    id: "headphones",
    name: "노이즈 캔슬링 헤드폰",
    description: "장착 시 몰입도가 극대화되어 디버깅 수치가 향상됩니다.",
    icon: "🎧",
    statsBoost: { debugging: 20 }
  },
  {
    id: "glasses",
    name: "블루라이트 차단 안경",
    description: "장착 시 화면 가독성과 디테일 분석 능력이 올라갑니다.",
    icon: "👓",
    statsBoost: { design: 15, debugging: 5 }
  },
  {
    id: "coffee",
    name: "아이스 아메리카노",
    description: "코딩에 활기를 줍니다. HP와 스피드가 영구 상승합니다.",
    icon: "☕",
    statsBoost: { speed: 15, coding: 5 }
  }
];

// 야생의 퀴즈 데이터 정의 (개발 분야별 퀴즈)
const QUIZZES = [
  {
    question: "JavaScript에서 '=='와 '==='의 차이점은 무엇인가요?",
    options: [
      "차이가 없으며 동일하게 사용된다.",
      "'=='는 값만 비교하고, '==='는 값과 데이터 타입까지 엄격하게 비교한다.",
      "'==='는 주소값만 비교하고, '=='는 해시코드값만 비교한다.",
      "'=='는 문자열만 비교할 수 있다."
    ],
    answer: 1,
    hint: "자바스크립트의 동등 비교 연산자(Loose/Strict Equality)에 대한 특징입니다."
  },
  {
    question: "CSS에서 Flexbox 레이아웃 사용 시, 주 축(Main Axis)의 정렬을 지정하는 속성은?",
    options: [
      "align-items",
      "align-content",
      "justify-content",
      "flex-direction"
    ],
    answer: 2,
    hint: "가로 또는 세로 주 축 방향으로 아이템들의 정렬과 여백을 맞추는 속성입니다."
  },
  {
    question: "HTML5의 Semantic 태그에 해당하지 않는 엘리먼트는?",
    options: [
      "<section>",
      "<div>",
      "<article>",
      "<aside>"
    ],
    answer: 1,
    hint: "의미를 내포하지 않는 범용 레이아웃 블록 요소입니다."
  },
  {
    question: "웹 브라우저의 Storage 중, 브라우저 창을 닫아도 데이터가 영구히 유지되는 스토리지 API는?",
    options: [
      "SessionStorage",
      "Cookie",
      "LocalStorage",
      "CacheStorage"
    ],
    answer: 2,
    hint: "만료 기한 없이 데이터를 저장하며, 지우기 전까지 영구 보존되는 Web Storage API입니다."
  },
  {
    question: "RESTful API의 HTTP Method 중, 기존 자원을 전체적으로 수정하거나 교체할 때 주로 사용하는 메서드는?",
    options: [
      "GET",
      "POST",
      "PUT",
      "PATCH"
    ],
    answer: 2,
    hint: "PATCH는 부분 수정에 쓰고, 전체 수정/대체에는 이 메서드를 사용합니다."
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
  title: "우리 조 개발자 도감",
  subtitle: "김영만, 이유경, 이주영, 김준하가 함께 만든 레트로 개발자 모험팀입니다.",
  motto: "각자 다른 스탯을 합쳐 하나의 플레이 경험을 완성합니다.",
  members: [
    { id: "dev_frontend", name: "김영만", role: "기획 · 프론트엔드", trait: "화면 흐름과 완성도 담당" },
    { id: "dev_backend", name: "이유경", role: "콘텐츠 · UI 설계", trait: "소개 문장과 정보 구조 담당" },
    { id: "dev_fullstack", name: "이주영", role: "인터랙션 · 기능 구현", trait: "움직이는 기능과 상태 연결 담당" },
    { id: "dev_data", name: "김준하", role: "데이터 · 테스트", trait: "저장 흐름과 디버깅 담당" }
  ]
};

const DEVELOPER_PROFILES = {
  dev_frontend: {
    title: "김영만의 개발자 카드",
    headline: "아이디어를 플레이 가능한 화면 흐름으로 바꾸는 팀의 방향키입니다.",
    location: "4조 / Developer Town",
    contact: "Team Member 01",
    stack: ["기획", "HTML", "CSS", "JavaScript", "UI Flow"],
    links: [
      { label: "역할: 화면 흐름" },
      { label: "기여: 도감 UI" },
      { label: "특징: 꼼꼼함" }
    ]
  },
  dev_backend: {
    title: "이유경의 개발자 카드",
    headline: "정보가 보기 좋게 읽히도록 소개 콘텐츠와 카드 구성을 다듬습니다.",
    location: "4조 / Content Lab",
    contact: "Team Member 02",
    stack: ["UX Writing", "콘텐츠", "CSS", "Layout", "Design"],
    links: [
      { label: "역할: 소개 구성" },
      { label: "기여: 문구 정리" },
      { label: "특징: 섬세함" }
    ]
  },
  dev_fullstack: {
    title: "이주영의 개발자 카드",
    headline: "도감과 전투가 자연스럽게 이어지도록 기능의 손맛을 연결합니다.",
    location: "4조 / Interaction Lab",
    contact: "Team Member 03",
    stack: ["JavaScript", "DOM", "Drag Drop", "State", "Feature"],
    links: [
      { label: "역할: 기능 연결" },
      { label: "기여: 인터랙션" },
      { label: "특징: 실행력" }
    ]
  },
  dev_data: {
    title: "김준하의 개발자 카드",
    headline: "플레이 흐름의 빈틈을 잡고 저장 데이터와 상태를 꼼꼼히 확인합니다.",
    location: "4조 / Debug Tower",
    contact: "Team Member 04",
    stack: ["테스트", "Debugging", "Data", "Storage", "QA"],
    links: [
      { label: "역할: 검증" },
      { label: "기여: 디버깅" },
      { label: "특징: 분석력" }
    ]
  }
};

window.DEVELOPERS = DEVELOPERS;
window.ITEMS = ITEMS;
window.QUIZZES = QUIZZES;
window.TEAM_PROFILE = TEAM_PROFILE;
window.DEVELOPER_PROFILES = DEVELOPER_PROFILES;
