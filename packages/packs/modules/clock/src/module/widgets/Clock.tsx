import { useEffect, useMemo, useState, type ReactElement } from "react";
import { motion } from "framer-motion";

import { useWidgetViewport } from "@fancydashboard/sdk";
import type { WidgetRuntimeProps } from "@fancydashboard/sdk/plugins/types";
import { useModuleTheme } from "@fancydashboard/sdk/theme";
import { ClockConfigSchema, type ClockConfig } from "../Clock.config";
import { hexWithOpacity } from "../utils";

function getLuminance(hex: string) {
  let value = hex.replace("#", "");
  if (value.length === 3) value = value.split("").map((part) => part + part).join("");
  const red = parseInt(value.slice(0, 2), 16) / 255;
  const green = parseInt(value.slice(2, 4), 16) / 255;
  const blue = parseInt(value.slice(4, 6), 16) / 255;
  const [rs, gs, bs] = [red, green, blue].map((channel) =>
    channel <= 0.03928
      ? channel / 12.92
      : Math.pow((channel + 0.055) / 1.055, 2.4)
  );
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(hex1: string, hex2: string) {
  const first = getLuminance(hex1);
  const second = getLuminance(hex2);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

function formatTime(
  date: Date,
  format: "12h" | "24h",
  showSeconds: boolean
): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  if (format === "12h") {
    const hour = hours % 12 || 12;
    const suffix = hours < 12 ? "AM" : "PM";
    const time = showSeconds
      ? `${hour}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
      : `${hour}:${String(minutes).padStart(2, "0")}`;
    return `${time} ${suffix}`;
  }

  return showSeconds
    ? `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
    : `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function formatDate(date: Date, format: "full" | "short" | "none"): string {
  if (format === "none") return "";
  const options: Intl.DateTimeFormatOptions =
    format === "full"
      ? { weekday: "long", year: "numeric", month: "long", day: "numeric" }
      : { weekday: "short", month: "short", day: "numeric" };
  return date.toLocaleDateString("en-US", options);
}

function getTimeBinary(date: Date): string[] {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return [
    parseInt(hours[0]).toString(2).padStart(4, "0"),
    parseInt(hours[1]).toString(2).padStart(4, "0"),
    parseInt(minutes[0]).toString(2).padStart(4, "0"),
    parseInt(minutes[1]).toString(2).padStart(4, "0"),
    parseInt(seconds[0]).toString(2).padStart(4, "0"),
    parseInt(seconds[1]).toString(2).padStart(4, "0"),
  ];
}

interface ResponsiveClockMetrics {
  displayFontSize: number;
  secondaryFontSize: number;
  analogSize: number;
  binaryDotSize: number;
  binaryGap: number;
  showDate: boolean;
  showSeconds: boolean;
  reducedMotion: boolean;
}

function DigitalMinimalist({
  config,
  time,
  date,
  metrics,
}: {
  config: ClockConfig;
  time: string;
  date: string;
  metrics: ResponsiveClockMetrics;
}) {
  const { colors, typography } = config;
  return (
    <div className="flex h-full w-full min-w-0 flex-col items-center justify-center gap-[clamp(0.25rem,2cqh,0.5rem)] overflow-hidden px-[clamp(0.4rem,4cqw,1rem)]">
      <motion.div
        initial={metrics.reducedMotion ? false : { opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-full whitespace-nowrap text-center tabular-nums"
        style={{
          color: colors.primary,
          fontFamily:
            typography.fontFamily === "mono"
              ? "monospace"
              : typography.fontFamily === "serif"
                ? "serif"
                : "sans-serif",
          fontSize: metrics.displayFontSize,
          fontWeight: typography.fontWeight,
          lineHeight: 1,
        }}
      >
        {time}
      </motion.div>
      {metrics.showDate && date && (
        <motion.div
          initial={metrics.reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 0.7 }}
          className="max-w-full truncate text-center"
          style={{ color: colors.secondary, fontSize: metrics.secondaryFontSize }}
        >
          {date}
        </motion.div>
      )}
    </div>
  );
}

function DigitalNeon({
  config,
  time,
  date,
  metrics,
}: {
  config: ClockConfig;
  time: string;
  date: string;
  metrics: ResponsiveClockMetrics;
}) {
  const { colors } = config;
  return (
    <div className="relative flex h-full w-full min-w-0 flex-col items-center justify-center gap-[clamp(0.25rem,2cqh,0.65rem)] overflow-hidden px-[clamp(0.4rem,4cqw,1rem)]">
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="absolute inset-0 opacity-50"
        style={{ background: `radial-gradient(circle at center, ${colors.accent}40, transparent 70%)` }}
      />
      <motion.div
        initial={metrics.reducedMotion ? false : { opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 max-w-full whitespace-nowrap text-center font-mono font-bold tabular-nums"
        style={{
          color: colors.accent,
          fontSize: metrics.displayFontSize,
          lineHeight: 1,
          textShadow: metrics.reducedMotion
            ? `0 0 12px ${colors.accent}`
            : `0 0 5px ${colors.accent}, 0 0 15px ${colors.accent}, 0 0 30px ${colors.accent}`,
        }}
      >
        {time}
      </motion.div>
      {metrics.showDate && date && (
        <motion.div
          initial={metrics.reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 0.8 }}
          className="relative z-10 max-w-full truncate text-center"
          style={{
            color: colors.accent,
            fontSize: metrics.secondaryFontSize,
            textShadow: `0 0 8px ${colors.accent}`,
          }}
        >
          {date}
        </motion.div>
      )}
    </div>
  );
}

function AnalogClock({
  config,
  metrics,
  classic = true,
}: {
  config: ClockConfig;
  metrics: ResponsiveClockMetrics;
  classic?: boolean;
}) {
  const [date, setDate] = useState(new Date());
  const { colors } = config;

  useEffect(() => {
    const interval = window.setInterval(() => setDate(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const seconds = date.getSeconds();
  const minutes = date.getMinutes();
  const hours = date.getHours() % 12;
  const secondAngle = seconds * 6 - 90;
  const minuteAngle = minutes * 6 + seconds * 0.1 - 90;
  const hourAngle = hours * 30 + minutes * 0.5 - 90;

  return (
    <div className="flex h-full w-full items-center justify-center overflow-hidden p-[clamp(0.3rem,3cqw,0.75rem)]">
      <svg
        viewBox="0 0 200 200"
        style={{ width: metrics.analogSize, height: metrics.analogSize, maxWidth: "100%", maxHeight: "100%" }}
        role="img"
        aria-label="Analog clock"
      >
        <circle
          cx="100"
          cy="100"
          r="90"
          fill={classic ? colors.background : "transparent"}
          fillOpacity={colors.backgroundOpacity / 100}
          stroke={colors.primary}
          strokeWidth={classic ? "2" : "4"}
        />
        {[...Array(12)].map((_, index) => {
          const angle = index * 30 * (Math.PI / 180);
          const x1 = 100 + 75 * Math.cos(angle);
          const y1 = 100 + 75 * Math.sin(angle);
          const x2 = 100 + (classic ? 85 : 80) * Math.cos(angle);
          const y2 = 100 + (classic ? 85 : 80) * Math.sin(angle);
          return (
            <line
              key={index}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={index % 3 === 0 ? colors.accent : colors.secondary}
              strokeWidth={index % 3 === 0 ? "3" : "1.5"}
              strokeLinecap="round"
            />
          );
        })}
        <line
          x1="100"
          y1="100"
          x2={100 + 45 * Math.cos((hourAngle * Math.PI) / 180)}
          y2={100 + 45 * Math.sin((hourAngle * Math.PI) / 180)}
          stroke={colors.primary}
          strokeWidth={classic ? "4" : "6"}
          strokeLinecap="round"
        />
        <line
          x1="100"
          y1="100"
          x2={100 + 65 * Math.cos((minuteAngle * Math.PI) / 180)}
          y2={100 + 65 * Math.sin((minuteAngle * Math.PI) / 180)}
          stroke={colors.primary}
          strokeWidth={classic ? "3" : "4"}
          strokeLinecap="round"
        />
        {metrics.showSeconds && (
          <line
            x1="100"
            y1="100"
            x2={100 + 75 * Math.cos((secondAngle * Math.PI) / 180)}
            y2={100 + 75 * Math.sin((secondAngle * Math.PI) / 180)}
            stroke={colors.accent}
            strokeWidth="2"
            strokeLinecap="round"
          />
        )}
        <circle cx="100" cy="100" r="6" fill={colors.accent} />
      </svg>
    </div>
  );
}

function BinaryClock({
  config,
  metrics,
}: {
  config: ClockConfig;
  metrics: ResponsiveClockMetrics;
}) {
  const [date, setDate] = useState(new Date());
  const { colors } = config;

  useEffect(() => {
    const interval = window.setInterval(() => setDate(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const binary = getTimeBinary(date);
  return (
    <div className="flex h-full w-full flex-col items-center justify-center overflow-hidden px-2">
      <div className="grid grid-cols-6" style={{ gap: metrics.binaryGap }}>
        {binary.map((digit, digitIndex) => (
          <div key={digitIndex} className="flex flex-col" style={{ gap: Math.max(2, metrics.binaryGap / 2) }}>
            {digit.split("").map((bit, bitIndex) => (
              <motion.div
                key={bitIndex}
                initial={metrics.reducedMotion ? false : { scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: bit === "1" ? 1 : 0.45 }}
                transition={{ duration: metrics.reducedMotion ? 0 : 0.16 }}
                className={bit === "1" ? "rounded-sm" : "rounded-sm border"}
                style={{
                  width: metrics.binaryDotSize,
                  height: metrics.binaryDotSize,
                  backgroundColor: bit === "1" ? colors.accent : "transparent",
                  borderColor: bit === "1" ? "transparent" : colors.secondary,
                }}
              />
            ))}
          </div>
        ))}
      </div>
      {metrics.showDate && (
        <div
          className="mt-[clamp(0.25rem,2cqh,0.75rem)] text-center tabular-nums opacity-70"
          style={{ color: colors.primary, fontSize: metrics.secondaryFontSize }}
        >
          {formatTime(date, config.timeFormat, false)}
        </div>
      )}
    </div>
  );
}

export default function ClockWidget(props: WidgetRuntimeProps): ReactElement {
  const { theme, cx } = useModuleTheme();
  const viewport = useWidgetViewport();
  const parsedConfig = ClockConfigSchema.safeParse(props.config);
  let config = parsedConfig.success ? parsedConfig.data : DEFAULT_CONFIG;

  if (config.colors.backgroundOpacity > 60) {
    const contrast = getContrastRatio(config.colors.primary, config.colors.background);
    if (contrast < 3) {
      const backgroundIsDark = getLuminance(config.colors.background) < 0.5;
      config = {
        ...config,
        colors: {
          ...config.colors,
          primary: backgroundIsDark ? "#ffffff" : "#000000",
          secondary: backgroundIsDark ? "#cccccc" : "#333333",
        },
      };
    }
  }

  const [date, setDate] = useState(new Date());
  useEffect(() => {
    const interval = window.setInterval(() => setDate(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const metrics = useMemo<ResponsiveClockMetrics>(() => {
    const width = viewport.width || 320;
    const height = viewport.height || 220;
    const requested = config.typography.fontSize;
    const secondsFit = width >= 250 && height >= 130;
    const showSeconds = config.showSeconds && secondsFit;
    const chars = config.timeFormat === "12h" ? (showSeconds ? 11 : 8) : showSeconds ? 8 : 5;
    const widthBound = (width * 0.88) / Math.max(chars * 0.58, 1);
    const heightBound = height * (viewport.isShort ? 0.4 : 0.46);
    const displayFontSize = Math.max(18, Math.min(requested, widthBound, heightBound));
    const secondaryFontSize = Math.max(10, Math.min(displayFontSize * 0.28, 18));
    const analogSize = Math.max(72, Math.min(width, height) * 0.88);
    const binaryDotSize = Math.max(5, Math.min(16, Math.min(width / 12, height / 7)));
    const binaryGap = Math.max(2, Math.min(8, width / 55));
    return {
      displayFontSize,
      secondaryFontSize,
      analogSize,
      binaryDotSize,
      binaryGap,
      showDate: config.dateFormat !== "none" && !viewport.isShort && viewport.size !== "micro",
      showSeconds,
      reducedMotion: viewport.reducedMotion,
    };
  }, [config, viewport]);

  const time = formatTime(date, config.timeFormat, metrics.showSeconds);
  const dateString = formatDate(date, config.dateFormat);
  const backgroundColor = hexWithOpacity(config.colors.background, config.colors.backgroundOpacity);

  return (
    <section
      className={cx(
        theme.card.container,
        "h-full w-full min-w-0 overflow-hidden rounded-2xl border border-white/10 shadow-[0_18px_45px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-2xl"
      )}
      style={{ backgroundColor }}
      aria-label="Clock widget"
    >
      <div className={cx(theme.card.body, "h-full w-full min-w-0 overflow-hidden")} style={{ backgroundColor }}>
        {config.style === "digital-minimalist" && (
          <DigitalMinimalist config={config} time={time} date={dateString} metrics={metrics} />
        )}
        {config.style === "digital-neon" && (
          <DigitalNeon config={config} time={time} date={dateString} metrics={metrics} />
        )}
        {config.style === "analog-classic" && <AnalogClock config={config} metrics={metrics} classic />}
        {config.style === "analog-modern" && (
          <AnalogClock config={config} metrics={metrics} classic={false} />
        )}
        {config.style === "binary" && <BinaryClock config={config} metrics={metrics} />}
      </div>
    </section>
  );
}

const DEFAULT_CONFIG: ClockConfig = ClockConfigSchema.parse({});
