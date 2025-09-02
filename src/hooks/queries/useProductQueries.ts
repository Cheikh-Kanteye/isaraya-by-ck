import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { queryKeys, handleQueryError } from '@/lib/queryClient';
import { toast } from 'sonner';
import type { Product, ProductsParams } from '@/types';

// Hook pour récupérer tous les produits avec filtres
export function useProducts(params: ProductsParams = {}) {
  return useQuery({
    queryKey: queryKeys.products.list(params),
    queryFn: () => apiService.products.getAll(params),
    staleTime: 2 * 60 * 1000, // 2 minutes pour les produits
    select: (data) => data || [], // Assurer qu'on retourne toujours un tableau
    meta: {
      errorMessage: 'Erreur lors du chargement des produits',
    },
  });
}

// Hook pour récupérer un produit par ID
export function useProduct(id: string) {
  return useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: () => apiService.products.get(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    meta: {
      errorMessage: 'Erreur lors du chargement du produit',
    },
  });
}

// Hook pour récupérer les produits par catégorie
export function useProductsByCategory(categoryId: string) {
  return useQuery({
    queryKey: queryKeys.products.byCategory(categoryId),
    queryFn: () => apiService.products.getByCategory(categoryId),
    enabled: !!categoryId,
    staleTime: 3 * 60 * 1000,
    select: (data) => data || [],
  });
}

// Hook pour récupérer les produits par marchand
export function useProductsByMerchant(merchantId: string) {
  return useQuery({
    queryKey: queryKeys.products.byMerchant(merchantId),
    queryFn: () => apiService.products.getAll({ merchantId }),
    enabled: !!merchantId,
    staleTime: 2 * 60 * 1000,
    select: (data) => data || [],
  });
}

// Hook pour la recherche de produits avec pagination infinie
export function useInfiniteProducts(params: ProductsParams = {}) {
  return useInfiniteQuery({
    queryKey: queryKeys.products.infinite(params),
    queryFn: ({ pageParam = 1 }) => 
      apiService.products.getAll({ ...params, _page: pageParam, _limit: 12 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      // Logique pour déterminer s'il y a une page suivante
      if (lastPage.length < 12) return undefined;
      return allPages.length + 1;
    },
    staleTime: 2 * 60 * 1000,
  });
}

// Hook pour créer un produit avec optimistic update
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) =>
      apiService.products.createProduct(product),
    
    // Optimistic update
    onMutate: async (newProduct) => {
      // Annuler toutes les requêtes de produits en cours
      await queryClient.cancelQueries({ queryKey: queryKeys.products.all });

      // Sauvegarder l'état précédent pour le rollback
      const previousData = queryClient.getQueriesData({ queryKey: queryKeys.products.all });

      // Créer un produit temporaire avec un ID unique
      const tempProduct: Product = {
        ...newProduct,
        id: `temp-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Ajouter le produit temporaire à toutes les listes de produits
      queryClient.setQueriesData({ queryKey: queryKeys.products.lists() }, (oldData: any) => {
        if (!oldData) return [tempProduct];
        if (Array.isArray(oldData)) {
          return [tempProduct, ...oldData];
        }
        return oldData;
      });

      // Feedback immédiat à l'utilisateur
      toast.success('Produit en cours d\'ajout...', { duration: 2000 });

      return { previousData, tempProduct };
    },

    // En cas d'erreur, rollback
    onError: (error, newProduct, context) => {
      // Restaurer les données précédentes
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      const errorMessage = handleQueryError(error);
      toast.error(`Échec de l'ajout du produit: ${errorMessage}`);
    },

    // Remplacer le produit temporaire par le vrai produit
    onSuccess: (realProduct, variables, context) => {
      if (context?.tempProduct) {
        // Remplacer le produit temporaire par le vrai produit
        queryClient.setQueriesData({ queryKey: queryKeys.products.lists() }, (oldData: any) => {
          if (!oldData) return oldData;
          if (Array.isArray(oldData)) {
            return oldData.map((product: Product) => 
              product.id === context.tempProduct.id ? realProduct : product
            );
          }
          return oldData;
        });
      }

      // Ajouter le produit réel au cache de détail
      queryClient.setQueryData(queryKeys.products.detail(realProduct.id), realProduct);
      
      toast.success('Produit ajouté avec succès!');
    },

    // Synchroniser avec le serveur
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    },
  });
}

