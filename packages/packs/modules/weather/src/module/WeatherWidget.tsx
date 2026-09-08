// ============================================================================
// Weather Widget Component
// Fancy animated weather display with Open-Meteo API integration
// ============================================================================

import { useState, useEffect, useRef, memo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Wind,
  Droplets,
  MapPin,
  Calendar,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import type { WidgetRuntimeProps } from "@fancydashboard/sdk/plugins/types";
import { usePluginContext } from "@fancydashboard/sdk/plugins/PluginContext";
import type {
  WeatherConfig,
  WeatherData,
  WeatherState,
  WeatherTheme,
} from "./types";
import { DEFAULT_LOCATION } from "./utils";

// ============================================================================
// Constants & Configuration
// ============================================================================

// WMO Weather Code mapping to internal weather states
const WMO_TO_STATE = (
  code: number | undefined,
  isDay: boolean
): WeatherState => {
  if (code === undefined) return "SUNNY";
  // Thunderstorm codes: 95, 96, 99
  if ([95, 96, 99].includes(code)) return "STORM";
  // Rain/Drizzle codes: 51-67, 80-82
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    return isDay ? "RAIN" : "NIGHT_RAIN";
  }
  // Snow codes (displayed as rain/cold): 71-77, 85-86
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "RAIN";
  // Cloudy/Fog codes: 1, 2, 3, 45, 48
  if ([1, 2, 3, 45, 48].includes(code)) return "CLOUDY";
  // Clear Sky: 0
  if (code === 0) return isDay ? "SUNNY" : "NIGHT";

  return isDay ? "SUNNY" : "NIGHT";
};

const WEATHER_THEMES: Record<WeatherState, WeatherTheme> = {
  SUNNY: {
    label: "Sunny",
    theme: "from-blue-400 via-blue-300 to-cyan-200",
    text: "text-blue-900",
    iconColor: "#FFD700",
  },
  INTENSE_SUN: {
    label: "Extreme Heat",
    theme: "from-orange-500 via-orange-400 to-yellow-300",
    text: "text-orange-900",
    iconColor: "#FF4500",
  },
  CLOUDY: {
    label: "Cloudy",
    theme: "from-slate-400 via-slate-300 to-gray-200",
    text: "text-slate-800",
    iconColor: "#94A3B8",
  },
  RAIN: {
    label: "Rainy",
    theme: "from-blue-800 via-blue-700 to-slate-600",
    text: "text-white",
    iconColor: "#A0D8EF",
  },
  STORM: {
    label: "Storm",
    theme: "from-indigo-900 via-slate-800 to-gray-900",
    text: "text-gray-100",
    iconColor: "#FFD700",
  },
  NIGHT: {
    label: "Clear Sky",
    theme: "from-indigo-950 via-purple-900 to-slate-900",
    text: "text-indigo-100",
    iconColor: "#FDFBF7",
  },
  NIGHT_RAIN: {
    label: "Rainy Night",
    theme: "from-slate-900 via-gray-900 to-black",
    text: "text-gray-300",
    iconColor: "#64748B",
  },
  COMET: {
    label: "Rare Event",
    theme: "from-violet-950 via-fuchsia-900 to-slate-900",
    text: "text-pink-100",
    iconColor: "#FFFFFF",
  },
};

// ============================================================================
// SVG Illustrations
// ============================================================================

