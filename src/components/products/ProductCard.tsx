import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, ShoppingCart } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { usePrefetchProduct } from '@/hooks/queries';
import type { Product } from '@/types';
import FallbackImage from "@/components/shared/FallbackImage"; // Importation du composant FallbackImage

// Ce composant affiche une carte produit
interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className = "" }: ProductCardProps) {
  const prefetchProduct = usePrefetchProduct();

  const handleMouseEnter = () => {
    // Précharger les détails du produit au survol
    prefetchProduct(product.id);
  };

  const primaryImage = product.images?.[0];
  const imageUrl = primaryImage?.url || '/placeholder.svg';
  const imageAlt = primaryImage?.altText || product.name;

  return (
    <Card 
      className={`group hover:shadow-lg transition-shadow duration-200 ${className}`}
      onMouseEnter={handleMouseEnter}
    >
      <CardContent className="p-0">
        <Link to={`/product/${product.id}`}>
          <div className="relative overflow-hidden rounded-t-lg">
            <FallbackImage // Remplacement de <img> par <FallbackImage>
              src={imageUrl}
              alt={imageAlt}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
              loading="lazy"
            />
            {product.isOnSale && (
              <Badge 
                variant="destructive" 
                className="absolute top-2 left-2"
              >
                Promo
              </Badge>
            )}
            {product.condition === 'neuf' && (
              <Badge 
                variant="secondary" 
                className="absolute top-2 right-2"
              >
                Neuf
              </Badge>
            )}
          </div>
        </Link>
      </CardContent>
      
      <CardFooter className="p-4 space-y-3">
        <div className="w-full space-y-2">
          <Link 
            to={`/product/${product.id}`}
            className="block"
          >
            <h3 className="font-semibold text-sm line-clamp-2 hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>
          
          {/* Rating */}
          {product.rating && (
            <div className="flex items-center gap-1">
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
              <span className="text-xs text-muted-foreground">
                ({product.reviewCount || 0})
              </span>
            </div>
          )}
          
          {/* Prix */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
          
          {/* Stock */}
          <div className="text-xs text-muted-foreground">
            {product.stock > 0 ? (
              <span className="text-green-600">
                En stock ({product.stock} disponibles)
              </span>
            ) : (
              <span className="text-red-600">Rupture de stock</span>
            )}
          </div>
          
          {/* Bouton d'ajout au panier */}
          <Button 
            size="sm" 
            className="w-full"
            disabled={product.stock === 0}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {product.stock > 0 ? 'Ajouter au panier' : 'Indisponible'}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

