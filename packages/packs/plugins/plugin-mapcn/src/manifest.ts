import { defineModulePack } from "@fancydashboard/sdk/manifest";

export const manifest = defineModulePack({
  author: "FancyDashboard Community",
  description: "Network activity visualization widgets with explicit packet-capture consent.",
  id: "mapcn",
  name: "MapCN",
  version: "2.0.0",
  apiVersion: "1.0.0",
  minHostVersion: "1.0.0",
  kind: "module",
  tier: "community",
  metadata: {
    category: "monitoring",
    tags: ["network", "telemetry", "visualization"],
    license: "MIT",
    repository: "https://github.com/klabacher/fancy-dashboard-community",
    screenshots: []
  },
  entry: {
    frontend: "@fancydashboard/pack-plugin-mapcn"
  },
  permissionsRequested: [{ kind: "network:capture" }],
  widgets: [
    {
      id: "mapcn-compact",
      name: "MapCN Compact",
      description: "Compact network status and telemetry card."
    },
    {
      id: "mapcn-2d",
      name: "MapCN 2D Map",
      description: "Lite 2D world map with live connection lines."
    },
    {
      id: "mapcn-3d",
      name: "MapCN 3D Globe",
      description: "3D globe with live network connection arcs."
    }
  ],
  capabilitiesProvided: [],
  configSchema: {
    description: "MapCN configuration schema"
  }
});

export default manifest;
