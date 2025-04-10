import type { Route } from "./+types/team";
import type { loaderData } from "types/map";
import { Suspense, useState, useEffect } from "react";
import { Await } from "react-router";
import { HumanDinosaur } from "react-kawaii";
import {
  connectDb,
  fetchRulebookPins,
  fetchTeamPins,
} from "~/utilities/pinLoader";
import Error from "./Error";
import Loading from "./Loading";

export function meta({ data }: Route.MetaArgs) {
  const title = [data.title, "Cyberpunk RED Map"].filter(Boolean).join(" - ");
  return [
    { title },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function loader({ params }: Route.LoaderArgs) {
  // パラメータを取得
  const { teamId } = params;
  // DB接続
  const db = await connectDb();
  // 返却データ
  let pins = [];
  let title = "";
  try {
    // rulebookのmap情報を取得
    const rulebookMap = await fetchRulebookPins(db);
    pins.push({ name: "ルールブック", pins: rulebookMap });
    // teamIdのmap情報を取得
    if (teamId) {
      const teamMap = await fetchTeamPins(db, teamId);
      if (teamMap) {
        title = teamMap.name;
        pins.push({ name: teamMap.name, pins: teamMap.pins });
      }
    }
    // データ返却
    return { pins, title, error: null };
  } catch (error) {
    console.error("🔥", error);
    return { pins: null, title: null, error: "データベース接続に失敗しました" };
  } finally {
    await db.end().catch((e) => console.error("⚠️", e));
  }
}

export default function Index({ loaderData }: loaderData) {
  const { pins, error } = loaderData;
  if (error) return <ErrorBoundary />;

  // クライアントでのみ Leaflet を読み込む
  const [Map, setMap] = useState<React.FC<any> | null>(null);
  useEffect(() => {
    import("./Map").then((mod) => {
      setMap(() => mod.default);
    });
  }, []);

  // マップを描写する？
  const isReady = pins && Map

  return (
    <main>{isReady ? <Map pins={pins} /> : <Loading />}</main>
  );
}

export function ErrorBoundary() {
  return <Error />;
}
