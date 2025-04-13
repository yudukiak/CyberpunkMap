import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import { Pencil } from "lucide-react";

import type { RedTeam, RedMap } from "types/edit";
type data = {
  data: RedTeam | RedMap;
};

export default function TeamDialog({ data }: data) {
  return (
    <Dialog>
      <DialogTrigger asChild className="cursor-pointer">
        <Button variant="outline">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>編集</DialogTitle>
          <DialogDescription>チームの編集を行います。</DialogDescription>
        </DialogHeader>
        <form>
          <TeamForm data={data as RedTeam} />
          <Button type="submit" className="block m-auto">
            Save changes
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function TeamForm({ data }: { data: RedTeam }) {
  const { id, name, member_ids, is_public, key } = data;
  return (
    <>
      <div className="grid gap-4 py-4">
        <Input name="id" defaultValue={id} type="hidden"></Input>
        <div className="h-9 grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">
            公開設定
          </Label>
          <Switch id="is_public" defaultChecked={is_public} />
        </div>
        <div className="h-9 grid grid-cols-4 items-center gap-4">
          <Label htmlFor="key" className="text-right">
            チームID
          </Label>
          <Input id="key" defaultValue={key} className="col-span-3" />
        </div>
        <div className="h-9 grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">
            チーム名
          </Label>
          <Input id="name" defaultValue={name} className="col-span-3" />
        </div>
        <div className="h-9 grid grid-cols-4 items-center gap-4">
          <Label htmlFor="member_ids" className="text-right">
            メンバーID
          </Label>
          <div className="col-span-3">
            {member_ids.map((member_id) => {
              return (
                <Input
                  key={member_id}
                  id={`member_id_${member_id}`}
                  defaultValue={member_id}
                />
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
