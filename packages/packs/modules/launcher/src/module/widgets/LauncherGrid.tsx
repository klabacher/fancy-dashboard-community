import type { ReactElement } from "react";

import type { WidgetRuntimeProps } from "@fancydashboard/sdk/plugins/types";
import { usePluginContext } from "@fancydashboard/sdk/plugins/PluginContext";

import { LauncherGridWidget } from "../components/LauncherGridWidget";
import type { LauncherGridConfig } from "../Launcher.config";

export default function LauncherGrid(_props: WidgetRuntimeProps): ReactElement {
  const { config } = usePluginContext();

  return (
    <LauncherGridWidget config={config as unknown as LauncherGridConfig} />
  );
}
