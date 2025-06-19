import type { Route } from "./+types/map-add";
import type { RedMap, RedTeam, RedTag } from "~/lib/supabase/types/red";
import { useEffect } from "react";
import { useFetcher, useNavigate } from "react-router";
import { decoratePins } from "~/utils/decorate-pins";
import { createClient } from "~/lib/supabase";
import { getWebsocketUrl } from "~/utils/websocket-url";
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

export function meta() {
  const title = ["Add Map", "Cyberpunk RED Map"].filter(Boolean).join(" - ");
  return [
    { title },
  ];
}

const formSchema = v.object({
  lat: v.number(),
  lng: v.number(),
  content: v.string(),
  title: v.nullable(v.string()),
  description: v.nullable(v.string()),
  is_public: v.boolean(),
  team_id: v.string(),
  tag_id: v.string(),
  reference_title: v.nullable(v.string()),
  reference_url: v.nullable(v.string()),
});

export async function action({ request }: Route.ActionArgs) {
  const { supabase } = createClient(request, "public");
  const formData = await request.formData();
  const toNullableString = (value: FormDataEntryValue | null): string | null =>
    value === null || value === "" ? null : String(value);
  const formFields = {
    lat: Number(formData.get("lat") ?? 0),
    lng: Number(formData.get("lng") ?? 0),
    content: String(formData.get("content") ?? ""),
    title: toNullableString(formData.get("title")),
    description: toNullableString(formData.get("description")),
    is_public: formData.get("is_public") === "on",
    team_id: String(formData.get("team_id") ?? ""),
    tag_id: String(formData.get("tag_id") ?? ""),
    reference_title: toNullableString(formData.get("reference_title")),
    reference_url: toNullableString(formData.get("reference_url")),
  };
  const result = v.safeParse(formSchema, formFields);
  if (!result.success) {
    return { error: "フォームのデータが不正です" };
  }
  const { output } = result;
  const { error } = await supabase.from("red_map").insert([output]);
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

export default function MapAdd({ loaderData }: Route.ComponentProps) {
  const { teams, tags, error } = loaderData;
  if (error || teams == null || tags == null) return <ErrorBoundary />;
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
      //const updateData = fetcher.data.updateData;
      //const teamName = teams.find((team) => team.id === updateData.team_id)?.name ?? "";
      //updateMap(updateData, teamName);
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
            defaultValue=""
            className="col-span-3"
            required
          />
        </div>

        <div className="min-h-9 grid grid-cols-4 items-center gap-4">
          <Label htmlFor="title" className="text-right">
            タイトル
          </Label>
          <Input
            id="title"
            name="title"
            defaultValue=""
            className="col-span-3"
            required
          />
        </div>

        <div className="min-h-9 grid grid-cols-4 items-center gap-4">
          <Label htmlFor="description" className="text-right">
            説明
          </Label>
          <Textarea
            id="description"
            name="description"
            defaultValue=""
            className="col-span-3 max-h-48"
          />
        </div>

        <div className="min-h-9 grid grid-cols-4 items-center gap-4">
          <Label htmlFor="reference_title" className="text-right">
            参考場所
          </Label>
          <Input
            id="reference_title"
            name="reference_title"
            defaultValue=""
            className="col-span-3"
          />
        </div>

        <div className="min-h-9 grid grid-cols-4 items-center gap-4">
          <Label htmlFor="reference_url" className="text-right">
            参考URL
          </Label>
          <Input
            id="reference_url"
            name="reference_url"
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
  console.log("routes/edit/map-add.tsx");
  return <Error />;
}
