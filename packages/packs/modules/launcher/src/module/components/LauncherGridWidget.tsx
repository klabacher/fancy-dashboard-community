// ============================================================================
// LauncherGridWidget - 2x2 or 3x3 grid with right-click to add apps
// ============================================================================

import {
  useState,
  useCallback,
  useRef,
  useMemo,
  useEffect,
  useLayoutEffect,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  AlertCircle,
  X,
  Trash2,
  Check,
  Settings,
  Edit3,
} from "lucide-react";
import { usePluginContext } from "@fancydashboard/sdk/plugins/PluginContext";
import type { LauncherItem, LnkLauncherItem } from "../types";
import { launchApp, validateTarget, openLnkDialog, importLnk } from "../api";
import { LauncherIcon } from "./LauncherIcon";
import { EditItemModal } from "./EditItemModal";
import { Portal } from "./Portal";

// ============================================================================
// Types
// ============================================================================

export interface LauncherGridConfig {
  items: LauncherItem[];
  gridSize: 2 | 3;
  showLabels: boolean;
}

interface ContextMenuState {
  show: boolean;
  x: number;
  y: number;
  slotRow: number;
  slotCol: number;
  existingItem: LauncherItem | null;
}

interface LauncherGridWidgetProps {
  config: LauncherGridConfig;
}

// ============================================================================
// Component
// ============================================================================

