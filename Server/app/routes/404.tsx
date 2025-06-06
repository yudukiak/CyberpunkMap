import type { Route } from "./+types/404";
import { redirect } from "react-router";
import Error from "~/components/error";

export async function loader() {
  return redirect("/red");
}

export default function NotFound() {
  return <div></div>;
}

export function ErrorBoundary() {
  return <Error />;
}