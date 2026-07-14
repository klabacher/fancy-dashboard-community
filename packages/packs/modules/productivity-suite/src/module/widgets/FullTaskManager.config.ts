import { z } from "zod";

export const FullTaskManagerConfigSchema = z.object({
  title: z.string().default("Task Manager"),
});

export type FullTaskManagerConfig = z.infer<typeof FullTaskManagerConfigSchema>;
