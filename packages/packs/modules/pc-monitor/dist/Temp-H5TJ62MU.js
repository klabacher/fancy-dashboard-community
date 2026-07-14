import {
  TempWidget
} from "./chunk-LTY23NXA.js";
import {
  useTelemetrySubscription,
  useTempStats
} from "./chunk-NCBFSEOM.js";
import "./chunk-7RBVURAN.js";
import "./chunk-R5U7XKVJ.js";

// src/module/widgets/Temp.tsx
import { usePluginContext } from "@fancydashboard/sdk/plugins/PluginContext";
import { jsx } from "react/jsx-runtime";
function Temp(_props) {
  useTelemetrySubscription();
  const { config } = usePluginContext();
  const typedConfig = config;
  const stats = useTempStats();
  return /* @__PURE__ */ jsx(
    TempWidget,
    {
      stats,
      showAllProbes: typedConfig.showAllProbes,
      showSparkline: typedConfig.showSparkline
    }
  );
}
export {
  Temp as default
};
