import type { ColumnDef } from "@tanstack/react-table";
import type { RedTeam } from "types/edit";
import TeamDialog from "./TeamDialog";

export const teamColumns: ColumnDef<RedTeam>[] = [
  {
    accessorKey: "is_public",
    header: "公開",
  },
  {
    accessorKey: "key",
    header: "チームID",
  },
  {
    accessorKey: "name",
    header: "チーム名",
  },
  {
    id: "actions",
    cell: ({ row }) => <TeamDialog data={row.original} />,
  },
];
