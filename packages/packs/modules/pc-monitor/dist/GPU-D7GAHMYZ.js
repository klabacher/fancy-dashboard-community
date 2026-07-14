import {
  GPUWidget
} from "./chunk-2IT2YSW6.js";
import {
  useGPUStats,
  useTelemetrySubscription
} from "./chunk-NCBFSEOM.js";
import "./chunk-7RBVURAN.js";
import "./chunk-R5U7XKVJ.js";

// src/module/widgets/GPU.tsx
import { usePluginContext } from "@fancydashboard/sdk/plugins/PluginContext";
import { jsx } from "react/jsx-runtime";
function GPU(_props) {
  useTelemetrySubscription();
  const { config } = usePluginContext();
  const typedConfig = config;
  const stats = useGPUStats();
  return /* @__PURE__ */ jsx(
    GPUWidget,
    {
      stats,
      showTemperature: typedConfig.showTemperature,
      showSparkline: typedConfig.showSparkline,
      compact: typedConfig.compactMode
    }
  );
}
export {
  GPU as default
};
