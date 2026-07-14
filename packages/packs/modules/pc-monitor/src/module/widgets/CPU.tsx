import type { ReactElement } from "react";

import type { WidgetRuntimeProps } from "@fancydashboard/sdk/plugins/types";
import { usePluginContext } from "@fancydashboard/sdk/plugins/PluginContext";

import { CPUWidget } from "../components/CPUWidget";
import { useCPUStats } from "../store";
import { useTelemetrySubscription } from "../hooks/useTelemetrySubscription";
import type { CPUWidgetConfig } from "../PCMonitor.config";

export default function CPU(_props: WidgetRuntimeProps): ReactElement {
  useTelemetrySubscription();

  const { config } = usePluginContext();
  const typedConfig = config as unknown as CPUWidgetConfig;
  const stats = useCPUStats();

  return (
    <CPUWidget
      stats={stats}
      showTemperature={typedConfig.showTemperature}
      showSparkline={typedConfig.showSparkline}
      compact={typedConfig.compactMode}
    />
  );
}
