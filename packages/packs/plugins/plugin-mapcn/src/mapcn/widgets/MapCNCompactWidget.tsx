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
}

function ToggleRow({ label, value, onChange }: ToggleRowProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="flex items-center justify-between w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 hover:bg-white/10"
    >
      <span>{label}</span>
      <span
        className={`inline-flex h-5 w-9 items-center rounded-full border border-white/10 p-0.5 transition ${
          value ? "bg-emerald-400/80" : "bg-white/10"
        }`}
      >
        <span
          className={`h-3.5 w-3.5 rounded-full bg-white transition ${
            value ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </span>
    </button>
  );
}

export function MapCNCompactWidget() {
  const { config, setConfig } = usePluginContext();
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
    if (!sniffing.isRunning) return false;
    if (!lastSeenAt) return false;
    return Date.now() - lastSeenAt < 15000;
  }, [lastSeenAt, sniffing.isRunning]);

  const updateConfig = (patch: Partial<MapCNCompactConfig>) => {
    setConfig({ ...runtimeConfig, ...patch });
  };

  const layoutClass =
    runtimeConfig.layout === "inline"
      ? "flex-row"
      : runtimeConfig.layout === "stacked"
        ? "flex-col"
        : "flex-col md:flex-row";
  const accentClass =
    runtimeConfig.accent === "neon" ? "text-cyan-300" : "text-white/70";

  return (
    <div className="relative w-full h-full flex flex-col gap-3 p-3 bg-linear-to-br from-slate-950 via-slate-900 to-black rounded-xl border border-white/10 overflow-hidden">
      <WidgetHeader
        title="Network Status"
        subtitle="Compact Live Telemetry"
        isRunning={sniffing.isRunning}
        isLoading={sniffing.isLoading}
        onToggle={sniffing.isRunning ? sniffing.stop : sniffing.start}
        onOpenConfig={() => setIsConfigOpen(true)}
        size="compact"
      />

      <div className={`flex-1 flex ${layoutClass} flex-wrap gap-2`}>
        {runtimeConfig.showConnectionType ? (
          <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 min-w-0">
            {interfaceType === "wifi" ? (
              <Wifi className={`w-4 h-4 ${accentClass}`} />
            ) : interfaceType === "ethernet" ? (
              <Cable className={`w-4 h-4 ${accentClass}`} />
            ) : (
              <CircleOff className="w-4 h-4 text-white/50" />
            )}
            <div className="text-xs text-white/70">
              {interfaceType === "wifi"
                ? "Wi‑Fi"
                : interfaceType === "ethernet"
                  ? "Ethernet"
                  : "Offline"}
            </div>
          </div>
        ) : null}

        {runtimeConfig.showInterface ? (
          <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 min-w-0">
            <div className="text-xs text-white/60">Device</div>
            <div className="text-xs text-white truncate">
              {status?.deviceName ?? "-"}
            </div>
          </div>
        ) : null}

        {runtimeConfig.showStatus ? (
          <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 min-w-0">
            <Activity
              className={`w-4 h-4 ${isOnline ? "text-emerald-400" : "text-red-400"}`}
            />
            <div className="text-xs text-white/70">
              {isOnline ? "Online" : "Offline"}
            </div>
          </div>
        ) : null}

        {runtimeConfig.showSpeed ? (
          <div className="flex flex-col gap-1 rounded-lg bg-white/5 px-3 py-2 min-w-0">
            <div className="flex items-center justify-between text-xs text-white/60">
              <span>Down</span>
              <span className="text-white">
                {formatSpeed(latestEntry?.downloadSpeed ?? 0)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-white/60">
              <span>Up</span>
              <span className="text-white">
                {formatSpeed(latestEntry?.uploadSpeed ?? 0)}
              </span>
            </div>
          </div>
        ) : null}

        {runtimeConfig.showPackets ? (
          <div className="flex flex-col gap-1 rounded-lg bg-white/5 px-3 py-2 min-w-0">
            <div className="flex items-center justify-between text-xs text-white/60">
              <span>Packets In</span>
              <span className="text-white">{latestEntry?.packetsIn ?? 0}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-white/60">
              <span>Packets Out</span>
              <span className="text-white">{latestEntry?.packetsOut ?? 0}</span>
            </div>
          </div>
        ) : null}

        {runtimeConfig.showBytes ? (
          <div className="flex flex-col gap-1 rounded-lg bg-white/5 px-3 py-2 min-w-0">
            <div className="flex items-center justify-between text-xs text-white/60">
              <span>Bytes In</span>
              <span className="text-white">
                {formatBytes(latestEntry?.bytesIn ?? 0)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-white/60">
              <span>Bytes Out</span>
              <span className="text-white">
                {formatBytes(latestEntry?.bytesOut ?? 0)}
              </span>
            </div>
          </div>
        ) : null}

        {runtimeConfig.showLastSeen ? (
          <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 min-w-0">
            <Timer className="w-4 h-4 text-white/60" />
            <div className="text-xs text-white/70">
              Last active: {formatDateTime(lastSeenAt)}
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex items-center justify-between text-[10px] text-white/40">
        <div className="flex items-center gap-1">
          <ArrowDownRight className="w-3 h-3" />
          {(latestEntry?.downloadSpeed ?? 0).toFixed(0)}
        </div>
        <div className="flex items-center gap-1">
          <ArrowUpRight className="w-3 h-3" />
          {(latestEntry?.uploadSpeed ?? 0).toFixed(0)}
        </div>
      </div>

      <Configuration
        isOpen={isConfigOpen}
        title="Compact Widget"
        description="Customize the compact telemetry card."
        onClose={() => setIsConfigOpen(false)}
      >
        <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70">
          <div className="text-[10px] uppercase text-white/40">Layout</div>
          <div className="flex gap-2 mt-2">
            {(["auto", "inline", "stacked"] as const).map((layout) => (
              <button
                key={layout}
                type="button"
                onClick={() => updateConfig({ layout })}
                className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-wide ${
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
        <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70">
          <div className="text-[10px] uppercase text-white/40">Accent</div>
          <div className="flex gap-2 mt-2">
            {(["neon", "soft"] as const).map((accent) => (
              <button
                key={accent}
                type="button"
                onClick={() => updateConfig({ accent })}
                className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-wide ${
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
        <ToggleRow
          label="Show Connection Type"
          value={runtimeConfig.showConnectionType}
          onChange={(value) => updateConfig({ showConnectionType: value })}
        />
        <ToggleRow
          label="Show Device Name"
          value={runtimeConfig.showInterface}
          onChange={(value) => updateConfig({ showInterface: value })}
        />
        <ToggleRow
          label="Show Online Status"
          value={runtimeConfig.showStatus}
          onChange={(value) => updateConfig({ showStatus: value })}
        />
        <ToggleRow
          label="Show Speed"
          value={runtimeConfig.showSpeed}
          onChange={(value) => updateConfig({ showSpeed: value })}
        />
        <ToggleRow
          label="Show Packets"
          value={runtimeConfig.showPackets}
          onChange={(value) => updateConfig({ showPackets: value })}
        />
        <ToggleRow
          label="Show Bytes"
          value={runtimeConfig.showBytes}
          onChange={(value) => updateConfig({ showBytes: value })}
        />
        <ToggleRow
          label="Show Last Seen"
          value={runtimeConfig.showLastSeen}
          onChange={(value) => updateConfig({ showLastSeen: value })}
        />
      </Configuration>

      <Toast message={error} onDismiss={() => setError(null)} />
    </div>
  );
}
