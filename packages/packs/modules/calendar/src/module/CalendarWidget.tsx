// ============================================================================
// CalendarWidget Main Component
// Responsive calendar with size-aware rendering
// ============================================================================

import { memo, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, AlertTriangle } from "lucide-react";
import type { CalendarConfig } from "./types";
import { DEFAULT_CALENDAR_CONFIG } from "./types";
import { useCalendarStore } from "./store";
import { useTodoStore } from "@fancydashboard/pack-module-todo";
import { CalendarGrid } from "./components/CalendarGrid";
import { CalendarCompact } from "./components/CalendarCompact";
import { CalendarExpanded } from "./components/CalendarExpanded";
import { CalendarSettings } from "./components/CalendarSettings";

// ============================================================================
// Types
// ============================================================================

export interface CalendarWidgetProps {
  config: CalendarConfig;
  onConfigChange?: (config: CalendarConfig) => void;
}

type WidgetSize = "compact-1x1" | "compact-1x2" | "standard" | "expanded";

// ============================================================================
// Main Widget Component
// ============================================================================

export const CalendarWidget = memo(function CalendarWidget({
  config,
  onConfigChange,
}: CalendarWidgetProps) {
  // Determine widget size from config layout
  const widgetSize = useMemo((): WidgetSize => {
    return config?.layout ?? "standard";
  }, [config?.layout]);

  // Merge config with defaults
  const mergedConfig = useMemo(
    () => ({
      ...DEFAULT_CALENDAR_CONFIG,
      ...config,
      typography: {
        ...DEFAULT_CALENDAR_CONFIG.typography,
        ...config?.typography,
      },
      geometry: {
        ...DEFAULT_CALENDAR_CONFIG.geometry,
        ...config?.geometry,
      },
      colors: {
        ...DEFAULT_CALENDAR_CONFIG.colors,
        ...config?.colors,
      },
    }),
    [config]
  );

  // Settings panel state
  const { isSettingsOpen, openSettings, closeSettings } = useCalendarStore();

  // Initialize todo store on mount
  const initializeTodo = useTodoStore((s) => s.initialize);
  const isLoading = useTodoStore((s) => s.isLoading);

  const [initError, setInitError] = useState<Error | null>(null);

  useEffect(() => {
    initializeTodo().catch(setInitError);
  }, [initializeTodo]);

  // Config change handler
  const handleConfigChange = (newConfig: CalendarConfig) => {
    onConfigChange?.(newConfig);
  };

  if (initError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-red-50/90 dark:bg-red-950/90 backdrop-blur-2xl rounded-2xl p-4 text-center border border-red-200 dark:border-red-900">
        <AlertTriangle className="text-red-500 mb-2" size={24} />
        <p className="text-sm font-medium text-red-800 dark:text-red-200">Failed to load calendar</p>
        <p className="text-xs text-red-600 dark:text-red-400 mt-1">{initError.message}</p>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl rounded-2xl">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-2xl overflow-hidden border border-zinc-200/50 dark:border-zinc-700/50">
      {/* Settings Button (for non-expanded views) */}
      {widgetSize !== "expanded" && widgetSize !== "compact-1x1" && (
        <motion.button
          onClick={openSettings}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="absolute top-2 right-2 z-10 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg bg-zinc-100/80 dark:bg-zinc-800/80 backdrop-blur-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
        >
          <Settings size={16} />
        </motion.button>
      )}

      {/* Responsive Content */}
      <AnimatePresence mode="wait">
        {widgetSize === "compact-1x1" && (
          <motion.div
            key="compact-1x1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full"
          >
            <CalendarCompact config={mergedConfig} size="1x1" />
          </motion.div>
        )}

        {widgetSize === "compact-1x2" && (
          <motion.div
            key="compact-1x2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full"
          >
            <CalendarCompact config={mergedConfig} size="1x2" />
          </motion.div>
        )}

        {widgetSize === "standard" && (
          <motion.div
            key="standard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full p-3"
          >
            <CalendarGrid config={mergedConfig} />
          </motion.div>
        )}

        {widgetSize === "expanded" && (
          <motion.div
            key="expanded"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full"
          >
            <CalendarExpanded
              config={mergedConfig}
              onOpenSettings={openSettings}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Panel Overlay */}
      <AnimatePresence>
        {isSettingsOpen && (
          <CalendarSettings
            config={mergedConfig}
            onConfigChange={handleConfigChange}
            onClose={closeSettings}
          />
        )}
      </AnimatePresence>
    </div>
  );
});

export default CalendarWidget;
