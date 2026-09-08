import { defineModulePack } from "@fancydashboard/sdk/manifest";

export const manifest = defineModulePack({
  author: 'FancyDashboard Community',
  description: 'A module for FancyDashboard',
  id: "pc-monitor",
  name: "PC Monitor",
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
    frontend: "@fancydashboard/pack-module-pc-monitor",
  },
  permissionsRequested: [],
  widgets: [
    { id: "pc-monitor", name: "PC Monitor", description: "Combined CPU/GPU/RAM monitor widget." },
    { id: "cpu-widget", name: "CPU", description: "Standalone CPU monitor." },
    { id: "ram-widget", name: "RAM", description: "Standalone memory monitor." },
    { id: "gpu-widget", name: "GPU", description: "Standalone GPU monitor." },
    { id: "temp-widget", name: "Temperatures", description: "Temperature probes and summary." },
    { id: "system-dashboard", name: "System Dashboard", description: "Customizable internal dashboard." },
  ],
  configSchema: {
    description: "PC Monitor configuration schema",
  },
  capabilitiesProvided: [],
});

export default manifest;