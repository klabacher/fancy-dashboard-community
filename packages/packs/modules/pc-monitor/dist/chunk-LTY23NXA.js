import {
  Sparkline,
  motion
} from "./chunk-NCBFSEOM.js";

// src/module/components/TempWidget.tsx
import { Thermometer, Flame } from "lucide-react";
import { jsx, jsxs } from "react/jsx-runtime";
function TempWidget({
  stats,
  showAllProbes = false,
  showSparkline = true
}) {
  if (!stats || stats.probes.length === 0) {
    return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center h-full w-full bg-black/20 rounded-lg gap-1", children: [
      /* @__PURE__ */ jsx(Thermometer, { className: "w-5 h-5 text-white/30" }),
      /* @__PURE__ */ jsx("span", { className: "text-[10px] text-white/30", children: "No sensors" })
    ] });
  }
  const getTempColor = (temp) => {
    if (temp >= 80) return "text-red-400";
    if (temp >= 60) return "text-yellow-400";
    return "text-cyan-400";
  };
  const getTempBgColor = (temp) => {
    if (temp >= 80) return "bg-red-500";
    if (temp >= 60) return "bg-yellow-500";
    return "bg-cyan-500";
  };
  const displayProbes = showAllProbes ? stats.probes : stats.probes.slice(0, 4);
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col h-full w-full p-3 bg-black/30 backdrop-blur-md rounded-lg overflow-hidden", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("div", { className: "p-1.5 rounded-md bg-cyan-500/20", children: /* @__PURE__ */ jsx(Thermometer, { className: "w-4 h-4 text-cyan-400" }) }),
        /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-white/80", children: "Temperatures" })
      ] }),
      stats.maxTemp > 0 && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsx(
          Flame,
          {
            className: `w-3 h-3 ${stats.maxTemp >= 80 ? "text-red-400" : "text-white/40"}`
          }
        ),
        /* @__PURE__ */ jsxs("span", { className: `text-[10px] ${getTempColor(stats.maxTemp)}`, children: [
          "Max: ",
          stats.maxTemp,
          "\xB0C"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-2 mb-3", children: [
      /* @__PURE__ */ jsx("span", { className: `text-3xl font-bold ${getTempColor(stats.avgTemp)}`, children: stats.avgTemp }),
      /* @__PURE__ */ jsx("span", { className: "text-lg text-white/50", children: "\xB0C avg" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-y-auto space-y-1.5 mb-2", children: displayProbes.map((probe, i) => /* @__PURE__ */ jsxs(
      motion.div,
      {
        initial: { opacity: 0, x: -10 },
        animate: { opacity: 1, x: 0 },
        transition: { delay: i * 0.05 },
        className: "flex items-center gap-2",
        children: [
          /* @__PURE__ */ jsx("span", { className: "text-[10px] text-white/50 w-16 truncate", children: probe.label || `Sensor ${i + 1}` }),
          /* @__PURE__ */ jsx("div", { className: "flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden", children: /* @__PURE__ */ jsx(
            motion.div,
            {
              className: `h-full rounded-full ${getTempBgColor(probe.temperature)}`,
              initial: { width: 0 },
              animate: { width: `${Math.min(100, probe.temperature)}%` },
              transition: { duration: 0.5, ease: "easeOut" }
            }
          ) }),
          /* @__PURE__ */ jsxs(
            "span",
            {
              className: `text-[10px] font-medium ${getTempColor(probe.temperature)}`,
              children: [
                Math.round(probe.temperature),
                "\xB0"
              ]
            }
          )
        ]
      },
      probe.label || i
    )) }),
    showSparkline && stats.history.length > 1 && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 pt-2 border-t border-white/10", children: [
      /* @__PURE__ */ jsx("span", { className: "text-[10px] text-white/40", children: "Trend" }),
      /* @__PURE__ */ jsx(
        Sparkline,
        {
          data: stats.history,
          width: 80,
          height: 24,
          color: "#06b6d4"
        }
      )
    ] })
  ] });
}

export {
  TempWidget
};
