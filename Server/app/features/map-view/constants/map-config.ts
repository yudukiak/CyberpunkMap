// ============================================================================
// マップ設定定数
// ============================================================================

export const MAP_CONFIG = {
  center: [-128, 128] as [number, number],
  defaultZoom: 3,
  minZoom: 0,
  maxZoom: 6,
  bounds: [[-256, 256], [0, 0]] as [[number, number], [number, number]],
  tileSize: 256,
} as const;

export const PIN_CONFIG = {
  baseSize: 24,
  defaultZoom: 3,
} as const;

/**
 * システムに応じたマップ設定を取得
 */
export function getMapConfig(system: "red" | "edge") {
  return {
    directory: system === "edge" ? "CyberpunkEdgerunners" : "CyberpunkRed",
    attribution: system === "edge" 
      ? undefined 
      : '<a href="https://rtalsoriangames.com/2025/01/15/cyberpunk-red-alert-january-2025-dlc-night-city-atlas/" target="_blank">R. Talsorian Games</a>',
    background: system === "edge" ? "#3c3a3b" : "#1e1e29",
  };
} 