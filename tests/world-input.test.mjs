import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const sandbox = { window: {} };
vm.runInNewContext(readFileSync("src/core/input.js", "utf8"), sandbox, { filename: "src/core/input.js" });

const input = new sandbox.window.WorldInputState();
const keysPressed = {};

input.setMovementKey(keysPressed, "ArrowRight", true);
input.setMovementKey(keysPressed, "a", true);
input.setMovementKey(keysPressed, "Enter", true);

assert.equal(keysPressed.ArrowRight, true);
assert.equal(keysPressed.a, true);
assert.equal(keysPressed.Enter, undefined);
assert.equal(input.isMovementKey("W"), true);
assert.equal(input.isMovementKey("Enter"), false);

input.clearMovementKeys(keysPressed);
assert.equal(keysPressed.ArrowRight, false);
assert.equal(keysPressed.a, false);
assert.equal(keysPressed.Enter, undefined);
