export const DEFAULT_LOCATION = {
  lat: -23.5505,
  lon: -46.6333,
  name: "São Paulo",
} as const;

export function hexWithOpacity(hex: string, opacity: number): string {
  const alpha = Math.round((opacity / 100) * 255)
    .toString(16)
    .padStart(2, "0");
  return `${hex}${alpha}`;
}
