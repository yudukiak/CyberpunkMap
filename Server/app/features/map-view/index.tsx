//import type { PinsLeafletObjectType } from "~/types/map";
import type { LeafletPinsType } from "~/types/pins";
import { useState, useEffect } from "react";
import Loading from "~/components/loading";

type MapProps = {
  system: "red" |"edge";
  pins?: LeafletPinsType[],
  dev?: boolean,
}

export default function Index({ system, pins, dev = false }: MapProps) {
  // クライアントでのみ Leaflet を読み込む
  const [Map, setMap] = useState<React.FC<any> | null>(null);
  useEffect(() => {
    import("./components/map").then((mod) => setMap(() => mod.default));
  }, []);
  return Map ? <Map system={system} pins={pins} dev={dev} /> : <Loading />;
}