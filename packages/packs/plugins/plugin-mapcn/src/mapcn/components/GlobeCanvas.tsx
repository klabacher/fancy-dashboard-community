import { useId, useMemo, useState } from "react";

import type { NetworkConnection } from "../types";
import { mapLatLngToGlobe } from "../utils";
import { ConnectionTooltip } from "./ConnectionTooltip";

interface GlobeCanvasProps {
  connections: NetworkConnection[];
  maxConnections: number;
  showConnectionInfo: boolean;
  lineGlow: number;
  rotationSpeed: "slow" | "medium" | "fast";
}

const GLOBE_SIZE = 420;
const GLOBE_RADIUS = 160;

const rotationDurations: Record<GlobeCanvasProps["rotationSpeed"], number> = {
  slow: 36,
  medium: 24,
  fast: 16,
};

export function GlobeCanvas({
  connections,
  maxConnections,
  showConnectionInfo,
  lineGlow,
  rotationSpeed,
}: GlobeCanvasProps) {
  const [hovered, setHovered] = useState<NetworkConnection | null>(null);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const [containerRect, setContainerRect] = useState<DOMRect | null>(null);
  const titleId = useId();

  const points = useMemo(() => {
    return connections
      .filter((connection) => connection.destLocation)
      .slice(0, maxConnections)
      .map((connection) => {
        const { lat, lng } = connection.destLocation!;
        const { x, y, z } = mapLatLngToGlobe(lat, lng, GLOBE_RADIUS);
        return {
          connection,
          x: GLOBE_SIZE / 2 + x,
          y: GLOBE_SIZE / 2 + y,
          z,
        };
      });
  }, [connections, maxConnections]);

  return (
    <div
      role="presentation"
      className="relative w-full h-full flex items-center justify-center"
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        setContainerRect(rect);
        setCursor({ x, y });
      }}
      onMouseLeave={() => {
        setHovered(null);
        setCursor(null);
        setContainerRect(null);
      }}
    >
      <div
        className="relative"
        style={{
          width: `${GLOBE_SIZE}px`,
          height: `${GLOBE_SIZE}px`,
        }}
      >
        <div className="absolute inset-0 rounded-full bg-linear-to-br from-slate-900 via-slate-950 to-black shadow-[0_0_60px_rgba(34,211,238,0.25)]" />
        <div
          className="absolute inset-0 rounded-full border border-white/10"
          style={{
            boxShadow: "inset 0 0 40px rgba(56,189,248,0.25)",
          }}
        />

        <svg
          viewBox={`0 0 ${GLOBE_SIZE} ${GLOBE_SIZE}`}
          className="absolute inset-0"
          role="img"
          aria-labelledby={titleId}
          style={{
            animation: `spin ${rotationDurations[rotationSpeed]}s linear infinite`,
          }}
        >
          <title id={titleId}>Global network connections</title>
          <defs>
            <linearGradient id="globe-neon" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#f472b6" />
            </linearGradient>
            <filter
              id="globe-glow"
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
            >
              <feGaussianBlur stdDeviation="6" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <circle
            cx={GLOBE_SIZE / 2}
            cy={GLOBE_SIZE / 2}
            r={GLOBE_RADIUS}
            fill="rgba(8,47,73,0.35)"
            stroke="rgba(148,163,184,0.3)"
            strokeWidth={1}
          />

          <g opacity={0.2} stroke="#22d3ee" strokeWidth={0.5}>
            {Array.from({ length: 6 }).map((_, index) => (
              <ellipse
                key={`lat-${index}`}
                cx={GLOBE_SIZE / 2}
                cy={GLOBE_SIZE / 2}
                rx={GLOBE_RADIUS}
                ry={GLOBE_RADIUS * Math.cos((index / 6) * Math.PI)}
              />
            ))}
          </g>

          <g opacity={lineGlow} filter="url(#globe-glow)">
            {points.map(({ connection, x, y, z }) => (
              <line
                key={`${connection.destIp}-${connection.timestamp}-${connection.protocol}`}
                x1={GLOBE_SIZE / 2}
                y1={GLOBE_SIZE / 2}
                x2={x}
                y2={y}
                stroke="url(#globe-neon)"
                strokeWidth={2}
                opacity={z > 0 ? 1 : 0.35}
                role="presentation"
                onMouseEnter={() => setHovered(connection)}
              />
            ))}
          </g>

          <g>
            {points.map(({ connection, x, y, z }) => (
              <circle
                key={`${connection.destIp}-dot-${connection.timestamp}-${connection.protocol}`}
                cx={x}
                cy={y}
                r={4}
                fill="#38bdf8"
                opacity={z > 0 ? 0.95 : 0.4}
                role="presentation"
                onMouseEnter={() => setHovered(connection)}
              />
            ))}
          </g>
        </svg>
      </div>

      {showConnectionInfo && hovered && cursor ? (
        <ConnectionTooltip
          connection={hovered}
          cursor={cursor}
          containerRect={containerRect}
        />
      ) : null}
    </div>
  );
}
