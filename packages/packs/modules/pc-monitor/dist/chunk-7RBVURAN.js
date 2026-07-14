// src/module/types.ts
var MAX_HISTORY_POINTS = 60;
var DEFAULT_DASHBOARD_LAYOUT = [
  { id: "cpu", type: "cpu", position: { x: 0, y: 0 }, size: { w: 1, h: 1 } },
  { id: "ram", type: "ram", position: { x: 1, y: 0 }, size: { w: 1, h: 1 } },
  { id: "gpu", type: "gpu", position: { x: 0, y: 1 }, size: { w: 1, h: 1 } },
  { id: "temp", type: "temp", position: { x: 1, y: 1 }, size: { w: 1, h: 1 } }
];

export {
  MAX_HISTORY_POINTS,
  DEFAULT_DASHBOARD_LAYOUT
};
