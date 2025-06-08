import { isDev, DEV_WS_PORT, SERVER_PORT } from "~/config/vite";

export function getWebsocketUrl() {
  const isHttp = window.location.protocol === "http:";
  const wsUrl = 
    isDev ? `ws://${window.location.hostname}:${DEV_WS_PORT}/ws` : 
    isHttp ? `ws://${window.location.hostname}:${SERVER_PORT}/ws` :
    `wss://${window.location.hostname}/ws`;
  return wsUrl;
}