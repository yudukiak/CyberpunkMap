import type { ColumnDef } from "@tanstack/react-table";
import type { RedMap } from "types/edit";
import { Pencil } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { useEffect, useRef } from "react";

const MODE = import.meta.env.MODE;
const PORT = import.meta.env.VITE_SERVER_PORT;
const vsPort = MODE === "development" ? `:${PORT}` : null;

export const mapColumns: ColumnDef<RedMap>[] = [
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
  },
  {
    accessorKey: "team_ids",
    header: "チームID",
  },
  {
    accessorKey: "rulebook_ids",
    header: "ルールブックID",
  },
  {
    accessorKey: "tags",
    header: "タグ",
  },
  {
    id: "moveMapCenter",
    cell: ({ row }) => {
      const socketRef = useRef<WebSocket | null>(null);

      useEffect(() => {
        const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
        const wlPort = window.location.port;
        const wsPort = vsPort ? vsPort : wlPort === "" ? "" : `:${wlPort}`;
        socketRef.current = new WebSocket(
          `${wsProtocol}://${window.location.hostname}${wsPort}/ws`
        );

        return () => {
          if (socketRef.current) {
            socketRef.current.close();
          }
        };
      }, []);

      return (
        <Button variant="outline" onClick={() => {
          if (socketRef.current) {
            socketRef.current.send(JSON.stringify({
              type: 'moveMapCenter',
              latlng: { lat: row.original.lat, lng: row.original.lng }
            }));
          }
        }}>
          移動
        </Button>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <Link
        to={`/red/edit/map/${row.original.id}`}
        className={buttonVariants({ variant: "outline" })}
        preventScrollReset={true}
      >
        <Pencil className="h-4 w-4" />
      </Link>
    ),
  },
];
