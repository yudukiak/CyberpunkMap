import type { Route } from "./+types/index";
import type { loaderData } from "types/map";
import { Suspense, useState, useEffect } from "react";
import { Await } from "react-router";
import { HumanDinosaur } from "react-kawaii";
import pkg from "pg";

// Tailwind
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

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Cyberpunk RED Map" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const { Client } = pkg;
  const options = {
    user: import.meta.env.VITE_DB_USER,
    host: import.meta.env.VITE_DB_HOST,
    port: import.meta.env.VITE_DB_PORT,
    database: import.meta.env.VITE_DB_NAME,
    password: import.meta.env.VITE_DB_PASS,
  };
  // パラメータを取得
  const url = new URL(request.url);
  const teamParam = url.searchParams.get("team");
  // DB接続
  const db = new Client(options);
  // 返却データ
  let pins = [];
  try {
    await db.connect();

    // rulebookのmap情報を取得
    const rulebookMapRes = await db.query(
      `SELECT lat, lng, content, tags FROM red_map WHERE is_public = true AND cardinality(rulebook_ids) > 0;`
    );
    const rulebookMap = rulebookMapRes.rows.map((row) => ({
      ...row,
      className: pinColor.gray,
    }));
    pins.push({ name: "ルールブック", pins: rulebookMap });
    if (teamParam === null) return { pins, error: null };

    // パラメータからteam情報を取得
    const teamRes = await db.query(
      `SELECT id, name FROM red_team WHERE is_public = true AND key = $1 LIMIT 1;`,
      [teamParam]
    );
    const team = teamRes.rows[0];
    if (team == null) return { pins, error: null };

    // team情報からmap情報を取得
    const teamMapRes = await db.query(
      `SELECT lat, lng, content, tags FROM red_map WHERE is_public = true AND $1 = ANY(team_ids);`,
      [team.id]
    );
    const teamMap = teamMapRes.rows.map((row) => {
      const { tags } = row;
      let className = pinColor.gray;
      let zIndexOffset = 0;
      if (tags.includes("location")) {
        className = pinColor.blue;
        zIndexOffset = 10000;
      }
      if (tags.includes("event")) {
        className = pinColor.red;
        zIndexOffset = 10000;
      }
      return { ...row, className, zIndexOffset };
    });
    pins.push({ name: team.name, pins: teamMap });
    // データ返却
    return { pins, error: null };
  } catch (error) {
    console.error("🔥", error);
    return { pins: null, error: "データベース接続に失敗しました" };
  } finally {
    await db.end().catch((e) => console.error("⚠️", e));
  }
}

export default function Index({ loaderData }: { loaderData: loaderData }) {
  const { pins, error } = loaderData;
  if (error) return <ErrorBoundary />

  // クライアントでのみ Leaflet を読み込む
  const [RedClient, setRedClient] = useState<React.FC<any> | null>(null);
  useEffect(() => {
    import("./Map").then((mod) => {
      setRedClient(() => mod.default);
    });
  }, []);

  return (
    <main>
      {RedClient ? (
        <Suspense fallback={<Loading />}>
          <Await resolve={pins}>
            <RedClient pins={pins} />
          </Await>
        </Suspense>
      ) : (
        <Loading />
      )}
    </main>
  );
}

function Loading() {
  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-8 border-red-600 border-t-gray-600" />
    </div>
  );
}

export function ErrorBoundary() {
  return (
    <main className="text-white">
      <section className="h-screen flex flex-col justify-center items-center text-center">
        <HumanDinosaur size={200} mood="sad" color="#ffb3ba" />
        <h1 className="text-7xl tracking-tight font-extrabold text-indigo-400 ">
          Oops!
        </h1>
        <h2 className="text-3xl tracking-tight font-bold  mt-4">
          なにかがおかしいようです……
        </h2>
      </section>
    </main>
  );
}
