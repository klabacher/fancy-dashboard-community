import { useEffect, useState, type ReactElement } from "react";
import { motion } from "framer-motion";

import type { WidgetRuntimeProps } from "@fancydashboard/sdk/plugins/types";
import { useModuleTheme } from "@fancydashboard/sdk/theme";
import { ClockConfigSchema, type ClockConfig } from "../Clock.config";
import { hexWithOpacity } from "../utils";

function getLuminance(hex: string) {
  let c = hex.replace("#", "");
  if (c.length === 3) c = c.split("").map((x) => x + x).join("");
  const r = parseInt(c.slice(0, 2), 16) / 255;
  const g = parseInt(c.slice(2, 4), 16) / 255;
  const b = parseInt(c.slice(4, 6), 16) / 255;
  const [rs, gs, bs] = [r, g, b].map((v) =>
    v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  );
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(hex1: string, hex2: string) {
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
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
    const h = hours % 12 || 12;
    const ampm = hours < 12 ? "AM" : "PM";
    const time = showSeconds
      ? `${h}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
      : `${h}:${String(minutes).padStart(2, "0")}`;
    return `${time} ${ampm}`;
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

function DigitalMinimalist({
  config,
  time,
  date,
}: {
  config: ClockConfig;
  time: string;
  date: string;
}) {
  const { colors, typography } = config;

  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-2">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
        style={{
          color: colors.primary,
          fontFamily:
            typography.fontFamily === "mono"
              ? "monospace"
              : typography.fontFamily === "serif"
                ? "serif"
                : "sans-serif",
          fontSize: `${typography.fontSize}px`,
          fontWeight: typography.fontWeight,
          lineHeight: 1,
        }}
      >
        {time}
      </motion.div>
      {date && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          style={{
            color: colors.secondary,
            fontSize: `${typography.fontSize * 0.25}px`,
            fontWeight: "normal",
          }}
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
}: {
  config: ClockConfig;
  time: string;
  date: string;
}) {
  const { colors, typography } = config;

  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-3 relative overflow-hidden">
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="absolute inset-0 opacity-50"
        style={{
          background: `radial-gradient(circle at center, ${colors.accent}40, transparent 70%)`,
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center relative z-10"
        style={{
          color: colors.accent,
          fontFamily: "monospace",
          fontSize: `${typography.fontSize}px`,
          fontWeight: "bold",
          lineHeight: 1,
          textShadow: `
            0 0 5px ${colors.accent},
            0 0 15px ${colors.accent},
            0 0 30px ${colors.accent},
            0 0 50px ${colors.accent}
          `,
        }}
      >
        {time}
      </motion.div>
      {date && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          className="relative z-10"
          style={{
            color: colors.accent,
            fontSize: `${typography.fontSize * 0.25}px`,
            fontWeight: "normal",
            textShadow: `0 0 10px ${colors.accent}`,
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
  classic = true,
}: {
  config: ClockConfig;
  classic?: boolean;
}) {
  const [date, setDate] = useState(new Date());
  const { colors } = config;

  useEffect(() => {
    const interval = setInterval(() => setDate(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const seconds = date.getSeconds();
  const minutes = date.getMinutes();
  const hours = date.getHours() % 12;

  const secondAngle = seconds * 6 - 90;
  const minuteAngle = minutes * 6 + seconds * 0.1 - 90;
  const hourAngle = hours * 30 + minutes * 0.5 - 90;

  return (
    <div className="flex items-center justify-center w-full h-full">
      <svg viewBox="0 0 200 200" className="w-full h-full max-w-75 max-h-75">
        <circle
          cx="100"
          cy="100"
          r="90"
          fill={classic ? colors.background : "transparent"}
          fillOpacity={colors.backgroundOpacity / 100}
          stroke={colors.primary}
          strokeWidth={classic ? "2" : "4"}
        />

        {[...Array(12)].map((_, i) => {
          const angle = i * 30 * (Math.PI / 180);
          const x1 = 100 + 75 * Math.cos(angle);
          const y1 = 100 + 75 * Math.sin(angle);
          const x2 = 100 + (classic ? 85 : 80) * Math.cos(angle);
          const y2 = 100 + (classic ? 85 : 80) * Math.sin(angle);

          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={i % 3 === 0 ? colors.accent : colors.secondary}
              strokeWidth={i % 3 === 0 ? "3" : "1.5"}
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

        <line
          x1="100"
          y1="100"
          x2={100 + 75 * Math.cos((secondAngle * Math.PI) / 180)}
          y2={100 + 75 * Math.sin((secondAngle * Math.PI) / 180)}
          stroke={colors.accent}
          strokeWidth="2"
          strokeLinecap="round"
        />

        <circle cx="100" cy="100" r="6" fill={colors.accent} />
      </svg>
    </div>
  );
}

function BinaryClock({ config }: { config: ClockConfig }) {
  const [date, setDate] = useState(new Date());
  const { colors, typography } = config;

  useEffect(() => {
    const interval = setInterval(() => setDate(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const binary = getTimeBinary(date);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-4">
      <div className="grid grid-cols-6 gap-2">
        {binary.map((digit, digitIndex) => (
          <div key={digitIndex} className="flex flex-col gap-1">
            {digit.split("").map((bit, bitIndex) => (
              <motion.div
                key={bitIndex}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{
                  scale: 1,
                  opacity: bit === "1" ? 1 : 0.5,
                }}
                transition={{ duration: 0.2 }}
                className={`w-4 h-4 rounded ${bit === "1" ? "" : "border-2"}`}
                style={{
                  backgroundColor: bit === "1" ? colors.accent : "transparent",
                  borderColor: bit === "1" ? "transparent" : colors.secondary,
                }}
              />
            ))}
          </div>
        ))}
      </div>
      <div
        className="text-center"
        style={{
          color: colors.primary,
          ...(typography.fontFamily === "mono"
            ? { fontFamily: "monospace" }
            : {}),
          fontSize: `${typography.fontSize * 0.3}px`,
          opacity: 0.7,
        }}
      >
        {formatTime(date, config.timeFormat, false)}
      </div>
    </div>
  );
}

export default function ClockWidget(props: WidgetRuntimeProps): ReactElement {
  const { theme, cx } = useModuleTheme();
  const parsedConfig = ClockConfigSchema.safeParse(props.config);
  let config = parsedConfig.success ? parsedConfig.data : DEFAULT_CONFIG;

  if (config.colors.backgroundOpacity > 60) {
    const contrast = getContrastRatio(config.colors.primary, config.colors.background);
    if (contrast < 3) {
      const bgDark = getLuminance(config.colors.background) < 0.5;
      config = {
        ...config,
        colors: {
          ...config.colors,
          primary: bgDark ? "#ffffff" : "#000000",
          secondary: bgDark ? "#cccccc" : "#333333",
        },
      };
    }
  }

  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setDate(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const time = formatTime(date, config.timeFormat, config.showSeconds);
  const dateStr = formatDate(date, config.dateFormat);

  const bgColor = hexWithOpacity(
    config.colors.background,
    config.colors.backgroundOpacity
  );

  return (
    <div
      className={cx(theme.card.container, "w-full h-full overflow-hidden")}
      style={{ backgroundColor: bgColor }}
    >
      <div
        className={cx(theme.card.body, "w-full h-full")}
        style={{ backgroundColor: bgColor }}
      >
        {config.style === "digital-minimalist" && (
          <DigitalMinimalist config={config} time={time} date={dateStr} />
        )}
        {config.style === "digital-neon" && (
          <DigitalNeon config={config} time={time} date={dateStr} />
        )}
        {config.style === "analog-classic" && (
          <AnalogClock config={config} classic />
        )}
        {config.style === "analog-modern" && (
          <AnalogClock config={config} classic={false} />
        )}
        {config.style === "binary" && <BinaryClock config={config} />}
      </div>
    </div>
  );
}

const DEFAULT_CONFIG: ClockConfig = ClockConfigSchema.parse({});
