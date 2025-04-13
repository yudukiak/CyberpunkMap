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
import { Switch } from "@/components/ui/switch"

import { Pencil } from "lucide-react";

import type { RedTeam, RedMap } from "types/edit";
type data = {
  data: RedTeam | RedMap;
};

export default function MapDialog({ data }: data) {
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
          <DialogDescription>
            マップの編集を行います。
          </DialogDescription>
        </DialogHeader>
        <form>
          <MapForm data={data as RedMap} />
          <Button type="submit" className="block m-auto">
            Save changes
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function MapForm({ data }: { data: RedMap }) {
  const { id, lat, lng, content, team_ids, member_ids, rulebook_ids, is_public, tags } = data;
  return (
    <>
      <div className="grid gap-4 py-4">
        <Input name="id" defaultValue={id} type="hidden"></Input>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">
            公開設定
          </Label>
          <Switch id="is_public" defaultChecked={is_public} />
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="lat" className="text-right">
            緯度
          </Label>
          <Input id="lat" defaultValue={lat} className="col-span-3" />
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="lng" className="text-right">
            経度
          </Label>
          <Input id="lng" defaultValue={lng} className="col-span-3" />
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="content" className="text-right">
            内容
          </Label>
          <Input id="content" defaultValue={content} className="col-span-3" />
        </div>

        <div className="h-9 grid grid-cols-4 items-center gap-4">
          <Label htmlFor="team_ids" className="text-right">
            チームID
          </Label>
          <div className="col-span-3">
            {team_ids.map((team_id) => {
              return (
                <Input
                  key={team_id}
                  id={`team_id_${team_id}`}
                  defaultValue={team_id}
                />
              );
            })}
          </div>
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
        
        <div className="h-9 grid grid-cols-4 items-center gap-4">
          <Label htmlFor="rulebook_ids" className="text-right">
            メンバーID
          </Label>
          <div className="col-span-3">
            {rulebook_ids.map((rulebook_id) => {
              return (
                <Input
                  key={rulebook_id}
                  id={`rulebook_id_${rulebook_id}`}
                  defaultValue={rulebook_id}
                />
              );
            })}
          </div>
        </div>
        
        <div className="h-9 grid grid-cols-4 items-center gap-4">
          <Label htmlFor="tags" className="text-right">
            タグ
          </Label>
          <div className="col-span-3">
            {tags.map((tag, index) => {
              return (
                <Input
                  key={index}
                  id={`tag_${index}`}
                  defaultValue={tag}
                />
              );
            })}
          </div>
        </div>

      </div>
    </>
  );
}

