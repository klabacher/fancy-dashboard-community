import { lazy } from "react";
import { Globe as GlobeIcon } from "lucide-react";

import { createModule } from "@fancydashboard/sdk/plugins/createModule";
import type { ModuleManifest } from "@fancydashboard/sdk/plugins/types";

import {
  MapCNCompactConfigSchema,
  MapCNGlobeConfigSchema,
  MapCNMap2DConfigSchema,
  defaultMapCNCompactConfig,
  defaultMapCNGlobeConfig,
  defaultMapCNMap2DConfig,
  type MapCNCompactConfig,
  type MapCNGlobeConfig,
  type MapCNMap2DConfig,
} from "./MapCN.config";

const GlobalSettings = lazy(() => import("./settings/GlobalSettings"));
const MapCNCompact = lazy(() =>
  import("./widgets/MapCNCompactWidget").then((module) => ({
    default: module.MapCNCompactWidget,
  }))
);
const MapCNMap2D = lazy(() =>
  import("./widgets/MapCNMap2DWidget").then((module) => ({
    default: module.MapCNMap2DWidget,
  }))
);
const MapCNGlobe = lazy(() =>
  import("./widgets/MapCNGlobeWidget").then((module) => ({
    default: module.MapCNGlobeWidget,
  }))
);

export default createModule({
  id: "mapcn",
  version: "2.0.0",
  metadata: {
    name: "MapCN",
    summary:
      "Multi-widget network mapper with compact telemetry and 2D/3D maps.",
    description:
      "Real-time network telemetry with compact status, neon 2D map, and rotating 3D globe.",
    author: {
      name: "FancyDashboard Team",
      email: null,
      github: null,
    },
    website: null,
    license: "MIT",
    repository: "https://github.com/klabacher/fancy-dashboard-community",
    category: "monitoring",
    tags: ["network", "telemetry", "visualization"],
    tier: "community",
  },
  icon: {
    type: "react-icon",
    component: GlobeIcon,
  },
  globalSettings: GlobalSettings,
  globalPermissions: [{ kind: "network:capture" }],
  widgets: [
    {
      id: "mapcn-compact",
      name: "MapCN Compact",
      description: "Compact network status and telemetry card.",
      component: MapCNCompact,
      settingsComponent: null,
      permissions: [{ kind: "store:read" }, { kind: "store:write" }],
      grid: {
        defaultW: 1,
        defaultH: 1,
        minW: 1,
        minH: 1,
        maxW: 2,
        maxH: 2,
        lockAspectRatio: false,
      },
      config: {
        schema: MapCNCompactConfigSchema,
        default: defaultMapCNCompactConfig satisfies MapCNCompactConfig,
      },
    },
    {
      id: "mapcn-2d",
      name: "MapCN 2D Map",
      description: "Lite 2D world map with neon connection lines.",
      component: MapCNMap2D,
      settingsComponent: null,
      permissions: [{ kind: "store:read" }, { kind: "store:write" }],
      grid: {
        defaultW: 4,
        defaultH: 3,
        minW: 3,
        minH: 2,
        maxW: 6,
        maxH: 5,
        lockAspectRatio: false,
      },
      config: {
        schema: MapCNMap2DConfigSchema,
        default: defaultMapCNMap2DConfig satisfies MapCNMap2DConfig,
      },
    },
    {
      id: "mapcn-3d",
      name: "MapCN 3D Globe",
      description: "3D globe with animated neon arcs and connection info.",
      component: MapCNGlobe,
      settingsComponent: null,
      permissions: [{ kind: "store:read" }, { kind: "store:write" }],
      grid: {
        defaultW: 4,
        defaultH: 4,
        minW: 3,
        minH: 3,
        maxW: 6,
        maxH: 6,
        lockAspectRatio: true,
      },
      config: {
        schema: MapCNGlobeConfigSchema,
        default: defaultMapCNGlobeConfig satisfies MapCNGlobeConfig,
      },
    },
  ],
} satisfies ModuleManifest);
