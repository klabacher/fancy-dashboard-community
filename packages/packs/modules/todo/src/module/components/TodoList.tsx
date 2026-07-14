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

import { useTodoStore } from "../store";
import { TaskItem } from "./TaskItem";
import { AddTaskInput } from "./AddTaskInput";
import { ConfirmDialog } from "./ConfirmDialog";
import type { Task } from "../types";

type FilterType = "all" | "active" | "completed";

export const TodoList: React.FC = () => {
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

  useEffect(() => {
    void initialize();
  }, [initialize]);

  const filterDateDisplay = useMemo(() => {
    if (!filterDate) return null;
    try {
      const date = parseISO(filterDate);
      if (!isValid(date)) return null;
      return format(date, "MMMM d, yyyy");
    } catch {
      return null;
    }
  }, [filterDate]);

  const filteredTasks = useMemo(() => {
    let result = tasks;

    if (filterDate) {
      result = result.filter((t) => t.dueDate === filterDate);
    }

    switch (filter) {
      case "active":
        return result.filter((t) => !t.completed);
      case "completed":
        return result.filter((t) => t.completed);
      default:
        return result;
    }
  }, [tasks, filter, filterDate]);

  const stats = useMemo(
    () => ({
      total: tasks.length,
      active: tasks.filter((t) => !t.completed).length,
      completed: tasks.filter((t) => t.completed).length,
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
    tasks.find((t) => t.id === taskToDelete)?.title || "";

  return (
    <div className="flex flex-col h-full">
      <AnimatePresence>
        {filterDate && filterDateDisplay && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 overflow-hidden"
          >
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-blue-500" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Tasks for {filterDateDisplay}
                </span>
              </div>
              <motion.button
                type="button"
                onClick={() => setFilterDate(null)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-1 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800 text-blue-500"
              >
                <X size={14} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ListTodo size={20} className="text-blue-500" />
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Tasks
          </h2>
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400">
            {stats.active} active
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 mb-4 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800">
        {(
          [
            { key: "all", label: "All", count: stats.total },
            { key: "active", label: "Active", count: stats.active },
            { key: "completed", label: "Done", count: stats.completed },
          ] as const
        ).map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={
              `flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ` +
              `${
                filter === key
                  ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`
            }
          >
            {label}
            <span className="opacity-60">{count}</span>
          </button>
        ))}
      </div>

      <AddTaskInput onAdd={addTask} />

      <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 size={24} className="text-blue-500 animate-spin" />
            <p className="text-sm text-zinc-400 mt-2">Loading tasks...</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredTasks.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                {filter === "all" ? (
                  <>
                    <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-3">
                      <Circle
                        size={24}
                        className="text-zinc-300 dark:text-zinc-600"
                      />
                    </div>
                    <p className="text-sm font-medium text-zinc-400 dark:text-zinc-500">
                      No tasks yet
                    </p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-1">
                      Add your first task above
                    </p>
                  </>
                ) : filter === "active" ? (
                  <>
                    <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-3">
                      <CheckCircle2 size={24} className="text-green-500" />
                    </div>
                    <p className="text-sm font-medium text-zinc-400 dark:text-zinc-500">
                      All caught up!
                    </p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-1">
                      No active tasks remaining
                    </p>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-3">
                      <Circle
                        size={24}
                        className="text-zinc-300 dark:text-zinc-600"
                      />
                    </div>
                    <p className="text-sm font-medium text-zinc-400 dark:text-zinc-500">
                      No completed tasks
                    </p>
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
