import { useEffect, useMemo, useState, type ReactElement } from "react";
import { motion } from "framer-motion";
import { Droplets, MapPin, Wind } from "lucide-react";

import { useWidgetViewport } from "@fancydashboard/sdk";
import type {
  Permission,
  WidgetRuntimeProps,
} from "@fancydashboard/sdk/plugins/types";
import { useModuleTheme } from "@fancydashboard/sdk/theme";
import { usePluginContext } from "@fancydashboard/sdk/plugins/PluginContext";
import { ClockConfigSchema, type ClockConfig } from "../Clock.config";
import { DEFAULT_LOCATION, hexWithOpacity } from "../utils";

interface WeatherData {
  temp: number;
  humidity: number;
  wind: number;
  isDay: boolean;
  location: string;
}

function hasNetFetchPermission(permissions: Permission[]): boolean {
  return permissions.some(
    (permission) =>
      permission.kind === "net:fetch" &&
      permission.allow.some((allowed) =>
        allowed.startsWith("https://api.open-meteo.com")
      )
  );
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

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function resolveWeatherLocation(config: ClockConfig): {
  lat: number;
  lon: number;
  label: string;
} {
  const latitude = config.weatherLocation.latitude;
  const longitude = config.weatherLocation.longitude;

  if (latitude !== null && longitude !== null) {
    return {
      lat: latitude,
      lon: longitude,
      label: config.weatherLocation.name ?? "Location",
    };
  }

  if (config.weatherLocation.mode === "manual") {
    return {
      lat: DEFAULT_LOCATION.lat,
      lon: DEFAULT_LOCATION.lon,
      label: "Fallback location",
    };
  }

  return {
    lat: DEFAULT_LOCATION.lat,
    lon: DEFAULT_LOCATION.lon,
    label: DEFAULT_LOCATION.name,
  };
}

export default function WeatherClock(props: WidgetRuntimeProps): ReactElement {
  const { theme, cx } = useModuleTheme();
  const { permissions, logger } = usePluginContext();
  const viewport = useWidgetViewport();

  const parsedConfig = ClockConfigSchema.safeParse(props.config);
  const config = parsedConfig.success
    ? parsedConfig.data
    : ClockConfigSchema.parse({});

  const [now, setNow] = useState(() => new Date());
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canFetch = useMemo(
    () => hasNetFetchPermission(permissions),
    [permissions]
  );
  const location = useMemo(() => resolveWeatherLocation(config), [config]);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchWeather = async () => {
      if (!canFetch) {
        setLoading(false);
        setError("Weather permission unavailable");
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&current=temperature_2m,relative_humidity_2m,is_day,weather_code,wind_speed_10m`;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Weather service returned ${response.status}`);
        }
        const json: unknown = await response.json();
        if (typeof json !== "object" || json === null) {
          throw new Error("Invalid weather response");
        }
        const current = (json as { current?: unknown }).current;
        if (typeof current !== "object" || current === null) {
          throw new Error("Invalid weather payload");
        }
        const payload = current as {
          temperature_2m?: number;
          relative_humidity_2m?: number;
          wind_speed_10m?: number;
          is_day?: number;
        };
        const next: WeatherData = {
          temp: Math.round(payload.temperature_2m ?? 0),
          humidity: Math.round(payload.relative_humidity_2m ?? 0),
          wind: Math.round(payload.wind_speed_10m ?? 0),
          isDay: (payload.is_day ?? 1) === 1,
          location: location.label,
        };
        if (!cancelled) setData(next);
      } catch (caught) {
        const message =
          caught instanceof Error ? caught.message : "Weather fetch failed";
        logger.error("Weather fetch failed", caught);
        if (!cancelled) setError(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void fetchWeather();
    const interval = window.setInterval(fetchWeather, 900_000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [canFetch, location.label, location.lat, location.lon, logger]);

  const metrics = useMemo(() => {
    const width = viewport.width || 360;
    const height = viewport.height || 260;
    const compact = viewport.size === "micro" || viewport.size === "compact";
    const showSeconds = config.showSeconds && width >= 270 && height >= 150;
    const characterCount = config.timeFormat === "12h" ? (showSeconds ? 11 : 8) : showSeconds ? 8 : 5;
    const displayFontSize = Math.max(
      18,
      Math.min(
        config.typography.fontSize,
        (width * 0.88) / Math.max(characterCount * 0.58, 1),
        height * (compact ? 0.3 : 0.36)
      )
    );
    return {
      compact,
      showSeconds,
      showDate: !viewport.isShort && viewport.size !== "micro",
      showMetrics: width >= 250 && height >= 190,
      showLocation: width >= 300 && height >= 235,
      displayFontSize,
      secondaryFontSize: Math.max(10, Math.min(displayFontSize * 0.27, 17)),
    };
  }, [config, viewport]);

  const time = formatTime(now, config.timeFormat, metrics.showSeconds);
  const dateString = formatDate(now);
  const backgroundColor = hexWithOpacity(
    config.colors.background,
    config.colors.backgroundOpacity
  );

  return (
    <section
      className={cx(
        theme.card.container,
        "h-full w-full min-w-0 overflow-hidden rounded-2xl border border-white/10 shadow-[0_18px_45px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-2xl"
      )}
      style={{ backgroundColor }}
      aria-label="Weather clock widget"
    >
      <div
        className={cx(
          theme.card.body,
          "h-full w-full min-w-0 overflow-hidden p-[clamp(0.5rem,4cqw,1.5rem)]"
        )}
        style={{
          background: data?.isDay
            ? `linear-gradient(135deg, ${config.colors.background}ee, ${config.colors.accent}35)`
            : `linear-gradient(135deg, ${config.colors.background}ee, #0f172a)`,
        }}
      >
        <div className="flex h-full min-h-0 flex-col justify-between gap-[clamp(0.35rem,2cqh,0.8rem)]">
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden">
            <motion.div
              initial={viewport.reducedMotion ? false : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-full whitespace-nowrap text-center tabular-nums"
              style={{
                color: config.colors.primary,
                fontFamily:
                  config.typography.fontFamily === "mono"
                    ? "monospace"
                    : config.typography.fontFamily === "serif"
                      ? "serif"
                      : "sans-serif",
                fontSize: metrics.displayFontSize,
                fontWeight: config.typography.fontWeight,
                lineHeight: 1,
              }}
            >
              {time}
            </motion.div>
            {metrics.showDate && (
              <motion.div
                initial={viewport.reducedMotion ? false : { opacity: 0 }}
                animate={{ opacity: 0.7 }}
                className="mt-[clamp(0.2rem,1.5cqh,0.5rem)] max-w-full truncate text-center"
                style={{
                  color: config.colors.secondary,
                  fontSize: metrics.secondaryFontSize,
                }}
              >
                {dateString}
              </motion.div>
            )}
          </div>

          {metrics.showMetrics && (
            <div
              className="min-w-0 border-t pt-[clamp(0.35rem,2cqh,0.75rem)]"
              style={{ borderColor: `${config.colors.secondary}30` }}
            >
              {loading ? (
                <div
                  className={`h-12 rounded-xl bg-white/10 ${viewport.reducedMotion ? "" : "animate-pulse"}`}
                  aria-label="Loading weather"
                />
              ) : error ? (
                <div className={cx(theme.text.muted, "truncate text-xs")} role="status">
                  {error}
                </div>
              ) : data ? (
                <>
                  <div className="flex min-w-0 items-center justify-between gap-2">
                    <span
                      className="shrink-0 font-bold tabular-nums"
                      style={{
                        color: config.colors.primary,
                        fontSize: `clamp(1.25rem, ${Math.max(8, Math.min(viewport.width / 8, 36))}px, 2.25rem)`,
                      }}
                    >
                      {data.temp}°
                    </span>
                    <div className="flex min-w-0 flex-wrap justify-end gap-1.5">
                      <div
                        className="flex items-center gap-1 rounded-lg px-2 py-1"
                        style={{
                          backgroundColor: `${config.colors.primary}10`,
                          color: config.colors.secondary,
                        }}
                        title="Wind speed"
                      >
                        <Wind size={13} aria-hidden="true" />
                        <span className="whitespace-nowrap text-[11px] font-semibold">
                          {data.wind} km/h
                        </span>
                      </div>
                      {!metrics.compact && (
                        <div
                          className="flex items-center gap-1 rounded-lg px-2 py-1"
                          style={{
                            backgroundColor: `${config.colors.primary}10`,
                            color: config.colors.secondary,
                          }}
                          title="Humidity"
                        >
                          <Droplets size={13} aria-hidden="true" />
                          <span className="whitespace-nowrap text-[11px] font-semibold">
                            {data.humidity}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {metrics.showLocation && (
                    <div
                      className="mt-1.5 flex min-w-0 items-center gap-1"
                      style={{ color: config.colors.secondary }}
                    >
                      <MapPin size={12} className="shrink-0" aria-hidden="true" />
                      <span className="truncate text-[11px]">{data.location}</span>
                    </div>
                  )}
                </>
              ) : (
                <div className={cx(theme.text.muted, "text-xs")}>No weather data.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
