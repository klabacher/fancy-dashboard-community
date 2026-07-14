import { useEffect, useMemo, useState, type ReactElement } from "react";
import { motion } from "framer-motion";
import { Droplets, MapPin, Wind } from "lucide-react";

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
  for (const permission of permissions) {
    if (permission.kind !== "net:fetch") continue;
    return permission.allow.some((allowed) =>
      allowed.startsWith("https://api.open-meteo.com")
    );
  }
  return false;
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
  isManual: boolean;
} {
  const latitude = config.weatherLocation.latitude;
  const longitude = config.weatherLocation.longitude;

  // Back-compat: legacy configs may include coordinates without a mode.
  if (latitude !== null && longitude !== null) {
    return {
      lat: latitude,
      lon: longitude,
      label: config.weatherLocation.name ?? "Location",
      isManual: true,
    };
  }

  const mode = config.weatherLocation.mode;

  if (mode === "manual") {
    return {
      lat: DEFAULT_LOCATION.lat,
      lon: DEFAULT_LOCATION.lon,
      label: "Manual location (invalid, using fallback)",
      isManual: true,
    };
  }

  return {
    lat: DEFAULT_LOCATION.lat,
    lon: DEFAULT_LOCATION.lon,
    label: DEFAULT_LOCATION.name,
    isManual: false,
  };
}

export default function WeatherClock(props: WidgetRuntimeProps): ReactElement {
  const { theme, cx } = useModuleTheme();
  const { permissions, logger } = usePluginContext();

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
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchWeather = async () => {
      if (!canFetch) {
        setLoading(false);
        setError("Missing permission net:fetch for api.open-meteo.com");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&current=temperature_2m,relative_humidity_2m,is_day,weather_code,wind_speed_10m`;
        const res = await fetch(url);
        const json: unknown = await res.json();

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

        if (!cancelled) {
          setData(next);
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Weather fetch failed";
        logger.error("Weather fetch failed", err);
        if (!cancelled) {
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 900000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [canFetch, location.label, location.lat, location.lon, logger]);

  const time = formatTime(now, config.timeFormat, config.showSeconds);
  const dateStr = formatDate(now);

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
        className={cx(theme.card.body, "w-full h-full p-6")}
        style={{
          background: data?.isDay
            ? `linear-gradient(135deg, ${config.colors.background}ee, ${config.colors.accent}40)`
            : `linear-gradient(135deg, ${config.colors.background}ee, #1e293b)`,
        }}
      >
        <div className="flex flex-col h-full justify-between">
          <div className="flex-1 flex flex-col items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
              style={{
                color: config.colors.primary,
                fontFamily:
                  config.typography.fontFamily === "mono"
                    ? "monospace"
                    : config.typography.fontFamily === "serif"
                      ? "serif"
                      : "sans-serif",
                fontSize: `${config.typography.fontSize}px`,
                fontWeight: config.typography.fontWeight,
                lineHeight: 1,
              }}
            >
              {time}
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              style={{
                color: config.colors.secondary,
                fontSize: `${config.typography.fontSize * 0.25}px`,
                fontWeight: "normal",
                marginTop: "8px",
              }}
            >
              {dateStr}
            </motion.div>
          </div>

          <div
            className="border-t pt-4 mt-4"
            style={{ borderColor: `${config.colors.secondary}40` }}
          >
            {loading ? (
              <div className="h-16 bg-white/10 rounded-lg animate-pulse" />
            ) : error ? (
              <div className={cx(theme.text.muted, "text-xs")}>{error}</div>
            ) : data ? (
              <>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-4xl font-bold"
                      style={{ color: config.colors.primary }}
                    >
                      {data.temp}°
                    </span>
                  </div>

                  <div className="flex gap-3">
                    <div
                      className="flex items-center gap-1 px-2 py-1 rounded-lg"
                      style={{
                        backgroundColor: `${config.colors.primary}10`,
                        color: config.colors.secondary,
                      }}
                    >
                      <Wind size={14} />
                      <span className="text-xs font-semibold">
                        {data.wind} km/h
                      </span>
                    </div>

                    <div
                      className="flex items-center gap-1 px-2 py-1 rounded-lg"
                      style={{
                        backgroundColor: `${config.colors.primary}10`,
                        color: config.colors.secondary,
                      }}
                    >
                      <Droplets size={14} />
                      <span className="text-xs font-semibold">
                        {data.humidity}%
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className="flex items-center gap-1 mt-2"
                  style={{ color: config.colors.secondary }}
                >
                  <MapPin size={12} />
                  <span className="text-xs">{data.location}</span>
                </div>
              </>
            ) : (
              <div className={cx(theme.text.muted, "text-xs")}>
                No weather data.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
