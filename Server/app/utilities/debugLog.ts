const isBrowser = typeof window !== "undefined";

export function isDevelopment() {
  if (import.meta.env.MODE === "development") return true;
  if (isBrowser) return /[?&]development=true/.test(window.location.search);
  return false;
}

export function debugLog(...args: any[]) {
  const isDev = isDevelopment();
  if (isDev) console.log(...args);
}
