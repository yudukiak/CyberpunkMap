import type { PinsLeafletObjectType, PinsLeafletType, MoveMapCenterType } from "~/types/map";
import type { LeafletPinsType, PinType } from "~/types/pins";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  LayersControl,
  LayerGroup,
} from "react-leaflet";
import { useEffect, useRef, useState, useCallback } from "react";
import { CRS, Map as LeafletMap } from "leaflet";

import Markdown from "~/components/markdown";
import { getWebsocketUrl } from "~/utils/websocket-url";
import Dialog from "./dialog";

// 定数とユーティリティのインポート
import { MAP_CONFIG, PIN_CONFIG, getMapConfig } from "../constants/map-config";
import { WEBSOCKET_CONFIG } from "../constants/websocket-config";
import { calculatePinSize, createPinIcon } from "../utils/pin-utils";
import { createWebSocketHandler } from "../utils/websocket-utils";

// ============================================================================
// ピン関連コンポーネント
// ============================================================================

/**
 * ピンのPopupコンテンツ
 */
function PinPopup({ pin }: { pin: PinType }) {
  return (
    <div className="space-y-2">
      <div className="text-center font-bold py-2">{pin.title}</div>
      {pin.description && (
        <ScrollArea
          className="
            rounded-md bg-neutral-100
            p-2 pr-8 pl-4
            [&_[data-slot=scroll-area-viewport]]:max-h-48
            [&_[data-slot=scroll-area-viewport]]:rounded-none
            [&_[data-slot=scroll-area-thumb]]:bg-red-700
          "
          type="always"
        >
          <Markdown markdown={pin.description} />
        </ScrollArea>
      )}
      {pin.reference_title && pin.reference_url && (
        <div className="text-right">
          <a
            className="text-xm !text-red-500"
            href={pin.reference_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {pin.reference_title}
          </a>
        </div>
      )}
    </div>
  );
}

/**
 * 単一のピンマーカー
 */
function PinMarker({ 
  pin, 
  pinSize, 
  onRef 
}: { 
  pin: PinType; 
  pinSize: number; 
  onRef: (ref: any) => void;
}) {
  const icon = createPinIcon(pinSize, pin.className);

  return (
    <Marker
      key={pin.short_id}
      ref={onRef}
      position={[pin.lat, pin.lng]}
      icon={icon}
      zIndexOffset={pin.zIndexOffset || 0}
    >
      {pin.title && (
        <Popup>
          <PinPopup pin={pin} />
        </Popup>
      )}
    </Marker>
  );
}

/**
 * ズームレベルに応じてピンのサイズを管理するコンポーネント
 */
function ZoomAwarePins({ pins, dev }: { pins: LeafletPinsType[]; dev: boolean }) {
  const [currentZoom, setCurrentZoom] = useState(PIN_CONFIG.defaultZoom);
  const markerRefs = useRef<Map<string, any>>(new Map());
  const pinDataRefs = useRef<Map<string, PinType>>(new Map());
  
  // ズーム変更時の処理
  useMapEvents({
    zoomend: (e) => {
      const zoom = e.target.getZoom();
      setCurrentZoom(zoom);
      if (dev) console.log('🔍 ズームレベル変更:', zoom);
      
      // 既存マーカーのアイコンサイズを更新
      updateMarkerIcons(zoom);
    },
  });

  /**
   * マーカーのアイコンを更新
   */
  function updateMarkerIcons(zoom: number) {
    const newSize = calculatePinSize(zoom);
    
    markerRefs.current.forEach((markerRef, key) => {
      if (markerRef?.leafletElement) {
        const pinData = pinDataRefs.current.get(key);
        if (pinData) {
          const newIcon = createPinIcon(newSize, pinData.className);
          markerRef.leafletElement.setIcon(newIcon);
        }
      }
    });
  }

  const pinSize = calculatePinSize(currentZoom);

  // レイヤーコントロールリストを生成
  const layersControlList = pins.map(({ name, pins: teamPins }, index) => {
    const pinsList = teamPins.map((pin) => {
      // ピンデータを保存
      pinDataRefs.current.set(pin.short_id, pin);
      
      return (
        <PinMarker
          key={pin.short_id}
          pin={pin}
          pinSize={pinSize}
          onRef={(ref) => {
            if (ref) {
              markerRefs.current.set(pin.short_id, ref);
            }
          }}
        />
      );
    });

    return (
      <LayersControl.Overlay checked name={name} key={index}>
        <LayerGroup>{pinsList}</LayerGroup>
      </LayersControl.Overlay>
    );
  });

  return <LayersControl>{layersControlList}</LayersControl>;
}

// ============================================================================
// 開発用コンポーネント
// ============================================================================

/**
 * 開発用：マップクリックで座標をクリップボードにコピー
 */
function ClipboardMapClick() {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      const coords = `${lat}, ${lng}`;
      console.log('📍', coords);
      navigator.clipboard
        .writeText(coords)
        .then(() => console.log(`📋 コピーしました: ${coords}`))
        .catch((err) => console.error("❌ コピーに失敗しました", err));
    },
  });
  return null;
}

