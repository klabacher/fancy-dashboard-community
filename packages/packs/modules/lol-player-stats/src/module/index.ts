import { lazy } from "react";
import { Trophy } from "lucide-react";

import { createModule } from "@fancydashboard/sdk/plugins/createModule";
import type { ModuleManifest } from "@fancydashboard/sdk/plugins/types";

import {
  DEFAULT_LOL_PLAYER_STATS_CONFIG,
  LolPlayerStatsConfigSchema,
  type LolPlayerStatsConfig,
} from "./LolPlayerStats.config";

const GlobalSettings = lazy(() => import("./settings/GlobalSettings"));
const LolPlayerStatsWidget = lazy(() => import("./LolPlayerStatsWidget"));

export default createModule({
  id: "lol-player-stats",
  version: "1.0.0",
  metadata: {
    name: "LoL Player Stats",
    summary: "League of Legends ranked stats and winrate.",
    description:
      "Real-time League of Legends player stats: Summoner identity, ranked summary, and winrate.",
    author: {
      name: "FancyDashboard Team",
      email: null,
      github: null,
    },
    website: null,
    license: "MIT",
    repository: null,
    category: "gaming",
    tags: [],
    tier: "community",
  },
  icon: {
    type: "react-icon",
    component: Trophy,
  },
  globalSettings: GlobalSettings,
  globalPermissions: [],
  widgets: [
    {
      id: "lol-player-stats",
      name: "LoL Player Stats",
      description:
        "Real-time League of Legends player stats - Summoner identity, ranked summary, and winrate.",
      component: LolPlayerStatsWidget,
      settingsComponent: null,
      permissions: [
        { kind: "store:read" },
        { kind: "store:write" },
        { kind: "net:fetch", allow: ["https://*.api.riotgames.com"] },
      ],
      grid: {
        defaultW: 2,
        defaultH: 3,
        minW: 2,
        minH: 2,
        maxW: 4,
        maxH: 4,
        lockAspectRatio: false,
      },
      config: {
        schema: LolPlayerStatsConfigSchema,
        default: DEFAULT_LOL_PLAYER_STATS_CONFIG satisfies LolPlayerStatsConfig,
      },
    },
  ],
} satisfies ModuleManifest);
