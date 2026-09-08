import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Check,
  ChevronDown,
  Eye,
  EyeOff,
  Flame,
  Key,
  RefreshCw,
  Settings,
  TrendingUp,
  Trophy,
  User,
  X,
} from "lucide-react";

import { useWidgetViewport } from "@fancydashboard/sdk/components/WidgetViewport";
import { usePluginContext } from "@fancydashboard/sdk/plugins/PluginContext";
import type { WidgetRuntimeProps } from "@fancydashboard/sdk/plugins/types";
import { useLolWidgetStore } from "./store";
import type {
  LolWidgetConfig,
  RankedTier,
  RiotRankedEntry,
  RiotRegion,
} from "./types";
import {
  REGION_DISPLAY_NAMES,
  calculateWinRate,
  getProfileIconUrl,
  getTierColor,
} from "./types";

interface ResponsiveProps {
  compact: boolean;
  micro: boolean;
  reducedMotion: boolean;
}

function animation(reducedMotion: boolean) {
  return reducedMotion
    ? { initial: false as const, animate: undefined, exit: undefined }
    : {
        initial: { opacity: 0, y: 6 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -4 },
      };
}

function Skeleton({ compact, reducedMotion }: Pick<ResponsiveProps, "compact" | "reducedMotion">) {
  const rows = compact ? 2 : 4;
  return (
    <div className={`flex h-full flex-col ${compact ? "gap-2 p-2" : "gap-3 p-4"}`} aria-label="Loading player data">
      <div className="flex items-center gap-3">
        <div className={`rounded-full bg-white/10 ${compact ? "h-10 w-10" : "h-14 w-14"} ${reducedMotion ? "" : "animate-pulse"}`} />
        <div className="min-w-0 flex-1 space-y-2">
          <div className={`h-4 w-2/3 rounded bg-white/10 ${reducedMotion ? "" : "animate-pulse"}`} />
          <div className={`h-3 w-1/3 rounded bg-white/10 ${reducedMotion ? "" : "animate-pulse"}`} />
        </div>
      </div>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className={`min-h-10 flex-1 rounded-xl bg-white/[0.06] ${reducedMotion ? "" : "animate-pulse"}`} />
      ))}
    </div>
  );
}

function TierBadge({
  tier,
  rank,
  lp,
  compact,
}: {
  tier: RankedTier;
  rank: string;
  lp: number;
  compact: boolean;
}) {
  const tierColor = getTierColor(tier);
  return (
    <div
      className={`inline-flex min-w-0 items-center gap-1.5 rounded-lg border font-semibold ${compact ? "px-2 py-1 text-[10px]" : "px-2.5 py-1.5 text-xs"}`}
      style={{
        background: `linear-gradient(135deg, ${tierColor}1f, ${tierColor}0d)`,
        borderColor: `${tierColor}40`,
        color: tierColor,
      }}
    >
      <Trophy className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span className="truncate">
        {tier === "UNRANKED" ? "Unranked" : `${tier} ${rank}`}
      </span>
      {tier !== "UNRANKED" && <span className="shrink-0 opacity-70">{lp} LP</span>}
    </div>
  );
}

function RankedCard({
  entry,
  compact,
  micro,
  reducedMotion,
}: ResponsiveProps & { entry: RiotRankedEntry }) {
  const winRate = calculateWinRate(entry.wins, entry.losses);
  const queueName = entry.queueType === "RANKED_SOLO_5x5" ? "Solo/Duo" : "Flex";
  const tierColor = getTierColor(entry.tier);

  return (
    <motion.article
      {...animation(reducedMotion)}
      whileHover={reducedMotion ? undefined : { scale: 1.005 }}
      className={`min-w-0 overflow-hidden border border-white/10 bg-white/[0.055] backdrop-blur-xl ${micro ? "rounded-xl p-1.5" : compact ? "rounded-xl p-2" : "rounded-2xl p-3"}`}
      style={{ boxShadow: `inset 0 0 28px ${tierColor}08` }}
    >
      <div className="flex min-w-0 items-center justify-between gap-2">
        <span className="truncate text-[10px] font-medium uppercase tracking-wide text-white/45">
          {queueName}
        </span>
        {entry.hotStreak && !micro && (
          <span className="flex shrink-0 items-center gap-1 text-[10px] font-semibold text-orange-400">
            <Flame className={`h-3 w-3 ${reducedMotion ? "" : "animate-pulse"}`} aria-hidden="true" />
            HOT
          </span>
        )}
      </div>

      <div className={`${micro ? "mt-1" : "mt-2"}`}>
        <TierBadge tier={entry.tier} rank={entry.rank} lp={entry.leaguePoints} compact={compact} />
      </div>

      {!micro && (
        <div className={`flex min-w-0 items-center ${compact ? "mt-1.5 gap-2 text-[10px]" : "mt-2.5 gap-3 text-xs"}`}>
          <span className="text-emerald-300">{entry.wins}W</span>
          <span className="text-red-300">{entry.losses}L</span>
          <span className={`ml-auto flex items-center gap-1 font-semibold ${winRate >= 50 ? "text-emerald-300" : "text-red-300"}`}>
            <TrendingUp className="h-3 w-3" aria-hidden="true" />
            {winRate}%
          </span>
        </div>
      )}

      {!compact && entry.miniSeries && (
        <div className="mt-2 flex items-center gap-1">
          <span className="mr-1 text-[9px] text-white/35">PROMOS</span>
          {entry.miniSeries.progress.split("").map((result, index) => (
            <span
              key={`${result}-${index}`}
              className={`h-2.5 w-2.5 rounded-full border ${
                result === "W"
                  ? "border-emerald-400 bg-emerald-500"
                  : result === "L"
                    ? "border-red-400 bg-red-500"
                    : "border-white/20 bg-white/10"
              }`}
            />
          ))}
        </div>
      )}
    </motion.article>
  );
}

