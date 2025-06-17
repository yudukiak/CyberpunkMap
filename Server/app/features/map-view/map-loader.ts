import { createClient } from "~/lib/supabase";
import { decoratePins } from "~/lib/decorate-pins";

type LoaderArgs = {
  request: Request;
  rpcName: "get_team_pins";
  teamIds?: string[];
};

export async function loadMapData({ request, rpcName, teamIds }: LoaderArgs) {
  const { supabase } = createClient(request, "public");
  const { data, error } = await supabase.rpc(
    rpcName,
    teamIds ? { team_ids: teamIds } : undefined
  );
  if (error || data == null) return { error: "データベース接続に失敗しました" };
  const decoratedPins = decoratePins(data);
  return { data: decoratedPins };
}
