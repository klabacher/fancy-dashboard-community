// ============================================================================
// SingleIconWidget - 1x1 widget for a single app launch
// ============================================================================

import {
  useState,
  useCallback,
  useRef,
  useEffect,
  useLayoutEffect,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, AlertCircle, X, Edit3 } from "lucide-react";
import { usePluginContext } from "@fancydashboard/sdk/plugins/PluginContext";
import type { LauncherItem, LnkLauncherItem } from "../types";
import type { SingleIconConfig } from "../Launcher.config";
import { launchApp, validateTarget, openLnkDialog, importLnk } from "../api";
import { LauncherIcon } from "./LauncherIcon";
import { EditItemModal } from "./EditItemModal";
import { Portal } from "./Portal";

interface SingleIconWidgetProps {
  config: SingleIconConfig;
}

// ============================================================================
// Component
// ============================================================================

export function SingleIconWidget({ config }: SingleIconWidgetProps) {
  const context = usePluginContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  const item = config.item;
  // Back-compat: keep widget-level defaults, but allow per-item overrides.
  const widgetIconScale = config.iconScale ?? 1;
  const widgetPaddingPx = config.paddingPx ?? 4;
  const iconScale = item?.iconScale ?? widgetIconScale;
  const paddingPx = item?.paddingPx ?? widgetPaddingPx;
  const [isLaunching, setIsLaunching] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });
  const [contextMenuFinalPos, setContextMenuFinalPos] = useState({
    x: 0,
    y: 0,
  });
  const [editingItem, setEditingItem] = useState<LauncherItem | null>(null);
  const [launchError, setLaunchError] = useState<string | null>(null);

  // Validate target on item change
  const validateItem = useCallback(async (launcherItem: LauncherItem) => {
    const target =
      launcherItem.type === "lnk"
        ? launcherItem.targetPath
        : launcherItem.target;
    try {
      const valid = await validateTarget(target);
      setIsValid(valid);
    } catch {
      setIsValid(false);
    }
  }, []);

  useEffect(() => {
    if (!item) {
      setIsValid(true);
      return;
    }
    validateItem(item);
  }, [item, validateItem]);

  // Handle launch
  const handleLaunch = useCallback(async () => {
    if (!item || isLaunching) return;

    const target = item.type === "lnk" ? item.targetPath : item.target;
    const args = item.type === "custom" ? item.args : undefined;
    const cwd =
      item.type === "lnk"
        ? item.workingDir
        : item.type === "custom"
          ? item.cwd
          : undefined;

    setIsLaunching(true);
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
      setIsLaunching(false);
    }
  }, [item, isLaunching, context.logger]);

  // Handle right-click context menu
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const next = { x: e.clientX, y: e.clientY };
    setContextMenuPos(next);
    setContextMenuFinalPos(next);
    setShowContextMenu(true);
  }, []);

  const closeContextMenu = useCallback(() => {
    setShowContextMenu(false);
  }, []);

  const setIconScale = useCallback(
    (nextScale: number) => {
      if (item) {
        context.setConfig({
          ...config,
          item: { ...item, iconScale: nextScale } as LauncherItem,
        });
        return;
      }
      context.setConfig({ ...config, iconScale: nextScale });
    },
    [context, config, item]
  );

  const setPaddingPx = useCallback(
    (nextPadding: number) => {
      if (item) {
        context.setConfig({
          ...config,
          item: { ...item, paddingPx: nextPadding } as LauncherItem,
        });
        return;
      }
      context.setConfig({ ...config, paddingPx: nextPadding });
    },
    [context, config, item]
  );

  useLayoutEffect(() => {
    if (!showContextMenu) return;
    const el = contextMenuRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const margin = 8;
    const maxX = Math.max(margin, window.innerWidth - rect.width - margin);
    const maxY = Math.max(margin, window.innerHeight - rect.height - margin);

    const x = Math.min(Math.max(contextMenuPos.x, margin), maxX);
    const y = Math.min(Math.max(contextMenuPos.y, margin), maxY);

    setContextMenuFinalPos((prev) =>
      prev.x === x && prev.y === y ? prev : { x, y }
    );
  }, [showContextMenu, contextMenuPos.x, contextMenuPos.y]);

  // Handle adding an app via .lnk dialog
  const handleAddFromLnk = useCallback(async () => {
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
          position: { row: 0, col: 0 },
        };
        context.setConfig({ ...config, item: newItem });
        context.logger.info("Added launcher item from .lnk", {
          label: newItem.label,
        });
      }
    } catch (error) {
      context.logger.error(
        "Failed to import .lnk",
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }, [closeContextMenu, context, config]);

  // Handle clear item
  const handleClear = useCallback(() => {
    closeContextMenu();
    context.setConfig({ ...config, item: null });
    context.logger.info("Cleared launcher icon");
  }, [closeContextMenu, context, config]);

  // Close context menu on click outside
  const handleContainerClick = useCallback(() => {
    if (showContextMenu) {
      closeContextMenu();
    }
  }, [showContextMenu, closeContextMenu]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center bg-linear-to-br from-black/30 to-black/10 backdrop-blur-md rounded-lg overflow-hidden"
      onContextMenu={handleContextMenu}
      onClick={handleContainerClick}
    >
      <AnimatePresence mode="wait">
        {item ? (
          <motion.button
            key="icon"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={handleLaunch}
            className={`
              relative flex flex-col items-center justify-center
              rounded-lg transition-all cursor-pointer
              ${isLaunching ? "animate-pulse" : ""}
              ${!isValid ? "opacity-60" : ""}
            `}
            style={{ padding: paddingPx }}
            disabled={isLaunching}
          >
            <div
              className="origin-center"
              style={{ transform: `scale(${iconScale})` }}
            >
              <LauncherIcon item={item} size="lg" isLaunching={isLaunching} />
            </div>

            {/* Label on hover */}
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              whileHover={{ opacity: 1, y: 0 }}
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-sm rounded-md px-2 py-0.5 pointer-events-none whitespace-nowrap"
            >
              <span className="text-[10px] text-white/90">{item.label}</span>
            </motion.div>

            {/* Invalid indicator */}
            {!isValid && (
              <div className="absolute top-0 right-0 p-0.5" title="Invalid target path">
                <AlertCircle className="w-3 h-3 text-red-400" />
              </div>
            )}
            
            {/* Launch Error Overlay */}
            <AnimatePresence>
              {launchError && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-red-500/90 backdrop-blur-sm text-white text-[9px] px-2 py-1 rounded w-[90%] text-center truncate"
                >
                  {launchError}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center text-center"
            style={{ padding: Math.max(2, Math.min(12, paddingPx)) }}
          >
            <div className="w-10 h-10 rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center mb-1">
              <Plus className="w-5 h-5 text-white/30" />
            </div>
            <span className="text-[9px] text-white/30">Right-click to add</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Context Menu */}
      <AnimatePresence>
        {showContextMenu && (
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
                  left: contextMenuFinalPos.x,
                  top: contextMenuFinalPos.y,
                }}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div className="py-1 min-w-35">
                  <button
                    onClick={handleAddFromLnk}
                    className="w-full px-3 py-1.5 text-left text-xs text-white/80 hover:bg-white/10 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-3 h-3" />
                    Add from .lnk
                  </button>
                  {item && (
                    <button
                      onClick={() => {
                        closeContextMenu();
                        setEditingItem(item);
                      }}
                      className="w-full px-3 py-1.5 text-left text-xs text-white/80 hover:bg-white/10 transition-colors flex items-center gap-2"
                    >
                      <Edit3 className="w-3 h-3" />
                      Edit
                    </button>
                  )}
                  {item && (
                    <button
                      onClick={handleClear}
                      className="w-full px-3 py-1.5 text-left text-xs text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                    >
                      <X className="w-3 h-3" />
                      Remove
                    </button>
                  )}
                </div>

                <div className="border-t border-white/10 px-3 py-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-white/60">
                      Icon size
                    </span>
                    <span className="text-[10px] font-mono text-white/45">
                      {iconScale.toFixed(2)}×
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.6}
                    max={1.5}
                    step={0.05}
                    value={iconScale}
                    onChange={(e) => setIconScale(parseFloat(e.target.value))}
                    className="w-full accent-blue-500"
                  />

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] font-semibold text-white/60">
                      Padding
                    </span>
                    <span className="text-[10px] font-mono text-white/45">
                      {paddingPx}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={24}
                    step={1}
                    value={paddingPx}
                    onChange={(e) => setPaddingPx(parseInt(e.target.value, 10))}
                    className="w-full accent-blue-500"
                  />
                </div>
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
          if (!item) return;
          context.setConfig({
            ...config,
            item: { ...item, ...updates } as LauncherItem,
          });
          setEditingItem(null);
        }}
      />
    </div>
  );
}
