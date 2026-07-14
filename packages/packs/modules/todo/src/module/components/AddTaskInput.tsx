import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ChevronDown, CheckCircle } from "lucide-react";

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
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [startDate, setStartDate] = useState<string | undefined>();
  const [dueDate, setDueDate] = useState<string | undefined>();
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === "Escape") {
      setIsExpanded(false);
    }
  };

  return (
    <div className="mb-4 relative">
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-green-500 text-white px-3 py-1.5 rounded-full shadow-lg z-50 text-xs font-medium"
          >
            <CheckCircle size={14} />
            Task added successfully
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          <motion.button
            key="collapsed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setIsExpanded(true);
              setTimeout(() => inputRef.current?.focus(), 50);
            }}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600 hover:text-zinc-500 transition-colors"
          >
            <Plus size={18} />
            <span className="text-sm font-medium">Add a task</span>
          </motion.button>
        ) : (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-sm overflow-hidden"
          >
            <div className="p-3 space-y-3">
              <input
                ref={inputRef}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Task title..."
                className="w-full px-0 py-1 bg-transparent text-sm font-medium text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 border-none focus:outline-none focus:ring-0"
              />

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add description (optional)"
                rows={2}
                className="w-full px-0 py-1 bg-transparent text-sm text-zinc-600 dark:text-zinc-400 placeholder-zinc-400 border-none focus:outline-none focus:ring-0 resize-none"
              />

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowPriorityMenu(!showPriorityMenu)}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors"
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${priorityColors[priority]}`}
                    />
                    {priorityLabels[priority]}
                    <ChevronDown size={12} />
                  </button>

                  <AnimatePresence>
                    {showPriorityMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="absolute top-full left-0 mt-1 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-lg z-10"
                      >
                        {(["low", "medium", "high"] as Priority[]).map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => {
                              setPriority(p);
                              setShowPriorityMenu(false);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                          >
                            <div
                              className={`w-2 h-2 rounded-full ${priorityColors[p]}`}
                            />
                            {priorityLabels[p]}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex items-center gap-2">
                  <DatePicker
                    value={startDate}
                    onChange={setStartDate}
                    placeholder="Start"
                    className="w-32"
                  />
                  <span className="text-zinc-400">→</span>
                  <DatePicker
                    value={dueDate}
                    onChange={setDueDate}
                    placeholder="Due"
                    minDate={startDate}
                    className="w-32"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 px-3 py-2 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-700">
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!title.trim()}
                className="px-3 py-1.5 text-xs font-medium text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                Add Task
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
