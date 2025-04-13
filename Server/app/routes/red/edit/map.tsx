import type { Route } from "./+types/index";
import type { LoaderData } from "types/edit";
import pkg from "pg";
import Error from "~/views/Error";

import { DataTable } from "./DataTable";
import { mapColumns } from "./MapColums";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "マップ編集 - Cyberpunk RED Map" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function loader({ request, context }: Route.LoaderArgs) {
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
    const teamRes = await db.query(`SELECT * FROM red_team ORDER BY id;`);
    const redMapRes = await db.query(`SELECT * FROM red_map ORDER BY id;`);
    // データ返却
    return {
      team: teamRes.rows,
      redMap: redMapRes.rows,
      error: null,
    };
  } catch (error) {
    console.error("🔥", error);
    return {
      team: null,
      redMap: null,
      error: "データベース接続に失敗しました",
    };
  } finally {
    await db.end().catch((e) => console.error("⚠️", e));
  }
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  console.log("👘 - map.tsx - action - formData:", formData);
}

export default function Index({ loaderData }: { loaderData: LoaderData }) {
  const { team, redMap, error } = loaderData;
  if (error) return <ErrorBoundary />;
  return (
    <div className="p-4">
      <DataTable columns={mapColumns} data={redMap} />
    </div>
  );
}

export function ErrorBoundary() {
  return <Error />;
}
