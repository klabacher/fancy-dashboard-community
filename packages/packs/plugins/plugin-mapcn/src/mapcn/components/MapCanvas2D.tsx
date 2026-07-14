import { useId, useMemo, useState } from "react";

import type { NetworkConnection } from "../types";
import { mapLatLngTo2D } from "../utils";
import { ConnectionTooltip } from "./ConnectionTooltip";

interface MapCanvas2DProps {
  connections: NetworkConnection[];
  maxConnections: number;
  showConnectionInfo: boolean;
  lineGlow: number;
}

const MAP_WIDTH = 1000;
const MAP_HEIGHT = 500;

export function MapCanvas2D({
  connections,
  maxConnections,
  showConnectionInfo,
  lineGlow,
}: MapCanvas2DProps) {
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
        const { x, y } = mapLatLngTo2D(lat, lng, MAP_WIDTH, MAP_HEIGHT);
        return {
          connection,
          x,
          y,
        };
      });
  }, [connections, maxConnections]);

  return (
    <div className="relative w-full h-full">
      <svg
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        className="w-full h-full"
        role="img"
        aria-labelledby={titleId}
        onMouseLeave={() => {
          setHovered(null);
          setCursor(null);
          setContainerRect(null);
        }}
        onMouseMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          const x = event.clientX - rect.left;
          const y = event.clientY - rect.top;
          setContainerRect(rect);
          setCursor({ x, y });
        }}
      >
        <title id={titleId}>Global network connections map</title>
        <defs>
          <linearGradient id="mapcn-neon" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
          <filter id="mapcn-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="rgba(2,6,23,0.8)" />

        <g opacity="0.12" stroke="#22d3ee" strokeWidth="1">
          {Array.from({ length: 10 }).map((_, index) => (
            <line
              key={`grid-x-${index}`}
              x1={(index / 10) * MAP_WIDTH}
              y1={0}
              x2={(index / 10) * MAP_WIDTH}
              y2={MAP_HEIGHT}
            />
          ))}
          {Array.from({ length: 6 }).map((_, index) => (
            <line
              key={`grid-y-${index}`}
              x1={0}
              y1={(index / 6) * MAP_HEIGHT}
              x2={MAP_WIDTH}
              y2={(index / 6) * MAP_HEIGHT}
            />
          ))}
        </g>

        <g opacity={lineGlow} filter="url(#mapcn-glow)">
          {points.map(({ connection, x, y }) => (
            <line
              key={`${connection.destIp}-${connection.protocol}-${connection.timestamp}`}
              x1={MAP_WIDTH / 2}
              y1={MAP_HEIGHT / 2}
              x2={x}
              y2={y}
              stroke="url(#mapcn-neon)"
              strokeWidth={2}
              onMouseEnter={() => setHovered(connection)}
            />
          ))}
        </g>

        <g>
          {points.map(({ connection, x, y }) => (
            <circle
              key={`${connection.destIp}-dot-${connection.protocol}-${connection.timestamp}`}
              cx={x}
              cy={y}
              r={4}
              fill="#f472b6"
              opacity={0.9}
              onMouseEnter={() => setHovered(connection)}
            />
          ))}
        </g>
      </svg>

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
