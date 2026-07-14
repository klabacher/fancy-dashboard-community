import {
  CPUWidget
} from "./chunk-7U4ANGV4.js";
import {
  useCPUStats,
  useTelemetrySubscription
} from "./chunk-NCBFSEOM.js";
import "./chunk-7RBVURAN.js";
import "./chunk-R5U7XKVJ.js";

// src/module/widgets/CPU.tsx
import { usePluginContext } from "@fancydashboard/sdk/plugins/PluginContext";
import { jsx } from "react/jsx-runtime";
function CPU(_props) {
  useTelemetrySubscription();
  const { config } = usePluginContext();
  const typedConfig = config;
  const stats = useCPUStats();
  return /* @__PURE__ */ jsx(
    CPUWidget,
    {
      stats,
      showTemperature: typedConfig.showTemperature,
      showSparkline: typedConfig.showSparkline,
      compact: typedConfig.compactMode
    }
  );
}
export {
  CPU as default
};
