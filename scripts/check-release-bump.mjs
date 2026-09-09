import { execFileSync } from "node:child_process";
import { appendFileSync, readFileSync } from "node:fs";

const SEMVER = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;

function parse(value) {
  const match = SEMVER.exec(value);
  if (!match) throw new Error(`Invalid SemVer: ${value}`);
  return {
    raw: value,
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    prerelease: match[4]?.split(".") ?? [],
  };
}

function compareIdentifier(left, right) {
  const ln = /^\d+$/.test(left);
  const rn = /^\d+$/.test(right);
  if (ln && rn) return Number(left) - Number(right);
  if (ln) return -1;
  if (rn) return 1;
  return left.localeCompare(right);
}

function compare(leftValue, rightValue) {
  const left = parse(leftValue);
  const right = parse(rightValue);
  for (const key of ["major", "minor", "patch"]) {
    if (left[key] !== right[key]) return Math.sign(left[key] - right[key]);
  }
  if (!left.prerelease.length && !right.prerelease.length) return 0;
  if (!left.prerelease.length) return 1;
  if (!right.prerelease.length) return -1;
  const max = Math.max(left.prerelease.length, right.prerelease.length);
  for (let index = 0; index < max; index += 1) {
    if (left.prerelease[index] === undefined) return -1;
    if (right.prerelease[index] === undefined) return 1;
    const result = compareIdentifier(left.prerelease[index], right.prerelease[index]);
    if (result !== 0) return Math.sign(result);
  }
  return 0;
}

function git(...args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

function setOutputs(values) {
  const lines = Object.entries(values)
    .map(([key, value]) => `${key}=${value}`)
    .join("\n") + "\n";
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, lines);
  else process.stdout.write(lines);
}

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const compatibility = JSON.parse(readFileSync("compatibility.json", "utf8"));
const current = String(pkg.version ?? "");
parse(current);

if (compatibility.communityVersion !== current) {
  throw new Error("Community version differs between package.json and compatibility.json");
}

const tags = git("tag", "--list", "v*")
  .split(/\r?\n/)
  .filter(Boolean)
  .map((tag) => ({ tag, version: tag.slice(1) }))
  .filter(({ version }) => SEMVER.test(version))
  .sort((a, b) => compare(b.version, a.version));

const exactTag = tags.find(({ version }) => version === current);
if (exactTag) {
  setOutputs({
    release: "false",
    version: current,
    previous_version: current,
    base: exactTag.tag,
    core_tag: compatibility.core.tag,
  });
  process.stdout.write(`Community v${current} is already tagged; no release is required.\n`);
  process.exit(0);
}

const latest = tags[0];
if (latest && compare(current, latest.version) < 0) {
  throw new Error(`Community version downgrade is not releasable: ${latest.version} -> ${current}`);
}
if (latest && compare(current, latest.version) === 0) {
  throw new Error(`Version v${current} is not tagged but is not newer than latest release ${latest.tag}`);
}

const base = latest?.tag ?? "BOOTSTRAP";
setOutputs({
  release: "true",
  version: current,
  previous_version: latest?.version ?? "none",
  base,
  core_tag: compatibility.core.tag,
});
process.stdout.write(
  latest
    ? `Community release bump detected: ${latest.version} -> ${current}\n`
    : `No previous Community release exists; v${current} is the bootstrap release.\n`
);
