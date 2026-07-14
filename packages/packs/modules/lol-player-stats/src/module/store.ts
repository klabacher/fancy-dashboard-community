// ============================================================================
// LoL Player Stats Widget - State Store
// Zustand store with caching, stale-while-revalidate, and rate limit handling
// ============================================================================

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  LolWidgetState,
  LolWidgetConfig,
  LolWidgetError,
  RiotRegion,
} from "./types";
import {
  checkApiKeyStatus,
  setApiKey,
  getPlayerSummary,
  removeApiKey,
} from "./api";

// Cache TTL in milliseconds (5 minutes)
const CACHE_TTL = 5 * 60 * 1000;

// Stale threshold (2 minutes) - will show cached data but fetch fresh in background
const STALE_THRESHOLD = 2 * 60 * 1000;

// Refresh cooldown (30 seconds)
const REFRESH_COOLDOWN = 30 * 1000;

interface LolWidgetStore extends LolWidgetState {
  config: LolWidgetConfig;

  // Config actions
  setConfig: (config: Partial<LolWidgetConfig>) => void;

  // API Key actions
  checkApiKey: () => Promise<void>;
  saveApiKey: (key: string) => Promise<boolean>;
  clearApiKey: () => Promise<void>;

  // Player data actions
  fetchPlayer: (force?: boolean) => Promise<void>;
  refreshPlayer: () => Promise<void>;
  clearPlayer: () => void;

  // Cache helpers
  isCacheValid: () => boolean;
  isCacheStaleCheck: () => boolean;
  getCacheAge: () => number | null;

  // Error handling
  clearError: () => void;

  // Rate limiting
  startRefreshCooldown: () => void;
  checkRefreshCooldown: () => void;
}

