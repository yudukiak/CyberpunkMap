import type { Route } from "./+types/map-edit";
import type { RedTeam, RedMap, RedTag } from "types/edit";
import { MODE, DEV_WS_PORT, SERVER_PORT } from "~/config/vite";
import { useEffect } from "react";
import { useFetcher, useNavigate, redirect } from "react-router";
import { decoratePins } from "~/lib/decorate-pins";
import { createClient } from "~/lib/supabase";
import { getWebsocketUrl } from "~/lib/websocket-url";
import Error from "~/components/error";
import Loading from "~/components/loading";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import * as v from "valibot";

export function meta({ data }: Route.MetaArgs) {
  const { map } = data;
  if (map == null) return { title: "Edit Map - Cyberpunk RED Map" };
  const { content } = map[0];
  const firstLine = content.split("\n")[0];
  const title = [firstLine, "Cyberpunk RED Map"].filter(Boolean).join(" - ");
  return [
    { title },
  ];
}

const formSchema = v.object({
  id: v.number(),
  short_id: v.string(),
  lat: v.number(),
  lng: v.number(),
  content: v.string(),
  is_public: v.boolean(),
  team_id: v.string(),
  tag_id: v.string(),
});

export async function action({ request }: Route.ActionArgs) {
  const { supabase } = createClient(request, "public");
  const formData = await request.formData();
  const formFields = {
    id: Number(formData.get("id") ?? 0),
    short_id: String(formData.get("short_id") ?? ""),
    lat: Number(formData.get("lat") ?? 0),
    lng: Number(formData.get("lng") ?? 0),
    content: String(formData.get("content") ?? ""),
    is_public: formData.get("is_public") === "on",
    team_id: String(formData.get("team_id") ?? ""),
    tag_id: String(formData.get("tag_id") ?? ""),
  };
  const result = v.safeParse(formSchema, formFields);
  if (!result.success) {
    return { error: "フォームのデータが不正です" };
  }
  const { output } = result;
  const { error } = await supabase.from("red_map").update(output).eq("id", output.id);
  if (error) return { error: error.message };
  return { success: true, updateData:{...output, id: output.id} };
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const { mapId } = params;
  const { supabase } = createClient(request, "public");
  // チーム一覧
  const { data: teams, error: teamsError } = await supabase.from("red_team").select("*");
  if (teamsError) return { error:teamsError }
  // タグ一覧
  const { data: tags, error: tagsError } = await supabase.from("red_tag").select("*");
  if (tagsError) return { error:tagsError }
  // 指定されたマップ
  const { data: map, error: mapError } = await supabase.from("red_map").select("*").eq("id", mapId);
  if (mapError) return { error:mapError }
  // マップが存在しない
  if (map == null || map.length === 0) return redirect("../");
  return { teams, tags, map };
}

function updateMap(updateData: RedMap, name: string) {
  const { team_id } = updateData;
  const data = [
    {
      team_id: team_id,
      name: name,
      pins: [updateData],
    },
  ];
  const decoratedPins = decoratePins(data);
  const wsUrl = getWebsocketUrl()
  toast.info(`${team_id}のマップを更新します`, {
    description: `${wsUrl}`,
    duration: 10*1000,
  });
  const ws = new window.WebSocket(wsUrl);
  ws.onopen = () => {
    const message = {
        type: "updateMap",
        path: `/red/${team_id}`,
        data: decoratedPins,
    }
    const messageString = JSON.stringify(message);
    ws.send(messageString);
    ws.close();
    toast.success(`${team_id}のマップを更新しました`, {
      description: `${messageString}`,
      duration: 10*1000,
    });
  };
  ws.onerror = (error) => {
    console.log("WebSocket Error Event", error);
    toast.error("WebSocket送信に失敗しました", {
      duration: 10*1000,
    });
  };
}

