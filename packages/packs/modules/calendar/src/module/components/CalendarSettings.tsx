// ============================================================================
// CalendarSettings Component
// Comprehensive settings panel for typography, geometry, and colors
// ============================================================================

import { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Type,
  Layout,
  Palette,
  ChevronDown,
  RotateCcw,
  Check,
} from "lucide-react";
import type {
  CalendarConfig,
  CalendarTypography,
  CalendarGeometry,
  CalendarColors,
  FontFamily,
  FontWeight,
  CellShape,
  TodayIndicatorStyle,
  TypographyConfig,
} from "../types";
import { DEFAULT_TYPOGRAPHY, DEFAULT_GEOMETRY, DEFAULT_COLORS } from "../types";

// ============================================================================
// Types
// ============================================================================

interface CalendarSettingsProps {
  config: CalendarConfig;
  onConfigChange: (config: CalendarConfig) => void;
  onClose: () => void;
}

type SettingsTab = "typography" | "geometry" | "colors";

// ============================================================================
// Helper Components
// ============================================================================

interface SliderInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
}

const SliderInput = memo(function SliderInput({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "",
  onChange,
}: SliderInputProps) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-zinc-600 dark:text-zinc-400">{label}</span>
        <span className="text-zinc-900 dark:text-zinc-100 font-medium">
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full appearance-none cursor-pointer accent-blue-500"
      />
    </div>
  );
});

interface ColorInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const ColorInput = memo(function ColorInput({
  label,
  value,
  onChange,
}: ColorInputProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-zinc-600 dark:text-zinc-400">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded-lg border border-zinc-300 dark:border-zinc-600 cursor-pointer"
        />
        <span className="text-xs font-mono text-zinc-500">{value}</span>
      </div>
    </div>
  );
});

interface SelectInputProps<T extends string> {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}

