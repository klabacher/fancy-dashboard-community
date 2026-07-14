// ============================================================================
// Calendar Widget Store
// Global state for calendar-todo integration and UI state
// ============================================================================

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  isToday,
  isWeekend,
  getWeek,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  format,
} from "date-fns";
import type { Task } from "../todo/types";
import type { CalendarView, DayData } from "./types";

// ============================================================================
// Store Types
// ============================================================================

interface CalendarState {
  // Current view date (the month/week being displayed)
  currentDate: Date;

  // Selected date (for filtering todo list)
  selectedDate: Date | null;

  // Current view mode
  view: CalendarView;

  // Settings panel open state
  isSettingsOpen: boolean;

  // Drag state for task drag-drop
  draggedTaskId: string | null;
  dropTargetDate: Date | null;
}

interface CalendarActions {
  // Navigation
  setCurrentDate: (date: Date) => void;
  goToToday: () => void;
  goToNextMonth: () => void;
  goToPrevMonth: () => void;
  goToNextWeek: () => void;
  goToPrevWeek: () => void;

  // Selection
  selectDate: (date: Date | null) => void;
  toggleDateSelection: (date: Date) => void;
  clearSelection: () => void;

  // View
  setView: (view: CalendarView) => void;

  // Settings
  openSettings: () => void;
  closeSettings: () => void;
  toggleSettings: () => void;

  // Drag and drop
  startDrag: (taskId: string) => void;
  setDropTarget: (date: Date | null) => void;
  endDrag: () => void;
}

export type CalendarStore = CalendarState & CalendarActions;

// ============================================================================
// Store Implementation
// ============================================================================

export const useCalendarStore = create<CalendarStore>()(
  persist(
    (set, _get) => ({
      // Initial state
      currentDate: new Date(),
      selectedDate: null,
      view: "month",
      isSettingsOpen: false,
      draggedTaskId: null,
      dropTargetDate: null,

      // Navigation actions
      setCurrentDate: (date) => set({ currentDate: date }),

      goToToday: () =>
        set({
          currentDate: new Date(),
          selectedDate: new Date(),
        }),

      goToNextMonth: () =>
        set((state) => ({
          currentDate: addMonths(state.currentDate, 1),
        })),

      goToPrevMonth: () =>
        set((state) => ({
          currentDate: subMonths(state.currentDate, 1),
        })),

      goToNextWeek: () =>
        set((state) => ({
          currentDate: addWeeks(state.currentDate, 1),
        })),

      goToPrevWeek: () =>
        set((state) => ({
          currentDate: subWeeks(state.currentDate, 1),
        })),

      // Selection actions
      selectDate: (date) => set({ selectedDate: date }),

      toggleDateSelection: (date) =>
        set((state) => ({
          selectedDate:
            state.selectedDate && isSameDay(state.selectedDate, date)
              ? null
              : date,
        })),

      clearSelection: () => set({ selectedDate: null }),

      // View actions
      setView: (view) => set({ view }),

      // Settings actions
      openSettings: () => set({ isSettingsOpen: true }),
      closeSettings: () => set({ isSettingsOpen: false }),
      toggleSettings: () =>
        set((state) => ({ isSettingsOpen: !state.isSettingsOpen })),

      // Drag and drop actions
      startDrag: (taskId) => set({ draggedTaskId: taskId }),
      setDropTarget: (date) => set({ dropTargetDate: date }),
      endDrag: () => set({ draggedTaskId: null, dropTargetDate: null }),
    }),
    {
      name: "calendar-widget-storage",
      partialize: (state) => ({
        view: state.view,
        // Don't persist currentDate or selectedDate
      }),
    }
  )
);

// ============================================================================
// Selectors
// ============================================================================

export const useCurrentDate = () => useCalendarStore((s) => s.currentDate);
export const useSelectedDate = () => useCalendarStore((s) => s.selectedDate);
export const useCalendarView = () => useCalendarStore((s) => s.view);
export const useIsSettingsOpen = () =>
  useCalendarStore((s) => s.isSettingsOpen);
export const useDragState = () =>
  useCalendarStore((s) => ({
    draggedTaskId: s.draggedTaskId,
    dropTargetDate: s.dropTargetDate,
  }));

// ============================================================================
// Calendar Grid Data Generator
// ============================================================================

export function generateCalendarGrid(
  currentDate: Date,
  selectedDate: Date | null,
  tasks: Task[],
  startWeekOnMonday: boolean = true
): DayData[] {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  const weekStartsOn = startWeekOnMonday ? 1 : 0;

  const calendarStart = startOfWeek(monthStart, { weekStartsOn });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  return days.map((date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const dayTasks = tasks.filter((task) => {
      if (!task.dueDate) return false;
      return task.dueDate.startsWith(dateStr);
    });

    return {
      date,
      isCurrentMonth: isSameMonth(date, currentDate),
      isToday: isToday(date),
      isSelected: selectedDate ? isSameDay(date, selectedDate) : false,
      isWeekend: isWeekend(date),
      weekNumber: getWeek(date, { weekStartsOn }),
      tasks: dayTasks.map((t) => ({
        id: t.id,
        title: t.title,
        priority: t.priority,
        completed: t.completed,
      })),
    };
  });
}

export function generateWeekGrid(
  currentDate: Date,
  selectedDate: Date | null,
  tasks: Task[],
  startWeekOnMonday: boolean = true
): DayData[] {
  const weekStartsOn = startWeekOnMonday ? 1 : 0;

  const weekStart = startOfWeek(currentDate, { weekStartsOn });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn });

  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  return days.map((date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const dayTasks = tasks.filter((task) => {
      if (!task.dueDate) return false;
      return task.dueDate.startsWith(dateStr);
    });

    return {
      date,
      isCurrentMonth: true,
      isToday: isToday(date),
      isSelected: selectedDate ? isSameDay(date, selectedDate) : false,
      isWeekend: isWeekend(date),
      weekNumber: getWeek(date, { weekStartsOn }),
      tasks: dayTasks.map((t) => ({
        id: t.id,
        title: t.title,
        priority: t.priority,
        completed: t.completed,
      })),
    };
  });
}

// ============================================================================
// Date Formatting Helpers
// ============================================================================

export function formatMonthYear(date: Date): string {
  return format(date, "MMMM yyyy");
}

export function formatWeekRange(
  date: Date,
  startWeekOnMonday: boolean
): string {
  const weekStartsOn = startWeekOnMonday ? 1 : 0;
  const weekStart = startOfWeek(date, { weekStartsOn });
  const weekEnd = endOfWeek(date, { weekStartsOn });
  return `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`;
}

export function getDayNames(
  startWeekOnMonday: boolean,
  short: boolean = true
): string[] {
  const days = short
    ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    : [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];

  if (startWeekOnMonday) {
    return [...days.slice(1), days[0]];
  }
  return days;
}
