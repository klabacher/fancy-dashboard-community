import { defineModulePack } from "@fancydashboard/sdk/manifest";

export const manifest = defineModulePack({
  author: 'FancyDashboard Community',
  description: 'A module for FancyDashboard',
  id: "todo",
  name: "To-Do List",
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
    frontend: "@fancydashboard/pack-module-todo",
  },
  permissionsRequested: [],
  widgets: [
    { id: "todo", name: "To-Do List", description: "Task manager with priorities and due dates." },
  ],
  configSchema: {
    description: "To-Do widget configuration schema",
  },
  capabilitiesProvided: [],
});

export default manifest;