function SelectInput<T extends string>({
  label,
  value,
  options,
  onChange,
}: SelectInputProps<T>) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-1">
      <span className="text-xs text-zinc-600 dark:text-zinc-400">{label}</span>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100"
        >
          <span>{options.find((o) => o.value === value)?.label}</span>
          <ChevronDown
            size={14}
            className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-xl z-50 overflow-hidden"
            >
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full px-3 py-2 text-sm text-left flex items-center justify-between
                    ${value === option.value ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700"}
                  `}
                >
                  {option.label}
                  {value === option.value && <Check size={14} />}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

interface TypographyEditorProps {
  label: string;
  config: TypographyConfig;
  onChange: (config: TypographyConfig) => void;
}

const TypographyEditor = memo(function TypographyEditor({
  label,
  config,
  onChange,
}: TypographyEditorProps) {
  return (
    <div className="space-y-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
        {label}
      </span>

      <SelectInput<FontFamily>
        label="Font Family"
        value={config.fontFamily}
        options={[
          { value: "sans", label: "Sans Serif" },
          { value: "serif", label: "Serif" },
          { value: "mono", label: "Monospace" },
        ]}
        onChange={(fontFamily) => onChange({ ...config, fontFamily })}
      />

      <SelectInput<FontWeight>
        label="Weight"
        value={config.weight}
        options={[
          { value: "light", label: "Light" },
          { value: "normal", label: "Normal" },
          { value: "medium", label: "Medium" },
          { value: "semibold", label: "Semibold" },
          { value: "bold", label: "Bold" },
        ]}
        onChange={(weight) => onChange({ ...config, weight })}
      />

      <SliderInput
        label="Size"
        value={config.size}
        min={8}
        max={32}
        unit="px"
        onChange={(size) => onChange({ ...config, size })}
      />
    </div>
  );
});

// ============================================================================
// Tab Panels
// ============================================================================

interface TypographyPanelProps {
  typography: CalendarTypography;
  onChange: (typography: CalendarTypography) => void;
  onReset: () => void;
}

const TypographyPanel = memo(function TypographyPanel({
  typography,
  onChange,
  onReset,
}: TypographyPanelProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Typography
        </h3>
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          <RotateCcw size={12} />
          Reset
        </button>
      </div>

      <TypographyEditor
        label="Month Title"
        config={typography.monthTitle}
        onChange={(monthTitle) => onChange({ ...typography, monthTitle })}
      />

      <TypographyEditor
        label="Day Names"
        config={typography.dayNames}
        onChange={(dayNames) => onChange({ ...typography, dayNames })}
      />

      <TypographyEditor
        label="Date Numbers"
        config={typography.dateNumbers}
        onChange={(dateNumbers) => onChange({ ...typography, dateNumbers })}
      />
    </div>
  );
});

interface GeometryPanelProps {
  geometry: CalendarGeometry;
  onChange: (geometry: CalendarGeometry) => void;
  onReset: () => void;
}

const GeometryPanel = memo(function GeometryPanel({
  geometry,
  onChange,
  onReset,
}: GeometryPanelProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Geometry
        </h3>
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          <RotateCcw size={12} />
          Reset
        </button>
      </div>

      <SelectInput<CellShape>
        label="Cell Shape"
        value={geometry.cellShape}
        options={[
          { value: "circle", label: "Circle" },
          { value: "rounded", label: "Rounded Square" },
          { value: "square", label: "Sharp Square" },
        ]}
        onChange={(cellShape) => onChange({ ...geometry, cellShape })}
      />

      <SliderInput
        label="Grid Gap"
        value={geometry.gridGap}
        min={0}
        max={12}
        unit="px"
        onChange={(gridGap) => onChange({ ...geometry, gridGap })}
      />

      <SliderInput
        label="Cell Padding"
        value={geometry.cellPadding}
        min={0}
        max={8}
        unit="px"
        onChange={(cellPadding) => onChange({ ...geometry, cellPadding })}
      />

      {/* Preview */}
      <div className="p-4 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center gap-2">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className={`
              w-8 h-8 flex items-center justify-center text-sm
              bg-blue-500 text-white
              ${geometry.cellShape === "circle" ? "rounded-full" : geometry.cellShape === "rounded" ? "rounded-lg" : "rounded-none"}
            `}
            style={{ margin: `${geometry.cellPadding}px` }}
          >
            {n}
          </div>
        ))}
      </div>
    </div>
  );
});

interface ColorsPanelProps {
  colors: CalendarColors;
  onChange: (colors: CalendarColors) => void;
  onReset: () => void;
}

const ColorsPanel = memo(function ColorsPanel({
  colors,
  onChange,
  onReset,
}: ColorsPanelProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Colors & Visuals
        </h3>
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          <RotateCcw size={12} />
          Reset
        </button>
      </div>

      {/* Opacity Settings */}
      <div className="space-y-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Opacity
        </span>

        <SliderInput
          label="Active Month"
          value={colors.activeMonthOpacity}
          min={50}
          max={100}
          unit="%"
          onChange={(activeMonthOpacity) =>
            onChange({ ...colors, activeMonthOpacity })
          }
        />

        <SliderInput
          label="Inactive Month"
          value={colors.inactiveMonthOpacity}
          min={10}
          max={50}
          unit="%"
          onChange={(inactiveMonthOpacity) =>
            onChange({ ...colors, inactiveMonthOpacity })
          }
        />
      </div>

      {/* Today Indicator */}
      <div className="space-y-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Today Indicator
        </span>

        <SelectInput<TodayIndicatorStyle>
          label="Style"
          value={colors.todayStyle}
          options={[
            { value: "solid", label: "Solid Background" },
            { value: "border", label: "Border Only" },
            { value: "glow", label: "Glowing Effect" },
          ]}
          onChange={(todayStyle) => onChange({ ...colors, todayStyle })}
        />

        <ColorInput
          label="Today Color"
          value={colors.todayColor}
          onChange={(todayColor) => onChange({ ...colors, todayColor })}
        />
      </div>

      {/* Selection */}
      <div className="space-y-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Selection
        </span>

        <ColorInput
          label="Selection Color"
          value={colors.selectionColor}
          onChange={(selectionColor) => onChange({ ...colors, selectionColor })}
        />

        <SliderInput
          label="Selection Opacity"
          value={colors.selectionOpacity}
          min={50}
          max={100}
          unit="%"
          onChange={(selectionOpacity) =>
            onChange({ ...colors, selectionOpacity })
          }
        />
      </div>

      {/* Priority Colors */}
      <div className="space-y-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Priority Colors
        </span>

        <ColorInput
          label="Low Priority"
          value={colors.priorityLow}
          onChange={(priorityLow) => onChange({ ...colors, priorityLow })}
        />

        <ColorInput
          label="Medium Priority"
          value={colors.priorityMedium}
          onChange={(priorityMedium) => onChange({ ...colors, priorityMedium })}
        />

        <ColorInput
          label="High Priority"
          value={colors.priorityHigh}
          onChange={(priorityHigh) => onChange({ ...colors, priorityHigh })}
        />
      </div>

      {/* Tint Overlay */}
      <div className="space-y-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Calendar Tint
        </span>

        <ColorInput
          label="Tint Color"
          value={colors.tintColor}
          onChange={(tintColor) => onChange({ ...colors, tintColor })}
        />

        <SliderInput
          label="Tint Opacity"
          value={colors.tintOpacity}
          min={0}
          max={50}
          unit="%"
          onChange={(tintOpacity) => onChange({ ...colors, tintOpacity })}
        />
      </div>
    </div>
  );
});

// ============================================================================
// Main Settings Component
// ============================================================================

export const CalendarSettings = memo(function CalendarSettings({
  config,
  onConfigChange,
  onClose,
}: CalendarSettingsProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("typography");

  const tabs: { key: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { key: "typography", label: "Typography", icon: <Type size={14} /> },
    { key: "geometry", label: "Geometry", icon: <Layout size={14} /> },
    { key: "colors", label: "Colors", icon: <Palette size={14} /> },
  ];

  const updateTypography = (typography: CalendarTypography) => {
    onConfigChange({ ...config, typography });
  };

  const updateGeometry = (geometry: CalendarGeometry) => {
    onConfigChange({ ...config, geometry });
  };

  const updateColors = (colors: CalendarColors) => {
    onConfigChange({ ...config, colors });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="absolute inset-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl z-50 flex flex-col rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Calendar Settings
        </h2>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500"
        >
          <X size={16} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-zinc-200 dark:border-zinc-700">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
              ${
                activeTab === tab.key
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }
            `}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          {activeTab === "typography" && (
            <motion.div
              key="typography"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <TypographyPanel
                typography={config.typography}
                onChange={updateTypography}
                onReset={() => updateTypography(DEFAULT_TYPOGRAPHY)}
              />
            </motion.div>
          )}

          {activeTab === "geometry" && (
            <motion.div
              key="geometry"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <GeometryPanel
                geometry={config.geometry}
                onChange={updateGeometry}
                onReset={() => updateGeometry(DEFAULT_GEOMETRY)}
              />
            </motion.div>
          )}

          {activeTab === "colors" && (
            <motion.div
              key="colors"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <ColorsPanel
                colors={config.colors}
                onChange={updateColors}
                onReset={() => updateColors(DEFAULT_COLORS)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Behavior Settings Footer */}
      <div className="px-4 py-3 border-t border-zinc-200 dark:border-zinc-700 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-600 dark:text-zinc-400">
            Show Task Indicators
          </span>
          <button
            onClick={() =>
              onConfigChange({
                ...config,
                showTaskIndicators: !config.showTaskIndicators,
              })
            }
            className={`w-10 h-6 rounded-full transition-colors ${config.showTaskIndicators ? "bg-blue-500" : "bg-zinc-300 dark:bg-zinc-600"}`}
          >
            <motion.div
              className="w-4 h-4 bg-white rounded-full shadow-sm"
              animate={{ x: config.showTaskIndicators ? 20 : 4 }}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-600 dark:text-zinc-400">
            Show Tooltips
          </span>
          <button
            onClick={() =>
              onConfigChange({
                ...config,
                showTaskTooltips: !config.showTaskTooltips,
              })
            }
            className={`w-10 h-6 rounded-full transition-colors ${config.showTaskTooltips ? "bg-blue-500" : "bg-zinc-300 dark:bg-zinc-600"}`}
          >
            <motion.div
              className="w-4 h-4 bg-white rounded-full shadow-sm"
              animate={{ x: config.showTaskTooltips ? 20 : 4 }}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-600 dark:text-zinc-400">
            Enable Drag & Drop
          </span>
          <button
            onClick={() =>
              onConfigChange({
                ...config,
                enableDragDrop: !config.enableDragDrop,
              })
            }
            className={`w-10 h-6 rounded-full transition-colors ${config.enableDragDrop ? "bg-blue-500" : "bg-zinc-300 dark:bg-zinc-600"}`}
          >
            <motion.div
              className="w-4 h-4 bg-white rounded-full shadow-sm"
              animate={{ x: config.enableDragDrop ? 20 : 4 }}
            />
          </button>
        </div>
      </div>
    </motion.div>
  );
});

export default CalendarSettings;
