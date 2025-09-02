import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Shield, Trash2 } from "lucide-react";
import type { User } from "@/types";
import { UserActions } from "./UserActions";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

export const columns: ColumnDef<User>[] = [
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
    accessorKey: "firstName",
    header: "Nom",
    cell: ({ row }) => {
      const user: User = row.original;
      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatarUrl || ''} alt={user.firstName} />
            <AvatarFallback>{`${user.firstName?.[0] || ""}${
              user.lastName?.[0] || ""
            }`}</AvatarFallback>
          </Avatar>
          <span>{`${user.firstName} ${user.lastName}`}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    header: "Rôle",
    cell: ({ row }) => {
      const user = row.original;
      const role = user.roles[0]?.name || "CLIENT"; // Accéder au nom du premier rôle, ou "CLIENT" par défaut
      const variant: BadgeVariant =
        (
          {
            ADMIN: "destructive",
            MERCHANT: "secondary",
            CLIENT: "default",
          } as Record<string, BadgeVariant>
        )[role] || "default";

      return (
        <Badge variant={variant}>
          {role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Inscrit le",
    cell: ({ row }) =>
      new Date(row.getValue("createdAt")).toLocaleDateString("fr-FR"),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;
      return <UserActions user={user} />;
    },
  },
];
