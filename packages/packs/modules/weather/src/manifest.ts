import { defineModulePack } from "@fancydashboard/sdk/manifest";

export const manifest = defineModulePack({
  author: "FancyDashboard Community",
  description: "Five responsive weather views powered by Open-Meteo.",
  id: "weather",
  name: "Weather",
  version: "1.0.0",
  apiVersion: "1.0.0",
  minHostVersion: "1.1.0",
  kind: "module",
  tier: "community",
  metadata: {
    category: "utilities",
    tags: ["weather", "forecast", "open-meteo"],
    license: "MIT",
    repository: "https://github.com/klabacher/fancy-dashboard-community",
    screenshots: [],
  },
  entry: {
    frontend: "@fancydashboard/pack-module-weather",
  },
  permissionsRequested: [
    { kind: "net:fetch", allow: ["https://api.open-meteo.com"] },
  ],
  widgets: [
    {
      id: "weather-compact",
      name: "Weather (Compact)",
      description: "Compact weather display with temperature.",
    },
    {
      id: "weather-wide",
      name: "Weather (Wide)",
      description: "Wide weather display with details.",
    },
    {
      id: "weather",
      name: "Weather",
      description: "Standard weather display with animated graphics.",
    },
    {
      id: "weather-large",
      name: "Weather (Large)",
      description: "Large immersive weather display.",
    },
    {
      id: "weather-immersive",
      name: "Weather (Immersive)",
      description: "Full-screen immersive weather experience.",
    },
  ],
  configSchema: {
    description: "Weather widget configuration schema",
  },
  capabilitiesProvided: [],
});

export default manifest;
