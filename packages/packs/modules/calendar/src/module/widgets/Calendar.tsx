import type { ReactElement } from "react";

import type { WidgetRuntimeProps } from "@fancydashboard/sdk/plugins/types";
import { usePluginContext } from "@fancydashboard/sdk/plugins/PluginContext";

import CalendarWidget from "../CalendarWidget";
import type { CalendarConfig } from "../types";

export default function Calendar(_props: WidgetRuntimeProps): ReactElement {
  const { config, setConfig } = usePluginContext();

  return (
    <CalendarWidget
      config={config as unknown as CalendarConfig}
      onConfigChange={(next) =>
        setConfig(next as unknown as Record<string, unknown>)
      }
    />
  );
}