// ============================================================================
// メインコンポーネント
// ============================================================================

type MapProps = {
  system: "red" | "edge";
  pins: LeafletPinsType[];
  dev: boolean;
};

export default function RedMap({ system, pins: pinsRaw, dev }: MapProps) {
  // 状態管理
  const [pins, setPins] = useState<LeafletPinsType[]>(pinsRaw || []);
  const [isMapReady, setIsMapReady] = useState(false);
  const [moveMapCenterData, setMoveMapCenterData] = useState<MoveMapCenterType | null>(null);
  
  // リファレンス
  const mapRef = useRef<LeafletMap>(null);
  const wsRef = useRef<WebSocket | null>(null);
  
  // ユーティリティ
  const debugLog = useCallback((...args: any[]) => {
    if (dev) console.log(...args);
  }, [dev]);
  
  const handleMapReady = useCallback(() => {
    debugLog("✅ MapContainer 初期化完了");
    setIsMapReady(true);
  }, [debugLog]);
  
  // WebSocket接続の管理
  useEffect(() => {
    if (!isMapReady) return;
    
    const wsUrl = getWebsocketUrl();
    wsRef.current = new WebSocket(wsUrl);
    
    // リトライ機能付きの初期化
    let retryCount = 0;
    const sendInitRoute = () => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
      
      try {
        const path = window.location.pathname;
        const route = path.endsWith("/") && path !== "/" ? path.slice(0, -1) : path;
        wsRef.current.send(JSON.stringify({ type: "initRoute", route }));
        debugLog("✅ initRoute送信成功");
      } catch (e) {
        if (retryCount < WEBSOCKET_CONFIG.maxRetries) {
          retryCount++;
          debugLog(`❌ initRoute送信失敗、リトライ(${retryCount})`);
          setTimeout(sendInitRoute, WEBSOCKET_CONFIG.retryDelay * retryCount);
        } else {
          debugLog("❌ initRoute送信リトライ上限到達");
        }
      }
    };
    
    // WebSocketイベントハンドラー
    wsRef.current.onopen = sendInitRoute;
    wsRef.current.onmessage = createWebSocketHandler(
      mapRef as React.RefObject<LeafletMap>, 
      pins, 
      setPins, 
      setMoveMapCenterData, 
      debugLog
    );
    wsRef.current.onerror = (err) => {
      console.error("❌ WebSocket: ", err);
    };
    
    return () => {
      wsRef.current?.close();
    };
  }, [isMapReady, pins, debugLog]);
  
  // マップ設定
  const mapConfig = getMapConfig(system);
  
  return (
    <>
      <MapContainer
        ref={mapRef}
        center={MAP_CONFIG.center}
        zoom={MAP_CONFIG.defaultZoom}
        minZoom={MAP_CONFIG.minZoom}
        maxZoom={MAP_CONFIG.maxZoom}
        scrollWheelZoom={true}
        crs={CRS.Simple}
        className="h-full w-full"
        style={{ background: mapConfig.background }}
        id="map"
        whenReady={handleMapReady}
      >
        <TileLayer
          url={`/map/${mapConfig.directory}/tiles/{z}/{x}/{y}.png`}
          tileSize={MAP_CONFIG.tileSize}
          noWrap={true}
          bounds={MAP_CONFIG.bounds}
          attribution={mapConfig.attribution}
        />
        {dev && <ClipboardMapClick />}
        {pinsRaw && <ZoomAwarePins pins={pins} dev={dev} />}
      </MapContainer>
      
      {moveMapCenterData && (
        <Dialog
          data={moveMapCenterData}
          zoomPoint={mapRef.current?.getZoom() || 6}
          onResult={(result) => {
            setMoveMapCenterData(null);
            if (result.success && moveMapCenterData) {
              mapRef.current?.setView(
                [moveMapCenterData.lat, moveMapCenterData.lng],
                result.zoomPoint
              );
            }
          }}
        />
      )}
    </>
  );
}
