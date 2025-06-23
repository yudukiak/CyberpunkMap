import type { LeafletPinsType, PinType } from "~/types/pins";
import type { MoveMapCenterType } from "~/types/map";
import { Map as LeafletMap } from "leaflet";
import { WEBSOCKET_CONFIG } from "../constants/websocket-config";

// ============================================================================
// WebSocket関連ユーティリティ関数
// ============================================================================

/**
 * WebSocketメッセージハンドラー
 */
export function createWebSocketHandler(
  mapRef: React.RefObject<LeafletMap>,
  pins: LeafletPinsType[],
  setPins: React.Dispatch<React.SetStateAction<LeafletPinsType[]>>,
  setMoveMapCenterData: React.Dispatch<React.SetStateAction<MoveMapCenterType | null>>,
  debugLog: (...args: any[]) => void
) {
  return (event: MessageEvent) => {
    const { data } = event;
    debugLog("📩 WebSocketメッセージ受信", data);
    
    try {
      // データの検証
      if (typeof data !== "string" || !data.startsWith('{')) return;
      
      const parsed = JSON.parse(data);
      const { type } = parsed;
      debugLog("📩 WebSocket type", type);
      
      // メッセージタイプに応じた処理
      switch (type) {
        case "moveMapCenter":
        case "getMoveMapCenter":
          handleMapCenterMessage(parsed, setMoveMapCenterData, mapRef);
          break;
        case "updateMap":
          handleUpdateMapMessage(parsed, pins, setPins, debugLog);
          break;
      }
    } catch (error) {
      console.error("❌ WebSocket - parse: ", error);
    }
  };
}

/**
 * マップ中心移動メッセージの処理
 */
function handleMapCenterMessage(
  parsed: any,
  setMoveMapCenterData: React.Dispatch<React.SetStateAction<MoveMapCenterType | null>>,
  mapRef: React.RefObject<LeafletMap>
) {
  const { lat, lng } = parsed.data || {};
  if (lat == null || lng == null) return;
  
  const queryParams = new URLSearchParams(window.location.search);
  const skipDialog = queryParams.get("skipDialog");
  
  if (skipDialog === "true") {
    mapRef.current?.setView([lat, lng], 6);
  } else {
    setMoveMapCenterData(parsed.data);
  }
}

/**
 * マップ更新メッセージの処理
 */
function handleUpdateMapMessage(
  parsed: any,
  pins: LeafletPinsType[],
  setPins: React.Dispatch<React.SetStateAction<LeafletPinsType[]>>,
  debugLog: (...args: any[]) => void
) {
  const updateObjects: LeafletPinsType[] = parsed.data || [];
  debugLog("📦 updateMap 送信されたデータ", updateObjects.concat());
  debugLog("📦 updateMap 保存済みデータ", pins.concat());
  
  updateObjects.forEach((updateObject) => {
    const { team_id, pins: updatePins } = updateObject;
    const prevObject = pins.find((prev) => prev.team_id === team_id);
    
    if (!prevObject) {
      // 新規追加
      setPins((prevPins) => [...prevPins, updateObject]);
    } else {
      // 既存データの更新
      updateExistingTeamPins(prevObject, updatePins, setPins, debugLog);
    }
  });
}

/**
 * 既存チームのピンデータを更新
 */
function updateExistingTeamPins(
  prevObject: LeafletPinsType,
  updatePins: PinType[],
  setPins: React.Dispatch<React.SetStateAction<LeafletPinsType[]>>,
  debugLog: (...args: any[]) => void
) {
  // ピンのマップを作成
  const pinMap = new Map<string, PinType>();
  prevObject.pins.forEach((pin) => {
    pinMap.set(pin.short_id, pin);
  });
  
  // 新しいピンで更新
  updatePins.forEach((newPin) => {
    pinMap.set(newPin.short_id, newPin);
  });
  
  // フィルタリング
  const currentPath = window.location.pathname;
  const isEdit = currentPath.startsWith("/edit");
  const filteredPins = Array.from(pinMap.values()).filter(
    (pin) => !isEdit ? pin.is_public : true
  );
  
  debugLog("📦 updateMap フィルター後のデータ", filteredPins.concat());
  
  // 新しいオブジェクトを作成
  const newObject = {
    team_id: prevObject.team_id,
    name: prevObject.name,
    pins: filteredPins,
  };
  
  // 状態を更新
  setPins((prevPins) => {
    return prevPins.map((prevPin) => {
      if (prevPin.team_id === prevObject.team_id) return newObject;
      return prevPin;
    });
  });
} 