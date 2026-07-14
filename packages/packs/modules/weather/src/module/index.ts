import { lazy } from "react";
import { CloudSun } from "lucide-react";

import { createModule } from "@fancydashboard/sdk/plugins/createModule";
import type { ModuleManifest } from "@fancydashboard/sdk/plugins/types";

import {
  DEFAULT_WEATHER_CONFIG,
  WeatherConfigSchema,
  type WeatherConfig,
} from "./types";

const GlobalSettings = lazy(() => import("./settings/GlobalSettings"));
const WeatherWidget = lazy(() => import("./WeatherWidget"));

const OPEN_METEO_ORIGIN = "https://api.open-meteo.com";

export default createModule({
  id: "weather",
  version: "1.0.0",
  metadata: {
    name: "Weather",
    summary: "Animated weather widget powered by Open-Meteo.",
    description:
      "Fancy animated weather display with SVG effects and Open-Meteo integration. Includes multiple size/layout variants.",
    author: {
      name: "FancyDashboard",
      email: null,
      github: null,
    },
    website: null,
    license: "MIT",
    repository: null,
    category: "utilities",
    tags: [],
    tier: "community",
  },
  icon: {
    type: "react-icon",
    component: CloudSun,
  },
  globalSettings: GlobalSettings,
  globalPermissions: [],
  widgets: [
    {
      id: "weather-compact",
      name: "Weather (Compact)",
      description: "Compact weather display with temperature.",
      component: WeatherWidget,
      settingsComponent: null,
      permissions: [{ kind: "net:fetch", allow: [OPEN_METEO_ORIGIN] }],
      grid: {
        defaultW: 1,
        defaultH: 1,
        minW: 1,
        minH: 1,
        maxW: 1,
        maxH: 1,
        lockAspectRatio: true,
      },
      config: {
        schema: WeatherConfigSchema,
        default: {
          ...DEFAULT_WEATHER_CONFIG,
          size: "1x1",
        } satisfies WeatherConfig,
      },
    },
    {
      id: "weather-wide",
      name: "Weather (Wide)",
      description: "Wide weather display with details.",
      component: WeatherWidget,
      settingsComponent: null,
      permissions: [{ kind: "net:fetch", allow: [OPEN_METEO_ORIGIN] }],
      grid: {
        defaultW: 2,
        defaultH: 1,
        minW: 2,
        minH: 1,
        maxW: 2,
        maxH: 1,
        lockAspectRatio: false,
      },
      config: {
        schema: WeatherConfigSchema,
        default: {
          ...DEFAULT_WEATHER_CONFIG,
          size: "2x1",
        } satisfies WeatherConfig,
      },
    },
    {
      id: "weather",
      name: "Weather",
      description: "Standard weather display with animated graphics.",
      component: WeatherWidget,
      settingsComponent: null,
      permissions: [{ kind: "net:fetch", allow: [OPEN_METEO_ORIGIN] }],
      grid: {
        defaultW: 2,
        defaultH: 2,
        minW: 2,
        minH: 2,
        maxW: 6,
        maxH: 6,
        lockAspectRatio: false,
      },
      config: {
        schema: WeatherConfigSchema,
        default: {
          ...DEFAULT_WEATHER_CONFIG,
          size: "2x2",
        } satisfies WeatherConfig,
      },
    },
    {
      id: "weather-large",
      name: "Weather (Large)",
      description: "Large immersive weather display.",
      component: WeatherWidget,
      settingsComponent: null,
      permissions: [{ kind: "net:fetch", allow: [OPEN_METEO_ORIGIN] }],
      grid: {
        defaultW: 3,
        defaultH: 3,
        minW: 3,
        minH: 3,
        maxW: 3,
        maxH: 3,
        lockAspectRatio: true,
      },
      config: {
        schema: WeatherConfigSchema,
        default: {
          ...DEFAULT_WEATHER_CONFIG,
          size: "3x3",
        } satisfies WeatherConfig,
      },
    },
    {
      id: "weather-immersive",
      name: "Weather (Immersive)",
      description: "Full-screen immersive weather experience.",
      component: WeatherWidget,
      settingsComponent: null,
      permissions: [{ kind: "net:fetch", allow: [OPEN_METEO_ORIGIN] }],
      grid: {
        defaultW: 4,
        defaultH: 4,
        minW: 4,
        minH: 4,
        maxW: 6,
        maxH: 6,
        lockAspectRatio: false,
      },
      config: {
        schema: WeatherConfigSchema,
        default: {
          ...DEFAULT_WEATHER_CONFIG,
          size: "4x4",
        } satisfies WeatherConfig,
      },
    },
  ],
} satisfies ModuleManifest);
