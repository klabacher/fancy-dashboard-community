import { defineModulePack } from "@fancydashboard/sdk/manifest";

export const manifest = defineModulePack({
  author: "FancyDashboard Community",
  description:
    "Responsive local app launcher for shortcuts, custom icons, and compact grids.",
  id: "launcher",
  name: "Launcher",
  version: "1.1.0",
  apiVersion: "1.0.0",
  minHostVersion: "1.1.0",
  kind: "module",
  tier: "community",
  metadata: {
    category: "productivity",
    tags: ["launcher", "apps", "shortcuts"],
    license: "MIT",
    repository: "https://github.com/klabacher/fancy-dashboard-community",
    screenshots: [],
  },
  entry: {
    frontend: "@fancydashboard/pack-module-launcher",
  },
  permissionsRequested: [
    { kind: "fs:scope", allow: ["*"] },
    { kind: "shell:exec", allow: ["*"] },
    { kind: "net:fetch", allow: ["http://*", "https://*"] },
  ],
  widgets: [
    {
      id: "launcher-widget",
      name: "App Launcher",
      description: "Launcher grid with add/edit modals.",
    },
    {
      id: "launcher-icon",
      name: "App Icon",
      description: "Single app launcher icon.",
    },
    {
      id: "launcher-grid-2x2",
      name: "App Launcher 2×2",
      description: "4-slot app launcher grid.",
    },
    {
      id: "launcher-grid-3x3",
      name: "App Launcher 3×3",
      description: "9-slot app launcher grid.",
    },
  ],
  configSchema: {
    description: "Launcher widget configuration schema",
  },
  capabilitiesProvided: [],
});

export default manifest;
