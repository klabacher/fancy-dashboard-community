import {
  FullTaskManagerConfigSchema
} from "./chunk-O72EZ5K4.js";
import "./chunk-3WGEXLPO.js";
import "./chunk-MLKGABMK.js";

// src/module/widgets/FullTaskManager.tsx
import { useModuleTheme } from "@fancydashboard/sdk/theme";
import { jsx, jsxs } from "react/jsx-runtime";
function FullTaskManager(props) {
  const { theme, cx } = useModuleTheme();
  const parsedConfig = FullTaskManagerConfigSchema.safeParse(props.config);
  const config = parsedConfig.success ? parsedConfig.data : FullTaskManagerConfigSchema.parse({});
  return /* @__PURE__ */ jsxs("div", { className: cx(theme.card.container, "flex flex-col h-full"), children: [
    /* @__PURE__ */ jsx("div", { className: theme.card.header, children: /* @__PURE__ */ jsx("span", { className: theme.text.title, children: config.title }) }),
    /* @__PURE__ */ jsxs("div", { className: cx(theme.card.body, "text-xs"), children: [
      /* @__PURE__ */ jsx("p", { className: theme.text.body, children: "Placeholder for a full task manager UI." }),
      /* @__PURE__ */ jsx("p", { className: cx(theme.text.muted, "mt-2"), children: "This widget would be allowed to write backup files via fs:scope." })
    ] })
  ] });
}
export {
  FullTaskManager as default
};
