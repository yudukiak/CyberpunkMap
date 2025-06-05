import type { Route } from "./+types/mapId";
import type { RedMap } from "types/edit";
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
  const tag = formData.get("tag");
  const { data, error } = await supabase.from("red_map").update({ lat, lng, content, is_public, team_id, tag }).eq("id", mapId);
  if (error) return { error: error.message };
  return { success: true };
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const { mapId } = params;
  const { supabase } = createClient(request, "public");
  const { data, error } = await supabase.from("red_map").select("*").eq("id", mapId);
  return { data, error };
}

export default function MapId({ loaderData }: Route.ComponentProps) {
  const { data, error } = loaderData;
  if (error || data == null) return <ErrorBoundary />;
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
          <MapForm data={data[0]} />
          <Button type="submit" className="block m-auto">
            Save changes
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

function MapForm({ data }: { data: RedMap }) {
  const { id, lat, lng, content, is_public, team_id, tag } = data;
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
          <Input
            id="team_id"
            name="team_id"
            defaultValue={team_id}
            className="col-span-3"
          />
        </div>

        <div className="h-9 grid grid-cols-4 items-center gap-4">
          <Label htmlFor="tag" className="text-right">
            タグ
          </Label>
          <Input
            id="tag"
            name="tag"
            defaultValue={tag}
            className="col-span-3"
          />
        </div>

      </div>
    </>
  );
}

export function ErrorBoundary() {
  return <Error />;
}
