import type { Route } from "./+types/index";
import { decoratePins } from "~/lib/decorate-pins";
import { createClient } from "~/lib/supabase";
import Error from "~/components/error";
import Map from "~/components/map";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Cyberpunk RED Map" },
  ];
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const teamId = "rulebook";
  const { supabase } = createClient(request, "public");
  const { data, error } = await supabase.rpc("get_team_pins", {
    team_ids: [teamId],
  });
  if (error) return { data: null, error: "データベース接続に失敗しました" };
  const decoratedPins = decoratePins(data);
  return { data: decoratedPins, error: null };
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
