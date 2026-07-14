import { Settings, Play, Square } from "lucide-react";

interface WidgetHeaderProps {
  title: string;
  subtitle?: string;
  isRunning: boolean;
  isLoading: boolean;
  onToggle: () => void;
  onOpenConfig: () => void;
  size?: "compact" | "regular";
}

export function WidgetHeader({
  title,
  subtitle,
  isRunning,
  isLoading,
  onToggle,
  onOpenConfig,
  size = "regular",
}: WidgetHeaderProps) {
  const isCompact = size === "compact";

  return (
    <div
      className={`flex items-center justify-between ${isCompact ? "gap-2" : "gap-4"}`}
    >
      <div className="min-w-0">
        <div
          className={`font-semibold text-white ${isCompact ? "text-xs" : "text-sm"}`}
        >
          {title}
        </div>
        {subtitle ? (
          <div
            className={`text-white/50 ${isCompact ? "text-[10px]" : "text-xs"}`}
          >
            {subtitle}
          </div>
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggle}
          disabled={isLoading}
          aria-pressed={isRunning}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide transition ${
            isRunning
              ? "bg-red-500/80 hover:bg-red-500 text-white"
              : "bg-emerald-500/80 hover:bg-emerald-500 text-white"
          } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {isRunning ? (
            <Square className="w-3.5 h-3.5" />
          ) : (
            <Play className="w-3.5 h-3.5" />
          )}
          {isRunning ? "Stop" : "Start"}
        </button>
        <button
          type="button"
          onClick={onOpenConfig}
          className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-white/70 hover:text-white hover:bg-white/10"
          aria-label="Open configuration"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
