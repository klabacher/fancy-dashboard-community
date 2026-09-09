export interface ProductivityTask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
}

const STORAGE_KEY = "fancydashboard:productivity-suite:tasks:v1";
const CHANGE_EVENT = "fancydashboard:productivity-suite:tasks-changed";

function storageAvailable(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function loadTasks(): ProductivityTask[] {
  if (!storageAvailable()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((task): task is ProductivityTask => {
      if (!task || typeof task !== "object") return false;
      const value = task as Partial<ProductivityTask>;
      return (
        typeof value.id === "string" &&
        typeof value.title === "string" &&
        typeof value.completed === "boolean" &&
        typeof value.createdAt === "number"
      );
    });
  } catch {
    return [];
  }
}

function emitChange(tasks: ProductivityTask[]): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: tasks }));
}

export function saveTasks(tasks: ProductivityTask[]): void {
  if (!storageAvailable()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  emitChange(tasks);
}

export function addTask(title: string): ProductivityTask | null {
  const normalized = title.trim();
  if (!normalized) return null;
  const task: ProductivityTask = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    title: normalized.slice(0, 240),
    completed: false,
    createdAt: Date.now(),
  };
  saveTasks([task, ...loadTasks()]);
  return task;
}

export function toggleTask(id: string): void {
  saveTasks(
    loadTasks().map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task
    )
  );
}

export function removeTask(id: string): void {
  saveTasks(loadTasks().filter((task) => task.id !== id));
}

export function clearCompleted(): void {
  saveTasks(loadTasks().filter((task) => !task.completed));
}

export function subscribeTasks(listener: (tasks: ProductivityTask[]) => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  const handler = (event: Event) => {
    const detail = (event as CustomEvent<ProductivityTask[]>).detail;
    listener(Array.isArray(detail) ? detail : loadTasks());
  };
  const storageHandler = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) listener(loadTasks());
  };
  window.addEventListener(CHANGE_EVENT, handler);
  window.addEventListener("storage", storageHandler);
  return () => {
    window.removeEventListener(CHANGE_EVENT, handler);
    window.removeEventListener("storage", storageHandler);
  };
}
