import { create } from "zustand";
import { apiService } from "@/services/api";
import type { Product, Category, Brand } from "@/types";
import { getCompatibleCategories } from "@/data/categoryHierarchy";

export type { Product, Category, Brand } from "@/types";

export interface FilterState {
  search?: string;
  categories?: string[];
  brands?: string[];
  priceRange?: [number, number];
  rating?: number;
  sortBy?: "name_asc" | "name_desc" | "price_asc" | "price_desc" | "newest";
}

interface ProductState {
  products: Product[];
  merchantProducts: Product[];
  filteredProducts: Product[];
  categories: Category[];
  brands: Brand[];
  availableCategories: Category[];
  availableBrands: Brand[];
  filters: FilterState;
  isLoading: boolean;
  error: string | null;
  lastFetchTime: number | null;
  cachedMerchantId: string | null;
  fetchProducts: () => Promise<void>;
  setMerchantProducts: (products: Product[]) => void;
  fetchCategories: () => Promise<void>;
  fetchBrands: () => Promise<void>;
  fetchProductsByCategory: (categoryId: string) => Promise<void>;
  updateAvailableFilters: (categoryId?: string) => void;
  createProduct: (
    productData: Omit<Product, "id" | "createdAt" | "updatedAt">
  ) => Promise<Product>;
  updateProduct: (
    id: string,
    productData: Partial<Product>
  ) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;
  setFilters: (newFilters: Partial<FilterState>) => Promise<void>;
  clearFilters: () => Promise<void>;
}

const initialFilters: FilterState = {
  search: "",
  categories: [],
  brands: [],
  priceRange: [0, 10000000],
  rating: 0,
  sortBy: "price_asc",
};

const applyFilters = async (
  products: Product[],
  filters: FilterState
): Promise<Product[]> => {
  let filtered = [...products];

  // Search filter
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    filtered = filtered.filter((p) =>
      p.name.toLowerCase().includes(searchTerm)
    );
  }

  // Category filter with hierarchy support
  if (filters.categories && filters.categories.length > 0) {
    try {
      const compatibleCategories = await getCompatibleCategories(
        filters.categories
      );

      filtered = filtered.filter((p) => {
        if (!p.categoryId) return false;
        return (
          compatibleCategories.includes(p.categoryId) ||
          filters.categories?.includes(p.categoryId)
        );
      });
    } catch (error) {
      console.error("Error filtering categories:", error);
      filtered = filtered.filter(
        (p) => p.categoryId && filters.categories?.includes(p.categoryId)
      );
    }
  }

  // Brand filter
  if (filters.brands && filters.brands.length > 0) {
    filtered = filtered.filter(
      (p) => p.brandId && filters.brands?.includes(p.brandId)
    );
  }

  // Price range filter
  if (filters.priceRange) {
    filtered = filtered.filter(
      (p) =>
        p.price >= filters.priceRange![0] && p.price <= filters.priceRange![1]
    );
  }

  // Rating filter
  if (filters.rating && filters.rating > 0) {
    filtered = filtered.filter((p) => p.rating >= filters.rating!);
  }

  // Sorting
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
        filtered.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
    }
  }

  return filtered;
};

