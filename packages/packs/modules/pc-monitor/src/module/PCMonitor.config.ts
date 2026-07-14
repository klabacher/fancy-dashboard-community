import { z } from "zod";

import { DEFAULT_DASHBOARD_LAYOUT } from "./types";

// ============================================================================
// Unified legacy widget (pc-monitor)
// ============================================================================

export const PCMonitorConfigSchema = z.object({
  monitorType: z.enum(["cpu", "gpu", "ram", "all"]).default("all"),
  showTemperature: z.boolean().default(true),
  refreshInterval: z.number().int().min(500).max(10000).default(2000),
});

export type PCMonitorConfig = z.infer<typeof PCMonitorConfigSchema>;

export const defaultPCMonitorConfig: PCMonitorConfig =
  PCMonitorConfigSchema.parse({});

// ============================================================================
// Individual widgets
// ============================================================================

export const CPUWidgetConfigSchema = z.object({
  showTemperature: z.boolean().default(true),
  showSparkline: z.boolean().default(true),
  compactMode: z.boolean().default(false),
});

export type CPUWidgetConfig = z.infer<typeof CPUWidgetConfigSchema>;
export const defaultCPUWidgetConfig: CPUWidgetConfig =
  CPUWidgetConfigSchema.parse({});

export const RAMWidgetConfigSchema = z.object({
  showSparkline: z.boolean().default(true),
  compactMode: z.boolean().default(false),
});

export type RAMWidgetConfig = z.infer<typeof RAMWidgetConfigSchema>;
export const defaultRAMWidgetConfig: RAMWidgetConfig =
  RAMWidgetConfigSchema.parse({});

export const GPUWidgetConfigSchema = z.object({
  showTemperature: z.boolean().default(true),
  showSparkline: z.boolean().default(true),
  compactMode: z.boolean().default(false),
});

export type GPUWidgetConfig = z.infer<typeof GPUWidgetConfigSchema>;
export const defaultGPUWidgetConfig: GPUWidgetConfig =
  GPUWidgetConfigSchema.parse({});

export const TempWidgetConfigSchema = z.object({
  showAllProbes: z.boolean().default(false),
  showSparkline: z.boolean().default(true),
});

export type TempWidgetConfig = z.infer<typeof TempWidgetConfigSchema>;
export const defaultTempWidgetConfig: TempWidgetConfig =
  TempWidgetConfigSchema.parse({});

const DashboardComponentSchema = z.object({
  id: z.string(),
  type: z.enum(["cpu", "ram", "gpu", "temp"]),
  position: z.object({
    x: z.number().int().min(0),
    y: z.number().int().min(0),
  }),
  size: z.object({
    w: z.number().int().min(1),
    h: z.number().int().min(1),
  }),
});

export const SystemDashboardConfigSchema = z.object({
  layout: z.array(DashboardComponentSchema).default(DEFAULT_DASHBOARD_LAYOUT),
  showSparklines: z.boolean().default(true),
  compactMode: z.boolean().default(false),
});

export type SystemDashboardConfig = z.infer<typeof SystemDashboardConfigSchema>;
export const defaultSystemDashboardConfig: SystemDashboardConfig =
  SystemDashboardConfigSchema.parse({});
