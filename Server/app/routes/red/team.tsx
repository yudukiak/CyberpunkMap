import type { Route } from "./+types/team";
import Error from "~/components/error";
import Map from "~/features/map-view";
import { loadMapData } from "~/features/map-view/map-loader";

export function meta({ data }: Route.MetaArgs) {
  const title = [data.title, "Cyberpunk RED Map"].filter(Boolean).join(" - ");
  return [{ title }];
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const { teamId } = params;
  const result = await loadMapData({
    request,
    teamIds: ["rulebook", teamId],
    rpcName: "get_team_pins",
  });
  const { data, error } = result;
  if (error || data == null) return { error: "データベース接続に失敗しました" };
  const title = data.find((item: any) => item.team_id === teamId)?.name ?? "";
  return { data, title };
}

export default function Index({ loaderData }: Route.ComponentProps) {
  const { data, error } = loaderData;
  if (error || data == null) return <ErrorBoundary />;
  return (
    <main className="h-dvh w-dvw">
      <Map system="red" pins={data} />
    </main>
  );
}

export function ErrorBoundary() {
  return <Error />;
}
