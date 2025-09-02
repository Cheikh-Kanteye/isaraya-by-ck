import { Heart, Star, ShoppingCart, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';
import { useAddToCart, usePrefetchProduct } from '@/hooks/queries';
import { useNavigate } from 'react-router-dom';
import { OptimisticLoader } from '@/components/shared/OptimisticLoader';
import FallbackImage from '@/components/shared/FallbackImage';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  isLiked?: boolean;
  onToggleLike?: (product: Product) => void;
  className?: string;
}

export function ProductCard({
  product,
  isLiked = false,
  onToggleLike,
  className = '',
}: ProductCardProps) {
  const navigate = useNavigate();
  const addToCartMutation = useAddToCart();
  const prefetchProduct = usePrefetchProduct();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCartMutation.mutate({ product, quantity: 1 });
  };

  const handleViewProduct = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/product/${product.id}`);
  };

  const handleToggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleLike?.(product);
  };

  const handleMouseEnter = () => {
    // Précharger les détails du produit au survol
    prefetchProduct(product.id);
  };

  return (
    <div
      className={`rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300 group overflow-hidden bg-white cursor-pointer ${className}`}
      onClick={handleViewProduct}
      onMouseEnter={handleMouseEnter}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleViewProduct(e as any)}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden">
        <FallbackImage
          src={product.images?.[0]?.url || '/placeholder.svg'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2">
          <Badge variant="default" className="text-xs bg-primary/10 text-primary">
            {product.condition || 'Neuf'}
          </Badge>
        </div>

        {/* Bouton favori */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggleLike}
          className={`absolute top-2 right-2 h-8 w-8 p-0 ${
            isLiked ? 'text-red-500' : 'text-gray-500'
          } hover:text-red-500 bg-white/80 hover:bg-white`}
        >
          <Heart className="h-4 w-4" fill={isLiked ? 'currentColor' : 'none'} />
        </Button>

        {/* Bouton aperçu rapide */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleViewProduct}
          className="absolute bottom-2 right-2 h-8 w-8 p-0 text-gray-600 hover:text-primary bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Eye className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <h3 className="font-medium text-gray-900 line-clamp-2 text-sm leading-tight group-hover:text-primary transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center space-x-1 text-xs">
          <div className="flex items-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${
                  i < Math.floor(product.rating || 0)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-gray-600">({product.rating || 0})</span>
        </div>

        {/* Prix */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-gray-900">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-sm line-through text-gray-500">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stock */}
        <div className="text-xs">
          {product.stock > 0 ? (
            <span className="text-green-600">En stock ({product.stock})</span>
          ) : (
            <span className="text-red-600">Rupture de stock</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleViewProduct}
            variant="outline"
            className="flex-1 text-sm border-gray-300 text-gray-800 hover:bg-gray-100"
            disabled={addToCartMutation.isPending}
          >
            Voir détails
          </Button>
          <Button
            onClick={handleAddToCart}
            className="flex-1 bg-primary/90 hover:bg-primary text-white text-sm"
            disabled={product.stock === 0 || addToCartMutation.isPending}
          >
            {addToCartMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <ShoppingCart className="h-4 w-4 mr-1" />
                Ajouter
              </>
            )}
          </Button>
        </div>

        {/* Status de la mutation */}
        {addToCartMutation.isPending && (
          <OptimisticLoader
            isLoading={true}
            className="justify-center"
          />
        )}
      </div>
    </div>
  );
}

export default ProductCard;