import { useState, type ReactElement } from "react";
import { Plus } from "lucide-react";

import { useModuleTheme } from "@fancydashboard/sdk/theme";
import type { WidgetRuntimeProps } from "@fancydashboard/sdk/plugins/types";
import { QuickTaskConfigSchema } from "./QuickTask.config";

export default function QuickTask(props: WidgetRuntimeProps): ReactElement {
  const { theme, cx } = useModuleTheme();
  const parsedConfig = QuickTaskConfigSchema.safeParse(props.config);
  const config = parsedConfig.success
    ? parsedConfig.data
    : QuickTaskConfigSchema.parse({});
  const [value, setValue] = useState("");

  return (
    <div className={cx(theme.card.container, "flex flex-col h-full")}>
      <div className={theme.card.header}>
        <span className={theme.text.title}>New Task</span>
      </div>

      <div className={cx(theme.card.body, "flex items-center gap-2")}>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={config.placeholder}
          className={theme.input.root}
        />

        <button
          type="button"
          className={theme.button.primary}
          onClick={() => setValue("")}
          aria-label="Add task"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
