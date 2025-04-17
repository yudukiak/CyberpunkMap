import type { Route } from "./+types/mapId";
import type { RedMap } from "types/edit";

import Error from "~/views/Error";
import pkg from "pg";
import { useFetcher, useNavigate } from "react-router";
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
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { useEffect } from "react";
import Loading from "~/views/Loading";

export async function loader({ params }: Route.LoaderArgs) {
  const { mapId } = params;
  const { Client } = pkg;
  const options = {
    user: import.meta.env.VITE_DB_USER,
    host: import.meta.env.VITE_DB_HOST,
    port: import.meta.env.VITE_DB_PORT,
    database: import.meta.env.VITE_DB_NAME,
    password: import.meta.env.VITE_DB_PASS,
  };
  // DB接続
  const db = new Client(options);
  try {
    await db.connect();
    const redMapRes = await db.query(`SELECT * FROM red_map WHERE id = $1;`, [
      mapId,
    ]);
    // データ返却
    return {
      redMap: redMapRes.rows[0],
      error: null,
    };
  } catch (error) {
    console.error("🔥", error);
    return {
      team: null,
      error: "データベース接続に失敗しました",
    };
  } finally {
    await db.end().catch((e) => console.error("⚠️", e));
  }
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const mapId = formData.get("id");
  const lat = formData.get("lat");
  const lng = formData.get("lng");
  const content = formData.get("content");
  const is_public = formData.get("is_public") === "on";
  const team_ids = JSON.parse(formData.get("team_ids") as string);
  const member_ids = JSON.parse(formData.get("member_ids") as string);
  const rulebook_ids = JSON.parse(formData.get("rulebook_ids") as string);
  const tags = formData.get("tags");
  const { Client } = pkg;
  const options = {
    user: import.meta.env.VITE_DB_USER,
    host: import.meta.env.VITE_DB_HOST,
    port: import.meta.env.VITE_DB_PORT,
    database: import.meta.env.VITE_DB_NAME,
    password: import.meta.env.VITE_DB_PASS,
  };
  // DB接続
  const db = new Client(options);
  try {
    await db.connect();
    await db.query(
      `UPDATE red_map SET lat = $1, lng = $2, content = $3, is_public = $4, team_ids = $5, member_ids = $6, rulebook_ids = $7, tags = $8 WHERE id = $9;`,
      [lat, lng, content, is_public, team_ids, member_ids, rulebook_ids, tags, mapId]
    );
    return { success: true };
  } catch (error) {
    console.error("🔥", error);
    return { error: "データベース接続に失敗しました" };
  } finally {
    await db.end().catch((e) => console.error("⚠️", e));
  }
}

export default function MapId({ loaderData }: Route.ComponentProps) {
  const { redMap, error } = loaderData;
  if (error) return <ErrorBoundary />;

  let fetcher = useFetcher();
  const navigate = useNavigate();

  const isLoading = fetcher.state !== "idle";

  useEffect(() => {
    if (fetcher.data?.error) {
      toast.error(fetcher.data.error);
    } else if (fetcher.data?.success) {
      navigate("/red/edit/map/", { preventScrollReset: true });
    }
  }, [fetcher.data, navigate]);

  return (
    <Dialog
      open={true}
      onOpenChange={(open) => {
        if (!open) {
          navigate("/red/edit/map/");
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>編集</DialogTitle>
          <DialogDescription>マップの編集を行います。</DialogDescription>
        </DialogHeader>
        <fetcher.Form method="post">
          <MapForm data={redMap} />
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
  const { id, lat, lng, content, is_public, team_ids, member_ids, rulebook_ids, tags } = data;
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

        <div className="h-9 grid grid-cols-4 items-center gap-4">
          <Label htmlFor="content" className="text-right">
            内容
          </Label>
          <Input
            id="content"
            name="content"
            defaultValue={content}
            className="col-span-3"
          />
        </div>

        <div className="h-9 grid grid-cols-4 items-center gap-4">
          <Label htmlFor="team_ids" className="text-right">
            チームID
          </Label>
          <Input
            id="team_ids"
            name="team_ids"
            defaultValue={JSON.stringify(team_ids)}
            className="col-span-3"
          />
        </div>

        <div className="h-9 grid grid-cols-4 items-center gap-4">
          <Label htmlFor="member_ids" className="text-right">
            メンバーID
          </Label>
          <Input
            id="member_ids"
            name="member_ids"
            defaultValue={JSON.stringify(member_ids)}
            className="col-span-3"
          />
        </div>

        <div className="h-9 grid grid-cols-4 items-center gap-4">
          <Label htmlFor="rulebook_ids" className="text-right">
            ルールブックID
          </Label>
          <Input
            id="rulebook_ids"
            name="rulebook_ids"
            defaultValue={JSON.stringify(rulebook_ids)}
            className="col-span-3"
          />
        </div>

        <div className="h-9 grid grid-cols-4 items-center gap-4">
          <Label htmlFor="tags" className="text-right">
            タグ
          </Label>
          <Input
            id="tags"
            name="tags"
            defaultValue={JSON.stringify(tags)}
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
