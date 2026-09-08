import { defineModulePack } from "@fancydashboard/sdk/manifest";

export const manifest = defineModulePack({
  id: "{{pluginName}}",
  name: "{{pluginName}}",
  description: "A community module for FancyDashboard",
  author: "FancyDashboard Community",
  version: "1.0.0",
  apiVersion: "1.0.0",
  kind: "module",
  tier: "community",
  metadata: {
    category: "other",
    tags: [],
    license: "MIT",
    repository: null,
    screenshots: [],
  },
  entry: {
    frontend: "@fancydashboard/pack-module-{{pluginName}}",
  },
  permissionsRequested: [],
  widgets: [
    {
      id: "{{pluginName}}",
      name: "{{pluginName}} Widget",
      description: "Default widget for {{pluginName}}",
    },
  ],
  configSchema: {
    description: "{{pluginName}} widget configuration schema",
  },
  capabilitiesProvided: [],
});

export default manifest;
