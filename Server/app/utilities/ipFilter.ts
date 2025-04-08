// 開発環境
const isDev = import.meta.env.MODE === "development";

// 環境変数から許可されたIP一覧を読み込む（例: 127.0.0.1,192.168.1.*）
const allowedIpsStr = import.meta.env.VITE_ALLOWED_IPS;
const allowedIps = (allowedIpsStr || "").split(",");

export function ipMatches(ip: string): boolean {
  const isIncludes = allowedIps.includes(ip);
  if (isDev) return true;
  if (isIncludes) return true;
  return false;
}
