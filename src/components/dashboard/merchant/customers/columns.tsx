"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserDisplay } from "@/components/dashboard/shared/UserDisplay";
import { formatPrice, formatDate } from "@/lib/utils";
import type { User } from "@/types";

export type Customer = {
  id: string;
  user: User;
  orderCount: number;
  totalSpent: number;
  lastOrderDate: string;
};

export const columns: ColumnDef<Customer>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "user",
    header: "Client",
    cell: ({ row }) => {
      const user = row.original.user;
      return <UserDisplay userId={user.id} />;
    },
  },
  {
    accessorKey: "orderCount",
    header: "Commandes",
  },
  {
    accessorKey: "totalSpent",
    header: "Total dépensé",
    cell: ({ cell }) => formatPrice(cell.getValue() as number),
  },
  {
    accessorKey: "lastOrderDate",
    header: "Dernière commande",
    cell: ({ cell }) => formatDate(cell.getValue() as string),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const customer = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Ouvrir le menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(customer.id)}
            >
              Copier l'ID client
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Voir le profil</DropdownMenuItem>
            <DropdownMenuItem>Contacter le client</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
