import type { Route } from "./+types/red";
import type { MapClientProps } from "types/map";
import { lazy, Suspense } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Cyberpunk RED Map" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function clientLoader() {
  const res = await fetch("/api");
  const data = await res.json();
  return data;
}

const RedClient = lazy(() => import("./RedClient"));

export default function Red({ loaderData }: MapClientProps) {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-8 border-red-600 border-t-gray-600" />
        </div>
      }
    >
      <RedClient loaderData={loaderData} />
    </Suspense>
  );
}
