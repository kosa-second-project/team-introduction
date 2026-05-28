// Item inventory and custom item drawing behavior.
Object.assign(window.App.prototype, {
  renderItemInventory() {
    const itemBox = document.getElementById("items-drag-box");
    if (!itemBox) return;

    window.PokedexUi.renderItemInventory({
      container: itemBox,
      items: window.ITEMS,
      equippedItemIds: this.developerState.getEquippedItemIds(this.currentSelectedDevId),
    });
  },

  formatStatsBoost(statsBoost = {}) {
    return window.PokedexUi.formatStatsBoost(statsBoost);
  },

  initCustomItemMaker() {
    const canvas = document.getElementById("item-draw-canvas");
    const palette = document.getElementById("item-color-palette");
    const clearButton = document.getElementById("btn-clear-item-canvas");
    const createButton = document.getElementById("btn-create-custom-item");
    if (!canvas || !palette || !clearButton || !createButton) return;

    palette.innerHTML = "";
    this.itemPalette.forEach(color => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "item-color-swatch";
      button.style.background = color;
      button.setAttribute("aria-label", `${color} 색상`);
      if (color === this.itemDrawColor) button.classList.add("active");
      button.addEventListener("click", () => {
        this.itemDrawColor = color;
        palette.querySelectorAll(".item-color-swatch").forEach(swatch => swatch.classList.remove("active"));
        button.classList.add("active");
      });
      palette.appendChild(button);
    });

    const eraser = document.createElement("button");
    eraser.type = "button";
    eraser.className = "item-color-swatch eraser";
    eraser.textContent = "×";
    eraser.setAttribute("aria-label", "지우개");
    eraser.addEventListener("click", () => {
      this.itemDrawColor = "";
      palette.querySelectorAll(".item-color-swatch").forEach(swatch => swatch.classList.remove("active"));
      eraser.classList.add("active");
    });
    palette.appendChild(eraser);

    const drawFromEvent = (event) => {
      const point = event.touches ? event.touches[0] : event;
      const rect = canvas.getBoundingClientRect();
      const x = Math.floor(((point.clientX - rect.left) / rect.width) * 16);
      const y = Math.floor(((point.clientY - rect.top) / rect.height) * 16);
      this.paintItemPixel(x, y);
    };

    let drawing = false;
    canvas.addEventListener("mousedown", (event) => {
      drawing = true;
      drawFromEvent(event);
    });
    canvas.addEventListener("mousemove", (event) => {
      if (drawing) drawFromEvent(event);
    });
    document.addEventListener("mouseup", () => {
      drawing = false;
    });
    canvas.addEventListener("touchstart", (event) => {
      event.preventDefault();
      drawing = true;
      drawFromEvent(event);
    }, { passive: false });
    canvas.addEventListener("touchmove", (event) => {
      event.preventDefault();
      if (drawing) drawFromEvent(event);
    }, { passive: false });
    document.addEventListener("touchend", () => {
      drawing = false;
    });

    clearButton.addEventListener("click", () => {
      this.itemPixels = Array(16 * 16).fill("");
      this.renderItemDrawingCanvas();
    });
    createButton.addEventListener("click", () => this.createCustomItemFromDrawing());

    this.renderItemDrawingCanvas();
  },

  paintItemPixel(x, y) {
    if (x < 0 || x >= 16 || y < 0 || y >= 16) return;
    this.itemPixels[y * 16 + x] = this.itemDrawColor;
    this.renderItemDrawingCanvas();
  },

  renderItemDrawingCanvas() {
    const canvas = document.getElementById("item-draw-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const cell = canvas.width / 16;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#f8f8d8";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < 16; y += 1) {
      for (let x = 0; x < 16; x += 1) {
        const color = this.itemPixels[y * 16 + x];
        if (color) {
          ctx.fillStyle = color;
          ctx.fillRect(x * cell, y * cell, cell, cell);
        }
      }
    }

    ctx.strokeStyle = "rgba(0,0,0,0.16)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 16; i += 1) {
      ctx.beginPath();
      ctx.moveTo(i * cell + 0.5, 0);
      ctx.lineTo(i * cell + 0.5, canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * cell + 0.5);
      ctx.lineTo(canvas.width, i * cell + 0.5);
      ctx.stroke();
    }
  },

  exportCustomItemImage() {
    const canvas = document.createElement("canvas");
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext("2d");

    this.itemPixels.forEach((color, index) => {
      if (!color) return;
      ctx.fillStyle = color;
      ctx.fillRect(index % 16, Math.floor(index / 16), 1, 1);
    });

    return canvas.toDataURL("image/png");
  },

  createCustomItemFromDrawing() {
    if (!this.itemPixels.some(Boolean)) {
      this.showTemporaryToast("먼저 캔버스에 아이템을 그려 주세요.");
      return;
    }

    const nameInput = document.getElementById("custom-item-name");
    const statSelect = document.getElementById("custom-item-stat");
    const boostSelect = document.getElementById("custom-item-boost");
    const stat = statSelect?.value || "coding";
    const boost = Number(boostSelect?.value || 10);
    const name = nameInput?.value.trim() || `그린 아이템 ${this.customItems.length + 1}`;
    const item = {
      id: `custom_${Date.now()}`,
      name,
      description: "직접 그려 만든 커스텀 장비입니다.",
      imageData: this.exportCustomItemImage(),
      statsBoost: { [stat]: boost },
      isCustom: true
    };

    this.registerCustomItems([item]);
    this.saveCustomItems();
    this.saveGameState();
    this.renderItemInventory();

    if (nameInput) nameInput.value = "";
    this.itemPixels = Array(16 * 16).fill("");
    this.renderItemDrawingCanvas();
    this.showTemporaryToast(`${name} 아이템을 보관함에 추가했습니다.`);
  }
});
