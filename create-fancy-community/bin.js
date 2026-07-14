#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const args = process.argv.slice(2);
const pluginName = args[0];

if (!pluginName) {
    console.error('Please specify a plugin name: pnpm create fancy-community <plugin-name>');
    process.exit(1);
}

// In this monorepo, we create it directly in packages/packs/modules
const targetDir = path.resolve(__dirname, '../../packages/packs/modules', pluginName);

if (fs.existsSync(targetDir)) {
    console.error(`Directory ${targetDir} already exists.`);
    process.exit(1);
}

console.log(`Creating new FancyDashboard community plugin: ${pluginName}`);

const templateDir = path.join(__dirname, 'template');

function copyTemplate(src, dest) {
    if (fs.statSync(src).isDirectory()) {
        fs.mkdirSync(dest, { recursive: true });
        for (const file of fs.readdirSync(src)) {
            copyTemplate(path.join(src, file), path.join(dest, file));
        }
    } else {
        let content = fs.readFileSync(src, 'utf8');
        content = content.replace(/{{pluginName}}/g, pluginName);
        fs.writeFileSync(dest, content);
    }
}

copyTemplate(templateDir, targetDir);

console.log('Plugin scaffolded successfully!');
console.log(`cd ../../packages/packs/modules/${pluginName} and run pnpm dev to start developing.`);
