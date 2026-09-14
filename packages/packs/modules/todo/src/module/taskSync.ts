import type { Priority, Task } from "./types";

export const TODO_TASKS_CHANGED_EVENT = "fancydashboard:todo-tasks-changed";
export const TODO_TASKS_REQUESTED_EVENT = "fancydashboard:todo-tasks-requested";
export const TODO_TASK_COMMAND_EVENT = "fancydashboard:todo-task-command";

export type TodoTaskCommand =
  | { type: "toggle-complete"; taskId: string }
  | { type: "update-due-date"; taskId: string; dueDate: string };

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

export function parseTaskCommand(detail: unknown): TodoTaskCommand | null {
  if (typeof detail !== "object" || detail === null) return null;
  const command = detail as Record<string, unknown>;
  if (typeof command.taskId !== "string" || command.taskId.length === 0) {
    return null;
  }
  if (command.type === "toggle-complete") {
    return { type: command.type, taskId: command.taskId };
  }
  if (
    command.type === "update-due-date" &&
    typeof command.dueDate === "string" &&
    command.dueDate.length > 0
  ) {
    return {
      type: command.type,
      taskId: command.taskId,
      dueDate: command.dueDate,
    };
  }
  return null;
}

function defaultTarget(): EventTarget | undefined {
  return typeof window === "undefined" ? undefined : window;
}

export function broadcastTaskChanges(
  tasks: Task[],
  target: EventTarget | undefined = defaultTarget(),
): void {
  if (!target) return;
  const snapshot = tasks.map((task) => ({ ...task }));
  target.dispatchEvent(
    new CustomEvent<Task[]>(TODO_TASKS_CHANGED_EVENT, { detail: snapshot }),
  );
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

export function subscribeToTaskRequests(
  onRequest: () => void,
  target: EventTarget | undefined = defaultTarget(),
): () => void {
  if (!target) return () => undefined;
  target.addEventListener(TODO_TASKS_REQUESTED_EVENT, onRequest);
  return () =>
    target.removeEventListener(TODO_TASKS_REQUESTED_EVENT, onRequest);
}

export function subscribeToTaskCommands(
  onCommand: (command: TodoTaskCommand) => void,
  target: EventTarget | undefined = defaultTarget(),
): () => void {
  if (!target) return () => undefined;
  const listener = (event: Event) => {
    const command = parseTaskCommand((event as CustomEvent<unknown>).detail);
    if (command) onCommand(command);
  };
  target.addEventListener(TODO_TASK_COMMAND_EVENT, listener);
  return () => target.removeEventListener(TODO_TASK_COMMAND_EVENT, listener);
}

export function createTaskSaveQueue(save: (tasks: Task[]) => Promise<void>): {
  enqueue: (tasks: Task[]) => Promise<void>;
  drain: () => Promise<void>;
} {
  let tail: Promise<void> = Promise.resolve();
  return {
    enqueue(tasks) {
      const snapshot = tasks.map((task) => ({ ...task }));
      const run = tail.then(() => save(snapshot));
      tail = run.catch(() => undefined);
      return run;
    },
    drain() {
      return tail;
    },
  };
}