export const useLolWidgetStore = create<LolWidgetStore>()(
  persist(
    (set, get) => ({
      // Initial state
      hasApiKey: false,
      isCheckingApiKey: false,
      playerData: null,
      isLoading: false,
      isRefreshing: false,
      error: null,
      lastFetched: null,
      isCacheStale: false,
      canRefresh: true,
      refreshCooldownEnd: null,

      config: {
        region: "NA1" as RiotRegion,
        gameName: "",
        tagLine: "",
        showRankedFlex: false,
        autoRefreshMinutes: 5,
      },

      // Config actions
      setConfig: (config) => {
        set((state) => ({
          config: { ...state.config, ...config },
        }));
      },

      // API Key actions
      checkApiKey: async () => {
        set({ isCheckingApiKey: true });
        try {
          const status = await checkApiKeyStatus();
          set({
            hasApiKey: status.hasKey,
            isCheckingApiKey: false,
          });
        } catch {
          set({
            hasApiKey: false,
            isCheckingApiKey: false,
          });
        }
      },

      saveApiKey: async (key: string) => {
        set({ isLoading: true, error: null });
        try {
          const success = await setApiKey(key);
          if (success) {
            set({
              hasApiKey: true,
              isLoading: false,
            });
            return true;
          } else {
            set({
              error: {
                type: "INVALID_API_KEY",
                message: "The API key is invalid or could not be verified.",
              },
              isLoading: false,
            });
            return false;
          }
        } catch (err) {
          set({
            error: {
              type: "UNKNOWN_ERROR",
              message:
                err instanceof Error ? err.message : "Failed to save API key",
            },
            isLoading: false,
          });
          return false;
        }
      },

      clearApiKey: async () => {
        try {
          await removeApiKey();
          set({
            hasApiKey: false,
            playerData: null,
            lastFetched: null,
          });
        } catch (err) {
          console.error("Failed to clear API key:", err);
        }
      },

      // Player data actions
      fetchPlayer: async (force = false) => {
        const state = get();
        const { config, isCacheValid, isCacheStaleCheck, playerData } = state;

        if (!config.gameName || !config.tagLine) {
          return;
        }

        // Check if we have valid cache
        if (!force && isCacheValid() && playerData) {
          // Check if cache is stale - if so, refresh in background
          if (isCacheStaleCheck()) {
            set({ isCacheStale: true });
            get().refreshPlayer();
          }
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const data = await getPlayerSummary({
            region: config.region,
            gameName: config.gameName,
            tagLine: config.tagLine,
          });

          set({
            playerData: data,
            lastFetched: Date.now(),
            isLoading: false,
            isCacheStale: false,
            error: null,
          });
        } catch (err) {
          const error = parseError(err);
          set({
            error,
            isLoading: false,
          });
        }
      },

      refreshPlayer: async () => {
        const state = get();
        if (!state.canRefresh || state.isRefreshing) {
          return;
        }

        set({ isRefreshing: true });
        state.startRefreshCooldown();

        try {
          const data = await getPlayerSummary({
            region: state.config.region,
            gameName: state.config.gameName,
            tagLine: state.config.tagLine,
          });

          set({
            playerData: data,
            lastFetched: Date.now(),
            isRefreshing: false,
            isCacheStale: false,
            error: null,
          });
        } catch (err) {
          const error = parseError(err);
          // Don't overwrite existing data on refresh error
          set({
            error,
            isRefreshing: false,
          });
        }
      },

      clearPlayer: () => {
        set({
          playerData: null,
          lastFetched: null,
          error: null,
        });
      },

      // Cache helpers
      isCacheValid: () => {
        const { lastFetched } = get();
        if (!lastFetched) return false;
        return Date.now() - lastFetched < CACHE_TTL;
      },

      isCacheStaleCheck: () => {
        const { lastFetched } = get();
        if (!lastFetched) return true;
        return Date.now() - lastFetched > STALE_THRESHOLD;
      },

      getCacheAge: () => {
        const { lastFetched } = get();
        if (!lastFetched) return null;
        return Date.now() - lastFetched;
      },

      // Error handling
      clearError: () => {
        set({ error: null });
      },

      // Rate limiting
      startRefreshCooldown: () => {
        const cooldownEnd = Date.now() + REFRESH_COOLDOWN;
        set({ canRefresh: false, refreshCooldownEnd: cooldownEnd });

        setTimeout(() => {
          set({ canRefresh: true, refreshCooldownEnd: null });
        }, REFRESH_COOLDOWN);
      },

      checkRefreshCooldown: () => {
        const { refreshCooldownEnd } = get();
        if (refreshCooldownEnd && Date.now() >= refreshCooldownEnd) {
          set({ canRefresh: true, refreshCooldownEnd: null });
        }
      },
    }),
    {
      name: "lol-player-stats-storage",
      partialize: (state) => ({
        config: state.config,
        playerData: state.playerData,
        lastFetched: state.lastFetched,
        hasApiKey: state.hasApiKey,
      }),
    }
  )
);

// ============================================================================
// Error Parser
// ============================================================================

function parseError(err: unknown): LolWidgetError {
  if (err instanceof Error) {
    const message = err.message.toLowerCase();

    if (message.includes("401") || message.includes("unauthorized")) {
      return {
        type: "INVALID_API_KEY",
        message: "API key is invalid or expired. Please update your API key.",
      };
    }

    if (message.includes("429") || message.includes("rate")) {
      // Try to extract retry-after
      const retryMatch = message.match(/retry[- ]?after[:\s]*(\d+)/i);
      const retryAfter = retryMatch ? parseInt(retryMatch[1], 10) : 60;
      return {
        type: "RATE_LIMITED",
        message: `Rate limited. Please wait ${retryAfter} seconds.`,
        retryAfter,
      };
    }

    if (message.includes("404") || message.includes("not found")) {
      return {
        type: "PLAYER_NOT_FOUND",
        message: "Player not found. Please check the name and tag.",
      };
    }

    if (
      message.includes("network") ||
      message.includes("fetch") ||
      message.includes("connection")
    ) {
      return {
        type: "NETWORK_ERROR",
        message: "Network error. Please check your connection.",
      };
    }

    return {
      type: "UNKNOWN_ERROR",
      message: err.message,
    };
  }

  return {
    type: "UNKNOWN_ERROR",
    message: "An unexpected error occurred.",
  };
}
