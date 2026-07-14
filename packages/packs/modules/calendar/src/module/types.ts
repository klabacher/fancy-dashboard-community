// ============================================================================
// Calendar Widget Types
// Premium calendar with extensive customization - "The User is the Designer"
// ============================================================================

import { z } from "zod";

// ============================================================================
// View Modes
// ============================================================================

export type CalendarView = "month" | "week";

export type CellShape = "circle" | "rounded" | "square";

export type TodayIndicatorStyle = "solid" | "border" | "glow";

export type FontFamily = "sans" | "serif" | "mono";

export type FontWeight = "light" | "normal" | "medium" | "semibold" | "bold";

// ============================================================================
// Typography Configuration
// ============================================================================

export interface TypographyConfig {
  fontFamily: FontFamily;
  weight: FontWeight;
  size: number; // rem * 10 (e.g., 14 = 1.4rem)
}

export interface CalendarTypography {
  monthTitle: TypographyConfig;
  dayNames: TypographyConfig;
  dateNumbers: TypographyConfig;
}

// ============================================================================
// Geometry Configuration
// ============================================================================

export interface CalendarGeometry {
  cellShape: CellShape;
  gridGap: number; // 0-12 px
  cellPadding: number; // 0-8 px
}

// ============================================================================
// Color Configuration
// ============================================================================

export interface CalendarColors {
  // Day opacity
  activeMonthOpacity: number; // 50-100
  inactiveMonthOpacity: number; // 10-50

  // Today indicator
  todayStyle: TodayIndicatorStyle;
  todayColor: string; // hex

  // Selection
  selectionColor: string; // hex
  selectionOpacity: number; // 50-100

  // Task priority dots (can override defaults)
  priorityLow: string;
  priorityMedium: string;
  priorityHigh: string;

  // Calendar tint overlay
  tintColor: string;
  tintOpacity: number; // 0-50
}

// ============================================================================
// Layout Modes (Widget Size Variants)
// ============================================================================

export type CalendarLayout =
  | "compact-1x1"
  | "compact-1x2"
  | "standard"
  | "expanded";

// ============================================================================
// Complete Calendar Configuration
// ============================================================================

export interface CalendarConfig {
  // Layout (widget size)
  layout: CalendarLayout;

  // View settings
  view: CalendarView;
  startWeekOnMonday: boolean;
  showWeekNumbers: boolean;

  // Typography
  typography: CalendarTypography;

  // Geometry
  geometry: CalendarGeometry;

  // Colors
  colors: CalendarColors;

  // Behavior
  showTaskIndicators: boolean;
  showTaskTooltips: boolean;
  enableDragDrop: boolean;

  // Compact mode settings
  compactShowTaskList: boolean;
  compactMaxTasks: number;
}

// ============================================================================
// Default Configuration
// ============================================================================

export const DEFAULT_TYPOGRAPHY: CalendarTypography = {
  monthTitle: {
    fontFamily: "sans",
    weight: "semibold",
    size: 18,
  },
  dayNames: {
    fontFamily: "sans",
    weight: "medium",
    size: 12,
  },
  dateNumbers: {
    fontFamily: "sans",
    weight: "normal",
    size: 14,
  },
};

export const DEFAULT_GEOMETRY: CalendarGeometry = {
  cellShape: "rounded",
  gridGap: 2,
  cellPadding: 2,
};

export const DEFAULT_COLORS: CalendarColors = {
  activeMonthOpacity: 100,
  inactiveMonthOpacity: 30,
  todayStyle: "solid",
  todayColor: "#3b82f6", // blue-500
  selectionColor: "#8b5cf6", // violet-500
  selectionOpacity: 80,
  priorityLow: "#60a5fa", // blue-400
  priorityMedium: "#facc15", // yellow-400
  priorityHigh: "#ef4444", // red-500
  tintColor: "#000000",
  tintOpacity: 0,
};

export const DEFAULT_CALENDAR_CONFIG: CalendarConfig = {
  layout: "standard",
  view: "month",
  startWeekOnMonday: true,
  showWeekNumbers: false,
  typography: DEFAULT_TYPOGRAPHY,
  geometry: DEFAULT_GEOMETRY,
  colors: DEFAULT_COLORS,
  showTaskIndicators: true,
  showTaskTooltips: true,
  enableDragDrop: true,
  compactShowTaskList: true,
  compactMaxTasks: 3,
};

// ============================================================================
// Zod Schemas for Validation
// ============================================================================

const TypographyConfigSchema = z.object({
  fontFamily: z.enum(["sans", "serif", "mono"]),
  weight: z.enum(["light", "normal", "medium", "semibold", "bold"]),
  size: z.number().min(8).max(32),
});

const CalendarTypographySchema = z.object({
  monthTitle: TypographyConfigSchema,
  dayNames: TypographyConfigSchema,
  dateNumbers: TypographyConfigSchema,
});

const CalendarGeometrySchema = z.object({
  cellShape: z.enum(["circle", "rounded", "square"]),
  gridGap: z.number().min(0).max(12),
  cellPadding: z.number().min(0).max(8),
});

const CalendarColorsSchema = z.object({
  activeMonthOpacity: z.number().min(50).max(100),
  inactiveMonthOpacity: z.number().min(10).max(50),
  todayStyle: z.enum(["solid", "border", "glow"]),
  todayColor: z.string(),
  selectionColor: z.string(),
  selectionOpacity: z.number().min(50).max(100),
  priorityLow: z.string(),
  priorityMedium: z.string(),
  priorityHigh: z.string(),
  tintColor: z.string(),
  tintOpacity: z.number().min(0).max(50),
});

export const CalendarConfigSchema = z.object({
  layout: z.enum(["compact-1x1", "compact-1x2", "standard", "expanded"]),
  view: z.enum(["month", "week"]),
  startWeekOnMonday: z.boolean(),
  showWeekNumbers: z.boolean(),
  typography: CalendarTypographySchema,
  geometry: CalendarGeometrySchema,
  colors: CalendarColorsSchema,
  showTaskIndicators: z.boolean(),
  showTaskTooltips: z.boolean(),
  enableDragDrop: z.boolean(),
  compactShowTaskList: z.boolean(),
  compactMaxTasks: z.number().min(1).max(10),
});

// ============================================================================
// Component Props
// ============================================================================

export interface CalendarWidgetProps {
  config: CalendarConfig;
  onConfigChange?: (config: CalendarConfig) => void;
}

export interface CalendarGridProps {
  config: CalendarConfig;
  currentDate: Date;
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  onMonthChange: (date: Date) => void;
  widgetSize: { cols: number; rows: number };
}

export interface DayData {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isWeekend: boolean;
  weekNumber?: number;
  tasks: {
    id: string;
    title: string;
    priority: "low" | "medium" | "high";
    completed: boolean;
  }[];
}

export interface CalendarSettingsProps {
  config: CalendarConfig;
  onConfigChange: (config: CalendarConfig) => void;
  onClose: () => void;
}

// ============================================================================
// Utility Types
// ============================================================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// ============================================================================
// Font Family Mappings
// ============================================================================

export const FONT_FAMILY_CLASSES: Record<FontFamily, string> = {
  sans: "font-sans",
  serif: "font-serif",
  mono: "font-mono",
};

export const FONT_WEIGHT_CLASSES: Record<FontWeight, string> = {
  light: "font-light",
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
};

// ============================================================================
// Cell Shape CSS Mappings
// ============================================================================

export const CELL_SHAPE_CLASSES: Record<CellShape, string> = {
  circle: "rounded-full",
  rounded: "rounded-lg",
  square: "rounded-none",
};
