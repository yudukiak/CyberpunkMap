import type { ColumnDef } from "@tanstack/react-table";
import type { RedMap } from "types/edit";
import { MODE, DEV_WS_PORT, SERVER_PORT } from "~/config/vite";
import { useEffect, useRef } from "react";
import { Link } from "react-router";
import { Pencil } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const columns: ColumnDef<RedMap>[] = [
  {
    id: "moveMapCenter",
    cell: (context) => {
      const { row } = context as any;
      return (
        <Button
          variant="outline"
          onClick={() => {
            console.log("送信開始")
            const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
            const wsPort = MODE === "development" ? DEV_WS_PORT : SERVER_PORT;
            const wsUrl = `${wsProtocol}://${window.location.hostname}:${wsPort}/ws`;
            console.log("wsUrl", wsUrl)
            const ws = new window.WebSocket(wsUrl);
            ws.onopen = () => {
              ws.send(
                JSON.stringify({
                  type: "moveMapCenter",
                  latlng: { lat: row.original.lat, lng: row.original.lng },
                })
              );
              ws.close();
              console.log("送信完了")
            };
            ws.onerror = () => {
              alert("WebSocket送信に失敗しました");
            };
          }}
        >
          移動
        </Button>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <Link
        to={`/edit/map/${row.original.id}`}
        className={buttonVariants({ variant: "outline" })}
        preventScrollReset={true}
      >
        <Pencil className="h-4 w-4" />
      </Link>
    ),
  },
  {
    accessorKey: "content",
    header: "内容",
    cell: ({ row }) => {
      const content = row.original.content;
      const contentArray = content.split("\n");
      const contentHeader = contentArray[0];
      return (
        <Tooltip>
          <TooltipTrigger className="w-full text-left">
            <div className="truncate max-w-48">{contentHeader}</div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="whitespace-pre-wrap">{content}</p>
          </TooltipContent>
        </Tooltip>
      );
    },
  },
  {
    accessorKey: "team_id",
    header: "チームID",
  },
  {
    accessorKey: "tag",
    header: "タグ",
  },
  {
    accessorKey: "lat",
    header: "緯度",
  },
  {
    accessorKey: "lng",
    header: "経度",
  },
];
