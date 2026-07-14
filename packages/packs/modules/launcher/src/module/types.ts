// ============================================================================
// Launcher Item Types
// ============================================================================

/** Grid density options for the internal icon grid */
export type GridDensity = "1x1" | "2x2" | "3x3";

/** Position in the internal grid */
export interface GridPosition {
  row: number;
  col: number;
}

/** Base launcher item */
export interface LauncherItemBase {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /** Icon source mode (new system). Defaults to auto when omitted. */
  iconSource?: "auto" | "custom" | "legacy";
  /** Custom icon data URL (used when iconSource === "custom") */
  customIconUrl?: string;
  /** Optional icon name from lucide-react */
  icon?: string;
  /** Custom icon URL or path */
  iconUrl?: string;
  /** Per-icon scale (0.6x - 1.5x) */
  iconScale?: number;
  /** Per-icon padding inside the tile (px) */
  paddingPx?: number;
  /** Position in the internal grid */
  position: GridPosition;
}

/** Launcher item from .lnk file */
export interface LnkLauncherItem extends LauncherItemBase {
  type: "lnk";
  /** Original .lnk file path */
  lnkPath: string;
  /** Resolved target path */
  targetPath: string;
  /** Working directory */
  workingDir?: string;
  /** Command line arguments */
  arguments?: string;
  /** Icon location from the .lnk */
  iconLocation?: string;
}

/** Custom/manual launcher item */
export interface CustomLauncherItem extends LauncherItemBase {
  type: "custom";
  /** Target executable or file path */
  target: string;
  /** Optional command line arguments */
  args?: string[];
  /** Optional working directory */
  cwd?: string;
}

/** Union type for all launcher items */
export type LauncherItem = LnkLauncherItem | CustomLauncherItem;

// ============================================================================
// Store Types
// ============================================================================

export interface LauncherStore {
  /** All launcher items */
  items: LauncherItem[];
  /** Whether edit mode is active */
  isEditMode: boolean;
  /** Currently dragging item ID */
  draggingId: string | null;
  /** Target validity cache */
  validityCache: Record<string, boolean>;
}

// ============================================================================
// API Response Types (matching Rust)
// ============================================================================

export interface LnkInfo {
  lnk_path: string;
  target_path: string | null;
  working_dir: string | null;
  arguments: string | null;
  description: string | null;
  icon_location: string | null;
  display_name: string;
}

export interface LaunchConfig {
  target: string;
  args?: string[];
  cwd?: string;
}

export interface LaunchResult {
  success: boolean;
  pid?: number;
  target: string;
}

// ============================================================================
// Config Types
// ============================================================================

export interface LauncherConfig {
  /** Launcher items */
  items: LauncherItem[];
  /** Grid density for internal layout */
  gridDensity: GridDensity;
  /** Whether to show labels */
  showLabels: boolean;
}

// ============================================================================
// Icon Mapping
// ============================================================================

/** Default icons for common applications */
export const DEFAULT_APP_ICONS: Record<string, string> = {
  // Browsers
  chrome: "Chrome",
  firefox: "Globe",
  edge: "Globe",
  opera: "Globe",
  brave: "Shield",
  // Office
  word: "FileText",
  excel: "Table",
  powerpoint: "Presentation",
  outlook: "Mail",
  onenote: "StickyNote",
  // Development
  code: "Code",
  vscode: "Code",
  "visual studio": "Code",
  terminal: "Terminal",
  powershell: "Terminal",
  cmd: "Terminal",
  git: "GitBranch",
  // Media
  spotify: "Music",
  vlc: "Play",
  "media player": "Play",
  // Communication
  discord: "MessageCircle",
  slack: "Hash",
  teams: "Users",
  zoom: "Video",
  // Games
  steam: "Gamepad2",
  epic: "Gamepad2",
  // System
  settings: "Settings",
  explorer: "Folder",
  notepad: "FileText",
  calculator: "Calculator",
  // Default
  default: "AppWindow",
};
