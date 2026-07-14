import {
  manifest
} from "./chunk-FP7MISO3.js";
import {
  QuickTaskConfigSchema
} from "./chunk-PRKKB4Q7.js";
import {
  FullTaskManagerConfigSchema
} from "./chunk-O72EZ5K4.js";
import "./chunk-3WGEXLPO.js";
import "./chunk-MLKGABMK.js";

// src/module/index.ts
import { lazy } from "react";
import { CheckSquare } from "lucide-react";
import { createModule } from "@fancydashboard/sdk/plugins/createModule";
var GlobalSettings = lazy(() => import("./GlobalSettings-LZ2TTZUZ.js"));
var QuickTaskWidget = lazy(() => import("./QuickTask-DMF4TAAG.js"));
var FullTaskManagerWidget = lazy(() => import("./FullTaskManager-ETATZKRZ.js"));
var module_default = createModule({
  id: "productivity-suite",
  version: "2.0.0",
  metadata: {
    name: "Productivity Suite",
    summary: "Task widgets for quick capture and management.",
    description: "Demonstration module for the V2 Module Architecture with strict typing and explicit permissions.",
    author: {
      name: "FancyTeam",
      email: "dev@fancy.app",
      github: "FancyTeam"
    },
    website: "https://fancy.app/modules/productivity",
    license: "MIT",
    repository: null,
    category: "productivity",
    tags: [],
    tier: "community"
  },
  icon: {
    type: "react-icon",
    component: CheckSquare
  },
  globalSettings: GlobalSettings,
  globalPermissions: [
    { kind: "net:fetch", allow: ["https://api.todoist.com"] }
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
        lockAspectRatio: true
      },
      config: {
        schema: QuickTaskConfigSchema,
        default: {
          placeholder: "What needs to be done?"
        }
      }
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
        lockAspectRatio: false
      },
      config: {
        schema: FullTaskManagerConfigSchema,
        default: { title: "Task Manager" }
      }
    }
  ]
});
export {
  module_default as default,
  manifest
};
