import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService, type ExtendedCategory } from '@/services/categoryService';
import { apiService } from '@/services/api';
import { queryKeys } from '@/services/queryClient';
import type { Category } from '@/types';

// Hook pour récupérer toutes les catégories
export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories.list(),
    queryFn: () => categoryService.getAllCategories(),
    staleTime: 10 * 60 * 1000, // 10 minutes - les catégories changent rarement
  });
}

// Hook pour récupérer une catégorie par ID
export function useCategory(id: string) {
  return useQuery({
    queryKey: queryKeys.categories.detail(id),
    queryFn: async () => {
      const categories = await categoryService.getAllCategories();
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
    queryFn: () => categoryService.getMainCategories(),
    staleTime: 10 * 60 * 1000,
  });
}

// Hook pour récupérer les sous-catégories d'une catégorie
export function useSubcategories(parentId: string) {
  return useQuery({
    queryKey: queryKeys.categories.subcategories(parentId),
    queryFn: () => categoryService.getSubcategories(parentId),
    enabled: !!parentId,
    staleTime: 10 * 60 * 1000,
  });
}

// Hook pour récupérer la hiérarchie complète des catégories
export function useCategoryHierarchy() {
  return useQuery({
    queryKey: queryKeys.categories.hierarchy(),
    queryFn: () => categoryService.getCategoryHierarchy(),
    staleTime: 15 * 60 * 1000, // 15 minutes - la hiérarchie change très rarement
  });
}

// Hook pour créer une catégorie
export function useCreateCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) =>
      apiService.categories.create(category),
    onSuccess: (newCategory) => {
      // Invalider toutes les requêtes de catégories
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      
      // Ajouter la nouvelle catégorie au cache
      queryClient.setQueryData(queryKeys.categories.detail(newCategory.id), newCategory);
      
      // Si c'est une sous-catégorie, invalider les sous-catégories du parent
      if (newCategory.parentId) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.categories.subcategories(newCategory.parentId) 
        });
      } else {
        // Si c'est une catégorie principale, invalider les catégories principales
        queryClient.invalidateQueries({ queryKey: queryKeys.categories.main() });
      }
    },
  });
}

// Hook pour mettre à jour une catégorie
export function useUpdateCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Category> }) =>
      apiService.categories.update(id, data),
    onSuccess: (updatedCategory) => {
      // Mettre à jour la catégorie dans le cache
      queryClient.setQueryData(queryKeys.categories.detail(updatedCategory.id), updatedCategory);
      
      // Invalider toutes les listes de catégories
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.hierarchy() });
      
      // Invalider les sous-catégories si applicable
      if (updatedCategory.parentId) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.categories.subcategories(updatedCategory.parentId) 
        });
      }
    },
  });
}

// Hook pour supprimer une catégorie
export function useDeleteCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiService.categories.delete(id),
    onSuccess: (_, deletedId) => {
      // Supprimer la catégorie du cache
      queryClient.removeQueries({ queryKey: queryKeys.categories.detail(deletedId) });
      
      // Invalider toutes les requêtes de catégories
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
        const categories = await categoryService.getAllCategories();
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
      queryFn: () => categoryService.getSubcategories(parentId),
      staleTime: 10 * 60 * 1000,
    });
  };
}

