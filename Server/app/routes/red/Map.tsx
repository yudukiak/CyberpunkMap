import type { PinsObjectType } from "types/map";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  LayersControl,
  LayerGroup,
} from "react-leaflet";
import { useEffect } from "react";
import { useRevalidator } from "react-router";
import { CRS, Icon } from "leaflet";
import { isDevelopment, debugLog } from "~/utilities/debugLog";

const MODE = import.meta.env.MODE;
const PORT = import.meta.env.VITE_SERVER_PORT;
const vsPort = MODE === "development" ? `:${PORT}` : null;

export default function Map({ pins }: { pins: PinsObjectType[] }) {
  if (pins == null) throw { message: "情報の取得に失敗しました" };

  const revalidator = useRevalidator();
  useEffect(() => {
    let retryTimeout: number;
    const connect = () => {
      const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
      const wlPort = window.location.port;
      const wsPort = vsPort ? vsPort : wlPort === "" ? "" : `:${wlPort}`;
      const ws = new WebSocket(
        `${wsProtocol}://${window.location.hostname}${wsPort}/ws`
      );
      ws.onopen = () => {
        debugLog("✅ WebSocket 接続成功");
      };
      ws.onmessage = (event) => {
        const { data } = event;
        if (data === "red_map_updated") {
          debugLog("🔁 WebSocket updated受信");
          revalidator.revalidate();
        } else if (data === "keepalive") {
          debugLog(
            "📡 WebSocket keepalive受信",
            new Date().toLocaleString("ja-JP")
          );
        }
      };
      ws.onclose = () => {
        debugLog("⏸️ WebSocket 切断 → 再接続します");
        retryTimeout = window.setTimeout(connect, 3000);
      };
      ws.onerror = (err) => {
        debugLog("❌ WebSocket エラー:", err);
        ws.close(); // 自動で再接続される
      };
    };
    connect();
    return () => clearTimeout(retryTimeout);
  }, []);

  function ClipboardMapClick() {
    useMapEvents({
      click(e) {
        if (!isDevelopment()) return null;
        const { lat, lng } = e.latlng;
        const coords = `${lat}, ${lng}`;
        navigator.clipboard
          .writeText(coords)
          .then(() => console.log(`📋 コピーしました: ${coords}`))
          .catch((err) => console.error("❌ コピーに失敗しました", err));
      },
    });
    return null;
  }

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
      center={[-128, 128]}
      zoom={3}
      minZoom={0}
      maxZoom={6}
      scrollWheelZoom={true}
      crs={CRS.Simple}
      className="h-full w-full"
      style={{ background: "#1e1e29" }}
      id="map"
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
      <ClipboardMapClick />
      <LayersControl>{LayersControlList}</LayersControl>
    </MapContainer>
  );
}
