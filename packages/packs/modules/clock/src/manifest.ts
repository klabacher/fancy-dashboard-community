import { defineModulePack } from "@fancydashboard/sdk/manifest";

export const manifest = defineModulePack({
  author: "FancyDashboard Community",
  description:
    "Six responsive clock styles, including an optional Open-Meteo weather view.",
  id: "clock",
  name: "Clock",
  version: "1.0.0",
  apiVersion: "1.0.0",
  minHostVersion: "1.1.0",
  kind: "module",
  tier: "community",
  metadata: {
    category: "productivity",
    tags: ["clock", "time", "weather"],
    license: "MIT",
    repository: "https://github.com/klabacher/fancy-dashboard-community",
    screenshots: [],
  },
  entry: {
    frontend: "@fancydashboard/pack-module-clock",
  },
  permissionsRequested: [
    { kind: "net:fetch", allow: ["https://api.open-meteo.com"] },
  ],
  widgets: [
    {
      id: "clock-digital",
      name: "Clock (Digital Minimalist)",
      description: "Clean minimalist digital clock.",
    },
    {
      id: "clock-neon",
      name: "Clock (Neon)",
      description: "Cyberpunk-style neon digital clock.",
    },
    {
      id: "clock-analog-classic",
      name: "Clock (Analog Classic)",
      description: "Traditional analog clock.",
    },
    {
      id: "clock-analog-modern",
      name: "Clock (Analog Modern)",
      description: "Modern minimalist analog clock.",
    },
    {
      id: "clock-binary",
      name: "Clock (Binary)",
      description: "Geek-style binary clock.",
    },
    {
      id: "clock-weather",
      name: "Clock + Weather",
      description: "Combined clock and weather display.",
    },
  ],
  configSchema: {
    description: "Clock widget configuration schema",
  },
  capabilitiesProvided: [],
});

export default manifest;
