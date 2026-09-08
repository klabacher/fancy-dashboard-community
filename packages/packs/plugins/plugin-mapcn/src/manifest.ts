import { defineModulePack } from "@fancydashboard/sdk/manifest";

export const manifest = defineModulePack({
  author: 'FancyDashboard Community',
  description: 'A module for FancyDashboard',
  id: "mapcn",
  name: "MapCN",
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
    frontend: "@fancydashboard/pack-plugin-mapcn"
  },
  permissionsRequested: [],
  widgets: [
    {
      id: "mapcn",
      name: "MapCN",
      description: "Network activity visualization widgets."
    }
  ],
  capabilitiesProvided: [],
  configSchema: {
    description: "MapCN configuration schema"
  }
});

export default manifest;
