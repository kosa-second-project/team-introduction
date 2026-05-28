// 앱 부트스트랩
window.addEventListener("DOMContentLoaded", () => {
  const app = new window.App();
  window.app = app;
  app.init();
  app.switchGameState(app.STATE_INTRO);
});
