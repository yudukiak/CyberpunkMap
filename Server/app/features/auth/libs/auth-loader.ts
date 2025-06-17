import { redirect } from "react-router";
import { AUTH_PARAM } from "~/config/server";

export async function checkAuthKey(request: Request) {
  const url = new URL(request.url);
  const key = url.searchParams.get("key");
  if (key !== AUTH_PARAM) return redirect("/");
  return key;
} 