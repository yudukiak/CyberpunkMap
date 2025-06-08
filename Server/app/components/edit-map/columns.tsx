import type { ColumnDef } from "@tanstack/react-table";
import type { RedMap } from "types/edit";
import { getColor } from "~/lib/color-library";
import { getWebsocketUrl } from "~/lib/websocket-url";
import { Link } from "react-router";
import { Pencil, Info, MapPinned } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function moveMapCenter(redMap: RedMap) {
  const { team_id, lat, lng, content } = redMap;
  console.log("送信開始");
  const wsUrl = getWebsocketUrl()
  console.log("wsUrl", wsUrl);
  const ws = new window.WebSocket(wsUrl);
  ws.onopen = () => {
    ws.send(
      JSON.stringify({
        type: "moveMapCenter",
        path: `/red/${team_id}`,
        data: { lat, lng, content },
        date: new Date().toISOString(),
      })
    );
    ws.close();
    console.log("送信完了");
  };
  ws.onerror = () => {
    alert("WebSocket送信に失敗しました");
  };
}

export const columns: ColumnDef<RedMap>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    id: "moveMapCenter",
    header: () => <div className="text-center">移動</div>,
    cell: (context) => {
      const { row } = context as any;
      return (
        <div className="flex justify-center">
          <Button
            variant="outline"
            className="cursor-pointer"
            onClick={() => moveMapCenter(row.original)}
          >
            <MapPinned />
          </Button>
        </div>
      );
    },
  },
  {
    id: "updateMap",
    header: () => <div className="text-center">編集</div>,
    cell: ({ row }) => (
      <div className="flex justify-center">
        <Link
          to={`/edit/map/${row.original.id}`}
          className={`${buttonVariants({ variant: "outline" })} h-9 w-9`}
          preventScrollReset={true}
        >
          <Pencil />
        </Link>
      </div>
    ),
  },
  {
    accessorKey: "short_id",
    header: "Short ID",
  },
  {
    accessorKey: "title",
    header: "タイトル",
    cell: ({ row }) => {
      const content = row.original.content;
      const contentArray = content.split("\n");
      const contentHeader = contentArray[0];
      return <p>{contentHeader}</p>;
    },
  },
  {
    accessorKey: "content",
    header: () => <div className="text-center">内容</div>,
    cell: ({ row }) => {
      const content = row.original.content;
      return (
        <div className="flex justify-center">
          <Tooltip>
            <TooltipTrigger className="h-9 w-9 flex justify-center items-center">
              <Info />
            </TooltipTrigger>
            <TooltipContent>
              <p className="whitespace-pre-wrap">{content}</p>
            </TooltipContent>
          </Tooltip>          
        </div>
      );
    },
  },
  {
    accessorKey: "team_id",
    header: () => <div className="text-center">チームID</div>,
    cell: ({ row }) => {
      const teamId = row.original.team_id;
      const className = getColor({ team_id: teamId })?.team.background;
      return <Badge variant="secondary" className={className}>{teamId}</Badge>;
    },
  },
  {
    accessorKey: "tag_id",
    header: () => <div className="text-center">タグ</div>,
    cell: ({ row }) => {
      const tagId = row.original.tag_id;
      const className = getColor({ tag_id: tagId })?.tag.background;
      return <Badge variant="secondary" className={className}>{tagId}</Badge>;
    },
  },
  {
    accessorKey: "lat",
    header: () => <div className="text-center">緯度</div>,
  },
  {
    accessorKey: "lng",
    header: () => <div className="text-center">経度</div>,
  },
];