const SunIllustration = memo(({ intense = false }: { intense?: boolean }) => {
  const reduced = useReducedMotion();
  return (
  <g transform="translate(100, 100)">
    <motion.g
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.5, opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <circle
        cx="0"
        cy="0"
        r={intense ? "45" : "38"}
        fill="url(#sunGradient)"
      />
      <motion.g animate={reduced ? {} : { rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
        {[...Array(12)].map((_, i) => (
          <line
            key={i}
            x1="0"
            y1="-50"
            x2="0"
            y2={intense ? "-25" : "-35"}
            stroke="#FFD700"
            strokeWidth="6"
            strokeLinecap="round"
            transform={`rotate(${i * 30})`}
            opacity="0.8"
          />
        ))}
      </motion.g>
      {intense && (
        <motion.circle
          cx="0"
          cy="0"
          r="60"
          stroke="#FF4500"
          strokeWidth="2"
          fill="transparent"
          animate={reduced ? { opacity: 0.3 } : { scale: [1, 1.15, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </motion.g>
  </g>
  );
});
SunIllustration.displayName = "SunIllustration";

const CloudIllustration = memo(
  ({
    dark = false,
    rain = false,
    storm = false,
  }: {
    dark?: boolean;
    rain?: boolean;
    storm?: boolean;
  }) => {
    const reduced = useReducedMotion();
    return (
    <g transform="translate(100, 100)">
      <motion.g
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 20, opacity: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.path
          d="M-25,15 Q-40,15 -40,0 Q-40,-20 -15,-20 Q-10,-45 25,-45 Q60,-45 60,-15 Q80,-15 80,5 Q80,25 50,25 L-25,25"
          fill={dark ? "url(#cloudDarkGradient)" : "url(#cloudGradient)"}
          filter="url(#glow)"
          transform="translate(-20, 0)"
          animate={reduced ? {} : { y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />

        {storm && (
          <motion.path
            d="M10,25 L-5,45 L5,45 L-10,70"
            stroke="#FFD700"
            strokeWidth="3"
            fill="none"
            initial={{ opacity: 0 }}
            animate={reduced ? { opacity: 1 } : { opacity: [0, 1, 0, 0, 1, 0] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatDelay: Math.random() * 2,
            }}
          />
        )}

        {rain && (
          <g transform="translate(-30, 15)">
            {[...Array(5)].map((_, i) => (
              <motion.line
                key={i}
                x1={i * 20}
                y1="0"
                x2={i * 20 - 5}
                y2={15}
                stroke="#A0D8EF"
                strokeWidth="3"
                strokeLinecap="round"
                initial={{ y: -10, opacity: 0 }}
                animate={reduced ? { y: 25, opacity: 1 } : { y: 25, opacity: [0, 1, 0] }}
                transition={{
                  duration: 0.9,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: "linear",
                }}
              />
            ))}
          </g>
        )}
      </motion.g>
    </g>
    );
  }
);
CloudIllustration.displayName = "CloudIllustration";

const MoonIllustration = memo(({ clear = true }: { clear?: boolean }) => {
  const reduced = useReducedMotion();
  return (
  <g transform="translate(100, 100)">
    <motion.g
      initial={{ scale: 0.8, opacity: 0, rotate: -15 }}
      animate={{ scale: 1, opacity: 1, rotate: 0 }}
      exit={{ scale: 0.8, opacity: 0, rotate: 15 }}
      transition={{ duration: 0.8 }}
    >
      <circle cx="0" cy="0" r="38" fill="url(#moonGradient)" />
      <circle cx="15" cy="-10" r="5" fill="rgba(0,0,0,0.1)" />
      <circle cx="-10" cy="10" r="8" fill="rgba(0,0,0,0.1)" />
      <circle cx="-15" cy="-15" r="4" fill="rgba(0,0,0,0.1)" />

      {clear &&
        [...Array(4)].map((_, i) => (
          <motion.path
            key={i}
            d="M0,-10 L2,-2 L10,0 L2,2 L0,10 L-2,2 L-10,0 L-2,-2 Z"
            fill="#FFF"
            transform={`translate(${30 + i * 20}, ${-40 + (i % 2) * 60}) scale(${0.4})`}
            animate={reduced ? { opacity: 0.8, scale: 0.4 } : {
              opacity: [0.3, 1, 0.3],
              scale: [0.3, 0.6, 0.3],
            }}
            transition={{ duration: 2 + i, repeat: Infinity }}
          />
        ))}
    </motion.g>
  </g>
  );
});
MoonIllustration.displayName = "MoonIllustration";

const CometIllustration = memo(() => {
  const reduced = useReducedMotion();
  return (
  <g transform="translate(100, 100)">
    <defs>
      <linearGradient id="cometTail" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFF" stopOpacity="0" />
        <stop offset="100%" stopColor="#FFF" stopOpacity="0.9" />
      </linearGradient>
    </defs>
    {[...Array(10)].map((_, i) => (
      <motion.circle
        key={`star-${i}`}
        cx={(Math.random() - 0.5) * 180}
        cy={(Math.random() - 0.5) * 180}
        r={Math.random() * 1.5 + 1}
        fill="#FFF"
        animate={reduced ? { opacity: 0.6 } : { opacity: [0.3, 0.8, 0.3] }}
        transition={{
          duration: Math.random() * 2 + 1,
          repeat: Infinity,
        }}
      />
    ))}
    <motion.g
      initial={{ x: -100, y: -100, opacity: 0 }}
      animate={reduced ? { x: 20, y: 20, opacity: 1 } : {
        x: [-50, 100],
        y: [-50, 100],
        opacity: [0, 1, 1, 0],
      }}
      transition={{
        duration: 3.5,
        repeat: Infinity,
        repeatDelay: 0.5,
        ease: "easeInOut",
      }}
    >
      <path
        d="M-20,-20 L40,40 L0,50 Z"
        fill="url(#cometTail)"
        transform="rotate(-45)"
      />
      <circle cx="40" cy="40" r="8" fill="#FFF" filter="url(#glow)" />
    </motion.g>
  </g>
  );
});
CometIllustration.displayName = "CometIllustration";

// ============================================================================
// Weather Data Hook
// ============================================================================

const useWeather = (config: WeatherConfig) => {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [coords, setCoords] = useState<{
    lat: number;
    lon: number;
    name: string;
  } | null>(null);

  // Auto-Detect or Manual Location
  useEffect(() => {
    if (config.location.mode === "manual") {
      if (config.location.latitude && config.location.longitude) {
        setCoords({
          lat: config.location.latitude,
          lon: config.location.longitude,
          name: config.location.name || "Local Manual",
        });
      } else {
        setError("Manual location not configured");
      }
      return;
    }

    // Auto mode
    if (!navigator.geolocation) {
      setCoords(DEFAULT_LOCATION);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setCoords({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          name: "Current Location",
        }),
      () =>
        setCoords({
          ...DEFAULT_LOCATION,
          name: `${DEFAULT_LOCATION.name} (Default)`,
        })
    );
  }, [config.location]);

  // Fetch Open-Meteo
  useEffect(() => {
    if (!coords) return;

    let isMounted = true;
    const abortController = new AbortController();

    const fetchWeather = async () => {
      if (!isMounted) return;
      setLoading(true);
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,is_day,weather_code,wind_speed_10m`;
        const res = await fetch(url, { signal: abortController.signal });
        const json = await res.json();

        if (json.error) throw new Error("API Error");

        const current = json.current;
        const stateKey = WMO_TO_STATE(current.weather_code, current.is_day);

        if (isMounted) {
          setData({
            temp: Math.round(current.temperature_2m),
            humidity: current.relative_humidity_2m,
            wind: Math.round(current.wind_speed_10m),
            condition: WEATHER_THEMES[stateKey].label,
            stateKey: stateKey,
            isDay: current.is_day === 1,
            location: coords.name,
          });
          setLastUpdated(new Date());
          setError(null);
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return; // Request was cancelled, do nothing
        }
        if (isMounted) {
          setError("Offline");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, config.refreshInterval);

    return () => {
      isMounted = false;
      abortController.abort();
      clearInterval(interval);
    };
  }, [coords, config.refreshInterval]);

  return { data, loading, error, lastUpdated };
};

// ============================================================================
// Container-aware responsive layout
// ============================================================================

function resolveWeatherSize(
  width: number,
  height: number,
  fallback: WeatherConfig["size"]
): WeatherConfig["size"] {
  if (width <= 0 || height <= 0) return fallback;
  if (width < 240 || height < 190) return "1x1";
  if (height < 250 && width >= 300) return "2x1";
  if (width >= 720 && height >= 560) return "4x4";
  if (width >= 520 && height >= 420) return "3x3";
  return "2x2";
}

// ============================================================================
// Main Weather Widget Component
// ============================================================================

export default function WeatherWidget(_props: WidgetRuntimeProps) {
  const { config: runtimeConfig } = usePluginContext();
  const config = runtimeConfig as unknown as WeatherConfig;
  const { data, loading, error, lastUpdated } = useWeather(config);
  const [debugState, setDebugState] = useState<WeatherState | "">("");
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [layoutSize, setLayoutSize] = useState<WeatherConfig["size"]>(config.size);

  useEffect(() => {
    const element = rootRef.current;
    if (!element || typeof ResizeObserver === "undefined") return;

    const updateSize = (width: number, height: number) => {
      setLayoutSize((previous) => {
        const next = resolveWeatherSize(width, height, config.size);
        return previous === next ? previous : next;
      });
    };

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) updateSize(entry.contentRect.width, entry.contentRect.height);
    });

    const rect = element.getBoundingClientRect();
    updateSize(rect.width, rect.height);
    observer.observe(element);
    return () => observer.disconnect();
  }, [config.size]);

  // Console debug commands (development only)
  useEffect(() => {
    if (import.meta.env.DEV) {
      interface FancyWindow extends Window {
        __fancyDashboard?: {
          debug?: Record<string, unknown>;
        };
      }
      const win = window as FancyWindow;
      // Use namespaced global to avoid conflicts
      if (!win.__fancyDashboard) {
        win.__fancyDashboard = {};
      }
      if (!win.__fancyDashboard.debug) {
        win.__fancyDashboard.debug = {};
      }

      win.__fancyDashboard.debug.weather = {
        setState: (state: WeatherState) => {
          console.log(`[Weather Debug] Setting state to: ${state}`);
          setDebugState(state);
        },
        clearState: () => {
          console.log("[Weather Debug] Clearing forced state");
          setDebugState("");
        },
        getAvailableStates: () => Object.keys(WEATHER_THEMES),
      };

      console.log(
        "[Weather Widget] Debug commands available: window.__fancyDashboard.debug.weather.setState(state), .clearState(), .getAvailableStates()"
      );
    }
  }, []);

  if (error && !data) {
    return (
      <div className="flex h-full w-full min-h-0 min-w-0 flex-col items-center justify-center overflow-hidden rounded-[clamp(1rem,6cqi,2.5rem)] border border-slate-700 bg-slate-900/90 p-[clamp(0.75rem,5cqi,1.5rem)] text-center text-white shadow-2xl backdrop-blur-xl">
        <AlertTriangle className="mb-3 text-red-400" size={40} aria-hidden="true" />
        <h3 className="text-[clamp(1rem,7cqi,1.25rem)] font-semibold">Weather Unavailable</h3>
        <p className="mt-2 max-w-full truncate text-[clamp(0.7rem,4cqi,0.875rem)] text-slate-400">{error}</p>
      </div>
    );
  }

  // State Resolution
  const activeStateKey: WeatherState =
    (config.forceState as WeatherState) ||
    debugState ||
    data?.stateKey ||
    "SUNNY";
  const theme = WEATHER_THEMES[activeStateKey] || WEATHER_THEMES["SUNNY"];
  const displayData = data || {
    temp: "--",
    condition: "Loading...",
    wind: 0,
    humidity: 0,
    location: "...",
  };

  // Layout Engine
  const getLayoutConfig = () => {
    switch (layoutSize) {
      case "1x1":
        return {
          classes: "col-span-1 row-span-1 min-h-[160px] p-4",
          isSmall: true,
          typo: { temp: "text-5xl", sub: "text-xs" },
        };
      case "2x1":
        return {
          classes: "col-span-1 md:col-span-2 row-span-1 min-h-[160px] p-5",
          isWide: true,
          typo: { temp: "text-6xl", sub: "text-sm" },
        };
      case "3x3":
        return {
          classes: "col-span-2 md:col-span-3 row-span-3 min-h-[500px] p-8",
          isGiant: true,
          typo: { temp: "text-9xl", sub: "text-2xl" },
        };
      case "4x4":
        return {
          classes: "col-span-full row-span-4 min-h-[600px] p-10",
          isGiant: true,
          typo: { temp: "text-[10rem]", sub: "text-3xl" },
        };
      case "2x2":
      default:
        return {
          classes: "col-span-1 md:col-span-2 row-span-2 min-h-[340px] p-6",
          isStandard: true,
          typo: { temp: "text-7xl", sub: "text-lg" },
        };
    }
  };

  const layoutConfig = getLayoutConfig();

  return (
    <motion.div
      ref={rootRef}
      layout
      className={`relative h-full w-full min-h-0 min-w-0 overflow-hidden rounded-[clamp(1rem,5cqi,2.5rem)] shadow-2xl transition-all duration-700 motion-reduce:transition-none ease-out bg-linear-to-br ${theme.theme} flex flex-col justify-between group select-none`}
      style={{
        padding: layoutConfig.isSmall
          ? "clamp(0.5rem, 4cqi, 1rem)"
          : layoutConfig.isGiant
            ? "clamp(1.5rem, 5cqi, 2.5rem)"
            : "clamp(0.75rem, 4cqi, 1.5rem)",
      }}
    >
      {/* SVG DEFINITIONS */}
      <svg className="absolute w-0 h-0">
        <defs>
          <radialGradient
            id="sunGradient"
            cx="50%"
            cy="50%"
            r="50%"
            fx="50%"
            fy="50%"
          >
            <stop offset="0%" stopColor="#FFF7E0" />
            <stop offset="90%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#FFB900" />
          </radialGradient>
          <linearGradient id="cloudGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#E2E8F0" />
          </linearGradient>
          <linearGradient
            id="cloudDarkGradient"
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#94A3B8" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>
          <linearGradient
            id="moonGradient"
            x1="30%"
            y1="30%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#FDFBF7" />
            <stop offset="100%" stopColor="#E2E2E2" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      {/* HEADER */}
      {!layoutConfig.isSmall && (
        <div
          className={`relative z-10 flex justify-between items-start ${theme.text} opacity-90`}
        >
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
            <Calendar size={12} />
            <span className="text-xs font-bold uppercase tracking-wider">
              TODAY
            </span>
          </div>
          <div className="flex gap-2">
            {loading && <RefreshCw size={14} className="animate-spin" />}
            {!loading && !error && (
              <div
                className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)] mt-1 cursor-help"
                title={`Last updated: ${lastUpdated?.toLocaleTimeString()}`}
              />
            )}
            {error && <AlertTriangle size={14} className="text-red-400" />}
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div
        className={`relative z-10 flex flex-1 ${layoutConfig.isSmall ? "flex-col items-center justify-center" : "flex-row items-end"}`}
      >
        {/* TEXT DATA */}
        <div
          className={`flex flex-col ${layoutConfig.isSmall ? "items-center text-center" : "flex-1"} ${layoutConfig.isGiant ? "mb-8 ml-4" : ""}`}
        >
          {loading && !data && (
            <div className="animate-pulse flex flex-col gap-2 items-center md:items-start">
              <div className="h-16 w-24 bg-white/20 rounded-lg"></div>
              {!layoutConfig.isSmall && (
                <div className="h-4 w-32 bg-white/20 rounded-lg"></div>
              )}
            </div>
          )}

          {!loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1
                className={`font-bold leading-none tracking-tighter ${theme.text} drop-shadow-[0_4px_16px_rgba(0,0,0,0.3)] ${layoutConfig.typo.temp}`}
              >
                {displayData.temp}°
              </h1>

              {!layoutConfig.isSmall && (
                <p
                  className={`font-medium opacity-90 ${theme.text} ${layoutConfig.typo.sub}`}
                >
                  {displayData.condition}
                </p>
              )}

              {/* DETAILS ROW */}
              {!layoutConfig.isSmall && (
                <div
                  className={`mt-4 grid grid-cols-2 gap-2 ${layoutConfig.isGiant ? "max-w-md" : "max-w-55"}`}
                >
                  <div
                    className={`bg-white/10 backdrop-blur-md border border-white/5 rounded-xl flex items-center gap-2 ${theme.text} ${layoutConfig.isGiant ? "p-4" : "p-2"}`}
                  >
                    <Wind
                      size={layoutConfig.isGiant ? 24 : 14}
                      className="opacity-70"
                    />
                    <span
                      className={`font-semibold ${layoutConfig.isGiant ? "text-lg" : "text-xs"}`}
                    >
                      {displayData.wind} km/h
                    </span>
                  </div>
                  <div
                    className={`bg-white/10 backdrop-blur-md border border-white/5 rounded-xl flex items-center gap-2 ${theme.text} ${layoutConfig.isGiant ? "p-4" : "p-2"}`}
                  >
                    <Droplets
                      size={layoutConfig.isGiant ? 24 : 14}
                      className="opacity-70"
                    />
                    <span
                      className={`font-semibold ${layoutConfig.isGiant ? "text-lg" : "text-xs"}`}
                    >
                      {displayData.humidity}%
                    </span>
                  </div>
                  <div
                    className={`bg-white/10 backdrop-blur-md border border-white/5 rounded-xl flex items-center gap-2 ${theme.text} col-span-2 ${layoutConfig.isGiant ? "p-4" : "p-2"}`}
                  >
                    <MapPin
                      size={layoutConfig.isGiant ? 24 : 14}
                      className="opacity-70"
                    />
                    <span
                      className={`font-semibold truncate ${layoutConfig.isGiant ? "text-lg" : "text-xs"}`}
                    >
                      {displayData.location}
                    </span>
                  </div>
                </div>
              )}

              {layoutConfig.isSmall && (
                <div
                  className={`mt-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-[10px] font-bold uppercase ${theme.text}`}
                >
                  {String(displayData.location).split(" ")[0]}
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* ILLUSTRATION CONTAINER */}
        <div
          className={`
            relative flex items-center justify-center transition-all duration-500
            ${layoutConfig.isSmall ? "w-24 h-24 absolute top-0 opacity-20 pointer-events-none" : ""}
            ${layoutConfig.isWide ? "w-1/3 h-full scale-110 translate-y-4" : ""}
            ${layoutConfig.isStandard ? "w-1/2 h-full scale-125 translate-x-4 translate-y-4" : ""}
            ${layoutConfig.isGiant ? "absolute right-0 top-1/2 -translate-y-1/2 w-[60%] h-[80%] scale-150 opacity-90 pointer-events-none" : ""}
        `}
        >
          <motion.svg
            viewBox="0 0 200 200"
            className="w-full h-full overflow-visible drop-shadow-2xl"
          >
            <AnimatePresence mode="popLayout">
              {activeStateKey === "SUNNY" && <SunIllustration key="sunny" />}
              {activeStateKey === "INTENSE_SUN" && (
                <SunIllustration key="intense" intense />
              )}
              {activeStateKey === "CLOUDY" && (
                <CloudIllustration key="cloudy" />
              )}
              {activeStateKey === "RAIN" && (
                <CloudIllustration key="rain" dark rain />
              )}
              {activeStateKey === "STORM" && (
                <CloudIllustration key="storm" dark rain storm />
              )}
              {activeStateKey === "NIGHT" && <MoonIllustration key="night" />}
              {activeStateKey === "NIGHT_RAIN" && (
                <g key="night_rain">
                  <g transform="translate(40, -40) scale(0.6)">
                    <MoonIllustration clear={false} />
                  </g>
                  <g transform="translate(-10, 20)">
                    <CloudIllustration dark rain />
                  </g>
                </g>
              )}
              {activeStateKey === "COMET" && <CometIllustration key="comet" />}
            </AnimatePresence>
          </motion.svg>
        </div>
      </div>

      {/* DEBUG MODE OVERLAY */}
      {config.debugMode && (
        <div className="absolute top-2 right-2 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <select
            className="bg-black/60 text-white text-[10px] py-1 px-2 rounded-lg backdrop-blur border border-white/10 outline-none cursor-pointer hover:bg-black/80"
            onChange={(e) => setDebugState(e.target.value as WeatherState | "")}
            value={debugState}
          >
            <option value="">Auto (API)</option>
            {Object.keys(WEATHER_THEMES).map((k) => (
              <option key={k} value={k}>
                {WEATHER_THEMES[k as WeatherState].label}
              </option>
            ))}
          </select>
        </div>
      )}
    </motion.div>
  );
}
