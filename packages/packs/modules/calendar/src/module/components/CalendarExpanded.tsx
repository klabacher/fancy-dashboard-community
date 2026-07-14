// ============================================================================
// CalendarExpanded Component
// Expanded view for 4x4 widget size with inline task details
// ============================================================================

import { memo, useMemo, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  CalendarDays,
  Settings,
  Check,
} from "lucide-react";
import type { CalendarConfig, DayData } from "../types";
import {
  FONT_FAMILY_CLASSES,
  FONT_WEIGHT_CLASSES,
  CELL_SHAPE_CLASSES,
} from "../types";
import {
  useCalendarStore,
  generateCalendarGrid,
  formatMonthYear,
  getDayNames,
} from "../store";
import { useTodoStore } from "@fancydashboard/pack-module-todo";

// ============================================================================
// Types
// ============================================================================

interface CalendarExpandedProps {
  config: CalendarConfig;
  onOpenSettings: () => void;
}

// ============================================================================
// Expanded Day Cell with Inline Tasks
// ============================================================================

interface ExpandedDayCellProps {
  day: DayData;
  config: CalendarConfig;
  onSelect: (date: Date) => void;
  isDropTarget: boolean;
  onDragOver: (date: Date) => void;
  onDragLeave: () => void;
  onDrop: (date: Date) => void;
}

const ExpandedDayCell = memo(function ExpandedDayCell({
  day,
  config,
  onSelect,
  isDropTarget,
  onDragOver,
  onDragLeave,
  onDrop,
}: ExpandedDayCellProps) {
  const { colors, geometry, typography } = config;
  const toggleComplete = useTodoStore((s) => s.toggleComplete);

  const opacity = day.isCurrentMonth
    ? colors.activeMonthOpacity / 100
    : colors.inactiveMonthOpacity / 100;

  const getPriorityColor = (priority: "low" | "medium" | "high") => {
    switch (priority) {
      case "low":
        return colors.priorityLow;
      case "medium":
        return colors.priorityMedium;
      case "high":
        return colors.priorityHigh;
    }
  };

  const todayStyles = useMemo(() => {
    if (!day.isToday) return {};
    switch (colors.todayStyle) {
      case "solid":
        return { backgroundColor: colors.todayColor, color: "#ffffff" };
      case "border":
        return { border: `2px solid ${colors.todayColor}` };
      case "glow":
        return {
          boxShadow: `0 0 8px 1px ${colors.todayColor}60`,
          border: `1px solid ${colors.todayColor}`,
        };
      default:
        return {};
    }
  }, [day.isToday, colors.todayStyle, colors.todayColor]);

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      onDragOver(day.date);
    },
    [onDragOver, day.date]
  );

  return (
    <motion.div
      layout
      onClick={() => onSelect(day.date)}
      onDragOver={config.enableDragDrop ? handleDragOver : undefined}
      onDragLeave={config.enableDragDrop ? onDragLeave : undefined}
      onDrop={
        config.enableDragDrop
          ? (e) => {
              e.preventDefault();
              onDrop(day.date);
            }
          : undefined
      }
      className={`
        flex flex-col h-full min-h-[80px] p-1.5 rounded-lg transition-all cursor-pointer
        ${day.isSelected ? "ring-2 ring-offset-1 dark:ring-offset-zinc-900" : ""}
        ${isDropTarget ? "bg-blue-100 dark:bg-blue-900/30" : "hover:bg-zinc-100 dark:hover:bg-zinc-800/50"}
        ${day.isWeekend && !day.isToday ? "bg-zinc-50/50 dark:bg-zinc-800/30" : ""}
      `}
      style={{
        opacity,
        ...(day.isSelected && { ringColor: colors.selectionColor }),
      }}
    >
      {/* Date Number */}
      <div className="flex items-center justify-between mb-1">
        <span
          className={`
            flex items-center justify-center w-6 h-6 text-xs
            ${FONT_FAMILY_CLASSES[typography.dateNumbers.fontFamily]}
            ${FONT_WEIGHT_CLASSES[typography.dateNumbers.weight]}
            ${CELL_SHAPE_CLASSES[geometry.cellShape]}
          `}
          style={todayStyles}
        >
          {format(day.date, "d")}
        </span>

        {day.tasks.length > 0 && (
          <span className="text-[10px] text-zinc-400">{day.tasks.length}</span>
        )}
      </div>

      {/* Inline Tasks */}
      <div className="flex-1 overflow-hidden space-y-0.5">
        {day.tasks.slice(0, 3).map((task) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`
              group flex items-center gap-1 px-1 py-0.5 rounded text-[10px] truncate
              ${task.completed ? "opacity-50" : ""}
            `}
            style={{
              backgroundColor: `${getPriorityColor(task.priority)}20`,
              borderLeft: `2px solid ${getPriorityColor(task.priority)}`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleComplete(task.id);
              }}
              className={`
                w-3 h-3 rounded-sm border flex items-center justify-center shrink-0
                ${task.completed ? "bg-green-500 border-green-500" : "border-zinc-300 dark:border-zinc-600 hover:border-green-500"}
              `}
            >
              {task.completed && <Check size={8} className="text-white" />}
            </button>
            <span
              className={`truncate ${task.completed ? "line-through" : ""} text-zinc-700 dark:text-zinc-300`}
            >
              {task.title}
            </span>
          </motion.div>
        ))}

        {day.tasks.length > 3 && (
          <span className="text-[9px] text-zinc-400 pl-1">
            +{day.tasks.length - 3} more
          </span>
        )}
      </div>
    </motion.div>
  );
});

