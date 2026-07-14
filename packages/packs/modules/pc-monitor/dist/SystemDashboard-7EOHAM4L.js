import {
  CPUWidget
} from "./chunk-7U4ANGV4.js";
import {
  RAMWidget
} from "./chunk-H4M3KMJB.js";
import {
  GPUWidget
} from "./chunk-2IT2YSW6.js";
import {
  TempWidget
} from "./chunk-LTY23NXA.js";
import {
  motion,
  namespace_exports,
  useDashboardLayout,
  useDragControls,
  usePCMonitorStore,
  useTelemetrySubscription
} from "./chunk-NCBFSEOM.js";
import "./chunk-7RBVURAN.js";
import "./chunk-R5U7XKVJ.js";

// src/module/widgets/SystemDashboard.tsx
import { useEffect } from "react";
import { usePluginContext } from "@fancydashboard/sdk/plugins/PluginContext";

// src/module/components/SystemDashboard.tsx
import { useState, useCallback } from "react";
import { Activity, GripVertical, Settings } from "lucide-react";
import { jsx, jsxs } from "react/jsx-runtime";
function SystemDashboard({
  showSparklines = true,
  compactMode = false
}) {
  const stats = usePCMonitorStore((s) => s.stats);
  const isConnected = usePCMonitorStore((s) => s.isConnected);
  const layout = useDashboardLayout();
  const updateLayout = usePCMonitorStore((s) => s.updateDashboardLayout);
  const [isEditMode, setIsEditMode] = useState(false);
  const renderComponent = useCallback(
    (component) => {
      const compact = compactMode || component.size.w === 1;
      switch (component.type) {
        case "cpu":
          return /* @__PURE__ */ jsx(
            CPUWidget,
            {
              stats: stats?.cpu ?? null,
              showTemperature: true,
              showSparkline: showSparklines && !compact,
              compact
            }
          );
        case "ram":
          return /* @__PURE__ */ jsx(
            RAMWidget,
            {
              stats: stats?.ram ?? null,
              showSparkline: showSparklines && !compact,
              compact
            }
          );
        case "gpu":
          return /* @__PURE__ */ jsx(
            GPUWidget,
            {
              stats: stats?.gpu ?? null,
              showTemperature: true,
              showSparkline: showSparklines && !compact,
              compact
            }
          );
        case "temp":
          return /* @__PURE__ */ jsx(
            TempWidget,
            {
              stats: stats?.temps ?? null,
              showAllProbes: false,
              showSparkline: showSparklines && !compact
            }
          );
        default:
          return null;
      }
    },
    [stats, showSparklines, compactMode]
  );
  const handleReorder = useCallback(
    (newOrder) => {
      const updated = newOrder.map((item, idx) => ({
        ...item,
        position: { x: idx % 2, y: Math.floor(idx / 2) }
      }));
      updateLayout(updated);
    },
    [updateLayout]
  );
  if (!isConnected) {
    return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center h-full w-full bg-black/20 rounded-lg gap-2", children: [
      /* @__PURE__ */ jsx(Activity, { className: "w-6 h-6 text-white/30 animate-pulse" }),
      /* @__PURE__ */ jsx("span", { className: "text-xs text-white/50", children: "Connecting..." })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col h-full w-full p-3 bg-black/30 backdrop-blur-md rounded-lg overflow-hidden", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Activity, { className: "w-4 h-4 text-green-400" }),
        /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-white/80", children: "System Monitor" }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsx("div", { className: "w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" }),
          /* @__PURE__ */ jsx("span", { className: "text-[10px] text-white/40", children: "Live" })
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setIsEditMode(!isEditMode),
          className: `p-1.5 rounded-md transition-colors ${isEditMode ? "bg-amber-500/20 text-amber-400" : "hover:bg-white/10 text-white/50"}`,
          title: isEditMode ? "Done" : "Edit Layout",
          children: /* @__PURE__ */ jsx(Settings, { className: "w-3.5 h-3.5" })
        }
      )
    ] }),
    isEditMode ? /* @__PURE__ */ jsx(
      namespace_exports.Group,
      {
        axis: "y",
        values: layout,
        onReorder: handleReorder,
        className: "flex-1 grid grid-cols-2 gap-2",
        style: { display: "contents" },
        children: /* @__PURE__ */ jsx("div", { className: "flex-1 grid grid-cols-2 gap-2 auto-rows-fr", children: layout.map((component) => /* @__PURE__ */ jsx(
          DraggableItem,
          {
            component,
            isEditMode,
            children: renderComponent(component)
          },
          component.id
        )) })
      }
    ) : /* @__PURE__ */ jsx("div", { className: "flex-1 grid grid-cols-2 gap-2 auto-rows-fr", children: layout.map((component) => /* @__PURE__ */ jsx(
      motion.div,
      {
        layout: true,
        className: "relative",
        style: {
          gridColumn: component.size.w > 1 ? `span ${component.size.w}` : void 0,
          gridRow: component.size.h > 1 ? `span ${component.size.h}` : void 0
        },
        children: renderComponent(component)
      },
      component.id
    )) })
  ] });
}
function DraggableItem({
  component,
  isEditMode,
  children
}) {
  const dragControls = useDragControls();
  return /* @__PURE__ */ jsxs(
    namespace_exports.Item,
    {
      value: component,
      dragListener: false,
      dragControls,
      className: `relative ${isEditMode ? "ring-2 ring-amber-500/30 rounded-lg" : ""}`,
      style: {
        gridColumn: component.size.w > 1 ? `span ${component.size.w}` : void 0,
        gridRow: component.size.h > 1 ? `span ${component.size.h}` : void 0
      },
      children: [
        isEditMode && /* @__PURE__ */ jsx(
          "div",
          {
            className: "absolute top-1 left-1 z-10 p-1 rounded bg-black/60 cursor-grab active:cursor-grabbing",
            onPointerDown: (e) => dragControls.start(e),
            children: /* @__PURE__ */ jsx(GripVertical, { className: "w-3 h-3 text-white/60" })
          }
        ),
        children
      ]
    }
  );
}
var SystemDashboard_default = SystemDashboard;

// src/module/widgets/SystemDashboard.tsx
import { jsx as jsx2 } from "react/jsx-runtime";
function layoutsEqual(a, b) {
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
}
function SystemDashboardWidget(_props) {
  useTelemetrySubscription();
  const { config, setConfig } = usePluginContext();
  const typedConfig = config;
  const layout = useDashboardLayout();
  const updateLayout = usePCMonitorStore((s) => s.updateDashboardLayout);
  useEffect(() => {
    if (layoutsEqual(typedConfig.layout, layout)) return;
    updateLayout(typedConfig.layout);
  }, [typedConfig.layout, layout, updateLayout]);
  useEffect(() => {
    if (layoutsEqual(layout, typedConfig.layout)) return;
    setConfig({ ...typedConfig, layout });
  }, [layout, typedConfig, setConfig]);
  return /* @__PURE__ */ jsx2(
    SystemDashboard_default,
    {
      showSparklines: typedConfig.showSparklines,
      compactMode: typedConfig.compactMode
    }
  );
}
export {
  SystemDashboardWidget as default
};
