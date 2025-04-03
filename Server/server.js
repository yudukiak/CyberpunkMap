import express from "express";
import https from "https";
import fs from "fs";
import path from "path";
import { createRequestHandler } from "@react-router/express";
import { WebSocketServer } from "ws";
import pkg from "pg";
import 'dotenv/config';

const app = express();
const IS_DEV = process.env.MODE === "development";
const PORT = process.env.SERVER_PORT;

// PostgreSQL 接続
const db = new pkg.Client({
  host: process.env.VITE_DB_HOST,
  port: Number(process.env.VITE_DB_PORT),
  user: process.env.VITE_DB_USER,
  password: process.env.VITE_DB_PASS,
  database: process.env.VITE_DB_NAME,
});

await db.connect();
await db.query("LISTEN map_red_update");
console.log("📡 PostgreSQL LISTEN 開始");

// WebSocket サーバー（開発: ポート単独 / 本番: HTTPS にバインド）
let server;
let wss;

if (IS_DEV) {
  wss = new WebSocketServer({ port: PORT });
  console.log(`🧪 開発モード → WebSocket専用ポート ws://localhost:${PORT}`);
} else {
  const getCertPath = (filename) => path.join("certs", filename);
  const sslOptions = {
    key: fs.readFileSync(getCertPath("key.pem")),
    cert: fs.readFileSync(getCertPath("cert.pem")),
  };
  server = https.createServer(sslOptions, app);
  wss = new WebSocketServer({ server });
  console.log("🔐 本番モード → HTTPS + WSS 対応");
}

db.on("notification", (msg) => {
  if (msg.channel === "map_red_update") {
    console.log("🔔 map_red_update 通知受信 → クライアントに通知");
    wss.clients.forEach((client) => {
      if (client.readyState === client.OPEN) {
        client.send("map_red_updated");
      }
    });
  }
});

if (!IS_DEV) {
  // 👀 ビルドファイル存在チェック
  const buildPath = "./build/server/index.js";
  if (!fs.existsSync(buildPath)) {
    console.error("❌ build/server/index.js が存在しません");
    process.exit(1);
  }

  // 💾 React Router のビルドを安全に import
  let build;
  try {
    build = await import(buildPath);
    build = build.default ?? build;
  } catch (err) {
    console.error("❌ build/server/index.js が読み込めません", err);
    process.exit(1);
  }

  console.log("📦 React Router Build Routes:", build.routes);
  app.use(express.static("build/client"));
  app.all(/.*/, async (req, res, next) => {
    try {
      return createRequestHandler({ build })(req, res, next);
    } catch (err) {
      console.error("❌ SSRハンドラー内でエラー発生:", err);
      next(err);
    }
  });

  server.listen(PORT, () => {
    const domain = process.env.SERVER_DOMAIN || "localhost";
    console.log(`✅ HTTPSサーバー起動中 → https://${domain}:${PORT}`);
    console.log(`🌐 WebSocket → wss://${domain}:${PORT}`);
  });
} else {
  console.log(`✅ WebSocket専用モード起動 → ws://localhost:${PORT}`);
}
