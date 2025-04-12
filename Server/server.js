import express from "express";
import https from "https";
import http from "http";
import fs from "fs";
import path from "path";
import { createRequestHandler } from "@react-router/express";
import { WebSocketServer } from "ws";
import pkg from "pg";
import geoip from "geoip-lite";
import 'dotenv/config';

const app = express();
const isWindows = process.platform === 'win32';
const isDev = process.env.MODE === "development";
const PORT = process.env.VITE_SERVER_PORT;

// WebSocket サーバー（開発: ポート単独 / 本番: HTTPS にバインド）
let server;
let wss;

// 開発モード
if (isDev) {
  wss = new WebSocketServer({ port: PORT });
  console.log(`🧪 開発モード: WebSocket(ws)起動 ws://localhost:${PORT}`);
}
// 本番モード & Windows
else if (isWindows) {
  server = http.createServer(app);
  console.log("💻 Windows環境: HTTPサーバー起動");
  wss = new WebSocketServer({ server });
  console.log(`💻 Windows環境: WebSocket(ws)起動 ws://localhost:${PORT}`);
}
// 本番モード & Raspberry Pi
else {
  function getCertPath(filename) {
    const basePath = path.join('/etc', 'letsencrypt', 'live', process.env.SERVER_DOMAIN);
    return path.join(basePath, filename);
  }
  const sslOptions = {
    key: fs.readFileSync(getCertPath('privkey.pem')),
    cert: fs.readFileSync(getCertPath('fullchain.pem')),
  };
  server = https.createServer(sslOptions, app);
  console.log("🔐 本番モード: HTTPSサーバー起動");
  wss = new WebSocketServer({ server });
  console.log("🔐 本番モード: WebSocket(wss)起動");
}

// PostgreSQL 接続
const db = new pkg.Client({
  host: process.env.VITE_DB_HOST,
  port: Number(process.env.VITE_DB_PORT),
  user: process.env.VITE_DB_USER,
  password: process.env.VITE_DB_PASS,
  database: process.env.VITE_DB_NAME,
});
await db.connect();
await db.query("LISTEN red_map_update");
console.log("📡 PostgreSQL LISTEN 開始");
// 通知受信時に WebSocket 経由でクライアントに送信
db.on("notification", (msg) => {
  if (msg.channel === "red_map_update") {
    console.log("🔔 red_map_update 通知受信 → クライアントに通知");
    wss.clients.forEach((client) => {
      if (client.readyState === client.OPEN) {
        // クライアント側のイベント名
        client.send("red_map_updated");
      }
    });
  }
});

// WebSocket 接続管理（ping/pong）
wss.on("connection", (ws) => {
  ws.isAlive = true;
  ws.on("pong", () => ws.isAlive = true);
  ws.on("message", (msg) => console.log("📨 WebSocketメッセージ:", msg.toString()));
});
// WebSocketが切断するため30秒ごとにping送信
setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) return ws.terminate();
    ws.isAlive = false;
    ws.ping();
    // 明示的なメッセージ送信
    if (ws.readyState === ws.OPEN) {
      ws.send("keepalive");
    }
  });
}, 30 * 1000);

// devモードでは、WebSocketサーバーを単独で起動
if (isDev) {
  console.log(`✅ WebSocket専用モード起動 → ws://localhost:${PORT}`);
}
// 本番モードではサーバーを起動
else {
  console.log("👀 ビルドファイル存在チェック")
  const buildPath = "./build/server/index.js";
  if (!fs.existsSync(buildPath)) {
    console.error("❌ build/server/index.js が存在しません");
    process.exit(1);
  }
  console.log("💾 React Router のビルドを安全に import");
  let build;
  try {
    build = await import(buildPath);
  } catch (err) {
    console.error("❌ build/server/index.js が読み込めません", err);
    process.exit(1);
  }

  // ① Express設定
  app.set('trust proxy', true);
  // ② 静的ファイル
  app.use(express.static("build/client"));
  app.use(express.static("public"));
  // 日本以外をブロックするミドルウェアを追加
  let reqHeadersIP = "";
  let reqIp = "";
  let country = "";
  app.use(async (req, res, next) => {
    reqHeadersIP = req.headers['cf-connecting-ip'];
    reqIp = req.ip;
    const ip = reqHeadersIP || reqIp;
    // 許可IP
    const allowedIpsStr = process.env.VITE_ALLOWED_IPS;
    const allowedIps = (allowedIpsStr || "").split(",");
    const isIncludesIp = allowedIps.includes(ip);
    // 許可IP以外は国判定
    if (!isIncludesIp) {
      const geo = geoip.lookup(ip);
      country = geo ? geo.country : 'UNKNOWN';
      try {
        await db.query(
          `
          INSERT INTO access_logs (ip, country, last_access, access_count)
          VALUES ($1, $2, CURRENT_TIMESTAMP, 1)
          ON CONFLICT (ip) DO UPDATE SET
            country = EXCLUDED.country,
            last_access = CURRENT_TIMESTAMP,
            access_count = access_logs.access_count + 1;
          `,
          [ip, country]
        );
      } catch (err) {
        console.error("❌ アクセスログ記録エラー:", err);
      }
      if (geo.country !== 'JP') {
        console.log(`🚫 アクセス拒否\n🌏国: ${country}\n🌐IP: ${reqHeadersIP} / ${reqIp}`);
        return res.status(403).send('アクセスが禁止されています');
      }
    }
    next();
  });
  app.all(/.*/, async (req, res, next) => {
    console.log(`🟢 アクセス許可\n🌏国: ${country}\n🌐IP: ${reqHeadersIP} / ${reqIp}`);
    try {
      return createRequestHandler({
        build,
        getLoadContext() {
          return { ip };
        },
      })(req, res, next);
    } catch (err) {
      console.error("❌ SSRハンドラー内でエラー発生:", err);
      next(err);
    }
  });

  // 🚀 サーバー起動
  if (isWindows) {
    // Windows は HTTP
    server.listen(PORT, () => {
      console.log(`🚀 HTTPサーバー起動中 → http://localhost:${PORT}`);
    });
  } else {
    // Raspberry Pi は HTTPS
    server.listen(PORT, () => {
      const domain = process.env.SERVER_DOMAIN || "localhost";
      console.log(`✅ HTTPSサーバー起動中 → https://${domain}:${PORT}`);
      console.log(`🌐 WebSocket → wss://${domain}:${PORT}`);
    });
  }
}
