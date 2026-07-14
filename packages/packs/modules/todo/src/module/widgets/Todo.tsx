import { type ReactElement } from "react";

import type { WidgetRuntimeProps } from "@fancydashboard/sdk/plugins/types";
import { useModuleTheme } from "@fancydashboard/sdk/theme";
import { TodoConfigSchema } from "../Todo.config";
import { TodoList } from "../components/TodoList";

export default function TodoWidget(props: WidgetRuntimeProps): ReactElement {
  const { theme, cx } = useModuleTheme();

  // Ensure config parsing never crashes the widget
  void TodoConfigSchema.safeParse(props.config);

  return (
    <div
      className={cx(
        theme.card.container,
        "w-full h-full overflow-hidden flex flex-col"
      )}
    >
      <div className={cx(theme.card.body, "w-full h-full p-4")}>
        <TodoList />
      </div>
    </div>
  );
}
