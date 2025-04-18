import type { Route } from "./+types/index";
import type { loaderData } from "types/map";
import {
  connectDb,
  fetchRulebookPins,
  fetchAllTeam,
  fetchTeamPins,
} from "~/utilities/pinLoader";
import Error from "~/views/Error";
import Common from "../Common";

export function meta({ data }: Route.MetaArgs) {
  const title = ["すべて", "Cyberpunk RED Map"].filter(Boolean).join(" - ");
  return [
    { title },
  ];
}

export async function loader({ params }: Route.LoaderArgs) {
  // DB接続
  const db = await connectDb();
  // 返却データ
  let pins = [];
  let title = "";
  try {
    // rulebookのmap情報を取得
    const rulebookMap = await fetchRulebookPins(db);
    pins.push({ name: "ルールブック", pins: rulebookMap });
    // team情報を取得
    const teams = await fetchAllTeam(db);
    // teamIdのmap情報を取得
    for (const team of teams) {
      const teamMap = await fetchTeamPins(db, team.key, "admin");
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
  return <Common pins={pins}/>
}

export function ErrorBoundary() {
  return <Error />;
}