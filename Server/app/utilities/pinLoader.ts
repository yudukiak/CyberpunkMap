import pkg from "pg";

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

function getDbOptions() {
  return {
    user: import.meta.env.VITE_DB_USER,
    host: import.meta.env.VITE_DB_HOST,
    port: import.meta.env.VITE_DB_PORT,
    database: import.meta.env.VITE_DB_NAME,
    password: import.meta.env.VITE_DB_PASS,
  };
}

export async function fetchRulebookPins(db: pkg.Client) {
  // rulebook_idsがあるmap情報を取得
  const res = await db.query(`
    SELECT lat, lng, content, tags
    FROM red_map
    WHERE is_public = true AND cardinality(rulebook_ids) > 0;
  `);
  return res.rows.map((row) => ({
    ...row,
    className: pinColor.gray,
  }));
}

export async function fetchTeamPins(db: pkg.Client, key: string) {
  // team情報を取得
  const teamRes = await db.query(
    `SELECT id, name FROM red_team WHERE is_public = true AND key = $1 LIMIT 1;`,
    [key]
  );
  const team = teamRes.rows[0];
  if (!team) return null;
  // team.idからmap情報を取得
  const mapRes = await db.query(
    `SELECT lat, lng, content, tags FROM red_map WHERE is_public = true AND $1 = ANY(team_ids);`,
    [team.id]
  );
  // 返却用データを作成
  const pins = mapRes.rows.map((row) => {
    let className = pinColor.gray;
    let zIndexOffset = 0;
    if (row.tags.includes("location")) {
      className = pinColor.blue;
      zIndexOffset = 10000;
    }
    if (row.tags.includes("event")) {
      className = pinColor.red;
      zIndexOffset = 10000;
    }
    return { ...row, className, zIndexOffset };
  });
  // 返却
  return { name: team.name, pins };
}

export async function connectDb() {
  const db = new pkg.Client(getDbOptions());
  await db.connect();
  return db;
}
