import type { Route } from "./+types/map-add";
import type { RedMap, RedTeam, RedTag } from "types/edit";
import { useEffect } from "react";
import { useFetcher, useNavigate } from "react-router";
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
  //const mapId = formData.get("id");
  const lat = formData.get("lat");
  const lng = formData.get("lng");
  const content = formData.get("content");
  const is_public = formData.get("is_public") === "on";
  const team_id = formData.get("team_id");
  const tag_id = formData.get("tag_id");
  const { data, error } = await supabase.from("red_map").insert([{ lat, lng, content, is_public, team_id, tag_id }]);
   if (error) return { error: error.message };
  return { success: true };
}

export async function loader({ request }: Route.LoaderArgs) {
  const { supabase } = createClient(request, "public");
  // チーム一覧
  const { data: teams, error: teamsError } = await supabase.from("red_team").select("*");
  if (teamsError) return { error:teamsError }
  // タグ一覧
  const { data: tags, error: tagsError } = await supabase.from("red_tag").select("*");
  if (tagsError) return { error:tagsError }
  return { teams, tags };
}

export default function MapAdd({ loaderData }: Route.ComponentProps) {
  const { teams, tags, error } = loaderData;
  if (error || teams == null || tags == null) return <ErrorBoundary />;
  let fetcher = useFetcher();
  const navigate = useNavigate();
  const isLoading = fetcher.state !== "idle";
  useEffect(() => {
    if (fetcher.data?.error) {
      console.error('error:', fetcher.data?.error)
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
          <DialogTitle>追加</DialogTitle>
          <DialogDescription>マップの追加を行います。</DialogDescription>
        </DialogHeader>
        <fetcher.Form method="post">
          <MapForm teams={teams} tags={tags}/>
          <Button type="submit" className="block m-auto">
            追加
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
}

function MapForm({ teams, tags }: MapFormProps) {
  return (
    <>
      <div className="grid gap-4 py-4">

        <div className="h-9 grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">
            公開設定
          </Label>
          <Switch
            id="is_public"
            name="is_public"
            defaultChecked={false}
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
            defaultValue=""
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
            defaultValue=""
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
            defaultValue=""
            className="col-span-3"
          />
        </div>

        <div className="h-9 grid grid-cols-4 items-center gap-4">
          <Label htmlFor="team_id" className="text-right">
            チームID
          </Label>
          <Select
            name="team_id"
            defaultValue=""
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
            defaultValue=""
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
  return <Error />;
}
