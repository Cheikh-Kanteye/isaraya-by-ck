import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { queryKeys, handleQueryError } from '@/lib/queryClient';
import { toast } from 'sonner';
import type { Category } from '@/types';

// Hook pour récupérer toutes les catégories
export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories.list(),
    queryFn: () => apiService.categories.getAll(),
    staleTime: 10 * 60 * 1000, // 10 minutes - les catégories changent rarement
    select: (data) => data || [],
    meta: {
      errorMessage: 'Erreur lors du chargement des catégories',
    },
  });
}

// Hook pour récupérer une catégorie par ID
export function useCategory(id: string) {
  return useQuery({
    queryKey: queryKeys.categories.detail(id),
    queryFn: async () => {
      const categories = await apiService.categories.getAll();
      return categories.find((cat) => cat.id === id) || null;
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
}

// Hook pour récupérer les catégories principales
export function useMainCategories() {
  return useQuery({
    queryKey: queryKeys.categories.main(),
    queryFn: async () => {
      const categories = await apiService.categories.getAll();
      return categories.filter(cat => !cat.parentId);
    },
    staleTime: 10 * 60 * 1000,
    select: (data) => data || [],
  });
}

// Hook pour récupérer les sous-catégories
export function useSubcategories(parentId: string) {
  return useQuery({
    queryKey: queryKeys.categories.subcategories(parentId),
    queryFn: async () => {
      const categories = await apiService.categories.getAll();
      return categories.filter(cat => cat.parentId === parentId);
    },
    enabled: !!parentId,
    staleTime: 10 * 60 * 1000,
    select: (data) => data || [],
  });
}

// Hook pour créer une catégorie avec optimistic update
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (category: Omit<Category, 'id'>) =>
      apiService.categories.create(category),

    onMutate: async (newCategory) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.categories.all });

      const previousData = queryClient.getQueriesData({ queryKey: queryKeys.categories.all });

      const tempCategory: Category = {
        ...newCategory,
        id: `temp-${Date.now()}`,
      };

      // Ajouter la catégorie temporaire
      queryClient.setQueriesData({ queryKey: queryKeys.categories.lists() }, (oldData: any) => {
        if (!oldData) return [tempCategory];
        if (Array.isArray(oldData)) {
          return [tempCategory, ...oldData];
        }
        return oldData;
      });

      toast.success('Catégorie en cours d\'ajout...', { duration: 2000 });

      return { previousData, tempCategory };
    },

    onError: (error, newCategory, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      const errorMessage = handleQueryError(error);
      toast.error(`Échec de l'ajout de catégorie: ${errorMessage}`);
    },

    onSuccess: (realCategory, variables, context) => {
      if (context?.tempCategory) {
        queryClient.setQueriesData({ queryKey: queryKeys.categories.lists() }, (oldData: any) => {
          if (!oldData || !Array.isArray(oldData)) return oldData;
          return oldData.map((category: Category) => 
            category.id === context.tempCategory.id ? realCategory : category
          );
        });
      }

      queryClient.setQueryData(queryKeys.categories.detail(realCategory.id), realCategory);
      toast.success('Catégorie ajoutée avec succès!');
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
  });
}

// Hook pour mettre à jour une catégorie
export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Category> }) =>
      apiService.categories.update(id, data),

    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.categories.all });

      const previousData = queryClient.getQueriesData({ queryKey: queryKeys.categories.all });

      // Mise à jour optimiste
      queryClient.setQueriesData({ queryKey: queryKeys.categories.lists() }, (oldData: any) => {
        if (!oldData || !Array.isArray(oldData)) return oldData;
        return oldData.map((category: Category) => 
          category.id === id ? { ...category, ...data } : category
        );
      });

      queryClient.setQueryData(queryKeys.categories.detail(id), (oldCategory: Category | undefined) => {
        if (!oldCategory) return oldCategory;
        return { ...oldCategory, ...data };
      });

      toast.success('Modification en cours...', { duration: 1500 });

      return { previousData };
    },

    onError: (error, { id }, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      const errorMessage = handleQueryError(error);
      toast.error(`Échec de la modification: ${errorMessage}`);
    },

    onSuccess: (updatedCategory) => {
      queryClient.setQueryData(queryKeys.categories.detail(updatedCategory.id), updatedCategory);
      toast.success('Catégorie modifiée avec succès!');
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
  });
}

// Hook pour supprimer une catégorie
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiService.categories.delete(id),

    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.categories.all });

      const previousData = queryClient.getQueriesData({ queryKey: queryKeys.categories.all });

      // Retirer immédiatement la catégorie
      queryClient.setQueriesData({ queryKey: queryKeys.categories.lists() }, (oldData: any) => {
        if (!oldData || !Array.isArray(oldData)) return oldData;
        return oldData.filter((category: Category) => category.id !== deletedId);
      });

      queryClient.removeQueries({ queryKey: queryKeys.categories.detail(deletedId) });

      toast.success('Catégorie supprimée', { duration: 2000 });

      return { previousData };
    },

    onError: (error, deletedId, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      const errorMessage = handleQueryError(error);
      toast.error(`Échec de la suppression: ${errorMessage}`);
    },

    onSuccess: () => {
      toast.success('Catégorie supprimée définitivement!');
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
  });
}

// Hook pour précharger une catégorie
export function usePrefetchCategory() {
  const queryClient = useQueryClient();

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.categories.detail(id),
      queryFn: async () => {
        const categories = await apiService.categories.getAll();
        return categories.find((cat) => cat.id === id) || null;
      },
      staleTime: 10 * 60 * 1000,
    });
  };
}

// Hook pour précharger les sous-catégories
export function usePrefetchSubcategories() {
  const queryClient = useQueryClient();

  return (parentId: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.categories.subcategories(parentId),
      queryFn: async () => {
        const categories = await apiService.categories.getAll();
        return categories.filter(cat => cat.parentId === parentId);
      },
      staleTime: 10 * 60 * 1000,
    });
  };
}