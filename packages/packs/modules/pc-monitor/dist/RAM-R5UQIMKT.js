import {
  RAMWidget
} from "./chunk-H4M3KMJB.js";
import {
  useRAMStats,
  useTelemetrySubscription
} from "./chunk-NCBFSEOM.js";
import "./chunk-7RBVURAN.js";
import "./chunk-R5U7XKVJ.js";

// src/module/widgets/RAM.tsx
import { usePluginContext } from "@fancydashboard/sdk/plugins/PluginContext";
import { jsx } from "react/jsx-runtime";
function RAM(_props) {
  useTelemetrySubscription();
  const { config } = usePluginContext();
  const typedConfig = config;
  const stats = useRAMStats();
  return /* @__PURE__ */ jsx(
    RAMWidget,
    {
      stats,
      showSparkline: typedConfig.showSparkline,
      compact: typedConfig.compactMode
    }
  );
}
export {
  RAM as default
};
