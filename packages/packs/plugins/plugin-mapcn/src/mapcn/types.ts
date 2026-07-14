// ============================================================================
// MapCN Module - TypeScript Types
// Matches Rust backend structures for network monitoring
// ============================================================================

import { z } from "zod";

// ============================================================================
// Zod Schemas (for validation)
// ============================================================================

export const GeoLocationSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  country: z.string(),
  city: z.string(),
});

export const ProtocolSchema = z.enum(["tcp", "udp"]);

export const ConnectionDirectionSchema = z.enum([
  "inbound",
  "outbound",
  "unknown",
]);

export const InterfaceTypeSchema = z.enum([
  "wifi",
  "ethernet",
  "cellular",
  "vpn",
  "loopback",
  "unknown",
  "disconnected",
]);

export const NetworkConnectionSchema = z.object({
  srcIp: z.string(),
  destIp: z.string(),
  destLocation: GeoLocationSchema.nullable(),
  protocol: ProtocolSchema,
  bytes: z.number().optional(),
  bytesIn: z.number().optional(),
  bytesOut: z.number().optional(),
  packetsIn: z.number().optional(),
  packetsOut: z.number().optional(),
  direction: ConnectionDirectionSchema.optional(),
  online: z.boolean().optional(),
  lastSeenAt: z.number().optional(),
  timestamp: z.number(),
  estimatedRttMs: z.number().nullable().optional(),
});

export const NetworkSnapshotSchema = z.object({
  connections: z.array(NetworkConnectionSchema),
  totalDownloadSpeed: z.number(),
  totalUploadSpeed: z.number(),
  totalBytesIn: z.number().optional(),
  totalBytesOut: z.number().optional(),
  totalPacketsIn: z.number().optional(),
  totalPacketsOut: z.number().optional(),
  timestamp: z.number(),
});

export const SnifferStatusSchema = z.object({
  isRunning: z.boolean(),
  deviceName: z.string().nullable(),
  hasGeoipDb: z.boolean(),
  packetCount: z.number(),
  error: z.string().nullable(),
  interfaceType: InterfaceTypeSchema.optional(),
});

// ============================================================================
// TypeScript Types (inferred from Zod schemas)
// ============================================================================

export type GeoLocation = z.infer<typeof GeoLocationSchema>;
export type Protocol = z.infer<typeof ProtocolSchema>;
export type ConnectionDirection = z.infer<typeof ConnectionDirectionSchema>;
export type InterfaceType = z.infer<typeof InterfaceTypeSchema>;
export type NetworkConnection = z.infer<typeof NetworkConnectionSchema>;
export type NetworkSnapshot = z.infer<typeof NetworkSnapshotSchema>;
export type SnifferStatus = z.infer<typeof SnifferStatusSchema>;

// ============================================================================
// UI State Types
// ============================================================================

export interface ConnectionHistory {
  timestamp: number;
  downloadSpeed: number;
  uploadSpeed: number;
  packetsIn?: number;
  packetsOut?: number;
  bytesIn?: number;
  bytesOut?: number;
}

export interface MapCNState {
  // Data
  connections: NetworkConnection[];
  history: ConnectionHistory[];
  status: SnifferStatus | null;
  lastSnapshotAt: number | null;
  lastSeenAt: number | null;

  // UI State
  isLoading: boolean;
  error: string | null;

  // Actions
  updateSnapshot: (snapshot: NetworkSnapshot) => void;
  updateStatus: (status: SnifferStatus) => void;
  setError: (error: string | null) => void;
  clearHistory: () => void;
  reset: () => void;
}
