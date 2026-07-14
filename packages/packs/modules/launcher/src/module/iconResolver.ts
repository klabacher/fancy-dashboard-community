import { fetchFavicon, getFileIcon, type IconBinaryData } from "./api";

function isHttpUrl(target: string): boolean {
  return target.startsWith("http://") || target.startsWith("https://");
}

function toDataUrl(data: IconBinaryData): string {
  return `data:${data.mime_type};base64,${data.base64}`;
}

type CacheEntry = {
  status: "pending" | "fulfilled" | "rejected";
  promise: Promise<string | null>;
  value: string | null;
};

const iconCache = new Map<string, CacheEntry>();

export function makeAutoIconCacheKey(
  target: string,
  iconLocation?: string
): string {
  return `${isHttpUrl(target) ? "url" : "file"}:${target}::${iconLocation ?? ""}`;
}

export function invalidateAutoIcon(
  target: string,
  iconLocation?: string
): void {
  iconCache.delete(makeAutoIconCacheKey(target, iconLocation));
}

export async function resolveAutoIcon(
  target: string,
  iconLocation?: string
): Promise<string | null> {
  if (!target) return null;

  if (isHttpUrl(target)) {
    const favicon = await fetchFavicon(target);
    return toDataUrl(favicon);
  }

  const icon = await getFileIcon(target, iconLocation);
  return toDataUrl(icon);
}

export function getOrResolveAutoIcon(
  target: string,
  iconLocation?: string
): CacheEntry {
  const key = makeAutoIconCacheKey(target, iconLocation);
  const cached = iconCache.get(key);
  if (cached) return cached;

  const entry: CacheEntry = {
    status: "pending",
    value: null,
    promise: resolveAutoIcon(target, iconLocation)
      .then((value) => {
        entry.status = "fulfilled";
        entry.value = value;
        return value;
      })
      .catch(() => {
        entry.status = "rejected";
        entry.value = null;
        return null;
      }),
  };

  iconCache.set(key, entry);
  return entry;
}
