// ============================================================================
// CPU Widget Component - Standalone CPU Monitor
// ============================================================================

import { Cpu, Thermometer } from "lucide-react";
import { motion } from "framer-motion";
import type { CPUStats } from "../types";
import { Sparkline } from "./Sparkline";

interface CPUWidgetProps {
  stats: CPUStats | null;
  showTemperature?: boolean;
  showSparkline?: boolean;
  compact?: boolean;
}

export function CPUWidget({
  stats,
  showTemperature = true,
  showSparkline = true,
  compact = false,
}: CPUWidgetProps) {
  if (!stats) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-black/20 rounded-lg">
        <Cpu className="w-5 h-5 text-white/30 animate-pulse" />
      </div>
    );
  }

  const getUsageColor = (usage: number) => {
    if (usage >= 90) return "text-red-400";
    if (usage >= 70) return "text-yellow-400";
    return "text-blue-400";
  };

  const getBarColor = (usage: number) => {
    if (usage >= 90) return "bg-red-500";
    if (usage >= 70) return "bg-yellow-500";
    return "bg-blue-500";
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3 h-full w-full p-2 bg-black/30 backdrop-blur-md rounded-lg">
        <div className="p-1.5 rounded-md bg-blue-500/20">
          <Cpu className="w-4 h-4 text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className={`text-lg font-bold ${getUsageColor(stats.usage)}`}>
              {stats.usage}%
            </span>
            {showTemperature && stats.temperature > 0 && (
              <span className="text-[10px] text-white/40">
                {stats.temperature}°C
              </span>
            )}
          </div>
          <div className="h-1 bg-white/10 rounded-full overflow-hidden mt-1">
            <motion.div
              className={`h-full rounded-full ${getBarColor(stats.usage)}`}
              initial={{ width: 0 }}
              animate={{ width: `${stats.usage}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full p-3 bg-black/30 backdrop-blur-md rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-blue-500/20">
            <Cpu className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-xs font-semibold text-white/80">CPU</span>
        </div>
        {showTemperature && stats.temperature > 0 && (
          <div className="flex items-center gap-1 text-[10px] text-white/50">
            <Thermometer className="w-3 h-3" />
            <span>{stats.temperature}°C</span>
          </div>
        )}
      </div>

      {/* Main Stats */}
      <div className="flex items-baseline gap-2 mb-2">
        <span className={`text-3xl font-bold ${getUsageColor(stats.usage)}`}>
          {stats.usage}
        </span>
        <span className="text-lg text-white/50">%</span>
      </div>

      {/* Core Info */}
      <div className="text-[10px] text-white/40 mb-2 truncate">
        {stats.name} • {stats.cores > 0 ? `${stats.cores} cores` : ""}
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-2">
        <motion.div
          className={`h-full rounded-full ${getBarColor(stats.usage)}`}
          initial={{ width: 0 }}
          animate={{ width: `${stats.usage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      {/* Sparkline */}
      {showSparkline && stats.history.length > 1 && (
        <div className="flex-1 min-h-0 flex items-end">
          <Sparkline
            data={stats.history}
            width={120}
            height={32}
            color="#3b82f6"
            className="w-full"
          />
        </div>
      )}
    </div>
  );
}

export default CPUWidget;
