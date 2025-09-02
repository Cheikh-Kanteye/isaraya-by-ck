import { Product } from "@/types";
import { useState, useMemo, useCallback, useEffect } from "react";

interface UseProductSearchProps {
  products: Product[];
  defaultSortBy?: string;
  defaultViewMode?: "grid" | "list";
}

interface UseProductSearchReturn {
  // Search state
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  debouncedSearchQuery: string;

  // Sort state
  sortBy: string;
  setSortBy: (sortBy: string) => void;

  // View state
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;

  // Filtered and sorted products
  filteredProducts: Product[];

  // Stats
  totalProducts: number;

  // Actions
  clearSearch: () => void;
  resetAll: () => void;
}

export function useProductSearch({
  products,
  defaultSortBy = "name-asc",
  defaultViewMode = "grid",
}: UseProductSearchProps): UseProductSearchReturn {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState(defaultSortBy);
  const [viewMode, setViewMode] = useState<"grid" | "list">(defaultViewMode);

  // Debounce search query for performance
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Filter products based on search query
  const searchFilteredProducts = useMemo(() => {
    if (!debouncedSearchQuery.trim()) {
      return products;
    }

    const query = debouncedSearchQuery.toLowerCase().trim();

    return products.filter((product) => {
      // Search in product name
      if (product.name.toLowerCase().includes(query)) {
        return true;
      }

      // Search in description if available
      if (product.description?.toLowerCase().includes(query)) {
        return true;
      }

      // Search by exact price match
      if (product.price.toString() === query) {
        return true;
      }

      return false;
    });
  }, [products, debouncedSearchQuery]);

  // Sort products based on sort criteria
  const filteredProducts = useMemo(() => {
    const sortedProducts = [...searchFilteredProducts];

    switch (sortBy) {
      case "name-asc":
        return sortedProducts.sort((a, b) => a.name.localeCompare(b.name));

      case "name-desc":
        return sortedProducts.sort((a, b) => b.name.localeCompare(a.name));

      case "price-asc":
        return sortedProducts.sort((a, b) => a.price - b.price);

      case "price-desc":
        return sortedProducts.sort((a, b) => b.price - a.price);

      case "rating-desc":
        return sortedProducts.sort((a, b) => {
          if (b.rating === a.rating) {
            return a.name.localeCompare(b.name); // Secondary sort by name
          }
          return b.rating - a.rating;
        });

      case "newest":
        return sortedProducts.sort((a, b) => {
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        });

      default:
        return sortedProducts;
    }
  }, [searchFilteredProducts, sortBy]);

  // Actions
  const clearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  const resetAll = useCallback(() => {
    setSearchQuery("");
    setSortBy(defaultSortBy);
    setViewMode(defaultViewMode);
  }, [defaultSortBy, defaultViewMode]);

  // Save preferences to localStorage (should persist across sessions)
  useEffect(() => {
    try {
      localStorage.setItem("catalog-sort-preference", sortBy);
      localStorage.setItem("catalog-view-preference", viewMode);
    } catch (error) {
      // Ignore localStorage errors in case of restrictions
      console.warn("Could not save preferences to localStorage:", error);
    }
  }, [sortBy, viewMode]);

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const savedSortBy = localStorage.getItem("catalog-sort-preference");
      const savedViewMode = localStorage.getItem("catalog-view-preference");

      if (savedSortBy) {
        setSortBy(savedSortBy);
      }

      if (savedViewMode) {
        setViewMode(savedViewMode as "grid" | "list");
      }
    } catch (error) {
      // Ignore localStorage errors
      console.warn("Could not load preferences from localStorage:", error);
    }
  }, []);

  return {
    // Search state
    searchQuery,
    setSearchQuery,
    debouncedSearchQuery,

    // Sort state
    sortBy,
    setSortBy,

    // View state
    viewMode,
    setViewMode,

    // Filtered and sorted products
    filteredProducts,

    // Stats
    totalProducts: products.length,

    // Actions
    clearSearch,
    resetAll,
  };
}

// Simple debounce hook implementation
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
