// ============================================================================
// RAM Widget Component - Standalone RAM Monitor
// ============================================================================

import { MemoryStick } from "lucide-react";
import { motion } from "framer-motion";
import type { RAMStats } from "../types";
import { Sparkline } from "./Sparkline";

interface RAMWidgetProps {
  stats: RAMStats | null;
  showSparkline?: boolean;
  compact?: boolean;
}

export function RAMWidget({
  stats,
  showSparkline = true,
  compact = false,
}: RAMWidgetProps) {
  if (!stats) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-black/20 rounded-lg">
        <MemoryStick className="w-5 h-5 text-white/30 animate-pulse" />
      </div>
    );
  }

  const getUsageColor = (pct: number) => {
    if (pct >= 90) return "text-red-400";
    if (pct >= 70) return "text-yellow-400";
    return "text-purple-400";
  };

  const getBarColor = (pct: number) => {
    if (pct >= 90) return "bg-red-500";
    if (pct >= 70) return "bg-yellow-500";
    return "bg-purple-500";
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3 h-full w-full p-2 bg-black/30 backdrop-blur-md rounded-lg">
        <div className="p-1.5 rounded-md bg-purple-500/20">
          <MemoryStick className="w-4 h-4 text-purple-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span
              className={`text-lg font-bold ${getUsageColor(stats.percentage)}`}
            >
              {stats.percentage}%
            </span>
            <span className="text-[10px] text-white/40">
              {stats.used}/{stats.total}GB
            </span>
          </div>
          <div className="h-1 bg-white/10 rounded-full overflow-hidden mt-1">
            <motion.div
              className={`h-full rounded-full ${getBarColor(stats.percentage)}`}
              initial={{ width: 0 }}
              animate={{ width: `${stats.percentage}%` }}
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
          <div className="p-1.5 rounded-md bg-purple-500/20">
            <MemoryStick className="w-4 h-4 text-purple-400" />
          </div>
          <span className="text-xs font-semibold text-white/80">RAM</span>
        </div>
        <span className="text-[10px] text-white/40">
          {stats.used}/{stats.total} GB
        </span>
      </div>

      {/* Main Stats */}
      <div className="flex items-baseline gap-2 mb-2">
        <span
          className={`text-3xl font-bold ${getUsageColor(stats.percentage)}`}
        >
          {stats.percentage}
        </span>
        <span className="text-lg text-white/50">%</span>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-2">
        <motion.div
          className={`h-full rounded-full ${getBarColor(stats.percentage)}`}
          initial={{ width: 0 }}
          animate={{ width: `${stats.percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      {/* Used/Free indicator */}
      <div className="flex justify-between text-[10px] text-white/40 mb-2">
        <span>Used: {stats.used} GB</span>
        <span>Free: {stats.total - stats.used} GB</span>
      </div>

      {/* Sparkline */}
      {showSparkline && stats.history.length > 1 && (
        <div className="flex-1 min-h-0 flex items-end">
          <Sparkline
            data={stats.history}
            width={120}
            height={32}
            color="#a855f7"
            className="w-full"
          />
        </div>
      )}
    </div>
  );
}

export default RAMWidget;
