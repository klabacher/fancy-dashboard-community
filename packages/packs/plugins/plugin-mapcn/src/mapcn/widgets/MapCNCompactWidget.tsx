import { useMemo, useState } from "react";
import {
  Activity,
  Cable,
  CircleOff,
  Wifi,
  ArrowDownRight,
  ArrowUpRight,
  Timer,
} from "lucide-react";

import { Toast } from "@fancydashboard/sdk/components/Toast";
import { useWidgetViewport } from "@fancydashboard/sdk/components/WidgetViewport";
import { usePluginContext } from "@fancydashboard/sdk/plugins/PluginContext";

import type { MapCNCompactConfig } from "../MapCN.config";
import { Configuration } from "../components/Configuration";
import { WidgetHeader } from "../components/WidgetHeader";
import { useMapCNStore } from "../hooks/useMapCNStore";
import { useNetworkSniffing } from "../hooks/useNetworkSniffing";
import {
  formatBytes,
  formatDateTime,
  formatSpeed,
  inferInterfaceType,
} from "../utils";

interface ToggleRowProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  reducedMotion: boolean;
}

function ToggleRow({ label, value, onChange, reducedMotion }: ToggleRowProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.055] px-3 py-2 text-xs text-white/70 transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
    >
      <span>{label}</span>
      <span
        className={`inline-flex h-5 w-9 items-center rounded-full border border-white/10 p-0.5 ${
          reducedMotion ? "" : "transition-colors duration-200"
        } ${value ? "bg-emerald-400/80" : "bg-white/10"}`}
      >
        <span
          className={`h-3.5 w-3.5 rounded-full bg-white ${
            reducedMotion ? "" : "transition-transform duration-200"
          } ${value ? "translate-x-4" : "translate-x-0"}`}
        />
      </span>
    </button>
  );
}

