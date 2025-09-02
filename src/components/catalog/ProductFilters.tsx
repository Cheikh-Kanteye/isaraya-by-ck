import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Star } from "lucide-react";
import { FilterState } from "@/stores/productStore";
import { formatPrice } from "@/lib/utils";
import { HierarchicalCategoryFilter } from "./HierarchicalCategoryFilter";
import type { Category, Brand } from "@/types";

interface ProductFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: Partial<FilterState>) => void;
  onClearFilters: () => void;
  availableCategories: Category[];
  availableBrands: Brand[];
  currentCategoryId?: string;
  className?: string;
}

export function ProductFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  availableCategories,
  availableBrands,
  currentCategoryId,
  className = "",
}: ProductFiltersProps) {
  // Local state for immediate UI feedback
  const [localPriceRange, setLocalPriceRange] = useState<[number, number]>(
    filters.priceRange || [0, 100000]
  );

  useEffect(() => {
    setLocalPriceRange(filters.priceRange || [0, 100000]);
  }, [filters.priceRange]);

  const handlePriceChange = (value: number[]) => {
    const newRange = value as [number, number];
    setLocalPriceRange(newRange);
    onFiltersChange({ priceRange: newRange });
  };

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    const currentCategories = filters.categories || [];
    const newCategories = checked
      ? [...currentCategories, categoryId]
      : currentCategories.filter((id) => id !== categoryId);
    onFiltersChange({ categories: newCategories });
  };

  const handleBrandChange = (brandId: string, checked: boolean) => {
    const currentBrands = filters.brands || [];
    const newBrands = checked
      ? [...currentBrands, brandId]
      : currentBrands.filter((id) => id !== brandId);
    onFiltersChange({ brands: newBrands });
  };

  const handleRatingChange = (rating: number) => {
    onFiltersChange({ rating: filters.rating === rating ? 0 : rating });
  };

  // Memoized filtered brands to avoid unnecessary recalculations
  const filteredBrands = useMemo(() => {
    return availableBrands.filter(
      (brand) => brand.name && brand.name.trim() !== ""
    );
  }, [availableBrands]);

  // Determine if we should show category filter
  const shouldShowCategoryFilter = useMemo(() => {
    // Si on est sur une catégorie spécifique, on peut montrer les sous-catégories
    // Si on est sur "tous les produits", on montre toutes les catégories disponibles
    return !currentCategoryId || availableCategories.length > 1;
  }, [currentCategoryId, availableCategories]);

  return (
    <div className={`space-y-6`}>
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Filtres</h3>
        <Button variant="ghost" size="sm" onClick={onClearFilters}>
          Effacer
        </Button>
      </div>

      {/* Price Range Filter */}
      <div>
        <Label htmlFor="price-range" className="font-semibold">
          Prix
        </Label>
        <Slider
          id="price-range"
          min={0}
          max={1000000}
          step={50}
          value={localPriceRange}
          onValueChange={handlePriceChange}
          minStepsBetweenThumbs={1}
          defaultValue={[0, 5000]}
          className="range-slider mt-4"
        />
        <div className="flex justify-between text-sm text-muted-foreground mt-2">
          <span>{formatPrice(localPriceRange[0])}</span>
          <span>{formatPrice(localPriceRange[1])}</span>
        </div>
      </div>

      {/* Hierarchical Category Filter - Only show if relevant */}
      {shouldShowCategoryFilter && (
        <HierarchicalCategoryFilter
          selectedCategories={filters.categories || []}
          onCategoryChange={handleCategoryChange}
          availableCategories={availableCategories}
          currentCategoryId={currentCategoryId}
        />
      )}

      {/* Brand Filter - Only show if there are brands available */}
      {filteredBrands.length > 0 && (
        <div>
          <h4 className="font-semibold mb-2">Marques</h4>
          <div className="space-y-2 pr-2">
            {filteredBrands.map((brand) => (
              <div key={brand.id} className="flex items-center">
                <Checkbox
                  id={`brand-${brand.id}`}
                  checked={filters.brands?.includes(brand.id)}
                  onCheckedChange={(checked) =>
                    handleBrandChange(brand.id, !!checked)
                  }
                />
                <Label htmlFor={`brand-${brand.id}`} className="ml-2">
                  {brand.name}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rating Filter */}
      <div>
        <h4 className="font-semibold mb-2">Note</h4>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button key={star} onClick={() => handleRatingChange(star)}>
              <Star
                className={`h-6 w-6 transition-colors ${
                  (filters.rating || 0) >= star
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-300 hover:text-yellow-300"
                }`}
              />
            </button>
          ))}
        </div>
        {filters.rating && filters.rating > 0 && (
          <p className="text-sm text-muted-foreground mt-1">
            {filters.rating} étoile{filters.rating > 1 ? "s" : ""} et plus
          </p>
        )}
      </div>

      {/* Filter Summary */}
      {((filters.categories?.length || 0) > 0 ||
        (filters.brands?.length || 0) > 0) && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h5 className="font-medium text-sm text-gray-700 mb-2">
            Filtres actifs:
          </h5>
          <div className="text-sm text-gray-600 space-y-1">
            {(filters.categories?.length || 0) > 0 && (
              <p>
                {filters.categories?.length || 0} catégorie
                {(filters.categories?.length || 0) > 1 ? "s" : ""} sélectionnée
                {(filters.categories?.length || 0) > 1 ? "s" : ""}
              </p>
            )}
            {(filters.brands?.length || 0) > 0 && (
              <p>
                {filters.brands?.length || 0} marque
                {(filters.brands?.length || 0) > 1 ? "s" : ""} sélectionnée
                {(filters.brands?.length || 0) > 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Information contextuelle */}
      {currentCategoryId && (
        <div className="mt-6 p-3 bg-primary/5 rounded-lg">
          <p className="text-sm text-primary">
            Filtres pour cette catégorie uniquement
          </p>
          <p className="text-xs text-primary/80 mt-1">
            {filteredBrands.length} marque{filteredBrands.length > 1 ? "s" : ""}{" "}
            disponible{filteredBrands.length > 1 ? "s" : ""}
          </p>
        </div>
      )}
    </div>
  );
}
