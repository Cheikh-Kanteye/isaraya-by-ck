import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Package, Filter, Tag, Star } from "lucide-react"; 
import { formatPrice } from "@/lib/utils";
import { FilterState } from "@/stores/productStore";

interface CatalogStatsProps {
  totalProducts: number;
  filteredProducts: number;
  filters: FilterState;
  loading?: boolean;
  categoryName?: string;
  isSubcategory?: boolean;
}

export function CatalogStats({
  totalProducts,
  filteredProducts,
  filters,
  loading = false,
  categoryName,
  isSubcategory = false,
}: CatalogStatsProps) {
  // Calculate filter statistics
  const filterStats = useMemo(() => {
    const stats = {
      activeFilters: 0,
      categoryFilters: filters.categories?.length || 0,
      brandFilters: filters.brands?.length || 0,
      ratingFilter: filters.rating ? 1 : 0,
      priceFilter:
        filters.priceRange &&
        (filters.priceRange[0] > 0 || filters.priceRange[1] < 100000)
          ? 1
          : 0,
    };

    stats.activeFilters =
      stats.categoryFilters +
      stats.brandFilters +
      stats.ratingFilter +
      stats.priceFilter;

    return stats;
  }, [filters]);

  // Calculate display percentage
  const displayPercentage = useMemo(() => {
    if (totalProducts === 0) return 0;
    return Math.round((filteredProducts / totalProducts) * 100);
  }, [filteredProducts, totalProducts]);

  // Generate context message
  const contextMessage = useMemo(() => {
    if (isSubcategory && categoryName) {
      return `Produits dans la sous-catégorie "${categoryName}"`;
    }
    if (categoryName) {
      return `Produits dans la catégorie "${categoryName}"`;
    }
    return "Tous les produits du catalogue";
  }, [isSubcategory, categoryName]);

  if (loading) {
    return (
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="animate-pulse flex space-x-4 flex-1">
              <div className="rounded-full bg-gray-200 h-10 w-10"></div>
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6 border-l-4 border-l-primary">
      <CardContent className="p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Main Stats */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full">
              <Package className="h-6 w-6 text-primary" />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold">
                  {filteredProducts.toLocaleString()} produit
                  {filteredProducts !== 1 ? "s" : ""}
                </h3>

                {filterStats.activeFilters > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    <Filter className="h-3 w-3 mr-1" />
                    {filterStats.activeFilters} filtre
                    {filterStats.activeFilters > 1 ? "s" : ""}
                  </Badge>
                )}
              </div>

              <p className="text-sm text-muted-foreground">
                {contextMessage}
                {totalProducts !== filteredProducts && (
                  <span className="ml-2">
                    ({displayPercentage}% du total -{" "}
                    {totalProducts.toLocaleString()})
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Filter Breakdown */}
          {filterStats.activeFilters > 0 && (
            <div className="flex flex-wrap gap-2">
              {filterStats.categoryFilters > 0 && (
                <Badge variant="outline" className="text-xs">
                  <Tag className="h-3 w-3 mr-1" />
                  {filterStats.categoryFilters} catégorie
                  {filterStats.categoryFilters > 1 ? "s" : ""}
                </Badge>
              )}

              {filterStats.brandFilters > 0 && (
                <Badge variant="outline" className="text-xs">
                  <Package className="h-3 w-3 mr-1" />
                  {filterStats.brandFilters} marque
                  {filterStats.brandFilters > 1 ? "s" : ""}
                </Badge>
              )}

              {filterStats.ratingFilter > 0 && (
                <Badge variant="outline" className="text-xs">
                  <Star className="h-3 w-3 mr-1" />
                  {filters.rating}+ étoiles
                </Badge>
              )}

              {filterStats.priceFilter > 0 && filters.priceRange && (
                <Badge variant="outline" className="text-xs">
                  💰 {formatPrice(filters.priceRange[0])} -{" "}
                  {formatPrice(filters.priceRange[1])}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* No Results Message */}
        {filteredProducts === 0 && !loading && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center text-amber-800">
              <div className="mr-2">⚠️</div>
              <div>
                <p className="font-medium text-sm">Aucun produit trouvé</p>
                <p className="text-xs text-amber-700 mt-1">
                  Essayez de modifier vos filtres pour élargir votre recherche.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Success Message for Good Results */}
        {filteredProducts > 0 &&
          filterStats.activeFilters > 0 &&
          displayPercentage < 50 && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center text-green-800">
                <div className="mr-2">✅</div>
                <p className="text-sm">
                  Filtres appliqués avec succès - {displayPercentage}% des
                  produits correspondent à vos critères.
                </p>
              </div>
            </div>
          )}
      </CardContent>
    </Card>
  );
}
