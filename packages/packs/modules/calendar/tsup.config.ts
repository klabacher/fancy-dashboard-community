import { defineConfig } from "tsup";

export default defineConfig({
  outDir: process.env.TSUP_OUT_DIR || "dist",
  entry: ["src/index.ts", "src/manifest.ts"],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  external: [
    "react",
    "react-dom",
    "@fancydashboard/sdk",
    "@fancydashboard/runtime",
    "lucide-react",
    "framer-motion",
    "zustand",
    "zod",
    "date-fns",
    "@tauri-apps/plugin-dialog",
  ],
});
