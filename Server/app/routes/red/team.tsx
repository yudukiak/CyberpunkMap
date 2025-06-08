import type { Route } from "./+types/team";
import { decoratePins } from "~/lib/decorate-pins";
import { createClient } from "~/lib/supabase";
import Error from "~/components/error";
import Map from "~/components/map";

export function meta({ data }: Route.MetaArgs) {
  const title = [data.title, "Cyberpunk RED Map"].filter(Boolean).join(" - ");
  return [
    { title },
  ];
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const { teamId } = params;
  const { supabase } = createClient(request, "public");
  const { data, error } = await supabase.rpc("get_team_pins", {
    team_ids: ["rulebook", teamId],
  });
  if (error || data == null) return { data: null, error: "データベース接続に失敗しました" };
  const title = data.find((item: any) => item.team_id === teamId)?.name ?? "";
  const decoratedPins = decoratePins(data);
  return { data: decoratedPins, title, error: null };
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
