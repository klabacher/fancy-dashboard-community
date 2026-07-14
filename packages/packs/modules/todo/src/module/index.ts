import { lazy } from "react";
import { ListTodo as ListTodoIcon } from "lucide-react";

import { createModule } from "@fancydashboard/sdk/plugins/createModule";
import type { ModuleManifest } from "@fancydashboard/sdk/plugins/types";
import { TodoConfigSchema, type TodoConfig } from "./Todo.config";

const GlobalSettings = lazy(() => import("./settings/GlobalSettings"));
const TodoWidget = lazy(() => import("./widgets/Todo"));

export default createModule({
  id: "todo",
  version: "1.0.0",
  metadata: {
    name: "To-Do List",
    summary: "A persistent task manager with priorities and due dates.",
    description:
      "A task manager widget with priorities, start/due dates, and a detailed task view. Persists via Tauri backend when available, with a local fallback for web/dev environments.",
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
    component: ListTodoIcon,
  },
  globalSettings: GlobalSettings,
  globalPermissions: [],
  widgets: [
    {
      id: "todo",
      name: "To-Do List",
      description: "Task manager with priorities and due dates.",
      component: TodoWidget,
      settingsComponent: null,
      permissions: [{ kind: "store:read" }, { kind: "store:write" }],
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
        schema: TodoConfigSchema,
        default: {} satisfies TodoConfig,
      },
    },
  ],
} satisfies ModuleManifest);
