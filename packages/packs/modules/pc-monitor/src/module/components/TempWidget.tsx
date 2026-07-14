// ============================================================================
// Temperature Widget Component - System Temperature Monitor
// ============================================================================

import { Thermometer, Flame } from "lucide-react";
import { motion } from "framer-motion";
import type { TempStats } from "../types";
import { Sparkline } from "./Sparkline";

interface TempWidgetProps {
  stats: TempStats | null;
  showAllProbes?: boolean;
  showSparkline?: boolean;
}

export function TempWidget({
  stats,
  showAllProbes = false,
  showSparkline = true,
}: TempWidgetProps) {
  if (!stats || stats.probes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-black/20 rounded-lg gap-1">
        <Thermometer className="w-5 h-5 text-white/30" />
        <span className="text-[10px] text-white/30">No sensors</span>
      </div>
    );
  }

  const getTempColor = (temp: number) => {
    if (temp >= 80) return "text-red-400";
    if (temp >= 60) return "text-yellow-400";
    return "text-cyan-400";
  };

  const getTempBgColor = (temp: number) => {
    if (temp >= 80) return "bg-red-500";
    if (temp >= 60) return "bg-yellow-500";
    return "bg-cyan-500";
  };

  // Get top 4 temperature probes
  const displayProbes = showAllProbes ? stats.probes : stats.probes.slice(0, 4);

  return (
    <div className="flex flex-col h-full w-full p-3 bg-black/30 backdrop-blur-md rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-cyan-500/20">
            <Thermometer className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="text-xs font-semibold text-white/80">
            Temperatures
          </span>
        </div>
        {stats.maxTemp > 0 && (
          <div className="flex items-center gap-1">
            <Flame
              className={`w-3 h-3 ${stats.maxTemp >= 80 ? "text-red-400" : "text-white/40"}`}
            />
            <span className={`text-[10px] ${getTempColor(stats.maxTemp)}`}>
              Max: {stats.maxTemp}°C
            </span>
          </div>
        )}
      </div>

      {/* Average Temperature */}
      <div className="flex items-baseline gap-2 mb-3">
        <span className={`text-3xl font-bold ${getTempColor(stats.avgTemp)}`}>
          {stats.avgTemp}
        </span>
        <span className="text-lg text-white/50">°C avg</span>
      </div>

      {/* Temperature Probes */}
      <div className="flex-1 overflow-y-auto space-y-1.5 mb-2">
        {displayProbes.map((probe, i) => (
          <motion.div
            key={probe.label || i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-2"
          >
            <span className="text-[10px] text-white/50 w-16 truncate">
              {probe.label || `Sensor ${i + 1}`}
            </span>
            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${getTempBgColor(probe.temperature)}`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, probe.temperature)}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            <span
              className={`text-[10px] font-medium ${getTempColor(probe.temperature)}`}
            >
              {Math.round(probe.temperature)}°
            </span>
          </motion.div>
        ))}
      </div>

      {/* Sparkline */}
      {showSparkline && stats.history.length > 1 && (
        <div className="flex items-center gap-2 pt-2 border-t border-white/10">
          <span className="text-[10px] text-white/40">Trend</span>
          <Sparkline
            data={stats.history}
            width={80}
            height={24}
            color="#06b6d4"
          />
        </div>
      )}
    </div>
  );
}

export default TempWidget;
