import { useEffect } from "react";

import {
  BridgeLogger,
  subscribeToBridgeEvent,
  SystemActions,
} from "@fancydashboard/sdk/bridge";

import { usePCMonitorStore } from "../store";
import type { TelemetryPayload, SystemSpecs } from "../types";

let activeSubscribers = 0;
let unsubscribeTelemetry: (() => void) | null = null;
let loadedSpecs = false;

export function useTelemetrySubscription(): void {
  const setSpecs = usePCMonitorStore((s) => s.setSpecs);
  const updateFromTelemetry = usePCMonitorStore((s) => s.updateFromTelemetry);
  const setConnected = usePCMonitorStore((s) => s.setConnected);
  const setError = usePCMonitorStore((s) => s.setError);

  useEffect(() => {
    activeSubscribers++;

    const ensureStarted = async () => {
      try {
        if (!loadedSpecs) {
          const specsResponse = await SystemActions.getSpecs.invoke();
          if (specsResponse.success && specsResponse.data) {
            const data = specsResponse.data;
            const mappedSpecs: SystemSpecs = {
              host: data.host,
              os_version: data.osVersion,
              cpu_brand: data.cpuBrand,
              physical_cores: data.physicalCores,
              total_memory: data.totalMemory,
            };
            setSpecs(mappedSpecs);
            loadedSpecs = true;
          }
        }

        if (!unsubscribeTelemetry) {
          const subscription = await subscribeToBridgeEvent<TelemetryPayload>(
            "telemetry://metrics",
            (payload) => {
              updateFromTelemetry(payload);
              setConnected(true);
            }
          );
          unsubscribeTelemetry = subscription.unsubscribe;
        }
      } catch (error) {
        const msg =
          error instanceof Error ? error.message : "Connection failed";
        BridgeLogger.error("pc-monitor", "telemetry", msg);
        setError(msg);
        setConnected(false);
      }
    };

    ensureStarted();

    return () => {
      activeSubscribers--;
      if (activeSubscribers <= 0) {
        unsubscribeTelemetry?.();
        unsubscribeTelemetry = null;
      }
    };
  }, [setSpecs, updateFromTelemetry, setConnected, setError]);
}
