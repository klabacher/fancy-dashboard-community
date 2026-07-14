// ============================================================================
// LoL Player Stats Widget - Main UI Component
// LoL-themed styling, framer-motion animations, skeleton loading
// ============================================================================

import { useEffect, useMemo, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCw,
  User,
  Trophy,
  TrendingUp,
  Flame,
  AlertCircle,
  Key,
  Settings,
  ChevronDown,
  X,
  Check,
  Eye,
  EyeOff,
} from "lucide-react";
import type { WidgetRuntimeProps } from "@fancydashboard/sdk/plugins/types";
import { usePluginContext } from "@fancydashboard/sdk/plugins/PluginContext";
import { useLolWidgetStore } from "./store";
import type { LolWidgetConfig } from "./types";
import {
  type RiotRegion,
  type RankedTier,
  type RiotRankedEntry,
  REGION_DISPLAY_NAMES,
  getTierColor,
  getProfileIconUrl,
  calculateWinRate,
} from "./types";

// ============================================================================
// Animation Variants
// ============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

const pulseVariants = {
  pulse: {
    scale: [1, 1.02, 1],
    transition: { duration: 2, repeat: Infinity },
  },
};

// ============================================================================
// Skeleton Components
// ============================================================================

function SkeletonBox({ className }: { className: string }) {
  return <div className={`animate-pulse bg-white/10 rounded ${className}`} />;
}

function PlayerSkeleton() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-4 p-4"
    >
      {/* Header skeleton */}
      <div className="flex items-center gap-3">
        <SkeletonBox className="w-16 h-16 rounded-full" />
        <div className="flex flex-col gap-2 flex-1">
          <SkeletonBox className="h-5 w-32" />
          <SkeletonBox className="h-4 w-20" />
        </div>
      </div>

      {/* Ranked skeleton */}
      <div className="flex flex-col gap-2">
        <SkeletonBox className="h-4 w-24" />
        <SkeletonBox className="h-12 w-full" />
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-3 gap-2">
        <SkeletonBox className="h-16" />
        <SkeletonBox className="h-16" />
        <SkeletonBox className="h-16" />
      </div>
    </motion.div>
  );
}

// ============================================================================
// Tier Badge Component
// ============================================================================

interface TierBadgeProps {
  tier: RankedTier;
  rank: string;
  lp: number;
  size?: "sm" | "md" | "lg";
}

function TierBadge({ tier, rank, lp, size = "md" }: TierBadgeProps) {
  const tierColor = getTierColor(tier);
  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5",
    lg: "text-base px-4 py-2",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`inline-flex items-center gap-2 rounded-lg font-bold ${sizeClasses[size]}`}
      style={{
        background: `linear-gradient(135deg, ${tierColor}20, ${tierColor}10)`,
        border: `1px solid ${tierColor}40`,
        color: tierColor,
        boxShadow: `0 0 20px ${tierColor}15`,
      }}
    >
      <Trophy className="w-4 h-4" />
      <span>{tier === "UNRANKED" ? "Unranked" : `${tier} ${rank}`}</span>
      {tier !== "UNRANKED" && <span className="opacity-70">{lp} LP</span>}
    </motion.div>
  );
}

// ============================================================================
// Ranked Entry Card
// ============================================================================

interface RankedCardProps {
  entry: RiotRankedEntry;
  isCompact?: boolean;
}

