import type { ColumnDef } from "@tanstack/react-table";
import type { RedTeam } from "types/edit";
import { getColor } from "~/lib/color-library";
import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "react-router";

export const columns: ColumnDef<RedTeam>[] = [
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
