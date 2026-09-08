// ============================================================================
// Launcher Widget - Main Component
// ============================================================================

import { useState, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Settings,
  Trash2,
  Edit3,
  Check,
  AlertCircle,
} from "lucide-react";
import { useWidgetViewport } from "@fancydashboard/sdk";
import type { WidgetRuntimeProps } from "@fancydashboard/sdk/plugins/types";
import { usePluginContext } from "@fancydashboard/sdk/plugins/PluginContext";
import type { LauncherConfig, LauncherItem } from "./types";
import { useLauncherStore } from "./store";
import { launchApp, validateTarget } from "./api";
import { LauncherIcon } from "./components/LauncherIcon";
import { AddItemModal } from "./components/AddItemModal";
import { EditItemModal } from "./components/EditItemModal";

// ============================================================================
// Component
// ============================================================================

export default function LauncherWidget({
  config: _runtimeConfig,
}: WidgetRuntimeProps) {
  const { config, setConfig, logger } = usePluginContext();
  const viewport = useWidgetViewport();
  const typedConfig = config as unknown as LauncherConfig;

  const store = useLauncherStore(typedConfig.items, {
    onItemsChange: (items) =>
      setConfig({ ...typedConfig, items } as unknown as Record<
        string,
        unknown
      >),
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<LauncherItem | null>(null);
  const [launchingId, setLaunchingId] = useState<string | null>(null);
  const [launchError, setLaunchError] = useState<string | null>(null);

  const gridSize = useMemo(() => {
    const size = parseInt(typedConfig.gridDensity.charAt(0), 10);
    return Number.isFinite(size) && size > 0 ? size : 2;
  }, [typedConfig.gridDensity]);

  const responsiveMetrics = useMemo(() => {
    const constrained =
      viewport.size === "micro" ||
      viewport.size === "compact" ||
      viewport.isNarrow ||
      viewport.isShort;
    const cellWidth = viewport.width > 0 ? viewport.width / gridSize : 96;
    const cellHeight = viewport.height > 0 ? viewport.height / gridSize : 96;
    const cellMin = Math.min(cellWidth, cellHeight);

    return {
      constrained,
      gap: viewport.size === "micro" ? 2 : viewport.size === "compact" ? 4 : 6,
      maxPadding: Math.max(2, Math.min(8, Math.floor(cellMin * 0.08))),
      showHeaderLabel: viewport.width === 0 || (viewport.width >= 180 && viewport.height >= 120),
      showLabels:
        typedConfig.showLabels &&
        gridSize <= 2 &&
        !viewport.isShort &&
        (viewport.width === 0 || viewport.width >= 190),
      iconSize: gridSize <= 2 && !constrained ? ("md" as const) : ("sm" as const),
      reducedMotion: viewport.reducedMotion,
    };
  }, [gridSize, typedConfig.showLabels, viewport]);

  useEffect(() => {
    store.items.forEach(async (item) => {
      const target = item.type === "lnk" ? item.targetPath : item.target;
      if (target && !store.validityCache[target]) {
        try {
          const isValid = await validateTarget(target);
          store.setValidity(target, isValid);
        } catch {
          store.setValidity(target, false);
        }
      }
    });
  }, [store, store.items]);

  const handleLaunch = useCallback(
    async (item: LauncherItem) => {
      if (store.isEditMode) return;

      const target = item.type === "lnk" ? item.targetPath : item.target;
      const args = item.type === "custom" ? item.args : undefined;
      const cwd =
        item.type === "lnk"
          ? item.workingDir
          : item.type === "custom"
            ? item.cwd
            : undefined;

      setLaunchingId(item.id);
      logger.info(`Launching: ${item.label}`, { target });

      try {
        await launchApp({ target, args, cwd });
        logger.info(`Launched successfully: ${item.label}`);
      } catch (error) {
        logger.error(
          `Failed to launch ${item.label}`,
          error instanceof Error ? error : new Error(String(error))
        );
        setLaunchError(String(error));
        setTimeout(() => setLaunchError(null), 3000);
      } finally {
        setLaunchingId(null);
      }
    },
    [store.isEditMode, logger]
  );

  const handleRemove = useCallback(
    (id: string) => {
      store.removeItem(id);
      logger.info("Removed launcher item", { id });
    },
    [store, logger]
  );

  const handleEdit = useCallback((item: LauncherItem) => {
    setEditingItem(item);
  }, []);

  const handleAddItem = useCallback(
    (item: LauncherItem) => {
      store.addItem(item);
      setShowAddModal(false);
      logger.info("Added launcher item", { label: item.label });
    },
    [store, logger]
  );

  const handleUpdateItem = useCallback(
    (updates: Partial<LauncherItem>) => {
      if (editingItem) {
        store.updateItem(editingItem.id, updates);
        setEditingItem(null);
        logger.info("Updated launcher item", { id: editingItem.id });
      }
    },
    [editingItem, store, logger]
  );

  const sortedItems = useMemo(() => {
    return [...store.items].sort((a, b) => {
      const posA = a.position.row * gridSize + a.position.col;
      const posB = b.position.row * gridSize + b.position.col;
      return posA - posB;
    });
  }, [store.items, gridSize]);

  return (
    <div className="relative flex h-full w-full min-h-0 min-w-0 flex-col overflow-hidden rounded-lg bg-linear-to-br from-black/30 to-black/10 p-[clamp(0.3rem,2.5cqw,0.5rem)] backdrop-blur-md">
      <div className="flex min-h-0 items-center justify-between gap-1 px-1 pb-[clamp(0.2rem,1.5cqh,0.5rem)]">
        {responsiveMetrics.showHeaderLabel ? (
          <span className="min-w-0 truncate text-[clamp(0.55rem,3cqw,0.7rem)] font-medium uppercase tracking-wider text-white/40">
            Launcher
          </span>
        ) : (
          <span aria-hidden="true" />
        )}
        <div className="flex shrink-0 items-center gap-1">
          {store.isEditMode ? (
            <button
              onClick={() => store.setEditMode(false)}
              className="rounded-md bg-green-500/20 p-[clamp(0.35rem,2cqw,0.5rem)] transition-colors hover:bg-green-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-300/80"
              aria-label="Done editing"
            >
              <Check className="h-[clamp(0.75rem,4cqw,1rem)] w-[clamp(0.75rem,4cqw,1rem)] text-green-400" />
            </button>
          ) : (
            <button
              onClick={() => store.setEditMode(true)}
              className="rounded-md p-[clamp(0.35rem,2cqw,0.5rem)] transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              aria-label="Edit launcher"
            >
              <Settings className="h-[clamp(0.75rem,4cqw,1rem)] w-[clamp(0.75rem,4cqw,1rem)] text-white/50" />
            </button>
          )}
        </div>
      </div>

      <div
        className="grid min-h-0 flex-1"
        style={{
          gap: responsiveMetrics.gap,
          gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${gridSize}, minmax(0, 1fr))`,
        }}
      >
        <AnimatePresence mode="popLayout">
          {sortedItems.map((item) => {
            const target = item.type === "lnk" ? item.targetPath : item.target;
            const isValid = store.validityCache[target] !== false;
            const isLaunching = launchingId === item.id;
            const iconScale = item.iconScale ?? 1;
            const configuredPadding = item.paddingPx ?? 4;
            const paddingPx = Math.min(
              Math.max(configuredPadding, 0),
              responsiveMetrics.maxPadding
            );

            return (
              <motion.div
                key={item.id}
                layout={!responsiveMetrics.reducedMotion}
                initial={
                  responsiveMetrics.reducedMotion
                    ? false
                    : { opacity: 0, scale: 0.9 }
                }
                animate={{ opacity: 1, scale: 1 }}
                exit={
                  responsiveMetrics.reducedMotion
                    ? { opacity: 0 }
                    : { opacity: 0, scale: 0.9 }
                }
                whileHover={
                  store.isEditMode || responsiveMetrics.reducedMotion
                    ? {}
                    : { scale: 1.04 }
                }
                whileTap={
                  store.isEditMode || responsiveMetrics.reducedMotion
                    ? {}
                    : { scale: 0.96 }
                }
                className={`group relative flex min-h-0 min-w-0 flex-col items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${
                  store.isEditMode ? "bg-white/5" : "cursor-pointer hover:bg-white/10"
                } ${isLaunching && !responsiveMetrics.reducedMotion ? "animate-pulse" : ""} ${
                  !isValid ? "opacity-60" : ""
                }`}
                style={{
                  gridRow: item.position.row + 1,
                  gridColumn: item.position.col + 1,
                  padding: paddingPx,
                }}
                role={store.isEditMode ? undefined : "button"}
                tabIndex={store.isEditMode ? -1 : 0}
                aria-label={store.isEditMode ? undefined : `Launch ${item.label}`}
                onClick={() => !store.isEditMode && handleLaunch(item)}
                onKeyDown={(event) => {
                  if (
                    !store.isEditMode &&
                    (event.key === "Enter" || event.key === " ")
                  ) {
                    event.preventDefault();
                    void handleLaunch(item);
                  }
                }}
              >
                <div
                  className="origin-center"
                  style={{ transform: `scale(${iconScale})` }}
                >
                  <LauncherIcon
                    item={item}
                    size={responsiveMetrics.iconSize}
                    isLaunching={isLaunching}
                  />
                </div>

                {responsiveMetrics.showLabels && (
                  <span className="mt-1 max-w-full truncate px-1 text-center text-[clamp(0.5rem,3cqw,0.65rem)] text-white/70">
                    {item.label}
                  </span>
                )}

                {!isValid && (
                  <div
                    className="absolute right-0 top-0 p-0.5"
                    title="Invalid target path"
                  >
                    <AlertCircle className="h-2.5 w-2.5 text-red-400" />
                  </div>
                )}

                {store.isEditMode && (
                  <motion.div
                    initial={
                      responsiveMetrics.reducedMotion ? false : { opacity: 0 }
                    }
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 flex items-center justify-center gap-1 rounded-lg bg-black/40"
                  >
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        handleEdit(item);
                      }}
                      className="rounded-md bg-blue-500/20 p-[clamp(0.3rem,2cqw,0.5rem)] transition-colors hover:bg-blue-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300/80"
                      aria-label={`Edit ${item.label}`}
                    >
                      <Edit3 className="h-3 w-3 text-blue-400" />
                    </button>
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        handleRemove(item.id);
                      }}
                      className="rounded-md bg-red-500/20 p-[clamp(0.3rem,2cqw,0.5rem)] transition-colors hover:bg-red-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300/80"
                      aria-label={`Remove ${item.label}`}
                    >
                      <Trash2 className="h-3 w-3 text-red-400" />
                    </button>
                  </motion.div>
                )}
              </motion.div>
            );
          })}

          {store.items.length < gridSize * gridSize && (
            <motion.button
              key="add-button"
              layout={!responsiveMetrics.reducedMotion}
              initial={
                responsiveMetrics.reducedMotion ? false : { opacity: 0 }
              }
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(true)}
              className="flex min-h-0 min-w-0 flex-col items-center justify-center rounded-lg border-2 border-dashed border-white/20 transition-colors hover:border-white/40 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              style={{
                gridRow: Math.floor(store.items.length / gridSize) + 1,
                gridColumn: (store.items.length % gridSize) + 1,
              }}
              aria-label="Add launcher item"
            >
              <Plus className="h-[clamp(0.8rem,5cqw,1rem)] w-[clamp(0.8rem,5cqw,1rem)] text-white/40" />
              {responsiveMetrics.showLabels && (
                <span className="mt-1 text-[clamp(0.5rem,3cqw,0.65rem)] text-white/40">
                  Add
                </span>
              )}
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {launchError && (
          <motion.div
            initial={
              responsiveMetrics.reducedMotion ? false : { opacity: 0, y: 5 }
            }
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: responsiveMetrics.reducedMotion ? 0 : 5 }}
            className="absolute bottom-2 left-1/2 z-50 w-[90%] -translate-x-1/2 truncate rounded bg-red-500/90 px-2 py-1 text-center text-[clamp(0.5rem,3cqw,0.65rem)] text-white backdrop-blur-sm"
            role="alert"
          >
            {launchError}
          </motion.div>
        )}
      </AnimatePresence>

      <AddItemModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddItem}
        getNextPosition={() => store.getNextPosition(typedConfig.gridDensity)}
      />

      <EditItemModal
        isOpen={!!editingItem}
        item={editingItem}
        onClose={() => setEditingItem(null)}
        onSave={handleUpdateItem}
      />
    </div>
  );
}
