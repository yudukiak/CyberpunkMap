import express from "express";
import { createRequestHandler } from "@react-router/express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === ws.OPEN) {
          console.log("📩 WebSocket送信: ", messageString);
          client.send(messageString);
        }
      });
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
