import * as zod from 'zod';
import * as zod_v4_core from 'zod/v4/core';
import * as react from 'react';
import { ReactElement } from 'react';
import { WidgetRuntimeProps, GlobalSettingsProps } from '@fancydashboard/sdk/plugins/types';
import * as lucide_react from 'lucide-react';
export { default as manifest } from './manifest.js';
import * as zustand from 'zustand';

declare function TodoWidget(props: WidgetRuntimeProps): ReactElement;

declare function GlobalSettings(_props: GlobalSettingsProps): ReactElement;

declare const _default: {
    id: string;
    version: "1.0.0";
    metadata: {
        name: string;
        summary: string;
        description: string;
        author: {
            name: string;
            email: null;
            github: null;
        };
        website: null;
        license: string;
        repository: null;
        category: "productivity";
        tags: never[];
        tier: "community";
    };
    icon: {
        type: "react-icon";
        component: react.ForwardRefExoticComponent<Omit<lucide_react.LucideProps, "ref"> & react.RefAttributes<SVGSVGElement>>;
    };
    globalSettings: react.LazyExoticComponent<typeof GlobalSettings>;
    globalPermissions: never[];
    widgets: {
        id: string;
        name: string;
        description: string;
        component: react.LazyExoticComponent<typeof TodoWidget>;
        settingsComponent: null;
        permissions: ({
            kind: "store:read";
        } | {
            kind: "store:write";
        })[];
        grid: {
            defaultW: number;
            defaultH: number;
            minW: number;
            minH: number;
            maxW: number;
            maxH: number;
            lockAspectRatio: false;
        };
        config: {
            schema: zod.ZodDefault<zod.ZodObject<{}, zod_v4_core.$loose>>;
            default: {};
        };
    }[];
};

type Priority = "low" | "medium" | "high";
interface Task {
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
interface TodoState {
    tasks: Task[];
    selectedTaskId: string | null;
    isLoading: boolean;
    filterDate: string | null;
}
interface TodoActions {
    initialize: () => Promise<void>;
    addTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => void;
    updateTask: (id: string, updates: Partial<Omit<Task, "id" | "createdAt">>) => void;
    deleteTask: (id: string) => void;
    toggleComplete: (id: string) => void;
    cyclePriority: (id: string) => void;
    selectTask: (id: string | null) => void;
    reorderTasks: (fromIndex: number, toIndex: number) => void;
    setFilterDate: (date: string | null) => void;
    updateTaskDueDate: (taskId: string, dueDate: string) => void;
}
type TodoStore = TodoState & TodoActions;

declare const cyclePriority: (current: Priority) => Priority;
declare const useTodoStore: zustand.UseBoundStore<zustand.StoreApi<TodoStore>>;
declare const priorityColors: Record<Priority, string>;
declare const priorityLabels: Record<Priority, string>;
declare const useFilteredTasks: () => Task[];
declare const useFilterDate: () => string | null;
declare const useTasks: () => Task[];
declare const useIsLoading: () => boolean;
declare const useTasksForDate: (dateStr: string) => Task[];

export { cyclePriority, _default as default, priorityColors, priorityLabels, useFilterDate, useFilteredTasks, useIsLoading, useTasks, useTasksForDate, useTodoStore };
