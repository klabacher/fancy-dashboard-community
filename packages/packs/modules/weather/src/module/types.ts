// ============================================================================
// Weather Module Types
// Fancy weather widget with SVG animations and Open-Meteo integration
// ============================================================================

import { z } from "zod";

// ============================================================================
// Weather State Types
// ============================================================================

export type WeatherState =
  | "SUNNY"
  | "INTENSE_SUN"
  | "CLOUDY"
  | "RAIN"
  | "STORM"
  | "NIGHT"
  | "NIGHT_RAIN"
  | "COMET";

export type WeatherSize = "1x1" | "2x1" | "2x2" | "3x3" | "4x4";

export type LocationMode = "auto" | "manual";

// ============================================================================
// Location Configuration
// ============================================================================

export const LocationConfigSchema = z.object({
  mode: z.enum(["auto", "manual"]).default("auto"),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  name: z.string().optional(),
});

export type LocationConfig = z.infer<typeof LocationConfigSchema>;

// ============================================================================
// Weather Configuration
// ============================================================================

export const WeatherConfigSchema = z.object({
  size: z.enum(["1x1", "2x1", "2x2", "3x3", "4x4"]).default("2x2"),
  debugMode: z.boolean().default(false),
  refreshInterval: z.number().min(300000).max(3600000).default(900000), // 5-60 min
  location: LocationConfigSchema.default({
    mode: "auto",
  }),
  forceState: z
    .enum([
      "SUNNY",
      "INTENSE_SUN",
      "CLOUDY",
      "RAIN",
      "STORM",
      "NIGHT",
      "NIGHT_RAIN",
      "COMET",
      "",
    ])
    .default(""),
});

export type WeatherConfig = z.infer<typeof WeatherConfigSchema>;

// ============================================================================
// Default Configuration
// ============================================================================

export const DEFAULT_WEATHER_CONFIG: WeatherConfig = {
  size: "2x2",
  debugMode: false,
  refreshInterval: 900000, // 15 minutes
  location: {
    mode: "auto",
  },
  forceState: "",
};

// ============================================================================
// Weather Data Types
// ============================================================================

export interface WeatherData {
  temp: number;
  humidity: number;
  wind: number;
  condition: string;
  stateKey: WeatherState;
  isDay: boolean;
  location: string;
}

export interface WeatherTheme {
  label: string;
  theme: string;
  text: string;
  iconColor: string;
}
