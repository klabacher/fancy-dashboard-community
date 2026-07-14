import type { ReactElement } from "react";

export default function GlobalSettings(): ReactElement {
  return (
    <div className="p-4 text-sm text-zinc-600 dark:text-zinc-300 space-y-2">
      <p>This module uses per-widget configuration.</p>
      <p>Open a MapCN widget and use the settings overlay to customize it.</p>
      <p>
        Check the module prerequisites in the MapCN documentation before
        starting capture.
      </p>
    </div>
  );
}
