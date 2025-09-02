import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { queryKeys, handleQueryError } from '@/lib/queryClient';
import { toast } from 'sonner';
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
    select: (data) => data || [],
    meta: {
      errorMessage: 'Erreur lors du chargement des marques',
    },
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

// Hook pour créer une marque avec optimistic update
export function useCreateBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (brand: Omit<Brand, 'id'>) =>
      apiService.brands.create(brand),

    onMutate: async (newBrand) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.brands.all });

      const previousData = queryClient.getQueriesData({ queryKey: queryKeys.brands.all });

      const tempBrand: Brand = {
        ...newBrand,
        id: `temp-${Date.now()}`,
      };

      queryClient.setQueriesData({ queryKey: queryKeys.brands.lists() }, (oldData: any) => {
        if (!oldData) return [tempBrand];
        if (Array.isArray(oldData)) {
          return [tempBrand, ...oldData];
        }
        return oldData;
      });

      toast.success('Marque en cours d\'ajout...', { duration: 2000 });

      return { previousData, tempBrand };
    },

    onError: (error, newBrand, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      const errorMessage = handleQueryError(error);
      toast.error(`Échec de l'ajout de marque: ${errorMessage}`);
    },

    onSuccess: (realBrand, variables, context) => {
      if (context?.tempBrand) {
        queryClient.setQueriesData({ queryKey: queryKeys.brands.lists() }, (oldData: any) => {
          if (!oldData || !Array.isArray(oldData)) return oldData;
          return oldData.map((brand: Brand) => 
            brand.id === context.tempBrand.id ? realBrand : brand
          );
        });
      }

      queryClient.setQueryData(queryKeys.brands.detail(realBrand.id), realBrand);
      toast.success('Marque ajoutée avec succès!');
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.brands.all });
    },
  });
}

// Hook pour mettre à jour une marque
export function useUpdateBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Brand> }) =>
      apiService.brands.update(id, data),

    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.brands.all });

      const previousData = queryClient.getQueriesData({ queryKey: queryKeys.brands.all });

      queryClient.setQueriesData({ queryKey: queryKeys.brands.lists() }, (oldData: any) => {
        if (!oldData || !Array.isArray(oldData)) return oldData;
        return oldData.map((brand: Brand) => 
          brand.id === id ? { ...brand, ...data } : brand
        );
      });

      queryClient.setQueryData(queryKeys.brands.detail(id), (oldBrand: Brand | undefined) => {
        if (!oldBrand) return oldBrand;
        return { ...oldBrand, ...data };
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

    onSuccess: (updatedBrand) => {
      queryClient.setQueryData(queryKeys.brands.detail(updatedBrand.id), updatedBrand);
      toast.success('Marque modifiée avec succès!');
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.brands.all });
    },
  });
}

// Hook pour supprimer une marque
export function useDeleteBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiService.brands.delete(id),

    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.brands.all });

      const previousData = queryClient.getQueriesData({ queryKey: queryKeys.brands.all });

      queryClient.setQueriesData({ queryKey: queryKeys.brands.lists() }, (oldData: any) => {
        if (!oldData || !Array.isArray(oldData)) return oldData;
        return oldData.filter((brand: Brand) => brand.id !== deletedId);
      });

      queryClient.removeQueries({ queryKey: queryKeys.brands.detail(deletedId) });

      toast.success('Marque supprimée', { duration: 2000 });

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
      toast.success('Marque supprimée définitivement!');
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.brands.all });
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