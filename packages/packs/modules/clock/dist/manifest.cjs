"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/manifest.ts
var manifest_exports = {};
__export(manifest_exports, {
  default: () => manifest_default,
  manifest: () => manifest
});
module.exports = __toCommonJS(manifest_exports);
var import_manifest = require("@fancydashboard/sdk/manifest");
var manifest = (0, import_manifest.defineModulePack)({
  author: "FancyDashboard Community",
  description: "A module for FancyDashboard",
  id: "clock",
  name: "Clock",
  version: "1.0.0",
  apiVersion: "1.0.0",
  kind: "module",
  tier: "community",
  metadata: {
    category: "productivity",
    tags: [],
    license: "MIT",
    repository: null,
    screenshots: []
  },
  entry: {
    frontend: "@fancydashboard/pack-module-clock"
  },
  permissionsRequested: [],
  widgets: [
    { id: "clock-digital", name: "Clock (Digital Minimalist)", description: "Clean minimalist digital clock." },
    { id: "clock-neon", name: "Clock (Neon)", description: "Cyberpunk-style neon digital clock." },
    { id: "clock-analog-classic", name: "Clock (Analog Classic)", description: "Traditional analog clock." },
    { id: "clock-analog-modern", name: "Clock (Analog Modern)", description: "Modern minimalist analog clock." },
    { id: "clock-binary", name: "Clock (Binary)", description: "Geek-style binary clock." },
    { id: "clock-weather", name: "Clock + Weather", description: "Combined clock and weather display." }
  ],
  configSchema: {
    description: "Clock widget configuration schema"
  },
  integrity: {
    sha256: "0000000000000000000000000000000000000000000000000000000000000000"
  },
  capabilitiesProvided: []
});
var manifest_default = manifest;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  manifest
});
