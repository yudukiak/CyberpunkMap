import { MapPin } from "lucide-react";
import { renderToStaticMarkup } from "react-dom/server";
import { DivIcon } from "leaflet";
import { PIN_CONFIG } from "../constants/map-config";

// ============================================================================
// ピン関連ユーティリティ関数
// ============================================================================

/**
 * ズームレベルに応じてピンのサイズを計算
 */
export function calculatePinSize(zoom: number): number {
  return Math.max(PIN_CONFIG.baseSize * (zoom / 2), PIN_CONFIG.baseSize);
}

/**
 * ピンのアイコン設定を生成
 */
export function createPinIcon(pinSize: number, className: string): DivIcon {
  return new DivIcon({
    html: renderToStaticMarkup(
      <MapPin
        strokeWidth={1}
        style={{ width: `${pinSize}px`, height: `${pinSize}px` }}
        className="[&>path]:fill-blue-500 [&>circle]:fill-white"
      />
    ),
    iconSize: [pinSize, pinSize] as [number, number],
    iconAnchor: [pinSize / 2, pinSize] as [number, number],
    popupAnchor: [1, -pinSize] as [number, number],
    className: `!flex items-end ${className}`,
  });
} 