export function ipMatches(ip: string): boolean {
  // 開発環境
  const isDev = import.meta.env.MODE === "development";
  // 環境変数から許可されたIP一覧を読み込む（例: 127.0.0.1,192.168.1.*）
  const allowedIpsStr = import.meta.env.VITE_ALLOWED_IPS;
  const allowedIps = (allowedIpsStr || "").split(",");
  const isIncludes = allowedIps.includes(ip);
  console.log("👘 - ipFilter.ts - ipMatches - ip:", ip);
  console.log('👘 - ipFilter.ts - ipMatches - allowedIps:', allowedIps);
  if (isDev) return true;
  if (isIncludes) return true;
  return false;
}
