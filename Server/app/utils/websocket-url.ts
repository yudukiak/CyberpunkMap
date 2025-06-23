import { isDev, DEV_WS_PORT, DEV_SV_PORT } from "~/config/client";

export function getWebsocketUrl() {
  const isHttp = window.location.protocol === "http:";
  const wsUrl = 
    isDev ? `ws://${window.location.hostname}:${DEV_WS_PORT}/ws` : 
    isHttp ? `ws://${window.location.hostname}:${DEV_SV_PORT}/ws` :
    `wss://${window.location.hostname}/ws`;
  return wsUrl;
}