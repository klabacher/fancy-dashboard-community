import {
  manifest
} from "./chunk-R7C4NLWA.js";
import {
  ClockConfigSchema,
  DEFAULT_CLOCK_CONFIG
} from "./chunk-6IVBUAE5.js";
import "./chunk-R5U7XKVJ.js";

// src/module/index.ts
import { lazy } from "react";
import { Clock as ClockIcon } from "lucide-react";
import { createModule } from "@fancydashboard/sdk/plugins/createModule";
var GlobalSettings = lazy(() => import("./GlobalSettings-CEN6K6VT.js"));
var ClockWidget = lazy(() => import("./Clock-QL7CBU2Q.js"));
var WeatherClockWidget = lazy(() => import("./WeatherClock-UU6AINUP.js"));
var module_default = createModule({
  id: "clock",
  version: "1.0.0",
  metadata: {
    name: "Clock",
    summary: "Modern clock widgets with multiple visual styles.",
    description: "A clock module featuring digital, analog, and binary styles, plus an optional weather+clock combo. Configurable typography, colors, and 12/24h formats.",
    author: {
      name: "FancyDashboard Team",
      email: null,
      github: null
    },
    website: null,
    license: "MIT",
    repository: null,
    category: "productivity",
    tags: [],
    tier: "community"
  },
  icon: {
    type: "react-icon",
    component: ClockIcon
  },
  globalSettings: GlobalSettings,
  globalPermissions: [],
  widgets: [
    {
      id: "clock-digital",
      name: "Clock (Digital Minimalist)",
      description: "Clean minimalist digital clock.",
      component: ClockWidget,
      settingsComponent: null,
      permissions: [],
      grid: {
        defaultW: 2,
        defaultH: 1,
        minW: 1,
        minH: 1,
        maxW: 4,
        maxH: 2,
        lockAspectRatio: false
      },
      config: {
        schema: ClockConfigSchema,
        default: {
          ...DEFAULT_CLOCK_CONFIG,
          style: "digital-minimalist"
        }
      }
    },
    {
      id: "clock-neon",
      name: "Clock (Neon)",
      description: "Cyberpunk-style neon digital clock with glow effects.",
      component: ClockWidget,
      settingsComponent: null,
      permissions: [],
      grid: {
        defaultW: 2,
        defaultH: 1,
        minW: 2,
        minH: 1,
        maxW: 4,
        maxH: 2,
        lockAspectRatio: false
      },
      config: {
        schema: ClockConfigSchema,
        default: {
          ...DEFAULT_CLOCK_CONFIG,
          style: "digital-neon",
          colors: {
            ...DEFAULT_CLOCK_CONFIG.colors,
            accent: "#00ff00",
            background: "#000000",
            backgroundOpacity: 80
          }
        }
      }
    },
    {
      id: "clock-analog-classic",
      name: "Clock (Analog Classic)",
      description: "Traditional analog clock with classic design.",
      component: ClockWidget,
      settingsComponent: null,
      permissions: [],
      grid: {
        defaultW: 2,
        defaultH: 2,
        minW: 1,
        minH: 1,
        maxW: 4,
        maxH: 4,
        lockAspectRatio: true
      },
      config: {
        schema: ClockConfigSchema,
        default: {
          ...DEFAULT_CLOCK_CONFIG,
          style: "analog-classic"
        }
      }
    },
    {
      id: "clock-analog-modern",
      name: "Clock (Analog Modern)",
      description: "Modern minimalist analog clock.",
      component: ClockWidget,
      settingsComponent: null,
      permissions: [],
      grid: {
        defaultW: 2,
        defaultH: 2,
        minW: 1,
        minH: 1,
        maxW: 4,
        maxH: 4,
        lockAspectRatio: true
      },
      config: {
        schema: ClockConfigSchema,
        default: {
          ...DEFAULT_CLOCK_CONFIG,
          style: "analog-modern",
          colors: {
            ...DEFAULT_CLOCK_CONFIG.colors,
            background: "#000000",
            backgroundOpacity: 0
          }
        }
      }
    },
    {
      id: "clock-binary",
      name: "Clock (Binary)",
      description: "Geek-style binary clock.",
      component: ClockWidget,
      settingsComponent: null,
      permissions: [],
      grid: {
        defaultW: 2,
        defaultH: 2,
        minW: 2,
        minH: 2,
        maxW: 3,
        maxH: 3,
        lockAspectRatio: false
      },
      config: {
        schema: ClockConfigSchema,
        default: {
          ...DEFAULT_CLOCK_CONFIG,
          style: "binary",
          colors: {
            ...DEFAULT_CLOCK_CONFIG.colors,
            accent: "#00ff00",
            backgroundOpacity: 80
          }
        }
      }
    },
    {
      id: "clock-weather",
      name: "Clock + Weather",
      description: "Combined clock and weather display.",
      component: WeatherClockWidget,
      settingsComponent: null,
      permissions: [
        { kind: "net:fetch", allow: ["https://api.open-meteo.com"] }
      ],
      grid: {
        defaultW: 2,
        defaultH: 2,
        minW: 2,
        minH: 2,
        maxW: 4,
        maxH: 3,
        lockAspectRatio: false
      },
      config: {
        schema: ClockConfigSchema,
        default: {
          ...DEFAULT_CLOCK_CONFIG,
          style: "weather-clock"
        }
      }
    }
  ]
});
export {
  module_default as default,
  manifest
};
