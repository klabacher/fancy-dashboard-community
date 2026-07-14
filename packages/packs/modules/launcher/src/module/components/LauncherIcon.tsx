// ============================================================================
// LauncherIcon - Dynamic icon component for launcher items
// Optimized to avoid importing entire lucide-react library
// ============================================================================

import { motion } from "framer-motion";
import { AppWindow, Loader2 } from "lucide-react";
import type { LauncherItem } from "../types";
import { DEFAULT_APP_ICONS } from "../types";
import { useMemo, useState, useEffect } from "react";
import { getOrResolveAutoIcon, makeAutoIconCacheKey } from "../iconResolver";

interface LauncherIconProps {
  item: LauncherItem;
  size?: "sm" | "md" | "lg";
  isLaunching?: boolean;
}

const sizeClasses = {
  sm: "w-5 h-5",
  md: "w-7 h-7",
  lg: "w-10 h-10",
};

const containerClasses = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-14 h-14",
};

// Component for dynamically loaded icon
function DynamicIcon({
  iconName,
  className,
}: {
  iconName: string;
  className: string;
}) {
  const [IconComponent, setIconComponent] = useState<React.ComponentType<{
    className?: string;
  }> | null>(null);

  useEffect(() => {
    let isMounted = true;

    // Dynamically import the icon to avoid loading entire library
    import("lucide-react")
      .then((module) => {
        if (isMounted) {
          const Icon = (
            module as unknown as Record<string, React.ComponentType<unknown>>
          )[iconName];
          if (Icon) {
            setIconComponent(() => Icon);
          }
        }
      })
      .catch(() => {
        // Icon not found, do nothing
      });

    return () => {
      isMounted = false;
    };
  }, [iconName]);

  if (!IconComponent) {
    // Fallback while loading
    return <AppWindow className={className} />;
  }

  return <IconComponent className={className} />;
}

export function LauncherIcon({
  item,
  size = "md",
  isLaunching = false,
}: LauncherIconProps) {
  const inferredIconSource: NonNullable<LauncherItem["iconSource"]> =
    item.iconSource ??
    (item.customIconUrl
      ? "custom"
      : item.iconUrl || item.icon
        ? "legacy"
        : "auto");

  const [autoIconUrl, setAutoIconUrl] = useState<string | null>(null);

  const autoTarget = item.type === "lnk" ? item.targetPath : item.target;
  const autoIconLocation = item.type === "lnk" ? item.iconLocation : undefined;
  const autoKey = useMemo(
    () => makeAutoIconCacheKey(autoTarget, autoIconLocation),
    [autoTarget, autoIconLocation]
  );

  useEffect(() => {
    if (inferredIconSource !== "auto") {
      setAutoIconUrl(null);
      return;
    }

    let isMounted = true;
    const entry = getOrResolveAutoIcon(autoTarget, autoIconLocation);

    if (entry.status === "fulfilled") {
      setAutoIconUrl(entry.value);
      return;
    }

    entry.promise.then((value) => {
      if (!isMounted) return;
      setAutoIconUrl(value);
    });

    return () => {
      isMounted = false;
    };
  }, [inferredIconSource, autoKey, autoTarget, autoIconLocation]);

  // Wrapper function to add loading overlay
  const renderIconWithOverlay = (iconElement: React.ReactNode) => {
    return (
      <div className="relative">
        {iconElement}
        {isLaunching && (
          <div className={`absolute inset-0 flex items-center justify-center rounded-lg bg-black/50 z-10`}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
              <Loader2 className={`${sizeClasses[size]} text-white/90`} />
            </motion.div>
          </div>
        )}
      </div>
    );
  };

  // Custom icon URL (new)
  if (inferredIconSource === "custom" && item.customIconUrl) {
    return renderIconWithOverlay(
      <div
        className={`${containerClasses[size]} flex items-center justify-center rounded-lg bg-white/5 overflow-hidden`}
      >
        <img
          src={item.customIconUrl}
          alt={item.label}
          className={`${sizeClasses[size]} object-contain`}
          draggable={false}
        />
      </div>
    );
  }

  // Auto-resolved icon (exe/lnk icon or website favicon)
  if (inferredIconSource === "auto" && autoIconUrl) {
    return renderIconWithOverlay(
      <div
        className={`${containerClasses[size]} flex items-center justify-center rounded-lg bg-white/5 overflow-hidden`}
      >
        <img
          src={autoIconUrl}
          alt={item.label}
          className={`${sizeClasses[size]} object-contain`}
          draggable={false}
        />
      </div>
    );
  }

  // Legacy icon URL
  if (
    (inferredIconSource === "legacy" || inferredIconSource === "auto") &&
    item.iconUrl
  ) {
    return renderIconWithOverlay(
      <div
        className={`${containerClasses[size]} flex items-center justify-center rounded-lg bg-white/5 overflow-hidden`}
      >
        <img
          src={item.iconUrl}
          alt={item.label}
          className={`${sizeClasses[size]} object-contain`}
          draggable={false}
        />
      </div>
    );
  }

  // Named icon from lucide-react
  if (
    (inferredIconSource === "legacy" || inferredIconSource === "auto") &&
    item.icon
  ) {
    return renderIconWithOverlay(
      <div
        className={`${containerClasses[size]} flex items-center justify-center rounded-lg bg-white/5`}
      >
        <DynamicIcon
          iconName={item.icon}
          className={`${sizeClasses[size]} text-white/80`}
        />
      </div>
    );
  }

  // Try to match label to a default icon
  const labelLower = item.label.toLowerCase();
  let matchedIcon: string | null = null;

  for (const [keyword, iconName] of Object.entries(DEFAULT_APP_ICONS)) {
    if (labelLower.includes(keyword)) {
      matchedIcon = iconName;
      break;
    }
  }

  if (matchedIcon) {
    return renderIconWithOverlay(
      <div
        className={`${containerClasses[size]} flex items-center justify-center rounded-lg bg-white/5`}
      >
        <DynamicIcon
          iconName={matchedIcon}
          className={`${sizeClasses[size]} text-white/80`}
        />
      </div>
    );
  }

  // Default fallback icon
  return renderIconWithOverlay(
    <div
      className={`${containerClasses[size]} flex items-center justify-center rounded-lg bg-white/5`}
    >
      <AppWindow className={`${sizeClasses[size]} text-white/60`} />
    </div>
  );
}
