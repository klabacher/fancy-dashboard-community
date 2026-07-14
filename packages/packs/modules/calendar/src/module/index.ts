import { lazy } from "react";
import { CalendarDays } from "lucide-react";

import { createModule } from "@fancydashboard/sdk/plugins/createModule";
import type { ModuleManifest } from "@fancydashboard/sdk/plugins/types";

import {
  CalendarConfigSchema,
  DEFAULT_CALENDAR_CONFIG,
  type CalendarConfig,
} from "./types";

const GlobalSettings = lazy(() => import("./settings/GlobalSettings"));
const CalendarWidget = lazy(() => import("./widgets/Calendar"));

export default createModule({
  id: "calendar",
  version: "1.0.0",
  metadata: {
    name: "Calendar",
    summary: "Premium calendar widget with todo integration.",
    description:
      "A responsive calendar with compact/standard/expanded layouts, extensive customization, and todo integration.",
    author: {
      name: "FancyDashboard",
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
    component: CalendarDays,
  },
  globalSettings: GlobalSettings,
  globalPermissions: [],
  widgets: [
    {
      id: "calendar",
      name: "Calendar",
      description: "Standard calendar (2x2) with customization.",
      component: CalendarWidget,
      settingsComponent: null,
      permissions: [{ kind: "store:read" }],
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
        schema: CalendarConfigSchema,
        default: {
          ...DEFAULT_CALENDAR_CONFIG,
          layout: "standard",
        } satisfies CalendarConfig,
      },
    },
    {
      id: "calendar-compact",
      name: "Calendar (Today)",
      description: "Compact calendar showing today only.",
      component: CalendarWidget,
      settingsComponent: null,
      permissions: [{ kind: "store:read" }],
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
        schema: CalendarConfigSchema,
        default: {
          ...DEFAULT_CALENDAR_CONFIG,
          layout: "compact-1x1",
        } satisfies CalendarConfig,
      },
    },
    {
      id: "calendar-tasks",
      name: "Calendar (Today + Tasks)",
      description: "Compact calendar with today's tasks.",
      component: CalendarWidget,
      settingsComponent: null,
      permissions: [{ kind: "store:read" }],
      grid: {
        defaultW: 1,
        defaultH: 2,
        minW: 1,
        minH: 2,
        maxW: 1,
        maxH: 3,
        lockAspectRatio: false,
      },
      config: {
        schema: CalendarConfigSchema,
        default: {
          ...DEFAULT_CALENDAR_CONFIG,
          layout: "compact-1x2",
        } satisfies CalendarConfig,
      },
    },
    {
      id: "calendar-expanded",
      name: "Calendar (Expanded)",
      description: "Full calendar with inline tasks.",
      component: CalendarWidget,
      settingsComponent: null,
      permissions: [{ kind: "store:read" }],
      grid: {
        defaultW: 4,
        defaultH: 4,
        minW: 3,
        minH: 3,
        maxW: 6,
        maxH: 6,
        lockAspectRatio: false,
      },
      config: {
        schema: CalendarConfigSchema,
        default: {
          ...DEFAULT_CALENDAR_CONFIG,
          layout: "expanded",
        } satisfies CalendarConfig,
      },
    },
  ],
} satisfies ModuleManifest);
