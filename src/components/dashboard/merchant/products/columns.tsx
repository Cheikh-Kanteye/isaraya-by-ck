"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types";
import FallbackImage from "@/components/shared/FallbackImage"; // Importation du composant FallbackImage

export type ProductColumn = Product & {
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  onView: (product: Product) => void;
};

const getStockBadgeVariant = (stock: number) => {
  if (stock === 0) return "destructive";
  if (stock < 10) return "secondary";
  return "default";
};

const getStockText = (stock: number) => {
  if (stock === 0) return "Rupture";
  if (stock < 10) return "Stock faible";
  return "En stock";
};

export const columns: ColumnDef<ProductColumn>[] = [
  {
    accessorKey: "name",
    header: "Produit",
    cell: ({ row }) => {
      const product = row.original;
      return (
        <div className="flex items-center gap-3">
          <FallbackImage // Remplacement de <img> par <FallbackImage>
            src={product.images?.[0]?.url || "/placeholder.svg"}
            alt={product.name}
            className="h-12 w-12 rounded-md object-cover"
          />
          <div className="flex flex-col">
            <span className="font-medium">{product.name}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "price",
    header: () => <div className="text-right">Prix</div>,
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("price"));
      return <div className="text-right font-medium">{formatPrice(price)}</div>;
    },
  },
  {
    accessorKey: "stock",
    header: "Stock",
    cell: ({ row }) => {
      const stock = row.original.stock;
      return (
        <Badge variant={getStockBadgeVariant(stock)}>
          {getStockText(stock)}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const product = row.original;
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
            <DropdownMenuItem onClick={() => product.onView(product)}>
              <Eye className="mr-2 h-4 w-4" />
              Voir
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => product.onEdit(product)}>
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600"
              onClick={() => product.onDelete(product.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
