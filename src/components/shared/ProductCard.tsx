import { Heart, Star, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { Product } from "@/types";
import { useAddToCart } from "@/hooks/queries";
import { useNavigate } from "react-router-dom";
import FallbackImage from "@/components/shared/FallbackImage"; // Importation du composant FallbackImage
import { OptimisticLoader } from "@/components/shared/OptimisticLoader";

interface ProductCardProps {
  product: Product;
  isLiked?: boolean;
  onAddToCart?: (product: Product) => void;
  onViewProduct?: (product: Product) => void;
  onToggleLike?: (product: Product) => void;
}

const ProductCard = ({
  product,
  isLiked = false,
  onViewProduct,
  onToggleLike,
}: ProductCardProps) => {
  const navigate = useNavigate();
  const addToCartMutation = useAddToCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCartMutation.mutate({ product, quantity: 1 });
  };

  const handleViewProduct = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onViewProduct) {
      onViewProduct(product);
    } else {
      navigate(`/product/${product.id}`);
    }
  };

  const handleToggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleLike?.(product);
  };

  return (
    <div
      className="rounded-lg border border-gray-200 hover:shadow-md transition-all duration-300 group overflow-hidden animate-fade-in cursor-pointer flex-1 bg-white"
      onClick={handleViewProduct}
      role="button"
      tabIndex={0}
      onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) =>
        e.key === "Enter" && handleViewProduct(e as unknown as React.MouseEvent)
      }
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden">
        <FallbackImage // Remplacement de <img> par <FallbackImage>
          src={product.images?.[0]?.url || "/placeholder.svg"}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 left-2">
          <Badge
            variant="default"
            className="text-xs bg-primary/10 text-primary"
          >
            {"Neuf"}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggleLike}
          className={`absolute top-2 right-2 h-8 w-8 p-0 ${
            isLiked ? "text-red-500" : "text-gray-500"
          } hover:text-red-500`}
        >
          <Heart className="h-4 w-4" fill={isLiked ? "currentColor" : "none"} />
        </Button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <h3 className="font-medium text-gray-900 line-clamp-2 text-sm leading-tight">
          {product.name}
        </h3>

        <div className="flex items-center space-x-1 text-xs">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          <span className="text-gray-600">{product.rating}</span>
          <span className="text-gray-600">•</span>
          <span className="text-gray-600">{"Merchant"}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-gray-900">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-sm line-through text-gray-500">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Buttons Container */}
        <div className="flex gap-2">
          <Button
            onClick={handleViewProduct}
            variant="outline"
            className="flex-1 text-sm border-gray-300 text-gray-800 hover:bg-gray-100"
            disabled={addToCartMutation.isPending}
          >
            Voir produits
          </Button>
          <Button
            onClick={handleAddToCart}
            className="flex-1 bg-primary/90 hover:bg-primary text-white text-sm flex items-center gap-2"
            disabled={addToCartMutation.isPending}
          >
            {addToCartMutation.isPending ? (
              <OptimisticLoader isLoading={true} />
            ) : (
              <>
                <ShoppingCart className="h-4 w-4" />
                Ajouter
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
