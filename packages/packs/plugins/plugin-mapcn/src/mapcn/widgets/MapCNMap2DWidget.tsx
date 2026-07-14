import { useMemo, useState } from "react";
import { Activity, ArrowDownRight, ArrowUpRight } from "lucide-react";

import { Toast } from "@fancydashboard/sdk/components/Toast";
import { usePluginContext } from "@fancydashboard/sdk/plugins/PluginContext";

import type { MapCNMap2DConfig } from "../MapCN.config";
import { RangeRow, ToggleRow } from "../components/ConfigControls";
import { Configuration } from "../components/Configuration";
import { MapCanvas2D } from "../components/MapCanvas2D";
import { WidgetHeader } from "../components/WidgetHeader";
import { useMapCNStore } from "../hooks/useMapCNStore";
import { useNetworkSniffing } from "../hooks/useNetworkSniffing";
import { formatSpeed } from "../utils";

export function MapCNMap2DWidget() {
  const { config, setConfig } = usePluginContext();
  const runtimeConfig = config as MapCNMap2DConfig;
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const sniffing = useNetworkSniffing();
  const connections = useMapCNStore((state) => state.connections);
  const history = useMapCNStore((state) => state.history);
  const error = useMapCNStore((state) => state.error);
  const setError = useMapCNStore((state) => state.setError);

  const latestEntry = history[history.length - 1];

  const updateConfig = (patch: Partial<MapCNMap2DConfig>) => {
    setConfig({ ...runtimeConfig, ...patch });
  };

  const summary = useMemo(() => {
    const totalConnections = connections.length;
    return {
      totalConnections,
      downloadSpeed: latestEntry?.downloadSpeed ?? 0,
      uploadSpeed: latestEntry?.uploadSpeed ?? 0,
    };
  }, [
    connections.length,
    latestEntry?.downloadSpeed,
    latestEntry?.uploadSpeed,
  ]);

  return (
    <div className="relative w-full h-full flex flex-col gap-3 p-4 bg-linear-to-br from-slate-950 via-slate-900 to-black rounded-2xl border border-white/10 overflow-hidden">
      <WidgetHeader
        title="MapCN 2D"
        subtitle="Lite World Map"
        isRunning={sniffing.isRunning}
        isLoading={sniffing.isLoading}
        onToggle={sniffing.isRunning ? sniffing.stop : sniffing.start}
        onOpenConfig={() => setIsConfigOpen(true)}
      />

      <div className="flex-1 min-h-0 rounded-2xl border border-white/10 bg-slate-950/50 overflow-hidden">
        <MapCanvas2D
          connections={connections}
          maxConnections={runtimeConfig.maxConnections}
          showConnectionInfo={runtimeConfig.showConnectionInfo}
          lineGlow={runtimeConfig.lineGlow}
        />
      </div>

      {runtimeConfig.showStats ? (
        <div className="grid grid-cols-2 gap-2 text-xs text-white/70">
          <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
            <ArrowDownRight className="w-4 h-4 text-cyan-300" />
            <div>
              <div className="text-[10px] uppercase text-white/40">
                Download
              </div>
              <div className="text-sm text-white">
                {formatSpeed(summary.downloadSpeed)}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
            <ArrowUpRight className="w-4 h-4 text-fuchsia-300" />
            <div>
              <div className="text-[10px] uppercase text-white/40">Upload</div>
              <div className="text-sm text-white">
                {formatSpeed(summary.uploadSpeed)}
              </div>
            </div>
          </div>
          <div className="col-span-2 flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-300" />
              <span className="text-[10px] uppercase text-white/40">
                Connections
              </span>
            </div>
            <span className="text-sm text-white">
              {summary.totalConnections}
            </span>
          </div>
        </div>
      ) : null}

      {runtimeConfig.showLegend ? (
        <div className="text-[10px] text-white/40">
          Neon lines represent live destinations. Hover a line to inspect
          transfer stats.
        </div>
      ) : null}

      <Configuration
        isOpen={isConfigOpen}
        title="2D Map"
        description="Control the 2D map widget behaviour."
        onClose={() => setIsConfigOpen(false)}
      >
        <ToggleRow
          label="Show Stats"
          value={runtimeConfig.showStats}
          onChange={(value) => updateConfig({ showStats: value })}
        />
        <ToggleRow
          label="Show Legend"
          value={runtimeConfig.showLegend}
          onChange={(value) => updateConfig({ showLegend: value })}
        />
        <ToggleRow
          label="Show Hover Info"
          value={runtimeConfig.showConnectionInfo}
          onChange={(value) => updateConfig({ showConnectionInfo: value })}
        />
        <RangeRow
          label="Max Connections"
          value={runtimeConfig.maxConnections}
          min={10}
          max={500}
          step={10}
          accentClassName="accent-cyan-400"
          onChange={(value) => updateConfig({ maxConnections: value })}
        />
        <RangeRow
          label="Line Glow"
          value={Math.round(runtimeConfig.lineGlow * 100)}
          min={0}
          max={100}
          step={5}
          accentClassName="accent-cyan-400"
          onChange={(value) => updateConfig({ lineGlow: value / 100 })}
        />
      </Configuration>

      <Toast message={error} onDismiss={() => setError(null)} />
    </div>
  );
}
