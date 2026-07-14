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
      "Demonstration module for the V2 Module Architecture with strict typing and explicit permissions.",
    author: {
      name: "FancyTeam",
      email: "dev@fancy.app",
      github: "FancyTeam",
    },
    website: "https://fancy.app/modules/productivity",
    license: "MIT",
    repository: null,
    category: "productivity",
    tags: [],
    tier: "community",
  },
  icon: {
    type: "react-icon",
    component: CheckSquare,
  },
  globalSettings: GlobalSettings,
  globalPermissions: [
    { kind: "net:fetch", allow: ["https://api.todoist.com"] },
  ],
  widgets: [
    {
      id: "quick-task",
      name: "QuickTask",
      description: "Small quick-add widget.",
      component: QuickTaskWidget,
      settingsComponent: null,
      permissions: [{ kind: "notification:send" }],
      grid: {
        minW: 2,
        minH: 1,
        defaultW: 2,
        defaultH: 1,
        maxW: 2,
        maxH: 1,
        lockAspectRatio: true,
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
      description: "Large widget for full task management.",
      component: FullTaskManagerWidget,
      settingsComponent: null,
      permissions: [{ kind: "fs:scope", allow: ["$APP_DATA/backups/*"] }],
      grid: {
        minW: 4,
        minH: 4,
        defaultW: 4,
        defaultH: 4,
        maxW: 6,
        maxH: 6,
        lockAspectRatio: false,
      },
      config: {
        schema: FullTaskManagerConfigSchema,
        default: { title: "Task Manager" } satisfies FullTaskManagerConfig,
      },
    },
  ],
} satisfies ModuleManifest);
