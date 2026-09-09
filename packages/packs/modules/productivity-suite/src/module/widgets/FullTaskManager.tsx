import { useEffect, useMemo, useState, type FormEvent, type ReactElement } from "react";
import { Check, Circle, Plus, Trash2 } from "lucide-react";

import { useModuleTheme } from "@fancydashboard/sdk/theme";
import { useWidgetViewport } from "@fancydashboard/sdk/components/WidgetViewport";
import type { WidgetRuntimeProps } from "@fancydashboard/sdk/plugins/types";
import {
  addTask,
  clearCompleted,
  loadTasks,
  removeTask,
  subscribeTasks,
  toggleTask,
  type ProductivityTask,
} from "../taskStore";
import { FullTaskManagerConfigSchema } from "./FullTaskManager.config";

type Filter = "all" | "open" | "done";

export default function FullTaskManager(
  props: WidgetRuntimeProps
): ReactElement {
  const { theme, cx } = useModuleTheme();
  const viewport = useWidgetViewport();
  const parsedConfig = FullTaskManagerConfigSchema.safeParse(props.config);
  const config = parsedConfig.success
    ? parsedConfig.data
    : FullTaskManagerConfigSchema.parse({});
  const [tasks, setTasks] = useState<ProductivityTask[]>(() => loadTasks());
  const [value, setValue] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => subscribeTasks(setTasks), []);

  const compact =
    viewport.size === "micro" || viewport.size === "compact" || viewport.isShort;
  const micro = viewport.size === "micro";
  const visibleTasks = useMemo(
    () =>
      tasks.filter((task) => {
        if (filter === "open") return !task.completed;
        if (filter === "done") return task.completed;
        return true;
      }),
    [filter, tasks]
  );
  const openCount = tasks.filter((task) => !task.completed).length;
  const completedCount = tasks.length - openCount;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (addTask(value)) setValue("");
  };

  return (
    <section
      className={cx(
        theme.card.container,
        "flex h-full min-h-0 flex-col overflow-hidden border border-white/10 bg-white/[0.055] shadow-[0_18px_55px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-2xl",
        micro ? "rounded-xl" : "rounded-3xl"
      )}
      aria-label={config.title}
    >
      <div
        className={cx(
          theme.card.header,
          "flex min-w-0 items-center justify-between gap-2",
          compact && "px-2 py-1.5"
        )}
      >
        <div className="min-w-0">
          <h2 className={cx(theme.text.title, "truncate")}>{config.title}</h2>
          {!compact && (
            <p className={cx(theme.text.muted, "mt-0.5 text-[11px]")}>{openCount} open · {completedCount} done</p>
          )}
        </div>
        {completedCount > 0 && !micro && (
          <button
            type="button"
            onClick={clearCompleted}
            className="shrink-0 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-white/55 transition hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Clear done
          </button>
        )}
      </div>

      <div
        className={cx(
          theme.card.body,
          "flex min-h-0 flex-1 flex-col",
          compact ? "gap-1.5 p-2" : "gap-3"
        )}
      >
        <form onSubmit={submit} className="flex min-w-0 items-center gap-2">
          <input
            value={value}
            onChange={(event) => setValue(event.target.value)}
            maxLength={240}
            placeholder="Add a task…"
            className={cx(theme.input.root, "min-w-0 flex-1", compact && "h-8 px-2 text-xs")}
            aria-label="New task title"
          />
          <button
            type="submit"
            disabled={!value.trim()}
            className={cx(
              theme.button.primary,
              "shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
              compact && "h-8 min-h-8 w-8 p-0"
            )}
            aria-label="Add task"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
          </button>
        </form>

        {!micro && (
          <div className="flex flex-wrap gap-1" role="group" aria-label="Task filter">
            {(["all", "open", "done"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                aria-pressed={filter === item}
                className={`rounded-full border px-2 py-1 text-[10px] capitalize transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                  filter === item
                    ? "border-white/20 bg-white/15 text-white"
                    : "border-white/8 bg-white/[0.035] text-white/45 hover:bg-white/10 hover:text-white/75"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-0.5">
          {visibleTasks.length === 0 ? (
            <div className="flex h-full min-h-16 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.025] px-3 text-center">
              <p className={cx(theme.text.muted, compact ? "text-[10px]" : "text-xs")}>{tasks.length === 0 ? "No tasks yet. Add your first one above." : "No tasks match this filter."}</p>
            </div>
          ) : (
            <ul className={compact ? "space-y-1" : "space-y-1.5"}>
              {visibleTasks.map((task) => (
                <li
                  key={task.id}
                  className={`group flex min-w-0 items-center gap-2 rounded-xl border border-white/8 bg-white/[0.04] ${compact ? "p-1.5" : "p-2.5"}`}
                >
                  <button
                    type="button"
                    onClick={() => toggleTask(task.id)}
                    className="shrink-0 rounded-full text-white/55 transition hover:text-emerald-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    aria-label={`${task.completed ? "Reopen" : "Complete"} ${task.title}`}
                  >
                    {task.completed ? (
                      <Check className="h-4 w-4 text-emerald-300" aria-hidden="true" />
                    ) : (
                      <Circle className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                  <span
                    className={`min-w-0 flex-1 truncate ${compact ? "text-[11px]" : "text-xs"} ${
                      task.completed ? "text-white/35 line-through" : "text-white/80"
                    }`}
                    title={task.title}
                  >
                    {task.title}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeTask(task.id)}
                    className="shrink-0 rounded-lg p-1 text-white/30 transition hover:bg-red-400/10 hover:text-red-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    aria-label={`Delete ${task.title}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
