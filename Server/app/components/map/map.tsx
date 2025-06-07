import type { PinsLeafletObjectType, PinsLeafletType, MoveMapCenterType } from "types/map";
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
import Dialog from "./dialog";

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
  // ピンの情報
  if (pinsRaw == null) throw { message: "情報の取得に失敗しました" };
  const [pins, setPins] = useState<PinsLeafletObjectType[]>(pinsRaw);

  // コンソールログ
  function debugLog(...args: any[]) {
    if (dev) console.log(...args);
  }

  // マップ（MapContainer）の操作
  const mapRef = useRef<LeafletMap>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const handleMapReady = useCallback(() => {
    debugLog("✅ MapContainer 初期化完了");
    setIsMapReady(true);
  }, []);

  // ダイアログボックス
  const [moveMapCenterData, setMoveMapCenterData] = useState<MoveMapCenterType | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  useEffect(() => {
    const queryString = window.location.search;
    const queryParams = new URLSearchParams(queryString);
    
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
        // パスの末尾の "/" を削除
        const path = window.location.pathname;
        const route = path.endsWith("/") && path !== "/" ? path.slice(0, -1) : path;
        wsRef.current.send(JSON.stringify({ type: "initRoute", route }));
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
        // マップの移動
        if (type === "moveMapCenter") {
          const { lat, lng } = parsed.data || {};
          debugLog("🔁 moveMapCenter", { lat, lng });
          if (lat != null && lng != null) {
            // クエリ文字列を取得
            const skipDialog = queryParams.get("skipDialog");
            if (skipDialog === "true") {
              mapRef.current?.setView([lat, lng], mapRef.current.getZoom());
            } else {
              // ダイアログボックスを表示
              setMoveMapCenterData(parsed.data);
            }
          }
        }
        // 読込時にマップの移動
        if (type === "getMoveMapCenter") {
          const { lat, lng } = parsed.data || {};
          debugLog("🔁 getMoveMapCenter", { lat, lng });
          if (lat != null && lng != null) {
            // クエリ文字列を取得
            const skipDialog = queryParams.get("skipDialog");
            if (skipDialog === "true") {
              mapRef.current?.setView([lat, lng], mapRef.current.getZoom());
            } else {
              // ダイアログボックスを表示
              setMoveMapCenterData(parsed.data);
            }
          }
        }
        // マップの更新
        if (type === "updateMap") {
          const updateObjects: PinsLeafletObjectType[] = parsed.data || [];
          debugLog("📦 updateMap 送信されたデータ", updateObjects.concat());
          debugLog("📦 updateMap 保存済みデータ", pins.concat());
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
              let newPins = Array.from(pinMap.values());
              // 今のパスを取得
              const currentPath = window.location.pathname;
              const isEdit = currentPath.startsWith("/edit");
              // is_publicがfalseの場合は対象を削除（編集ページの場合は全て表示）
              newPins = newPins.filter((pin) => !isEdit ? pin.is_public : true);
              debugLog("📦 updateMap フィルター後のデータ", newPins.concat());
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
    <>
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
    {moveMapCenterData && (
      <Dialog
        data={moveMapCenterData}
        onResult={(result) => {
          setMoveMapCenterData(null);
          if (result && moveMapCenterData) {
            mapRef.current?.setView(
              [moveMapCenterData.lat, moveMapCenterData.lng],
              mapRef.current.getZoom()
            );
          }
        }}
      />
    )}
    </>
  );
}