function ApiKeyForm({ compact, reducedMotion }: Pick<ResponsiveProps, "compact" | "reducedMotion">) {
  const saveApiKey = useLolWidgetStore((state) => state.saveApiKey);
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const key = apiKey.trim();
    if (!key) return;
    setSaving(true);
    setError(null);
    const success = await saveApiKey(key);
    setSaving(false);
    if (!success) setError("Invalid API key. Check the key and try again.");
  };

  return (
    <motion.div {...animation(reducedMotion)} className={`flex h-full flex-col items-center justify-center text-center ${compact ? "p-2" : "p-5"}`}>
      <div className={`rounded-full border border-[#c89b3c]/20 bg-[#c89b3c]/10 ${compact ? "mb-2 p-2" : "mb-4 p-3"}`}>
        <Key className={`${compact ? "h-5 w-5" : "h-7 w-7"} text-[#c89b3c]`} aria-hidden="true" />
      </div>
      <h3 className={`${compact ? "text-xs" : "text-sm"} font-semibold text-white`}>Connect Riot API</h3>
      {!compact && <p className="mt-1 max-w-56 text-xs text-white/45">The key is stored in your operating system credential store, never in the widget configuration.</p>}
      <form onSubmit={submit} className={`w-full max-w-72 ${compact ? "mt-2" : "mt-4"}`}>
        <div className="relative">
          <input
            type={showKey ? "text" : "password"}
            value={apiKey}
            onChange={(event) => setApiKey(event.target.value)}
            maxLength={512}
            autoComplete="off"
            placeholder="RGAPI-…"
            aria-label="Riot API key"
            className={`w-full rounded-xl border border-white/10 bg-white/[0.055] pr-9 text-white outline-none placeholder:text-white/25 focus:border-[#c89b3c]/50 focus-visible:ring-2 focus-visible:ring-[#c89b3c]/35 ${compact ? "h-8 px-2 text-[11px]" : "h-10 px-3 text-xs"}`}
          />
          <button
            type="button"
            onClick={() => setShowKey((value) => !value)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-white/40 hover:text-white/75 focus-visible:outline-2 focus-visible:outline-white"
            aria-label={showKey ? "Hide API key" : "Show API key"}
          >
            {showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </button>
        </div>
        {error && <p className="mt-1 text-[10px] text-red-300">{error}</p>}
        <button
          type="submit"
          disabled={!apiKey.trim() || saving}
          className={`mt-2 w-full rounded-xl bg-linear-to-r from-[#c89b3c] to-[#9a742a] font-semibold text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${compact ? "h-8 text-[11px]" : "h-10 text-xs"}`}
        >
          {saving ? "Validating…" : "Connect"}
        </button>
      </form>
      {!compact && <p className="mt-2 text-[9px] text-white/30">Create a development key at developer.riotgames.com</p>}
    </motion.div>
  );
}

function ErrorState({
  compact,
  reducedMotion,
}: Pick<ResponsiveProps, "compact" | "reducedMotion">) {
  const error = useLolWidgetStore((state) => state.error);
  const clearError = useLolWidgetStore((state) => state.clearError);
  const fetchPlayer = useLolWidgetStore((state) => state.fetchPlayer);
  if (!error) return null;

  return (
    <motion.div {...animation(reducedMotion)} className={`flex h-full flex-col items-center justify-center text-center ${compact ? "p-2" : "p-4"}`}>
      <AlertCircle className={`${compact ? "h-5 w-5" : "h-7 w-7"} text-red-300`} aria-hidden="true" />
      <p className="mt-2 text-xs font-semibold text-white">{error.type.replace(/_/g, " ")}</p>
      {!compact && <p className="mt-1 max-w-64 text-xs text-white/45">{error.message}</p>}
      <div className="mt-3 flex gap-2">
        <button type="button" onClick={() => fetchPlayer(true)} className="rounded-lg bg-white/10 px-3 py-1.5 text-[10px] text-white focus-visible:outline-2 focus-visible:outline-white">Retry</button>
        <button type="button" onClick={clearError} className="rounded-lg bg-white/5 px-3 py-1.5 text-[10px] text-white/60 focus-visible:outline-2 focus-visible:outline-white">Dismiss</button>
      </div>
    </motion.div>
  );
}

function PlayerDisplay({ compact, micro, reducedMotion }: ResponsiveProps) {
  const playerData = useLolWidgetStore((state) => state.playerData);
  const config = useLolWidgetStore((state) => state.config);
  const refreshPlayer = useLolWidgetStore((state) => state.refreshPlayer);
  const canRefresh = useLolWidgetStore((state) => state.canRefresh);
  const isRefreshing = useLolWidgetStore((state) => state.isRefreshing);
  if (!playerData) return null;

  const { account, summoner, rankedEntries } = playerData;
  const solo = rankedEntries.find((entry) => entry.queueType === "RANKED_SOLO_5x5");
  const flex = rankedEntries.find((entry) => entry.queueType === "RANKED_FLEX_SR");
  const showFlex = config.showRankedFlex && flex && !micro;
  const twoColumns = !compact && showFlex;

  return (
    <div className={`flex h-full min-h-0 flex-col ${micro ? "gap-1.5 p-1.5" : compact ? "gap-2 p-2" : "gap-3 p-3.5"}`}>
      <motion.header {...animation(reducedMotion)} className="flex min-w-0 shrink-0 items-center gap-2.5">
        {!micro && (
          <div className="relative shrink-0">
            <img
              src={getProfileIconUrl(summoner.profileIconId)}
              alt=""
              className={`${compact ? "h-10 w-10" : "h-13 w-13"} rounded-full border border-white/20 object-cover`}
            />
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded bg-black/85 px-1.5 text-[9px] text-white/80">{summoner.summonerLevel}</span>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className={`truncate font-semibold text-white ${micro ? "text-xs" : compact ? "text-sm" : "text-base"}`}>{account.gameName}</h3>
          <p className="truncate text-[10px] text-white/45">#{account.tagLine}</p>
        </div>
        <button
          type="button"
          onClick={() => refreshPlayer()}
          disabled={!canRefresh || isRefreshing}
          className={`${micro ? "h-7 w-7" : "h-8 w-8"} flex shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.055] text-white/60 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-35`}
          aria-label="Refresh player stats"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing && !reducedMotion ? "animate-spin" : ""}`} aria-hidden="true" />
        </button>
      </motion.header>

      <div className={`grid min-h-0 flex-1 auto-rows-fr gap-2 overflow-y-auto overscroll-contain ${twoColumns ? "grid-cols-2" : "grid-cols-1"}`}>
        {solo ? (
          <RankedCard entry={solo} compact={compact} micro={micro} reducedMotion={reducedMotion} />
        ) : (
          <div className="flex min-h-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-2 text-center text-[10px] text-white/45">Unranked in Solo/Duo</div>
        )}
        {showFlex && <RankedCard entry={flex} compact={compact} micro={micro} reducedMotion={reducedMotion} />}
      </div>

      {!compact && playerData.fetchedAt && (
        <p className="shrink-0 text-center text-[9px] text-white/25">Updated {formatTimeAgo(playerData.fetchedAt)}</p>
      )}
    </div>
  );
}

function SettingsPanel({
  open,
  onClose,
  config,
  onUpdateConfig,
  compact,
  reducedMotion,
}: {
  open: boolean;
  onClose: () => void;
  config: LolWidgetConfig;
  onUpdateConfig: (next: Partial<LolWidgetConfig>) => void;
  compact: boolean;
  reducedMotion: boolean;
}) {
  const hasApiKey = useLolWidgetStore((state) => state.hasApiKey);
  const saveApiKey = useLolWidgetStore((state) => state.saveApiKey);
  const clearApiKey = useLolWidgetStore((state) => state.clearApiKey);
  const clearPlayer = useLolWidgetStore((state) => state.clearPlayer);
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const regions = Object.entries(REGION_DISPLAY_NAMES) as [RiotRegion, string][];

  const save = async () => {
    if (!apiKey.trim()) return;
    setSaving(true);
    const success = await saveApiKey(apiKey.trim());
    setSaving(false);
    if (success) setApiKey("");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.section
          {...animation(reducedMotion)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="lol-settings-title"
          className={`absolute inset-0 z-30 overflow-y-auto bg-neutral-950/95 backdrop-blur-2xl ${compact ? "p-2" : "p-4"}`}
        >
          <header className="mb-3 flex items-center justify-between gap-2">
            <h3 id="lol-settings-title" className="flex items-center gap-2 text-sm font-semibold text-white"><Settings className="h-4 w-4" />Widget Settings</h3>
            <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-white/60 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white" aria-label="Close settings"><X className="h-4 w-4" /></button>
          </header>

          <div className="space-y-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.045] p-3">
              <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-white/45">Riot API key</p>
              {hasApiKey ? (
                <div className="flex items-center justify-between gap-2">
                  <span className="flex min-w-0 items-center gap-2 text-xs text-emerald-300"><Check className="h-3.5 w-3.5" />Stored securely</span>
                  <button type="button" onClick={async () => { await clearApiKey(); clearPlayer(); }} className="rounded-lg px-2 py-1 text-[10px] text-red-300 hover:bg-red-400/10 focus-visible:outline-2 focus-visible:outline-white">Remove</button>
                </div>
              ) : (
                <div className="flex min-w-0 gap-2">
                  <div className="relative min-w-0 flex-1">
                    <input type={showKey ? "text" : "password"} value={apiKey} maxLength={512} onChange={(event) => setApiKey(event.target.value)} placeholder="RGAPI-…" aria-label="Riot API key" className="h-9 w-full rounded-lg border border-white/10 bg-white/5 px-2 pr-8 text-xs text-white outline-none focus:border-white/25" />
                    <button type="button" onClick={() => setShowKey((value) => !value)} className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-1 text-white/40 focus-visible:outline-2 focus-visible:outline-white" aria-label={showKey ? "Hide API key" : "Show API key"}>{showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}</button>
                  </div>
                  <button type="button" onClick={save} disabled={!apiKey.trim() || saving} className="rounded-lg bg-emerald-500/80 px-3 text-[10px] font-semibold text-black disabled:opacity-35 focus-visible:outline-2 focus-visible:outline-white">{saving ? "…" : "Save"}</button>
                </div>
              )}
            </div>

            <label className="block text-[10px] font-medium uppercase tracking-wide text-white/45">
              Region
              <div className="relative mt-1">
                <select value={config.region} onChange={(event) => onUpdateConfig({ region: event.target.value as RiotRegion })} className="h-9 w-full appearance-none rounded-lg border border-white/10 bg-white/5 px-2 pr-8 text-xs text-white outline-none focus:border-white/25">
                  {regions.map(([code, name]) => <option key={code} value={code} className="bg-neutral-900">{name} ({code})</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
              </div>
            </label>

            <div className={`grid gap-2 ${compact ? "grid-cols-1" : "grid-cols-2"}`}>
              <label className="text-[10px] font-medium uppercase tracking-wide text-white/45">Game name<input value={config.gameName} onChange={(event) => onUpdateConfig({ gameName: event.target.value.slice(0, 64) })} className="mt-1 h-9 w-full rounded-lg border border-white/10 bg-white/5 px-2 text-xs normal-case tracking-normal text-white outline-none focus:border-white/25" /></label>
              <label className="text-[10px] font-medium uppercase tracking-wide text-white/45">Tag line<input value={config.tagLine} onChange={(event) => onUpdateConfig({ tagLine: event.target.value.slice(0, 16) })} className="mt-1 h-9 w-full rounded-lg border border-white/10 bg-white/5 px-2 text-xs normal-case tracking-normal text-white outline-none focus:border-white/25" /></label>
            </div>

            <label className="flex items-center gap-2 rounded-lg border border-white/8 bg-white/[0.035] px-2 py-2 text-xs text-white/65"><input type="checkbox" checked={config.showRankedFlex} onChange={(event) => onUpdateConfig({ showRankedFlex: event.target.checked })} />Show Flex queue</label>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.floor(minutes / 60)}h ago`;
}

export default function LolPlayerStatsWidget(props: WidgetRuntimeProps) {
  const { setConfig: setGridConfig } = usePluginContext();
  const viewport = useWidgetViewport();
  const runtimeConfig = props.config as unknown as LolWidgetConfig;

  const hasApiKey = useLolWidgetStore((state) => state.hasApiKey);
  const isCheckingApiKey = useLolWidgetStore((state) => state.isCheckingApiKey);
  const isLoading = useLolWidgetStore((state) => state.isLoading);
  const error = useLolWidgetStore((state) => state.error);
  const playerData = useLolWidgetStore((state) => state.playerData);
  const storeConfig = useLolWidgetStore((state) => state.config);
  const checkApiKey = useLolWidgetStore((state) => state.checkApiKey);
  const fetchPlayer = useLolWidgetStore((state) => state.fetchPlayer);
  const setStoreConfig = useLolWidgetStore((state) => state.setConfig);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const micro = viewport.size === "micro";
  const compact = micro || viewport.size === "compact" || viewport.isShort;
  const responsive = { compact, micro, reducedMotion: viewport.reducedMotion };

  useEffect(() => {
    setStoreConfig({
      region: runtimeConfig.region,
      gameName: runtimeConfig.gameName,
      tagLine: runtimeConfig.tagLine,
      showRankedFlex: runtimeConfig.showRankedFlex,
      autoRefreshMinutes: runtimeConfig.autoRefreshMinutes,
    });
  }, [runtimeConfig.region, runtimeConfig.gameName, runtimeConfig.tagLine, runtimeConfig.showRankedFlex, runtimeConfig.autoRefreshMinutes, setStoreConfig]);

  useEffect(() => {
    checkApiKey();
  }, [checkApiKey]);

  useEffect(() => {
    if (hasApiKey && storeConfig.gameName && storeConfig.tagLine) fetchPlayer();
  }, [hasApiKey, storeConfig.gameName, storeConfig.tagLine, storeConfig.region, fetchPlayer]);

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

  const content = useMemo(() => {
    if (isCheckingApiKey || isLoading) return <Skeleton compact={compact} reducedMotion={viewport.reducedMotion} />;
    if (!hasApiKey) return <ApiKeyForm compact={compact} reducedMotion={viewport.reducedMotion} />;
    if (error) return <ErrorState compact={compact} reducedMotion={viewport.reducedMotion} />;
    if (!storeConfig.gameName || !storeConfig.tagLine) {
      return (
        <div className={`flex h-full flex-col items-center justify-center text-center ${compact ? "p-2" : "p-5"}`}>
          <User className={`${compact ? "h-5 w-5" : "h-8 w-8"} text-white/35`} aria-hidden="true" />
          <p className="mt-2 text-xs font-semibold text-white">No player configured</p>
          {!compact && <p className="mt-1 text-xs text-white/45">Choose a Riot ID and region to begin.</p>}
          <button type="button" onClick={() => setSettingsOpen(true)} className="mt-3 rounded-lg bg-white/10 px-3 py-1.5 text-[10px] text-white focus-visible:outline-2 focus-visible:outline-white">Open settings</button>
        </div>
      );
    }
    if (!playerData) return <Skeleton compact={compact} reducedMotion={viewport.reducedMotion} />;
    return <PlayerDisplay {...responsive} />;
  }, [compact, error, hasApiKey, isCheckingApiKey, isLoading, playerData, responsive, storeConfig.gameName, storeConfig.tagLine, viewport.reducedMotion]);

  return (
    <section
      className={`relative h-full w-full overflow-hidden border border-white/10 bg-linear-to-br from-neutral-950/95 via-neutral-900/95 to-neutral-800/90 shadow-[0_18px_55px_rgba(0,0,0,0.23),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-2xl ${micro ? "rounded-xl" : "rounded-3xl"}`}
      aria-label="League of Legends player statistics"
    >
      <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-[#0bc4e2]/[0.06] via-transparent to-[#c89b3c]/[0.06]" />

      {hasApiKey && !micro && (
        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-black/30 text-white/50 backdrop-blur-xl hover:bg-white/10 hover:text-white/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          aria-label="Open League widget settings"
        >
          <Settings className="h-4 w-4" aria-hidden="true" />
        </button>
      )}

      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        config={storeConfig}
        onUpdateConfig={setConfig}
        compact={compact}
        reducedMotion={viewport.reducedMotion}
      />

      <div className="relative h-full min-h-0">{content}</div>
    </section>
  );
}