const getDescendantCategories = (
  categoryId: string,
  allCategories: Category[]
): string[] => {
  const descendants: string[] = [];
  const children = allCategories.filter((cat) => cat.parentId === categoryId);

  for (const child of children) {
    descendants.push(child.id);
    descendants.push(...getDescendantCategories(child.id, allCategories));
  }

  return descendants;
};

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  merchantProducts: [],
  filteredProducts: [],
  categories: [],
  brands: [],
  availableCategories: [],
  availableBrands: [],
  filters: { ...initialFilters },
  isLoading: false,
  error: null,
  lastFetchTime: null,
  cachedMerchantId: null,

  fetchProducts: async () => {
    set({ isLoading: true });
    try {
      const products = await apiService.products.getAll();
      const { filters } = get();
      const filteredProducts = await applyFilters(products, filters);

      set({
        products,
        filteredProducts,
        isLoading: false,
        lastFetchTime: Date.now(),
      });
    } catch (error) {
      console.error("Error fetching products:", error);
      set({ error: "Failed to fetch products", isLoading: false });
    }
  },

  setMerchantProducts: (products: Product[]) => {
    set({ merchantProducts: products, isLoading: false });
  },

  fetchCategories: async () => {
    try {
      const categories = await apiService.categories.getAll();
      set({ categories, isLoading: false });
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      set({ isLoading: false });
    }
  },

  fetchBrands: async () => {
    if (get().brands.length > 0) return;
    set({ isLoading: true });
    try {
      const brands = await apiService.brands.getAll();
      set({ brands, isLoading: false });
    } catch (error) {
      console.error("Error fetching brands:", error);
      set({ isLoading: false });
    }
  },

  fetchProductsByCategory: async (categoryId: string) => {
    set({ isLoading: true });
    try {
      const products = await apiService.products.getByCategory(categoryId);
      const { filters } = get();
      const filteredProducts = await applyFilters(products, filters);
      console.log(
        "Fetched products for category:",
        categoryId,
        products.length
      );

      set({
        products,
        filteredProducts,
        isLoading: false,
        lastFetchTime: Date.now(),
      });
    } catch (error) {
      console.error("Error fetching products by category:", error);
      set({
        error: "Failed to fetch products for this category. Please try again.",
        isLoading: false,
      });
    }
  },

  updateAvailableFilters: (categoryId?: string) => {
    const { products, categories, brands } = get();

    let relevantProducts = products;

    if (categoryId) {
      const descendantCategories = getDescendantCategories(
        categoryId,
        categories
      );
      const allRelevantCategories = [categoryId, ...descendantCategories];

      relevantProducts = products.filter(
        (product) =>
          product.categoryId &&
          allRelevantCategories.includes(product.categoryId)
      );
    }

    const relevantCategoryIds = new Set(
      relevantProducts.map((product) => product.categoryId).filter(Boolean)
    );

    const relevantBrandIds = new Set(
      relevantProducts.map((product) => product.brandId).filter(Boolean)
    );

    const availableCategories = categories.filter((category) =>
      relevantCategoryIds.has(category.id)
    );

    const availableBrands = brands.filter((brand) =>
      relevantBrandIds.has(brand.id)
    );

    set({ availableCategories, availableBrands });
  },

  createProduct: async (
    productData: Omit<Product, "id" | "createdAt" | "updatedAt">
  ) => {
    set({ isLoading: true });
    try {
      const createdProduct = await apiService.products.createProduct(
        productData
      );
      const state = get();

      const updatedProducts = [...state.products, createdProduct];
      const filteredProducts = await applyFilters(
        updatedProducts,
        state.filters
      );

      set({
        products: updatedProducts,
        merchantProducts:
          productData.merchantId === state.cachedMerchantId
            ? [...state.merchantProducts, createdProduct]
            : state.merchantProducts,
        filteredProducts,
        isLoading: false,
      });

      return createdProduct;
    } catch (error) {
      console.error("Error creating product:", error);
      set({ isLoading: false });
      throw error;
    }
  },

  updateProduct: async (id: string, productData: Partial<Product>) => {
    set({ isLoading: true });
    try {
      const updatedProduct = await apiService.products.update(id, productData);
      const state = get();

      const updatedProducts = state.products.map((p) =>
        p.id === id ? { ...p, ...updatedProduct } : p
      );

      const filteredProducts = await applyFilters(
        updatedProducts,
        state.filters
      );

      set({
        products: updatedProducts,
        merchantProducts: state.merchantProducts.map((p) =>
          p.id === id ? { ...p, ...updatedProduct } : p
        ),
        filteredProducts,
        isLoading: false,
      });

      return updatedProduct;
    } catch (error) {
      console.error("Error updating product:", error);
      set({
        error: "Failed to update product. Please try again.",
        isLoading: false,
      });
      throw error;
    }
  },

  deleteProduct: async (id: string) => {
    set({ isLoading: true });
    try {
      await apiService.products.delete(id);
      const state = get();

      const updatedProducts = state.products.filter((p) => p.id !== id);
      const filteredProducts = await applyFilters(
        updatedProducts,
        state.filters
      );

      set({
        products: updatedProducts,
        merchantProducts: state.merchantProducts.filter((p) => p.id !== id),
        filteredProducts,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error deleting product:", error);
      set({
        error: "Failed to delete product. Please try again.",
        isLoading: false,
      });
      throw error;
    }
  },

  setFilters: async (newFilters) => {
    const currentState = get();
    const updatedFilters = { ...currentState.filters, ...newFilters };

    set({ filters: updatedFilters, isLoading: true });

    try {
      const filteredProducts = await applyFilters(
        currentState.products,
        updatedFilters
      );
      set({ filteredProducts, isLoading: false });
    } catch (error) {
      console.error("Error applying filters:", error);
      set({
        error: "Failed to apply filters. Please try again.",
        isLoading: false,
      });
    }
  },

  clearFilters: async () => {
    const currentState = get();
    set({ filters: { ...initialFilters }, isLoading: true });

    try {
      const filteredProducts = await applyFilters(
        currentState.products,
        initialFilters
      );
      set({ filteredProducts, isLoading: false });
    } catch (error) {
      console.error("Error clearing filters:", error);
      set({
        error: "Failed to clear filters. Please try again.",
        isLoading: false,
      });
    }
  },
}));
