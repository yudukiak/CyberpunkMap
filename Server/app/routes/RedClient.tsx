import type { PinsType, MapClientProps } from "types/map"
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import { useEffect } from "react";
import { useRevalidator } from "react-router";
import { CRS, Icon } from "leaflet";

const wsPort = import.meta.env.VITE_SERVER_PORT;

const pinColor = {
  blue: "hue-rotate-[0deg]",
  indigo: "hue-rotate-[30deg]",
  violet: "hue-rotate-[60deg]",
  pink: "hue-rotate-[90deg]",
  red: "hue-rotate-[120deg]",
  orange: "hue-rotate-[150deg]",
  amber: "hue-rotate-[180deg]",
  yellow: "hue-rotate-[210deg]",
  lime: "hue-rotate-[240deg]",
  green: "hue-rotate-[270deg]",
  teal: "hue-rotate-[300deg]",
  cyan: "hue-rotate-[330deg]",
  gray: "grayscale",
};

function ClipboardMapClick() {
  useMapEvents({
    click(e) {
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

export default function RedClient({ loaderData }: MapClientProps) {
  const { pins } = loaderData;
  const revalidator = useRevalidator();

  useEffect(() => {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const ws = new WebSocket(`${wsProtocol}://${window.location.hostname}:${wsPort}`);
    ws.onopen = () => console.log("✅ WebSocket 接続成功");
    ws.onmessage = (event) => {
      if (event.data === "red_map_updated") {
        console.log("🔁 ピン更新通知受信 → 再取得！");
        revalidator.revalidate();
      }
    };
    ws.onerror = (err) => console.warn("❌ WebSocket エラー:", err);
    ws.onclose = () => console.log("🔌 WebSocket 切断");
    return () => ws.close();
  }, []);

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
        bounds={[[-256, 256], [0, 0]]}
        attribution='<a href="https://rtalsoriangames.com/2025/01/15/cyberpunk-red-alert-january-2025-dlc-night-city-atlas/" target="_blank">R. Talsorian Games</a>'
      />
      <ClipboardMapClick />
      {pins.map(({ lat, lng, content, pin_color }, i) => {
        const className = pinColor[pin_color as keyof typeof pinColor] ?? "blue";
        const icon = new Icon({
          iconUrl: "/map/marker-icon.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          className,
        });
        return (
          <Marker key={`${lat},${lng}-${i}`} position={[lat, lng]} icon={icon}>
            {content && <Popup>{content}</Popup>}
          </Marker>
        );
      })}
    </MapContainer>
  );
}
