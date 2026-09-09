// ============================================================================
// MapCN Module - Network Monitoring Hook
// Manages connection to the native backend and event streaming
// ============================================================================

import { useEffect, useCallback, useState } from "react";
import {
  BridgeLogger,
  subscribeToBridgeEvent,
} from "@fancydashboard/sdk/bridge";
import { startSniffing, stopSniffing, getSnifferStatus } from "../api";
import { useMapCNStore } from "./useMapCNStore";
import { NetworkSnapshotSchema } from "../types";

export interface UseNetworkSniffingReturn {
  isRunning: boolean;
  isLoading: boolean;
  error: string | null;
  start: () => Promise<void>;
  stop: () => Promise<void>;
  refreshStatus: () => Promise<void>;
}

/**
 * GeoIP is optional enrichment. Backend/device availability is not inferred
 * from deviceName because a stopped native monitor legitimately has no active
 * device yet; actual backend failures are emitted by Rust as mapcn://error.
 */
function validateOptionalEnrichment(status: {
  hasGeoipDb: boolean;
}): string[] {
  if (status.hasGeoipDb) return [];
  return [
    "GeoIP database missing. Network telemetry still works; install GeoLite2-City.mmdb from MaxMind to enable destination geolocation.",
  ];
}

export function useNetworkSniffing(): UseNetworkSniffingReturn {
  const [isLoading, setIsLoading] = useState(false);

  const updateSnapshot = useMapCNStore((state) => state.updateSnapshot);
  const updateStatus = useMapCNStore((state) => state.updateStatus);
  const setError = useMapCNStore((state) => state.setError);
  const error = useMapCNStore((state) => state.error);
  const isRunning = useMapCNStore(
    (state) => state.status?.isRunning ?? false
  );

  const surfaceOptionalEnrichment = useCallback(
    (status: { hasGeoipDb: boolean }) => {
      const issues = validateOptionalEnrichment(status);
      if (issues.length > 0) setError(issues.join(" "));
    },
    [setError]
  );

  useEffect(() => {
    const fetchInitialStatus = async () => {
      try {
        const status = await getSnifferStatus();
        updateStatus(status);
        surfaceOptionalEnrichment(status);
      } catch (caught) {
        const message =
          caught instanceof Error
            ? caught.message
            : "Failed to retrieve network monitor status";
        BridgeLogger.error(
          "useNetworkSniffing",
          "fetchInitialStatus",
          message
        );
        setError(message);
      }
    };

    void fetchInitialStatus();
  }, [setError, surfaceOptionalEnrichment, updateStatus]);

  useEffect(() => {
    let unsubSnapshot: (() => void) | null = null;
    let unsubTelemetry: (() => void) | null = null;
    let unsubError: (() => void) | null = null;

    const setupListener = async () => {
      try {
        const snapshotSub = await subscribeToBridgeEvent<unknown>(
          "mapcn://snapshot",
          (payload) => {
            const parsed = NetworkSnapshotSchema.safeParse(payload);
            if (!parsed.success) {
              BridgeLogger.error(
                "useNetworkSniffing",
                "snapshotListener",
                "Invalid snapshot payload",
                new Error(parsed.error.message)
              );
              return;
            }
            updateSnapshot(parsed.data);
          }
        );

        const telemetrySub = await subscribeToBridgeEvent<unknown>(
          "mapcn://telemetry",
          (payload) => {
            const parsed = NetworkSnapshotSchema.safeParse(payload);
            if (!parsed.success) {
              BridgeLogger.error(
                "useNetworkSniffing",
                "telemetryListener",
                "Invalid telemetry payload",
                new Error(parsed.error.message)
              );
              return;
            }
            updateSnapshot(parsed.data);
          }
        );

        const errorSub = await subscribeToBridgeEvent<string>(
          "mapcn://error",
          (payload) => {
            setError(payload);
            BridgeLogger.error(
              "useNetworkSniffing",
              "errorListener",
              payload
            );
          }
        );

        unsubSnapshot = snapshotSub.unsubscribe;
        unsubTelemetry = telemetrySub.unsubscribe;
        unsubError = errorSub.unsubscribe;
      } catch (caught) {
        const error =
          caught instanceof Error ? caught : new Error(String(caught));
        BridgeLogger.error(
          "useNetworkSniffing",
          "setupListener",
          "Failed to configure MapCN listeners",
          error
        );
        setError("Failed to connect MapCN to native telemetry events");
      }
    };

    void setupListener();

    return () => {
      unsubSnapshot?.();
      unsubTelemetry?.();
      unsubError?.();
    };
  }, [setError, updateSnapshot]);

  const start = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await startSniffing();
      const status = await getSnifferStatus();
      updateStatus(status);
      surfaceOptionalEnrichment(status);
      BridgeLogger.info(
        "useNetworkSniffing",
        "start",
        "Network monitoring started"
      );
    } catch (caught) {
      const message =
        caught instanceof Error
          ? caught.message
          : "Failed to start network monitoring";
      setError(message);
      BridgeLogger.error(
        "useNetworkSniffing",
        "start",
        message,
        caught instanceof Error ? caught : new Error(String(caught))
      );
    } finally {
      setIsLoading(false);
    }
  }, [setError, surfaceOptionalEnrichment, updateStatus]);

  const stop = useCallback(async () => {
    setIsLoading(true);

    try {
      await stopSniffing();
      const status = await getSnifferStatus();
      updateStatus(status);
      surfaceOptionalEnrichment(status);
      BridgeLogger.info(
        "useNetworkSniffing",
        "stop",
        "Network monitoring stopped"
      );
    } catch (caught) {
      const message =
        caught instanceof Error
          ? caught.message
          : "Failed to stop network monitoring";
      setError(message);
      BridgeLogger.error("useNetworkSniffing", "stop", message);
    } finally {
      setIsLoading(false);
    }
  }, [setError, surfaceOptionalEnrichment, updateStatus]);

  const refreshStatus = useCallback(async () => {
    try {
      const status = await getSnifferStatus();
      updateStatus(status);
      surfaceOptionalEnrichment(status);
    } catch (caught) {
      const message =
        caught instanceof Error
          ? caught.message
          : "Failed to refresh network monitor status";
      BridgeLogger.error(
        "useNetworkSniffing",
        "refreshStatus",
        message
      );
    }
  }, [surfaceOptionalEnrichment, updateStatus]);

  return {
    isRunning,
    isLoading,
    error,
    start,
    stop,
    refreshStatus,
  };
}
