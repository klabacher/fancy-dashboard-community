import { execFileSync } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";

const SEMVER = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;
const PACK_ID = /^[a-z0-9](?:[a-z0-9_-]{1,62}[a-z0-9])?$/;

function fail(message) {
  throw new Error(message);
}

function git(...args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

async function readJson(file) {
  return JSON.parse(await fs.readFile(file, "utf8"));
}

async function listPackDirs(root) {
  const result = [];
  for (const group of ["modules", "plugins"]) {
    const groupDir = path.join(root, "packages", "packs", group);
    let entries = [];
    try {
      entries = await fs.readdir(groupDir, { withFileTypes: true });
    } catch (error) {
      if (error?.code === "ENOENT") continue;
      throw error;
    }
    for (const entry of entries) {
      if (entry.isDirectory()) result.push(path.join(groupDir, entry.name));
    }
  }
  return result.sort();
}

const root = process.cwd();
const pkg = await readJson(path.join(root, "package.json"));
const compatibility = await readJson(path.join(root, "compatibility.json"));

if (!SEMVER.test(String(pkg.version ?? ""))) fail(`Invalid community SemVer: ${pkg.version}`);
if (compatibility.schemaVersion !== 1) fail("Unsupported compatibility schemaVersion");
if (compatibility.communityVersion !== pkg.version) {
  fail(`package.json version ${pkg.version} does not match compatibility.json communityVersion ${compatibility.communityVersion}`);
}
if (!SEMVER.test(String(compatibility.core?.version ?? ""))) fail("Invalid core version in compatibility.json");
if (compatibility.core?.tag !== `v${compatibility.core.version}`) {
  fail(`Core tag must be v<core.version>; received ${compatibility.core?.tag}`);
}
if (compatibility.core?.repository !== "klabacher/FancyDashboard") fail("Unexpected core repository");
if (compatibility.toolchain?.node !== "24" || compatibility.toolchain?.pnpm !== "9.12.3") {
  fail("Community toolchain must stay aligned with core release toolchain (Node 24 / pnpm 9.12.3)");
}
if (pkg.packageManager !== "pnpm@9.12.3") fail(`Root packageManager must be pnpm@9.12.3, received ${pkg.packageManager}`);

const trackedGenerated = git("ls-files")
  .split(/\r?\n/)
  .filter(Boolean)
  .filter((file) => /(^|\/)(node_modules|dist)(\/|$)/.test(file));
if (trackedGenerated.length > 0) {
  fail(`Generated artifacts must not be tracked:\n${trackedGenerated.join("\n")}`);
}

const packDirs = await listPackDirs(root);
if (packDirs.length === 0) fail("No community packs found");
const seenNames = new Set();
for (const packDir of packDirs) {
  const packJsonPath = path.join(packDir, "package.json");
  const manifestPath = path.join(packDir, "src", "manifest.ts");
  const pack = await readJson(packJsonPath);
  if (!pack.name || typeof pack.name !== "string") fail(`Missing package name in ${packJsonPath}`);
  if (seenNames.has(pack.name)) fail(`Duplicate package name: ${pack.name}`);
  seenNames.add(pack.name);
  if (!SEMVER.test(String(pack.version ?? ""))) fail(`Invalid pack version in ${packJsonPath}`);
  if (!pack.scripts?.build) fail(`Pack is missing build script: ${packJsonPath}`);
  const manifest = await fs.readFile(manifestPath, "utf8");
  if (/0{64}/.test(manifest)) fail(`Placeholder zero integrity is forbidden: ${manifestPath}`);
  const idMatches = [...manifest.matchAll(/\bid\s*:\s*["'`]([^"'`]+)["'`]/g)];
  if (idMatches.length > 0 && !PACK_ID.test(idMatches[0][1])) {
    fail(`Unsafe manifest id ${idMatches[0][1]} in ${manifestPath}`);
  }
}

process.stdout.write(`Community release metadata verified: v${pkg.version}, ${packDirs.length} pack(s), core ${compatibility.core.tag}.\n`);
