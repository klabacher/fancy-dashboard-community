import type { NetworkConnection } from "../types";
import {
  formatBytes,
  getConnectionBytes,
  getConnectionPackets,
} from "../utils";

interface ConnectionTooltipProps {
  connection: NetworkConnection;
  cursor: { x: number; y: number };
  containerRect?: DOMRect | null;
}

export function ConnectionTooltip({
  connection,
  cursor,
  containerRect,
}: ConnectionTooltipProps) {
  const hoveredBytes = getConnectionBytes(connection);
  const hoveredPackets = getConnectionPackets(connection);

  const containerWidth =
    containerRect?.width ??
    (typeof window === "undefined" ? 0 : window.innerWidth);
  const containerHeight =
    containerRect?.height ??
    (typeof window === "undefined" ? 0 : window.innerHeight);

  const maxWidth = 220;
  const maxHeight = 120;

  const left = Math.max(0, Math.min(cursor.x + 12, containerWidth - maxWidth));
  const top = Math.max(0, Math.min(cursor.y + 12, containerHeight - maxHeight));

  return (
    <div
      className="absolute z-20 rounded-xl bg-black/80 text-white text-xs px-3 py-2 shadow-lg border border-white/10"
      style={{ left, top }}
    >
      <div className="font-semibold">{connection.destIp}</div>
      {connection.destLocation ? (
        <div className="text-white/70">
          {connection.destLocation.city}, {connection.destLocation.country}
        </div>
      ) : null}
      <div className="text-white/70">
        {connection.protocol.toUpperCase()} •{" "}
        {formatBytes(connection.bytes ?? 0)}
      </div>
      <div className="text-white/50">
        In {formatBytes(hoveredBytes.bytesIn)} • Out{" "}
        {formatBytes(hoveredBytes.bytesOut)}
      </div>
      <div className="text-white/50">
        Packets In {hoveredPackets.packetsIn} • Out {hoveredPackets.packetsOut}
      </div>
    </div>
  );
}
