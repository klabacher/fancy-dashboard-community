import { type ReactElement } from "react";

import { useModuleTheme } from "@fancydashboard/sdk/theme";
import type { GlobalSettingsProps } from "@fancydashboard/sdk/plugins/types";

export default function GlobalSettings(
  _props: GlobalSettingsProps
): ReactElement {
  const { theme, cx } = useModuleTheme();

  return (
    <div className={cx(theme.card.container, "p-4")}>
      <div className={cx(theme.card.body, "space-y-2")}>
        <h2 className={cx(theme.text.title, "text-lg")}>To-Do List</h2>
        <p className={cx(theme.text.muted, "text-sm")}>
          This module stores tasks locally and, when available, persists them
          via the Tauri backend.
        </p>
      </div>
    </div>
  );
}
