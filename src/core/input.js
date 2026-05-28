class WorldInputState {
  constructor() {
    this.movementKeys = new Set([
      "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
      "w", "a", "s", "d",
      "W", "A", "S", "D",
    ]);
  }

  isMovementKey(key) {
    return this.movementKeys.has(key);
  }

  setMovementKey(keysPressed, key, isPressed) {
    if (!this.isMovementKey(key)) return false;
    keysPressed[key] = isPressed;
    return true;
  }

  clearMovementKeys(keysPressed) {
    this.movementKeys.forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(keysPressed, key)) {
        keysPressed[key] = false;
      }
    });
  }

  clearEngine(engine) {
    if (!engine) return;
    this.clearMovementKeys(engine.keysPressed);
  }
}

window.WorldInputState = WorldInputState;
