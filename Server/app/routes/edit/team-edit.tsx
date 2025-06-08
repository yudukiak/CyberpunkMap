import type { Route } from "./+types/team-edit";
import type { RedTeam } from "types/edit";
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
import { toast } from "sonner"

export function meta({ data }: Route.MetaArgs) {
  const { team } = data;
  if (team == null) return { title: "Edit Team - Cyberpunk RED Map" };
  const { name } = team[0];
  const title = [name, "Cyberpunk RED Map"].filter(Boolean).join(" - ");
  return [
    { title },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  const { supabase } = createClient(request, "public");
  const formData = await request.formData();
  const id = formData.get("id");
  const name = formData.get("name");
  const is_public = formData.get("is_public") === "on";
  const { data, error } = await supabase.from("red_team").update({ name, is_public }).eq("id", id);
  if (error) return { error: error.message };
  return { success: true };
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const { teamId } = params;
  const { supabase } = createClient(request, "public");
  const { data, error } = await supabase.from("red_team").select("*").eq("id", teamId);
  if (data == null || data.length === 0) return redirect("../");
  return { team: data, error };
}

export default function TeamEdit({ loaderData }: Route.ComponentProps) {
  console.log('👘 - team-edit.tsx - TeamEdit - loaderData:', loaderData)
  const { team, error } = loaderData;
  if (error || team == null) return <ErrorBoundary />;
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
      navigate("/edit/team/", { preventScrollReset: true });
    }
  }, [fetcher.data, navigate]);

  return (
    <Dialog
      open={true}
      onOpenChange={(open) => {
        if (!open) {
          navigate("/edit/team/", { preventScrollReset: true });
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>編集</DialogTitle>
          <DialogDescription>チームの編集を行います。</DialogDescription>
        </DialogHeader>
        <fetcher.Form method="post">
          <TeamForm team={team[0]} />
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

type TeamFormProps = {
  team: RedTeam;
}

function TeamForm({ team }: TeamFormProps) {
  const { id, name, is_public } = team;
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
            defaultChecked={is_public}
            className="col-span-3"
          />
        </div>

        <div className="h-9 grid grid-cols-4 items-center gap-4">
          <Label htmlFor="id" className="text-right">
            チームID
          </Label>
          <Input
            id="id"
            name="id"
            defaultValue={id}
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

      </div>
    </>
  );
}

export function ErrorBoundary() {
  console.log("routes/edit/team-edit.tsx");
  return <Error />;
}