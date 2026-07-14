import type { ReactElement } from "react";
import { useEffect } from "react";

import type { WidgetRuntimeProps } from "@fancydashboard/sdk/plugins/types";
import { usePluginContext } from "@fancydashboard/sdk/plugins/PluginContext";

import SystemDashboard from "../components/SystemDashboard";
import { useDashboardLayout, usePCMonitorStore } from "../store";
import { useTelemetrySubscription } from "../hooks/useTelemetrySubscription";
import type { SystemDashboardConfig } from "../PCMonitor.config";

function layoutsEqual(a: unknown, b: unknown): boolean {
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
}

export default function SystemDashboardWidget(
  _props: WidgetRuntimeProps
): ReactElement {
  useTelemetrySubscription();

  const { config, setConfig } = usePluginContext();
  const typedConfig = config as unknown as SystemDashboardConfig;

  const layout = useDashboardLayout();
  const updateLayout = usePCMonitorStore((s) => s.updateDashboardLayout);

  // Runtime config -> store layout
  useEffect(() => {
    if (layoutsEqual(typedConfig.layout, layout)) return;
    updateLayout(typedConfig.layout);
  }, [typedConfig.layout, layout, updateLayout]);

  // Store layout -> runtime config
  useEffect(() => {
    if (layoutsEqual(layout, typedConfig.layout)) return;
    setConfig({ ...typedConfig, layout } as unknown as Record<string, unknown>);
  }, [layout, typedConfig, setConfig]);

  return (
    <SystemDashboard
      showSparklines={typedConfig.showSparklines}
      compactMode={typedConfig.compactMode}
    />
  );
}
