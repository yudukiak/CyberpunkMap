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

export async function loader({ params }: Route.LoaderArgs) {
  const db = new Client(options);
  try {
    await db.connect();
    const result = await db.query(`
      SELECT lat, lng, content, pin_color
      FROM red_map
      WHERE is_public IS NOT FALSE -- 非公開ピンを除外するルール
      ORDER BY id
    `);
    await db.end();
    return new Response(JSON.stringify({ pins: result.rows, error: null }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("🔥", error);
    return new Response(JSON.stringify({ pins: null, error: "データベース接続に失敗しました" }), {
      headers: { "Content-Type": "application/json" },
    });
  } finally {
    await db.end().catch((e) => {
      console.error("⚠️", e);
      return new Response(JSON.stringify({ pins: null, error: "データベースの切断に失敗しました" }), {
        headers: { "Content-Type": "application/json" },
      });
    });
  }
}