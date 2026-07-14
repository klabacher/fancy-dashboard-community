export type Priority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  completed: boolean;
  startDate?: string; // ISO date string
  dueDate?: string; // ISO date string
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface TodoState {
  tasks: Task[];
  selectedTaskId: string | null;
  isLoading: boolean;
  // Calendar integration
  filterDate: string | null; // ISO date string for filtering by due date
}

export interface TodoActions {
  initialize: () => Promise<void>;
  addTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => void;
  updateTask: (
    id: string,
    updates: Partial<Omit<Task, "id" | "createdAt">>
  ) => void;
  deleteTask: (id: string) => void;
  toggleComplete: (id: string) => void;
  cyclePriority: (id: string) => void;
  selectTask: (id: string | null) => void;
  reorderTasks: (fromIndex: number, toIndex: number) => void;
  // Calendar integration
  setFilterDate: (date: string | null) => void;
  updateTaskDueDate: (taskId: string, dueDate: string) => void;
}

export type TodoStore = TodoState & TodoActions;
