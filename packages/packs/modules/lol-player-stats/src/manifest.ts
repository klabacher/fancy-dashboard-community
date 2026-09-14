import { defineModulePack } from "@fancydashboard/sdk/manifest";

export const manifest = defineModulePack({
  author: "FancyDashboard Community",
  description:
    "League of Legends profile, ranked summary, and win-rate widgets backed by Riot APIs.",
  id: "lol-player-stats",
  name: "LoL Player Stats",
  version: "1.0.0",
  apiVersion: "1.0.0",
  minHostVersion: "1.1.0",
  kind: "module",
  tier: "community",
  metadata: {
    category: "gaming",
    tags: ["league-of-legends", "gaming", "stats"],
    license: "MIT",
    repository: "https://github.com/klabacher/fancy-dashboard-community",
    screenshots: [],
  },
  entry: {
    frontend: "@fancydashboard/pack-module-lol-player-stats",
  },
  permissionsRequested: [],
  widgets: [
    {
      id: "lol-player-stats",
      name: "LoL Player Stats",
      description: "League of Legends stats and winrate.",
    },
  ],
  configSchema: {
    description: "LoL Player Stats configuration schema",
  },
  capabilitiesProvided: [],
});

export default manifest;
