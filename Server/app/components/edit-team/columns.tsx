import type { ColumnDef } from "@tanstack/react-table";
import type { RedTeam } from "types/edit";
import { getColor } from "~/lib/color-library";
import { getWebsocketUrl } from "~/lib/websocket-url";
import { Pencil, MapPinned } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Link } from "react-router";

function resetMapCenter(redTeam: RedTeam) {
  const { id } = redTeam;
  console.log("送信開始");
  const wsUrl = getWebsocketUrl()
  console.log("wsUrl", wsUrl);
  const ws = new window.WebSocket(wsUrl);
  ws.onopen = () => {
    ws.send(
      JSON.stringify({
        type: "resetMapCenter",
        path: `/red/${id}`,
      })
    );
    ws.close();
    console.log("送信完了");
  };
  ws.onerror = () => {
    alert("WebSocket送信に失敗しました");
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
