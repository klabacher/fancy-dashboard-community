import { lazy } from "react";
import { Rocket as RocketIcon } from "lucide-react";

import { createModule } from "@fancydashboard/sdk/plugins/createModule";
import type { ModuleManifest } from "@fancydashboard/sdk/plugins/types";

import {
  LauncherWidgetConfigSchema,
  defaultLauncherWidgetConfig,
  SingleIconConfigSchema,
  defaultSingleIconConfig,
  LauncherGrid2x2ConfigSchema,
  defaultLauncherGrid2x2Config,
  LauncherGrid3x3ConfigSchema,
  defaultLauncherGrid3x3Config,
  type LauncherWidgetConfig,
  type SingleIconConfig,
  type LauncherGrid2x2Config,
  type LauncherGrid3x3Config,
} from "./Launcher.config";

const GlobalSettings = lazy(() => import("./settings/GlobalSettings"));

const LauncherWidget = lazy(() => import("./LauncherWidget"));
const SingleIcon = lazy(() => import("./widgets/SingleIcon"));
const LauncherGrid = lazy(() => import("./widgets/LauncherGrid"));

export default createModule({
  id: "launcher",
  version: "1.1.0",
  metadata: {
    name: "Launcher",
    summary: "Launch apps via .lnk shortcuts, custom targets, or URLs.",
    description:
      "Launch applications from Windows .lnk shortcuts, custom targets, or URLs. Includes auto icon extraction (exe/.lnk icon + website favicon) with custom override + reset/revert controls.",
    author: {
      name: "FancyDashboard Team",
      email: null,
      github: null,
    },
    website: null,
    license: "MIT",
    repository: null,
    category: "productivity",
    tags: [],
    tier: "community",
  },
  icon: {
    type: "react-icon",
    component: RocketIcon,
  },
  globalSettings: GlobalSettings,
  globalPermissions: [],
  widgets: [
    {
      id: "launcher-widget",
      name: "App Launcher",
      description: "Launcher grid with add/edit modals.",
      component: LauncherWidget,
      settingsComponent: null,
      permissions: [],
      grid: {
        defaultW: 2,
        defaultH: 2,
        minW: 1,
        minH: 1,
        maxW: 4,
        maxH: 4,
        lockAspectRatio: false,
      },
      config: {
        schema: LauncherWidgetConfigSchema,
        default: defaultLauncherWidgetConfig satisfies LauncherWidgetConfig,
      },
    },
    {
      id: "launcher-icon",
      name: "App Icon",
      description: "Single app launcher icon (1x1).",
      component: SingleIcon,
      settingsComponent: null,
      permissions: [],
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
        schema: SingleIconConfigSchema,
        default: defaultSingleIconConfig satisfies SingleIconConfig,
      },
    },
    {
      id: "launcher-grid-2x2",
      name: "App Launcher 2×2",
      description: "4-slot app launcher grid (right-click to add).",
      component: LauncherGrid,
      settingsComponent: null,
      permissions: [],
      grid: {
        defaultW: 2,
        defaultH: 2,
        minW: 2,
        minH: 2,
        maxW: 2,
        maxH: 2,
        lockAspectRatio: true,
      },
      config: {
        schema: LauncherGrid2x2ConfigSchema,
        default: defaultLauncherGrid2x2Config satisfies LauncherGrid2x2Config,
      },
    },
    {
      id: "launcher-grid-3x3",
      name: "App Launcher 3×3",
      description: "9-slot app launcher grid (right-click to add).",
      component: LauncherGrid,
      settingsComponent: null,
      permissions: [],
      grid: {
        defaultW: 3,
        defaultH: 3,
        minW: 2,
        minH: 2,
        maxW: 4,
        maxH: 4,
        lockAspectRatio: false,
      },
      config: {
        schema: LauncherGrid3x3ConfigSchema,
        default: defaultLauncherGrid3x3Config satisfies LauncherGrid3x3Config,
      },
    },
  ],
} satisfies ModuleManifest);
