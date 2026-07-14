// ============================================================================
// PC Monitor Types
// ============================================================================

// ============================================================================
// Telemetry Data Types (matching Rust TelemetryPayload)
// ============================================================================

export interface TemperatureProbe {
  label: string;
  temperature: number;
}

export interface TelemetryPayload {
  cpu_usage: number;
  memory_used: number;
  memory_total: number;
  temperatures: TemperatureProbe[];
  gpu_usage?: number;
  gpu_memory_used?: number;
  gpu_memory_total?: number;
  gpu_temperature?: number;
}

export interface SystemSpecs {
  host: string;
  os_version: string;
  cpu_brand: string;
  physical_cores: number | null;
  total_memory: number;
  gpu_name?: string;
}

// ============================================================================
// Sparkline History Data
// ============================================================================

export interface HistoryPoint {
  value: number;
  timestamp: number;
}

export const MAX_HISTORY_POINTS = 60; // 1 minute at 1 second interval

// ============================================================================
// Widget-Specific Stats
// ============================================================================

export interface CPUStats {
  usage: number;
  temperature: number;
  name: string;
  cores: number;
  history: HistoryPoint[];
}

export interface RAMStats {
  used: number;
  total: number;
  percentage: number;
  history: HistoryPoint[];
}

export interface GPUStats {
  usage: number;
  memoryUsed: number;
  memoryTotal: number;
  temperature: number;
  name: string;
  history: HistoryPoint[];
}

export interface TempStats {
  probes: TemperatureProbe[];
  avgTemp: number;
  maxTemp: number;
  history: HistoryPoint[];
}

// ============================================================================
// Combined System Stats
// ============================================================================

export interface SystemStats {
  cpu: CPUStats;
  ram: RAMStats;
  gpu: GPUStats | null;
  temps: TempStats;
  lastUpdated: number;
}

// ============================================================================
// Widget Types
// ============================================================================

export type MonitorWidgetType =
  | "cpu-widget"
  | "ram-widget"
  | "gpu-widget"
  | "temp-widget"
  | "system-dashboard";

// ============================================================================
// Config Types for Individual Widgets
// ============================================================================

export interface CPUWidgetConfig {
  showTemperature: boolean;
  showSparkline: boolean;
  compactMode: boolean;
}

export interface RAMWidgetConfig {
  showSparkline: boolean;
  compactMode: boolean;
}

export interface GPUWidgetConfig {
  showTemperature: boolean;
  showSparkline: boolean;
  compactMode: boolean;
}

export interface TempWidgetConfig {
  showAllProbes: boolean;
  showSparkline: boolean;
}

export interface SystemDashboardConfig {
  layout: DashboardComponent[];
  showSparklines: boolean;
  compactMode: boolean;
}

// ============================================================================
// Dashboard Internal Layout
// ============================================================================

export interface DashboardComponent {
  id: string;
  type: "cpu" | "ram" | "gpu" | "temp";
  position: { x: number; y: number };
  size: { w: number; h: number };
}

export const DEFAULT_DASHBOARD_LAYOUT: DashboardComponent[] = [
  { id: "cpu", type: "cpu", position: { x: 0, y: 0 }, size: { w: 1, h: 1 } },
  { id: "ram", type: "ram", position: { x: 1, y: 0 }, size: { w: 1, h: 1 } },
  { id: "gpu", type: "gpu", position: { x: 0, y: 1 }, size: { w: 1, h: 1 } },
  { id: "temp", type: "temp", position: { x: 1, y: 1 }, size: { w: 1, h: 1 } },
];
