import type { ReactElement } from "react";

import type { WidgetRuntimeProps } from "@fancydashboard/sdk/plugins/types";
import { usePluginContext } from "@fancydashboard/sdk/plugins/PluginContext";

import { GPUWidget } from "../components/GPUWidget";
import { useGPUStats } from "../store";
import { useTelemetrySubscription } from "../hooks/useTelemetrySubscription";
import type { GPUWidgetConfig } from "../PCMonitor.config";

export default function GPU(_props: WidgetRuntimeProps): ReactElement {
  useTelemetrySubscription();

  const { config } = usePluginContext();
  const typedConfig = config as unknown as GPUWidgetConfig;
  const stats = useGPUStats();

  return (
    <GPUWidget
      stats={stats}
      showTemperature={typedConfig.showTemperature}
      showSparkline={typedConfig.showSparkline}
      compact={typedConfig.compactMode}
    />
  );
}
