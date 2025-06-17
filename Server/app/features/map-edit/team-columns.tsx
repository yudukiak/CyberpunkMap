import type { ColumnDef } from "@tanstack/react-table";
import type { RedTeam } from "~/types/edit";
import { getColor } from "~/lib/color-library";
import { getWebsocketUrl } from "~/lib/websocket-url";
import { Pencil, MapPinned } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { toast } from "sonner"
import { Link } from "react-router";

function resetMapCenter(redTeam: RedTeam) {
  const { id } = redTeam;
  const wsUrl = getWebsocketUrl()
  toast.info(`${id}のマップをリセットします`, {
    description: `${wsUrl}`,
    duration: 10*1000,
  });
  const ws = new window.WebSocket(wsUrl);
  ws.onopen = () => {
    const message = {
      type: "resetMapCenter",
      path: `/red/${id}`,
    }
    const messageString = JSON.stringify(message);
    ws.send(messageString);
    ws.close();
    toast.success(`${id}のマップをリセットしました`, {
      description: `${messageString}`,
      duration: 10*1000,
    });
  };
  ws.onerror = (error) => {
    console.log("WebSocket Error Event", error);
    toast.error("WebSocket送信に失敗しました", {
      duration: 10*1000,
    });
  };
}

export const columns: ColumnDef<RedTeam>[] = [
  {
    id: "resetMapCenter",
    header: () => <div className="text-center">リセット</div>,
    cell: (context) => {
      const { row } = context as any;
      return (
        <div className="flex justify-center">
          <Button
            variant="outline"
            className="cursor-pointer"
            onClick={() => resetMapCenter(row.original)}
          >
            <MapPinned />
          </Button>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-center">編集</div>,
    cell: ({ row }) => (
      <div className="flex justify-center">
        <Link
          to={`/edit/team/${row.original.id}`}
          className={`${buttonVariants({ variant: "outline" })} h-9 w-9`}
          preventScrollReset={true}
        >
          <Pencil />
        </Link>
      </div>
    ),
  },
  {
    accessorKey: "team_id",
    header: "チームID",
    cell: ({ row }) => {
      const teamId = row.original.id;
      const className = getColor({ team_id: teamId })?.team.background;
      return <Badge variant="secondary" className={className}>{teamId}</Badge>;
    },
  },
  {
    accessorKey: "name",
    header: "チーム名",
  },
];
