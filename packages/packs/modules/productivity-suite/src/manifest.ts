import { defineModulePack } from "@fancydashboard/sdk/manifest";

export const manifest = defineModulePack({
  author: "FancyDashboard Community",
  description:
    "Local quick capture and full task management widgets that stay synchronized.",
  id: "productivity-suite",
  name: "Productivity Suite",
  version: "2.0.0",
  apiVersion: "1.0.0",
  minHostVersion: "1.1.0",
  kind: "module",
  tier: "community",
  metadata: {
    category: "productivity",
    tags: ["tasks", "productivity", "local"],
    license: "MIT",
    repository: "https://github.com/klabacher/fancy-dashboard-community",
    screenshots: [],
  },
  entry: {
    frontend: "@fancydashboard/pack-module-productivity-suite",
  },
  permissionsRequested: [],
  widgets: [
    {
      id: "quick-task",
      name: "QuickTask",
      description: "Small quick-add widget.",
    },
    {
      id: "full-task-manager",
      name: "FullTaskManager",
      description: "Large widget for full task management.",
    },
  ],
  configSchema: {
    description: "Productivity Suite configuration schema",
  },
  capabilitiesProvided: [],
});

export default manifest;
