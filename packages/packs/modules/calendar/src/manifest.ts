import { defineModulePack } from "@fancydashboard/sdk/manifest";

export const manifest = defineModulePack({
  author: 'FancyDashboard Community',
  description: 'A module for FancyDashboard',
  id: "calendar",
  name: "Calendar",
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
    frontend: "@fancydashboard/pack-module-calendar",
  },
  permissionsRequested: [],
  widgets: [
    {
      id: "calendar",
      name: "Calendar",
      description: "Standard calendar with customization.",
    },
    {
      id: "calendar-compact",
      name: "Calendar (Today)",
      description: "Compact today view.",
    },
    {
      id: "calendar-tasks",
      name: "Calendar (Today + Tasks)",
      description: "Compact today and tasks view.",
    },
    {
      id: "calendar-expanded",
      name: "Calendar (Expanded)",
      description: "Expanded calendar with inline tasks.",
    },
  ],
  configSchema: {
    description: "Calendar widget configuration schema",
  },
  integrity: {
    sha256: "0000000000000000000000000000000000000000000000000000000000000000",
  },
  capabilitiesProvided: [],
});

export default manifest;
