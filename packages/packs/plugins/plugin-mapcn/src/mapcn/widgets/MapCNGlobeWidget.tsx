import { useMemo, useState } from "react";
import { Activity, ArrowDownRight, ArrowUpRight } from "lucide-react";

import { Toast } from "@fancydashboard/sdk/components/Toast";
import { useWidgetViewport } from "@fancydashboard/sdk/components/WidgetViewport";
import { usePluginContext } from "@fancydashboard/sdk/plugins/PluginContext";

import type { MapCNGlobeConfig } from "../MapCN.config";
import { RangeRow, ToggleRow } from "../components/ConfigControls";
import { Configuration } from "../components/Configuration";
import { GlobeCanvas } from "../components/GlobeCanvas";
import { WidgetHeader } from "../components/WidgetHeader";
import { useMapCNStore } from "../hooks/useMapCNStore";
import { useNetworkSniffing } from "../hooks/useNetworkSniffing";
import { formatSpeed } from "../utils";

export function MapCNGlobeWidget() {
  const { config, setConfig } = usePluginContext();
  const viewport = useWidgetViewport();
  const runtimeConfig = config as MapCNGlobeConfig;
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const sniffing = useNetworkSniffing();
  const connections = useMapCNStore((state) => state.connections);
  const history = useMapCNStore((state) => state.history);
  const error = useMapCNStore((state) => state.error);
  const setError = useMapCNStore((state) => state.setError);

  const latestEntry = history[history.length - 1];
  const updateConfig = (patch: Partial<MapCNGlobeConfig>) => {
    setConfig({ ...runtimeConfig, ...patch });
  };

  const summary = useMemo(
    () => ({
      totalConnections: connections.length,
      downloadSpeed: latestEntry?.downloadSpeed ?? 0,
      uploadSpeed: latestEntry?.uploadSpeed ?? 0,
    }),
    [connections.length, latestEntry?.downloadSpeed, latestEntry?.uploadSpeed]
  );

  const micro = viewport.size === "micro";
  const compact = micro || viewport.size === "compact" || viewport.isShort;
  const showStats = runtimeConfig.showStats && !micro;
  const showLegend = runtimeConfig.showLegend && !compact;
  const effectiveRotationSpeed = viewport.reducedMotion ? "slow" : runtimeConfig.rotationSpeed;

  return (
    <div
      className={`relative flex h-full w-full min-h-0 flex-col overflow-hidden border border-white/10 bg-linear-to-br from-slate-950/95 via-slate-900/90 to-black/95 shadow-[0_20px_60px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-2xl ${
        micro ? "gap-1 rounded-xl p-1" : compact ? "gap-2 rounded-2xl p-2" : "gap-3 rounded-3xl p-4"
      }`}
    >
      {!micro && (
        <WidgetHeader
          title="MapCN Globe"
          subtitle={compact ? undefined : "3D Live Globe"}
          isRunning={sniffing.isRunning}
          isLoading={sniffing.isLoading}
          onToggle={sniffing.isRunning ? sniffing.stop : sniffing.start}
          onOpenConfig={() => setIsConfigOpen(true)}
        />
      )}

      {micro && (
        <button
          type="button"
          onClick={sniffing.isRunning ? sniffing.stop : sniffing.start}
          disabled={sniffing.isLoading}
          className="flex min-h-8 shrink-0 items-center justify-between rounded-xl border border-white/10 bg-white/[0.06] px-2 text-[10px] text-white/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          aria-label={sniffing.isRunning ? "Stop network capture" : "Start network capture"}
        >
          <span>MapCN Globe</span>
          <span className={sniffing.isRunning ? "text-emerald-300" : "text-white/45"}>
            {sniffing.isRunning ? "Live" : "Start"}
          </span>
        </button>
      )}

      <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-slate-950/50">
        <GlobeCanvas
          connections={connections}
          maxConnections={runtimeConfig.maxConnections}
          showConnectionInfo={runtimeConfig.showConnectionInfo && !micro}
          lineGlow={runtimeConfig.lineGlow}
          rotationSpeed={effectiveRotationSpeed}
        />
      </div>

      {showStats && (
        <div className={`grid shrink-0 ${viewport.width >= 520 ? "grid-cols-3" : "grid-cols-2"} gap-1.5 text-xs text-white/70`}>
          <div className="flex min-w-0 items-center gap-2 rounded-xl border border-white/8 bg-white/[0.05] px-2.5 py-1.5">
            <ArrowDownRight className="h-4 w-4 shrink-0 text-cyan-300" aria-hidden="true" />
            <div className="min-w-0">
              {!compact && <div className="text-[9px] uppercase text-white/40">Download</div>}
              <div className="truncate text-[11px] text-white">{formatSpeed(summary.downloadSpeed)}</div>
            </div>
          </div>
          <div className="flex min-w-0 items-center gap-2 rounded-xl border border-white/8 bg-white/[0.05] px-2.5 py-1.5">
            <ArrowUpRight className="h-4 w-4 shrink-0 text-fuchsia-300" aria-hidden="true" />
            <div className="min-w-0">
              {!compact && <div className="text-[9px] uppercase text-white/40">Upload</div>}
              <div className="truncate text-[11px] text-white">{formatSpeed(summary.uploadSpeed)}</div>
            </div>
          </div>
          <div className={`flex items-center justify-between rounded-xl border border-white/8 bg-white/[0.05] px-2.5 py-1.5 ${viewport.width < 520 ? "col-span-2" : ""}`}>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-300" aria-hidden="true" />
              {!compact && <span className="text-[9px] uppercase text-white/40">Connections</span>}
            </div>
            <span className="text-[11px] text-white">{summary.totalConnections}</span>
          </div>
        </div>
      )}

      {showLegend && (
        <p className="shrink-0 truncate text-[10px] text-white/40">
          Neon arcs show active flows. Hover an arc to view transfer totals.
        </p>
      )}

      <Configuration
        isOpen={isConfigOpen}
        title="3D Globe"
        description="Adjust globe rendering and telemetry overlays."
        onClose={() => setIsConfigOpen(false)}
      >
        <ToggleRow label="Show Stats" value={runtimeConfig.showStats} onChange={(value) => updateConfig({ showStats: value })} />
        <ToggleRow label="Show Legend" value={runtimeConfig.showLegend} onChange={(value) => updateConfig({ showLegend: value })} />
        <ToggleRow label="Show Hover Info" value={runtimeConfig.showConnectionInfo} onChange={(value) => updateConfig({ showConnectionInfo: value })} />
        <RangeRow label="Max Connections" value={runtimeConfig.maxConnections} min={10} max={500} step={10} onChange={(value) => updateConfig({ maxConnections: value })} />
        <RangeRow label="Line Glow" value={Math.round(runtimeConfig.lineGlow * 100)} min={0} max={100} step={5} onChange={(value) => updateConfig({ lineGlow: value / 100 })} />
        <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70">
          <div className="text-[10px] uppercase text-white/40">Rotation Speed</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {(["slow", "medium", "fast"] as const).map((speed) => (
              <button
                key={speed}
                type="button"
                onClick={() => updateConfig({ rotationSpeed: speed })}
                className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-wide focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                  runtimeConfig.rotationSpeed === speed
                    ? "bg-cyan-500 text-white"
                    : "bg-white/10 text-white/60"
                }`}
              >
                {speed}
              </button>
            ))}
          </div>
        </div>
      </Configuration>

      <Toast message={error} onDismiss={() => setError(null)} />
    </div>
  );
}
