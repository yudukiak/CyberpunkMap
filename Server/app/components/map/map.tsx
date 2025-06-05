import type { PinsLeafletObjectType } from "types/map";
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
import { debugLog } from "~/utilities/debugLog";
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

export default function Map({ pins, dev }: MapProps) {
  if (pins == null) throw { message: "情報の取得に失敗しました" };

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
    wsRef.current.onmessage = (event) => {
      const { data } = event;
      debugLog("📩 WebSocketメッセージ受信", data);
      try {
        if (typeof data === 'string' && data.startsWith('{')) {
          const parsed = JSON.parse(data);
          if (parsed.type === "moveMapCenter") {
            const { lat, lng } = parsed.latlng || {};
            debugLog("🔁 moveMapCenter", { lat, lng });
            if (lat != null && lng != null) {
              mapRef.current?.setView([lat, lng], mapRef.current.getZoom());
            }
          }
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

  /*
  useEffect(() => {
    if (!isMapReady) return;

    let retryTimeout: number;
    const connect = () => {
      const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
      const wlPort = window.location.port;
      const wsPort = vsPort ? vsPort : wlPort === "" ? "" : `:${wlPort}`;
      const ws = new WebSocket(
        `${wsProtocol}://${window.location.hostname}${wsPort}/ws`
      );

      ws.onopen = () => debugLog("✅ WebSocket 接続成功");
      ws.onclose = () => {
        debugLog("⏸️ WebSocket 切断 → 再接続します");
        retryTimeout = window.setTimeout(connect, 3000);
      };
      ws.onerror = (err) => {
        debugLog("❌ WebSocket エラー:", err);
        ws.close();
      };
      ws.onmessage = (event) => {
        try {
          const { data } = event;
          debugLog("ℹ️ WebSocket メッセージ受信", data);
          
          if (data === "redMapUpdated") {
            debugLog("🔁 redMapUpdated");
            revalidator.revalidate();
          } else if (typeof data === 'string' && data.startsWith('{')) {
            const parsed = JSON.parse(data);
            if (parsed.type === "moveMapCenter") {
              const { lat, lng } = parsed;
              debugLog("🔁 moveMapCenter", { lat, lng });
              mapRef.current?.setView([lat, lng], mapRef.current.getZoom());
            }
          } else if (data === "keepalive") {
            debugLog("📡 keepalive", new Date().toLocaleString("ja-JP"));
          }
        } catch (error) {
          debugLog("❌ WebSocketメッセージ処理エラー:", error);
        }
      };
    };

    connect();
    return () => clearTimeout(retryTimeout);
  }, [isMapReady, revalidator]);
  */

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
