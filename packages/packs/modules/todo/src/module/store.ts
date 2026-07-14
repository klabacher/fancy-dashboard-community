import { create } from "zustand";

import type { PluginManifest } from "@fancydashboard/sdk/bridge";
import { BridgeLogger, createPluginInvoke } from "@fancydashboard/sdk/bridge";

import type { Priority, Task, TodoStore } from "./types";

// ============================================================================
// Plugin Manifest for Bridge
// ============================================================================

const manifest: PluginManifest = {
  id: "todo",
  name: "Todo Widget",
  version: "1.0.0",
  description: "Task management with Rust persistence",
  permissions: ["bridge:invoke"],
};

const pluginInvoke = createPluginInvoke(manifest);

// ============================================================================
// Bridge API Types
// ============================================================================

interface ApiResponse<T> {
  status: "success" | "error";
  data?: T;
  message?: string;
  timestamp: number;
}

// ============================================================================
// Persistence API
// ============================================================================

const TodoPersistence = {
  async loadTasks(): Promise<Task[]> {
    try {
      const response = await pluginInvoke<
        Record<string, never>,
        ApiResponse<Task[]>
      >("todo_load_tasks", {});

      if (response.success && response.data?.status === "success") {
        BridgeLogger.info(
          manifest.id,
          "loadTasks",
          `Loaded ${response.data.data?.length ?? 0} tasks`
        );
        return response.data.data ?? [];
      }

      // Fallback to localStorage if Bridge fails
      BridgeLogger.warn(
        manifest.id,
        "loadTasks",
        "Bridge unavailable, using localStorage"
      );
      return TodoPersistence.loadFromLocalStorage();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      BridgeLogger.warn(
        manifest.id,
        "loadTasks",
        `Falling back to localStorage: ${errorMsg}`
      );
      return TodoPersistence.loadFromLocalStorage();
    }
  },

  async saveTasks(tasks: Task[]): Promise<void> {
    try {
      const response = await pluginInvoke<{ tasks: Task[] }, ApiResponse<null>>(
        "todo_save_tasks",
        { tasks }
      );

      if (response.success && response.data?.status === "success") {
        BridgeLogger.info(
          manifest.id,
          "saveTasks",
          `Saved ${tasks.length} tasks`
        );
        return;
      }

      // Fallback to localStorage
      BridgeLogger.warn(
        manifest.id,
        "saveTasks",
        "Bridge unavailable, using localStorage"
      );
      TodoPersistence.saveToLocalStorage(tasks);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      BridgeLogger.warn(
        manifest.id,
        "saveTasks",
        `Falling back to localStorage: ${errorMsg}`
      );
      TodoPersistence.saveToLocalStorage(tasks);
    }
  },

  // LocalStorage fallback
  loadFromLocalStorage(): Task[] {
    try {
      const stored = localStorage.getItem("todo-widget-storage");
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (typeof parsed === "object" && parsed !== null) {
          const state = (parsed as { state?: unknown }).state;
          if (typeof state === "object" && state !== null) {
            return (
              ((state as { tasks?: unknown }).tasks as Task[] | undefined) ?? []
            );
          }
        }
      }
    } catch {
      // Ignore parse errors
    }
    return [];
  },

  saveToLocalStorage(tasks: Task[]): void {
    try {
      localStorage.setItem(
        "todo-widget-storage",
        JSON.stringify({ state: { tasks } })
      );
    } catch {
      // Ignore storage errors
    }
  },
};

// ============================================================================
// Helpers
// ============================================================================

const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
};

// Priority cycle helper
export const cyclePriority = (current: Priority): Priority => {
  const cycle: Priority[] = ["low", "medium", "high"];
  const currentIndex = cycle.indexOf(current);
  return cycle[(currentIndex + 1) % cycle.length];
};

// ============================================================================
// Store
// ============================================================================

export const useTodoStore = create<TodoStore>()((set) => ({
  tasks: [],
  selectedTaskId: null,
  isLoading: true,
  filterDate: null,

  // Initialize from persistence
  initialize: async () => {
    set({ isLoading: true });
    const tasks = await TodoPersistence.loadTasks();
    set({ tasks, isLoading: false });
  },

  addTask: (taskData) => {
    const now = new Date().toISOString();
    const newTask: Task = {
      ...taskData,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    set((state) => {
      const newTasks = [newTask, ...state.tasks];
      void TodoPersistence.saveTasks(newTasks);
      return { tasks: newTasks };
    });
  },

  updateTask: (id, updates) => {
    set((state) => {
      const newTasks = state.tasks.map((task) =>
        task.id === id
          ? { ...task, ...updates, updatedAt: new Date().toISOString() }
          : task
      );
      void TodoPersistence.saveTasks(newTasks);
      return { tasks: newTasks };
    });
  },

  deleteTask: (id) => {
    set((state) => {
      const newTasks = state.tasks.filter((task) => task.id !== id);
      void TodoPersistence.saveTasks(newTasks);
      return {
        tasks: newTasks,
        selectedTaskId:
          state.selectedTaskId === id ? null : state.selectedTaskId,
      };
    });
  },

  toggleComplete: (id) => {
    set((state) => {
      const newTasks = state.tasks.map((task) =>
        task.id === id
          ? {
              ...task,
              completed: !task.completed,
              updatedAt: new Date().toISOString(),
            }
          : task
      );
      void TodoPersistence.saveTasks(newTasks);
      return { tasks: newTasks };
    });
  },

  cyclePriority: (id) => {
    set((state) => {
      const newTasks = state.tasks.map((task) =>
        task.id === id
          ? {
              ...task,
              priority: cyclePriority(task.priority),
              updatedAt: new Date().toISOString(),
            }
          : task
      );
      void TodoPersistence.saveTasks(newTasks);
      return { tasks: newTasks };
    });
  },

  selectTask: (id) => {
    set({ selectedTaskId: id });
  },

  reorderTasks: (fromIndex, toIndex) => {
    set((state) => {
      const tasks = [...state.tasks];
      const [movedTask] = tasks.splice(fromIndex, 1);
      tasks.splice(toIndex, 0, movedTask);
      void TodoPersistence.saveTasks(tasks);
      return { tasks };
    });
  },

  // Calendar integration
  setFilterDate: (date) => {
    set({ filterDate: date });
  },

  updateTaskDueDate: (taskId, dueDate) => {
    set((state) => {
      const newTasks = state.tasks.map((task) =>
        task.id === taskId
          ? { ...task, dueDate, updatedAt: new Date().toISOString() }
          : task
      );
      void TodoPersistence.saveTasks(newTasks);
      return { tasks: newTasks };
    });
  },
}));

// Priority color mapping
export const priorityColors: Record<Priority, string> = {
  low: "bg-blue-400",
  medium: "bg-yellow-400",
  high: "bg-red-500",
};

export const priorityLabels: Record<Priority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

// ============================================================================
// Selectors
// ============================================================================

export const useFilteredTasks = () =>
  useTodoStore((state) => {
    if (!state.filterDate) return state.tasks;
    const filterDate = state.filterDate;
    return state.tasks.filter((task) => {
      if (!task.dueDate) return false;
      return task.dueDate.startsWith(filterDate);
    });
  });

export const useFilterDate = () => useTodoStore((s) => s.filterDate);
export const useTasks = () => useTodoStore((s) => s.tasks);
export const useIsLoading = () => useTodoStore((s) => s.isLoading);

export const useTasksForDate = (dateStr: string) =>
  useTodoStore((state) =>
    state.tasks.filter((task) => task.dueDate?.startsWith(dateStr))
  );
