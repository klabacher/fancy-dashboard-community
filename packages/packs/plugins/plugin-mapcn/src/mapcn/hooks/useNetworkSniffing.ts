// ============================================================================
// MapCN Module - Network Sniffing Hook
// Manages connection to Rust backend and event streaming
// ============================================================================

import { useEffect, useCallback, useState } from "react";
import { BridgeLogger, subscribeToBridgeEvent } from "@fancydashboard/sdk/bridge";
import { startSniffing, stopSniffing, getSnifferStatus } from "../api";
import { useMapCNStore } from "./useMapCNStore";
import { NetworkSnapshotSchema } from "../types";

// ============================================================================
// Hook Implementation
// ============================================================================

export interface UseNetworkSniffingReturn {
  isRunning: boolean;
  isLoading: boolean;
  error: string | null;
  start: () => Promise<void>;
  stop: () => Promise<void>;
  refreshStatus: () => Promise<void>;
}

function validatePrerequisites(status: {
  hasGeoipDb: boolean;
  deviceName: string | null;
}): string[] {
  const issues: string[] = [];

  if (!status.deviceName) {
    issues.push(
      "No network device detected. Ensure Npcap/libpcap is installed and active."
    );
  }

  if (!status.hasGeoipDb) {
    issues.push(
      "GeoIP database missing. Download GeoLite2-City.mmdb from MaxMind to enable geolocation."
    );
  }

  return issues;
}

export function useNetworkSniffing(): UseNetworkSniffingReturn {
  const [isLoading, setIsLoading] = useState(false);

  // Use selectors to avoid re-rendering on every store change (like connection updates)
  const updateSnapshot = useMapCNStore((s) => s.updateSnapshot);
  const updateStatus = useMapCNStore((s) => s.updateStatus);
  const setError = useMapCNStore((s) => s.setError);
  const error = useMapCNStore((s) => s.error);
  // Only subscribe to isRunning changes, not the whole status object (which has packet counts)
  const isRunning = useMapCNStore((s) => s.status?.isRunning ?? false);

  // Get initial status on mount
  useEffect(() => {
    const fetchInitialStatus = async () => {
      try {
        const snifferStatus = await getSnifferStatus();
        updateStatus(snifferStatus);

        const issues = validatePrerequisites(snifferStatus);
        if (issues.length > 0) {
          setError(issues.join(" "));
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to retrieve sniffer status";
        BridgeLogger.error("useNetworkSniffing", "fetchInitialStatus", message);
        setError(message);
      }
    };

    fetchInitialStatus();
  }, [updateStatus, setError]);

  // Subscribe to network snapshots
  useEffect(() => {
    let unsubSnapshot: (() => void) | null = null;
    let unsubTelemetry: (() => void) | null = null;
    let unsubError: (() => void) | null = null;

    const setupListener = async () => {
      try {
        const snapshotSub = await subscribeToBridgeEvent<unknown>(
          "mapcn://snapshot",
          (payload) => {
            try {
              const parsed = NetworkSnapshotSchema.safeParse(payload);
              if (!parsed.success) {
                throw new Error("Invalid snapshot payload");
              }
              updateSnapshot(parsed.data);
            } catch (err) {
              BridgeLogger.error(
                "useNetworkSniffing",
                "snapshotListener",
                "Invalid snapshot payload",
                err as Error
              );
            }
          }
        );

        const telemetrySub = await subscribeToBridgeEvent<unknown>(
          "mapcn://telemetry",
          (payload) => {
            try {
              const parsed = NetworkSnapshotSchema.safeParse(payload);
              if (!parsed.success) {
                throw new Error("Invalid telemetry payload");
              }
              updateSnapshot(parsed.data);
            } catch (err) {
              BridgeLogger.error(
                "useNetworkSniffing",
                "telemetryListener",
                "Invalid telemetry payload",
                err as Error
              );
            }
          }
        );

        const errorSub = await subscribeToBridgeEvent<string>(
          "mapcn://error",
          (payload) => {
            setError(payload);
            BridgeLogger.error("useNetworkSniffing", "errorListener", payload);
          }
        );

        unsubSnapshot = snapshotSub.unsubscribe;
        unsubTelemetry = telemetrySub.unsubscribe;
        unsubError = errorSub.unsubscribe;

        BridgeLogger.info(
          "useNetworkSniffing",
          "setupListener",
          "Event listeners configurados"
        );
      } catch (err) {
        BridgeLogger.error(
          "useNetworkSniffing",
          "setupListener",
          "Falha ao configurar listeners",
          err as Error
        );
      }
    };

    setupListener();

    // Cleanup: unlisten on unmount
    return () => {
      if (unsubSnapshot) {
        unsubSnapshot();
      }
      if (unsubTelemetry) {
        unsubTelemetry();
      }
      if (unsubError) {
        unsubError();
        BridgeLogger.info(
          "useNetworkSniffing",
          "cleanup",
          "Event listeners removidos"
        );
      }
    };
  }, [updateSnapshot, setError]);

  // Start capture
  const start = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await startSniffing();

      // Refresh status after starting
      const snifferStatus = await getSnifferStatus();
      updateStatus(snifferStatus);

      const issues = validatePrerequisites(snifferStatus);
      if (issues.length > 0) {
        setError(issues.join(" "));
      }

      BridgeLogger.info(
        "useNetworkSniffing",
        "start",
        "Captura iniciada com sucesso"
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao iniciar captura";
      setError(message);
      BridgeLogger.error("useNetworkSniffing", "start", message, err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [setError, updateStatus]);

  // Stop capture
  const stop = useCallback(async () => {
    setIsLoading(true);

    try {
      await stopSniffing();

      // Refresh status after stopping
      const snifferStatus = await getSnifferStatus();
      updateStatus(snifferStatus);

      const issues = validatePrerequisites(snifferStatus);
      if (issues.length > 0) {
        setError(issues.join(" "));
      }

      BridgeLogger.info(
        "useNetworkSniffing",
        "stop",
        "Captura parada com sucesso"
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao parar captura";
      setError(message);
      BridgeLogger.error("useNetworkSniffing", "stop", message);
    } finally {
      setIsLoading(false);
    }
  }, [setError, updateStatus]);

  // Refresh status manually
  const refreshStatus = useCallback(async () => {
    try {
      const snifferStatus = await getSnifferStatus();
      updateStatus(snifferStatus);

      const issues = validatePrerequisites(snifferStatus);
      if (issues.length > 0) {
        setError(issues.join(" "));
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao atualizar status";
      BridgeLogger.error("useNetworkSniffing", "refreshStatus", message);
    }
  }, [setError, updateStatus]);

  return {
    isRunning,
    isLoading,
    error,
    start,
    stop,
    refreshStatus,
  };
}
