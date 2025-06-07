import type { PinsLeafletObjectType, PinsLeafletType } from "types/map";
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
import { CRS, Icon, Map as LeafletMap } from "leaflet";
import { MODE, DEV_WS_PORT, SERVER_PORT } from "~/config/vite";

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

type MapProps = {
  pins: PinsLeafletObjectType[],
  dev: boolean,
}

export default function RedMap({ pins: pinsRaw, dev }: MapProps) {
  // コンソールログを出力する関数
  function debugLog(...args: any[]) {
    if (dev) console.log(...args);
  }

  if (pinsRaw == null) throw { message: "情報の取得に失敗しました" };
  const [pins, setPins] = useState<PinsLeafletObjectType[]>(pinsRaw);

  const mapRef = useRef<LeafletMap>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  const handleMapReady = useCallback(() => {
    debugLog("✅ MapContainer 初期化完了");
    setIsMapReady(true);
  }, []);
  
  const wsRef = useRef<WebSocket | null>(null);
  useEffect(() => {
    if (!isMapReady) return;
    const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
    const wsPort = MODE === "development" ? DEV_WS_PORT : SERVER_PORT;
    const wsUrl = `${wsProtocol}://${window.location.hostname}:${wsPort}/ws`;
    wsRef.current = new WebSocket(wsUrl);

    // リトライ用
    let retryCount = 0;
    const maxRetries = 5;
    const sendInitRoute = () => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
      try {
        wsRef.current.send(JSON.stringify({ type: "initRoute", route: window.location.pathname }));
        debugLog("✅ initRoute送信成功");
      } catch (e) {
        if (retryCount < maxRetries) {
          retryCount++;
          debugLog(`❌ initRoute送信失敗、リトライ(${retryCount})`);
          setTimeout(sendInitRoute, 500 * retryCount); // だんだん遅らせてリトライ
        } else {
          debugLog("❌ initRoute送信リトライ上限到達");
        }
      }
    };
    wsRef.current.onopen = () => {
      sendInitRoute();
    };
    wsRef.current.onmessage = (event) => {
      const { data } = event;
      debugLog("📩 WebSocketメッセージ受信", data);
      try {
        const parsed = JSON.parse(data);
        const type = parsed.type;
        debugLog("📩 WebSocket type", type);
        if (type === "moveMapCenter") {
          const { lat, lng } = parsed.data || {};
          debugLog("🔁 moveMapCenter", { lat, lng });
          if (lat != null && lng != null) {
            mapRef.current?.setView([lat, lng], mapRef.current.getZoom());
          }
        }
        // Todo:
        // - is_publicがfalseの場合は対象を削除
        if (type === "updateMap") {
          const updateObjects: PinsLeafletObjectType[] = parsed.data || [];
          debugLog("🔁 updateMap", updateObjects);
          debugLog("🔁 updateMap", pins);
          // 送信されたデータを1つずつ処理
          updateObjects.forEach((updateObject) => {
            const updateTeamId = updateObject.team_id;
            const updatePins = updateObject.pins;
            // 送信されたチームIDから保存済みのデータを取得
            const prevObject = pins.find((prevObject) => prevObject.team_id === updateTeamId);
            // 存在しない場合は追加保存
            if (!prevObject) {
              setPins((prevPins) => [...prevPins, updateObject]);
            }
            // 存在する場合は更新作業
            else {
              const prevPins = prevObject.pins;
              // short_id と pins のマップを作成
              const pinMap = new Map<string, PinsLeafletType>();
              prevPins.forEach((pin) => {
                pinMap.set(pin.short_id, pin);
              });
              for (const newPin of updatePins) {
                pinMap.set(newPin.short_id, newPin); // 上書き or 新規追加
              }
              // マップを配列に戻す
              const newPins = Array.from(pinMap.values());
              // 新しいオブジェクトを作成
              const newObject = { 
                team_id: updateTeamId,
                name: prevObject.name,
                pins: newPins,
              };
              // 保存する
              setPins((prevPins) => {
                return prevPins.map((prevPin) => {
                  if (prevPin.team_id === updateTeamId) return newObject;
                  return prevPin;
                });
              });
            }
          })
        }
      } catch (error) {
        console.error("❌ WebSocketメッセージ処理エラー:", error);
      }
    };
    wsRef.current.onerror = (err) => {
      console.error("❌ WebSocketエラー", err);
    };
    return () => {
      wsRef.current?.close();
    };
  }, [isMapReady]);

  const LayersControlList = pins.map(({ name, pins }, index) => {
    const pinsList = pins.map(
      ({ lat, lng, content, className, zIndexOffset }, i) => {
        const icon = new Icon({
          iconUrl: "/map/marker-icon.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          className: `${className}`,
        });
        return (
          <Marker
            key={`${lat},${lng}-${i}`}
            position={[lat, lng]}
            icon={icon}
            zIndexOffset={zIndexOffset || 0}
          >
            {content && (
              <Popup className="whitespace-pre-line">{content}</Popup>
            )}
          </Marker>
        );
      }
    );
    return (
      <LayersControl.Overlay checked name={name} key={index}>
        <LayerGroup>{pinsList}</LayerGroup>
      </LayersControl.Overlay>
    );
  });

  return (
    <MapContainer
      ref={mapRef}
      center={[-128, 128]}
      zoom={3}
      minZoom={0}
      maxZoom={6}
      scrollWheelZoom={true}
      crs={CRS.Simple}
      className="h-full w-full"
      style={{ background: "#1e1e29" }}
      id="map"
      whenReady={handleMapReady}
    >
      <TileLayer
        url="/map/CyberpunkRed/tiles/{z}/{x}/{y}.png"
        tileSize={256}
        noWrap={true}
        bounds={[
          [-256, 256],
          [0, 0],
        ]}
        attribution='<a href="https://rtalsoriangames.com/2025/01/15/cyberpunk-red-alert-january-2025-dlc-night-city-atlas/" target="_blank">R. Talsorian Games</a>'
      />
      {dev && <ClipboardMapClick />}
      <LayersControl>{LayersControlList}</LayersControl>
    </MapContainer>
  );
}
