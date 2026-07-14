// ============================================================================
// CalendarGrid Component
// Main visual engine with month/week views, animations, and responsive layouts
// ============================================================================

import { memo, useMemo, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  CalendarDays,
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
  generateWeekGrid,
  formatMonthYear,
  formatWeekRange,
  getDayNames,
} from "../store";
import { useTodoStore } from "@fancydashboard/pack-module-todo";

// ============================================================================
// Day Cell Component
// ============================================================================

interface DayCellProps {
  day: DayData;
  config: CalendarConfig;
  onSelect: (date: Date) => void;
  isDropTarget: boolean;
  onDragOver: (date: Date) => void;
  onDragLeave: () => void;
  onDrop: (date: Date) => void;
}

const DayCell = memo(function DayCell({
  day,
  config,
  onSelect,
  isDropTarget,
  onDragOver,
  onDragLeave,
  onDrop,
}: DayCellProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const { colors, geometry, typography } = config;

  // Build opacity style
  const opacity = day.isCurrentMonth
    ? colors.activeMonthOpacity / 100
    : colors.inactiveMonthOpacity / 100;

  // Build today indicator styles
  const todayStyles = useMemo(() => {
    if (!day.isToday) return {};

    switch (colors.todayStyle) {
      case "solid":
        return {
          backgroundColor: colors.todayColor,
          color: "#ffffff",
        };
      case "border":
        return {
          border: `2px solid ${colors.todayColor}`,
        };
      case "glow":
        return {
          boxShadow: `0 0 12px 2px ${colors.todayColor}80`,
          border: `1px solid ${colors.todayColor}`,
        };
      default:
        return {};
    }
  }, [day.isToday, colors.todayStyle, colors.todayColor]);

  // Build selection styles
  const selectionStyles = useMemo(() => {
    if (!day.isSelected) return {};
    return {
      backgroundColor: `${colors.selectionColor}${Math.round(
        colors.selectionOpacity * 2.55
      )
        .toString(16)
        .padStart(2, "0")}`,
      border: `2px solid ${colors.selectionColor}`,
    };
  }, [day.isSelected, colors.selectionColor, colors.selectionOpacity]);

  // Priority colors
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

  const handleClick = useCallback(() => {
    onSelect(day.date);
  }, [onSelect, day.date]);

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      onDragOver(day.date);
    },
    [onDragOver, day.date]
  );

  const handleDragLeave = useCallback(() => {
    onDragLeave();
  }, [onDragLeave]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      onDrop(day.date);
    },
    [onDrop, day.date]
  );

  return (
    <motion.div
      layout
      className="relative flex flex-col items-center justify-start"
      style={{ padding: `${geometry.cellPadding}px` }}
      onMouseEnter={() => {
        setIsHovered(true);
        if (config.showTaskTooltips && day.tasks.length > 0) {
          setShowTooltip(true);
        }
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowTooltip(false);
      }}
      onDragOver={config.enableDragDrop ? handleDragOver : undefined}
      onDragLeave={config.enableDragDrop ? handleDragLeave : undefined}
      onDrop={config.enableDragDrop ? handleDrop : undefined}
    >
      {/* Day Number */}
      <motion.button
        onClick={handleClick}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className={`
          relative flex items-center justify-center w-8 h-8 transition-all duration-200
          ${CELL_SHAPE_CLASSES[geometry.cellShape]}
          ${FONT_FAMILY_CLASSES[typography.dateNumbers.fontFamily]}
          ${FONT_WEIGHT_CLASSES[typography.dateNumbers.weight]}
          ${day.isWeekend && !day.isToday && !day.isSelected ? "text-zinc-400 dark:text-zinc-500" : ""}
          ${isDropTarget ? "ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-zinc-900" : ""}
        `}
        style={{
          opacity,
          fontSize: `${typography.dateNumbers.size / 10}rem`,
          ...todayStyles,
          ...selectionStyles,
        }}
      >
        {format(day.date, "d")}

        {/* Hover highlight */}
        {isHovered && !day.isSelected && !day.isToday && (
          <motion.div
            layoutId="dayHover"
            className={`absolute inset-0 bg-zinc-200/50 dark:bg-zinc-700/50 ${CELL_SHAPE_CLASSES[geometry.cellShape]}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ zIndex: -1 }}
          />
        )}
      </motion.button>

      {/* Task Indicators */}
      {config.showTaskIndicators && day.tasks.length > 0 && (
        <div className="flex gap-0.5 mt-1">
          {day.tasks.slice(0, 3).map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`w-1.5 h-1.5 rounded-full ${task.completed ? "opacity-40" : ""}`}
              style={{ backgroundColor: getPriorityColor(task.priority) }}
            />
          ))}
          {day.tasks.length > 3 && (
            <span className="text-[8px] text-zinc-500">
              +{day.tasks.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Task Tooltip */}
      <AnimatePresence>
        {showTooltip && day.tasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 min-w-[160px] max-w-[240px] p-2 rounded-lg bg-white/90 dark:bg-zinc-800/90 backdrop-blur-xl border border-zinc-200 dark:border-zinc-700 shadow-xl"
          >
            <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 mb-1.5 pb-1 border-b border-zinc-200 dark:border-zinc-700">
              {format(day.date, "EEEE, MMM d")}
            </p>
            <div className="space-y-1 max-h-[120px] overflow-y-auto">
              {day.tasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-center gap-2 text-xs ${task.completed ? "opacity-50 line-through" : ""}`}
                >
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: getPriorityColor(task.priority) }}
                  />
                  <span className="text-zinc-700 dark:text-zinc-300 truncate">
                    {task.title}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

// ============================================================================
// Calendar Header Component
// ============================================================================

interface CalendarHeaderProps {
  config: CalendarConfig;
  currentDate: Date;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onViewChange: (view: "month" | "week") => void;
}

const CalendarHeader = memo(function CalendarHeader({
  config,
  currentDate,
  onPrev,
  onNext,
  onToday,
  onViewChange,
}: CalendarHeaderProps) {
  const { typography } = config;

  const title =
    config.view === "month"
      ? formatMonthYear(currentDate)
      : formatWeekRange(currentDate, config.startWeekOnMonday);

  return (
    <div className="flex items-center justify-between mb-3">
      {/* Title */}
      <motion.h2
        key={title}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className={`
          ${FONT_FAMILY_CLASSES[typography.monthTitle.fontFamily]}
          ${FONT_WEIGHT_CLASSES[typography.monthTitle.weight]}
          text-zinc-900 dark:text-zinc-100
        `}
        style={{ fontSize: `${typography.monthTitle.size / 10}rem` }}
      >
        {title}
      </motion.h2>

      {/* Controls */}
      <div className="flex items-center gap-1">
        {/* View Toggle */}
        <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5 mr-2">
          <button
            onClick={() => onViewChange("month")}
            className={`
              p-1.5 rounded-md transition-all
              ${config.view === "month" ? "bg-white dark:bg-zinc-700 shadow-sm" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}
            `}
          >
            <Calendar size={14} />
          </button>
          <button
            onClick={() => onViewChange("week")}
            className={`
              p-1.5 rounded-md transition-all
              ${config.view === "week" ? "bg-white dark:bg-zinc-700 shadow-sm" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}
            `}
          >
            <CalendarDays size={14} />
          </button>
        </div>

        {/* Navigation */}
        <button
          onClick={onPrev}
          className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors"
        >
          <ChevronLeft size={16} />
        </button>

        <button
          onClick={onToday}
          className="px-2 py-1 text-xs font-medium rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors"
        >
          Today
        </button>

        <button
          onClick={onNext}
          className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
});

// ============================================================================
// Main CalendarGrid Component
// ============================================================================

interface CalendarGridProps {
  config: CalendarConfig;
}

export const CalendarGrid = memo(function CalendarGrid({
  config,
}: CalendarGridProps) {
  const {
    currentDate,
    selectedDate,
    view,
    goToPrevMonth,
    goToNextMonth,
    goToPrevWeek,
    goToNextWeek,
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

  // Generate grid data
  const days = useMemo(() => {
    if (view === "week") {
      return generateWeekGrid(
        currentDate,
        selectedDate,
        tasks,
        config.startWeekOnMonday
      );
    }
    return generateCalendarGrid(
      currentDate,
      selectedDate,
      tasks,
      config.startWeekOnMonday
    );
  }, [currentDate, selectedDate, tasks, config.startWeekOnMonday, view]);

  const dayNames = useMemo(
    () => getDayNames(config.startWeekOnMonday),
    [config.startWeekOnMonday]
  );

  // Navigation handlers
  const handlePrev = useCallback(() => {
    if (view === "week") {
      goToPrevWeek();
    } else {
      goToPrevMonth();
    }
  }, [view, goToPrevWeek, goToPrevMonth]);

  const handleNext = useCallback(() => {
    if (view === "week") {
      goToNextWeek();
    } else {
      goToNextMonth();
    }
  }, [view, goToNextWeek, goToNextMonth]);

  // Date selection handler - also filters todo list
  const handleDateSelect = useCallback(
    (date: Date) => {
      toggleDateSelection(date);
      // Update todo filter
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

  // Drag and drop handlers
  const handleDragOver = useCallback(
    (date: Date) => {
      if (draggedTaskId) {
        setDropTarget(date);
      }
    },
    [draggedTaskId, setDropTarget]
  );

  const handleDragLeave = useCallback(() => {
    setDropTarget(null);
  }, [setDropTarget]);

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

  // Animation direction tracking
  const [direction, setDirection] = useState(0);

  const handlePrevWithDirection = useCallback(() => {
    setDirection(-1);
    handlePrev();
  }, [handlePrev]);

  const handleNextWithDirection = useCallback(() => {
    setDirection(1);
    handleNext();
  }, [handleNext]);

  // Grid animation variants
  const gridVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -100 : 100,
      opacity: 0,
    }),
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <CalendarHeader
        config={config}
        currentDate={currentDate}
        onPrev={handlePrevWithDirection}
        onNext={handleNextWithDirection}
        onToday={goToToday}
        onViewChange={setView}
      />

      {/* Day Names */}
      <div
        className="grid grid-cols-7 mb-1"
        style={{ gap: `${config.geometry.gridGap}px` }}
      >
        {dayNames.map((dayName) => (
          <div
            key={dayName}
            className={`
              text-center py-1 text-zinc-500 dark:text-zinc-400
              ${FONT_FAMILY_CLASSES[config.typography.dayNames.fontFamily]}
              ${FONT_WEIGHT_CLASSES[config.typography.dayNames.weight]}
            `}
            style={{ fontSize: `${config.typography.dayNames.size / 10}rem` }}
          >
            {dayName}
          </div>
        ))}
      </div>

      {/* Calendar Grid with Animation */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={`${currentDate.getMonth()}-${currentDate.getFullYear()}-${view}`}
            custom={direction}
            variants={gridVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            className={`
              grid grid-cols-7 h-full
              ${view === "week" ? "grid-rows-1" : "grid-rows-6"}
            `}
            style={{
              gap: `${config.geometry.gridGap}px`,
              backgroundColor:
                config.colors.tintOpacity > 0
                  ? `${config.colors.tintColor}${Math.round(
                      config.colors.tintOpacity * 2.55
                    )
                      .toString(16)
                      .padStart(2, "0")}`
                  : undefined,
            }}
          >
            {days.map((day, index) => (
              <DayCell
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
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
});

export default CalendarGrid;
