import { z } from "zod";

export const QuickTaskConfigSchema = z.object({
  placeholder: z.string().default("What needs to be done?"),
});

export type QuickTaskConfig = z.infer<typeof QuickTaskConfigSchema>;
