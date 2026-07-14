// src/manifest.ts
import { defineModulePack } from "@fancydashboard/sdk/manifest";
var manifest = defineModulePack({
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

export {
  manifest,
  manifest_default
};
