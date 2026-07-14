// ============================================================================
// MapCN Module - Zustand Store
// State management for network connections and UI
// ============================================================================

import { useMemo } from "react";
import { create } from "zustand";
import type {
  MapCNState,
  NetworkSnapshot,
  SnifferStatus,
  ConnectionHistory,
  NetworkConnection,
  Protocol,
} from "../types";

// ============================================================================
// Store Implementation
// ============================================================================

export const useMapCNStore = create<MapCNState>((set) => ({
  // Initial state
  connections: [],
  history: [],
  status: null,
  isLoading: false,
  error: null,
  lastSnapshotAt: null,
  lastSeenAt: null,

  // Actions
  updateSnapshot: (snapshot: NetworkSnapshot) => {
    set((state) => {
      const normalizedConnections = snapshot.connections.map(
        (connection: NetworkConnection) => {
          if (connection.bytes !== undefined) {
            return connection;
          }

          const bytesIn = connection.bytesIn ?? 0;
          const bytesOut = connection.bytesOut ?? 0;

          return {
            ...connection,
            bytes: bytesIn + bytesOut,
          };
        }
      );

      const totalBytesIn =
        snapshot.totalBytesIn ??
        normalizedConnections.reduce(
          (sum: number, connection: NetworkConnection) =>
            sum + (connection.bytesIn ?? 0),
          0
        );
      const totalBytesOut =
        snapshot.totalBytesOut ??
        normalizedConnections.reduce(
          (sum: number, connection: NetworkConnection) =>
            sum + (connection.bytesOut ?? 0),
          0
        );
      const totalPacketsIn =
        snapshot.totalPacketsIn ??
        normalizedConnections.reduce(
          (sum: number, connection: NetworkConnection) =>
            sum + (connection.packetsIn ?? 0),
          0
        );
      const totalPacketsOut =
        snapshot.totalPacketsOut ??
        normalizedConnections.reduce(
          (sum: number, connection: NetworkConnection) =>
            sum + (connection.packetsOut ?? 0),
          0
        );

      // Add to history (keep last 120 samples = 60 seconds at 500ms intervals)
      const newHistoryEntry: ConnectionHistory = {
        timestamp: snapshot.timestamp,
        downloadSpeed: snapshot.totalDownloadSpeed,
        uploadSpeed: snapshot.totalUploadSpeed,
        packetsIn: totalPacketsIn,
        packetsOut: totalPacketsOut,
        bytesIn: totalBytesIn,
        bytesOut: totalBytesOut,
      };

      const updatedHistory = [...state.history, newHistoryEntry].slice(-120);

      return {
        connections: normalizedConnections,
        history: updatedHistory,
        lastSnapshotAt: snapshot.timestamp,
        lastSeenAt:
          normalizedConnections.length > 0
            ? snapshot.timestamp
            : state.lastSeenAt,
        error: null,
      };
    });
  },

  updateStatus: (status: SnifferStatus) => {
    set({ status });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  clearHistory: () => {
    set({ history: [], connections: [] });
  },

  reset: () => {
    set({
      connections: [],
      history: [],
      status: null,
      isLoading: false,
      error: null,
      lastSnapshotAt: null,
      lastSeenAt: null,
    });
  },
}));

// ============================================================================
// Selector Hooks (for optimized re-renders)
// ============================================================================

/**
 * Get top N connections by bytes transferred
 */
export const useTopConnections = (limit: number = 10) => {
  const connections = useMapCNStore((state) => state.connections);

  return useMemo(() => {
    return [...connections]
      .sort((a: NetworkConnection, b: NetworkConnection) => {
        const aBytes = a.bytes ?? (a.bytesIn ?? 0) + (a.bytesOut ?? 0);
        const bBytes = b.bytes ?? (b.bytesIn ?? 0) + (b.bytesOut ?? 0);
        return bBytes - aBytes;
      })
      .slice(0, limit);
  }, [connections, limit]);
};

/**
 * Get connections filtered by protocol
 */
export const useConnectionsByProtocol = (protocol: Protocol) => {
  return useMapCNStore((state) => {
    return state.connections.filter(
      (conn: NetworkConnection) => conn.protocol === protocol
    );
  });
};

/**
 * Get current download/upload speeds
 */
export const useCurrentSpeeds = () => {
  const latestEntry = useMapCNStore(
    (state) => state.history[state.history.length - 1]
  );

  return useMemo(
    () => ({
      download: latestEntry?.downloadSpeed ?? 0,
      upload: latestEntry?.uploadSpeed ?? 0,
    }),
    [latestEntry?.downloadSpeed, latestEntry?.uploadSpeed]
  );
};

/**
 * Get unique countries from connections
 */
export const useConnectionCountries = () => {
  const connections = useMapCNStore((state) => state.connections);

  return useMemo(() => {
    const countries = new Set<string>();
    connections.forEach((conn: NetworkConnection) => {
      if (conn.destLocation) {
        countries.add(conn.destLocation.country);
      }
    });
    return Array.from(countries).sort();
  }, [connections]);
};
