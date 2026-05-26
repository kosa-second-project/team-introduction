# 조 소개 웹페이지 구현 계획서 (Game-Themed Team Introduction)

이 계획서는 HTML, CSS, JavaScript만을 사용하여 반응형 게임 테마(RPG 길드 컨셉)의 조 소개 웹페이지를 개발하기 위한 세부 계획입니다. 요구사항인 5가지 HTML API(Geolocation, Drag & Drop, Web Storage, HTML Video, HTML Audio)가 모두 자연스럽게 포함되며, Linear 디자인 스타일(`DESIGN.md`)을 준수합니다.

## 1. 프로젝트 기본 컨셉 (RPG Guild Board)
- **테마**: 레트로 판타지 RPG 길드 로비 ("The Coding Guild: Team 2")
- **디자인 스타일**: Linear(`DESIGN.md`) 스타일 기반의 다크 테마 적용
  - 기본 배경색: `#010102` (캔버스 색상)
  - 카드 및 패널: `#0f1011` (Surface 1) 및 `#141516` (Surface 2)
  - 테두리: `#23252a` (Hairline)의 미세한 두께의 테두리
  - 강조색: `#5e6ad2` (Linear Lavender-Blue)
  - 게임 요소 강조색: Gold (`#f5a623`), Health (`#ff4d4f`), Mana (`#5e6ad2`), XP (`#52c41a`)
- **레이아웃**: 상단 헤더(길드 정보, 골드/레벨 표시, 음악 볼륨), 네비게이션 탭, 메인 컨텐츠 영역, 하단 푸터로 이루어진 반응형 레이아웃.

---

## 2. 조원 기본 데이터 (Character Roster)
조원들의 이름과 RPG 클래스를 결합하여 고품질의 카드 데이터를 구현합니다.

| 이름 | RPG 클래스 | 주요 역할 | 대표 스킬 (Skill) | 기본 능력치 (Stats) |
| :--- | :--- | :--- | :--- | :--- |
| **이유경** | **Guild Master (길드장)** | 총괄 및 기획 (Leader) | Commanding Voice (소집령)<br>Project Shield (일정 보호) | Leadership: 95 / Strategy: 90 / Coding: 85 |
| **김영만** | **Arch-Mage (대마법사)** | 프론트엔드 개발 (Frontend) | DOM Manipulation (DOM 제어)<br>CSS Alchemy (스타일 연금술) | Magic(JS): 96 / CSS: 90 / Speed: 92 |
| **김준하** | **Shadow Assassin (암살자)** | 풀스택 개발 (Fullstack) | Database Shadowing (DB 잠입)<br>REST Pierce (API 관통) | Backend: 94 / API Pierce: 92 / Agility: 90 |
| **이주영** | **High Priest (대사제)** | 백엔드 및 QA (Stability) | Query Blessing (쿼리 축복)<br>Null-pointer Ward (방어막) | Stability: 95 / Query Wisdom: 93 / QA: 92 |

---

## 3. 주요 기능 및 적용될 HTML API
웹페이지 내에서 5가지 API가 유기적으로 작동하도록 구현합니다.

| API 종류 | 구현 내용 | 설명 |
| :--- | :--- | :--- |
| **HTML Audio API** | 길드 배경음악(BGM) 및 효과음 재생 | - BGM 재생/일시정지 및 볼륨 조절 슬라이더 제공<br>- Web Audio API를 활용해 마우스 오버 및 클릭 시 레트로 효과음(8비트 코인 소리 등) 자체 합성 재생 |
| **HTML Video API** | 길드 홍보/소개 비디오 플레이어 | - Tavern(로비) 탭 내 '마법의 거울' 테마의 비디오 창 삽입<br>- 재생, 일시정지, 음소거 등 커스텀 컨트롤 적용 |
| **Web Storage API** | 사용자 진행 상황 저장 (Save/Load) | - 사용자가 페이지를 돌아다니며 획득한 골드(Gold), 경험치(XP), 레벨 저장<br>- 구성한 모험가 파티(Party) 정보 및 오디오 설정 저장 (새로고침 시 유지) |
| **Geolocation API** | 길드 본부(HQ)와 나의 거리 계산 | - 사용자의 현재 위치 좌표를 가져옴<br>- 학교/강의실 등 지정된 '길드 본부' 좌표와의 실제 거리(km)를 하버사인 공식으로 실시간 계산하여 출력 |
| **Drag and Drop API** | 모험가 파티(Party) 편성 | - 4명의 조원 카드를 드래그하여 활성화된 파티 슬롯(Vanguard, Striker, Supporter)에 배치<br>- 배치 완료 시 전체 전투력 상승 및 보너스 골드 지급 효과 |

---

## 4. DESIGN.md 검토 및 수정 사항
`DESIGN.md`는 고품질의 Linear.app 디자인을 모방하고 있으며, 이를 게임 테마에 맞게 결합하기 위해 다음 부분을 추가/수정했습니다.
1. **게임 컴포넌트 추가**:
   - `character-card`: 조원 정보를 담기 위해 Surface-1 배경에 Hairline 테두리를 두르고 패딩을 부여한 캐릭터 전용 카드.
   - `party-slot`: 드래그 앤 드롭을 위해 Canvas 배경에 대시 형태의 테두리를 준 파티 배치 영역.
   - `stat-bar`: 캐릭터 능력치(HP, MP, XP 등)를 나타낼 수 있는 둥근 바 디자인.
   - `quest-card`: 퀘스트 정보를 표시하는 카드 컴포넌트.
2. **게임 확장 색상 추가**:
   - 골드 (`#f5a623`), 체력 (`#ff4d4f`), 마나/레벨 (`#5e6ad2`), 경험치 (`#52c41a`)를 시스템 색상군으로 정의하여 스탯 바와 UI 텍스트에 다채롭지만 정돈된 액센트를 부여합니다.
3. **폰트 설정**:
   - `DESIGN.md`에서는 SF Pro Display 및 Inter 폰트를 fallback으로 제안하고 있습니다. 게임 테마의 세련된 느낌을 주기 위해 기하학적이고 현대적인 느낌의 Google Fonts인 **Orbitron** 또는 **Share Tech Mono**를 추가적으로 로드하여 게임 UI 수치 및 레이블에 적용할 예정입니다.

---

## 5. 파일 구조
```
/Users/junha/coding/team2/
├── index.html       # 메인 페이지 마크업 (시맨틱 태그 적용)
├── style.css        # 게임 테마 스타일시트 (Flex/Grid 반응형 설계, 애니메이션)
└── app.js           # API 연동 및 인터랙션 로직 JS (오디오 합성기 포함)
```

---

## 6. 승인 요청
데이터 및 디자인 사양 수정안이 완료되었습니다. 확인 후 승인해주시면 즉시 코드 파일 작성을 시작하겠습니다!
