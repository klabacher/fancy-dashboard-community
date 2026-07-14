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

  // Calculate grid size based on density
  const gridSize = useMemo(() => {
    const size = parseInt(typedConfig.gridDensity.charAt(0), 10);
    return size;
  }, [typedConfig.gridDensity]);

  // Validate targets on mount
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

  // Handle item launch
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

  // Handle item removal
  const handleRemove = useCallback(
    (id: string) => {
      store.removeItem(id);
      logger.info("Removed launcher item", { id });
    },
    [store, logger]
  );

  // Handle item edit
  const handleEdit = useCallback((item: LauncherItem) => {
    setEditingItem(item);
  }, []);

  // Handle add item
  const handleAddItem = useCallback(
    (item: LauncherItem) => {
      store.addItem(item);
      setShowAddModal(false);
      logger.info("Added launcher item", { label: item.label });
    },
    [store, logger]
  );

  // Handle update item
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

  // Get items sorted by position for the grid
  const sortedItems = useMemo(() => {
    return [...store.items].sort((a, b) => {
      const posA = a.position.row * gridSize + a.position.col;
      const posB = b.position.row * gridSize + b.position.col;
      return posA - posB;
    });
  }, [store.items, gridSize]);

  // Determine if we should show labels based on config and size
  const showLabels = typedConfig.showLabels && gridSize <= 2;

  return (
    <div className="relative flex flex-col h-full w-full p-2 bg-linear-to-br from-black/30 to-black/10 backdrop-blur-md rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-[10px] font-medium text-white/40 uppercase tracking-wider">
          Launcher
        </span>
        <div className="flex items-center gap-1">
          {store.isEditMode ? (
            <button
              onClick={() => store.setEditMode(false)}
              className="p-2 rounded-md bg-green-500/20 hover:bg-green-500/30 transition-colors"
              aria-label="Done editing"
            >
              <Check className="w-3 h-3 text-green-400" />
            </button>
          ) : (
            <button
              onClick={() => store.setEditMode(true)}
              className="p-2 rounded-md hover:bg-white/10 transition-colors"
              aria-label="Edit mode"
            >
              <Settings className="w-3 h-3 text-white/50" />
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      <div
        className="flex-1 grid gap-1.5"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gridTemplateRows: `repeat(${gridSize}, 1fr)`,
        }}
      >
        <AnimatePresence mode="popLayout">
          {sortedItems.map((item) => {
            const target = item.type === "lnk" ? item.targetPath : item.target;
            const isValid = store.validityCache[target] !== false;
            const isLaunching = launchingId === item.id;
            const iconScale = item.iconScale ?? 1;
            const paddingPx = item.paddingPx ?? 4;

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={store.isEditMode ? {} : { scale: 1.05 }}
                whileTap={store.isEditMode ? {} : { scale: 0.95 }}
                className={`
                  relative flex flex-col items-center justify-center
                  rounded-lg cursor-pointer transition-all
                  ${store.isEditMode ? "bg-white/5" : "hover:bg-white/10"}
                  ${isLaunching ? "animate-pulse" : ""}
                  ${!isValid ? "opacity-60" : ""}
                  group
                `}
                style={{
                  gridRow: item.position.row + 1,
                  gridColumn: item.position.col + 1,
                  padding: paddingPx,
                }}
                onClick={() => !store.isEditMode && handleLaunch(item)}
              >
                {/* Icon */}
                <div
                  className="origin-center"
                  style={{ transform: `scale(${iconScale})` }}
                >
                  <LauncherIcon
                    item={item}
                    size={gridSize <= 2 ? "md" : "sm"}
                    isLaunching={isLaunching}
                  />
                </div>

                {/* Label */}
                {showLabels && (
                  <span className="mt-1 text-[9px] text-white/70 truncate max-w-full px-1 text-center">
                    {item.label}
                  </span>
                )}

                {/* Invalid indicator */}
                {!isValid && (
                  <div className="absolute top-0 right-0 p-0.5" title="Invalid target path">
                    <AlertCircle className="w-2.5 h-2.5 text-red-400" />
                  </div>
                )}

                {/* Edit mode overlay */}
                {store.isEditMode && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 flex items-center justify-center gap-1 bg-black/40 rounded-lg"
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(item);
                      }}
                      className="p-2 rounded-md bg-blue-500/20 hover:bg-blue-500/40 transition-colors"
                      aria-label="Edit item"
                    >
                      <Edit3 className="w-3 h-3 text-blue-400" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(item.id);
                      }}
                      className="p-2 rounded-md bg-red-500/20 hover:bg-red-500/40 transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-3 h-3 text-red-400" />
                    </button>
                  </motion.div>
                )}
              </motion.div>
            );
          })}

          {/* Add button (only when not all slots are filled) */}
          {store.items.length < gridSize * gridSize && (
            <motion.button
              key="add-button"
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(true)}
              className="
                flex flex-col items-center justify-center
                rounded-lg border-2 border-dashed border-white/20
                hover:border-white/40 hover:bg-white/5
                transition-all
              "
              style={{
                gridRow: Math.floor(store.items.length / gridSize) + 1,
                gridColumn: (store.items.length % gridSize) + 1,
              }}
            >
              <Plus className="w-4 h-4 text-white/40" />
              {showLabels && (
                <span className="mt-1 text-[9px] text-white/40">Add</span>
              )}
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {launchError && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-red-500/90 backdrop-blur-sm text-white text-[9px] px-2 py-1 rounded w-[90%] text-center truncate z-50"
          >
            {launchError}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Item Modal */}
      <AddItemModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddItem}
        getNextPosition={() => store.getNextPosition(typedConfig.gridDensity)}
      />

      {/* Edit Item Modal */}
      <EditItemModal
        isOpen={!!editingItem}
        item={editingItem}
        onClose={() => setEditingItem(null)}
        onSave={handleUpdateItem}
      />
    </div>
  );
}
