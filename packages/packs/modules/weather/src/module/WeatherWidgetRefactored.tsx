// ============================================================================
// Weather Widget Component (REFACTORED)
// Demonstrates the new "Customization First" architecture
// Uses FancyWidgetWrapper, useFancyTheme, useFancyToast
// ============================================================================

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wind,
  Droplets,
  MapPin,
  Calendar,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { FancyWidgetWrapper } from "@/components/FancyWidgetWrapper";
import { useFancyToast } from "@/hooks/useFancyToast";
import type { WidgetRuntimeProps } from "@fancydashboard/sdk/plugins/types";
import type {
  WeatherConfig,
  WeatherData,
  WeatherState,
  WeatherTheme,
} from "./types";
import type { ThemeStack } from "@/types/customization";
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
// SVG Illustrations (same as before)
// ============================================================================

const SunIllustration = ({ intense = false }: { intense?: boolean }) => (
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
      <motion.g
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
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
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </motion.g>
  </g>
);

const CloudIllustration = ({
  dark = false,
  rain = false,
  storm = false,
}: {
  dark?: boolean;
  rain?: boolean;
  storm?: boolean;
}) => (
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
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {storm && (
        <motion.path
          d="M10,25 L-5,45 L5,45 L-10,70"
          stroke="#FFD700"
          strokeWidth="3"
          fill="none"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0, 0, 1, 0] }}
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
              animate={{ y: 25, opacity: [0, 1, 0] }}
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

const MoonIllustration = ({ clear = true }: { clear?: boolean }) => (
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
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [0.3, 0.6, 0.3],
            }}
            transition={{ duration: 2 + i, repeat: Infinity }}
          />
        ))}
    </motion.g>
  </g>
);

