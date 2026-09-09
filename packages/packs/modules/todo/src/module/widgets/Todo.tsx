import { type ReactElement } from "react";

import type { WidgetRuntimeProps } from "@fancydashboard/sdk/plugins/types";
import { useModuleTheme } from "@fancydashboard/sdk/theme";
import { TodoConfigSchema } from "../Todo.config";
import { TodoList } from "../components/TodoList";

export default function TodoWidget(props: WidgetRuntimeProps): ReactElement {
  const { theme, cx } = useModuleTheme();

  // Ensure config parsing never crashes the widget.
  void TodoConfigSchema.safeParse(props.config);

  return (
    <div
      className={cx(
        theme.card.container,
        "flex h-full w-full min-h-0 min-w-0 flex-col overflow-hidden"
      )}
    >
      <div
        className={cx(
          theme.card.body,
          "h-full w-full min-h-0 min-w-0 p-[clamp(0.35rem,3cqw,1rem)]"
        )}
      >
        <TodoList />
      </div>
    </div>
  );
}
