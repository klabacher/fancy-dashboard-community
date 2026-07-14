import { defineModulePack } from "@fancydashboard/sdk/manifest";

export const manifest = defineModulePack({
  author: 'FancyDashboard Community',
  description: 'A module for FancyDashboard',
  id: "productivity-suite",
  name: "Productivity Suite",
  version: "2.0.0",
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
    frontend: "@fancydashboard/pack-module-productivity-suite",
  },
  permissionsRequested: [],
  widgets: [
    { id: "quick-task", name: "QuickTask", description: "Small quick-add widget." },
    { id: "full-task-manager", name: "FullTaskManager", description: "Large widget for full task management." },
  ],
  configSchema: {
    description: "Productivity Suite configuration schema",
  },
  integrity: {
    sha256: "0000000000000000000000000000000000000000000000000000000000000000",
  },
  capabilitiesProvided: [],
});

export default manifest;