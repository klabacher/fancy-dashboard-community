import {
  QuickTaskConfigSchema
} from "./chunk-PRKKB4Q7.js";
import "./chunk-3WGEXLPO.js";
import "./chunk-MLKGABMK.js";

// src/module/widgets/QuickTask.tsx
import { useState } from "react";
import { Plus } from "lucide-react";
import { useModuleTheme } from "@fancydashboard/sdk/theme";
import { jsx, jsxs } from "react/jsx-runtime";
function QuickTask(props) {
  const { theme, cx } = useModuleTheme();
  const parsedConfig = QuickTaskConfigSchema.safeParse(props.config);
  const config = parsedConfig.success ? parsedConfig.data : QuickTaskConfigSchema.parse({});
  const [value, setValue] = useState("");
  return /* @__PURE__ */ jsxs("div", { className: cx(theme.card.container, "flex flex-col h-full"), children: [
    /* @__PURE__ */ jsx("div", { className: theme.card.header, children: /* @__PURE__ */ jsx("span", { className: theme.text.title, children: "New Task" }) }),
    /* @__PURE__ */ jsxs("div", { className: cx(theme.card.body, "flex items-center gap-2"), children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          value,
          onChange: (e) => setValue(e.target.value),
          placeholder: config.placeholder,
          className: theme.input.root
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          className: theme.button.primary,
          onClick: () => setValue(""),
          "aria-label": "Add task",
          children: /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" })
        }
      )
    ] })
  ] });
}
export {
  QuickTask as default
};
