import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

const FIXED_DOS_DATE = 0x0021;
const FIXED_DOS_TIME = 0x0000;
const MAX_ZIP32 = 0xffffffff;

function arg(name, fallback) {
  const index = process.argv.indexOf(name);
  return index === -1 ? fallback : process.argv[index + 1];
}

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

async function listFiles(root, current = root) {
  const entries = await fs.readdir(current, { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const absolute = path.join(current, entry.name);
    if (entry.isDirectory()) files.push(...(await listFiles(root, absolute)));
    else if (entry.isFile()) files.push(path.relative(root, absolute).split(path.sep).join("/"));
    else throw new Error(`Unsupported release entry: ${absolute}`);
  }
  return files;
}

function localHeader(name, data, checksum) {
  const nameBytes = Buffer.from(name);
  const header = Buffer.alloc(30);
  header.writeUInt32LE(0x04034b50, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(0, 6);
  header.writeUInt16LE(0, 8);
  header.writeUInt16LE(FIXED_DOS_TIME, 10);
  header.writeUInt16LE(FIXED_DOS_DATE, 12);
  header.writeUInt32LE(checksum, 14);
  header.writeUInt32LE(data.length, 18);
  header.writeUInt32LE(data.length, 22);
  header.writeUInt16LE(nameBytes.length, 26);
  header.writeUInt16LE(0, 28);
  return Buffer.concat([header, nameBytes, data]);
}

function centralHeader(name, data, checksum, offset) {
  const nameBytes = Buffer.from(name);
  const header = Buffer.alloc(46);
  header.writeUInt32LE(0x02014b50, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(20, 6);
  header.writeUInt16LE(0, 8);
  header.writeUInt16LE(0, 10);
  header.writeUInt16LE(FIXED_DOS_TIME, 12);
  header.writeUInt16LE(FIXED_DOS_DATE, 14);
  header.writeUInt32LE(checksum, 16);
  header.writeUInt32LE(data.length, 20);
  header.writeUInt32LE(data.length, 24);
  header.writeUInt16LE(nameBytes.length, 28);
  header.writeUInt16LE(0, 30);
  header.writeUInt16LE(0, 32);
  header.writeUInt16LE(0, 34);
  header.writeUInt16LE(0, 36);
  header.writeUInt32LE(0, 38);
  header.writeUInt32LE(offset, 42);
  return Buffer.concat([header, nameBytes]);
}

function eocd(count, centralSize, centralOffset) {
  const footer = Buffer.alloc(22);
  footer.writeUInt32LE(0x06054b50, 0);
  footer.writeUInt16LE(0, 4);
  footer.writeUInt16LE(0, 6);
  footer.writeUInt16LE(count, 8);
  footer.writeUInt16LE(count, 10);
  footer.writeUInt32LE(centralSize, 12);
  footer.writeUInt32LE(centralOffset, 16);
  footer.writeUInt16LE(0, 20);
  return footer;
}

async function deterministicZip(root) {
  const names = await listFiles(root);
  if (!names.length) throw new Error("Community release stage is empty");
  if (names.length > 0xffff) throw new Error("ZIP32 entry limit exceeded");
  const locals = [];
  const centrals = [];
  let offset = 0;
  for (const name of names) {
    const data = await fs.readFile(path.join(root, ...name.split("/")));
    if (data.length > MAX_ZIP32) throw new Error(`File too large for ZIP32: ${name}`);
    const checksum = crc32(data);
    const local = localHeader(name, data, checksum);
    locals.push(local);
    centrals.push(centralHeader(name, data, checksum, offset));
    offset += local.length;
  }
  const central = Buffer.concat(centrals);
  if (offset + central.length > MAX_ZIP32) throw new Error("ZIP32 archive limit exceeded");
  return Buffer.concat([...locals, central, eocd(names.length, central.length, offset)]);
}

async function copyFile(source, destination) {
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.copyFile(source, destination);
}

async function checksumLines(root, names) {
  const lines = [];
  for (const name of [...names].sort()) {
    const data = await fs.readFile(path.join(root, ...name.split("/")));
    lines.push(`${sha256(data)}  ${name}`);
  }
  return `${lines.join("\n")}\n`;
}

const input = path.resolve(arg("--input", "release/community"));
const output = path.resolve(arg("--output", "release/publish"));
const version = arg("--version");
if (!version) throw new Error("--version is required");

const catalogPath = path.join(input, "catalog.json");
const artifactInput = path.join(input, "artifacts");
const catalog = JSON.parse(await fs.readFile(catalogPath, "utf8"));
if (!Array.isArray(catalog) || catalog.length === 0) throw new Error("Community catalog is empty");

for (const entry of catalog) {
  if (!/^[a-f0-9]{64}$/.test(entry.integrity) || /^0{64}$/.test(entry.integrity)) {
    throw new Error(`Invalid integrity for ${entry.id}`);
  }
  if (!entry.artifact || path.basename(entry.artifact) !== entry.artifact) {
    throw new Error(`Unsafe artifact name for ${entry.id}`);
  }
  const data = await fs.readFile(path.join(artifactInput, entry.artifact));
  const actual = sha256(data);
  if (actual !== entry.integrity) {
    throw new Error(`Artifact integrity mismatch for ${entry.id}: expected ${entry.integrity}, got ${actual}`);
  }
}

await fs.rm(output, { recursive: true, force: true });
await fs.mkdir(output, { recursive: true });
const stage = path.join(output, ".stage");
await fs.mkdir(path.join(stage, "artifacts"), { recursive: true });
await copyFile(catalogPath, path.join(stage, "catalog.json"));
await copyFile("compatibility.json", path.join(stage, "compatibility.json"));
await copyFile("docs/INSTALLATION.md", path.join(stage, "INSTALLATION.md"));
for (const entry of catalog) {
  await copyFile(path.join(artifactInput, entry.artifact), path.join(stage, "artifacts", entry.artifact));
}

const payloadNames = await listFiles(stage);
await fs.writeFile(
  path.join(stage, "PAYLOAD-SHA256SUMS.txt"),
  await checksumLines(stage, payloadNames),
  "utf8"
);

const bundleName = `FancyDashboard-Community-${version}.zip`;
const bundle = await deterministicZip(stage);
await fs.writeFile(path.join(output, bundleName), bundle);
await copyFile(path.join(stage, "catalog.json"), path.join(output, "catalog.json"));
await copyFile(path.join(stage, "compatibility.json"), path.join(output, "compatibility.json"));
await copyFile(path.join(stage, "INSTALLATION.md"), path.join(output, "INSTALLATION.md"));
await fs.mkdir(path.join(output, "artifacts"), { recursive: true });
for (const entry of catalog) {
  await copyFile(path.join(stage, "artifacts", entry.artifact), path.join(output, "artifacts", entry.artifact));
}

const releaseNames = [
  bundleName,
  "catalog.json",
  "compatibility.json",
  "INSTALLATION.md",
  ...catalog.map((entry) => `artifacts/${entry.artifact}`),
];
await fs.writeFile(path.join(output, "SHA256SUMS.txt"), await checksumLines(output, releaseNames), "utf8");
await fs.rm(stage, { recursive: true, force: true });
process.stdout.write(`Prepared deterministic Community v${version} release with ${catalog.length} pack(s).\n`);
