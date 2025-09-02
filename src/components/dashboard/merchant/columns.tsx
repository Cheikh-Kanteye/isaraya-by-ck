"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Order } from "@/types";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserDisplay } from "@/components/dashboard/shared/UserDisplay";
import {
  ORDER_STATUS,
  ORDER_STATUS_LABELS,
  OrderStatus,
} from "@/constants/orderStatus";

export type OrderWithUser = Order & {
  user: {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
  } | null;
};

export type OrderColumn = {
  id: string;
  productTitle: string;
  total: number;
  status: OrderStatus;
  date: string;
  user: {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
  } | null;
  onStatusChange: (orderId: string, status: Order["status"]) => void;
};

const getStatusBadge = (status: OrderColumn["status"]) => {
  const getVariantAndColor = (status: OrderStatus) => {
    switch (status) {
      case ORDER_STATUS.DRAFT:
        return { variant: "outline" as const, className: "" };
      case ORDER_STATUS.PENDING_PAYMENT:
        return {
          variant: "secondary" as const,
          className: "bg-yellow-100 text-yellow-800 text-xs text-nowrap",
        };
      case ORDER_STATUS.PAYMENT_SUCCESSFUL:
        return {
          variant: "default" as const,
          className: "bg-green-600 hover:bg-green-700 text-xs text-nowrap",
        };
      case ORDER_STATUS.PAYMENT_FAILED:
        return { variant: "destructive" as const, className: "" };
      case ORDER_STATUS.PENDING:
        return { variant: "secondary" as const, className: "" };
      case ORDER_STATUS.CONFIRMED:
        return {
          variant: "default" as const,
          className: "bg-blue-600 hover:bg-blue-700 text-xs text-nowrap",
        };
      case ORDER_STATUS.SHIPPED:
        return { variant: "default" as const, className: "" };
      case ORDER_STATUS.DELIVERED:
        return {
          variant: "default" as const,
          className: "bg-green-600 hover:bg-green-700 text-xs text-nowrap",
        };
      case ORDER_STATUS.CANCELLED:
        return { variant: "destructive" as const, className: "" };
      case ORDER_STATUS.RETURN_REQUESTED:
        return {
          variant: "secondary" as const,
          className: "bg-orange-100 text-orange-800 text-xs text-nowrap",
        };
      case ORDER_STATUS.RETURN_IN_PROGRESS:
        return {
          variant: "secondary" as const,
          className: "bg-orange-200 text-orange-900 text-xs text-nowrap",
        };
      case ORDER_STATUS.RETURNED:
        return {
          variant: "outline" as const,
          className: "border-orange-500 text-orange-700 text-xs text-nowrap",
        };
      default:
        return { variant: "outline" as const, className: "" };
    }
  };

  const { variant, className } = getVariantAndColor(status);
  const label = ORDER_STATUS_LABELS[status] || "Inconnu";

  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  );
};

export const columns: ColumnDef<OrderColumn>[] = [
  {
    accessorKey: "id",
    header: "Commande",
    cell: ({ row }) => (
      <div className="font-medium">#{row.original.id.substring(0, 7)}...</div>
    ),
  },
  {
    accessorKey: "productTitle",
    header: "Produit",
  },
  {
    id: "user",
    accessorKey: "user",
    header: "Client",
    cell: ({ row }) => {
      const user = row.original.user;
      if (!user) return "Client non trouvé";
      return <UserDisplay userId={user.id} />;
    },
  },
  {
    accessorKey: "total",
    header: "Montant",
    cell: ({ row }) => formatPrice(row.original.total),
  },
  {
    accessorKey: "status",
    header: "Statut",
    cell: ({ row }) => getStatusBadge(row.original.status),
  },
  {
    accessorKey: "date",
    header: "Date",
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const order = row.original;
      return (
        <Select
          value={order.status}
          onValueChange={(value) =>
            order.onStatusChange(order.id, value as Order["status"])
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    },
  },
];
