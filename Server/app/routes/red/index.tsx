import type { Route } from "./+types/index";
import Error from "~/components/error";
import Map from "~/features/map-view";
import { loadMapData } from "~/features/map-view/map-loader";

export function meta() {
  return [{ title: "Cyberpunk RED Map" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  return loadMapData({
    request,
    teamIds: ["rulebook"],
    rpcName: "get_team_pins",
  });
}

export default function Index({ loaderData }: Route.ComponentProps) {
  const { data, error } = loaderData;
  if (error || data == null) return <ErrorBoundary />;
  return (
    <main className="h-dvh w-dvw">
      <Map pins={data} />
    </main>
  );
}

export function ErrorBoundary() {
  return <Error />;
}
