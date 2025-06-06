import type { Route } from "./+types/map-edit";
import type { RedTeam, RedMap, RedTag } from "types/edit";
import { useEffect } from "react";
import { useFetcher, useNavigate, redirect } from "react-router";
import { createClient } from "~/lib/supabase";
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
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner"

export async function action({ request }: Route.ActionArgs) {
  const { supabase } = createClient(request, "public");
  const formData = await request.formData();
  const mapId = formData.get("id");
  const lat = formData.get("lat");
  const lng = formData.get("lng");
  const content = formData.get("content");
  const is_public = formData.get("is_public") === "on";
  const team_id = formData.get("team_id");
  const tag_id = formData.get("tag_id");
  const { data, error } = await supabase.from("red_map").update({ lat, lng, content, is_public, team_id, tag_id }).eq("id", mapId);
  if (error) return { error: error.message };
  return { success: true };
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
  //const { data, error } = await supabase.from("red_map").select("*").eq("id", mapId);
  //return { data, error };
}

export default function MapEdit({ loaderData }: Route.ComponentProps) {
  const { teams, tags, map, error } = loaderData;
  if (error || teams == null || tags == null || map == null) return <ErrorBoundary />;
  let fetcher = useFetcher();
  const navigate = useNavigate();
  const isLoading = fetcher.state !== "idle";
  useEffect(() => {
    if (fetcher.data?.error) {
      toast.error(fetcher.data.error);
    } else if (fetcher.data?.success) {
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
      <Toaster />
    </Dialog>
  );
}

type MapFormProps = {
  teams: RedTeam[];
  tags: RedTag[];
  map: RedMap;
}

function MapForm({ teams, tags, map }: MapFormProps) {
  console.log('👘 - map-edit.tsx - MapForm - tags:', tags)
  const { id, lat, lng, content, is_public, team_id, tag_id } = map;
  console.log('👘 - map-edit.tsx - MapForm - tag_id:', tag_id)
  return (
    <>
      <div className="grid gap-4 py-4">
        <Input id="id" name="id" defaultValue={id} type="hidden" />

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
            defaultValue={lat}
            className="col-span-3"
          />
        </div>

        <div className="h-9 grid grid-cols-4 items-center gap-4">
          <Label htmlFor="lng" className="text-right">
            経度
          </Label>
          <Input
            id="lng"
            name="lng"
            defaultValue={lng}
            className="col-span-3"
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
          />
        </div>

        <div className="h-9 grid grid-cols-4 items-center gap-4">
          <Label htmlFor="team_id" className="text-right">
            チームID
          </Label>
          <Select
            name="team_id"
            defaultValue={team_id}
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
