import type { Route } from "./+types/api";

import pkg from "pg";
const { Client } = pkg;
const options = {
  user: import.meta.env.VITE_DB_USER,
  host: import.meta.env.VITE_DB_HOST,
  port: import.meta.env.VITE_DB_PORT,
  database: import.meta.env.VITE_DB_NAME,
  password: import.meta.env.VITE_DB_PASS,
};

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

export async function loader({ request }: Route.LoaderArgs) {
  // パラメータを取得
  const url = new URL(request.url);
  // teamを取得
  const teamParam = url.searchParams.get("team");

  const db = new Client(options);
  try {
    await db.connect();
    // パラメータからteam情報を取得
    const red_team = await db.query(
      `SELECT * FROM red_team WHERE is_public = true ORDER BY id;`
    );
    const red_team_rows = red_team.rows;
    const red_team_row = red_team_rows.find(
      (red_team_row) => red_team_row.key === teamParam
    );
    // map情報を取得
    const red_map = await db.query(
      `SELECT * FROM red_map WHERE is_public = true ORDER BY id;`
    );
    const red_map_rows = red_map.rows;
    await db.end();
    // 処理
    const result = red_map_rows
      .map((row) => {
        const { lat, lng, content, team_ids, member_ids, rulebook_ids, tags } =
          row;
        const hasTeamParam = team_ids.includes(red_team_row?.id);
        const hasRulebook = rulebook_ids.length;
        // teamParamではない かつ rulebookではない 場合はnullを返す
        if (!hasTeamParam && !hasRulebook) return null;
        // className と zIndexOffset を指定（zIndexOffsetはピンの数によって変わるので注意）
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
        return { lat, lng, content, className, zIndexOffset };
      })
      .filter(Boolean);
    return new Response(JSON.stringify({ pins: result, error: null }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("🔥", error);
    return new Response(
      JSON.stringify({ pins: null, error: "データベース接続に失敗しました" }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } finally {
    await db.end().catch((e) => {
      console.error("⚠️", e);
      return new Response(
        JSON.stringify({
          pins: null,
          error: "データベースの切断に失敗しました",
        }),
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    });
  }
}
