import type { Route } from "./+types/index";
import { ipMatches } from "~/utilities/ipFilter";
import { redirect } from "react-router";
import pkg from "pg";
import { type Payment, columns } from "./columns";
import { DataTable } from "./data-table";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Cyberpunk RED Map" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function loader({ request, context }: Route.LoaderArgs) {
  const ip = context?.ip as string;
  const isAdmin = ipMatches(ip);
  if (!isAdmin) return redirect("/");
  const { Client } = pkg;
  const options = {
    user: import.meta.env.VITE_DB_USER,
    host: import.meta.env.VITE_DB_HOST,
    port: import.meta.env.VITE_DB_PORT,
    database: import.meta.env.VITE_DB_NAME,
    password: import.meta.env.VITE_DB_PASS,
  };
  // DB接続
  const db = new Client(options);
  try {
    await db.connect();
    const { rows } = await db.query(`SELECT * FROM red_map ORDER BY id;`);
    // データ返却
    return { rows, error: null };
  } catch (error) {
    console.error("🔥", error);
    return { rows: null, error: "データベース接続に失敗しました" };
  } finally {
    await db.end().catch((e) => console.error("⚠️", e));
  }
}

export default function Index({ loaderData }: Route.ComponentProps) {
  console.log("👘 - index.tsx - Index - loaderData:", loaderData);
  const { rows, error } = loaderData;
  return (
    <main>
      <DataTable columns={columns} data={rows as Payment[]} />
    </main>
  );
}
