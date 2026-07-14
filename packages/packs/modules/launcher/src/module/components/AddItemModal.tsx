// ============================================================================
// AddItemModal - Modal for adding new launcher items
// ============================================================================

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  FileSymlink,
  PlusCircle,
  Check,
  AlertCircle,
  Loader2,
} from "lucide-react";
import type {
  LauncherItem,
  GridPosition,
  LnkLauncherItem,
  CustomLauncherItem,
} from "../types";
import { importLnk, openLnkDialog, validateTarget } from "../api";
import { LauncherIcon } from "./LauncherIcon";

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: LauncherItem) => void;
  getNextPosition: () => GridPosition;
}

type AddMode = "select" | "lnk" | "custom";

export function AddItemModal({
  isOpen,
  onClose,
  onAdd,
  getNextPosition,
}: AddItemModalProps) {
  const [mode, setMode] = useState<AddMode>("select");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Custom mode state
  const [customLabel, setCustomLabel] = useState("");
  const [customTarget, setCustomTarget] = useState("");
  const [customArgs, setCustomArgs] = useState("");
  const [customCwd, setCustomCwd] = useState("");
  const [iconSource, setIconSource] =
    useState<NonNullable<LauncherItem["iconSource"]>>("auto");
  const [customIconUrl, setCustomIconUrl] = useState("");
  const [legacyIcon, setLegacyIcon] = useState("");
  const [legacyIconUrl, setLegacyIconUrl] = useState("");
  const [iconScale, setIconScale] = useState(1);
  const [paddingPx, setPaddingPx] = useState(4);
  const [isValidTarget, setIsValidTarget] = useState<boolean | null>(null);

  // Reset state on close
  const handleClose = useCallback(() => {
    setMode("select");
    setError(null);
    setCustomLabel("");
    setCustomTarget("");
    setCustomArgs("");
    setCustomCwd("");
    setIconSource("auto");
    setCustomIconUrl("");
    setLegacyIcon("");
    setLegacyIconUrl("");
    setIconScale(1);
    setPaddingPx(4);
    setIsValidTarget(null);
    onClose();
  }, [onClose]);

  const handleCustomFile = useCallback((file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        setCustomIconUrl(result);
        setIconSource("custom");
      }
    };
    reader.readAsDataURL(file);
  }, []);

  // Import .lnk file
  const handleImportLnk = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const path = await openLnkDialog();
      if (!path) {
        setIsLoading(false);
        return;
      }

      const lnkInfo = await importLnk(path);

      if (!lnkInfo.target_path) {
        throw new Error("Could not resolve target path from .lnk file");
      }

      const newItem: LnkLauncherItem = {
        id: `lnk-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        type: "lnk",
        label: lnkInfo.display_name,
        lnkPath: lnkInfo.lnk_path,
        targetPath: lnkInfo.target_path,
        workingDir: lnkInfo.working_dir ?? undefined,
        arguments: lnkInfo.arguments ?? undefined,
        iconLocation: lnkInfo.icon_location ?? undefined,
        iconScale: 1,
        paddingPx: 4,
        position: getNextPosition(),
      };

      onAdd(newItem);
      handleClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to import .lnk file"
      );
    } finally {
      setIsLoading(false);
    }
  }, [getNextPosition, onAdd, handleClose]);

  // Validate custom target
  const handleValidateTarget = useCallback(async () => {
    if (!customTarget.trim()) {
      setIsValidTarget(null);
      return;
    }

    setIsLoading(true);
    try {
      const isValid = await validateTarget(customTarget.trim());
      setIsValidTarget(isValid);
    } catch {
      setIsValidTarget(false);
    } finally {
      setIsLoading(false);
    }
  }, [customTarget]);

  // Add custom item
  const handleAddCustom = useCallback(() => {
    if (!customLabel.trim() || !customTarget.trim()) {
      setError("Label and target path are required");
      return;
    }

    const resolvedCustomIconUrl =
      iconSource === "custom" ? customIconUrl.trim() || undefined : undefined;
    const resolvedLegacyIcon =
      iconSource === "legacy" ? legacyIcon.trim() || undefined : undefined;
    const resolvedLegacyIconUrl =
      iconSource === "legacy" ? legacyIconUrl.trim() || undefined : undefined;

    const newItem: CustomLauncherItem = {
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      type: "custom",
      label: customLabel.trim(),
      target: customTarget.trim(),
      args: customArgs.trim() ? customArgs.trim().split(" ") : undefined,
      cwd: customCwd.trim() || undefined,
      iconSource,
      customIconUrl: resolvedCustomIconUrl,
      icon: resolvedLegacyIcon,
      iconUrl: resolvedLegacyIconUrl,
      iconScale,
      paddingPx,
      position: getNextPosition(),
    };

    onAdd(newItem);
    handleClose();
  }, [
    customLabel,
    customTarget,
    customArgs,
    customCwd,
    iconSource,
    customIconUrl,
    legacyIcon,
    legacyIconUrl,
    iconScale,
    paddingPx,
    getNextPosition,
    onAdd,
    handleClose,
  ]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-80 max-h-[80vh] overflow-y-auto bg-gray-900/95 border border-white/10 rounded-xl shadow-2xl p-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">
              {mode === "select" && "Add Launcher Item"}
              {mode === "lnk" && "Import Shortcut"}
              {mode === "custom" && "Custom Target"}
            </h3>
            <button
              onClick={handleClose}
              className="p-1 rounded-md hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-white/60" />
            </button>
          </div>

          {/* Error display */}
          {error && (
            <div className="mb-4 p-2 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span className="text-xs text-red-300">{error}</span>
            </div>
          )}

          {/* Mode selection */}
          {mode === "select" && (
            <div className="space-y-2">
              <button
                onClick={() => {
                  setMode("lnk");
                  handleImportLnk();
                }}
                disabled={isLoading}
                className="
                  w-full flex items-center gap-3 p-3
                  bg-white/5 hover:bg-white/10 rounded-lg
                  transition-colors text-left
                  disabled:opacity-50
                "
              >
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <FileSymlink className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Import .lnk</p>
                  <p className="text-xs text-white/50">
                    Import a Windows shortcut file
                  </p>
                </div>
              </button>

              <button
                onClick={() => setMode("custom")}
                className="
                  w-full flex items-center gap-3 p-3
                  bg-white/5 hover:bg-white/10 rounded-lg
                  transition-colors text-left
                "
              >
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <PlusCircle className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    Custom Target
                  </p>
                  <p className="text-xs text-white/50">
                    Manually specify an executable path
                  </p>
                </div>
              </button>
            </div>
          )}

          {/* Loading state for .lnk import */}
          {mode === "lnk" && isLoading && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="w-8 h-8 text-blue-400 animate-spin mb-3" />
              <p className="text-sm text-white/60">Importing shortcut...</p>
            </div>
          )}

          {/* Custom target form */}
          {mode === "custom" && (
            <div className="space-y-3">
              {/* Icon */}
              <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="shrink-0">
                      <div
                        className="rounded-lg bg-white/5"
                        style={{ padding: paddingPx }}
                      >
                        <div
                          className="origin-center"
                          style={{ transform: `scale(${iconScale})` }}
                        >
                          <LauncherIcon
                            item={{
                              id: "preview",
                              type: "custom",
                              label: customLabel.trim() || "New Item",
                              target: customTarget.trim() || "",
                              args: undefined,
                              cwd: undefined,
                              position: { row: 0, col: 0 },
                              iconSource,
                              customIconUrl: customIconUrl.trim() || undefined,
                              icon: legacyIcon.trim() || undefined,
                              iconUrl: legacyIconUrl.trim() || undefined,
                              iconScale,
                              paddingPx,
                            }}
                            size="lg"
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-white/80">Icon</p>
                      <p className="text-[11px] text-white/40">
                        Auto (exe/favicon), Custom upload, or Legacy.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIconSource("auto");
                      setCustomIconUrl("");
                      setLegacyIcon("");
                      setLegacyIconUrl("");
                    }}
                    className="px-2 py-1 text-[11px] rounded-md bg-white/5 hover:bg-white/10 text-white/70 transition-colors"
                    title="Clear icon overrides"
                  >
                    Reset
                  </button>
                </div>

                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIconSource("auto")}
                    className={`flex-1 px-2 py-1.5 text-xs rounded-lg border transition-colors ${
                      iconSource === "auto"
                        ? "bg-blue-500/20 border-blue-500/30 text-blue-200"
                        : "bg-white/0 border-white/10 text-white/60 hover:bg-white/5"
                    }`}
                  >
                    Auto
                  </button>
                  <button
                    type="button"
                    onClick={() => setIconSource("custom")}
                    className={`flex-1 px-2 py-1.5 text-xs rounded-lg border transition-colors ${
                      iconSource === "custom"
                        ? "bg-blue-500/20 border-blue-500/30 text-blue-200"
                        : "bg-white/0 border-white/10 text-white/60 hover:bg-white/5"
                    }`}
                  >
                    Custom
                  </button>
                  <button
                    type="button"
                    onClick={() => setIconSource("legacy")}
                    className={`flex-1 px-2 py-1.5 text-xs rounded-lg border transition-colors ${
                      iconSource === "legacy"
                        ? "bg-blue-500/20 border-blue-500/30 text-blue-200"
                        : "bg-white/0 border-white/10 text-white/60 hover:bg-white/5"
                    }`}
                  >
                    Legacy
                  </button>
                </div>

                {iconSource === "custom" && (
                  <div className="mt-3 space-y-2">
                    <label className="text-xs text-white/60 mb-1 block">
                      Upload image (PNG/JPG/WEBP/ICO)
                    </label>
                    <input
                      type="file"
                      accept="image/*,.ico"
                      onChange={(e) =>
                        handleCustomFile(e.target.files?.[0] ?? null)
                      }
                      className="block w-full text-xs text-white/70 file:mr-3 file:rounded-md file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-xs file:text-white/80 hover:file:bg-white/15"
                    />
                    <label className="text-xs text-white/60 mb-1 block">
                      Or paste a data URL (advanced)
                    </label>
                    <input
                      type="text"
                      value={customIconUrl}
                      onChange={(e) => {
                        setCustomIconUrl(e.target.value);
                        setIconSource("custom");
                      }}
                      placeholder="data:image/png;base64,..."
                      className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                )}

                {iconSource === "legacy" && (
                  <div className="mt-3 space-y-2">
                    <div>
                      <label className="text-xs text-white/60 mb-1 block">
                        Legacy icon name (Lucide)
                      </label>
                      <input
                        type="text"
                        value={legacyIcon}
                        onChange={(e) => setLegacyIcon(e.target.value)}
                        placeholder="Chrome, Code, Terminal..."
                        className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-white/60 mb-1 block">
                        Legacy icon image URL (optional)
                      </label>
                      <input
                        type="text"
                        value={legacyIconUrl}
                        onChange={(e) => setLegacyIconUrl(e.target.value)}
                        placeholder="https://... or data:image/..."
                        className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50"
                      />
                    </div>
                  </div>
                )}

                <div className="mt-3 border-t border-white/10 pt-3 space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-white/60">
                        Icon size
                      </span>
                      <span className="text-[11px] font-mono text-white/45">
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
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-white/60">
                        Padding
                      </span>
                      <span className="text-[11px] font-mono text-white/45">
                        {paddingPx}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={24}
                      step={1}
                      value={paddingPx}
                      onChange={(e) =>
                        setPaddingPx(parseInt(e.target.value, 10))
                      }
                      className="w-full accent-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Label */}
              <div>
                <label className="text-xs text-white/60 mb-1 block">
                  Label *
                </label>
                <input
                  type="text"
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                  placeholder="My App"
                  className="
                    w-full px-3 py-2 text-sm
                    bg-white/5 border border-white/10 rounded-lg
                    text-white placeholder:text-white/30
                    focus:outline-none focus:border-blue-500/50
                  "
                />
              </div>

              {/* Target path */}
              <div>
                <label className="text-xs text-white/60 mb-1 block">
                  Target Path *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={customTarget}
                    onChange={(e) => {
                      setCustomTarget(e.target.value);
                      setIsValidTarget(null);
                    }}
                    onBlur={handleValidateTarget}
                    placeholder="C:\Program Files\App\app.exe"
                    className="
                      w-full px-3 py-2 pr-8 text-sm
                      bg-white/5 border border-white/10 rounded-lg
                      text-white placeholder:text-white/30
                      focus:outline-none focus:border-blue-500/50
                    "
                  />
                  {isValidTarget !== null && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      {isValidTarget ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-400" />
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Arguments (optional) */}
              <div>
                <label className="text-xs text-white/60 mb-1 block">
                  Arguments (optional)
                </label>
                <input
                  type="text"
                  value={customCwd}
                  onChange={(e) => setCustomCwd(e.target.value)}
                  placeholder="C:\MyFolder"
                  className="
                    w-full px-3 py-2 text-sm
                    bg-white/5 border border-white/10 rounded-lg
                    text-white placeholder:text-white/30
                    focus:outline-none focus:border-blue-500/50
                  "
                />
              </div>

              {/* Icon name (optional) */}
              <div>
                <label className="text-xs text-white/60 mb-1 block">
                  Icon Name (optional, from Lucide)
                </label>
                <input
                  type="text"
                  value={customIconUrl}
                  onChange={(e) => setCustomIconUrl(e.target.value)}
                  placeholder="Chrome, Code, Terminal..."
                  className="
                    w-full px-3 py-2 text-sm
                    bg-white/5 border border-white/10 rounded-lg
                    text-white placeholder:text-white/30
                    focus:outline-none focus:border-blue-500/50
                  "
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setMode("select")}
                  className="
                    flex-1 px-3 py-2 text-sm
                    bg-white/5 hover:bg-white/10 rounded-lg
                    text-white/70 transition-colors
                  "
                >
                  Back
                </button>
                <button
                  onClick={handleAddCustom}
                  disabled={!customLabel.trim() || !customTarget.trim()}
                  className="
                    flex-1 px-3 py-2 text-sm
                    bg-blue-500/20 hover:bg-blue-500/30 rounded-lg
                    text-blue-300 transition-colors
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                >
                  Add
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
