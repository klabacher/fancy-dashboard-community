import { defineModulePack } from "@fancydashboard/sdk/manifest";

export const manifest = defineModulePack({
  author: 'FancyDashboard Community',
  description: 'A module for FancyDashboard',
  id: "lol-player-stats",
  name: "LoL Player Stats",
  version: "1.0.0",
  apiVersion: "1.0.0",
  kind: "module",
  tier: "community",
  metadata: {
    category: "gaming",
    tags: [],
    license: "MIT",
    repository: null,
    screenshots: []
  },
  entry: {
    frontend: "@fancydashboard/pack-module-lol-player-stats",
  },
  permissionsRequested: [],
  widgets: [
    { id: "lol-player-stats", name: "LoL Player Stats", description: "League of Legends stats and winrate." },
  ],
  configSchema: {
    description: "LoL Player Stats configuration schema",
  },
  capabilitiesProvided: [],
});

export default manifest;