import "./chunk-R5U7XKVJ.js";

// src/module/PCMonitor.tsx
import { useState, useEffect, useRef } from "react";
import { Cpu, Thermometer, Activity, MemoryStick, AlertTriangle, RefreshCw } from "lucide-react";
import { usePluginContext } from "@fancydashboard/sdk/plugins/PluginContext";
import {
  BridgeLogger,
  subscribeToBridgeEvent,
  SystemActions
} from "@fancydashboard/sdk/bridge";
import { jsx, jsxs } from "react/jsx-runtime";
function StatCard({
  icon,
  label,
  value,
  percentage,
  temperature,
  showTemp,
  color
}) {
  const getColorClass = (pct) => {
    if (pct >= 90) return "bg-red-500";
    if (pct >= 70) return "bg-yellow-500";
    return color;
  };
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2 p-3 bg-white/5 rounded-lg border border-white/10", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("div", { className: `p-1.5 rounded-md ${color}/20`, children: icon }),
        /* @__PURE__ */ jsx("span", { className: "text-xs font-medium text-white/70", children: label })
      ] }),
      showTemp && temperature !== void 0 && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 text-[10px] text-white/50", children: [
        /* @__PURE__ */ jsx(Thermometer, { className: "w-3 h-3" }),
        /* @__PURE__ */ jsxs("span", { children: [
          temperature,
          "\xB0C"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-2", children: [
      /* @__PURE__ */ jsxs("span", { className: "text-2xl font-bold text-white flex items-center", children: [
        percentage,
        "%",
        percentage >= 90 && /* @__PURE__ */ jsx(AlertTriangle, { className: "w-4 h-4 text-red-500 animate-pulse ml-2" })
      ] }),
      /* @__PURE__ */ jsx("span", { className: "text-xs text-white/40", children: value })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "h-1.5 bg-white/10 rounded-full overflow-hidden", children: /* @__PURE__ */ jsx(
      "div",
      {
        className: `h-full rounded-full transition-all duration-500 ${getColorClass(percentage)}`,
        style: { width: `${percentage}%` }
      }
    ) })
  ] });
}
function PCMonitor(_props) {
  const context = usePluginContext();
  const config = context.config;
  const [stats, setStats] = useState(null);
  const [specs, setSpecs] = useState(null);
  const [connectionTimeout, setConnectionTimeout] = useState(false);
  const lastUpdateAtRef = useRef(0);
  useEffect(() => {
    const fetchSpecs = async () => {
      try {
        const specsResponse = await SystemActions.getSpecs.invoke();
        if (specsResponse.success && specsResponse.data) {
          const data = specsResponse.data;
          const systemSpecs = {
            host: data.host,
            os_version: data.osVersion,
            cpu_brand: data.cpuBrand,
            physical_cores: data.physicalCores,
            total_memory: data.totalMemory
          };
          setSpecs(systemSpecs);
          context.logger.info("System specs loaded", {
            cpu: systemSpecs.cpu_brand,
            cores: systemSpecs.physical_cores
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
          total_memory: 0
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
    }, 5e3);
    return () => clearTimeout(timer);
  }, [stats]);
  useEffect(() => {
    context.logger.info("Starting PC monitoring", {
      type: config.monitorType
    });
    const setupListener = async () => {
      try {
        const subscription = await subscribeToBridgeEvent(
          "telemetry://metrics",
          (payload) => {
            const now = Date.now();
            if (config.refreshInterval > 0) {
              const delta = now - lastUpdateAtRef.current;
              if (delta < config.refreshInterval) return;
            }
            lastUpdateAtRef.current = now;
            const cpuTemp = payload.temperatures.find(
              (t) => t.label.toLowerCase().includes("cpu") || t.label.toLowerCase().includes("core") || t.label.toLowerCase().includes("package")
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
                cores: specs?.physical_cores ?? 0
              },
              ram: {
                used: ramUsedGB,
                total: ramTotalGB,
                percentage: ramTotalGB > 0 ? Math.round(ramUsedGB / ramTotalGB * 100) : 0
              }
            });
          }
        );
        return subscription.unsubscribe;
      } catch (error) {
        context.logger.error("Failed to setup telemetry listener", error);
        return void 0;
      }
    };
    let unlistenFn;
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
      return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center h-full w-full bg-black/50 rounded-lg gap-3", children: [
        /* @__PURE__ */ jsx(AlertTriangle, { className: "w-6 h-6 text-red-400" }),
        /* @__PURE__ */ jsx("span", { className: "text-xs text-white/70", children: "Connection Failed" }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => window.location.reload(),
            className: "flex items-center gap-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-md text-xs text-white transition-colors",
            children: [
              /* @__PURE__ */ jsx(RefreshCw, { className: "w-3 h-3" }),
              " Retry"
            ]
          }
        )
      ] });
    }
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-full w-full bg-black/50 rounded-lg", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-2", children: [
      /* @__PURE__ */ jsx(Activity, { className: "w-6 h-6 text-white/30 animate-pulse" }),
      /* @__PURE__ */ jsx("span", { className: "text-xs text-white/50", children: "Connecting..." })
    ] }) });
  }
  const showCPU = config.monitorType === "all" || config.monitorType === "cpu";
  const showRAM = config.monitorType === "all" || config.monitorType === "ram";
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col h-full w-full p-3 bg-black/50 backdrop-blur-md rounded-lg overflow-hidden", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Activity, { className: "w-4 h-4 text-green-400" }),
        /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-white/80", children: "System Monitor" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsx("div", { className: "w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" }),
        /* @__PURE__ */ jsx("span", { className: "text-[10px] text-white/40", children: "Live" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 grid gap-2 auto-rows-fr", children: [
      showCPU && /* @__PURE__ */ jsx(
        StatCard,
        {
          icon: /* @__PURE__ */ jsx(Cpu, { className: "w-4 h-4 text-blue-400" }),
          label: "CPU",
          value: stats.cpu.cores > 0 ? `${stats.cpu.cores} cores` : stats.cpu.name.split(" ").pop() ?? "",
          percentage: stats.cpu.usage,
          temperature: stats.cpu.temperature,
          showTemp: config.showTemperature && stats.cpu.temperature > 0,
          color: "bg-blue-500"
        }
      ),
      showRAM && /* @__PURE__ */ jsx(
        StatCard,
        {
          icon: /* @__PURE__ */ jsx(MemoryStick, { className: "w-4 h-4 text-purple-400" }),
          label: "RAM",
          value: `${stats.ram.used}/${stats.ram.total} GB`,
          percentage: stats.ram.percentage,
          showTemp: false,
          color: "bg-purple-500"
        }
      )
    ] })
  ] });
}
export {
  PCMonitor as default
};
