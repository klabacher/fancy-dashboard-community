import { lazy } from "react";
import { CheckSquare } from "lucide-react";

import { createModule } from "@fancydashboard/sdk/plugins/createModule";
import type { ModuleManifest } from "@fancydashboard/sdk/plugins/types";
import {
  QuickTaskConfigSchema,
  type QuickTaskConfig,
} from "./widgets/QuickTask.config";
import {
  FullTaskManagerConfigSchema,
  type FullTaskManagerConfig,
} from "./widgets/FullTaskManager.config";

const GlobalSettings = lazy(() => import("./settings/GlobalSettings"));
const QuickTaskWidget = lazy(() => import("./widgets/QuickTask"));
const FullTaskManagerWidget = lazy(() => import("./widgets/FullTaskManager"));

export default createModule({
  id: "productivity-suite",
  version: "2.0.0",
  metadata: {
    name: "Productivity Suite",
    summary: "Task widgets for quick capture and management.",
    description:
      "Responsive local task capture and management widgets sharing a durable module store.",
    author: {
      name: "FancyTeam",
      email: "dev@fancy.app",
      github: "FancyTeam",
    },
    website: "https://fancy.app/modules/productivity",
    license: "MIT",
    repository: null,
    category: "productivity",
    tags: ["tasks", "productivity", "local"],
    tier: "community",
  },
  icon: {
    type: "react-icon",
    component: CheckSquare,
  },
  globalSettings: GlobalSettings,
  globalPermissions: [],
  widgets: [
    {
      id: "quick-task",
      name: "QuickTask",
      description: "Small quick-add widget synchronized with the full task manager.",
      component: QuickTaskWidget,
      settingsComponent: null,
      permissions: [],
      grid: {
        minW: 1,
        minH: 1,
        defaultW: 2,
        defaultH: 1,
        maxW: 4,
        maxH: 2,
        lockAspectRatio: false,
      },
      config: {
        schema: QuickTaskConfigSchema,
        default: {
          placeholder: "What needs to be done?",
        } satisfies QuickTaskConfig,
      },
    },
    {
      id: "full-task-manager",
      name: "FullTaskManager",
      description: "Responsive local task manager with filters and shared quick capture.",
      component: FullTaskManagerWidget,
      settingsComponent: null,
      permissions: [],
      grid: {
        minW: 2,
        minH: 2,
        defaultW: 4,
        defaultH: 4,
        maxW: 8,
        maxH: 8,
        lockAspectRatio: false,
      },
      config: {
        schema: FullTaskManagerConfigSchema,
        default: { title: "Task Manager" } satisfies FullTaskManagerConfig,
      },
    },
  ],
} satisfies ModuleManifest);
