import type { ReactElement } from "react";

import { useModuleTheme } from "@fancydashboard/sdk/theme";
import type { WidgetRuntimeProps } from "@fancydashboard/sdk/plugins/types";
import { FullTaskManagerConfigSchema } from "./FullTaskManager.config";

export default function FullTaskManager(
  props: WidgetRuntimeProps
): ReactElement {
  const { theme, cx } = useModuleTheme();
  const parsedConfig = FullTaskManagerConfigSchema.safeParse(props.config);
  const config = parsedConfig.success
    ? parsedConfig.data
    : FullTaskManagerConfigSchema.parse({});

  return (
    <div className={cx(theme.card.container, "flex flex-col h-full")}>
      <div className={theme.card.header}>
        <span className={theme.text.title}>{config.title}</span>
      </div>
      <div className={cx(theme.card.body, "text-xs")}>
        <p className={theme.text.body}>
          Placeholder for a full task manager UI.
        </p>
        <p className={cx(theme.text.muted, "mt-2")}>
          This widget would be allowed to write backup files via fs:scope.
        </p>
      </div>
    </div>
  );
}
