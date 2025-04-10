import type { PinsObjectType } from "types/map";
import { useState, useEffect } from "react";
import Loading from "~/views/Loading";

export default function Common({ pins }: { pins: PinsObjectType[] }) {
  // クライアントでのみ Leaflet を読み込む
  const [Map, setMap] = useState<React.FC<any> | null>(null);
  useEffect(() => {
    import("./Map").then((mod) => {
      setMap(() => mod.default);
    });
  }, []);

  // マップを描写する？
  const isReady = pins && Map;
  return <main>{isReady ? <Map pins={pins} /> : <Loading />}</main>;
}