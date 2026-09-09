import type { WidgetRuntimeProps } from "@fancydashboard/sdk/plugins/types";

export default function Widget(_props: WidgetRuntimeProps) {
  return (
    <div
      style={{
        display: "grid",
        height: "100%",
        minHeight: 0,
        placeItems: "center",
        padding: "clamp(0.75rem, 4cqi, 1.5rem)",
        textAlign: "center",
      }}
    >
      <div>
        <h3 style={{ margin: 0 }}>{{pluginName}}</h3>
        <p style={{ margin: "0.5rem 0 0" }}>Hello from your community pack.</p>
      </div>
    </div>
  );
}
