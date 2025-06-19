import type { Route } from "./+types/team-add";
import type { RedTeam } from "~/lib/supabase/types/red";
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
import { toast } from "sonner"

export function meta() {
  const title = ["Add Team", "Cyberpunk RED Map"].filter(Boolean).join(" - ");
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
  const { data, error } = await supabase.from("red_team").insert([{ id, name, is_public }]);
   if (error) return { error: error.message };
  return { success: true };
}

export async function loader({ request }: Route.LoaderArgs) {
}

export default function TeamAdd({ loaderData }: Route.ComponentProps) {
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
          <DialogTitle>追加</DialogTitle>
          <DialogDescription>チームの追加を行います。</DialogDescription>
        </DialogHeader>
        <fetcher.Form method="post">
          <MapForm />
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

function MapForm() {
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
          <Label htmlFor="id" className="text-right">
            チームID
          </Label>
          <Input
            id="id"
            name="id"
            defaultValue=""
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
            defaultValue=""
            className="col-span-3"
          />
        </div>

      </div>
    </>
  );
}

export function ErrorBoundary() {
  console.log("routes/edit/team-add.tsx");
  return <Error />;
}
