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
  id: "mapcn",
  name: "MapCN",
  version: "1.0.0",
  apiVersion: "1.0.0",
  kind: "module",
  tier: "community",
  metadata: {
    category: "monitoring",
    tags: [],
    license: "MIT",
    repository: null,
    screenshots: []
  },
  entry: {
    frontend: "@fancydashboard/pack-plugin-mapcn"
  },
  permissionsRequested: [],
  widgets: [
    {
      id: "mapcn",
      name: "MapCN",
      description: "Network activity visualization widgets."
    }
  ],
  capabilitiesProvided: [],
  configSchema: {
    description: "MapCN configuration schema"
  },
  integrity: {
    sha256: "0000000000000000000000000000000000000000000000000000000000000000"
  }
});
var manifest_default = manifest;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  manifest
});
