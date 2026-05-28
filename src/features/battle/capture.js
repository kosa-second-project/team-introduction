// Capture video storage and playback helpers.
Object.assign(window.App.prototype, {
  openCaptureDb() {
    return new Promise((resolve, reject) => {
      if (!("indexedDB" in window)) {
        reject(new Error("IndexedDB is not supported"));
        return;
      }

      const request = indexedDB.open(this.captureDbName, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.captureStoreName)) {
          db.createObjectStore(this.captureStoreName, { keyPath: "id" });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async loadCaptureVideos() {
    try {
      const db = await this.openCaptureDb();
      const tx = db.transaction(this.captureStoreName, "readonly");
      const store = tx.objectStore(this.captureStoreName);
      const request = store.getAll();
      request.onsuccess = () => {
        request.result.forEach(record => this.setCaptureVideoUrl(record.id, record.blob));
      };
      tx.oncomplete = () => db.close();
      tx.onerror = () => db.close();
    } catch (e) {
      console.warn("capture video load skipped:", e);
    }
  },

  async loadCaptureVideoForDev(devId) {
    if (this.captureVideoUrls[devId]) return this.captureVideoUrls[devId];

    try {
      const db = await this.openCaptureDb();
      const tx = db.transaction(this.captureStoreName, "readonly");
      const store = tx.objectStore(this.captureStoreName);
      const record = await new Promise((resolve, reject) => {
        const request = store.get(devId);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      db.close();
      if (record?.blob) return this.setCaptureVideoUrl(devId, record.blob);
    } catch (e) {
      console.warn("capture video load failed:", e);
    }

    return null;
  },

  setCaptureVideoUrl(devId, blob) {
    if (!devId || !blob) return null;
    if (this.captureVideoUrls[devId]) URL.revokeObjectURL(this.captureVideoUrls[devId]);
    const url = URL.createObjectURL(blob);
    this.captureVideoUrls[devId] = url;
    return url;
  },

  async saveCaptureVideo(devId, blob) {
    if (!devId || !blob || blob.size === 0) return;

    this.setCaptureVideoUrl(devId, blob);
    if (this.currentSelectedDevId === devId) {
      const dev = window.DEVELOPERS.find(item => item.id === devId);
      if (dev) this.updatePokedexVideo(dev);
    }

    try {
      const db = await this.openCaptureDb();
      const tx = db.transaction(this.captureStoreName, "readwrite");
      tx.objectStore(this.captureStoreName).put({
        id: devId,
        blob,
        mimeType: blob.type,
        updatedAt: Date.now()
      });
      await new Promise((resolve, reject) => {
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
      });
      db.close();
    } catch (e) {
      console.warn("capture video save failed:", e);
    }
  },

  getRecorderMimeType() {
    const candidates = [
      "video/webm;codecs=vp9",
      "video/webm;codecs=vp8",
      "video/webm"
    ];
    return candidates.find(type => window.MediaRecorder?.isTypeSupported(type)) || "";
  },

  startCaptureRecording(devId) {
    if (!window.MediaRecorder || this.captureRecorder) return;

    try {
      const canvas = document.createElement("canvas");
      canvas.width = 768;
      canvas.height = 432;
      const ctx = canvas.getContext("2d");
      const stream = canvas.captureStream(30);
      const mimeType = this.getRecorderMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

      this.captureCanvas = canvas;
      this.captureStream = stream;
      this.captureChunks = [];
      this.captureRecorder = recorder;
      this.captureRecordingDevId = devId;

      recorder.ondataavailable = event => {
        if (event.data && event.data.size > 0) this.captureChunks.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(this.captureChunks, { type: recorder.mimeType || "video/webm" });
        this.saveCaptureVideo(this.captureRecordingDevId, blob);
        this.cleanupCaptureRecording();
      };

      const draw = () => {
        this.drawCaptureFrame(ctx, canvas);
        this.captureFrameId = requestAnimationFrame(draw);
      };

      draw();
      recorder.start(250);
      this.captureTimeoutId = setTimeout(() => this.stopCaptureRecording(), 9000);
    } catch (e) {
      console.warn("capture recording could not start:", e);
      this.cleanupCaptureRecording();
    }
  },

  stopCaptureRecording() {
    if (!this.captureRecorder) return;
    if (this.captureTimeoutId) clearTimeout(this.captureTimeoutId);
    this.captureTimeoutId = null;

    try {
      if (this.captureRecorder.state !== "inactive") {
        this.captureRecorder.stop();
      }
    } catch (e) {
      console.warn("capture recording could not stop:", e);
      this.cleanupCaptureRecording();
    }
  },

  cleanupCaptureRecording() {
    if (this.captureFrameId) cancelAnimationFrame(this.captureFrameId);
    this.captureFrameId = null;
    this.captureTimeoutId = null;
    if (this.captureStream) {
      this.captureStream.getTracks().forEach(track => track.stop());
    }
    this.captureRecorder = null;
    this.captureChunks = [];
    this.captureCanvas = null;
    this.captureStream = null;
    this.captureRecordingDevId = null;
  },

  drawCaptureFrame(ctx, canvas) {
    const panel = document.getElementById("panel-battle");
    const panelRect = panel?.getBoundingClientRect();
    if (!panelRect || panelRect.width === 0 || panelRect.height === 0) return;

    const sx = canvas.width / panelRect.width;
    const sy = canvas.height / panelRect.height;
    const mapRect = rect => ({
      x: (rect.left - panelRect.left) * sx,
      y: (rect.top - panelRect.top) * sy,
      w: rect.width * sx,
      h: rect.height * sy
    });

    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const arena = panel.querySelector(".battle-arena");
    const arenaBox = mapRect(arena.getBoundingClientRect());
    const sky = ctx.createLinearGradient(0, arenaBox.y, 0, arenaBox.y + arenaBox.h);
    sky.addColorStop(0, "#cfefff");
    sky.addColorStop(0.43, "#cfefff");
    sky.addColorStop(0.48, "#fff8d8");
    sky.addColorStop(1, "#b9d976");
    ctx.fillStyle = sky;
    ctx.fillRect(arenaBox.x, arenaBox.y, arenaBox.w, arenaBox.h);
    this.drawCaptureFieldOval(ctx, arenaBox.x + arenaBox.w * 0.25, arenaBox.y + arenaBox.h * 0.78, arenaBox.w * 0.22, arenaBox.h * 0.08);
    this.drawCaptureFieldOval(ctx, arenaBox.x + arenaBox.w * 0.72, arenaBox.y + arenaBox.h * 0.36, arenaBox.w * 0.19, arenaBox.h * 0.08);

    this.drawCaptureHud(ctx, panel, ".enemy-hud", mapRect);
    this.drawCaptureHud(ctx, panel, ".player-hud", mapRect);
    this.drawCaptureSprite(ctx, "enemy-battle-canvas", mapRect);
    this.drawCaptureSprite(ctx, "player-battle-canvas", mapRect);
    this.drawCapturePokeball(ctx, mapRect);
    this.drawCaptureDialogue(ctx, panel, mapRect);
  },

  drawCaptureFieldOval(ctx, cx, cy, rx, ry) {
    ctx.fillStyle = "#7fa85a";
    ctx.strokeStyle = "rgba(39,80,32,0.6)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  },

  drawCaptureHud(ctx, panel, selector, mapRect) {
    const hud = panel.querySelector(selector);
    if (!hud) return;
    const box = mapRect(hud.getBoundingClientRect());
    const name = hud.querySelector(".hud-name")?.textContent || "";
    const level = hud.querySelector(".hud-lv")?.textContent || "";
    const hpFill = hud.querySelector(".hud-hp-fill");
    const hpPercent = hpFill ? parseFloat(hpFill.style.width || "100") : 100;

    ctx.fillStyle = "#fffdf4";
    ctx.strokeStyle = "#1f2933";
    ctx.lineWidth = 3;
    ctx.fillRect(box.x, box.y, box.w, box.h);
    ctx.strokeRect(box.x, box.y, box.w, box.h);
    ctx.fillStyle = "#1f2933";
    ctx.font = "bold 14px monospace";
    ctx.fillText(name.slice(0, 18), box.x + 12, box.y + 20);
    ctx.fillText(level, box.x + box.w - 52, box.y + 20);
    ctx.fillText("HP:", box.x + 12, box.y + 44);
    ctx.strokeRect(box.x + 48, box.y + 34, box.w - 70, 12);
    ctx.fillStyle = "#55c76a";
    ctx.fillRect(box.x + 50, box.y + 36, Math.max(0, (box.w - 74) * hpPercent / 100), 8);
  },

  drawCaptureSprite(ctx, canvasId, mapRect) {
    const sprite = document.getElementById(canvasId);
    if (!sprite || sprite.style.visibility === "hidden") return;
    const box = mapRect(sprite.getBoundingClientRect());
    ctx.drawImage(sprite, box.x, box.y, box.w, box.h);
  },

  drawCapturePokeball(ctx, mapRect) {
    const pokeball = document.getElementById("pokeball-actor");
    if (!pokeball || pokeball.classList.contains("hidden")) return;
    const box = mapRect(pokeball.getBoundingClientRect());
    const radius = Math.min(box.w, box.h) / 2;
    const cx = box.x + box.w / 2;
    const cy = box.y + box.h / 2;

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = "#f34747";
    ctx.fillRect(cx - radius, cy - radius, radius * 2, radius);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(cx - radius, cy, radius * 2, radius);
    ctx.restore();

    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - radius, cy);
    ctx.lineTo(cx + radius, cy);
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  },

  drawCaptureDialogue(ctx, panel, mapRect) {
    const dialogue = panel.querySelector(".battle-dialogue-container");
    const message = document.getElementById("battle-message")?.textContent || "";
    if (!dialogue) return;
    const box = mapRect(dialogue.getBoundingClientRect());
    ctx.fillStyle = "#fffdf4";
    ctx.strokeStyle = "#1f2933";
    ctx.lineWidth = 4;
    ctx.fillRect(box.x + 8, box.y + 10, box.w - 16, box.h - 20);
    ctx.strokeRect(box.x + 8, box.y + 10, box.w - 16, box.h - 20);
    ctx.fillStyle = "#1f2933";
    ctx.font = "bold 16px monospace";
    this.drawWrappedCaptureText(ctx, message, box.x + 28, box.y + 42, box.w - 56, 22);
  },

  drawWrappedCaptureText(ctx, text, x, y, maxWidth, lineHeight) {
    const chars = [...text];
    let line = "";
    let currentY = y;

    chars.forEach(char => {
      const testLine = line + char;
      if (ctx.measureText(testLine).width > maxWidth && line) {
        ctx.fillText(line, x, currentY);
        line = char;
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    });

    if (line) ctx.fillText(line, x, currentY);
  }
});