export function LauncherGridWidget({ config }: LauncherGridWidgetProps) {
  const context = usePluginContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  const items = config.items;
  const [isEditMode, setIsEditMode] = useState(false);
  const [launchingId, setLaunchingId] = useState<string | null>(null);
  const [launchError, setLaunchError] = useState<string | null>(null);
  const [validityCache, setValidityCache] = useState<Record<string, boolean>>(
    {}
  );
  const [editingItem, setEditingItem] = useState<LauncherItem | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    show: false,
    x: 0,
    y: 0,
    slotRow: 0,
    slotCol: 0,
    existingItem: null,
  });

  // Grid slots
  const gridSize = config.gridSize;

  // Validate all items on mount/change
  useEffect(() => {
    items.forEach(async (item) => {
      const target = item.type === "lnk" ? item.targetPath : item.target;
      if (target && validityCache[target] === undefined) {
        try {
          const isValid = await validateTarget(target);
          setValidityCache((prev) => ({ ...prev, [target]: isValid }));
        } catch {
          setValidityCache((prev) => ({ ...prev, [target]: false }));
        }
      }
    });
  }, [items, validityCache]);

  // Get item at position
  const getItemAtPosition = useCallback(
    (row: number, col: number): LauncherItem | undefined => {
      return items.find(
        (item) => item.position.row === row && item.position.col === col
      );
    },
    [items]
  );

  // Generate grid slots
  const slots = useMemo(() => {
    const result: {
      row: number;
      col: number;
      item: LauncherItem | undefined;
    }[] = [];
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        result.push({ row, col, item: getItemAtPosition(row, col) });
      }
    }
    return result;
  }, [gridSize, getItemAtPosition]);

  // Handle launch
  const handleLaunch = useCallback(
    async (item: LauncherItem) => {
      if (isEditMode) return;

      const target = item.type === "lnk" ? item.targetPath : item.target;
      const args = item.type === "custom" ? item.args : undefined;
      const cwd =
        item.type === "lnk"
          ? item.workingDir
          : item.type === "custom"
            ? item.cwd
            : undefined;

      setLaunchingId(item.id);
      context.logger.info(`Launching: ${item.label}`, { target });

      try {
        await launchApp({ target, args, cwd });
        context.logger.info(`Launched successfully: ${item.label}`);
      } catch (error) {
        context.logger.error(
          `Failed to launch ${item.label}`,
          error instanceof Error ? error : new Error(String(error))
        );
        setLaunchError(String(error));
        setTimeout(() => setLaunchError(null), 3000);
      } finally {
        setLaunchingId(null);
      }
    },
    [isEditMode, context.logger]
  );

  // Handle right-click on slot
  const handleSlotContextMenu = useCallback(
    (e: React.MouseEvent, row: number, col: number) => {
      e.preventDefault();
      const existingItem = getItemAtPosition(row, col) ?? null;
      setContextMenu({
        show: true,
        x: e.clientX,
        y: e.clientY,
        slotRow: row,
        slotCol: col,
        existingItem,
      });
    },
    [getItemAtPosition]
  );

  useLayoutEffect(() => {
    if (!contextMenu.show) return;
    const el = contextMenuRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const margin = 8;
    const maxX = Math.max(margin, window.innerWidth - rect.width - margin);
    const maxY = Math.max(margin, window.innerHeight - rect.height - margin);

    const x = Math.min(Math.max(contextMenu.x, margin), maxX);
    const y = Math.min(Math.max(contextMenu.y, margin), maxY);

    if (x !== contextMenu.x || y !== contextMenu.y) {
      setContextMenu((prev) => ({ ...prev, x, y }));
    }
  }, [contextMenu.show, contextMenu.x, contextMenu.y]);

  // Close context menu
  const closeContextMenu = useCallback(() => {
    setContextMenu((prev) => ({ ...prev, show: false }));
  }, []);

  // Handle add from .lnk
  const handleAddFromLnk = useCallback(async () => {
    const { slotRow, slotCol } = contextMenu;
    closeContextMenu();

    try {
      const lnkPath = await openLnkDialog();
      if (lnkPath) {
        const lnkInfo = await importLnk(lnkPath);
        const newItem: LnkLauncherItem = {
          id: crypto.randomUUID(),
          type: "lnk",
          label: lnkInfo.display_name,
          lnkPath: lnkInfo.lnk_path,
          targetPath: lnkInfo.target_path ?? "",
          workingDir: lnkInfo.working_dir ?? undefined,
          arguments: lnkInfo.arguments ?? undefined,
          iconLocation: lnkInfo.icon_location ?? undefined,
          iconScale: 1,
          paddingPx: 4,
          position: { row: slotRow, col: slotCol },
        };
        const nextItems = [
          ...items.filter(
            (i) => !(i.position.row === slotRow && i.position.col === slotCol)
          ),
          newItem,
        ];
        context.setConfig({ ...config, items: nextItems });
        context.logger.info("Added launcher item", {
          label: newItem.label,
          position: newItem.position,
        });
      }
    } catch (error) {
      context.logger.error(
        "Failed to import .lnk",
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }, [contextMenu, closeContextMenu, context, config, items]);

  // Handle remove item
  const handleRemoveItem = useCallback(
    (itemId: string) => {
      context.setConfig({
        ...config,
        items: items.filter((item) => item.id !== itemId),
      });
      closeContextMenu();
      context.logger.info("Removed launcher item", { id: itemId });
    },
    [closeContextMenu, context, config, items]
  );

  // Should show labels
  const showLabels = config.showLabels && gridSize <= 2;

  const contextItemId = contextMenu.existingItem?.id;
  const contextItem = contextItemId
    ? (items.find((i) => i.id === contextItemId) ?? contextMenu.existingItem)
    : null;
  const contextItemIconScale = contextItem?.iconScale ?? 1;
  const contextItemPaddingPx = contextItem?.paddingPx ?? 4;

  const updateContextItem = useCallback(
    (updates: Partial<LauncherItem>) => {
      if (!contextItem) return;
      const nextItems = items.map((i) =>
        i.id === contextItem.id ? ({ ...i, ...updates } as LauncherItem) : i
      );
      context.setConfig({ ...config, items: nextItems });
    },
    [context, config, contextItem, items]
  );

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col h-full w-full p-2 bg-linear-to-br from-black/30 to-black/10 backdrop-blur-md rounded-lg overflow-hidden"
      onClick={() => contextMenu.show && closeContextMenu()}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-[10px] font-medium text-white/40 uppercase tracking-wider">
          Launcher
        </span>
        <div className="flex items-center gap-1">
          {isEditMode ? (
            <button
              onClick={() => setIsEditMode(false)}
              className="p-2 rounded-md bg-green-500/20 hover:bg-green-500/30 transition-colors"
              aria-label="Done editing"
            >
              <Check className="w-3 h-3 text-green-400" />
            </button>
          ) : (
            <button
              onClick={() => setIsEditMode(true)}
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
        {slots.map(({ row, col, item }) => {
          const isLaunching = item?.id === launchingId;
          const iconScale = item?.iconScale ?? 1;
          const paddingPx = item?.paddingPx ?? 4;
          const target =
            item?.type === "lnk"
              ? item.targetPath
              : item?.type === "custom"
                ? item.target
                : null;
          const isValid = target ? validityCache[target] !== false : true;

          return (
            <motion.div
              key={`${row}-${col}`}
              className={`
                relative flex flex-col items-center justify-center
                rounded-lg cursor-pointer transition-all
                ${item ? (isEditMode ? "bg-white/5" : "hover:bg-white/10") : ""}
                ${isLaunching ? "animate-pulse" : ""}
                ${item && !isValid ? "opacity-60" : ""}
                group
              `}
              style={{
                gridRow: row + 1,
                gridColumn: col + 1,
                padding: item ? paddingPx : 0,
              }}
              onContextMenu={(e) => handleSlotContextMenu(e, row, col)}
              onClick={() => item && !isEditMode && handleLaunch(item)}
              whileHover={item && !isEditMode ? { scale: 1.05 } : {}}
              whileTap={item && !isEditMode ? { scale: 0.95 } : {}}
            >
              <AnimatePresence mode="wait">
                {item ? (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex flex-col items-center justify-center"
                  >
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
                    {isEditMode && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 flex items-center justify-center gap-1 bg-black/40 rounded-lg"
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingItem(item);
                          }}
                          className="p-2 rounded-md bg-white/10 hover:bg-white/20 transition-colors"
                          aria-label="Edit item"
                        >
                          <Edit3 className="w-3 h-3 text-white" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveItem(item.id);
                          }}
                          className="p-2 rounded-md bg-red-500/20 hover:bg-red-500/40 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3 h-3 text-red-400" />
                        </button>
                      </motion.div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center"
                  >
                    <div className="w-8 h-8 rounded-lg border-2 border-dashed border-white/10 flex items-center justify-center">
                      <Plus className="w-4 h-4 text-white/20" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
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

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu.show && (
          <Portal>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-9999"
              onMouseDown={closeContextMenu}
              onContextMenu={(e) => e.preventDefault()}
            >
              <motion.div
                ref={contextMenuRef}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute bg-zinc-900/95 backdrop-blur-md rounded-lg border border-white/10 shadow-xl overflow-hidden"
                style={{
                  left: contextMenu.x,
                  top: contextMenu.y,
                }}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div className="py-1 min-w-35">
                  <button
                    onClick={handleAddFromLnk}
                    className="w-full px-3 py-1.5 text-left text-xs text-white/80 hover:bg-white/10 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-3 h-3" />
                    {contextMenu.existingItem
                      ? "Replace with .lnk"
                      : "Add from .lnk"}
                  </button>
                  {contextMenu.existingItem && (
                    <button
                      onClick={() => {
                        const existing = contextMenu.existingItem;
                        closeContextMenu();
                        if (existing) setEditingItem(existing);
                      }}
                      className="w-full px-3 py-1.5 text-left text-xs text-white/80 hover:bg-white/10 transition-colors flex items-center gap-2"
                    >
                      <Edit3 className="w-3 h-3" />
                      Edit
                    </button>
                  )}
                  {contextMenu.existingItem && (
                    <button
                      onClick={() =>
                        handleRemoveItem(contextMenu.existingItem!.id)
                      }
                      className="w-full px-3 py-1.5 text-left text-xs text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                    >
                      <X className="w-3 h-3" />
                      Remove
                    </button>
                  )}
                </div>

                {contextItem && (
                  <div className="border-t border-white/10 px-3 py-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-white/60">
                        Icon size
                      </span>
                      <span className="text-[10px] font-mono text-white/45">
                        {contextItemIconScale.toFixed(2)}×
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0.6}
                      max={1.5}
                      step={0.05}
                      value={contextItemIconScale}
                      onChange={(e) =>
                        updateContextItem({
                          iconScale: parseFloat(e.target.value),
                        })
                      }
                      className="w-full accent-blue-500"
                    />

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] font-semibold text-white/60">
                        Padding
                      </span>
                      <span className="text-[10px] font-mono text-white/45">
                        {contextItemPaddingPx}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={24}
                      step={1}
                      value={contextItemPaddingPx}
                      onChange={(e) =>
                        updateContextItem({
                          paddingPx: parseInt(e.target.value, 10),
                        })
                      }
                      className="w-full accent-blue-500"
                    />
                  </div>
                )}
              </motion.div>
            </motion.div>
          </Portal>
        )}
      </AnimatePresence>

      <EditItemModal
        isOpen={!!editingItem}
        item={editingItem}
        onClose={() => setEditingItem(null)}
        onSave={(updates) => {
          if (!editingItem) return;
          const nextItems = items.map((i) =>
            i.id === editingItem.id ? ({ ...i, ...updates } as LauncherItem) : i
          );
          context.setConfig({ ...config, items: nextItems });
          setEditingItem(null);
        }}
      />
    </div>
  );
}
