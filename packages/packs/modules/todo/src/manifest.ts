import { defineModulePack } from "@fancydashboard/sdk/manifest";

export const manifest = defineModulePack({
  author: "FancyDashboard Community",
  description:
    "Persistent task management with priorities, due dates, filtering, and calendar integration.",
  id: "todo",
  name: "To-Do List",
  version: "1.0.0",
  apiVersion: "1.0.0",
  minHostVersion: "1.1.0",
  kind: "module",
  tier: "community",
  metadata: {
    category: "productivity",
    tags: ["tasks", "productivity", "calendar"],
    license: "MIT",
    repository: "https://github.com/klabacher/fancy-dashboard-community",
    screenshots: [],
  },
  entry: {
    frontend: "@fancydashboard/pack-module-todo",
  },
  permissionsRequested: [{ kind: "store:read" }, { kind: "store:write" }],
  widgets: [
    {
      id: "todo",
      name: "To-Do List",
      description: "Task manager with priorities and due dates.",
    },
  ],
  configSchema: {
    description: "To-Do widget configuration schema",
  },
  capabilitiesProvided: [],
});

export default manifest;
