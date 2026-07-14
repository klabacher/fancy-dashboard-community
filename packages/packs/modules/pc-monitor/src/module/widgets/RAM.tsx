import type { ReactElement } from "react";

import type { WidgetRuntimeProps } from "@fancydashboard/sdk/plugins/types";
import { usePluginContext } from "@fancydashboard/sdk/plugins/PluginContext";

import { RAMWidget } from "../components/RAMWidget";
import { useRAMStats } from "../store";
import { useTelemetrySubscription } from "../hooks/useTelemetrySubscription";
import type { RAMWidgetConfig } from "../PCMonitor.config";

export default function RAM(_props: WidgetRuntimeProps): ReactElement {
  useTelemetrySubscription();

  const { config } = usePluginContext();
  const typedConfig = config as unknown as RAMWidgetConfig;
  const stats = useRAMStats();

  return (
    <RAMWidget
      stats={stats}
      showSparkline={typedConfig.showSparkline}
      compact={typedConfig.compactMode}
    />
  );
}
