import type { Route } from "./+types/index";
import Error from "~/components/error";
import Map from "~/features/map-view";
import { loadMapData } from "~/features/map-view/map-loader";

export function meta() {
  const title = ["Edit", "Cyberpunk RED Map"].filter(Boolean).join(" - ");
  return [{ title }];
}

export async function loader({ request }: Route.LoaderArgs) {
  return loadMapData({
    request,
    rpcName: "get_team_pins",
  });
}

export default function Index({ loaderData }: Route.ComponentProps) {
  const { data, error } = loaderData;
  if (error || data == null) return <ErrorBoundary />;
  return <Map system="red" pins={data} dev={true} />;
}

export function ErrorBoundary() {
  console.log("routes/edit/index.tsx");
  return <Error />;
}
