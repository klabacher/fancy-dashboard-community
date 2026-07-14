import { z } from "zod";

// ============================================================================
// Shared schema definitions
// ============================================================================

const GridPositionSchema = z.object({
  row: z.number().int().min(0),
  col: z.number().int().min(0),
});

const LauncherItemBaseSchema = z.object({
  id: z.string(),
  label: z.string(),
  iconSource: z.enum(["auto", "custom", "legacy"]).optional(),
  customIconUrl: z.string().optional(),
  icon: z.string().optional(),
  iconUrl: z.string().optional(),
  // Per-icon visual tuning (applies across all launcher widgets)
  iconScale: z.number().min(0.6).max(1.5).default(1),
  paddingPx: z.number().int().min(0).max(24).default(4),
  position: GridPositionSchema,
});

const LnkLauncherItemSchema = LauncherItemBaseSchema.extend({
  type: z.literal("lnk"),
  lnkPath: z.string(),
  targetPath: z.string(),
  workingDir: z.string().optional(),
  arguments: z.string().optional(),
  iconLocation: z.string().optional(),
});

const CustomLauncherItemSchema = LauncherItemBaseSchema.extend({
  type: z.literal("custom"),
  target: z.string(),
  args: z.array(z.string()).optional(),
  cwd: z.string().optional(),
});

export const LauncherItemSchema = z.discriminatedUnion("type", [
  LnkLauncherItemSchema,
  CustomLauncherItemSchema,
]);

// ============================================================================
// Unified launcher widget (launcher-widget)
// ============================================================================

export const LauncherWidgetConfigSchema = z.object({
  items: z.array(LauncherItemSchema).default([]),
  gridDensity: z.enum(["1x1", "2x2", "3x3"]).default("2x2"),
  showLabels: z.boolean().default(true),
});

export type LauncherWidgetConfig = z.infer<typeof LauncherWidgetConfigSchema>;

export const defaultLauncherWidgetConfig: LauncherWidgetConfig =
  LauncherWidgetConfigSchema.parse({});

// ============================================================================
// Legacy variants kept for compatibility
// - launcher-icon
// - launcher-grid-2x2
// - launcher-grid-3x3
// ============================================================================

export const SingleIconConfigSchema = z.object({
  item: LauncherItemSchema.nullable().default(null),
  // Visual tuning for the 1x1 launcher icon widget
  iconScale: z.number().min(0.6).max(1.5).default(1),
  paddingPx: z.number().int().min(0).max(24).default(4),
});

export type SingleIconConfig = z.infer<typeof SingleIconConfigSchema>;

export const defaultSingleIconConfig: SingleIconConfig =
  SingleIconConfigSchema.parse({});

export const LauncherGridConfigSchema = z.object({
  items: z.array(LauncherItemSchema).default([]),
  gridSize: z.union([z.literal(2), z.literal(3)]),
  showLabels: z.boolean(),
});

export type LauncherGridConfig = z.infer<typeof LauncherGridConfigSchema>;

export const LauncherGrid2x2ConfigSchema = LauncherGridConfigSchema.extend({
  gridSize: z.literal(2).default(2),
  showLabels: z.boolean().default(true),
});

export type LauncherGrid2x2Config = z.infer<typeof LauncherGrid2x2ConfigSchema>;

export const defaultLauncherGrid2x2Config: LauncherGrid2x2Config =
  LauncherGrid2x2ConfigSchema.parse({});

export const LauncherGrid3x3ConfigSchema = LauncherGridConfigSchema.extend({
  gridSize: z.literal(3).default(3),
  showLabels: z.boolean().default(false),
});

export type LauncherGrid3x3Config = z.infer<typeof LauncherGrid3x3ConfigSchema>;

export const defaultLauncherGrid3x3Config: LauncherGrid3x3Config =
  LauncherGrid3x3ConfigSchema.parse({});
