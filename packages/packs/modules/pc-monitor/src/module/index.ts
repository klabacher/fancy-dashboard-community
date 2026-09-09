import { lazy } from "react";
import { Activity as ActivityIcon } from "lucide-react";

import { createModule } from "@fancydashboard/sdk/plugins/createModule";
import type { ModuleManifest } from "@fancydashboard/sdk/plugins/types";

import {
  PCMonitorConfigSchema,
  defaultPCMonitorConfig,
  CPUWidgetConfigSchema,
  defaultCPUWidgetConfig,
  RAMWidgetConfigSchema,
  defaultRAMWidgetConfig,
  GPUWidgetConfigSchema,
  defaultGPUWidgetConfig,
  TempWidgetConfigSchema,
  defaultTempWidgetConfig,
  SystemDashboardConfigSchema,
  defaultSystemDashboardConfig,
  type PCMonitorConfig,
  type CPUWidgetConfig,
  type RAMWidgetConfig,
  type GPUWidgetConfig,
  type TempWidgetConfig,
  type SystemDashboardConfig,
} from "./PCMonitor.config";

const GlobalSettings = lazy(() => import("./settings/GlobalSettings"));

const PCMonitor = lazy(() => import("./PCMonitor"));
const CPU = lazy(() => import("./widgets/CPU"));
const RAM = lazy(() => import("./widgets/RAM"));
const GPU = lazy(() => import("./widgets/GPU"));
const Temp = lazy(() => import("./widgets/Temp"));
const SystemDashboard = lazy(() => import("./widgets/SystemDashboard"));

export default createModule({
  id: "pc-monitor",
  version: "1.0.0",
  metadata: {
    name: "PC Monitor",
    summary: "Real-time PC hardware monitoring (CPU/GPU/RAM/temps).",
    description:
      "Real-time PC hardware monitoring with multiple widget variants and a customizable system dashboard.",
    author: {
      name: "FancyDashboard Team",
      email: null,
      github: null,
    },
    website: null,
    license: "MIT",
    repository: null,
    category: "monitoring",
    tags: [],
    tier: "community",
  },
  icon: {
    type: "react-icon",
    component: ActivityIcon,
  },
  globalSettings: GlobalSettings,
  globalPermissions: [
    { kind: "system:specs" },
    { kind: "system:telemetry" },
  ],
  widgets: [
    {
      id: "pc-monitor",
      name: "PC Monitor",
      description: "Combined CPU/GPU/RAM monitor widget.",
      component: PCMonitor,
      settingsComponent: null,
      permissions: [{ kind: "store:read" }],
      grid: {
        defaultW: 2,
        defaultH: 2,
        minW: 2,
        minH: 2,
        maxW: 4,
        maxH: 4,
        lockAspectRatio: false,
      },
      config: {
        schema: PCMonitorConfigSchema,
        default: defaultPCMonitorConfig satisfies PCMonitorConfig,
      },
    },
    {
      id: "cpu-widget",
      name: "CPU",
      description: "Standalone CPU monitor.",
      component: CPU,
      settingsComponent: null,
      permissions: [{ kind: "store:read" }],
      grid: {
        defaultW: 2,
        defaultH: 1,
        minW: 1,
        minH: 1,
        maxW: 4,
        maxH: 2,
        lockAspectRatio: false,
      },
      config: {
        schema: CPUWidgetConfigSchema,
        default: defaultCPUWidgetConfig satisfies CPUWidgetConfig,
      },
    },
    {
      id: "ram-widget",
      name: "RAM",
      description: "Standalone memory monitor.",
      component: RAM,
      settingsComponent: null,
      permissions: [{ kind: "store:read" }],
      grid: {
        defaultW: 2,
        defaultH: 1,
        minW: 1,
        minH: 1,
        maxW: 4,
        maxH: 2,
        lockAspectRatio: false,
      },
      config: {
        schema: RAMWidgetConfigSchema,
        default: defaultRAMWidgetConfig satisfies RAMWidgetConfig,
      },
    },
    {
      id: "gpu-widget",
      name: "GPU",
      description: "Standalone GPU monitor.",
      component: GPU,
      settingsComponent: null,
      permissions: [{ kind: "store:read" }],
      grid: {
        defaultW: 2,
        defaultH: 1,
        minW: 1,
        minH: 1,
        maxW: 4,
        maxH: 2,
        lockAspectRatio: false,
      },
      config: {
        schema: GPUWidgetConfigSchema,
        default: defaultGPUWidgetConfig satisfies GPUWidgetConfig,
      },
    },
    {
      id: "temp-widget",
      name: "Temperatures",
      description: "Temperature probes and summary.",
      component: Temp,
      settingsComponent: null,
      permissions: [{ kind: "store:read" }],
      grid: {
        defaultW: 2,
        defaultH: 1,
        minW: 1,
        minH: 1,
        maxW: 4,
        maxH: 2,
        lockAspectRatio: false,
      },
      config: {
        schema: TempWidgetConfigSchema,
        default: defaultTempWidgetConfig satisfies TempWidgetConfig,
      },
    },
    {
      id: "system-dashboard",
      name: "System Dashboard",
      description: "Customizable internal dashboard with drag-and-drop.",
      component: SystemDashboard,
      settingsComponent: null,
      permissions: [{ kind: "store:read" }, { kind: "store:write" }],
      grid: {
        defaultW: 4,
        defaultH: 3,
        minW: 3,
        minH: 2,
        maxW: 6,
        maxH: 4,
        lockAspectRatio: false,
      },
      config: {
        schema: SystemDashboardConfigSchema,
        default: defaultSystemDashboardConfig satisfies SystemDashboardConfig,
      },
    },
  ],
} satisfies ModuleManifest);
