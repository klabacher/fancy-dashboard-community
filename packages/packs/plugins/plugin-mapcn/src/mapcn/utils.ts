import type { InterfaceType, NetworkConnection } from "./types";

export function formatBytes(bytes: number, decimals: number = 1): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const clampedIndex = Math.min(i, sizes.length - 1);
  return `${(bytes / Math.pow(k, clampedIndex)).toFixed(decimals)} ${sizes[clampedIndex]}`;
}

export function formatSpeed(bytesPerSecond: number): string {
  if (!Number.isFinite(bytesPerSecond) || bytesPerSecond <= 0) return "0 B/s";
  const k = 1024;
  const sizes = ["B/s", "KB/s", "MB/s", "GB/s"];
  const i = Math.floor(Math.log(bytesPerSecond) / Math.log(k));
  const clampedIndex = Math.min(i, sizes.length - 1);
  return `${(bytesPerSecond / Math.pow(k, clampedIndex)).toFixed(2)} ${sizes[clampedIndex]}`;
}

export function formatDateTime(timestamp: number | null | undefined): string {
  if (!timestamp || !Number.isFinite(timestamp)) return "-";
  const date = new Date(timestamp);
  return date.toLocaleString();
}

export function inferInterfaceType(deviceName: string | null): InterfaceType {
  if (!deviceName) return "disconnected";
  const lowered = deviceName.toLowerCase();

  if (
    lowered.includes("wi-fi") ||
    lowered.includes("wifi") ||
    lowered.includes("wlan")
  ) {
    return "wifi";
  }
  if (
    lowered.includes("ethernet") ||
    lowered.includes("en0") ||
    lowered.includes("eth")
  ) {
    return "ethernet";
  }
  if (
    lowered.includes("vpn") ||
    lowered.includes("tun") ||
    lowered.includes("tap")
  ) {
    return "vpn";
  }
  if (lowered.includes("loopback") || lowered.includes("lo")) {
    return "loopback";
  }
  return "unknown";
}

export function getConnectionBytes(connection: NetworkConnection): {
  bytesIn: number;
  bytesOut: number;
  total: number;
} {
  const bytesIn = connection.bytesIn ?? 0;
  const bytesOut = connection.bytesOut ?? 0;
  const total = connection.bytes ?? bytesIn + bytesOut;
  return { bytesIn, bytesOut, total };
}

export function getConnectionPackets(connection: NetworkConnection): {
  packetsIn: number;
  packetsOut: number;
  total: number;
} {
  const packetsIn = connection.packetsIn ?? 0;
  const packetsOut = connection.packetsOut ?? 0;
  const total = packetsIn + packetsOut;
  return { packetsIn, packetsOut, total };
}

export function mapLatLngTo2D(
  lat: number,
  lng: number,
  width: number,
  height: number
): { x: number; y: number } {
  const x = ((lng + 180) / 360) * width;
  const y = ((90 - lat) / 180) * height;
  return { x, y };
}

export function mapLatLngToGlobe(
  lat: number,
  lng: number,
  radius: number
): { x: number; y: number; z: number } {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return { x, y, z };
}
