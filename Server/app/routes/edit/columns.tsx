import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type Payment = {
  id: string;
  lat: number;
  lng: number;
  content: string;
  created_at: Date;
  is_public: true;
  team_ids: number[];
  member_ids: number[];
  rulebook_ids: number[];
  tags: string[];
};

export const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "lat",
    header: "lat",
  },
  {
    accessorKey: "lng",
    header: "lng",
  },
  {
    accessorKey: "content",
    header: "内容",
  },
  {
    accessorKey: "is_public",
    header: "公開",
  },
  {
    accessorKey: "team_ids",
    header: "チーム",
  },
  {
    accessorKey: "member_ids",
    header: "メンバー",
  },
  {
    accessorKey: "rulebook_ids",
    header: "ルールブック",
  },
  {
    accessorKey: "tags",
    header: "タグ",
  },

  {
    id: "actions",
    cell: ({ row }) => {
      const payment = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(payment.id)}
            >
              Copy payment ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View customer</DropdownMenuItem>
            <DropdownMenuItem>View payment details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
