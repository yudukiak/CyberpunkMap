import type { Route } from "./+types/teamId";
import type { RedTeam } from "types/edit";

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
  const { teamId } = params;
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
    const teamRes = await db.query(`SELECT * FROM red_team WHERE id = $1;`, [
      teamId,
    ]);
    // データ返却
    return {
      team: teamRes.rows[0],
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
  const teamId = formData.get("id");
  const name = formData.get("name");
  const is_public = formData.get("is_public") === "on";
  const key = formData.get("key");
  const member_ids = JSON.parse(formData.get("member_ids") as string);
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
      `UPDATE red_team SET name = $1, is_public = $2, key = $3, member_ids = $4 WHERE id = $5;`,
      [name, is_public, key, member_ids, teamId]
    );
    return { success: true };
  } catch (error) {
    console.error("🔥", error);
    return { error: "データベース接続に失敗しました" };
  } finally {
    await db.end().catch((e) => console.error("⚠️", e));
  }
}

export default function TeamId({ loaderData }: Route.ComponentProps) {
  const { team, error } = loaderData;
  if (error) return <ErrorBoundary />;

  let fetcher = useFetcher();
  const navigate = useNavigate();

  const isLoading = fetcher.state !== "idle";

  useEffect(() => {
    if (fetcher.data?.error) {
      toast.error(fetcher.data.error);
    } else if (fetcher.data?.success) {
      navigate("/red/edit/team/", { preventScrollReset: true });
    }
  }, [fetcher.data, navigate]);

  return (
    <Dialog
      open={true}
      onOpenChange={(open) => {
        if (!open) {
          navigate("/red/edit/team/");
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>編集</DialogTitle>
          <DialogDescription>チームの編集を行います。</DialogDescription>
        </DialogHeader>
        <fetcher.Form method="post">
          <TeamForm data={team} />
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

function TeamForm({ data }: { data: RedTeam }) {
  const { id, name, member_ids, is_public, key } = data;
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
          <Label htmlFor="key" className="text-right">
            チームID
          </Label>
          <Input
            id="key"
            name="key"
            defaultValue={key}
            className="col-span-3"
          />
        </div>

        <div className="h-9 grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">
            チーム名
          </Label>
          <Input
            id="name"
            name="name"
            defaultValue={name}
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
          {/*<div className="col-span-3">
            {member_ids.map((member_id) => {
              return (
                <Input
                  key={member_id}
                  id={`member_id_${member_id}`}
                  defaultValue={member_id}
                />
              );
            })}
          </div>*/}
        </div>
      </div>
    </>
  );
}

export function ErrorBoundary() {
  return <Error />;
}