export default function MapEdit({ loaderData }: Route.ComponentProps) {
  const { teams, tags, map, error } = loaderData;
  if (error || teams == null || tags == null || map == null) return <ErrorBoundary />;
  let fetcher = useFetcher();
  const navigate = useNavigate();
  const isLoading = fetcher.state !== "idle";
  useEffect(() => {
    if (fetcher.data?.error) {
      console.error('error:', fetcher.data?.error)
      toast.error(fetcher.data.error, {
        duration: 10*1000,
      });
    } else if (fetcher.data?.success) {
      // マップの更新
      const updateData = fetcher.data.updateData;
      const teamName = teams.find((team) => team.id === updateData.team_id)?.name ?? "";
      updateMap(updateData, teamName);
      navigate("/edit/map/", { preventScrollReset: true });
    }
  }, [fetcher.data, navigate]);

  return (
    <Dialog
      open={true}
      onOpenChange={(open) => {
        if (!open) {
          navigate("/edit/map/", { preventScrollReset: true });
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>編集</DialogTitle>
          <DialogDescription>マップの編集を行います。</DialogDescription>
        </DialogHeader>
        <fetcher.Form method="post">
          <MapForm teams={teams} tags={tags} map={map[0]} />
          <Button type="submit" className="block m-auto">
            保存
          </Button>
          {isLoading && (
            <div className="absolute top-0 left-0 w-full h-full bg-neutral-950/70 z-10">
              <Loading />
            </div>
          )}
        </fetcher.Form>
      </DialogContent>
    </Dialog>
  );
}

type MapFormProps = {
  teams: RedTeam[];
  tags: RedTag[];
  map: RedMap;
}

function MapForm({ teams, tags, map }: MapFormProps) {
  const { id, short_id, lat, lng, content, is_public, team_id, tag_id } = map;
  return (
    <>
      <div className="grid gap-4 py-4">
        <Input id="id" name="id" defaultValue={id} type="hidden" />
        <Input id="short_id" name="short_id" defaultValue={short_id} type="hidden" />

        <div className="h-9 grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">
            公開設定
          </Label>
          <Switch
            id="is_public"
            name="is_public"
            defaultChecked={is_public}
            className="col-span-3"
          />
        </div>

        <div className="h-9 grid grid-cols-4 items-center gap-4">
          <Label htmlFor="lat" className="text-right">
            緯度
          </Label>
          <Input
            id="lat"
            name="lat"
            type="number"
            step="any"
            defaultValue={lat}
            className="col-span-3"
            required
          />
        </div>

        <div className="h-9 grid grid-cols-4 items-center gap-4">
          <Label htmlFor="lng" className="text-right">
            経度
          </Label>
          <Input
            id="lng"
            name="lng"
            type="number"
            step="any"
            defaultValue={lng}
            className="col-span-3"
            required
          />
        </div>

        <div className="min-h-9 grid grid-cols-4 items-center gap-4">
          <Label htmlFor="content" className="text-right">
            内容
          </Label>
          <Textarea
            id="content"
            name="content"
            defaultValue={content}
            className="col-span-3"
            required
          />
        </div>

        <div className="h-9 grid grid-cols-4 items-center gap-4">
          <Label htmlFor="team_id" className="text-right">
            チームID
          </Label>
          <Select
            name="team_id"
            defaultValue={team_id}
            required
          >
            <SelectTrigger className="w-full col-span-3">
              <SelectValue placeholder="チームを選択" />
            </SelectTrigger>
            <SelectContent>
              {teams.map((team) => (
                <SelectItem key={team.id} value={team.id}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="h-9 grid grid-cols-4 items-center gap-4">
          <Label htmlFor="tag_id" className="text-right">
            タグ
          </Label>
          <Select
            name="tag_id"
            defaultValue={tag_id}
            required
          >
            <SelectTrigger className="w-full col-span-3">
              <SelectValue placeholder="タグを選択" />
            </SelectTrigger>
            <SelectContent>
              {tags.map((tag) => (
                <SelectItem key={tag.id} value={tag.id}>
                  {tag.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

      </div>
    </>
  );
}

export function ErrorBoundary() {
  console.log("routes/edit/map-edit.tsx");
  return <Error />;
}
