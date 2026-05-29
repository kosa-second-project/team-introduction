// 메인 애플리케이션 코어: 생성자와 초기화 흐름만 유지합니다.
class App {
  constructor() {
    this.capturedDevs = []; 
    this.currentSelectedDevId = null; 
    this.activeEnemy = null;
    this.activeQuiz = null;
    this.isResolvingQuiz = false;
    
    this.STATE_INTRO = "INTRO";
    this.STATE_DIALOGUE = "DIALOGUE";
    this.STATE_WORLD = "WORLD";
    this.STATE_BATTLE = "BATTLE";
    this.STATE_ENDING = "ENDING";
    this.currentGameState = this.STATE_INTRO;

    // 대화 및 타이핑 제어
    this.dialogueQueue = [];
    this.dialogueIndex = 0;
    this.typingTimer = null; // 타자기 타이핑 타이머

    // 인게임 메뉴
    this.isMenuOpen = false;
    this.menuOptions = ["pokedex", "save", "mute", "close"];
    this.menuSelectedIndex = 0;
    this.isVolumeControlOpen = false;

    this.engine = null;
    this.dragDrop = null;
    this.worldInput = new window.WorldInputState();
    this.stateBeforeOverlay = null;
    this.toastTimer = null;
    this.battleAnimTimer = null;
    this.isAwaitingPokeballThrow = false;
    this.isDraggingPokeball = false;
    this.pokeballThrowRaf = null;
    this.pokeballPointerId = null;
    this.pokeballDragStart = null;
    this.pokeballLastPoint = null;
    this.pokeballRenderSize = window.POKEBALL_THROW_CONFIG.renderSize;
    this.pokeballRadius = window.POKEBALL_THROW_CONFIG.radius;
    this.pokeballMaxPull = window.POKEBALL_THROW_CONFIG.maxPull;
    this.pokeballPower = window.POKEBALL_THROW_CONFIG.power;
    this.pokeballGravity = window.POKEBALL_THROW_CONFIG.gravity;
    this.pokeballAirDrag = window.POKEBALL_THROW_CONFIG.airDrag;
    this.pokeballTrajectoryDots = window.POKEBALL_THROW_CONFIG.trajectoryDots;
    this.selectedPokeballIndex = 0;
    this.pokeballChoices = window.POKEBALL_CHOICES;
    this.captureRecorder = null;
    this.captureChunks = [];
    this.captureFrameId = null;
    this.captureTimeoutId = null;
    this.captureCanvas = null;
    this.captureStream = null;
    this.captureVideoUrls = {};
    this.captureDbName = "dev_pokedex_capture_videos";
    this.captureStoreName = "videos";
    this.developerState = new window.DeveloperStateManager(window.DEVELOPERS, window.ITEMS);
    this.customItems = [];
    this.itemPixels = Array(16 * 16).fill("");
    this.itemDrawColor = "#2d5da8";
    this.itemPalette = ["#111111", "#ffffff", "#b81d24", "#f1c232", "#70a85f", "#2d5da8", "#8a4fb8", "#f28c28"];
  }

  init() {
    // 0. 배틀 스프라이트 이미지 선로드 (캐시)
    window.GameEngine.preloadBattleSprites();

    // 1. 로컬 스토리지 데이터 로드 (Web Storage API)
    this.loadCustomItems();
    this.loadGameState();
    this.loadCaptureVideos();

    // 2. 인트로/엔딩 별 파티클 렌더
    this.createStarField("intro-star-field", 72);
    this.createStarField("ending-star-bg", 96);

    // 3. 엔진 구동
    this.engine = new window.GameEngine("world-canvas", () => this.startEncounter());

    // 4. 옷입히기 D&D 바인딩 (Drag & Drop API)
    this.dragDrop = new window.DragDropManager(this);

    // 5. 돔 이벤트 매핑
    this.bindDomEvents();
    this.initCustomItemMaker();
    this.renderItemInventory();

    // 6. 도감 목록 초기 렌더
    this.renderPokedexList();
  }
}

window.App = App;
