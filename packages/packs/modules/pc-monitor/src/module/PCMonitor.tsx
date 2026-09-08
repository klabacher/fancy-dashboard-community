import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Cpu,
  Thermometer,
  Activity,
  MemoryStick,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import type { WidgetRuntimeProps } from "@fancydashboard/sdk/plugins/types";
import { usePluginContext } from "@fancydashboard/sdk/plugins/PluginContext";
import { useWidgetViewport } from "@fancydashboard/sdk/components/WidgetViewport";
import {
  BridgeLogger,
  subscribeToBridgeEvent,
  SystemActions,
} from "@fancydashboard/sdk/bridge";
import type { PCMonitorConfig } from "./PCMonitor.config";

interface TemperatureProbe {
  label: string;
  temperature: number;
}

interface TelemetryPayload {
  cpu_usage: number;
  memory_used: number;
  memory_total: number;
  temperatures: TemperatureProbe[];
}

interface SystemSpecs {
  host: string;
  os_version: string;
  cpu_brand: string;
  physical_cores: number | null;
  total_memory: number;
}

interface SystemStats {
  cpu: {
    usage: number;
    temperature: number;
    name: string;
    cores: number;
  };
  ram: {
    used: number;
    total: number;
    percentage: number;
  };
}

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  percentage: number;
  temperature?: number;
  showTemp: boolean;
  color: string;
  compact: boolean;
  micro: boolean;
  reducedMotion: boolean;
}

function StatCard({
  icon,
  label,
  value,
  percentage,
  temperature,
  showTemp,
  color,
  compact,
  micro,
  reducedMotion,
}: StatCardProps) {
  const getColorClass = (pct: number) => {
    if (pct >= 90) return "bg-red-500";
    if (pct >= 70) return "bg-yellow-500";
    return color;
  };

  return (
    <div
      className={`flex min-h-0 flex-col justify-between border border-white/10 bg-white/[0.055] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl ${
        micro ? "gap-1 rounded-xl p-2" : compact ? "gap-1.5 rounded-2xl p-2.5" : "gap-2 rounded-2xl p-3"
      }`}
    >
      <div className="flex min-w-0 items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <div className={`shrink-0 rounded-lg p-1.5 ${color}/20`}>{icon}</div>
          <span className="truncate text-[clamp(0.65rem,4cqw,0.78rem)] font-medium text-white/70">
            {label}
          </span>
        </div>
        {!micro && showTemp && temperature !== undefined && (
          <div className="flex shrink-0 items-center gap-1 text-[10px] text-white/50">
            <Thermometer className="h-3 w-3" aria-hidden="true" />
            <span>{temperature}°C</span>
          </div>
        )}
      </div>

      <div className="flex min-w-0 items-baseline gap-2">
        <span className="flex shrink-0 items-center text-[clamp(1rem,10cqw,1.65rem)] font-bold leading-none text-white">
          {percentage}%
          {percentage >= 90 && !micro && (
            <AlertTriangle
              className={`ml-1.5 h-3.5 w-3.5 text-red-400 ${reducedMotion ? "" : "animate-pulse"}`}
              aria-label="High usage"
            />
          )}
        </span>
        {!compact && (
          <span className="min-w-0 truncate text-[10px] text-white/40">{value}</span>
        )}
      </div>

      <div className={`${micro ? "h-1" : "h-1.5"} overflow-hidden rounded-full bg-white/10`}>
        <div
          className={`h-full rounded-full ${getColorClass(percentage)} ${
            reducedMotion ? "" : "transition-[width] duration-500 ease-out"
          }`}
          style={{ width: `${Math.max(0, Math.min(100, percentage))}%` }}
        />
      </div>
    </div>
  );
}

