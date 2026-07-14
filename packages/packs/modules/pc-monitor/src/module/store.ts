// ============================================================================
// PC Monitor Store - Shared State Management
// ============================================================================

import { create } from "zustand";
import type {
  SystemStats,
  TelemetryPayload,
  SystemSpecs,
  HistoryPoint,
  DashboardComponent,
} from "./types";
import { MAX_HISTORY_POINTS } from "./types";

// ============================================================================
// Store State Interface
// ============================================================================

interface PCMonitorState {
  // Core data
  specs: SystemSpecs | null;
  stats: SystemStats | null;
  isConnected: boolean;
  lastError: string | null;

  // Dashboard layout
  dashboardLayout: DashboardComponent[];

  // Actions
  setSpecs: (specs: SystemSpecs) => void;
  updateFromTelemetry: (payload: TelemetryPayload) => void;
  setConnected: (connected: boolean) => void;
  setError: (error: string | null) => void;
  updateDashboardLayout: (layout: DashboardComponent[]) => void;
  reorderDashboardComponent: (fromIndex: number, toIndex: number) => void;
  reset: () => void;
}

// ============================================================================
// History Helper
// ============================================================================

function addToHistory(history: HistoryPoint[], value: number): HistoryPoint[] {
  const now = Date.now();
  const newHistory = [...history, { value, timestamp: now }];

  // Keep only the last MAX_HISTORY_POINTS
  if (newHistory.length > MAX_HISTORY_POINTS) {
    return newHistory.slice(-MAX_HISTORY_POINTS);
  }
  return newHistory;
}

// ============================================================================
// Initial State
// ============================================================================

const initialStats: SystemStats = {
  cpu: {
    usage: 0,
    temperature: 0,
    name: "CPU",
    cores: 0,
    history: [],
  },
  ram: {
    used: 0,
    total: 0,
    percentage: 0,
    history: [],
  },
  gpu: null,
  temps: {
    probes: [],
    avgTemp: 0,
    maxTemp: 0,
    history: [],
  },
  lastUpdated: 0,
};

const defaultDashboardLayout: DashboardComponent[] = [
  { id: "cpu", type: "cpu", position: { x: 0, y: 0 }, size: { w: 1, h: 1 } },
  { id: "ram", type: "ram", position: { x: 1, y: 0 }, size: { w: 1, h: 1 } },
  { id: "gpu", type: "gpu", position: { x: 0, y: 1 }, size: { w: 1, h: 1 } },
  { id: "temp", type: "temp", position: { x: 1, y: 1 }, size: { w: 1, h: 1 } },
];

// ============================================================================
// Store Implementation
// ============================================================================