const CometIllustration = () => (
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
        animate={{ opacity: [0.3, 0.8, 0.3] }}
        transition={{
          duration: Math.random() * 2 + 1,
          repeat: Infinity,
        }}
      />
    ))}
    <motion.g
      initial={{ x: -100, y: -100, opacity: 0 }}
      animate={{
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

// ============================================================================
// Weather Data Hook
// ============================================================================

const useWeather = (config: WeatherConfig) => {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [coords, setCoords] = useState<{
    lat: number;
    lon: number;
    name: string;
  } | null>(null);
  const toast = useFancyToast();

  // Auto-Detect or Manual Location
  useEffect(() => {
    if (config.location.mode === "manual") {
      if (config.location.latitude && config.location.longitude) {
        setCoords({
          lat: config.location.latitude,
          lon: config.location.longitude,
          name: config.location.name || "Local Manual",
        });
        toast.info("Using manual location");
      } else {
        const errorMsg = "Manual location not configured";
        setError(errorMsg);
        toast.error(errorMsg, "Configuration Error");
      }
      return;
    }

    // Auto mode
    if (!navigator.geolocation) {
      setCoords(DEFAULT_LOCATION);
      toast.warning("Geolocation not available, using default location");
      return;
    }

    toast.info("Detecting location...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          name: "Current Location",
        });
        toast.success("Location detected");
      },
      () => {
        setCoords({
          ...DEFAULT_LOCATION,
          name: `${DEFAULT_LOCATION.name} (Default)`,
        });
        toast.warning("Could not detect location, using default");
      }
    );
  }, [config.location, toast]);

  // Fetch Open-Meteo
  useEffect(() => {
    if (!coords) return;
    const fetchWeather = async () => {
      setLoading(true);
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,is_day,weather_code,wind_speed_10m`;
        const res = await fetch(url);
        const json = await res.json();

        if (json.error) throw new Error("API Error");

        const current = json.current;
        const stateKey = WMO_TO_STATE(current.weather_code, current.is_day);

        setData({
          temp: Math.round(current.temperature_2m),
          humidity: current.relative_humidity_2m,
          wind: Math.round(current.wind_speed_10m),
          condition: WEATHER_THEMES[stateKey].label,
          stateKey: stateKey,
          isDay: current.is_day === 1,
          location: coords.name,
        });
        setError(null);
        toast.success("Weather data updated");
      } catch {
        const errorMsg = "Failed to fetch weather data (Offline)";
        setError(errorMsg);
        toast.error(errorMsg, "Network Error");
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
    const interval = setInterval(fetchWeather, config.refreshInterval);
    return () => clearInterval(interval);
  }, [coords, config.refreshInterval, toast]);

  return { data, loading, error };
};

// ============================================================================
// Main Weather Widget Component (REFACTORED)
// ============================================================================

export function WeatherWidget({ config: runtimeConfig }: WidgetRuntimeProps) {
  const config = runtimeConfig as unknown as WeatherConfig;
  const { data, loading, error } = useWeather(config);
  const [debugState, setDebugState] = useState<WeatherState | "">("");

  // Console debug commands (development only)
  useEffect(() => {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (!(window as any).__fancyDashboard) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).__fancyDashboard = {};
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (!(window as any).__fancyDashboard.debug) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).__fancyDashboard.debug = {};
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).__fancyDashboard.debug.weather = {
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

  // Theme Stack - Module Suggestion (weather-based background gradient)
  const themeStack: ThemeStack = {
    moduleSuggestion: {
      background: {
        type: "gradient",
        variant: "linear",
        angle: 180,
        stops: parseGradient(theme.theme),
      },
      typography: {
        title: {
          family: "sans",
          weight: "bold",
          size:
            config.size === "1x1"
              ? "clamp(2rem, 8vw, 3rem)"
              : config.size === "4x4"
                ? "clamp(6rem, 15vw, 10rem)"
                : "clamp(3rem, 6vw, 4.5rem)",
          color: theme.text.replace("text-", ""),
        },
        subtitle: {
          family: "sans",
          weight: "semibold",
          size:
            config.size === "1x1"
              ? "clamp(0.75rem, 2vw, 1rem)"
              : config.size === "4x4"
                ? "clamp(1.5rem, 3vw, 2rem)"
                : "clamp(1rem, 2vw, 1.25rem)",
          color: theme.text.replace("text-", ""),
        },
        body: {
          family: "sans",
          weight: "normal",
          size:
            config.size === "4x4"
              ? "clamp(1rem, 2vw, 1.5rem)"
              : "clamp(0.75rem, 1.5vw, 1rem)",
          color: theme.text.replace("text-", ""),
        },
        meta: {
          family: "sans",
          weight: "normal",
          size:
            config.size === "4x4"
              ? "clamp(0.875rem, 1.5vw, 1.125rem)"
              : "clamp(0.625rem, 1vw, 0.75rem)",
          color: theme.text.replace("text-", ""),
        },
      },
      borderRadius: "2.5rem",
      padding:
        config.size === "1x1"
          ? "1rem"
          : config.size === "4x4"
            ? "2.5rem"
            : "1.5rem",
      className: "shadow-2xl",
    },
    // User could override with widgetOverride, userCategory, or userGlobal
  };

  // Layout Engine
  const getLayoutConfig = () => {
    switch (config.size) {
      case "1x1":
        return {
          isSmall: true,
          isWide: false,
          isStandard: false,
          isGiant: false,
        };
      case "2x1":
        return {
          isSmall: false,
          isWide: true,
          isStandard: false,
          isGiant: false,
        };
      case "3x3":
        return {
          isSmall: false,
          isWide: false,
          isStandard: false,
          isGiant: true,
        };
      case "4x4":
        return {
          isSmall: false,
          isWide: false,
          isStandard: false,
          isGiant: true,
        };
      case "2x2":
      default:
        return {
          isSmall: false,
          isWide: false,
          isStandard: true,
          isGiant: false,
        };
    }
  };

  const layoutConfig = getLayoutConfig();

  return (
    <FancyWidgetWrapper themeStack={themeStack} className="w-full h-full">
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
        <div className="relative z-10 flex justify-between items-start opacity-90 mb-4">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
            <Calendar size={12} />
            <span className="text-xs font-bold uppercase tracking-wider">
              TODAY
            </span>
          </div>
          <div className="flex gap-2">
            {loading && <RefreshCw size={14} className="animate-spin" />}
            {!loading && !error && (
              <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)] mt-1"></div>
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
              <h1 className="font-bold leading-none tracking-tighter drop-shadow-sm">
                {displayData.temp}°
              </h1>

              {!layoutConfig.isSmall && (
                <p className="font-medium opacity-90 mt-2">
                  {displayData.condition}
                </p>
              )}

              {/* DETAILS ROW */}
              {!layoutConfig.isSmall && (
                <div
                  className={`mt-4 grid grid-cols-2 gap-2 ${layoutConfig.isGiant ? "max-w-md" : "max-w-55"}`}
                >
                  <div
                    className={`bg-white/10 backdrop-blur-md border border-white/5 rounded-xl flex items-center gap-2 ${layoutConfig.isGiant ? "p-4" : "p-2"}`}
                  >
                    <Wind
                      size={layoutConfig.isGiant ? 24 : 14}
                      className="opacity-70"
                    />
                    <span className="font-semibold text-xs">
                      {displayData.wind} km/h
                    </span>
                  </div>
                  <div
                    className={`bg-white/10 backdrop-blur-md border border-white/5 rounded-xl flex items-center gap-2 ${layoutConfig.isGiant ? "p-4" : "p-2"}`}
                  >
                    <Droplets
                      size={layoutConfig.isGiant ? 24 : 14}
                      className="opacity-70"
                    />
                    <span className="font-semibold text-xs">
                      {displayData.humidity}%
                    </span>
                  </div>
                  <div
                    className={`bg-white/10 backdrop-blur-md border border-white/5 rounded-xl flex items-center gap-2 col-span-2 ${layoutConfig.isGiant ? "p-4" : "p-2"}`}
                  >
                    <MapPin
                      size={layoutConfig.isGiant ? 24 : 14}
                      className="opacity-70"
                    />
                    <span className="font-semibold truncate text-xs">
                      {displayData.location}
                    </span>
                  </div>
                </div>
              )}

              {layoutConfig.isSmall && (
                <div className="mt-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-[10px] font-bold uppercase">
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
    </FancyWidgetWrapper>
  );
}

// ============================================================================
// Helper: Parse Tailwind gradient classes to gradient stops
// ============================================================================

function parseGradient(tailwindClasses: string): Array<{
  color: string;
  position: number;
}> {
  // Simple parser for "from-X via-Y to-Z" format
  const colors: string[] = [];

  const fromMatch = tailwindClasses.match(/from-(\S+)/);
  const viaMatch = tailwindClasses.match(/via-(\S+)/);
  const toMatch = tailwindClasses.match(/to-(\S+)/);

  if (fromMatch) colors.push(tailwindColorToHex(fromMatch[1]));
  if (viaMatch) colors.push(tailwindColorToHex(viaMatch[1]));
  if (toMatch) colors.push(tailwindColorToHex(toMatch[1]));

  // Default if parsing fails
  if (colors.length === 0) {
    return [
      { color: "#3b82f6", position: 0 },
      { color: "#1e40af", position: 100 },
    ];
  }

  // Distribute evenly
  return colors.map((color, i) => ({
    color,
    position: (100 / (colors.length - 1 || 1)) * i,
  }));
}

// Basic Tailwind color to hex mapping (simplified)
function tailwindColorToHex(colorClass: string): string {
  const colorMap: Record<string, string> = {
    "blue-400": "#60a5fa",
    "blue-300": "#93c5fd",
    "cyan-200": "#a5f3fc",
    "orange-500": "#f97316",
    "orange-400": "#fb923c",
    "yellow-300": "#fde047",
    "slate-400": "#94a3b8",
    "slate-300": "#cbd5e1",
    "gray-200": "#e5e7eb",
    "blue-800": "#1e40af",
    "blue-700": "#1d4ed8",
    "slate-600": "#475569",
    "indigo-900": "#312e81",
    "slate-800": "#1e293b",
    "gray-900": "#111827",
    "indigo-950": "#1e1b4b",
    "purple-900": "#581c87",
    "slate-900": "#0f172a",
    black: "#000000",
    "gray-300": "#d1d5db",
    "violet-950": "#2e1065",
    "fuchsia-900": "#701a75",
    "pink-100": "#fce7f3",
  };

  return colorMap[colorClass] || "#3b82f6"; // Fallback to blue
}
