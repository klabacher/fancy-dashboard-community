import { z } from "zod";

// The legacy Todo widget has no user-configurable settings.
// We keep the schema permissive for forward/back-compat.
export const TodoConfigSchema = z.object({}).passthrough().default({});

export type TodoConfig = z.infer<typeof TodoConfigSchema>;

export const DEFAULT_TODO_CONFIG: TodoConfig = TodoConfigSchema.parse({});
