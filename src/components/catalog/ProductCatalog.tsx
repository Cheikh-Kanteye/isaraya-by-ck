import React, { useMemo, useCallback } from "react";
import { Grid, List, Search } from "lucide-react";
import { useProducts, useCategories, useBrands } from "@/hooks/queries";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Skeleton } from "../ui/skeleton";
import { type Product } from "@/types";
import { ProductCard } from "../products/ProductCard";
import { useParams } from "react-router-dom";
import { QueryErrorBoundary } from "../shared/QueryErrorBoundary";

interface FilterState {
  search?: string;
  categories?: string[];
  brands?: string[];
  priceRange?: [number, number];
  rating?: number;
  sortBy?: "name_asc" | "name_desc" | "price_asc" | "price_desc" | "newest";
}

const SORT_OPTIONS = [
  { value: "newest", label: "Plus récents" },
  { value: "price_asc", label: "Prix croissant" },
  { value: "price_desc", label: "Prix décroissant" },
  { value: "name_asc", label: "Nom A-Z" },
  { value: "name_desc", label: "Nom Z-A" },
] as const;

interface ProductCatalogProps {
  showSearch?: boolean;
  showFilters?: boolean;
  showViewToggle?: boolean;
  itemsPerPage?: number;
  className?: string;
}

export function ProductCatalog({
  showSearch = true,
  showFilters = true,
  showViewToggle = true,
  itemsPerPage = 12, // TODO: Implement pagination
  className = "",
}: ProductCatalogProps) {
  const [filters, setFilters] = React.useState<FilterState>({
    search: "",
    categories: [],
    brands: [],
    priceRange: [0, 100000],
    rating: 0,
    sortBy: "price_asc",
  });
  
  const { categoryId } = useParams<{ categoryId?: string }>();
  
  // Utiliser React Query pour récupérer les données
  const { data: products = [], isLoading: productsLoading } = useProducts({
    categoryId,
    search: filters.search,
    _limit: itemsPerPage,
  });
  
  const { data: categories = [] } = useCategories();
  const { data: brands = [] } = useBrands();

  // Filtrer les produits côté client (ou implémenter côté serveur)
  const filteredProducts = useMemo(() => {
    let filtered = [...products];
    
    // Filtrer par catégories
    if (filters.categories && filters.categories.length > 0) {
      filtered = filtered.filter(p => 
        filters.categories?.includes(p.categoryId)
      );
    }
    
    // Filtrer par marques
    if (filters.brands && filters.brands.length > 0) {
      filtered = filtered.filter(p => 
        filters.brands?.includes(p.brandId)
      );
    }
    
    // Filtrer par prix
    if (filters.priceRange) {
      filtered = filtered.filter(p => 
        p.price >= filters.priceRange![0] && p.price <= filters.priceRange![1]
      );
    }
    
    // Filtrer par note
    if (filters.rating && filters.rating > 0) {
      filtered = filtered.filter(p => p.rating >= filters.rating!);
    }
    
    // Trier
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case "name_asc":
          filtered.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case "name_desc":
          filtered.sort((a, b) => b.name.localeCompare(a.name));
          break;
        case "price_asc":
          filtered.sort((a, b) => a.price - b.price);
          break;
        case "price_desc":
          filtered.sort((a, b) => b.price - a.price);
          break;
        case "newest":
          filtered.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          break;
      }
    }
    
    return filtered;
  }, [products, filters]);

  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");

  // Memoized available subcategories for current category
  const availableSubcategories = useMemo(() => {
    if (!categoryId) return [];
    return categories.filter((cat) => cat.parentId === categoryId);
  }, [categories, categoryId]);

  // Memoized callbacks to prevent unnecessary re-renders
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFilters(prev => ({ ...prev, search: e.target.value }));
    },
    []
  );

  const handleCategoryChange = useCallback(
    (value: string) => {
      setFilters(prev => ({ ...prev, categories: value === "all" ? [] : [value] }));
    },
    []
  );

  const handleBrandChange = useCallback(
    (value: string) => {
      setFilters(prev => ({ ...prev, brands: value === "all" ? [] : [value] }));
    },
    []
  );

  const handleSortChange = useCallback(
    (value: string) => {
      setFilters(prev => ({ ...prev, sortBy: value as FilterState["sortBy"] }));
    },
    []
  );

  const handleViewModeChange = useCallback((mode: "grid" | "list") => {
    setViewMode(mode);
  }, []);

  const handleAddToFavorites = useCallback((product: Product) => {
    // TODO: Implement favorite logic
    console.log("Ajout aux favoris:", product);
  }, []);

  // Memoized grid class to avoid recalculation
  const gridClassName = useMemo(() => {
    return `grid gap-6 ${
      viewMode === "grid"
        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        : "grid-cols-1"
    }`;
  }, [viewMode]);

  // Memoized skeleton array to avoid recreation
  const skeletonArray = useMemo(() => Array.from({ length: 6 }), []);

  return (
    <QueryErrorBoundary>
      <div className={`space-y-6 ${className}`}>
        {/* Toolbar: Search, Filters, View Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          {showSearch && (
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Rechercher des produits..."
                value={filters.search || ""}
                onChange={handleSearchChange}
                className="pl-10"
              />
            </div>
          )}

          <div className="flex flex-wrap gap-2 items-center">
            {showFilters && (
              <>
                {/* Category Filter - Only show if there are subcategories */}
                {availableSubcategories.length > 0 && (
                  <Select
                    value={filters.categories?.[0] || "all"}
                    onValueChange={handleCategoryChange}
                  >
                    <SelectTrigger className="w-auto min-w-[180px]">
                      <SelectValue placeholder="Toutes les catégories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les catégories</SelectItem>
                      {availableSubcategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {/* Brand Filter - Only show if there are brands available */}
                {brands.length > 0 && (
                  <Select
                    value={filters.brands?.[0] || "all"}
                    onValueChange={handleBrandChange}
                  >
                    <SelectTrigger className="w-auto min-w-[180px]">
                      <SelectValue placeholder="Toutes les marques" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les marques</SelectItem>
                      {brands.map((brand) => (
                        <SelectItem key={brand.id} value={brand.id}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {/* Sort By Filter */}
                <Select
                  value={filters.sortBy || "newest"}
                  onValueChange={handleSortChange}
                >
                  <SelectTrigger className="w-auto min-w-[180px]">
                    <SelectValue placeholder="Trier par" />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}

            {showViewToggle && (
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => handleViewModeChange("grid")}
                >
                  <Grid className="h-5 w-5" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => handleViewModeChange("list")}
                >
                  <List className="h-5 w-5" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Results count */}
        {!productsLoading && (
          <div className="text-sm text-muted-foreground">
            {filteredProducts.length} produit
            {filteredProducts.length > 1 ? "s" : ""} trouvé
            {filteredProducts.length > 1 ? "s" : ""}
            {categoryId && <span className="ml-2">dans cette catégorie</span>}
          </div>
        )}

        {/* Product Grid / List */}
        <div>
          {productsLoading ? (
            <div className={gridClassName}>
              {skeletonArray.map((_, index) => (
                <Skeleton key={index} className="h-80 w-full" />
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className={gridClassName}>
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onToggleLike={handleAddToFavorites}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <h3 className="text-2xl font-semibold">Aucun produit trouvé</h3>
              <p className="text-muted-foreground mt-2">
                {categoryId
                  ? "Aucun produit disponible dans cette catégorie. Essayez d'ajuster vos filtres."
                  : "Essayez d'ajuster vos filtres ou de rechercher autre chose."}
              </p>
            </div>
          )}
        </div>
      </div>
    </QueryErrorBoundary>
  );
}