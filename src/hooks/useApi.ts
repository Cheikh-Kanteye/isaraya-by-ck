import { useState, useEffect, useCallback } from "react";
import { apiService } from "@/services/api";
// Removed categoryService and ExtendedCategory import
import type { Product, Brand, Order, User, MerchantProfile, Category } from "@/types"; // Added MerchantProfile and Category

// Hook générique pour les requêtes API
export function useApiData<T>(
  apiCall: () => Promise<T>,
  dependencies: unknown[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await apiCall();

        if (isMounted) {
          setData(result);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Erreur inconnue");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      abortController.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return { data, loading, error };
}
// Hooks spécifiques pour les produits
interface ProductsParams {
  categoryId?: string;
  brandId?: string;
  merchantId?: string; // Renamed from vendorId
  search?: string;
  _limit?: number;
  _page?: number;
  _sort?: string;
  _order?: "asc" | "desc";
  price_gte?: number;
  price_lte?: number;
  brands_like?: string;
  // vendors_like?: string; // Removed as it's replaced by merchantId
  rating_gte?: number;
  inStock?: boolean;
  attributes?: { [key: string]: string[] };
}

export function useProducts(params: ProductsParams = {}) {
  const paramsString = JSON.stringify(params);

  const fetchProducts = useCallback(() => {
    return apiService.products.getAll(JSON.parse(paramsString));
  }, [paramsString]);

  return useApiData<Product[]>(fetchProducts, [fetchProducts]);
}

export function useProduct(id: string) {
  return useApiData<Product>(() => apiService.products.get(id), [id]);
}

// Hooks pour les catégories
export function useCategories() {
  return useApiData<Category[]>(() => apiService.categories.getAll(), []);
}

export function useCategory(id: string) {
  return useApiData<Category | null>(async () => {
    const categories = await apiService.categories.getAll();
    return categories.find((cat) => cat.id === id) || null;
  }, [id]);
}

export function useMainCategories() {
  const [data, setData] = useState<Category[]>([]); // Changed to Category[]
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMainCategories = async () => {
      try {
        setLoading(true);
        const categories = await apiService.categories.getAll({ parentId: null }); // Assuming API supports filtering main categories
        setData(categories);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Erreur lors du chargement des catégories principales"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMainCategories();
  }, []);

  return { data, loading, error };
}

export function useSubcategories(parentId: string) {
  const [data, setData] = useState<Category[]>([]); // Changed to Category[]
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!parentId) {
      setData([]);
      setLoading(false);
      return;
    }

    const fetchSubcategories = async () => {
      try {
        setLoading(true);
        // apiService.categories.getSubcategories is no longer needed, filter directly
        const allCategories = await apiService.categories.getAll();
        const subcategories = allCategories.filter(category => category.parentId === parentId);
        setData(subcategories);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Erreur lors du chargement des sous-catégories"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSubcategories();
  }, [parentId]);

  return { data, loading, error };
}

// Hooks pour les marques
export function useBrands() {
  return useApiData<Brand[]>(() => apiService.brands.getAll(), []) as {
    data: Brand[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
  };
}

export function useBrand(id: string) {
  return useApiData<Brand>(() => apiService.brands.get(id), [id]);
}

// Hooks pour les marchands // Renamed from Hooks pour les vendeurs
export function useMerchants() {
  return useApiData<MerchantProfile[]>(() => apiService.users.getMerchants(), []); // Changed to MerchantProfile[]
}

export function useMerchant(id: string) {
  return useApiData<MerchantProfile>(() => apiService.users.getMerchant(id), [id]); // Changed to MerchantProfile
}

// Hooks pour les commandes
interface OrdersParams {
  userId?: string;
  merchantId?: string; // Renamed from vendorId
  status?: string;
  _limit?: number;
  _page?: number;
  _sort?: string;
  _order?: "asc" | "desc";
}

export function useOrders(params: OrdersParams = {}) {
  const paramsString = JSON.stringify(params);

  const fetchOrders = useCallback(() => {
    return apiService.orders.getAll(JSON.parse(paramsString));
  }, [paramsString]);

  return useApiData<Order[]>(fetchOrders, [fetchOrders]);
}

export function useOrder(id: string) {
  return useApiData<Order>(() => apiService.orders.get(id), [id]);
}

// Hook pour les mutations (création, mise à jour, suppression)
export function useApiMutation<T, P>(mutationFn: (params: P) => Promise<T>) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(
    async (params: P): Promise<T | null> => {
      try {
        setLoading(true);
        setError(null);
        const result = await mutationFn(params);
        return result;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Une erreur est survenue"
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    [mutationFn]
  );

  return { mutate, loading, error };
}
