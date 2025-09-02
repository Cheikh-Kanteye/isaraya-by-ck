import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import type { Product } from "@/types";

export const ProductActions = ({ product }: { product: Product }) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/dashboard/admin/produit/${product.id}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Ouvrir le menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-slate-900 border-slate-700 text-muted-foreground"
      >
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={handleViewDetails}>
          Voir les détails
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigator.clipboard.writeText(product.id)}
        >
          Copier l'ID du produit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Modifier le produit</DropdownMenuItem>
        <DropdownMenuItem className="text-red-500">Supprimer</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