// ============================================================================
// Main Component
// ============================================================================

export const CalendarExpanded = memo(function CalendarExpanded({
  config,
  onOpenSettings,
}: CalendarExpandedProps) {
  const {
    currentDate,
    selectedDate,
    view,
    goToPrevMonth,
    goToNextMonth,
    goToToday,
    setView,
    toggleDateSelection,
    draggedTaskId,
    dropTargetDate,
    setDropTarget,
    endDrag,
  } = useCalendarStore();

  const tasks = useTodoStore((s) => s.tasks);
  const updateTaskDueDate = useTodoStore((s) => s.updateTaskDueDate);
  const setFilterDate = useTodoStore((s) => s.setFilterDate);

  const [direction, setDirection] = useState(0);

  const days = useMemo(
    () =>
      generateCalendarGrid(
        currentDate,
        selectedDate,
        tasks,
        config.startWeekOnMonday
      ),
    [currentDate, selectedDate, tasks, config.startWeekOnMonday]
  );

  const dayNames = useMemo(
    () => getDayNames(config.startWeekOnMonday, false),
    [config.startWeekOnMonday]
  );

  const handleDateSelect = useCallback(
    (date: Date) => {
      toggleDateSelection(date);
      const dateStr = format(date, "yyyy-MM-dd");
      const currentFilter = useTodoStore.getState().filterDate;
      if (currentFilter === dateStr) {
        setFilterDate(null);
      } else {
        setFilterDate(dateStr);
      }
    },
    [toggleDateSelection, setFilterDate]
  );

  const handleDragOver = useCallback(
    (date: Date) => {
      if (draggedTaskId) {
        setDropTarget(date);
      }
    },
    [draggedTaskId, setDropTarget]
  );

  const handleDrop = useCallback(
    (date: Date) => {
      if (draggedTaskId) {
        const dateStr = format(date, "yyyy-MM-dd");
        updateTaskDueDate(draggedTaskId, dateStr);
        endDrag();
      }
    },
    [draggedTaskId, updateTaskDueDate, endDrag]
  );

  const gridVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 50 : -50, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -50 : 50, opacity: 0 }),
  };

  return (
    <div className="flex flex-col h-full p-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-3">
          <motion.h2
            key={formatMonthYear(currentDate)}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`
              text-lg font-semibold text-zinc-900 dark:text-zinc-100
              ${FONT_FAMILY_CLASSES[config.typography.monthTitle.fontFamily]}
            `}
          >
            {formatMonthYear(currentDate)}
          </motion.h2>
        </div>

        <div className="flex items-center gap-1">
          {/* View Toggle */}
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5 mr-2">
            <button
              onClick={() => setView("month")}
              className={`p-1.5 rounded-md transition-all ${view === "month" ? "bg-white dark:bg-zinc-700 shadow-sm" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}
            >
              <Calendar size={14} />
            </button>
            <button
              onClick={() => setView("week")}
              className={`p-1.5 rounded-md transition-all ${view === "week" ? "bg-white dark:bg-zinc-700 shadow-sm" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}
            >
              <CalendarDays size={14} />
            </button>
          </div>

          <button
            onClick={() => {
              setDirection(-1);
              goToPrevMonth();
            }}
            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={goToToday}
            className="px-2 py-1 text-xs font-medium rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
          >
            Today
          </button>
          <button
            onClick={() => {
              setDirection(1);
              goToNextMonth();
            }}
            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
          >
            <ChevronRight size={16} />
          </button>
          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 ml-2"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* Day Names */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {dayNames.map((dayName) => (
          <div
            key={dayName}
            className={`
              text-center py-1 text-xs text-zinc-500 dark:text-zinc-400
              ${FONT_FAMILY_CLASSES[config.typography.dayNames.fontFamily]}
              ${FONT_WEIGHT_CLASSES[config.typography.dayNames.weight]}
            `}
          >
            {dayName}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={`${currentDate.getMonth()}-${currentDate.getFullYear()}`}
            custom={direction}
            variants={gridVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="grid grid-cols-7 grid-rows-6 gap-1 h-full"
          >
            {days.map((day, index) => (
              <ExpandedDayCell
                key={`${day.date.toISOString()}-${index}`}
                day={day}
                config={config}
                onSelect={handleDateSelect}
                isDropTarget={
                  dropTargetDate
                    ? format(dropTargetDate, "yyyy-MM-dd") ===
                      format(day.date, "yyyy-MM-dd")
                    : false
                }
                onDragOver={handleDragOver}
                onDragLeave={() => setDropTarget(null)}
                onDrop={handleDrop}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
});

export default CalendarExpanded;
