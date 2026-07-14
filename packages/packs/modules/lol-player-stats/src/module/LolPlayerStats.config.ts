import { z } from "zod";

export const LolPlayerStatsConfigSchema = z.object({
  region: z
    .enum([
      "BR1",
      "EUN1",
      "EUW1",
      "JP1",
      "KR",
      "LA1",
      "LA2",
      "NA1",
      "OC1",
      "PH2",
      "RU",
      "SG2",
      "TH2",
      "TR1",
      "TW2",
      "VN2",
    ])
    .default("NA1"),
  gameName: z.string().default(""),
  tagLine: z.string().default(""),
  showRankedFlex: z.boolean().default(false),
  autoRefreshMinutes: z.number().min(1).max(60).default(5),
});

export type LolPlayerStatsConfig = z.infer<typeof LolPlayerStatsConfigSchema>;

export const DEFAULT_LOL_PLAYER_STATS_CONFIG: LolPlayerStatsConfig =
  LolPlayerStatsConfigSchema.parse({});
