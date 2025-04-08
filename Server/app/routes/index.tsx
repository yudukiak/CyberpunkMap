import type { Route } from "./+types/index";
import { redirect } from "react-router";

export async function loader() {
  return redirect("/red");
}

export default function Index() {
  return <div></div>;
}
