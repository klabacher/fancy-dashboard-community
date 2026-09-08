#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
const pluginName = args[0];
const PACK_ID = /^[a-z0-9](?:[a-z0-9_-]*[a-z0-9])$/;

if (!pluginName) {
  console.error("Please specify a pack id: pnpm create fancy-community <pack-id>");
  process.exit(1);
}

if (pluginName.length > 64 || !PACK_ID.test(pluginName)) {
  console.error(
    "Invalid pack id. Use 3-64 lowercase ASCII letters, digits, '-' or '_', starting and ending with an alphanumeric character."
  );
  process.exit(1);
}

const modulesRoot = path.resolve(__dirname, "../../packages/packs/modules");
const targetDir = path.join(modulesRoot, pluginName);

if (path.dirname(targetDir) !== modulesRoot) {
  console.error("Refusing to create a pack outside the community modules directory.");
  process.exit(1);
}

if (fs.existsSync(targetDir)) {
  console.error(`Directory ${targetDir} already exists.`);
  process.exit(1);
}

console.log(`Creating new FancyDashboard community pack: ${pluginName}`);

const templateDir = path.join(__dirname, "template");

function copyTemplate(src, dest) {
  if (fs.statSync(src).isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const file of fs.readdirSync(src)) {
      copyTemplate(path.join(src, file), path.join(dest, file));
    }
    return;
  }

  const content = fs
    .readFileSync(src, "utf8")
    .replace(/{{pluginName}}/g, pluginName);
  fs.writeFileSync(dest, content);
}

copyTemplate(templateDir, targetDir);

console.log("Pack scaffolded successfully.");
console.log(`cd packages/packs/modules/${pluginName} && pnpm build`);