export function MapCNCompactWidget() {
  const { config, setConfig } = usePluginContext();
  const viewport = useWidgetViewport();
  const runtimeConfig = config as MapCNCompactConfig;
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const sniffing = useNetworkSniffing();
  const status = useMapCNStore((state) => state.status);
  const history = useMapCNStore((state) => state.history);
  const lastSeenAt = useMapCNStore((state) => state.lastSeenAt);
  const error = useMapCNStore((state) => state.error);
  const setError = useMapCNStore((state) => state.setError);

  const latestEntry = history[history.length - 1];
  const interfaceType =
    status?.interfaceType ?? inferInterfaceType(status?.deviceName ?? null);

  const isOnline = useMemo(() => {
    if (!sniffing.isRunning || !lastSeenAt) return false;
    return Date.now() - lastSeenAt < 15000;
  }, [lastSeenAt, sniffing.isRunning]);

  const updateConfig = (patch: Partial<MapCNCompactConfig>) => {
    setConfig({ ...runtimeConfig, ...patch });
  };

  const micro = viewport.size === "micro";
  const compact = micro || viewport.size === "compact" || viewport.isShort;
  const canInline = viewport.width >= 420 && viewport.aspectRatio >= 1.35;
  const layoutClass =
    runtimeConfig.layout === "inline"
      ? canInline
        ? "flex-row"
        : "flex-col"
      : runtimeConfig.layout === "stacked"
        ? "flex-col"
        : canInline
          ? "flex-row"
          : "flex-col";
  const accentClass =
    runtimeConfig.accent === "neon" ? "text-cyan-300" : "text-white/70";
  const tileClass = `min-w-0 rounded-xl border border-white/8 bg-white/[0.055] backdrop-blur-xl ${
    micro ? "px-2 py-1.5" : "px-3 py-2"
  }`;

  const showInterface = runtimeConfig.showInterface && !micro;
  const showPackets = runtimeConfig.showPackets && !micro && !viewport.isShort;
  const showBytes = runtimeConfig.showBytes && !compact;
  const showLastSeen = runtimeConfig.showLastSeen && !compact;

  return (
    <div
      className={`relative flex h-full w-full min-h-0 flex-col overflow-hidden border border-white/10 bg-linear-to-br from-slate-950/95 via-slate-900/90 to-black/95 shadow-[0_18px_55px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-2xl ${
        micro ? "gap-1.5 rounded-xl p-1.5" : compact ? "gap-2 rounded-2xl p-2" : "gap-3 rounded-3xl p-3"
      }`}
    >
      {!micro && (
        <WidgetHeader
          title="Network Status"
          subtitle={compact ? undefined : "Compact Live Telemetry"}
          isRunning={sniffing.isRunning}
          isLoading={sniffing.isLoading}
          onToggle={sniffing.isRunning ? sniffing.stop : sniffing.start}
          onOpenConfig={() => setIsConfigOpen(true)}
          size="compact"
        />
      )}

      {micro && (
        <button
          type="button"
          onClick={sniffing.isRunning ? sniffing.stop : sniffing.start}
          disabled={sniffing.isLoading}
          className="flex min-h-8 items-center justify-between rounded-xl border border-white/10 bg-white/[0.06] px-2 text-[10px] text-white/75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          aria-label={sniffing.isRunning ? "Stop network capture" : "Start network capture"}
        >
          <span className="flex items-center gap-1.5">
            <Activity
              className={`h-3.5 w-3.5 ${isOnline ? "text-emerald-400" : "text-white/45"}`}
              aria-hidden="true"
            />
            {isOnline ? "Online" : "Offline"}
          </span>
          <span className={sniffing.isRunning ? "text-emerald-300" : "text-white/45"}>
            {sniffing.isRunning ? "Live" : "Start"}
          </span>
        </button>
      )}

      <div className={`flex min-h-0 flex-1 ${layoutClass} flex-wrap content-start gap-1.5 overflow-y-auto overscroll-contain`}>
        {runtimeConfig.showConnectionType && (
          <div className={`${tileClass} flex items-center gap-2`}>
            {interfaceType === "wifi" ? (
              <Wifi className={`h-4 w-4 shrink-0 ${accentClass}`} aria-hidden="true" />
            ) : interfaceType === "ethernet" ? (
              <Cable className={`h-4 w-4 shrink-0 ${accentClass}`} aria-hidden="true" />
            ) : (
              <CircleOff className="h-4 w-4 shrink-0 text-white/50" aria-hidden="true" />
            )}
            <div className="truncate text-[clamp(0.62rem,4cqw,0.75rem)] text-white/70">
              {interfaceType === "wifi"
                ? "Wi‑Fi"
                : interfaceType === "ethernet"
                  ? "Ethernet"
                  : "Offline"}
            </div>
          </div>
        )}

        {showInterface && (
          <div className={`${tileClass} flex items-center gap-2`}>
            <span className="text-[10px] text-white/45">Device</span>
            <span className="max-w-40 truncate text-xs text-white">
              {status?.deviceName ?? "-"}
            </span>
          </div>
        )}

        {runtimeConfig.showStatus && !micro && (
          <div className={`${tileClass} flex items-center gap-2`}>
            <Activity
              className={`h-4 w-4 shrink-0 ${isOnline ? "text-emerald-400" : "text-red-400"}`}
              aria-hidden="true"
            />
            <span className="text-xs text-white/70">{isOnline ? "Online" : "Offline"}</span>
          </div>
        )}

        {runtimeConfig.showSpeed && (
          <div className={`${tileClass} flex flex-1 flex-col gap-1`}>
            <div className="flex items-center justify-between gap-2 text-[10px] text-white/50">
              <span>Down</span>
              <span className="truncate text-white">{formatSpeed(latestEntry?.downloadSpeed ?? 0)}</span>
            </div>
            {!micro && (
              <div className="flex items-center justify-between gap-2 text-[10px] text-white/50">
                <span>Up</span>
                <span className="truncate text-white">{formatSpeed(latestEntry?.uploadSpeed ?? 0)}</span>
              </div>
            )}
          </div>
        )}

        {showPackets && (
          <div className={`${tileClass} flex flex-1 flex-col gap-1`}>
            <div className="flex items-center justify-between gap-2 text-[10px] text-white/50">
              <span>Packets In</span>
              <span className="text-white">{latestEntry?.packetsIn ?? 0}</span>
            </div>
            <div className="flex items-center justify-between gap-2 text-[10px] text-white/50">
              <span>Packets Out</span>
              <span className="text-white">{latestEntry?.packetsOut ?? 0}</span>
            </div>
          </div>
        )}

        {showBytes && (
          <div className={`${tileClass} flex flex-1 flex-col gap-1`}>
            <div className="flex items-center justify-between gap-2 text-[10px] text-white/50">
              <span>Bytes In</span>
              <span className="text-white">{formatBytes(latestEntry?.bytesIn ?? 0)}</span>
            </div>
            <div className="flex items-center justify-between gap-2 text-[10px] text-white/50">
              <span>Bytes Out</span>
              <span className="text-white">{formatBytes(latestEntry?.bytesOut ?? 0)}</span>
            </div>
          </div>
        )}

        {showLastSeen && (
          <div className={`${tileClass} flex items-center gap-2`}>
            <Timer className="h-4 w-4 shrink-0 text-white/60" aria-hidden="true" />
            <span className="truncate text-xs text-white/70">Last active: {formatDateTime(lastSeenAt)}</span>
          </div>
        )}
      </div>

      {!micro && (
        <div className="flex shrink-0 items-center justify-between text-[10px] text-white/40">
          <div className="flex items-center gap-1">
            <ArrowDownRight className="h-3 w-3" aria-hidden="true" />
            {(latestEntry?.downloadSpeed ?? 0).toFixed(0)}
          </div>
          <div className="flex items-center gap-1">
            <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
            {(latestEntry?.uploadSpeed ?? 0).toFixed(0)}
          </div>
        </div>
      )}

      <Configuration
        isOpen={isConfigOpen}
        title="Compact Widget"
        description="Customize the compact telemetry card."
        onClose={() => setIsConfigOpen(false)}
      >
        <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70">
          <div className="text-[10px] uppercase text-white/40">Layout</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {(["auto", "inline", "stacked"] as const).map((layout) => (
              <button
                key={layout}
                type="button"
                onClick={() => updateConfig({ layout })}
                className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-wide focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                  runtimeConfig.layout === layout
                    ? "bg-cyan-500 text-white"
                    : "bg-white/10 text-white/60"
                }`}
              >
                {layout}
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70">
          <div className="text-[10px] uppercase text-white/40">Accent</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {(["neon", "soft"] as const).map((accent) => (
              <button
                key={accent}
                type="button"
                onClick={() => updateConfig({ accent })}
                className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-wide focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                  runtimeConfig.accent === accent
                    ? "bg-fuchsia-500 text-white"
                    : "bg-white/10 text-white/60"
                }`}
              >
                {accent}
              </button>
            ))}
          </div>
        </div>
        {[
          ["Show Connection Type", "showConnectionType"],
          ["Show Device Name", "showInterface"],
          ["Show Online Status", "showStatus"],
          ["Show Speed", "showSpeed"],
          ["Show Packets", "showPackets"],
          ["Show Bytes", "showBytes"],
          ["Show Last Seen", "showLastSeen"],
        ].map(([label, key]) => (
          <ToggleRow
            key={key}
            label={label}
            value={runtimeConfig[key as keyof MapCNCompactConfig] as boolean}
            onChange={(value) => updateConfig({ [key]: value })}
            reducedMotion={viewport.reducedMotion}
          />
        ))}
      </Configuration>

      <Toast message={error} onDismiss={() => setError(null)} />
    </div>
  );
}
