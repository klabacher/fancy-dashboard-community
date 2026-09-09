import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ChevronDown, CheckCircle } from "lucide-react";

import { useWidgetViewport } from "@fancydashboard/sdk";
import type { Priority } from "../types";
import { priorityColors, priorityLabels } from "../store";
import { DatePicker } from "./DatePicker";

interface AddTaskInputProps {
  onAdd: (task: {
    title: string;
    description?: string;
    priority: Priority;
    completed: boolean;
    startDate?: string;
    dueDate?: string;
  }) => void;
}

export const AddTaskInput: React.FC<AddTaskInputProps> = ({ onAdd }) => {
  const viewport = useWidgetViewport();
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [startDate, setStartDate] = useState<string | undefined>();
  const [dueDate, setDueDate] = useState<string | undefined>();
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isMicro = viewport.size === "micro";
  const isCompact =
    isMicro ||
    viewport.size === "compact" ||
    viewport.isNarrow ||
    viewport.isShort;

  const handleSubmit = () => {
    if (!title.trim()) return;

    onAdd({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      completed: false,
      startDate,
      dueDate,
    });

    setTitle("");
    setDescription("");
    setPriority("medium");
    setStartDate(undefined);
    setDueDate(undefined);
    setIsExpanded(false);

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
    if (event.key === "Escape") {
      setIsExpanded(false);
    }
  };

  return (
    <div className="relative mb-[clamp(0.3rem,1.8cqh,0.75rem)] min-w-0">
      <AnimatePresence initial={false}>
        {showSuccess && !isMicro && (
          <motion.div
            initial={
              viewport.reducedMotion
                ? false
                : { opacity: 0, y: 10, scale: 0.9 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: viewport.reducedMotion ? 0 : -10 }}
            className="absolute -top-10 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-green-500 px-3 py-1.5 text-xs font-medium text-white shadow-lg"
            role="status"
          >
            <CheckCircle size={14} aria-hidden="true" />
            Task added
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait" initial={false}>
        {!isExpanded ? (
          <motion.button
            key="collapsed"
            type="button"
            initial={viewport.reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setIsExpanded(true);
              setTimeout(() => inputRef.current?.focus(), 50);
            }}
            className="flex w-full min-w-0 items-center justify-center gap-2 rounded-xl border-2 border-dashed border-zinc-200 px-[clamp(0.4rem,2.5cqw,0.75rem)] py-[clamp(0.35rem,2cqh,0.625rem)] text-zinc-400 transition-colors hover:border-zinc-300 hover:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-zinc-700 dark:hover:border-zinc-600"
          >
            <Plus size={isCompact ? 15 : 18} aria-hidden="true" />
            <span className="truncate text-[clamp(0.65rem,3.2cqw,0.875rem)] font-medium">
              {isMicro ? "Add" : "Add a task"}
            </span>
          </motion.button>
        ) : (
          <motion.div
            key="expanded"
            initial={
              viewport.reducedMotion ? false : { opacity: 0, height: 0 }
            }
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: viewport.reducedMotion ? "auto" : 0 }}
            className="max-h-full min-w-0 overflow-y-auto rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-800"
          >
            <div className="space-y-[clamp(0.4rem,2cqh,0.75rem)] p-[clamp(0.45rem,2.5cqw,0.75rem)]">
              <input
                ref={inputRef}
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Task title..."
                className="w-full min-w-0 border-none bg-transparent px-0 py-1 text-[clamp(0.7rem,3.2cqw,0.875rem)] font-medium text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-0 dark:text-zinc-100"
              />

              {!isMicro && (
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Add description (optional)"
                  rows={isCompact ? 1 : 2}
                  className="w-full min-w-0 resize-none border-none bg-transparent px-0 py-1 text-[clamp(0.65rem,3cqw,0.875rem)] text-zinc-600 placeholder-zinc-400 focus:outline-none focus:ring-0 dark:text-zinc-400"
                />
              )}

              <div
                className={`flex min-w-0 gap-2 ${
                  isCompact ? "flex-col items-stretch" : "flex-wrap items-center"
                }`}
              >
                <div className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowPriorityMenu(!showPriorityMenu)}
                    aria-expanded={showPriorityMenu}
                    className="flex items-center gap-1.5 rounded-lg bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:bg-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-600"
                  >
                    <div
                      className={`h-2 w-2 rounded-full ${priorityColors[priority]}`}
                      aria-hidden="true"
                    />
                    {priorityLabels[priority]}
                    <ChevronDown size={12} aria-hidden="true" />
                  </button>

                  <AnimatePresence initial={false}>
                    {showPriorityMenu && (
                      <motion.div
                        initial={
                          viewport.reducedMotion ? false : { opacity: 0, y: -5 }
                        }
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: viewport.reducedMotion ? 0 : -5 }}
                        className="absolute left-0 top-full z-20 mt-1 min-w-28 rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-800"
                      >
                        {(["low", "medium", "high"] as Priority[]).map(
                          (candidate) => (
                            <button
                              key={candidate}
                              type="button"
                              onClick={() => {
                                setPriority(candidate);
                                setShowPriorityMenu(false);
                              }}
                              className="flex w-full items-center gap-2 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 dark:text-zinc-400 dark:hover:bg-zinc-700"
                            >
                              <div
                                className={`h-2 w-2 rounded-full ${priorityColors[candidate]}`}
                                aria-hidden="true"
                              />
                              {priorityLabels[candidate]}
                            </button>
                          )
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {!isMicro && (
                  <div
                    className={`flex min-w-0 gap-2 ${
                      isCompact ? "flex-col" : "flex-1 items-center"
                    }`}
                  >
                    <DatePicker
                      value={startDate}
                      onChange={setStartDate}
                      placeholder="Start"
                      className="min-w-0 flex-1"
                    />
                    {!isCompact && (
                      <span className="shrink-0 text-zinc-400" aria-hidden="true">
                        →
                      </span>
                    )}
                    <DatePicker
                      value={dueDate}
                      onChange={setDueDate}
                      placeholder="Due"
                      minDate={startDate}
                      className="min-w-0 flex-1"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-zinc-100 bg-zinc-50 px-[clamp(0.45rem,2.5cqw,0.75rem)] py-[clamp(0.35rem,1.7cqh,0.5rem)] dark:border-zinc-700 dark:bg-zinc-900/50">
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="rounded-md px-2 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!title.trim()}
                className="rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isMicro ? "Add" : "Add Task"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
