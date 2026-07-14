// ============================================================================
// EditItemModal - Modal for editing existing launcher items
// ============================================================================

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, AlertCircle, RotateCcw } from "lucide-react";
import type { LauncherItem } from "../types";
import { validateTarget } from "../api";
import { LauncherIcon } from "./LauncherIcon";

interface EditItemModalProps {
  isOpen: boolean;
  item: LauncherItem | null;
  onClose: () => void;
  onSave: (updates: Partial<LauncherItem>) => void;
}

export function EditItemModal({
  isOpen,
  item,
  onClose,
  onSave,
}: EditItemModalProps) {
  const [label, setLabel] = useState("");
  const [target, setTarget] = useState("");
  const [args, setArgs] = useState("");
  const [cwd, setCwd] = useState("");
  const [iconSource, setIconSource] =
    useState<NonNullable<LauncherItem["iconSource"]>>("auto");
  const [customIconUrl, setCustomIconUrl] = useState<string>("");
  const [legacyIcon, setLegacyIcon] = useState("");
  const [legacyIconUrl, setLegacyIconUrl] = useState("");
  const [iconScale, setIconScale] = useState(1);
  const [paddingPx, setPaddingPx] = useState(4);
  const [isValidTarget, setIsValidTarget] = useState<boolean | null>(null);
  // Loading state for async validation
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_isLoading, setIsLoading] = useState(false);

  // Populate form when item changes
  useEffect(() => {
    if (item) {
      setLabel(item.label);

      // Preserve backwards behavior: items with legacy icon/iconUrl default to legacy mode.
      const inferredSource: NonNullable<LauncherItem["iconSource"]> =
        item.iconSource ??
        (item.customIconUrl
          ? "custom"
          : item.iconUrl || item.icon
            ? "legacy"
            : "auto");

      setIconSource(inferredSource);
      setCustomIconUrl(item.customIconUrl ?? "");
      setLegacyIcon(item.icon ?? "");
      setLegacyIconUrl(item.iconUrl ?? "");

      setIconScale(item.iconScale ?? 1);
      setPaddingPx(item.paddingPx ?? 4);

      if (item.type === "lnk") {
        setTarget(item.targetPath);
        setArgs(item.arguments || "");
        setCwd(item.workingDir || "");
      } else {
        setTarget(item.target);
        setArgs(item.args?.join(" ") || "");
        setCwd(item.cwd || "");
      }

      setIsValidTarget(null);
    }
  }, [item]);

  const previewItem = useMemo(() => {
    if (!item) return null;
    return {
      ...item,
      iconSource,
      customIconUrl: customIconUrl.trim() || undefined,
      icon: legacyIcon.trim() || undefined,
      iconUrl: legacyIconUrl.trim() || undefined,
      label: label.trim() || item.label,
      iconScale,
      paddingPx,
    } as LauncherItem;
  }, [
    item,
    iconSource,
    customIconUrl,
    legacyIcon,
    legacyIconUrl,
    label,
    iconScale,
    paddingPx,
  ]);

  // Validate target
  const handleValidateTarget = useCallback(async () => {
    if (!target.trim()) {
      setIsValidTarget(null);
      return;
    }

    setIsLoading(true);
    try {
      const isValid = await validateTarget(target.trim());
      setIsValidTarget(isValid);
    } catch {
      setIsValidTarget(false);
    } finally {
      setIsLoading(false);
    }
  }, [target]);

  // Handle save
  const handleSave = useCallback(() => {
    if (!item || !label.trim()) return;

    const updates: Partial<LauncherItem> = {
      label: label.trim(),
      iconSource,
      customIconUrl: customIconUrl.trim() || undefined,
      icon: legacyIcon.trim() || undefined,
      iconUrl: legacyIconUrl.trim() || undefined,
      iconScale,
      paddingPx,
    };

    if (item.type === "custom") {
      Object.assign(updates, {
        target: target.trim(),
        args: args.trim() ? args.trim().split(" ") : undefined,
        cwd: cwd.trim() || undefined,
      });
    }

    onSave(updates);
  }, [
    item,
    label,
    target,
    args,
    cwd,
    iconSource,
    customIconUrl,
    legacyIcon,
    legacyIconUrl,
    iconScale,
    paddingPx,
    onSave,
  ]);

  // Handle close
  const handleClose = useCallback(() => {
    setLabel("");
    setTarget("");
    setArgs("");
    setCwd("");
    setIconSource("auto");
    setCustomIconUrl("");
    setLegacyIcon("");
    setLegacyIconUrl("");
    setIconScale(1);
    setPaddingPx(4);
    setIsValidTarget(null);
    onClose();
  }, [onClose]);

  const handleResetIcon = useCallback(() => {
    // Hard reset: clear both custom + legacy, go back to auto.
    setIconSource("auto");
    setCustomIconUrl("");
    setLegacyIcon("");
    setLegacyIconUrl("");
  }, []);

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

  if (!isOpen || !item) return null;

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
            <h3 className="text-sm font-semibold text-white">Edit Item</h3>
            <button
              onClick={handleClose}
              className="p-1 rounded-md hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-white/60" />
            </button>
          </div>

          <div className="space-y-3">
            {/* Icon preview + mode */}
            <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="shrink-0">
                    {previewItem ? (
                      <div
                        className="rounded-lg bg-white/5"
                        style={{ padding: paddingPx }}
                      >
                        <div
                          className="origin-center"
                          style={{ transform: `scale(${iconScale})` }}
                        >
                          <LauncherIcon item={previewItem} size="lg" />
                        </div>
                      </div>
                    ) : null}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-white/80">Icon</p>
                    <p className="text-[11px] text-white/40">
                      Auto (exe/.lnk/favicon), Custom upload, or Legacy.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleResetIcon}
                  className="inline-flex items-center gap-1 px-2 py-1 text-[11px] rounded-md bg-white/5 hover:bg-white/10 text-white/70 transition-colors"
                  title="Clear custom + legacy icon overrides"
                >
                  <RotateCcw className="w-3 h-3" />
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
                    <p className="mt-1 text-[11px] text-white/35">
                      If set, this overrides the Lucide icon.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Appearance */}
            <div className="p-3 bg-white/5 border border-white/10 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-white/80">Appearance</p>
                <p className="text-[11px] text-white/35">Per icon</p>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-white/60">Icon size</span>
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
                  <span className="text-[11px] text-white/60">Padding</span>
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
                  onChange={(e) => setPaddingPx(parseInt(e.target.value, 10))}
                  className="w-full accent-blue-500"
                />
              </div>
            </div>

            {/* Label */}
            <div>
              <label className="text-xs text-white/60 mb-1 block">Label</label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="My App"
                className="
                  w-full px-3 py-2 text-sm
                  bg-white/5 border border-white/10 rounded-lg
                  text-white placeholder:text-white/30
                  focus:outline-none focus:border-blue-500/50
                "
              />
            </div>

            {/* Target path (only editable for custom items) */}
            <div>
              <label className="text-xs text-white/60 mb-1 block">
                Target Path
                {item.type === "lnk" && (
                  <span className="text-white/30 ml-1">
                    (read-only for .lnk)
                  </span>
                )}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={target}
                  onChange={(e) => {
                    if (item.type === "custom") {
                      setTarget(e.target.value);
                      setIsValidTarget(null);
                    }
                  }}
                  onBlur={handleValidateTarget}
                  readOnly={item.type === "lnk"}
                  className={`
                    w-full px-3 py-2 pr-8 text-sm
                    bg-white/5 border border-white/10 rounded-lg
                    text-white placeholder:text-white/30
                    focus:outline-none focus:border-blue-500/50
                    ${item.type === "lnk" ? "opacity-60 cursor-not-allowed" : ""}
                  `}
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

            {/* Arguments */}
            {item.type === "custom" && (
              <div>
                <label className="text-xs text-white/60 mb-1 block">
                  Arguments
                </label>
                <input
                  type="text"
                  value={args}
                  onChange={(e) => setArgs(e.target.value)}
                  placeholder="--flag value"
                  className="
                    w-full px-3 py-2 text-sm
                    bg-white/5 border border-white/10 rounded-lg
                    text-white placeholder:text-white/30
                    focus:outline-none focus:border-blue-500/50
                  "
                />
              </div>
            )}

            {/* Working directory */}
            {item.type === "custom" && (
              <div>
                <label className="text-xs text-white/60 mb-1 block">
                  Working Directory
                </label>
                <input
                  type="text"
                  value={cwd}
                  onChange={(e) => setCwd(e.target.value)}
                  placeholder="C:\MyFolder"
                  className="
                    w-full px-3 py-2 text-sm
                    bg-white/5 border border-white/10 rounded-lg
                    text-white placeholder:text-white/30
                    focus:outline-none focus:border-blue-500/50
                  "
                />
              </div>
            )}

            {/* Item info */}
            <div className="pt-2 border-t border-white/10">
              <p className="text-xs text-white/40">
                Type: {item.type === "lnk" ? "Windows Shortcut" : "Custom"}
              </p>
              {item.type === "lnk" && (
                <p className="text-xs text-white/40 truncate mt-1">
                  Source: {item.lnkPath}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleClose}
                className="
                  flex-1 px-3 py-2 text-sm
                  bg-white/5 hover:bg-white/10 rounded-lg
                  text-white/70 transition-colors
                "
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!label.trim()}
                className="
                  flex-1 px-3 py-2 text-sm
                  bg-blue-500/20 hover:bg-blue-500/30 rounded-lg
                  text-blue-300 transition-colors
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                Save
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
