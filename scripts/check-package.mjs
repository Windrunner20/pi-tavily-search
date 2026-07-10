import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, rmSync } from "node:fs";

const packageJson = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
assert.equal(packageJson.version, "1.0.0");
assert.ok(packageJson.keywords.includes("pi-package"));
assert.deepEqual(packageJson.pi.extensions, ["./extensions/index.ts"]);

const output = execFileSync("npm", ["pack", "--json", "--ignore-scripts"], {
  cwd: new URL("..", import.meta.url),
  encoding: "utf8",
});
const [packed] = JSON.parse(output);
const files = new Set(packed.files.map((file) => file.path));
for (const required of [
  "package.json",
  "extensions/index.ts",
  "src/extension.ts",
  "README.md",
  "CHANGELOG.md",
  "CONTRIBUTING.md",
  "SECURITY.md",
  "LICENSE",
]) {
  assert.ok(files.has(required), `package is missing ${required}`);
}
for (const forbidden of ["test/extension.test.ts", ".github/workflows/ci.yml"]) {
  assert.ok(!files.has(forbidden), `package unexpectedly includes ${forbidden}`);
}
rmSync(new URL(`../${packed.filename}`, import.meta.url));
console.log(`Package check passed: ${packed.filename}, ${packed.size} bytes`);
