import type { Route } from "./+types/index";
import { redirect } from "react-router";
import Error from "~/components/error";

export function meta() {
  const title = ["Cyberpunk RED Map"].filter(Boolean).join(" - ");
  return [
    { title },
  ];
}

export async function loader() {
  return redirect("/red");
}

export default function Index() {
  return <div></div>;
}

export function ErrorBoundary() {
  return <Error />;
}