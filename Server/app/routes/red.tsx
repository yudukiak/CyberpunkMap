import type { Route } from "./+types/red";
import type { MapClientProps } from "types/map";
import { lazy, Suspense } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Cyberpunk RED Map" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function clientLoader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const search = url.search;
  const res = await fetch(`/api${search}`);
  const data = await res.json();
  return data;
}

const RedClient = lazy(() => import("./RedClient"));

export default function Red({ loaderData }: MapClientProps) {
  const { pins } = loaderData;

  /*
  const AVAILABLE_COLORS = [
    "blue",
    "indigo",
    "violet",
    "pink",
    "red",
    "orange",
    "amber",
    "yellow",
    "lime",
    "green",
    "teal",
    "cyan",
    "gray",
  ];
  const [pinColorState, setPinColorState] = useState<Record<string, boolean>>(
    Object.fromEntries(AVAILABLE_COLORS.map((c) => [c, true]))
  );

  const activeColors = Object.entries(pinColorState)
    .filter(([_, isActive]) => isActive)
    .map(([color]) => color);

  const filteredPins = activeColors.length
    ? pins.filter((pin) => {
        const color = pin.pin_color ?? "blue";
        return activeColors.includes(color);
      })
    : pins;
  */

  return (
    <main>
      <Suspense
        fallback={
          <div className="h-screen w-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-8 border-red-600 border-t-gray-600" />
          </div>
        }
      >
        {/*<Search colorState={pinColorState} setColorState={setPinColorState} />*/}
        <RedClient pins={pins} />
      </Suspense>
    </main>
  );
}
