import type { ColumnDef } from "@tanstack/react-table";
import type { RedMap } from "types/edit";
import { Pencil } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "react-router";

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
