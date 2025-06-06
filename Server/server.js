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
          return;
        }
        // マップの移動または更新通知が来た場合、team_idを対象に送信
        if (json.type === "moveMapCenter" || json.type === "updateMap") {
          const targetTeamId = json.team_id;
          const isRulebook = targetTeamId === "rulebook"; // チームIDが「rulebook」
          wss.clients.forEach((client) => {
            const route = clientRoutes.get(client) || "";
            const isEdit = route.startsWith("/edit"); // 編集ページ
            const isRedSubPage = route.startsWith("/red/") && route !== "/red/"; // サブページ
            const isRedTeam = route.startsWith(`/red/${targetTeamId}`); // チームページ
            const isTarget =
              // ルールブック以外は チームページ もしくは 編集ページ を対象とする
              (!isRulebook && (isRedTeam || isEdit)) ||
              // ルールブックは サブページ もしくは 編集ページ を対象とする
              (isRulebook && (isRedSubPage || isEdit));
            if (isTarget && client.readyState === WebSocket.OPEN) {
              console.log("📩 WebSocket送信: ", messageString);
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
