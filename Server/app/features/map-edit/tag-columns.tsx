import type { ColumnDef } from "@tanstack/react-table";
import type { RedTag } from "~/lib/supabase/types/red";
import { getColor } from "~/utils/color-library";
import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "react-router";

export const columns: ColumnDef<RedTag>[] = [
  /*
  {
    id: "actions",
    header: () => <div className="text-center">編集</div>,
    cell: ({ row }) => (
      <div className="flex justify-center">
        <Link
          to={`/edit/tag/${row.original.id}`}
          className={`${buttonVariants({ variant: "outline" })} h-9 w-9`}
          preventScrollReset={true}
        >
          <Pencil />
        </Link>
      </div>
    ),
  },
  */
  {
    accessorKey: "tag_id",
    header: "タグID",
    cell: ({ row }) => {
      const tagId = row.original.id;
      const className = getColor({ tag_id: tagId })?.tag.background;
      return <Badge variant="secondary" className={className}>{tagId}</Badge>;
    },
  },
  {
    accessorKey: "name",
    header: "タグ名",
  },
];
