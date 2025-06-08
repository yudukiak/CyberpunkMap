import express from "express";
import { createRequestHandler } from "@react-router/express";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import fs from "fs";
import 'dotenv/config';

//const __filename = fileURLToPath(import.meta.url);
//const __dirname = path.dirname(__filename);
// 各クライアントの「現在のパス」を記憶する Map
const clientRoutes = new Map();
// moveMapCenterのデータを保存するMap
const moveMapCenterData = new Map();

// WebSocketの共通ロジック
function setupWebSocketServer(server, port) {
  const wss = new WebSocketServer({ server, path: "/ws" });
  wss.on("connection", (ws) => {
    console.log("🔌 WebSocketクライアント接続");
    ws.on("message", (message) => {
      const messageString = message.toString();
      console.log("📩 WebSocket受信: ", messageString);
      //console.log("📦 保存済みのclientRoutes", clientRoutes) // ws: path
      console.log("📦 保存済みのmoveMapCenterData", moveMapCenterData) // path: json
      try {
        const json = JSON.parse(messageString);
        // 👣 クライアントから初回に「ルート通知」された場合
        if (json.type === "initRoute" && typeof json.route === "string") {
          // clientRoutesに ws: /red/miscrunners を保存
          clientRoutes.set(ws, json.route);
          // moveMapCenterDataが空の時 かつ pathが /red/ でない時 のみ /red/miscrunners: "" を保存
          if (!moveMapCenterData.has(json.route) && json.route !== "/red") {
            moveMapCenterData.set(json.route, "{}");
          }
          // routeとpathが一致する場合、moveMapCenterDataを送信
          const route = clientRoutes.get(ws) || "";
          const isRedTeam = route === json.route;
          const newMessageString = moveMapCenterData.get(route);
          console.log("📦 保存済みのnewMessageString", newMessageString)
          if (newMessageString) {
            const isEmpty = newMessageString === "{}";
            console.log('isEmpty:', isEmpty)
            const newMessage = JSON.parse(newMessageString);
            // 1時間を経過したものは送信しない
            const hasDate = !!newMessage.date;
            console.log('hasDate:', hasDate)
            const isInTime = hasDate ? new Date(newMessage.date) >= new Date(Date.now() - 1 * 60 * 60 * 1000) : false;
            console.log('🧷 チームのページ？', isRedTeam)
            console.log('⏰ 期限内？', isInTime)
            if (isRedTeam && isInTime) {
              console.log("📩 WebSocket送信: ", newMessageString)
              ws.send(newMessageString);
            }
          }
          return;
        }
        // moveMapCenterのデータを保存
        if (json.type === "moveMapCenter") {
          // typeを変えておく
          const newMessage = {
            ...json,
            type: "getMoveMapCenter",
          }
          const newMessageString = JSON.stringify(newMessage);
          const targetPath = json.path;
          const isRulebook = targetPath === "/red/rulebook";
          // ルールブックの時は全valueを書き換え
          if (isRulebook) {
            for (const [key] of moveMapCenterData.entries()) {
              moveMapCenterData.set(key, newMessageString);
            }
          } else {
            moveMapCenterData.set(json.path, newMessageString);
          }
        }
        // マップの移動または更新通知が来た場合、team_idを対象に送信
        if (json.type === "moveMapCenter" || json.type === "updateMap") {
          const targetPath = json.path;
          const isRulebook = targetPath === "/red/rulebook";
          wss.clients.forEach((client) => {
            const route = clientRoutes.get(client) || "";
            // チームページには送信
            if (route === targetPath) {
              client.send(messageString);
            }
            // ルールブックの時は全てのチームページに送信
            if (isRulebook && /^\/red\/[a-zA-Z0-9]+$/.test(route)) {
              client.send(messageString);
            }
            // 編集ページは全て送信
            if (route.startsWith("/edit")) {
              client.send(messageString);
            }
          });
          return;
        }
      } catch (error) {
        console.error("❌ JSON parse error: ", error);
      }
    });
    ws.on("close", () => {
      console.log("❎ WebSocket切断");
    });
  });
  server.listen(port, () => {
    console.log(`🔌 WebSocket server started on ws://localhost:${port}/ws`);
  });
}

if (process.env.NODE_ENV === "development") {
  // WebSocketサーバーのみ起動
  const port = process.env.VITE_DEV_WS_PORT;
  const server = createServer();
  setupWebSocketServer(server, port);
} else {
  // 本番等はExpress+WebSocketサーバーを起動
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
  const app = express();
  app.set('trust proxy', true);
  // ② 静的ファイル
  app.use(express.static("build/client"));
  app.use(express.static("public"));

  app.all(/.*/, async (req, res, next) => {
    try {
      return createRequestHandler({ build })(req, res, next);
    } catch (err) {
      console.error("❌ SSRハンドラー内でエラー発生:", err);
      next(err);
    }
  });

  const port = process.env.PORT || process.env.VITE_SERVER_PORT;
  const server = createServer(app);
  setupWebSocketServer(server, port);
}
