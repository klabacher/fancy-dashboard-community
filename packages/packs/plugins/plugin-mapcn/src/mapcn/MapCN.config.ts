import { z } from "zod";

export const MapCNCompactConfigSchema = z.object({
  layout: z.enum(["auto", "stacked", "inline"]).default("auto"),
  showInterface: z.boolean().default(true),
  showStatus: z.boolean().default(true),
  showSpeed: z.boolean().default(true),
  showPackets: z.boolean().default(true),
  showBytes: z.boolean().default(false),
  showLastSeen: z.boolean().default(true),
  showConnectionType: z.boolean().default(true),
  accent: z.enum(["neon", "soft"]).default("neon"),
});

const MapCNBaseMapConfigSchema = z.object({
  showLegend: z.boolean().default(true),
  showStats: z.boolean().default(true),
  showConnectionInfo: z.boolean().default(true),
  maxConnections: z.number().int().min(10).max(500).default(120),
  lineGlow: z.number().min(0).max(1),
});

export const MapCNMap2DConfigSchema = MapCNBaseMapConfigSchema.extend({
  lineGlow: MapCNBaseMapConfigSchema.shape.lineGlow.default(0.85),
  zoomEnabled: z.boolean().default(true),
});

export const MapCNGlobeConfigSchema = MapCNBaseMapConfigSchema.extend({
  lineGlow: MapCNBaseMapConfigSchema.shape.lineGlow.default(0.9),
  rotationSpeed: z.enum(["slow", "medium", "fast"]).default("medium"),
});

export type MapCNCompactConfig = z.infer<typeof MapCNCompactConfigSchema>;
export type MapCNMap2DConfig = z.infer<typeof MapCNMap2DConfigSchema>;
export type MapCNGlobeConfig = z.infer<typeof MapCNGlobeConfigSchema>;

export const defaultMapCNCompactConfig: MapCNCompactConfig =
  MapCNCompactConfigSchema.parse({});
export const defaultMapCNMap2DConfig: MapCNMap2DConfig =
  MapCNMap2DConfigSchema.parse({});
export const defaultMapCNGlobeConfig: MapCNGlobeConfig =
  MapCNGlobeConfigSchema.parse({});
