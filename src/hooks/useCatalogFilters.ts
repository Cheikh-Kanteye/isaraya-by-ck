import { useEffect, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useProductStore } from "@/stores/productStore";
import { categoryService } from "@/services/categoryService";
import { Brand, Category } from "@/types";

interface FilterState {
  search: string;
  status: string[];
  category: string;
  brand: string[];
}

interface BreadcrumbItem {
  label: string;
  path: string;
}

interface CatalogContext {
  id?: string;
  isSubcategory: boolean;
  parentCategoryId?: string;
  name?: string;
}

interface CatalogFiltersReturn {
  // Context
  context: CatalogContext;
  breadcrumbs: BreadcrumbItem[];

  // Filter data
  filters: FilterState;
  availableCategories: Category[];
  availableBrands: Brand[];
  filteredAvailableCategories: Category[];

  // Filter actions
  handleFiltersChange: (newFilters: Partial<FilterState>) => void;
  handleClearFilters: () => void;

  // State
  isLoading: boolean;
  error: string | null;

  // Display helpers
  pageTitle: string;
  pageDescription: string;
  shouldHideCategories: boolean;
}

export function useCatalogFilters(): CatalogFiltersReturn {
  const { category: categoryId, subcategory: subcategoryId } = useParams<{
    category?: string;
    subcategory?: string;
  }>();

  const {
    filters,
    setFilters,
    clearFilters,
    fetchProducts,
    fetchCategories,
    fetchBrands,
    categories,
    availableCategories,
    availableBrands,
    products,
    updateAvailableFilters,
    isLoading,
    error,
  } = useProductStore();

  // Determine current context (category or subcategory)
  const context = useMemo((): CatalogContext => {
    const currentId = subcategoryId || categoryId;
    const isSubcategory = Boolean(subcategoryId);
    const name = categories.find((c) => c.id === currentId)?.name;

    return {
      id: currentId,
      isSubcategory,
      parentCategoryId: isSubcategory ? categoryId : undefined,
      name,
    };
  }, [categoryId, subcategoryId, categories]);

  // Generate breadcrumbs
  const breadcrumbs = useMemo(() => {
    const baseItems: BreadcrumbItem[] = [
      { label: "Accueil", path: "/" },
      { label: "Catalogue", path: "/catalog" },
    ];

    if (!categoryId) return baseItems;

    // This will be populated by useEffect for async data
    return baseItems;
  }, [categoryId]);

  // Get filtered categories for display
  const filteredAvailableCategories = useMemo(() => {
    if (context.isSubcategory) {
      // Si on est dans une sous-catégorie, on ne montre pas les filtres de catégories
      return [];
    }

    if (context.id) {
      // Si on est dans une catégorie, on montre seulement ses sous-catégories
      return availableCategories.filter((cat) => cat.parentId === context.id);
    }

    // Si on est à la racine, on montre toutes les catégories principales
    return availableCategories.filter((cat) => !cat.parentId);
  }, [availableCategories, context]);

  // Filter change handlers
  const handleFiltersChange = useCallback(
    (newFilters: Partial<FilterState>) => {
      setFilters(newFilters);
    },
    [setFilters]
  );

  const handleClearFilters = useCallback(() => {
    clearFilters();
  }, [clearFilters]);

  // Generate page title and description
  const pageTitle = useMemo(() => {
    if (context.isSubcategory && context.name) {
      return context.name;
    }
    return context.name || "Tous les produits";
  }, [context]);

  const pageDescription = useMemo(() => {
    if (context.isSubcategory) {
      return "Découvrez notre sélection spécialisée de produits.";
    }
    if (context.id) {
      return "Explorez tous les produits de cette catégorie.";
    }
    return "Découvrez notre sélection de produits de qualité.";
  }, [context]);

  // Should hide categories in filters
  const shouldHideCategories = context.isSubcategory;

  // Fetch initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([fetchProducts(), fetchCategories(), fetchBrands()]);
      } catch (err) {
        console.error("Error loading catalog data:", err);
      }
    };

    loadData();
  }, [fetchCategories, fetchBrands, fetchProducts]);

  // Update filters when category/subcategory changes
  useEffect(() => {
    const targetId = context.id;

    if (targetId) {
      const filterUpdate: Partial<FilterState> = {
        categories: [targetId],
      };

      setFilters(filterUpdate);
      updateAvailableFilters(targetId);
    } else {
      clearFilters();
      updateAvailableFilters();
    }
  }, [context.id, setFilters, clearFilters, updateAvailableFilters]);

  return {
    // Context
    context,
    breadcrumbs,

    // Filter data
    filters,
    availableCategories,
    availableBrands,
    filteredAvailableCategories,

    // Filter actions
    handleFiltersChange,
    handleClearFilters,

    // State
    isLoading,
    error,

    // Display helpers
    pageTitle,
    pageDescription,
    shouldHideCategories,
  };
}
