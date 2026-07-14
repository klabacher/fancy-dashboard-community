// ============================================================================
// LoL Player Stats Widget - Type Definitions
// Strict TypeScript types for Riot API responses and widget state
// ============================================================================

// ============================================================================
// Riot API Response Types
// ============================================================================

/**
 * Account information from Riot Account API
 */
export interface RiotAccount {
  puuid: string;
  gameName: string;
  tagLine: string;
}

/**
 * Summoner information from Riot Summoner API
 */
export interface RiotSummoner {
  id: string;
  accountId: string;
  puuid: string;
  profileIconId: number;
  revisionDate: number;
  summonerLevel: number;
}

/**
 * Ranked entry from Riot League API
 */
export interface RiotRankedEntry {
  leagueId: string;
  summonerId: string;
  queueType: RankedQueueType;
  tier: RankedTier;
  rank: RankedDivision;
  leaguePoints: number;
  wins: number;
  losses: number;
  hotStreak: boolean;
  veteran: boolean;
  freshBlood: boolean;
  inactive: boolean;
  miniSeries?: MiniSeries;
}

export interface MiniSeries {
  losses: number;
  progress: string;
  target: number;
  wins: number;
}

export type RankedQueueType =
  | "RANKED_SOLO_5x5"
  | "RANKED_FLEX_SR"
  | "RANKED_TFT"
  | "RANKED_TFT_TURBO"
  | "RANKED_TFT_DOUBLE_UP";

export type RankedTier =
  | "IRON"
  | "BRONZE"
  | "SILVER"
  | "GOLD"
  | "PLATINUM"
  | "EMERALD"
  | "DIAMOND"
  | "MASTER"
  | "GRANDMASTER"
  | "CHALLENGER"
  | "UNRANKED";

export type RankedDivision = "I" | "II" | "III" | "IV";

// ============================================================================
// Riot API Regions
// ============================================================================

export type RiotRegion =
  | "BR1" // Brazil
  | "EUN1" // EU Nordic & East
  | "EUW1" // EU West
  | "JP1" // Japan
  | "KR" // Korea
  | "LA1" // Latin America North
  | "LA2" // Latin America South
  | "NA1" // North America
  | "OC1" // Oceania
  | "PH2" // Philippines
  | "RU" // Russia
  | "SG2" // Singapore
  | "TH2" // Thailand
  | "TR1" // Turkey
  | "TW2" // Taiwan
  | "VN2"; // Vietnam

export type RiotAccountRegion = "americas" | "asia" | "europe" | "sea";

export const REGION_TO_ACCOUNT_REGION: Record<RiotRegion, RiotAccountRegion> = {
  NA1: "americas",
  BR1: "americas",
  LA1: "americas",
  LA2: "americas",
  KR: "asia",
  JP1: "asia",
  EUW1: "europe",
  EUN1: "europe",
  TR1: "europe",
  RU: "europe",
  OC1: "sea",
  PH2: "sea",
  SG2: "sea",
  TH2: "sea",
  TW2: "sea",
  VN2: "sea",
};

export const REGION_DISPLAY_NAMES: Record<RiotRegion, string> = {
  NA1: "North America",
  BR1: "Brazil",
  LA1: "Latin America North",
  LA2: "Latin America South",
  EUN1: "EU Nordic & East",
  EUW1: "EU West",
  TR1: "Turkey",
  RU: "Russia",
  KR: "Korea",
  JP1: "Japan",
  OC1: "Oceania",
  PH2: "Philippines",
  SG2: "Singapore",
  TH2: "Thailand",
  TW2: "Taiwan",
  VN2: "Vietnam",
};

// ============================================================================
// Combined Player Summary (from backend)
// ============================================================================

export interface LolPlayerSummary {
  account: RiotAccount;
  summoner: RiotSummoner;
  rankedEntries: RiotRankedEntry[];
  fetchedAt: number; // Unix timestamp
}

// ============================================================================
// Widget State & Config Types
// ============================================================================

export interface LolWidgetConfig {
  region: RiotRegion;
  gameName: string;
  tagLine: string;
  showRankedFlex: boolean;
  autoRefreshMinutes: number;
}

export interface LolWidgetState {
  // API Key status
  hasApiKey: boolean;
  isCheckingApiKey: boolean;

  // Player data
  playerData: LolPlayerSummary | null;

  // Loading states
  isLoading: boolean;
  isRefreshing: boolean;

  // Error handling
  error: LolWidgetError | null;

  // Cache metadata
  lastFetched: number | null;
  isCacheStale: boolean;

  // Rate limiting
  canRefresh: boolean;
  refreshCooldownEnd: number | null;
}

export type LolWidgetErrorType =
  | "INVALID_API_KEY"
  | "RATE_LIMITED"
  | "PLAYER_NOT_FOUND"
  | "NETWORK_ERROR"
  | "UNKNOWN_ERROR";

export interface LolWidgetError {
  type: LolWidgetErrorType;
  message: string;
  retryAfter?: number; // Seconds until retry allowed (for rate limiting)
}

// ============================================================================
// Backend API Types
// ============================================================================

export interface LolApiKeyStatus {
  hasKey: boolean;
  isValid: boolean | null;
  lastValidated: number | null;
}

export interface LolSetApiKeyRequest {
  apiKey: string;
}

export interface LolGetPlayerRequest {
  region: RiotRegion;
  gameName: string;
  tagLine: string;
}

// ============================================================================
// Utility Types
// ============================================================================

export interface RankedStats {
  tier: RankedTier;
  rank: RankedDivision;
  lp: number;
  wins: number;
  losses: number;
  winRate: number;
  hotStreak: boolean;
  promos?: MiniSeries;
}

export function calculateWinRate(wins: number, losses: number): number {
  const total = wins + losses;
  if (total === 0) return 0;
  return Math.round((wins / total) * 100);
}

export function getTierColor(tier: RankedTier): string {
  const colors: Record<RankedTier, string> = {
    IRON: "#5e5e5e",
    BRONZE: "#8b4513",
    SILVER: "#a8a8a8",
    GOLD: "#ffd700",
    PLATINUM: "#00bfbf",
    EMERALD: "#00c853",
    DIAMOND: "#b9f2ff",
    MASTER: "#9d4dbb",
    GRANDMASTER: "#cd4545",
    CHALLENGER: "#f4c874",
    UNRANKED: "#555555",
  };
  return colors[tier];
}

export function getProfileIconUrl(iconId: number): string {
  return `https://ddragon.leagueoflegends.com/cdn/14.24.1/img/profileicon/${iconId}.png`;
}
