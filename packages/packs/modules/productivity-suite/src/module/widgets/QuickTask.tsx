import { useState, type FormEvent, type ReactElement } from "react";
import { Check, Plus } from "lucide-react";

import { useModuleTheme } from "@fancydashboard/sdk/theme";
import { useWidgetViewport } from "@fancydashboard/sdk/components/WidgetViewport";
import type { WidgetRuntimeProps } from "@fancydashboard/sdk/plugins/types";
import { addTask } from "../taskStore";
import { QuickTaskConfigSchema } from "./QuickTask.config";

export default function QuickTask(props: WidgetRuntimeProps): ReactElement {
  const { theme, cx } = useModuleTheme();
  const viewport = useWidgetViewport();
  const parsedConfig = QuickTaskConfigSchema.safeParse(props.config);
  const config = parsedConfig.success
    ? parsedConfig.data
    : QuickTaskConfigSchema.parse({});
  const [value, setValue] = useState("");
  const [saved, setSaved] = useState(false);
  const micro = viewport.size === "micro" || viewport.isShort;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const task = addTask(value);
    if (!task) return;
    setValue("");
    setSaved(true);
    window.setTimeout(() => setSaved(false), viewport.reducedMotion ? 0 : 900);
  };

  return (
    <form
      onSubmit={submit}
      className={cx(
        theme.card.container,
        "flex h-full min-h-0 flex-col overflow-hidden border border-white/10 bg-white/[0.055] shadow-[0_18px_50px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-2xl",
        micro ? "rounded-xl p-1.5" : "rounded-2xl"
      )}
    >
      {!micro && (
        <div className={theme.card.header}>
          <span className={theme.text.title}>New Task</span>
        </div>
      )}

      <div
        className={cx(
          theme.card.body,
          "flex min-h-0 flex-1 items-center",
          micro ? "gap-1 p-0" : "gap-2"
        )}
      >
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={config.placeholder}
          maxLength={240}
          className={cx(
            theme.input.root,
            "min-w-0 flex-1",
            micro && "h-8 px-2 text-xs"
          )}
          aria-label="Task title"
        />

        <button
          type="submit"
          className={cx(
            theme.button.primary,
            "shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
            micro && "h-8 min-h-8 w-8 p-0"
          )}
          disabled={!value.trim()}
          aria-label={saved ? "Task added" : "Add task"}
        >
          {saved ? (
            <Check className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Plus className="h-4 w-4" aria-hidden="true" />
          )}
          {!micro && <span className="sr-only">Add task</span>}
        </button>
      </div>
    </form>
  );
}
