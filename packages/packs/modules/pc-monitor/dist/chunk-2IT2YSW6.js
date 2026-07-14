import {
  Sparkline,
  motion
} from "./chunk-NCBFSEOM.js";

// src/module/components/GPUWidget.tsx
import { Monitor, Thermometer } from "lucide-react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
function GPUWidget({
  stats,
  showTemperature = true,
  showSparkline = true,
  compact = false
}) {
  if (!stats) {
    return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center h-full w-full bg-black/20 rounded-lg gap-1", children: [
      /* @__PURE__ */ jsx(Monitor, { className: "w-5 h-5 text-white/30" }),
      /* @__PURE__ */ jsx("span", { className: "text-[10px] text-white/30", children: "No GPU" })
    ] });
  }
  const getUsageColor = (usage) => {
    if (usage >= 90) return "text-red-400";
    if (usage >= 70) return "text-yellow-400";
    return "text-green-400";
  };
  const getBarColor = (usage) => {
    if (usage >= 90) return "bg-red-500";
    if (usage >= 70) return "bg-yellow-500";
    return "bg-green-500";
  };
  if (compact) {
    return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 h-full w-full p-2 bg-black/30 backdrop-blur-md rounded-lg", children: [
      /* @__PURE__ */ jsx("div", { className: "p-1.5 rounded-md bg-green-500/20", children: /* @__PURE__ */ jsx(Monitor, { className: "w-4 h-4 text-green-400" }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-2", children: [
          /* @__PURE__ */ jsxs("span", { className: `text-lg font-bold ${getUsageColor(stats.usage)}`, children: [
            stats.usage,
            "%"
          ] }),
          showTemperature && stats.temperature > 0 && /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-white/40", children: [
            stats.temperature,
            "\xB0C"
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "h-1 bg-white/10 rounded-full overflow-hidden mt-1", children: /* @__PURE__ */ jsx(
          motion.div,
          {
            className: `h-full rounded-full ${getBarColor(stats.usage)}`,
            initial: { width: 0 },
            animate: { width: `${stats.usage}%` },
            transition: { duration: 0.5, ease: "easeOut" }
          }
        ) })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col h-full w-full p-3 bg-black/30 backdrop-blur-md rounded-lg overflow-hidden", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("div", { className: "p-1.5 rounded-md bg-green-500/20", children: /* @__PURE__ */ jsx(Monitor, { className: "w-4 h-4 text-green-400" }) }),
        /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-white/80", children: "GPU" })
      ] }),
      showTemperature && stats.temperature > 0 && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 text-[10px] text-white/50", children: [
        /* @__PURE__ */ jsx(Thermometer, { className: "w-3 h-3" }),
        /* @__PURE__ */ jsxs("span", { children: [
          stats.temperature,
          "\xB0C"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-2 mb-2", children: [
      /* @__PURE__ */ jsx("span", { className: `text-3xl font-bold ${getUsageColor(stats.usage)}`, children: stats.usage }),
      /* @__PURE__ */ jsx("span", { className: "text-lg text-white/50", children: "%" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "text-[10px] text-white/40 mb-2 truncate", children: stats.name }),
    stats.memoryTotal > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-[10px] text-white/40 mb-1", children: [
        /* @__PURE__ */ jsx("span", { children: "VRAM" }),
        /* @__PURE__ */ jsxs("span", { children: [
          stats.memoryUsed,
          "/",
          stats.memoryTotal,
          " GB"
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "h-1.5 bg-white/10 rounded-full overflow-hidden mb-2", children: /* @__PURE__ */ jsx(
        motion.div,
        {
          className: "h-full rounded-full bg-green-500/70",
          initial: { width: 0 },
          animate: {
            width: `${stats.memoryUsed / stats.memoryTotal * 100}%`
          },
          transition: { duration: 0.5, ease: "easeOut" }
        }
      ) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "h-2 bg-white/10 rounded-full overflow-hidden mb-2", children: /* @__PURE__ */ jsx(
      motion.div,
      {
        className: `h-full rounded-full ${getBarColor(stats.usage)}`,
        initial: { width: 0 },
        animate: { width: `${stats.usage}%` },
        transition: { duration: 0.5, ease: "easeOut" }
      }
    ) }),
    showSparkline && stats.history.length > 1 && /* @__PURE__ */ jsx("div", { className: "flex-1 min-h-0 flex items-end", children: /* @__PURE__ */ jsx(
      Sparkline,
      {
        data: stats.history,
        width: 120,
        height: 32,
        color: "#22c55e",
        className: "w-full"
      }
    ) })
  ] });
}

export {
  GPUWidget
};
