"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Product } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CategoryName } from "./CategoryName";
import { ProductActions } from "./ProductActions";
import { MerchantName } from "./MerchantName";
import FallbackImage from "@/components/shared/FallbackImage"; // Importation du composant FallbackImage

const getStatusBadge = (status: Product["status"], reports: number = 0) => {
  if (reports > 0) {
    return (
      <Badge variant="destructive">
        <AlertTriangle className="mr-2 h-4 w-4" />
        Signalé ({reports})
      </Badge>
    );
  }

  switch (status) {
    case "disponible":
      return (
        <Badge variant="default" className="bg-green-500 hover:bg-green-600">
          <CheckCircle className="mr-2 h-4 w-4" />
          Disponible
        </Badge>
      );
    case "indisponible":
      return (
        <Badge variant="destructive">
          <XCircle className="mr-2 h-4 w-4" />
          Indisponible
        </Badge>
      );
    case "bientôt disponible":
      return (
        <Badge
          variant="secondary"
          className="bg-yellow-500 hover:bg-yellow-600"
        >
          <Clock className="mr-2 h-4 w-4" />
          Bientôt disponible
        </Badge>
      );
    default:
      return <Badge variant="outline">Inconnu</Badge>;
  }
};

export const columns: ColumnDef<Product>[] = [
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
    accessorKey: "name",
    header: "Produit",
    cell: ({ row }) => {
      const product = row.original;
      return (
        <div className="flex items-center">
          <FallbackImage // Remplacement de <img> par <FallbackImage>
            src={product.images[0]?.url || "/placeholder.svg"}
            alt={product.name}
            className="w-10 h-10 rounded-md mr-4 object-cover"
          />
          <div>
            <div className="font-medium text-muted-foreground">
              {product.name}
            </div>
            <div className="text-sm text-foreground">
              <CategoryName categoryId={product.categoryId} />
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "price",
    header: "Prix",
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("price"));
      const formatted = new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "XOF",
      }).format(price);
      return <div className="font-medium text-right">{formatted}</div>;
    },
  },
  {
    accessorKey: "stock",
    header: "Stock",
  },
  {
    accessorKey: "status",
    header: "Statut",
    cell: ({ row }) => {
      const product = row.original;
      return getStatusBadge(product.status, product.reports || 0);
    },
  },
  {
    accessorKey: "merchantId", // Renamed from vendorId
    header: "Vendeur",
    cell: ({ row }) => <MerchantName merchantId={row.original.merchantId} />,
  },
  {
    accessorKey: "createdAt",
    header: "Créé le",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return <span>{date.toLocaleDateString("fr-FR")}</span>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return <ProductActions product={row.original} />;
    },
  },
];
