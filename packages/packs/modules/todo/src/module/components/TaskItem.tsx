import { memo, useState, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  type PanInfo,
} from "framer-motion";
import {
  Check,
  Trash2,
  Calendar,
  Clock,
  ChevronRight,
  GripVertical,
  ChevronsLeft,
  ChevronsRight,
  AlertExclamation,
  ArrowDown,
  Minus
} from "lucide-react";

import type { Task, Priority } from "../types";
import { priorityColors } from "../store";
import { DatePicker } from "./DatePicker";

const DELETE_THRESHOLD = 150;
const COMPLETE_THRESHOLD = -100;

const priorityRingColors: Record<Priority, string> = {
  low: "ring-blue-400",
  medium: "ring-yellow-400",
  high: "ring-red-500",
};

interface TaskItemProps {
  task: Task;
  isSelected: boolean;
  onSelect: () => void;
  onToggleComplete: () => void;
  onDelete: () => void;
  onUpdate: (updates: Partial<Task>) => void;
  onCyclePriority: () => void;
  draggable?: boolean;
}

function TaskItemComponent({
  task,
  isSelected,
  onSelect,
  onToggleComplete,
  onDelete,
  onUpdate,
  onCyclePriority,
  draggable = true,
}: TaskItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [priorityPulse, setPriorityPulse] = useState(false);
  const constraintsRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (e: React.DragEvent) => {
    if (!draggable) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData("text/plain", task.id);
    e.dataTransfer.setData("application/x-task-id", task.id);
    e.dataTransfer.effectAllowed = "move";
  };

  const x = useMotionValue(0);
  const background = useTransform(
    x,
    [-DELETE_THRESHOLD, -50, 0, 50, DELETE_THRESHOLD],
    [
      "rgba(239, 68, 68, 0.3)",
      "rgba(239, 68, 68, 0.1)",
      "transparent",
      "rgba(34, 197, 94, 0.1)",
      "rgba(34, 197, 94, 0.3)",
    ]
  );
  const deleteOpacity = useTransform(x, [50, DELETE_THRESHOLD], [0, 1]);
  const completeOpacity = useTransform(x, [-50, COMPLETE_THRESHOLD], [0, 1]);

  const isOverdue =
    task.dueDate && !task.completed && new Date(task.dueDate) < new Date();

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const offset = info.offset.x;

    if (offset > DELETE_THRESHOLD) {
      onDelete();
    } else if (offset < COMPLETE_THRESHOLD) {
      onToggleComplete();
    }
  };

  const handlePriorityClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPriorityPulse(true);
    onCyclePriority();
    setTimeout(() => setPriorityPulse(false), 300);
  };

  return (
    <motion.div
      ref={constraintsRef}
      className="relative overflow-hidden rounded-xl"
      style={{ background }}
    >
      <motion.div
        className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2"
        style={{ opacity: completeOpacity }}
      >
        <Check className="w-5 h-5 text-green-500" />
        <span className="text-xs font-medium text-green-600">
          {task.completed ? "Undo" : "Done"}
        </span>
      </motion.div>

      <motion.div
        className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2"
        style={{ opacity: deleteOpacity }}
      >
        <span className="text-xs font-medium text-red-500">Delete</span>
        <Trash2 className="w-5 h-5 text-red-500" />
      </motion.div>

      <div draggable={draggable} onDragStart={handleDragStart}>
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.5}
          onDragEnd={handleDragEnd}
          style={{ x }}
          whileDrag={{ cursor: "grabbing" }}
          layout
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, x: -100, height: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={
            `group relative rounded-xl border transition-all duration-200 cursor-pointer ` +
            `${
              isSelected
                ? "border-blue-300 dark:border-blue-600 bg-blue-50/50 dark:bg-blue-900/20 shadow-sm"
                : "border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700 bg-white dark:bg-zinc-800/50"
            } ` +
            `${task.completed ? "opacity-60" : ""}`
          }
        >
          <div className="flex items-start gap-3 p-3">
            <div className="shrink-0 opacity-0 group-hover:opacity-40 cursor-grab transition-opacity pt-0.5">
              <GripVertical size={14} className="text-zinc-400" />
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleComplete();
              }}
              className={
                `shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ` +
                `${
                  task.completed
                    ? "bg-green-500 border-green-500 text-white"
                    : "border-zinc-300 dark:border-zinc-600 hover:border-green-400 dark:hover:border-green-500"
                }`
              }
            >
              <AnimatePresence>
                {task.completed && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    <Check size={12} strokeWidth={3} />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>

            <div className="flex-1 min-w-0" onClick={onSelect}>
              <div className="flex items-center gap-2">
                <motion.button
                  type="button"
                  onClick={handlePriorityClick}
                  whileTap={{ scale: 1.3 }}
                  animate={priorityPulse ? { scale: [1, 1.5, 1] } : {}}
                  transition={{ duration: 0.2 }}
                  className={
                    `w-4 h-4 rounded-full flex items-center justify-center shrink-0 cursor-pointer transition-colors duration-200 ` +
                    `ring-2 ring-offset-1 ring-offset-white dark:ring-offset-zinc-800 ` +
                    `${priorityColors[task.priority]} ${priorityRingColors[task.priority]} hover:scale-110`
                  }
                  title={`Priority: ${task.priority} (click to cycle)`}
                >
                  {task.priority === "high" && <Minus className="w-3 h-3 text-white transform rotate-90" />}
                  {task.priority === "medium" && <Minus className="w-3 h-3 text-white" />}
                  {task.priority === "low" && <ArrowDown className="w-3 h-3 text-white" />}
                </motion.button>

                <span
                  className={
                    `text-sm font-medium truncate ` +
                    `${
                      task.completed
                        ? "line-through text-zinc-400 dark:text-zinc-500"
                        : "text-zinc-900 dark:text-zinc-100"
                    }`
                  }
                >
                  {task.title}
                </span>
              </div>

              {task.dueDate && (
                <div
                  className={
                    `flex items-center gap-1 mt-1 text-xs ` +
                    `${isOverdue ? "text-red-500" : "text-zinc-400"}`
                  }
                >
                  <Calendar size={12} />
                  <span>{formatDate(task.dueDate)}</span>
                </div>
              )}

              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-3 space-y-2"
                  >
                    <textarea
                      value={task.description ?? ""}
                      onChange={(e) =>
                        onUpdate({ description: e.target.value })
                      }
                      placeholder="Add description..."
                      className="w-full p-2 text-xs bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-700 rounded-lg text-zinc-700 dark:text-zinc-300 placeholder-zinc-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={2}
                    />

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-xs text-zinc-400">
                        <Clock size={12} />
                        <span>Dates</span>
                      </div>
                      <DatePicker
                        value={task.startDate}
                        onChange={(d) => onUpdate({ startDate: d })}
                        placeholder="Start"
                        className="w-28"
                      />
                      <span className="text-zinc-400">→</span>
                      <DatePicker
                        value={task.dueDate}
                        onChange={(d) => onUpdate({ dueDate: d })}
                        placeholder="Due"
                        minDate={task.startDate}
                        className="w-28"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.div
              initial={false}
              animate={{ opacity: isHovered ? 1 : 0 }}
              className="shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <div className="flex flex-col items-center justify-center mr-1 text-zinc-300">
                <ChevronsLeft size={12} className="opacity-50" />
                <span className="text-[8px] uppercase tracking-tighter">Swipe</span>
                <ChevronsRight size={12} className="opacity-50" />
              </div>
              
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleComplete();
                  }}
                  className="p-1.5 rounded-md hover:bg-green-500/10 text-zinc-400 hover:text-green-500 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
                  aria-label="Complete task"
                >
                  <Check size={14} />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="p-1.5 rounded-md hover:bg-red-500/10 text-zinc-400 hover:text-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                  aria-label="Delete task"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export const TaskItem = memo(TaskItemComponent);
