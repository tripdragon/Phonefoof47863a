import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageJsonPath = path.resolve(__dirname, "../package.json");

const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
const [major, minor, patch] = packageJson.version.split(".").map(Number);

if ([major, minor, patch].some((part) => Number.isNaN(part))) {
  throw new Error(`[version-bump] Invalid semver version in package.json: '${packageJson.version}'.`);
}

const nextVersion = `${major}.${minor}.${patch + 1}`;
packageJson.version = nextVersion;

writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`, "utf8");
console.log(`[version-bump] Bumped version to ${nextVersion} before build.`);
