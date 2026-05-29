class DragDropManager {
  constructor(appInstance) {
    this.app = appInstance;
    this.dropZone = document.getElementById("character-drop-zone");
    this.dragItemsContainer = document.getElementById("items-drag-box");

    this.initEvents();
  }

  initEvents() {
    this.dragItemsContainer.addEventListener("dragstart", (event) => {
      const dragItem = event.target.closest(".drag-item-node");
      if (!dragItem) return;

      const itemId = dragItem.getAttribute("data-item-id");
      event.dataTransfer.setData("text/plain", itemId);
      event.dataTransfer.effectAllowed = "move";
      dragItem.style.opacity = "0.4";
    });

    this.dragItemsContainer.addEventListener("dragend", (event) => {
      const dragItem = event.target.closest(".drag-item-node");
      if (dragItem) dragItem.style.opacity = "1";
    });

    this.dragItemsContainer.addEventListener("click", (event) => {
      const itemNode = event.target.closest(".drag-item-node");
      if (!itemNode) return;

      const activeDevId = this.app.currentSelectedDevId;
      if (!activeDevId) {
        this.app.showTemporaryToast("먼저 장비를 줄 개발자를 선택해 주세요.");
        return;
      }

      this.handleEquipDrop(activeDevId, itemNode.getAttribute("data-item-id"));
    });

    this.dropZone.addEventListener("dragenter", (event) => {
      event.preventDefault();
      if (this.app.currentSelectedDevId) {
        this.dropZone.classList.add("dragover-active");
      }
    });

    this.dropZone.addEventListener("dragover", (event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
    });

    this.dropZone.addEventListener("dragleave", () => {
      this.dropZone.classList.remove("dragover-active");
    });

    this.dropZone.addEventListener("drop", (event) => {
      event.preventDefault();
      this.dropZone.classList.remove("dragover-active");

      const activeDevId = this.app.currentSelectedDevId;
      const itemId = event.dataTransfer.getData("text/plain");
      if (!activeDevId || !itemId) return;

      this.handleEquipDrop(activeDevId, itemId);
    });
  }

  handleEquipDrop(devId, itemId) {
    const dev = window.DEVELOPERS.find((developer) => developer.id === devId);
    const item = window.ITEMS.find((candidate) => candidate.id === itemId);
    if (!dev || !item) return;
    if (item.ownerId && item.ownerId !== devId) {
      this.app.showTemporaryToast("이 장비는 다른 조원의 전용 아이템입니다.");
      return;
    }

    const isEquipped = dev.equipped.includes(itemId);
    if (isEquipped) {
      dev.equipped = dev.equipped.filter((id) => id !== itemId);
      this.applyStatsBoost(dev, item, -1);
      window.audioManager.playTone(360, "square", 0.08, 0.05);
    } else {
      dev.equipped.push(itemId);
      this.applyStatsBoost(dev, item, 1);
      window.audioManager.playEquip();
    }

    this.app.saveGameState();
    this.app.updatePokedexDetail(devId);
    this.app.showTemporaryToast(isEquipped ? `${item.name} 착용을 해제했습니다.` : `${item.name} 착용 완료!`);
  }

  applyStatsBoost(dev, item, direction) {
    Object.keys(item.statsBoost || {}).forEach((stat) => {
      if (dev.stats[stat] === undefined) return;
      dev.stats[stat] = Math.max(0, dev.stats[stat] + item.statsBoost[stat] * direction);
    });
  }
}

window.DragDropManager = DragDropManager;
