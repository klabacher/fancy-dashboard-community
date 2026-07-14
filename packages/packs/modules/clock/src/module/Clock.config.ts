import { z } from "zod";

export const ClockConfigSchema = z.object({
  style: z
    .enum([
      "digital-minimalist",
      "digital-neon",
      "analog-classic",
      "analog-modern",
      "binary",
      "weather-clock",
    ])
    .default("digital-minimalist"),
  timeFormat: z.enum(["12h", "24h"]).default("24h"),
  dateFormat: z.enum(["full", "short", "none"]).default("short"),
  showSeconds: z.boolean().default(true),
  colors: z
    .object({
      primary: z.string().default("#ffffff"),
      secondary: z.string().default("#888888"),
      accent: z.string().default("#3b82f6"),
      background: z.string().default("#000000"),
      backgroundOpacity: z.number().min(0).max(100).default(50),
    })
    .default({
      primary: "#ffffff",
      secondary: "#888888",
      accent: "#3b82f6",
      background: "#000000",
      backgroundOpacity: 50,
    }),
  typography: z
    .object({
      fontFamily: z.enum(["sans", "serif", "mono"]).default("sans"),
      fontSize: z.number().min(12).max(120).default(48),
      fontWeight: z
        .enum(["light", "normal", "medium", "semibold", "bold"])
        .default("bold"),
    })
    .default({
      fontFamily: "sans",
      fontSize: 48,
      fontWeight: "bold",
    }),
  weatherLocation: z
    .object({
      mode: z.enum(["auto", "manual"]).default("auto"),
      latitude: z.number().min(-90).max(90).nullable().default(null),
      longitude: z.number().min(-180).max(180).nullable().default(null),
      name: z.string().nullable().default(null),
    })
    .default({
      mode: "auto",
      latitude: null,
      longitude: null,
      name: null,
    }),
});

export type ClockConfig = z.infer<typeof ClockConfigSchema>;

export const DEFAULT_CLOCK_CONFIG: ClockConfig = ClockConfigSchema.parse({});