function RankedCard({ entry, isCompact = false }: RankedCardProps) {
  const winRate = calculateWinRate(entry.wins, entry.losses);
  const queueName = entry.queueType === "RANKED_SOLO_5x5" ? "Solo/Duo" : "Flex";
  const tierColor = getTierColor(entry.tier);

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.01 }}
      className="relative overflow-hidden rounded-lg p-3 bg-linear-to-br from-white/5 to-white/2 border border-white/10"
      style={{
        boxShadow: `inset 0 0 30px ${tierColor}08`,
      }}
    >
      {/* Queue label */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-white/50 uppercase tracking-wider">
          {queueName}
        </span>
        {entry.hotStreak && (
          <motion.div
            variants={pulseVariants}
            animate="pulse"
            className="flex items-center gap-1 text-orange-400"
          >
            <Flame className="w-3 h-3" />
            <span className="text-[10px] font-bold">HOT</span>
          </motion.div>
        )}
      </div>

      {/* Tier badge */}
      <TierBadge
        tier={entry.tier}
        rank={entry.rank}
        lp={entry.leaguePoints}
        size={isCompact ? "sm" : "md"}
      />

      {/* Win/Loss stats */}
      <div className="mt-3 flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-white/70">{entry.wins}W</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <span className="text-white/70">{entry.losses}L</span>
        </div>
        <div className="flex items-center gap-1.5 ml-auto">
          <TrendingUp className="w-3 h-3 text-white/50" />
          <span
            className={`font-bold ${
              winRate >= 50 ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {winRate}%
          </span>
        </div>
      </div>

      {/* Promo series indicator */}
      {entry.miniSeries && (
        <div className="mt-2 flex items-center gap-1">
          <span className="text-[10px] text-white/40 mr-1">PROMOS</span>
          {entry.miniSeries.progress.split("").map((result, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full border ${
                result === "W"
                  ? "bg-emerald-500 border-emerald-400"
                  : result === "L"
                    ? "bg-red-500 border-red-400"
                    : "bg-white/10 border-white/20"
              }`}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ============================================================================
// Settings Panel
// ============================================================================

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  config: LolWidgetConfig;
  onUpdateConfig: (next: Partial<LolWidgetConfig>) => void;
}

