import type { ColumnDef } from "@tanstack/react-table";
import type { RedMap } from "types/edit";
import MapDialog from "./MapDialog";

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
    cell: ({ row }) => <MapDialog data={row.original} />,
  },
];
