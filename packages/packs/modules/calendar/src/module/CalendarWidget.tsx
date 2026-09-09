// ============================================================================
// CalendarWidget Main Component
// Container-responsive calendar with safe layout degradation
// ============================================================================

import { memo, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Settings } from "lucide-react";
import { useWidgetViewport } from "@fancydashboard/sdk";
import type { CalendarConfig } from "./types";
import { DEFAULT_CALENDAR_CONFIG } from "./types";
import { useCalendarStore } from "./store";
import { useTodoStore } from "@fancydashboard/pack-module-todo";
import { CalendarGrid } from "./components/CalendarGrid";
import { CalendarCompact } from "./components/CalendarCompact";
import { CalendarExpanded } from "./components/CalendarExpanded";
import { CalendarSettings } from "./components/CalendarSettings";

export interface CalendarWidgetProps {
  config: CalendarConfig;
  onConfigChange?: (config: CalendarConfig) => void;
}

type WidgetSize = "compact-1x1" | "compact-1x2" | "standard" | "expanded";

function resolveWidgetSize(
  configuredSize: WidgetSize,
  width: number,
  height: number,
  aspectRatio: number
): WidgetSize {
  // Before the first ResizeObserver measurement, preserve the persisted choice.
  if (width <= 0 || height <= 0) return configuredSize;

  // The container always wins over a persisted layout. This prevents a widget
  // resized from 4x3 to 1x1 from trying to render the expanded calendar.
  if (width < 180 || height < 120) return "compact-1x1";

  if (width < 280 || height < 180) {
    return height >= 210 && aspectRatio < 0.9 ? "compact-1x2" : "compact-1x1";
  }

  if (width < 360 || height < 240) {
    return aspectRatio < 0.9 && height >= 280 ? "compact-1x2" : "standard";
  }

  if (configuredSize === "expanded" && (width < 520 || height < 320)) {
    return "standard";
  }

  return configuredSize;
}

export const CalendarWidget = memo(function CalendarWidget({
  config,
  onConfigChange,
}: CalendarWidgetProps) {
  const viewport = useWidgetViewport();

  const configuredSize = useMemo<WidgetSize>(
    () => config?.layout ?? "standard",
    [config?.layout]
  );

  const widgetSize = useMemo(
    () =>
      resolveWidgetSize(
        configuredSize,
        viewport.width,
        viewport.height,
        viewport.aspectRatio
      ),
    [configuredSize, viewport.width, viewport.height, viewport.aspectRatio]
  );

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

  const { isSettingsOpen, openSettings, closeSettings } = useCalendarStore();
  const initializeTodo = useTodoStore((state) => state.initialize);
  const isLoading = useTodoStore((state) => state.isLoading);
  const [initError, setInitError] = useState<Error | null>(null);

  useEffect(() => {
    initializeTodo().catch(setInitError);
  }, [initializeTodo]);

  const handleConfigChange = (newConfig: CalendarConfig) => {
    onConfigChange?.(newConfig);
  };

  const transition = viewport.reducedMotion
    ? { duration: 0 }
    : { duration: 0.2, ease: [0.22, 1, 0.36, 1] as const };

  if (initError) {
    return (
      <div
        className="flex h-full w-full min-w-0 flex-col items-center justify-center overflow-hidden rounded-2xl border border-red-300/15 bg-red-950/45 p-[clamp(0.65rem,4cqw,1rem)] text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-2xl"
        role="alert"
      >
        <AlertTriangle className="mb-2 text-red-300" size={24} aria-hidden="true" />
        <p className="text-sm font-medium text-red-100">Failed to load calendar</p>
        <p className="mt-1 max-w-full truncate text-xs text-red-200/65">
          {initError.message}
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        className="flex h-full w-full items-center justify-center rounded-2xl border border-white/10 bg-zinc-950/45 backdrop-blur-2xl"
        aria-live="polite"
        aria-label="Loading calendar"
      >
        <motion.div
          animate={viewport.reducedMotion ? undefined : { rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-6 w-6 rounded-full border-2 border-white/70 border-t-transparent"
          aria-hidden="true"
        />
      </div>
    );
  }

  const showSettingsButton =
    widgetSize !== "expanded" && widgetSize !== "compact-1x1" && !viewport.isShort;

  return (
    <section
      className="relative h-full w-full min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/45 text-white shadow-[0_18px_45px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-2xl"
      data-calendar-layout={widgetSize}
      aria-label="Calendar widget"
    >
      {showSettingsButton && (
        <motion.button
          type="button"
          onClick={openSettings}
          whileHover={viewport.reducedMotion ? undefined : { scale: 1.05 }}
          whileTap={viewport.reducedMotion ? undefined : { scale: 0.96 }}
          className="absolute right-2 top-2 z-10 flex min-h-10 min-w-10 items-center justify-center rounded-xl border border-white/10 bg-black/25 p-2 text-white/65 backdrop-blur-xl transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          aria-label="Open calendar settings"
        >
          <Settings size={16} aria-hidden="true" />
        </motion.button>
      )}

      <AnimatePresence mode="wait" initial={!viewport.reducedMotion}>
        {widgetSize === "compact-1x1" && (
          <motion.div
            key="compact-1x1"
            initial={viewport.reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={viewport.reducedMotion ? undefined : { opacity: 0 }}
            transition={transition}
            className="h-full w-full"
          >
            <CalendarCompact config={mergedConfig} size="1x1" />
          </motion.div>
        )}

        {widgetSize === "compact-1x2" && (
          <motion.div
            key="compact-1x2"
            initial={viewport.reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={viewport.reducedMotion ? undefined : { opacity: 0 }}
            transition={transition}
            className="h-full w-full"
          >
            <CalendarCompact config={mergedConfig} size="1x2" />
          </motion.div>
        )}

        {widgetSize === "standard" && (
          <motion.div
            key="standard"
            initial={viewport.reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={viewport.reducedMotion ? undefined : { opacity: 0 }}
            transition={transition}
            className="h-full w-full p-[clamp(0.4rem,2.5cqw,0.75rem)]"
          >
            <CalendarGrid config={mergedConfig} />
          </motion.div>
        )}

        {widgetSize === "expanded" && (
          <motion.div
            key="expanded"
            initial={viewport.reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={viewport.reducedMotion ? undefined : { opacity: 0 }}
            transition={transition}
            className="h-full w-full"
          >
            <CalendarExpanded
              config={mergedConfig}
              onOpenSettings={openSettings}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence initial={!viewport.reducedMotion}>
        {isSettingsOpen && (
          <CalendarSettings
            config={mergedConfig}
            onConfigChange={handleConfigChange}
            onClose={closeSettings}
          />
        )}
      </AnimatePresence>
    </section>
  );
});

export default CalendarWidget;
