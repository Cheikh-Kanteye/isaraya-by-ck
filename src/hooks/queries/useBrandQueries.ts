import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { queryKeys } from '@/services/queryClient';
import type { Brand } from '@/types';

// Interface pour les paramètres de filtrage des marques
interface BrandsParams {
  _limit?: number;
  _page?: number;
  _sort?: string;
  _order?: 'asc' | 'desc';
  search?: string;
}

// Hook pour récupérer toutes les marques
export function useBrands(params: BrandsParams = {}) {
  return useQuery({
    queryKey: queryKeys.brands.list(params),
    queryFn: () => apiService.brands.getAll(params),
    staleTime: 10 * 60 * 1000, // 10 minutes - les marques changent rarement
  });
}

// Hook pour récupérer une marque par ID
export function useBrand(id: string) {
  return useQuery({
    queryKey: queryKeys.brands.detail(id),
    queryFn: () => apiService.brands.get(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
}

// Hook pour créer une marque
export function useCreateBrand() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (brand: Omit<Brand, 'id' | 'createdAt' | 'updatedAt'>) =>
      apiService.brands.create(brand),
    onSuccess: (newBrand) => {
      // Invalider les listes de marques
      queryClient.invalidateQueries({ queryKey: queryKeys.brands.lists() });
      
      // Ajouter la nouvelle marque au cache
      queryClient.setQueryData(queryKeys.brands.detail(newBrand.id), newBrand);
    },
  });
}

// Hook pour mettre à jour une marque
export function useUpdateBrand() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Brand> }) =>
      apiService.brands.update(id, data),
    onSuccess: (updatedBrand) => {
      // Mettre à jour la marque dans le cache
      queryClient.setQueryData(queryKeys.brands.detail(updatedBrand.id), updatedBrand);
      
      // Invalider les listes de marques
      queryClient.invalidateQueries({ queryKey: queryKeys.brands.lists() });
    },
  });
}

// Hook pour supprimer une marque
export function useDeleteBrand() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiService.brands.delete(id),
    onSuccess: (_, deletedId) => {
      // Supprimer la marque du cache
      queryClient.removeQueries({ queryKey: queryKeys.brands.detail(deletedId) });
      
      // Invalider toutes les listes de marques
      queryClient.invalidateQueries({ queryKey: queryKeys.brands.lists() });
    },
  });
}

// Hook pour précharger une marque
export function usePrefetchBrand() {
  const queryClient = useQueryClient();
  
  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.brands.detail(id),
      queryFn: () => apiService.brands.get(id),
      staleTime: 10 * 60 * 1000,
    });
  };
}

