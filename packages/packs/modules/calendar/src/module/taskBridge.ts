import { create } from "zustand";

export type Priority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  completed: boolean;
  startDate?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export type TodoTaskCommand =
  | { type: "toggle-complete"; taskId: string }
  | { type: "update-due-date"; taskId: string; dueDate: string };

export const TODO_TASKS_CHANGED_EVENT = "fancydashboard:todo-tasks-changed";
export const TODO_TASKS_REQUESTED_EVENT = "fancydashboard:todo-tasks-requested";
export const TODO_TASK_COMMAND_EVENT = "fancydashboard:todo-task-command";

const PRIORITIES = new Set<Priority>(["low", "medium", "high"]);

function isOptionalString(value: unknown): value is string | undefined {
  return value === undefined || typeof value === "string";
}

export function isTask(value: unknown): value is Task {
  if (typeof value !== "object" || value === null) return false;
  const task = value as Partial<Record<keyof Task, unknown>>;
  return (
    typeof task.id === "string" &&
    task.id.length > 0 &&
    typeof task.title === "string" &&
    isOptionalString(task.description) &&
    typeof task.priority === "string" &&
    PRIORITIES.has(task.priority as Priority) &&
    typeof task.completed === "boolean" &&
    isOptionalString(task.startDate) &&
    isOptionalString(task.dueDate) &&
    typeof task.createdAt === "string" &&
    typeof task.updatedAt === "string"
  );
}

export function parseTaskChangeDetail(detail: unknown): Task[] | null {
  if (!Array.isArray(detail) || !detail.every(isTask)) return null;
  return detail.map((task) => ({ ...task }));
}

function defaultTarget(): EventTarget | undefined {
  return typeof window === "undefined" ? undefined : window;
}

export function requestTaskSnapshot(
  target: EventTarget | undefined = defaultTarget(),
): void {
  target?.dispatchEvent(new Event(TODO_TASKS_REQUESTED_EVENT));
}

export function sendTaskCommand(
  command: TodoTaskCommand,
  target: EventTarget | undefined = defaultTarget(),
): void {
  if (!target) return;
  target.dispatchEvent(
    new CustomEvent<TodoTaskCommand>(TODO_TASK_COMMAND_EVENT, {
      detail: { ...command },
    }),
  );
}

export function subscribeToTaskChanges(
  onTasks: (tasks: Task[]) => void,
  target: EventTarget | undefined = defaultTarget(),
): () => void {
  if (!target) return () => undefined;
  const listener = (event: Event) => {
    const tasks = parseTaskChangeDetail((event as CustomEvent<unknown>).detail);
    if (tasks) onTasks(tasks);
  };
  target.addEventListener(TODO_TASKS_CHANGED_EVENT, listener);
  return () => target.removeEventListener(TODO_TASKS_CHANGED_EVENT, listener);
}

interface TaskBridgeState {
  tasks: Task[];
  filterDate: string | null;
  isLoading: boolean;
  initialize: () => Promise<void>;
  setFilterDate: (date: string | null) => void;
  toggleComplete: (taskId: string) => void;
  updateTaskDueDate: (taskId: string, dueDate: string) => void;
}

export const useTaskBridgeStore = create<TaskBridgeState>()((set) => ({
  tasks: [],
  filterDate: null,
  isLoading: true,
  initialize: async () => {
    set({ isLoading: true });
    requestTaskSnapshot();
    set({ isLoading: false });
  },
  setFilterDate: (filterDate) => set({ filterDate }),
  toggleComplete: (taskId) =>
    sendTaskCommand({ type: "toggle-complete", taskId }),
  updateTaskDueDate: (taskId, dueDate) =>
    sendTaskCommand({ type: "update-due-date", taskId, dueDate }),
}));

subscribeToTaskChanges((tasks) => {
  useTaskBridgeStore.setState({ tasks, isLoading: false });
});
