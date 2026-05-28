import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const sandbox = { window: {} };
vm.runInNewContext(readFileSync("src/core/pokeball-config.js", "utf8"), sandbox, { filename: "src/core/pokeball-config.js" });

assert.equal(sandbox.window.POKEBALL_THROW_CONFIG.renderSize, 44);
assert.equal(sandbox.window.POKEBALL_THROW_CONFIG.radius, 22);
assert.equal(sandbox.window.POKEBALL_CHOICES.length, 26);
assert.equal(sandbox.window.POKEBALL_CHOICES[0], "몬스터볼");
