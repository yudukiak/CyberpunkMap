import type { ColumnDef } from "@tanstack/react-table";
import type { RedTeam } from "types/edit";
import { Pencil } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "react-router";

export const columns: ColumnDef<RedTeam>[] = [
  {
    accessorKey: "is_public",
    header: "公開",
  },
  {
    accessorKey: "id",
    header: "チームID",
  },
  {
    accessorKey: "name",
    header: "チーム名",
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <Link
        to={`/edit/team/${row.original.id}`}
        className={buttonVariants({ variant: "outline" })}
        preventScrollReset={true}
      >
        <Pencil className="h-4 w-4" />
      </Link>
    ),
  },
];
