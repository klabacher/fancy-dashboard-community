import { execFileSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";

function arg(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

function git(...args) {
  return execFileSync("git", args, { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
}

const version = arg("--version");
const base = arg("--base") ?? "BOOTSTRAP";
const head = arg("--head") ?? "HEAD";
const checksumsPath = arg("--checksums");
const outputPath = arg("--output");
if (!version || !checksumsPath || !outputPath) {
  throw new Error("Usage: node scripts/generate-release-notes.mjs --version <semver> --base <tag|BOOTSTRAP> --head <sha> --checksums <file> --output <file>");
}

const range = base === "BOOTSTRAP" ? head : `${base}..${head}`;
const rawLog = git("log", "--reverse", "--format=%H%x1f%h%x1f%s%x1f%b%x1e", range);
const commits = rawLog
  .split("\x1e")
  .map((record) => record.trim())
  .filter(Boolean)
  .map((record) => {
    const [sha, shortSha, title, ...bodyParts] = record.split("\x1f");
    return { sha: sha.trim(), shortSha: shortSha.trim(), title: title.trim(), body: bodyParts.join("\x1f").trim() };
  });

const checksums = (await readFile(checksumsPath, "utf8")).trim();
const compatibility = JSON.parse(await readFile("compatibility.json", "utf8"));
const repository = process.env.GITHUB_REPOSITORY;
const headSha = git("rev-parse", head).trim();

const lines = [
  `# FancyDashboard Community v${version}`,
  "",
  `Build commit: \`${headSha}\``,
  `Core validado: **${compatibility.core.repository} ${compatibility.core.tag}**`,
  "",
  "## Downloads",
  "",
  `- **Bundle completo:** \`FancyDashboard-Community-${version}.zip\``,
  "- **Catálogo:** `catalog.json`",
  "- **Tutorial:** `INSTALLATION.md`",
  "- **Compatibilidade:** `compatibility.json`",
  "- **Integridade:** `SHA256SUMS.txt`",
  "- **Packs individuais:** assets `.zip` desta release",
  "",
  "## Instalação rápida",
  "",
  `1. Instale primeiro o FancyDashboard Core **${compatibility.core.version}**.`,
  "2. Para uso normal, instale os packs pelo Marketplace do FancyDashboard.",
  "3. Para operação de catálogo/CI, use o bundle completo ou os packs individuais junto do `catalog.json`.",
  "4. Confira sempre o SHA-256 antes de distribuir um asset.",
  "",
  "O arquivo `INSTALLATION.md` anexado contém o tutorial completo.",
  "",
  "## SHA-256 — chaves para conferência",
  "",
  "```text",
  checksums,
  "```",
  "",
  "## Commits incluídos",
  "",
];

if (!commits.length) {
  lines.push("Nenhum commit novo encontrado no intervalo informado.", "");
} else {
  for (const commit of commits) {
    const label = repository
      ? `[\`${commit.shortSha}\`](https://github.com/${repository}/commit/${commit.sha})`
      : `\`${commit.shortSha}\``;
    lines.push(`### ${label} — ${commit.title}`, "");
    lines.push(commit.body || "Sem descrição adicional no corpo do commit.", "");
  }
}

lines.push(
  "## Contrato de distribuição",
  "",
  "Os ZIPs de pack e o `catalog.json` são gerados pela mesma ferramenta determinística usada pelo core. A integridade declarada no catálogo deve corresponder exatamente ao SHA-256 do asset antes da instalação/ativação.",
  ""
);

await writeFile(outputPath, `${lines.join("\n")}\n`, "utf8");
process.stdout.write(`Community release notes generated with ${commits.length} commit(s).\n`);
