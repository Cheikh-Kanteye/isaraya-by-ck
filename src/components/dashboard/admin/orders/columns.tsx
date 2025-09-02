"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, CheckCircle, XCircle } from "lucide-react";
import type { Order } from "@/types";
import { UserDisplay } from "../../shared/UserDisplay";
import { formatPrice } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { OrderActions } from "./OrderActions";
import { ORDER_STATUSES } from "@/config/orders";

export const columns: ColumnDef<Order>[] = [
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
    accessorKey: "id",
    header: "N° Commande",
  },
  {
    accessorKey: "clientId",
    header: "Client",
    cell: ({ row }) => <UserDisplay userId={row.getValue("clientId")} />,
  },
  {
    accessorKey: "merchantId", // Renamed from vendorId
    header: "Vendeur",
    cell: ({ row }) => <UserDisplay userId={row.getValue("merchantId")} />, // Updated from vendorId
  },
  {
    id: "total",
    header: "Total",
    cell: ({ row }) => {
      const total = row.original.total;
      return <div className="font-medium">{formatPrice(total)}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Statut",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const statusKey = status.toLowerCase() as keyof typeof ORDER_STATUSES;
      const statusInfo = ORDER_STATUSES[statusKey];

      if (!statusInfo) {
        return <Badge>{status}</Badge>;
      }

      return (
        <Badge className={`${statusInfo.color} text-white`}>
          {statusInfo.label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => {
      return new Date(row.getValue("createdAt")).toLocaleDateString("fr-FR");
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <OrderActions order={row.original} />,
  },
];