// Hook pour mettre à jour un produit avec optimistic update
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) =>
      apiService.products.update(id, data),
    
    // Optimistic update
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.products.all });

      const previousData = queryClient.getQueriesData({ queryKey: queryKeys.products.all });

      // Mettre à jour immédiatement toutes les listes de produits
      queryClient.setQueriesData({ queryKey: queryKeys.products.lists() }, (oldData: any) => {
        if (!oldData) return oldData;
        if (Array.isArray(oldData)) {
          return oldData.map((product: Product) => 
            product.id === id ? { ...product, ...data, updatedAt: new Date().toISOString() } : product
          );
        }
        return oldData;
      });

      // Mettre à jour le cache de détail
      queryClient.setQueryData(queryKeys.products.detail(id), (oldProduct: Product | undefined) => {
        if (!oldProduct) return oldProduct;
        return { ...oldProduct, ...data, updatedAt: new Date().toISOString() };
      });

      toast.success('Modification en cours...', { duration: 2000 });

      return { previousData };
    },

    onError: (error, { id }, context) => {
      // Rollback
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      const errorMessage = handleQueryError(error);
      toast.error(`Échec de la modification: ${errorMessage}`);
    },

    onSuccess: (updatedProduct) => {
      // Mettre à jour avec les vraies données du serveur
      queryClient.setQueryData(queryKeys.products.detail(updatedProduct.id), updatedProduct);
      toast.success('Produit modifié avec succès!');
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    },
  });
}

// Hook pour supprimer un produit avec optimistic update
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiService.products.delete(id),
    
    // Optimistic update - retirer immédiatement le produit
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.products.all });

      const previousData = queryClient.getQueriesData({ queryKey: queryKeys.products.all });

      // Retirer immédiatement le produit de toutes les listes
      queryClient.setQueriesData({ queryKey: queryKeys.products.lists() }, (oldData: any) => {
        if (!oldData) return oldData;
        if (Array.isArray(oldData)) {
          return oldData.filter((product: Product) => product.id !== deletedId);
        }
        return oldData;
      });

      // Retirer du cache de détail
      queryClient.removeQueries({ queryKey: queryKeys.products.detail(deletedId) });

      toast.success('Produit supprimé', { duration: 2000 });

      return { previousData, deletedId };
    },

    onError: (error, deletedId, context) => {
      // Rollback - restaurer le produit
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      const errorMessage = handleQueryError(error);
      toast.error(`Échec de la suppression: ${errorMessage}`);
    },

    onSuccess: () => {
      toast.success('Produit supprimé définitivement!');
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    },
  });
}

// Hook pour précharger un produit (optimisation UX)
export function usePrefetchProduct() {
  const queryClient = useQueryClient();

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.products.detail(id),
      queryFn: () => apiService.products.get(id),
      staleTime: 5 * 60 * 1000,
    });
  };
}

// Hook pour la recherche de produits avec debounce
export function useProductSearch(query: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.products.search(query),
    queryFn: () => apiService.products.getAll({ search: query }),
    enabled: enabled && query.length > 2,
    staleTime: 30 * 1000, // 30 secondes pour la recherche
    select: (data) => data || [],
  });
}

// Hook pour les mutations en lot (bulk operations)
export function useBulkUpdateProducts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Array<{ id: string; data: Partial<Product> }>) => {
      // Exécuter toutes les mises à jour en parallèle
      const promises = updates.map(({ id, data }) => 
        apiService.products.update(id, data)
      );
      return Promise.all(promises);
    },

    onMutate: async (updates) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.products.all });
      const previousData = queryClient.getQueriesData({ queryKey: queryKeys.products.all });

      // Appliquer toutes les mises à jour optimistes
      updates.forEach(({ id, data }) => {
        queryClient.setQueriesData({ queryKey: queryKeys.products.lists() }, (oldData: any) => {
          if (!oldData || !Array.isArray(oldData)) return oldData;
          return oldData.map((product: Product) => 
            product.id === id ? { ...product, ...data } : product
          );
        });
      });

      toast.success(`Mise à jour de ${updates.length} produit(s) en cours...`);
      return { previousData };
    },

    onError: (error, updates, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error('Échec de la mise à jour en lot');
    },

    onSuccess: (results) => {
      toast.success(`${results.length} produit(s) mis à jour avec succès!`);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    },
  });
}