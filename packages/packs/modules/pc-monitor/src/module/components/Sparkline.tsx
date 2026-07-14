// ============================================================================
// Sparkline Component - Mini Chart for History Data
// ============================================================================

import { useMemo } from "react";
import { motion } from "framer-motion";
import type { HistoryPoint } from "../types";

interface SparklineProps {
  data: HistoryPoint[];
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
  showGradient?: boolean;
  animate?: boolean;
  className?: string;
}

export function Sparkline({
  data,
  width = 100,
  height = 32,
  color = "#3b82f6",
  strokeWidth = 1.5,
  showGradient = true,
  animate = true,
  className = "",
}: SparklineProps) {
  const path = useMemo(() => {
    if (data.length < 2) return "";

    const values = data.map((d) => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    const points = data.map((point, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((point.value - min) / range) * (height - 4) - 2;
      return { x, y };
    });

    // Build SVG path with smooth curves
    let d = `M ${points[0].x} ${points[0].y}`;

    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];

      // Simple bezier curve for smoothness
      const cpx = (prev.x + curr.x) / 2;
      d += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
    }

    return d;
  }, [data, width, height]);

  const areaPath = useMemo(() => {
    if (!path || !showGradient) return "";
    return `${path} L ${width} ${height} L 0 ${height} Z`;
  }, [path, width, height, showGradient]);

  const gradientId = useMemo(
    () => `sparkline-gradient-${Math.random().toString(36).slice(2)}`,
    []
  );

  if (data.length < 2) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-[10px] text-white/30">No data</span>
      </div>
    );
  }

  // Current value (last point)
  const currentValue = data[data.length - 1]?.value ?? 0;
  const prevValue = data[data.length - 2]?.value ?? currentValue;
  const isUp = currentValue >= prevValue;

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* Area fill */}
        {showGradient && (
          <motion.path
            d={areaPath}
            fill={`url(#${gradientId})`}
            initial={animate ? { opacity: 0 } : undefined}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
        )}

        {/* Line */}
        <motion.path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={animate ? { pathLength: 0 } : undefined}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5 }}
        />

        {/* Current point indicator */}
        <motion.circle
          cx={width}
          cy={
            data.length > 0
              ? height -
                ((currentValue - Math.min(...data.map((d) => d.value))) /
                  (Math.max(...data.map((d) => d.value)) -
                    Math.min(...data.map((d) => d.value)) || 1)) *
                  (height - 4) -
                2
              : height / 2
          }
          r={3}
          fill={color}
          initial={animate ? { scale: 0 } : undefined}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3 }}
        />
      </svg>

      {/* Trend indicator */}
      <div
        className={`absolute -right-1 top-1/2 -translate-y-1/2 translate-x-full pl-1 ${
          isUp ? "text-green-400" : "text-red-400"
        }`}
      >
        <svg
          width="8"
          height="8"
          viewBox="0 0 8 8"
          fill="currentColor"
          className={isUp ? "" : "rotate-180"}
        >
          <path d="M4 0L8 6H0L4 0Z" />
        </svg>
      </div>
    </div>
  );
}

export default Sparkline;
