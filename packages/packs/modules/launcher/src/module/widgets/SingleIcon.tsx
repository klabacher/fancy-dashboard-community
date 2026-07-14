import type { ReactElement } from "react";

import type { WidgetRuntimeProps } from "@fancydashboard/sdk/plugins/types";
import { usePluginContext } from "@fancydashboard/sdk/plugins/PluginContext";

import { SingleIconWidget } from "../components/SingleIconWidget";
import type { SingleIconConfig } from "../Launcher.config";

export default function SingleIcon(_props: WidgetRuntimeProps): ReactElement {
  const { config } = usePluginContext();

  return <SingleIconWidget config={config as unknown as SingleIconConfig} />;
}
