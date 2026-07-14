// ============================================================================
// Launcher Store - Zustand-like state management via React hooks
// ============================================================================

import { useState, useCallback, useEffect } from "react";
import type {
  LauncherItem,
  LauncherStore,
  GridPosition,
  GridDensity,
} from "./types";

function areLauncherItemsEqual(a: LauncherItem[], b: LauncherItem[]): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; i++) {
    const left = a[i];
    const right = b[i];
    if (left.id !== right.id) return false;
    if (left.type !== right.type) return false;
    if (left.label !== right.label) return false;
    if ((left.iconSource ?? null) !== (right.iconSource ?? null)) return false;
    if ((left.customIconUrl ?? null) !== (right.customIconUrl ?? null))
      return false;
    if (left.icon !== right.icon) return false;
    if (left.iconUrl !== right.iconUrl) return false;
    if ((left.iconScale ?? null) !== (right.iconScale ?? null)) return false;
    if ((left.paddingPx ?? null) !== (right.paddingPx ?? null)) return false;
    if (left.position.row !== right.position.row) return false;
    if (left.position.col !== right.position.col) return false;

    if (left.type === "lnk" && right.type === "lnk") {
      if (left.lnkPath !== right.lnkPath) return false;
      if (left.targetPath !== right.targetPath) return false;
      if (left.workingDir !== right.workingDir) return false;
      if (left.arguments !== right.arguments) return false;
      if (left.iconLocation !== right.iconLocation) return false;
      continue;
    }

    if (left.type === "custom" && right.type === "custom") {
      if (left.target !== right.target) return false;
      if ((left.cwd ?? null) !== (right.cwd ?? null)) return false;

      const leftArgs = left.args ?? null;
      const rightArgs = right.args ?? null;
      if (leftArgs === null && rightArgs === null) continue;
      if (leftArgs === null || rightArgs === null) return false;
      if (leftArgs.length !== rightArgs.length) return false;
      for (let j = 0; j < leftArgs.length; j++) {
        if (leftArgs[j] !== rightArgs[j]) return false;
      }
      continue;
    }

    return false;
  }

  return true;
}

// ============================================================================
// Initial State
// ============================================================================

const initialState: LauncherStore = {
  items: [],
  isEditMode: false,
  draggingId: null,
  validityCache: {},
};

// ============================================================================
// Hook for Launcher Store
// ============================================================================

export interface LauncherStoreOptions {
  onItemsChange?: (items: LauncherItem[]) => void;
}

export function useLauncherStore(
  initialItems: LauncherItem[] = [],
  options?: LauncherStoreOptions
) {
  const [state, setState] = useState<LauncherStore>({
    ...initialState,
    items: initialItems,
  });

  // Keep store items in sync with external config updates.
  useEffect(() => {
    setState((prev) => {
      if (areLauncherItemsEqual(prev.items, initialItems)) return prev;
      return { ...prev, items: initialItems };
    });
  }, [initialItems]);

  // Persist store updates back to the owning widget config.
  useEffect(() => {
    const onItemsChange = options?.onItemsChange;
    if (!onItemsChange) return;
    if (areLauncherItemsEqual(state.items, initialItems)) return;
    onItemsChange(state.items);
  }, [state.items, initialItems, options?.onItemsChange]);

  // Add a new item
  const addItem = useCallback((item: LauncherItem) => {
    setState((prev) => ({
      ...prev,
      items: [...prev.items, item],
    }));
  }, []);

  // Remove an item by ID
  const removeItem = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
  }, []);

  // Update an item
  const updateItem = useCallback(
    (id: string, updates: Partial<LauncherItem>) => {
      setState((prev) => ({
        ...prev,
        items: prev.items.map((item) =>
          item.id === id ? ({ ...item, ...updates } as LauncherItem) : item
        ),
      }));
    },
    []
  );

  // Move item to new position
  const moveItem = useCallback((id: string, newPosition: GridPosition) => {
    setState((prev) => {
      const items = [...prev.items];
      const movingItem = items.find((item) => item.id === id);
      if (!movingItem) return prev;

      // Find item at target position and swap
      const targetItem = items.find(
        (item) =>
          item.id !== id &&
          item.position.row === newPosition.row &&
          item.position.col === newPosition.col
      );

      if (targetItem) {
        // Swap positions
        const movingPos = { ...movingItem.position };
        movingItem.position = newPosition;
        targetItem.position = movingPos;
      } else {
        // Just move to empty spot
        movingItem.position = newPosition;
      }

      return { ...prev, items };
    });
  }, []);

  // Reorder items for the grid
  const reorderItems = useCallback((fromId: string, toId: string) => {
    if (fromId === toId) return;

    setState((prev) => {
      const items = [...prev.items];
      const fromItem = items.find((i) => i.id === fromId);
      const toItem = items.find((i) => i.id === toId);

      if (fromItem && toItem) {
        // Swap positions
        const tempPos = { ...fromItem.position };
        fromItem.position = { ...toItem.position };
        toItem.position = tempPos;
      }

      return { ...prev, items };
    });
  }, []);

  // Toggle edit mode
  const toggleEditMode = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isEditMode: !prev.isEditMode,
    }));
  }, []);

  // Set edit mode
  const setEditMode = useCallback((isEditMode: boolean) => {
    setState((prev) => ({
      ...prev,
      isEditMode,
    }));
  }, []);

  // Set dragging item
  const setDraggingId = useCallback((id: string | null) => {
    setState((prev) => ({
      ...prev,
      draggingId: id,
    }));
  }, []);

  // Update validity cache
  const setValidity = useCallback((target: string, isValid: boolean) => {
    setState((prev) => ({
      ...prev,
      validityCache: {
        ...prev.validityCache,
        [target]: isValid,
      },
    }));
  }, []);

  // Get next available position
  const getNextPosition = useCallback(
    (density: GridDensity): GridPosition => {
      const gridSize = parseInt(density.charAt(0), 10);
      const usedPositions = new Set(
        state.items.map((i) => `${i.position.row}-${i.position.col}`)
      );

      for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
          if (!usedPositions.has(`${row}-${col}`)) {
            return { row, col };
          }
        }
      }

      // All positions filled, return first position (will need to handle overflow)
      return { row: 0, col: 0 };
    },
    [state.items]
  );

  return {
    ...state,
    addItem,
    removeItem,
    updateItem,
    moveItem,
    reorderItems,
    toggleEditMode,
    setEditMode,
    setDraggingId,
    setValidity,
    getNextPosition,
  };
}

export type LauncherStoreActions = ReturnType<typeof useLauncherStore>;