export const usePCMonitorStore = create<PCMonitorState>((set, _get) => ({
  specs: null,
  stats: null,
  isConnected: false,
  lastError: null,
  dashboardLayout: defaultDashboardLayout,

  setSpecs: (specs) => {
    set((state) => {
      const currentStats = state.stats ?? initialStats;
      return {
        specs,
        stats: {
          ...currentStats,
          cpu: {
            ...currentStats.cpu,
            name: specs.cpu_brand,
            cores: specs.physical_cores ?? 0,
          },
          gpu: specs.gpu_name
            ? {
                ...currentStats.gpu,
                usage: currentStats.gpu?.usage ?? 0,
                memoryUsed: currentStats.gpu?.memoryUsed ?? 0,
                memoryTotal: currentStats.gpu?.memoryTotal ?? 0,
                temperature: currentStats.gpu?.temperature ?? 0,
                name: specs.gpu_name,
                history: currentStats.gpu?.history ?? [],
              }
            : null,
        },
      };
    });
  },

  updateFromTelemetry: (payload) => {
    set((state) => {
      const currentStats = state.stats ?? initialStats;
      const specs = state.specs;

      // Calculate RAM values
      const ramUsedGB = Math.round(payload.memory_used / 1024 / 1024 / 1024);
      const ramTotalGB = Math.round(payload.memory_total / 1024 / 1024 / 1024);
      const ramPercentage =
        ramTotalGB > 0 ? Math.round((ramUsedGB / ramTotalGB) * 100) : 0;

      // Find CPU temperature
      const cpuTemp =
        payload.temperatures.find(
          (t) =>
            t.label.toLowerCase().includes("cpu") ||
            t.label.toLowerCase().includes("core") ||
            t.label.toLowerCase().includes("package")
        )?.temperature ?? 0;

      // Calculate average and max temps
      const temps = payload.temperatures.filter((t) => t.temperature > 0);
      const avgTemp =
        temps.length > 0
          ? Math.round(
              temps.reduce((sum, t) => sum + t.temperature, 0) / temps.length
            )
          : 0;
      const maxTemp =
        temps.length > 0 ? Math.max(...temps.map((t) => t.temperature)) : 0;

      const newStats: SystemStats = {
        cpu: {
          usage: Math.round(payload.cpu_usage),
          temperature: Math.round(cpuTemp),
          name: specs?.cpu_brand ?? currentStats.cpu.name,
          cores: specs?.physical_cores ?? currentStats.cpu.cores,
          history: addToHistory(
            currentStats.cpu.history,
            Math.round(payload.cpu_usage)
          ),
        },
        ram: {
          used: ramUsedGB,
          total: ramTotalGB,
          percentage: ramPercentage,
          history: addToHistory(currentStats.ram.history, ramPercentage),
        },
        gpu:
          payload.gpu_usage !== undefined
            ? {
                usage: Math.round(payload.gpu_usage),
                memoryUsed: Math.round(
                  (payload.gpu_memory_used ?? 0) / 1024 / 1024 / 1024
                ),
                memoryTotal: Math.round(
                  (payload.gpu_memory_total ?? 0) / 1024 / 1024 / 1024
                ),
                temperature: Math.round(payload.gpu_temperature ?? 0),
                name: specs?.gpu_name ?? "GPU",
                history: addToHistory(
                  currentStats.gpu?.history ?? [],
                  Math.round(payload.gpu_usage)
                ),
              }
            : currentStats.gpu,
        temps: {
          probes: payload.temperatures,
          avgTemp,
          maxTemp,
          history: addToHistory(currentStats.temps.history, avgTemp),
        },
        lastUpdated: Date.now(),
      };

      return { stats: newStats, isConnected: true, lastError: null };
    });
  },

  setConnected: (connected) => set({ isConnected: connected }),
  setError: (error) => set({ lastError: error }),

  updateDashboardLayout: (layout) => set({ dashboardLayout: layout }),

  reorderDashboardComponent: (fromIndex, toIndex) => {
    set((state) => {
      const layout = [...state.dashboardLayout];
      const [moved] = layout.splice(fromIndex, 1);
      layout.splice(toIndex, 0, moved);

      // Update positions based on new order
      const updated = layout.map((item, idx) => ({
        ...item,
        position: { x: idx % 2, y: Math.floor(idx / 2) },
      }));

      return { dashboardLayout: updated };
    });
  },

  reset: () =>
    set({
      stats: null,
      isConnected: false,
      lastError: null,
    }),
}));

// ============================================================================
// Selector Hooks
// ============================================================================

export const useSystemSpecs = () => usePCMonitorStore((s) => s.specs);
export const useSystemStats = () => usePCMonitorStore((s) => s.stats);
export const useCPUStats = () => usePCMonitorStore((s) => s.stats?.cpu ?? null);
export const useRAMStats = () => usePCMonitorStore((s) => s.stats?.ram ?? null);
export const useGPUStats = () => usePCMonitorStore((s) => s.stats?.gpu ?? null);
export const useTempStats = () =>
  usePCMonitorStore((s) => s.stats?.temps ?? null);
export const useIsConnected = () => usePCMonitorStore((s) => s.isConnected);
export const useDashboardLayout = () =>
  usePCMonitorStore((s) => s.dashboardLayout);