function SettingsPanel({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
}: SettingsPanelProps) {
  const { hasApiKey, saveApiKey, clearApiKey, clearPlayer } =
    useLolWidgetStore();

  const [apiKeyInput, setApiKeyInput] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveApiKey = async () => {
    if (!apiKeyInput.trim()) return;
    setIsSaving(true);
    const success = await saveApiKey(apiKeyInput.trim());
    setIsSaving(false);
    if (success) {
      setApiKeyInput("");
    }
  };

  const handleClearApiKey = async () => {
    await clearApiKey();
    clearPlayer();
  };

  const regions = Object.entries(REGION_DISPLAY_NAMES) as [
    RiotRegion,
    string,
  ][];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute inset-0 z-20 bg-black/90 backdrop-blur-sm rounded-lg p-4 overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Widget Settings
            </h3>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-white/70" />
            </button>
          </div>

          {/* API Key Section */}
          <div className="mb-4 p-3 rounded-lg bg-white/5 border border-white/10">
            <label className="text-xs font-medium text-white/70 mb-2 block">
              Riot API Key
            </label>
            {hasApiKey ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Check className="w-4 h-4" />
                  <span className="text-xs">API Key configured</span>
                </div>
                <button
                  onClick={handleClearApiKey}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type={showApiKey ? "text" : "password"}
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="RGAPI-..."
                    className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white/30"
                  />
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                  >
                    {showApiKey ? (
                      <EyeOff className="w-3 h-3" />
                    ) : (
                      <Eye className="w-3 h-3" />
                    )}
                  </button>
                </div>
                <button
                  onClick={handleSaveApiKey}
                  disabled={!apiKeyInput.trim() || isSaving}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed rounded text-xs font-medium text-white transition-colors"
                >
                  {isSaving ? "..." : "Save"}
                </button>
              </div>
            )}
            <p className="mt-2 text-[10px] text-white/40">
              Get your API key from{" "}
              <span className="text-blue-400">developer.riotgames.com</span>
            </p>
          </div>

          {/* Region Selector */}
          <div className="mb-4">
            <label className="text-xs font-medium text-white/70 mb-2 block">
              Region
            </label>
            <div className="relative">
              <select
                value={config.region}
                onChange={(e) =>
                  onUpdateConfig({ region: e.target.value as RiotRegion })
                }
                className="w-full appearance-none bg-white/5 border border-white/10 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30 cursor-pointer"
              >
                {regions.map(([code, name]) => (
                  <option key={code} value={code} className="bg-neutral-900">
                    {name} ({code})
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
            </div>
          </div>

          {/* Player Name Input */}
          <div className="mb-4 grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-medium text-white/70 mb-2 block">
                Game Name
              </label>
              <input
                type="text"
                value={config.gameName}
                onChange={(e) => onUpdateConfig({ gameName: e.target.value })}
                placeholder="Faker"
                className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white/30"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-white/70 mb-2 block">
                Tag Line
              </label>
              <input
                type="text"
                value={config.tagLine}
                onChange={(e) => onUpdateConfig({ tagLine: e.target.value })}
                placeholder="KR1"
                className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white/30"
              />
            </div>
          </div>

          {/* Options */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showFlex"
              checked={config.showRankedFlex}
              onChange={(e) =>
                onUpdateConfig({ showRankedFlex: e.target.checked })
              }
              className="w-4 h-4 rounded border-white/20 bg-white/5"
            />
            <label htmlFor="showFlex" className="text-xs text-white/70">
              Show Flex Queue
            </label>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// Error Display
// ============================================================================

interface ErrorDisplayProps {
  error: { type: string; message: string };
  onRetry: () => void;
  onDismiss: () => void;
}

function ErrorDisplay({ error, onRetry, onDismiss }: ErrorDisplayProps) {
  const isApiKeyError = error.type === "INVALID_API_KEY";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center h-full p-4 text-center"
    >
      <div className="p-3 rounded-full bg-red-500/10 mb-3">
        {isApiKeyError ? (
          <Key className="w-6 h-6 text-red-400" />
        ) : (
          <AlertCircle className="w-6 h-6 text-red-400" />
        )}
      </div>
      <p className="text-sm font-medium text-white mb-1">
        {error.type.replace(/_/g, " ")}
      </p>
      <p className="text-xs text-white/50 mb-4">{error.message}</p>
      <div className="flex gap-2">
        <button
          onClick={onRetry}
          className="px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 text-xs text-white transition-colors"
        >
          Retry
        </button>
        <button
          onClick={onDismiss}
          className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 text-xs text-white/70 transition-colors"
        >
          Dismiss
        </button>
      </div>
    </motion.div>
  );
}

// ============================================================================
// API Key Setup Screen
// ============================================================================

function ApiKeySetup() {
  const { saveApiKey } = useLolWidgetStore();
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;

    setIsSaving(true);
    setError(null);

    const success = await saveApiKey(apiKey.trim());
    setIsSaving(false);

    if (!success) {
      setError("Invalid API key. Please check and try again.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center h-full p-6"
    >
      {/* LoL-themed decorative border */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-linear-to-br from-[#0bc4e2]/10 via-transparent to-[#c89b3c]/10" />
        <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-[#c89b3c]/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-[#0bc4e2]/30 to-transparent" />
      </div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="p-4 rounded-full bg-linear-to-br from-[#c89b3c]/20 to-[#0bc4e2]/20 mb-4"
      >
        <Key className="w-8 h-8 text-[#c89b3c]" />
      </motion.div>

      <h3 className="text-base font-bold text-white mb-1">Setup Required</h3>
      <p className="text-xs text-white/50 mb-4 text-center max-w-50">
        Enter your Riot API key to view player stats
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-62.5">
        <div className="relative mb-3">
          <input
            type={showKey ? "text" : "password"}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="RGAPI-xxxxxxxx-xxxx-..."
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#c89b3c]/50 transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
          >
            {showKey ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>

        {error && (
          <p className="text-xs text-red-400 mb-3 text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={!apiKey.trim() || isSaving}
          className="w-full py-2.5 rounded-lg bg-linear-to-r from-[#c89b3c] to-[#a07a2c] hover:from-[#d4a843] hover:to-[#b08935] disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold text-white shadow-lg shadow-[#c89b3c]/20 transition-all"
        >
          {isSaving ? "Validating..." : "Connect"}
        </button>
      </form>

      <p className="mt-4 text-[10px] text-white/30 text-center">
        Get your API key from developer.riotgames.com
      </p>
    </motion.div>
  );
}

// ============================================================================
// Player Not Set Screen
// ============================================================================

function PlayerNotSet({ onOpenSettings }: { onOpenSettings: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center h-full p-6"
    >
      <div className="p-4 rounded-full bg-white/5 mb-4">
        <User className="w-8 h-8 text-white/40" />
      </div>
      <h3 className="text-sm font-medium text-white mb-1">No Player Set</h3>
      <p className="text-xs text-white/50 mb-4 text-center">
        Configure a player to track their stats
      </p>
      <button
        onClick={onOpenSettings}
        className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-colors flex items-center gap-2"
      >
        <Settings className="w-3 h-3" />
        Open Settings
      </button>
    </motion.div>
  );
}

// ============================================================================
// Main Player Display
// ============================================================================

function PlayerDisplay() {
  const { playerData, config, isRefreshing, canRefresh, refreshPlayer } =
    useLolWidgetStore();

  if (!playerData) return null;

  const { account, summoner, rankedEntries } = playerData;
  const soloQueue = rankedEntries.find(
    (e) => e.queueType === "RANKED_SOLO_5x5"
  );
  const flexQueue = rankedEntries.find((e) => e.queueType === "RANKED_FLEX_SR");

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col h-full p-4 overflow-y-auto"
    >
      {/* Header with profile */}
      <motion.div
        variants={itemVariants}
        className="flex items-center gap-3 mb-4"
      >
        <div className="relative">
          <img
            src={getProfileIconUrl(summoner.profileIconId)}
            alt="Profile"
            className="w-14 h-14 rounded-full border-2 border-white/20"
          />
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-black/80 border border-white/20 text-[10px] font-bold text-white">
            {summoner.summonerLevel}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-white truncate">
            {account.gameName}
          </h3>
          <p className="text-xs text-white/50">#{account.tagLine}</p>
        </div>
        <button
          onClick={() => refreshPlayer()}
          disabled={!canRefresh || isRefreshing}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw
            className={`w-4 h-4 text-white/70 ${isRefreshing ? "animate-spin" : ""}`}
          />
        </button>
      </motion.div>

      {/* Ranked entries */}
      <div className="flex flex-col gap-3 flex-1">
        {soloQueue ? (
          <RankedCard entry={soloQueue} />
        ) : (
          <motion.div
            variants={itemVariants}
            className="p-4 rounded-lg bg-white/5 border border-white/10 text-center"
          >
            <p className="text-xs text-white/50">Unranked in Solo/Duo</p>
          </motion.div>
        )}

        {config.showRankedFlex && flexQueue && <RankedCard entry={flexQueue} />}
      </div>

      {/* Cache indicator */}
      {playerData.fetchedAt && (
        <motion.div variants={itemVariants} className="mt-3 text-center">
          <p className="text-[10px] text-white/30">
            Updated {formatTimeAgo(playerData.fetchedAt)}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

// ============================================================================
// Main Widget Component
// ============================================================================

export default function LolPlayerStatsWidget(props: WidgetRuntimeProps) {
  const { setConfig: setGridConfig } = usePluginContext();
  const runtimeConfig = props.config as unknown as LolWidgetConfig;

  const {
    hasApiKey,
    isCheckingApiKey,
    isLoading,
    error,
    playerData,
    config: storeConfig,
    checkApiKey,
    fetchPlayer,
    clearError,
    setConfig: setStoreConfig,
  } = useLolWidgetStore();

  useEffect(() => {
    setStoreConfig({
      region: runtimeConfig.region,
      gameName: runtimeConfig.gameName,
      tagLine: runtimeConfig.tagLine,
      showRankedFlex: runtimeConfig.showRankedFlex,
      autoRefreshMinutes: runtimeConfig.autoRefreshMinutes,
    });
  }, [
    runtimeConfig.region,
    runtimeConfig.gameName,
    runtimeConfig.tagLine,
    runtimeConfig.showRankedFlex,
    runtimeConfig.autoRefreshMinutes,
    setStoreConfig,
  ]);

  const setConfig = useCallback(
    (next: Partial<LolWidgetConfig>) => {
      setStoreConfig(next);
      setGridConfig({
        ...(storeConfig as unknown as Record<string, unknown>),
        ...(next as unknown as Record<string, unknown>),
      });
    },
    [setGridConfig, setStoreConfig, storeConfig]
  );

  const [settingsOpen, setSettingsOpen] = useState(false);

  // Check API key on mount
  useEffect(() => {
    checkApiKey();
  }, [checkApiKey]);

  // Fetch player when config changes and we have an API key
  useEffect(() => {
    if (hasApiKey && storeConfig.gameName && storeConfig.tagLine) {
      fetchPlayer();
    }
  }, [
    hasApiKey,
    storeConfig.gameName,
    storeConfig.tagLine,
    storeConfig.region,
    fetchPlayer,
  ]);

  // Memoized content based on state
  const content = useMemo(() => {
    if (isCheckingApiKey) {
      return <PlayerSkeleton />;
    }

    if (!hasApiKey) {
      return <ApiKeySetup />;
    }

    if (error) {
      return (
        <ErrorDisplay
          error={error}
          onRetry={() => fetchPlayer(true)}
          onDismiss={clearError}
        />
      );
    }

    if (isLoading) {
      return <PlayerSkeleton />;
    }

    if (!storeConfig.gameName || !storeConfig.tagLine) {
      return <PlayerNotSet onOpenSettings={() => setSettingsOpen(true)} />;
    }

    if (!playerData) {
      return <PlayerSkeleton />;
    }

    return <PlayerDisplay />;
  }, [
    isCheckingApiKey,
    hasApiKey,
    error,
    isLoading,
    storeConfig.gameName,
    storeConfig.tagLine,
    playerData,
    fetchPlayer,
    clearError,
  ]);

  const handleOpenSettings = useCallback(() => {
    setSettingsOpen(true);
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg bg-linear-to-br from-neutral-900 via-neutral-900 to-neutral-800 border border-white/10">
      {/* LoL-themed decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+CjxyZWN0IHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgZmlsbD0ibm9uZSIvPgo8cGF0aCBkPSJNMzAgMzBtLTI4IDBhMjgsMjggMCAxLDEgNTYsMGEyOCwyOCAwIDEsMSAtNTYsMCIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDIpIiBzdHJva2Utd2lkdGg9IjAuNSIgZmlsbD0ibm9uZSIvPgo8L3N2Zz4=')] opacity-50" />
        <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-[#c89b3c]/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-[#0bc4e2]/20 to-transparent" />
        <div className="absolute top-0 bottom-0 left-0 w-px bg-linear-to-b from-transparent via-[#c89b3c]/10 to-transparent" />
        <div className="absolute top-0 bottom-0 right-0 w-px bg-linear-to-b from-transparent via-[#0bc4e2]/10 to-transparent" />
      </div>

      {/* Settings button */}
      {hasApiKey && (
        <button
          onClick={handleOpenSettings}
          className="absolute top-2 right-2 z-10 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
        >
          <Settings className="w-4 h-4 text-white/50" />
        </button>
      )}

      {/* Settings panel */}
      <SettingsPanel
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        config={storeConfig}
        onUpdateConfig={setConfig}
      />

      {/* Main content */}
      {content}
    </div>
  );
}
