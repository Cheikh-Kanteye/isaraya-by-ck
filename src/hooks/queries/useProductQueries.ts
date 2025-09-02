import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "@/services/api";
import { queryKeys } from "@/services/queryClient";
import type { Product, ProductsParams } from "@/types";

// Hook pour récupérer tous les produits avec filtres
export function useProducts(params: ProductsParams = {}) {
  return useQuery({
    queryKey: queryKeys.products.list(params),
    queryFn: () => apiService.products.getAll(params),
    enabled: true,
  });
}

// Hook pour récupérer un produit par ID
export function useProduct(id: string) {
  return useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: () => apiService.products.get(id),
    enabled: !!id,
  });
}

// Hook pour récupérer les produits par catégorie
export function useProductsByCategory(categoryId: string) {
  return useQuery({
    queryKey: queryKeys.products.byCategory(categoryId),
    queryFn: () => apiService.products.getByCategory(categoryId),
    enabled: !!categoryId,
  });
}

// Hook pour récupérer les produits par vendeur
export function useProductsByMerchant(merchantId: string) {
  return useQuery({
    queryKey: queryKeys.products.byMerchant(merchantId),
    queryFn: () => apiService.products.getAll({ merchantId }),
    enabled: !!merchantId,
  });
}

// Hook pour la recherche de produits
export function useProductSearch(query: string) {
  return useQuery({
    queryKey: queryKeys.products.search(query),
    queryFn: () => apiService.products.getAll({ search: query }),
    enabled: !!query && query.length > 2,
    staleTime: 30 * 1000, // 30 secondes pour la recherche
  });
}

// Hook pour créer un produit
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (product: Omit<Product, "id" | "createdAt" | "updatedAt">) =>
      apiService.products.createProduct(product),
    // Mise à jour optimiste - ajoute le produit immédiatement
    onMutate: async (newProduct) => {
      // Annuler toutes les requêtes de produits
      await queryClient.cancelQueries({ queryKey: queryKeys.products.all });

      // Sauvegarder l'état précédent
      const previousData = queryClient.getQueriesData({ queryKey: queryKeys.products.all });

      // Créer un produit temporaire avec un ID unique
      const tempProduct: Product = {
        ...newProduct,
        id: `temp-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Ajouter le produit temporaire à TOUTES les requêtes de produits
      queryClient.setQueriesData({ queryKey: queryKeys.products.all }, (oldData: any) => {
        if (!oldData) return [tempProduct];
        
        if (Array.isArray(oldData)) {
          return [tempProduct, ...oldData];
        }
        
        if (oldData.data && Array.isArray(oldData.data)) {
          return { ...oldData, data: [tempProduct, ...oldData.data] };
        }
        
        return oldData;
      });

      return { previousData, tempProduct };
    },
    // En cas d'erreur, restaurer les données précédentes
    onError: (err, newProduct, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    // Remplacer le produit temporaire par le vrai produit du serveur
    onSuccess: (realProduct, variables, context) => {
      if (context?.tempProduct) {
        // Remplacer le produit temporaire par le vrai produit
        queryClient.setQueriesData({ queryKey: queryKeys.products.all }, (oldData: any) => {
          if (!oldData) return oldData;
          
          if (Array.isArray(oldData)) {
            return oldData.map((product: Product) => 
              product.id === context.tempProduct.id ? realProduct : product
            );
          }
          
          if (oldData.data && Array.isArray(oldData.data)) {
            return {
              ...oldData,
              data: oldData.data.map((product: Product) => 
                product.id === context.tempProduct.id ? realProduct : product
              )
            };
          }
          
          return oldData;
        });
      }

      // Ajouter le produit réel au cache de détail
      queryClient.setQueryData(
        queryKeys.products.detail(realProduct.id),
        realProduct
      );
    },
    // Synchroniser avec le serveur
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    },
  });
}

// Hook pour mettre à jour un produit
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) =>
      apiService.products.update(id, data),
    // Mise à jour optimiste - applique les changements immédiatement
    onMutate: async ({ id, data }) => {
      // Annuler toutes les requêtes de produits
      await queryClient.cancelQueries({ queryKey: queryKeys.products.all });

      // Sauvegarder l'état précédent
      const previousData = queryClient.getQueriesData({ queryKey: queryKeys.products.all });

      // Mettre à jour TOUTES les requêtes de produits
      queryClient.setQueriesData({ queryKey: queryKeys.products.all }, (oldData: any) => {
        if (!oldData) return oldData;
        
        if (Array.isArray(oldData)) {
          return oldData.map((product: Product) => 
            product.id === id ? { ...product, ...data } : product
          );
        }
        
        if (oldData.data && Array.isArray(oldData.data)) {
          return {
            ...oldData,
            data: oldData.data.map((product: Product) => 
              product.id === id ? { ...product, ...data } : product
            )
          };
        }
        
        return oldData;
      });

      // Mettre à jour le cache de détail du produit
      queryClient.setQueryData(queryKeys.products.detail(id), (oldProduct: Product | undefined) => {
        if (!oldProduct) return oldProduct;
        return { ...oldProduct, ...data };
      });

      return { previousData };
    },
    // En cas d'erreur, restaurer les données précédentes
    onError: (err, { id, data }, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    // Remplacer par les vraies données du serveur
    onSuccess: (updatedProduct) => {
      // Mettre à jour le cache de détail avec les données réelles
      queryClient.setQueryData(
        queryKeys.products.detail(updatedProduct.id),
        updatedProduct
      );
    },
    // Synchroniser avec le serveur
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    },
  });
}

// Hook pour supprimer un produit
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiService.products.delete(id),
    // Mise à jour optimiste - retire le produit immédiatement
    onMutate: async (deletedId) => {
      // Annuler toutes les requêtes de produits en cours
      await queryClient.cancelQueries({ queryKey: queryKeys.products.all });

      // Sauvegarder l'état précédent pour le rollback
      const previousData = queryClient.getQueriesData({ queryKey: queryKeys.products.all });

      // Mettre à jour TOUTES les requêtes de produits
      queryClient.setQueriesData({ queryKey: queryKeys.products.all }, (oldData: any) => {
        if (!oldData) return oldData;
        
        if (Array.isArray(oldData)) {
          return oldData.filter((product: Product) => product.id !== deletedId);
        }
        
        if (oldData.data && Array.isArray(oldData.data)) {
          return { ...oldData, data: oldData.data.filter((product: Product) => product.id !== deletedId) };
        }
        
        return oldData;
      });

      return { previousData };
    },
    // En cas d'erreur, restaurer les données précédentes
    onError: (err, deletedId, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    // Synchroniser avec le serveur après la mutation
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    },
  });
}

// Hook pour précharger un produit
export function usePrefetchProduct() {
  const queryClient = useQueryClient();

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.products.detail(id),
      queryFn: () => apiService.products.get(id),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };
}
