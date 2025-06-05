import type { ColumnDef } from "@tanstack/react-table";
import type { RedMap } from "types/edit";
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
    accessorKey: "is_public",
    header: "公開",
  },
  {
    accessorKey: "lat",
    header: "緯度",
  },
  {
    accessorKey: "lng",
    header: "経度",
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
    id: "moveMapCenter",
    cell: ({ row }) => {
      const socketRef = useRef<WebSocket | null>(null);
      /*
      useEffect(() => {
        const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
        const wlPort = window.location.port;
        const wsPort = wlPort === "" ? "" : `:${wlPort}`;
        socketRef.current = new WebSocket(
          `${wsProtocol}://${window.location.hostname}${wsPort}/ws`
        );

        return () => {
          if (socketRef.current) {
            socketRef.current.close();
          }
        };
      }, []);
*/
      return (
        <Button
          variant="outline"
          onClick={() => {
            if (socketRef.current) {
              socketRef.current.send(
                JSON.stringify({
                  type: "moveMapCenter",
                  latlng: { lat: row.original.lat, lng: row.original.lng },
                })
              );
            }
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
];
