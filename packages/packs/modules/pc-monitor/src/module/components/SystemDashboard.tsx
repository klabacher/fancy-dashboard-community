// ============================================================================
// System Dashboard - Container Widget with Internal Drag & Drop
// ============================================================================

import { useState, useCallback } from "react";
import { motion, Reorder, useDragControls } from "framer-motion";
import { Activity, GripVertical, Settings } from "lucide-react";
import type { DashboardComponent } from "../types";
import { usePCMonitorStore, useDashboardLayout } from "../store";
import { CPUWidget } from "./CPUWidget";
import { RAMWidget } from "./RAMWidget";
import { GPUWidget } from "./GPUWidget";
import { TempWidget } from "./TempWidget";

interface SystemDashboardProps {
  showSparklines?: boolean;
  compactMode?: boolean;
}

export function SystemDashboard({
  showSparklines = true,
  compactMode = false,
}: SystemDashboardProps) {
  const stats = usePCMonitorStore((s) => s.stats);
  const isConnected = usePCMonitorStore((s) => s.isConnected);
  const layout = useDashboardLayout();
  const updateLayout = usePCMonitorStore((s) => s.updateDashboardLayout);

  const [isEditMode, setIsEditMode] = useState(false);

  // Render component based on type
  const renderComponent = useCallback(
    (component: DashboardComponent) => {
      const compact = compactMode || component.size.w === 1;

      switch (component.type) {
        case "cpu":
          return (
            <CPUWidget
              stats={stats?.cpu ?? null}
              showTemperature={true}
              showSparkline={showSparklines && !compact}
              compact={compact}
            />
          );
        case "ram":
          return (
            <RAMWidget
              stats={stats?.ram ?? null}
              showSparkline={showSparklines && !compact}
              compact={compact}
            />
          );
        case "gpu":
          return (
            <GPUWidget
              stats={stats?.gpu ?? null}
              showTemperature={true}
              showSparkline={showSparklines && !compact}
              compact={compact}
            />
          );
        case "temp":
          return (
            <TempWidget
              stats={stats?.temps ?? null}
              showAllProbes={false}
              showSparkline={showSparklines && !compact}
            />
          );
        default:
          return null;
      }
    },
    [stats, showSparklines, compactMode]
  );

  // Handle reorder
  const handleReorder = useCallback(
    (newOrder: DashboardComponent[]) => {
      // Update positions based on new order
      const updated = newOrder.map((item, idx) => ({
        ...item,
        position: { x: idx % 2, y: Math.floor(idx / 2) },
      }));
      updateLayout(updated);
    },
    [updateLayout]
  );

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-black/20 rounded-lg gap-2">
        <Activity className="w-6 h-6 text-white/30 animate-pulse" />
        <span className="text-xs text-white/50">Connecting...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full p-3 bg-black/30 backdrop-blur-md rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-green-400" />
          <span className="text-xs font-semibold text-white/80">
            System Monitor
          </span>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] text-white/40">Live</span>
          </div>
        </div>
        <button
          onClick={() => setIsEditMode(!isEditMode)}
          className={`p-1.5 rounded-md transition-colors ${
            isEditMode
              ? "bg-amber-500/20 text-amber-400"
              : "hover:bg-white/10 text-white/50"
          }`}
          title={isEditMode ? "Done" : "Edit Layout"}
        >
          <Settings className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Grid Container */}
      {isEditMode ? (
        <Reorder.Group
          axis="y"
          values={layout}
          onReorder={handleReorder}
          className="flex-1 grid grid-cols-2 gap-2"
          style={{ display: "contents" }}
        >
          <div className="flex-1 grid grid-cols-2 gap-2 auto-rows-fr">
            {layout.map((component) => (
              <DraggableItem
                key={component.id}
                component={component}
                isEditMode={isEditMode}
              >
                {renderComponent(component)}
              </DraggableItem>
            ))}
          </div>
        </Reorder.Group>
      ) : (
        <div className="flex-1 grid grid-cols-2 gap-2 auto-rows-fr">
          {layout.map((component) => (
            <motion.div
              key={component.id}
              layout
              className="relative"
              style={{
                gridColumn:
                  component.size.w > 1 ? `span ${component.size.w}` : undefined,
                gridRow:
                  component.size.h > 1 ? `span ${component.size.h}` : undefined,
              }}
            >
              {renderComponent(component)}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Draggable Item Component
// ============================================================================

interface DraggableItemProps {
  component: DashboardComponent;
  isEditMode: boolean;
  children: React.ReactNode;
}

function DraggableItem({
  component,
  isEditMode,
  children,
}: DraggableItemProps) {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={component}
      dragListener={false}
      dragControls={dragControls}
      className={`relative ${isEditMode ? "ring-2 ring-amber-500/30 rounded-lg" : ""}`}
      style={{
        gridColumn:
          component.size.w > 1 ? `span ${component.size.w}` : undefined,
        gridRow: component.size.h > 1 ? `span ${component.size.h}` : undefined,
      }}
    >
      {isEditMode && (
        <div
          className="absolute top-1 left-1 z-10 p-1 rounded bg-black/60 cursor-grab active:cursor-grabbing"
          onPointerDown={(e) => dragControls.start(e)}
        >
          <GripVertical className="w-3 h-3 text-white/60" />
        </div>
      )}
      {children}
    </Reorder.Item>
  );
}

export default SystemDashboard;
