import type { ReactElement } from "react";

import { useModuleTheme } from "@fancydashboard/sdk/theme";

export default function GlobalSettings(): ReactElement {
  const { theme, cx } = useModuleTheme();

  return (
    <div className={cx(theme.card.container, "p-4")}>
      <div className={theme.card.header}>
        <span className={theme.text.title}>Clock Module</span>
      </div>
      <div className={cx(theme.card.body, "text-sm")}>
        <p className={theme.text.body}>
          This module is configured per widget instance.
        </p>
        <p className={cx(theme.text.muted, "mt-2")}>
          Use the widget configuration UI to select the clock style, typography,
          colors, and (for the weather widget) location behavior.
        </p>
      </div>
    </div>
  );
}
