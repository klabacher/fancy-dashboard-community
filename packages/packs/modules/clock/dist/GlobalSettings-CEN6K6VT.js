import "./chunk-R5U7XKVJ.js";

// src/module/settings/GlobalSettings.tsx
import { useModuleTheme } from "@fancydashboard/sdk/theme";
import { jsx, jsxs } from "react/jsx-runtime";
function GlobalSettings() {
  const { theme, cx } = useModuleTheme();
  return /* @__PURE__ */ jsxs("div", { className: cx(theme.card.container, "p-4"), children: [
    /* @__PURE__ */ jsx("div", { className: theme.card.header, children: /* @__PURE__ */ jsx("span", { className: theme.text.title, children: "Clock Module" }) }),
    /* @__PURE__ */ jsxs("div", { className: cx(theme.card.body, "text-sm"), children: [
      /* @__PURE__ */ jsx("p", { className: theme.text.body, children: "This module is configured per widget instance." }),
      /* @__PURE__ */ jsx("p", { className: cx(theme.text.muted, "mt-2"), children: "Use the widget configuration UI to select the clock style, typography, colors, and (for the weather widget) location behavior." })
    ] })
  ] });
}
export {
  GlobalSettings as default
};
