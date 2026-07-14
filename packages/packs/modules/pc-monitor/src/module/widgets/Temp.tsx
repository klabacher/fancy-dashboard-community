import type { ReactElement } from "react";

import type { WidgetRuntimeProps } from "@fancydashboard/sdk/plugins/types";
import { usePluginContext } from "@fancydashboard/sdk/plugins/PluginContext";

import { TempWidget } from "../components/TempWidget";
import { useTempStats } from "../store";
import { useTelemetrySubscription } from "../hooks/useTelemetrySubscription";
import type { TempWidgetConfig } from "../PCMonitor.config";

export default function Temp(_props: WidgetRuntimeProps): ReactElement {
  useTelemetrySubscription();

  const { config } = usePluginContext();
  const typedConfig = config as unknown as TempWidgetConfig;
  const stats = useTempStats();

  return (
    <TempWidget
      stats={stats}
      showAllProbes={typedConfig.showAllProbes}
      showSparkline={typedConfig.showSparkline}
    />
  );
}
