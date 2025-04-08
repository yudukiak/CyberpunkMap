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

const isDev = import.meta.env.MODE === "development";
const consoleLog = (...args: any[]) => isDev && console.log(...args);
const consoleError = (...args: any[]) => isDev && console.error(...args);
const consoleWarn = (...args: any[]) => isDev && console.warn(...args);

const wsPort = import.meta.env.VITE_SERVER_PORT;

function ClipboardMapClick() {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      const coords = `${lat}, ${lng}`;
      navigator.clipboard
        .writeText(coords)
        .then(() => consoleLog(`📋 コピーしました: ${coords}`))
        .catch((err) => consoleError("❌ コピーに失敗しました", err));
    },
  });
  return null;
}

export default function RedClient({ pins }: { pins: PinsObjectType[] }) {
  if (pins == null) throw { message: "情報の取得に失敗しました" };

  const revalidator = useRevalidator();
  useEffect(() => {
    const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
    const ws = new WebSocket(
      `${wsProtocol}://${window.location.hostname}:${wsPort}`
    );
    ws.onopen = () => consoleLog("✅ WebSocket 接続成功");
    ws.onmessage = (event) => {
      if (event.data === "red_map_updated") {
        consoleLog("🔁 ピン更新通知受信 → 再取得！");
        revalidator.revalidate();
      }
    };
    ws.onerror = (err) => consoleWarn("🟥 WebSocket エラー:", err);
    ws.onclose = () => consoleLog("⏸️ WebSocket 切断");
    return () => ws.close();
  }, []);
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
      className="h-screen w-screen"
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
      {isDev && <ClipboardMapClick />}
      <LayersControl>{LayersControlList}</LayersControl>
    </MapContainer>
  );
}
