import express from "express";
import { createRequestHandler } from "@react-router/express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// 各クライアントの「現在のパス」を記憶する Map
const clientRoutes = new Map();
// moveMapCenterのデータを保存するMap
const moveMapCenterData = new Map();

if (process.env.NODE_ENV === "development") {
  // WebSocketサーバーのみ起動
  const port = process.env.VITE_DEV_WS_PORT;
  const server = createServer();
  const wss = new WebSocketServer({ server, path: "/ws" });
  wss.on("connection", (ws) => {
    console.log("🔌 WebSocketクライアント接続");
    ws.on("message", (message) => {
      const messageString = message.toString();
      console.log("📩 WebSocket受信: ", messageString);
      try {
        const json = JSON.parse(messageString);
        // 👣 クライアントから初回に「ルート通知」された場合
        if (json.type === "initRoute" && typeof json.route === "string") {
          clientRoutes.set(ws, json.route); // ← 例: /red/miscrunners
          // routeとpathが一致する場合、moveMapCenterDataを送信
          console.log("📦 保存済みのmoveMapCenterData", moveMapCenterData)
          const route = clientRoutes.get(ws) || "";
          const isRedTeam = route === json.route;
          const newMessageString = moveMapCenterData.get(route);
          console.log("📦 保存済みのnewMessageString", newMessageString)
          if (newMessageString) {
            const newMessage = JSON.parse(newMessageString);
            // 1時間を経過したものは送信しない
            const isExpired = newMessage && new Date(newMessage.date) < new Date(Date.now() - 1 * 60 * 60 * 1000);
            console.log('🧷 チームのページ？', isRedTeam)
            console.log('⏰ 期限切れてる？', isExpired)
            if (isRedTeam && !isExpired) {
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
} else {
  // 本番等はExpress+WebSocketサーバーを起動
  const BUILD_DIR = path.resolve(__dirname, "./build/server/index.js");
  const build = await import(BUILD_DIR);

  const app = express();
  app.use(express.static(path.resolve(__dirname, "build/client")));
  app.all("*", createRequestHandler({ build }));

  const port = process.env.VITE_SERVER_PORT;
  const server = createServer(app);
  const wss = new WebSocketServer({ server, path: "/ws" });
  wss.on("connection", (ws) => {
    console.log("🔌 WebSocketクライアント接続");
    ws.on("message", (message) => {
      console.log("📩 WebSocket受信: ", message.toString());
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === ws.OPEN) {
          client.send(message);
        }
      });
    });
    ws.on("close", () => {
      console.log("❎ WebSocket切断");
    });
  });
  server.listen(port, () => {
    console.log(`🚀 Server started on http://localhost:${port}`);
    console.log(`🔌 WebSocket server started on ws://localhost:${port}/ws`);
  });
}
