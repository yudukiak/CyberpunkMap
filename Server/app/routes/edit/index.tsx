import type { Route } from "./+types/index";
import { decoratePins } from "~/lib/decorate-pins";
import { createClient } from "~/lib/supabase";
import Error from "~/components/error";
import Map from "~/components/map";

export async function loader({ request }: Route.LoaderArgs) {
  const { supabase } = createClient(request, "public");
  const { data, error } = await supabase.rpc("get_all_team_pins");
  if (error) return { data: null, error: "データベース接続に失敗しました" };
  const decoratedPins = decoratePins(data);
  return { data: decoratedPins, error: null };
}

export default function Index({ loaderData }: Route.ComponentProps) {
  const { data, error } = loaderData;
  if (error || data == null) return <ErrorBoundary />;
  return <Map pins={data} dev={true} />;
}

export function ErrorBoundary() {
  return <Error />;
}
