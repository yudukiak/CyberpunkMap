import type { PinsObjectType } from "types/map";
import { lazy, Suspense } from "react";
import Loading from "~/views/Loading";

export default function Common({ pins }: { pins: PinsObjectType[] }) {
  // クライアントでのみ Leaflet を読み込む
  const Map = typeof window !== 'undefined' ? lazy(() => import('./Map')) : () => null;
  return (
    <main>
      <Suspense fallback={<Loading />}>
        <Map pins={pins} />
      </Suspense>
    </main>
  );
}