import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  ListTodo,
  Loader2,
  Calendar,
  X,
} from "lucide-react";
import { format, parseISO, isValid } from "date-fns";

import { useWidgetViewport } from "@fancydashboard/sdk";
import { useTodoStore } from "../store";
import { TaskItem } from "./TaskItem";
import { AddTaskInput } from "./AddTaskInput";
import { ConfirmDialog } from "./ConfirmDialog";
import type { Task } from "../types";

type FilterType = "all" | "active" | "completed";

export const TodoList: React.FC = () => {
  const viewport = useWidgetViewport();
  const {
    tasks,
    selectedTaskId,
    isLoading,
    filterDate,
    addTask,
    updateTask,
    deleteTask,
    toggleComplete,
    selectTask,
    cyclePriority,
    setFilterDate,
    initialize,
  } = useTodoStore();
  const [filter, setFilter] = useState<FilterType>("all");
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  const isMicro = viewport.size === "micro";
  const isCompact =
    isMicro ||
    viewport.size === "compact" ||
    viewport.isNarrow ||
    viewport.isShort;

  useEffect(() => {
    void initialize();
  }, [initialize]);

  const filterDateDisplay = useMemo(() => {
    if (!filterDate) return null;
    try {
      const date = parseISO(filterDate);
      if (!isValid(date)) return null;
      return format(date, isCompact ? "MMM d" : "MMMM d, yyyy");
    } catch {
      return null;
    }
  }, [filterDate, isCompact]);

  const filteredTasks = useMemo(() => {
    let result = tasks;

    if (filterDate) {
      result = result.filter((task) => task.dueDate === filterDate);
    }

    switch (filter) {
      case "active":
        return result.filter((task) => !task.completed);
      case "completed":
        return result.filter((task) => task.completed);
      default:
        return result;
    }
  }, [tasks, filter, filterDate]);

  const stats = useMemo(
    () => ({
      total: tasks.length,
      active: tasks.filter((task) => !task.completed).length,
      completed: tasks.filter((task) => task.completed).length,
    }),
    [tasks]
  );

  const handleConfirmDelete = () => {
    if (taskToDelete) {
      deleteTask(taskToDelete);
      setTaskToDelete(null);
    }
  };

  const taskToDeleteTitle =
    tasks.find((task) => task.id === taskToDelete)?.title || "";

  const filterItems = [
    { key: "all", label: "All", count: stats.total },
    { key: "active", label: isMicro ? "Open" : "Active", count: stats.active },
    { key: "completed", label: "Done", count: stats.completed },
  ] as const;

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
      <AnimatePresence initial={false}>
        {filterDate && filterDateDisplay && (
          <motion.div
            initial={viewport.reducedMotion ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: viewport.reducedMotion ? "auto" : 0 }}
            className="mb-[clamp(0.25rem,1.5cqh,0.75rem)] overflow-hidden"
          >
            <div className="flex min-w-0 items-center justify-between gap-2 rounded-xl border border-blue-200 bg-blue-50 px-[clamp(0.4rem,2cqw,0.75rem)] py-[clamp(0.3rem,1.5cqh,0.5rem)] dark:border-blue-800 dark:bg-blue-900/30">
              <div className="flex min-w-0 items-center gap-2">
                <Calendar
                  size={isCompact ? 14 : 16}
                  className="shrink-0 text-blue-500"
                  aria-hidden="true"
                />
                <span className="truncate text-[clamp(0.65rem,3cqw,0.875rem)] font-medium text-blue-700 dark:text-blue-300">
                  {isCompact ? filterDateDisplay : `Tasks for ${filterDateDisplay}`}
                </span>
              </div>
              <motion.button
                type="button"
                onClick={() => setFilterDate(null)}
                whileHover={viewport.reducedMotion ? undefined : { scale: 1.08 }}
                whileTap={viewport.reducedMotion ? undefined : { scale: 0.94 }}
                className="shrink-0 rounded-lg p-1 text-blue-500 hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:bg-blue-800"
                aria-label="Clear date filter"
              >
                <X size={14} aria-hidden="true" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-[clamp(0.25rem,1.6cqh,0.75rem)] flex min-w-0 items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-[clamp(0.3rem,2cqw,0.5rem)]">
          <ListTodo
            size={isMicro ? 16 : 20}
            className="shrink-0 text-blue-500"
            aria-hidden="true"
          />
          <h2 className="truncate text-[clamp(0.8rem,4cqw,1.125rem)] font-semibold text-zinc-900 dark:text-zinc-100">
            Tasks
          </h2>
          {!isMicro && (
            <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-[clamp(0.55rem,2.6cqw,0.75rem)] font-medium text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400">
              {stats.active} active
            </span>
          )}
        </div>
      </div>

      <div
        className="mb-[clamp(0.3rem,1.8cqh,0.75rem)] flex min-w-0 items-center gap-1 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800"
        role="group"
        aria-label="Task filters"
      >
        {filterItems.map(({ key, label, count }) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            aria-pressed={filter === key}
            className={`flex min-w-0 flex-1 items-center justify-center gap-[clamp(0.15rem,1cqw,0.375rem)] rounded-lg px-[clamp(0.25rem,2cqw,0.75rem)] py-[clamp(0.3rem,1.5cqh,0.375rem)] text-[clamp(0.55rem,2.7cqw,0.75rem)] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
              filter === key
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100"
                : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
            }`}
          >
            <span className="truncate">{label}</span>
            {!isMicro && <span className="shrink-0 opacity-60">{count}</span>}
          </button>
        ))}
      </div>

      <AddTaskInput />

      <div className="min-h-0 flex-1 space-y-[clamp(0.25rem,1.3cqh,0.5rem)] overflow-y-auto overscroll-contain pr-px">
        {isLoading ? (
          <div className="flex h-full min-h-16 flex-col items-center justify-center py-[clamp(0.75rem,5cqh,3rem)]">
            <Loader2
              size={isCompact ? 20 : 24}
              className={viewport.reducedMotion ? "text-blue-500" : "animate-spin text-blue-500"}
              aria-hidden="true"
            />
            {!isMicro && (
              <p className="mt-2 text-[clamp(0.65rem,3cqw,0.875rem)] text-zinc-400">
                Loading tasks...
              </p>
            )}
          </div>
        ) : (
          <AnimatePresence mode="popLayout" initial={false}>
            {filteredTasks.length === 0 ? (
              <motion.div
                initial={viewport.reducedMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex h-full min-h-16 flex-col items-center justify-center py-[clamp(0.5rem,4cqh,3rem)] text-center"
              >
                {filter === "active" ? (
                  <>
                    <div className="mb-[clamp(0.3rem,2cqh,0.75rem)] flex h-[clamp(2rem,16cqw,3rem)] w-[clamp(2rem,16cqw,3rem)] items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                      <CheckCircle2
                        size={isCompact ? 18 : 24}
                        className="text-green-500"
                        aria-hidden="true"
                      />
                    </div>
                    <p className="text-[clamp(0.65rem,3cqw,0.875rem)] font-medium text-zinc-400 dark:text-zinc-500">
                      All caught up!
                    </p>
                    {!isCompact && (
                      <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-600">
                        No active tasks remaining
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <div className="mb-[clamp(0.3rem,2cqh,0.75rem)] flex h-[clamp(2rem,16cqw,3rem)] w-[clamp(2rem,16cqw,3rem)] items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                      <Circle
                        size={isCompact ? 18 : 24}
                        className="text-zinc-300 dark:text-zinc-600"
                        aria-hidden="true"
                      />
                    </div>
                    <p className="text-[clamp(0.65rem,3cqw,0.875rem)] font-medium text-zinc-400 dark:text-zinc-500">
                      {filter === "completed" ? "No completed tasks" : "No tasks yet"}
                    </p>
                    {!isCompact && filter === "all" && (
                      <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-600">
                        Add your first task above
                      </p>
                    )}
                  </>
                )}
              </motion.div>
            ) : (
              filteredTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  isSelected={selectedTaskId === task.id}
                  onSelect={() =>
                    selectTask(selectedTaskId === task.id ? null : task.id)
                  }
                  onToggleComplete={() => toggleComplete(task.id)}
                  onDelete={() => setTaskToDelete(task.id)}
                  onUpdate={(updates: Partial<Task>) =>
                    updateTask(task.id, updates)
                  }
                  onCyclePriority={() => cyclePriority(task.id)}
                />
              ))
            )}
          </AnimatePresence>
        )}
      </div>

      <ConfirmDialog
        isOpen={taskToDelete !== null}
        title="Delete Task"
        message={`Are you sure you want to delete "${taskToDeleteTitle}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => setTaskToDelete(null)}
        variant="danger"
      />
    </div>
  );
};
