import type { PinsLeafletObjectType } from "types/map";
import { useState, useEffect } from "react";
import Loading from "~/components/loading";

export default function Common({ pins }: { pins: PinsLeafletObjectType[] }) {
  // クライアントでのみ Leaflet を読み込む
  const [Map, setMap] = useState<React.FC<any> | null>(null);
  useEffect(() => {
    import("./map").then((mod) => setMap(() => mod.default));
  }, []);
  return Map ? <Map pins={pins} /> : <Loading />;
}