export default function PCMonitor(_props: WidgetRuntimeProps) {
  const context = usePluginContext();
  const viewport = useWidgetViewport();
  const config = context.config as unknown as PCMonitorConfig;
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [specs, setSpecs] = useState<SystemSpecs | null>(null);
  const [connectionTimeout, setConnectionTimeout] = useState(false);
  const lastUpdateAtRef = useRef<number>(0);

  const micro = viewport.size === "micro";
  const compact = micro || viewport.size === "compact" || viewport.isShort;
  const showHeader = !micro;

  useEffect(() => {
    const fetchSpecs = async () => {
      try {
        const specsResponse = await SystemActions.getSpecs.invoke(
          undefined,
          "pc-monitor"
        );
        if (specsResponse.success && specsResponse.data) {
          const data = specsResponse.data;
          const systemSpecs: SystemSpecs = {
            host: data.host,
            os_version: data.osVersion,
            cpu_brand: data.cpuBrand,
            physical_cores: data.physicalCores,
            total_memory: data.totalMemory,
          };
          setSpecs(systemSpecs);
          context.logger.info("System specs loaded", {
            cpu: systemSpecs.cpu_brand,
            cores: systemSpecs.physical_cores,
          });
          return;
        }
        throw new Error(specsResponse.error?.message ?? "Failed to load specs");
      } catch (error) {
        context.logger.error("Failed to get system specs", error);
        BridgeLogger.error(
          "pc-monitor",
          "get_specs",
          error instanceof Error ? error.message : "Failed to get system specs"
        );
        setSpecs({
          host: "Unknown",
          os_version: "Unknown",
          cpu_brand: "CPU",
          physical_cores: null,
          total_memory: 0,
        });
      }
    };

    fetchSpecs();
  }, [context.logger]);

  useEffect(() => {
    if (stats) {
      setConnectionTimeout(false);
      return;
    }
    const timer = setTimeout(() => {
      if (!stats) setConnectionTimeout(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, [stats]);

  useEffect(() => {
    context.logger.info("Starting PC monitoring", {
      type: config.monitorType,
    });

    const setupListener = async () => {
      try {
        const subscription = await subscribeToBridgeEvent<TelemetryPayload>(
          "telemetry://metrics",
          (payload) => {
            const now = Date.now();
            if (config.refreshInterval > 0) {
              const delta = now - lastUpdateAtRef.current;
              if (delta < config.refreshInterval) return;
            }
            lastUpdateAtRef.current = now;

            const cpuTemp =
              payload.temperatures.find(
                (t) =>
                  t.label.toLowerCase().includes("cpu") ||
                  t.label.toLowerCase().includes("core") ||
                  t.label.toLowerCase().includes("package")
              )?.temperature ?? 0;

            const ramUsedGB = Math.round(
              payload.memory_used / 1024 / 1024 / 1024
            );
            const ramTotalGB = Math.round(
              payload.memory_total / 1024 / 1024 / 1024
            );

            setStats({
              cpu: {
                usage: Math.round(payload.cpu_usage),
                temperature: Math.round(cpuTemp),
                name: specs?.cpu_brand ?? "CPU",
                cores: specs?.physical_cores ?? 0,
              },
              ram: {
                used: ramUsedGB,
                total: ramTotalGB,
                percentage:
                  ramTotalGB > 0
                    ? Math.round((ramUsedGB / ramTotalGB) * 100)
                    : 0,
              },
            });
          },
          "pc-monitor",
          "system:telemetry"
        );

        return subscription.unsubscribe;
      } catch (error) {
        context.logger.error("Failed to setup telemetry listener", error);
        return undefined;
      }
    };

    let unlistenFn: (() => void) | undefined;
    setupListener().then((fn) => {
      unlistenFn = fn;
    });

    return () => {
      unlistenFn?.();
      context.logger.info("Stopped PC monitoring");
    };
  }, [config.monitorType, config.refreshInterval, context.logger, specs]);

  const shellClass = `h-full w-full overflow-hidden border border-white/10 bg-black/45 shadow-[0_18px_55px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-2xl ${
    micro ? "rounded-xl p-1.5" : compact ? "rounded-2xl p-2" : "rounded-3xl p-3"
  }`;

  if (!stats) {
    if (connectionTimeout) {
      return (
        <div className={`${shellClass} flex flex-col items-center justify-center gap-2 text-center`}>
          <AlertTriangle className="h-5 w-5 text-red-400" aria-hidden="true" />
          {!micro && <span className="text-xs text-white/70">Connection failed</span>}
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="flex min-h-8 items-center gap-1 rounded-xl border border-white/10 bg-white/10 px-2.5 py-1 text-xs text-white transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            aria-label="Retry PC monitor connection"
          >
            <RefreshCw className="h-3 w-3" aria-hidden="true" />
            {!micro && "Retry"}
          </button>
        </div>
      );
    }
    return (
      <div className={`${shellClass} flex items-center justify-center`}>
        <div className="flex flex-col items-center gap-2">
          <Activity
            className={`h-5 w-5 text-white/30 ${viewport.reducedMotion ? "" : "animate-pulse"}`}
            aria-hidden="true"
          />
          {!micro && <span className="text-xs text-white/50">Connecting…</span>}
        </div>
      </div>
    );
  }

  const showCPU = config.monitorType === "all" || config.monitorType === "cpu";
  const showRAM = config.monitorType === "all" || config.monitorType === "ram";
  const bothVisible = showCPU && showRAM;
  const twoColumns = bothVisible && viewport.width >= 360 && viewport.height < 270;

  return (
    <div className={`${shellClass} flex flex-col`}>
      {showHeader && (
        <div className={`flex items-center justify-between ${compact ? "mb-2" : "mb-3"}`}>
          <div className="flex min-w-0 items-center gap-2">
            <Activity className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
            <span className="truncate text-xs font-semibold text-white/80">System Monitor</span>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <div
              className={`h-1.5 w-1.5 rounded-full bg-emerald-400 ${
                viewport.reducedMotion ? "" : "animate-pulse"
              }`}
            />
            {!compact && <span className="text-[10px] text-white/40">Live</span>}
          </div>
        </div>
      )}

      <div
        className={`grid min-h-0 flex-1 auto-rows-fr gap-1.5 ${twoColumns ? "grid-cols-2" : "grid-cols-1"}`}
      >
        {showCPU && (
          <StatCard
            icon={<Cpu className="h-4 w-4 text-blue-300" />}
            label="CPU"
            value={
              stats.cpu.cores > 0
                ? `${stats.cpu.cores} cores`
                : (stats.cpu.name.split(" ").pop() ?? "")
            }
            percentage={stats.cpu.usage}
            temperature={stats.cpu.temperature}
            showTemp={config.showTemperature && stats.cpu.temperature > 0}
            color="bg-blue-500"
            compact={compact}
            micro={micro}
            reducedMotion={viewport.reducedMotion}
          />
        )}

        {showRAM && (
          <StatCard
            icon={<MemoryStick className="h-4 w-4 text-violet-300" />}
            label="RAM"
            value={`${stats.ram.used}/${stats.ram.total} GB`}
            percentage={stats.ram.percentage}
            showTemp={false}
            color="bg-violet-500"
            compact={compact}
            micro={micro}
            reducedMotion={viewport.reducedMotion}
          />
        )}
      </div>
    </div>
  );
}
