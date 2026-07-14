// ============================================================================
// CalendarCompact Component
// Compact view for 1x1 and 1x2 widget sizes
// Shows current day and a small task list
// ============================================================================

import { memo, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { Calendar, ChevronRight } from "lucide-react";
import type { CalendarConfig } from "../types";
import { FONT_FAMILY_CLASSES, FONT_WEIGHT_CLASSES } from "../types";
import { useCalendarStore } from "../store";
import { useTodoStore } from "@fancydashboard/pack-module-todo";

// ============================================================================
// Types
// ============================================================================

interface CalendarCompactProps {
  config: CalendarConfig;
  size: "1x1" | "1x2";
}

// ============================================================================
// 1x1 Compact - Just today's date
// ============================================================================

const TodayOnly = memo(function TodayOnly({
  config,
}: {
  config: CalendarConfig;
}) {
  const today = new Date();
  const tasks = useTodoStore((s) => s.tasks);
  const setFilterDate = useTodoStore((s) => s.setFilterDate);
  const { selectDate } = useCalendarStore();

  const todayStr = format(today, "yyyy-MM-dd");
  const todayTasks = useMemo(
    () => tasks.filter((t) => t.dueDate?.startsWith(todayStr) && !t.completed),
    [tasks, todayStr]
  );

  const handleClick = () => {
    selectDate(today);
    setFilterDate(todayStr);
  };

  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="w-full h-full flex flex-col items-center justify-center gap-1 p-2"
    >
      {/* Day of week */}
      <span
        className={`
          text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400
          ${FONT_FAMILY_CLASSES[config.typography.dayNames.fontFamily]}
          ${FONT_WEIGHT_CLASSES[config.typography.dayNames.weight]}
        `}
      >
        {format(today, "EEE")}
      </span>

      {/* Day number with today indicator */}
      <motion.div
        className="relative"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <span
          className={`
            text-4xl
            ${FONT_FAMILY_CLASSES[config.typography.dateNumbers.fontFamily]}
            ${FONT_WEIGHT_CLASSES["bold"]}
          `}
          style={{ color: config.colors.todayColor }}
        >
          {format(today, "d")}
        </span>
      </motion.div>

      {/* Month */}
      <span
        className={`
          text-xs text-zinc-600 dark:text-zinc-400
          ${FONT_FAMILY_CLASSES[config.typography.monthTitle.fontFamily]}
        `}
      >
        {format(today, "MMM")}
      </span>

      {/* Task count indicator */}
      {todayTasks.length > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30"
        >
          <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400">
            {todayTasks.length} task{todayTasks.length > 1 ? "s" : ""}
          </span>
        </motion.div>
      )}
    </motion.button>
  );
});

// ============================================================================
// 1x2 Compact - Today + small task list
// ============================================================================

const TodayWithTasks = memo(function TodayWithTasks({
  config,
}: {
  config: CalendarConfig;
}) {
  const today = new Date();
  const tasks = useTodoStore((s) => s.tasks);
  const setFilterDate = useTodoStore((s) => s.setFilterDate);
  const { selectDate } = useCalendarStore();

  const todayStr = format(today, "yyyy-MM-dd");
  const todayTasks = useMemo(
    () => tasks.filter((t) => t.dueDate?.startsWith(todayStr)),
    [tasks, todayStr]
  );

  const getPriorityColor = (priority: "low" | "medium" | "high") => {
    switch (priority) {
      case "low":
        return config.colors.priorityLow;
      case "medium":
        return config.colors.priorityMedium;
      case "high":
        return config.colors.priorityHigh;
    }
  };

  const handleClick = () => {
    selectDate(today);
    setFilterDate(todayStr);
  };

  return (
    <div className="w-full h-full flex flex-col p-3 gap-2">
      {/* Today Header */}
      <motion.button
        onClick={handleClick}
        whileHover={{ scale: 1.01 }}
        className="flex items-center gap-3 p-2 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20"
      >
        {/* Calendar icon with date */}
        <div className="relative">
          <Calendar size={32} className="text-blue-500" />
          <span
            className="absolute inset-0 flex items-center justify-center text-xs font-bold mt-1"
            style={{ color: config.colors.todayColor }}
          >
            {format(today, "d")}
          </span>
        </div>

        {/* Date info */}
        <div className="flex-1 text-left">
          <p
            className={`
              text-sm font-semibold text-zinc-900 dark:text-zinc-100
              ${FONT_FAMILY_CLASSES[config.typography.monthTitle.fontFamily]}
            `}
          >
            {format(today, "EEEE")}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {format(today, "MMMM d, yyyy")}
          </p>
        </div>

        <ChevronRight size={16} className="text-zinc-400" />
      </motion.button>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto space-y-1">
        <AnimatePresence mode="popLayout">
          {todayTasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full text-center py-2"
            >
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                No tasks for today
              </p>
            </motion.div>
          ) : (
            todayTasks.slice(0, config.compactMaxTasks).map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ delay: index * 0.05 }}
                className={`
                  flex items-center gap-2 px-2 py-1.5 rounded-lg
                  ${task.completed ? "opacity-50" : ""}
                  bg-zinc-50 dark:bg-zinc-800/50
                `}
              >
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: getPriorityColor(task.priority) }}
                />
                <span
                  className={`
                    text-xs truncate flex-1
                    ${task.completed ? "line-through text-zinc-400" : "text-zinc-700 dark:text-zinc-300"}
                  `}
                >
                  {task.title}
                </span>
              </motion.div>
            ))
          )}
        </AnimatePresence>

        {todayTasks.length > config.compactMaxTasks && (
          <p className="text-[10px] text-center text-zinc-400 dark:text-zinc-500">
            +{todayTasks.length - config.compactMaxTasks} more
          </p>
        )}
      </div>
    </div>
  );
});

// ============================================================================
// Main Component
// ============================================================================

export const CalendarCompact = memo(function CalendarCompact({
  config,
  size,
}: CalendarCompactProps) {
  if (size === "1x1") {
    return <TodayOnly config={config} />;
  }

  return <TodayWithTasks config={config} />;
});

export default CalendarCompact;
