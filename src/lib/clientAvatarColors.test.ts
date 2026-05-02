import test from "node:test";
import assert from "node:assert/strict";
import { clientAvatarTint } from "./clientAvatarColors";

test("clientAvatarTint is stable for the same id", () => {
  const a = clientAvatarTint("client-uuid-1");
  const b = clientAvatarTint("client-uuid-1");
  assert.equal(a.backgroundColor, b.backgroundColor);
  assert.equal(a.color, b.color);
});

test("clientAvatarTint can differ for different ids", () => {
  const seen = new Set<string>();
  for (let i = 0; i < 40; i += 1) {
    const t = clientAvatarTint(`id-${i}`);
    seen.add(t.backgroundColor);
  }
  assert.ok(seen.size > 1);
});
