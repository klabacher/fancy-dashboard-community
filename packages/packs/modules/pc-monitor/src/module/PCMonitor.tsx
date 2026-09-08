import { useState, useEffect, useRef } from "react";
import { Cpu, Thermometer, Activity, MemoryStick, AlertTriangle, RefreshCw } from "lucide-react";
import type { WidgetRuntimeProps } from "@fancydashboard/sdk/plugins/types";
import { usePluginContext } from "@fancydashboard/sdk/plugins/PluginContext";
import {
  BridgeLogger,
  subscribeToBridgeEvent,
  SystemActions,
} from "@fancydashboard/sdk/bridge";
import type { PCMonitorConfig } from "./PCMonitor.config";

// ============================================================================
// Types (matching Rust TelemetryPayload and Specs)
// ============================================================================

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

// ============================================================================
// Sub-components
// ============================================================================

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  percentage: number;
  temperature?: number;
  showTemp: boolean;
  color: string;
}

function StatCard({
  icon,
  label,
  value,
  percentage,
  temperature,
  showTemp,
  color,
}: StatCardProps) {
  const getColorClass = (pct: number) => {
    if (pct >= 90) return "bg-red-500";
    if (pct >= 70) return "bg-yellow-500";
    return color;
  };

  return (
    <div className="flex flex-col gap-2 p-3 bg-white/5 rounded-lg border border-white/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-md ${color}/20`}>{icon}</div>
          <span className="text-xs font-medium text-white/70">{label}</span>
        </div>
        {showTemp && temperature !== undefined && (
          <div className="flex items-center gap-1 text-[10px] text-white/50">
            <Thermometer className="w-3 h-3" />
            <span>{temperature}°C</span>
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-white flex items-center">
          {percentage}%
          {percentage >= 90 && (
            <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse ml-2" />
          )}
        </span>
        <span className="text-xs text-white/40">{value}</span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${getColorClass(percentage)}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function PCMonitor(_props: WidgetRuntimeProps) {
  const context = usePluginContext();
  const config = context.config as unknown as PCMonitorConfig;
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [specs, setSpecs] = useState<SystemSpecs | null>(null);
  const [connectionTimeout, setConnectionTimeout] = useState(false);
  const lastUpdateAtRef = useRef<number>(0);

  // Fetch system specs once on mount
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
        // Fallback specs
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

  // Subscribe to telemetry events from Tauri backend
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

            // Throttle updates to honor refreshInterval
            // (Telemetry events may arrive faster than desired.)
            if (config.refreshInterval > 0) {
              const delta = now - lastUpdateAtRef.current;
              if (delta < config.refreshInterval) return;
            }
            lastUpdateAtRef.current = now;

            // Find CPU temperature from temperature probes
            const cpuTemp =
              payload.temperatures.find(
                (t) =>
                  t.label.toLowerCase().includes("cpu") ||
                  t.label.toLowerCase().includes("core") ||
                  t.label.toLowerCase().includes("package")
              )?.temperature ?? 0;

            // Convert bytes to GB
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
      if (unlistenFn) {
        unlistenFn();
      }
      context.logger.info("Stopped PC monitoring");
    };
  }, [config.monitorType, config.refreshInterval, context.logger, specs]);

  if (!stats) {
    if (connectionTimeout) {
      return (
        <div className="flex flex-col items-center justify-center h-full w-full bg-black/50 rounded-lg gap-3">
          <AlertTriangle className="w-6 h-6 text-red-400" />
          <span className="text-xs text-white/70">Connection Failed</span>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-md text-xs text-white transition-colors"
          >
            <RefreshCw className="w-3 h-3" /> Retry
          </button>
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center h-full w-full bg-black/50 rounded-lg">
        <div className="flex flex-col items-center gap-2">
          <Activity className="w-6 h-6 text-white/30 animate-pulse" />
          <span className="text-xs text-white/50">Connecting...</span>
        </div>
      </div>
    );
  }

  const showCPU = config.monitorType === "all" || config.monitorType === "cpu";
  const showRAM = config.monitorType === "all" || config.monitorType === "ram";

  return (
    <div className="flex flex-col h-full w-full p-3 bg-black/50 backdrop-blur-md rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-green-400" />
          <span className="text-xs font-semibold text-white/80">
            System Monitor
          </span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] text-white/40">Live</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="flex-1 grid gap-2 auto-rows-fr">
        {showCPU && (
          <StatCard
            icon={<Cpu className="w-4 h-4 text-blue-400" />}
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
          />
        )}

        {showRAM && (
          <StatCard
            icon={<MemoryStick className="w-4 h-4 text-purple-400" />}
            label="RAM"
            value={`${stats.ram.used}/${stats.ram.total} GB`}
            percentage={stats.ram.percentage}
            showTemp={false}
            color="bg-purple-500"
          />
        )}
      </div>
    </div>
  );
}
