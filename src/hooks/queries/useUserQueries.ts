import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { queryKeys, handleQueryError } from '@/lib/queryClient';
import { toast } from 'sonner';
import type { User, MerchantProfile } from '@/types';

// Interface pour les paramètres de filtrage des utilisateurs
interface UsersParams {
  role?: 'CLIENT' | 'MERCHANT' | 'ADMIN';
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  _limit?: number;
  _page?: number;
  _sort?: string;
  _order?: 'asc' | 'desc';
}

// Hook pour récupérer tous les utilisateurs
export function useUsers(params: UsersParams = {}) {
  return useQuery({
    queryKey: queryKeys.users.list(params),
    queryFn: () => apiService.users.getAll(params) as Promise<User[]>,
    staleTime: 3 * 60 * 1000, // 3 minutes
    select: (data) => data || [],
    meta: {
      errorMessage: 'Erreur lors du chargement des utilisateurs',
    },
  });
}

// Hook pour récupérer un utilisateur par ID
export function useUser(id: string) {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => apiService.users.get(id) as Promise<User>,
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook pour récupérer tous les marchands
export function useMerchants() {
  return useQuery({
    queryKey: queryKeys.users.merchants(),
    queryFn: () => apiService.users.getMerchants(),
    staleTime: 5 * 60 * 1000,
    select: (data) => data || [],
  });
}

// Hook pour récupérer un marchand par ID
export function useMerchant(id: string) {
  return useQuery({
    queryKey: queryKeys.users.merchant(id),
    queryFn: () => apiService.users.getMerchant(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook pour créer un utilisateur avec optimistic update
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (user: Omit<User, 'userId' | 'createdAt' | 'updatedAt'>) =>
      apiService.users.create(user),

    onMutate: async (newUser) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.users.all });

      const previousData = queryClient.getQueriesData({ queryKey: queryKeys.users.all });

      const tempUser: User = {
        ...newUser,
        userId: `temp-${Date.now()}`,
        id: `temp-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      queryClient.setQueriesData({ queryKey: queryKeys.users.lists() }, (oldData: any) => {
        if (!oldData) return [tempUser];
        if (Array.isArray(oldData)) {
          return [tempUser, ...oldData];
        }
        return oldData;
      });

      toast.success('Utilisateur en cours de création...', { duration: 2000 });

      return { previousData, tempUser };
    },

    onError: (error, newUser, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      const errorMessage = handleQueryError(error);
      toast.error(`Échec de la création d'utilisateur: ${errorMessage}`);
    },

    onSuccess: (realUser, variables, context) => {
      if (context?.tempUser) {
        queryClient.setQueriesData({ queryKey: queryKeys.users.lists() }, (oldData: any) => {
          if (!oldData || !Array.isArray(oldData)) return oldData;
          return oldData.map((user: User) => 
            user.userId === context.tempUser.userId ? realUser : user
          );
        });
      }

      queryClient.setQueryData(queryKeys.users.detail(realUser.userId), realUser);
      
      if (realUser.roles.some(role => role.name === 'MERCHANT')) {
        queryClient.invalidateQueries({ queryKey: queryKeys.users.merchants() });
      }

      toast.success('Utilisateur créé avec succès!');
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}

// Hook pour mettre à jour un utilisateur
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: Partial<User> }) =>
      apiService.users.update(userId, data),

    onMutate: async ({ userId, data }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.users.all });

      const previousData = queryClient.getQueriesData({ queryKey: queryKeys.users.all });

      // Mise à jour optimiste
      queryClient.setQueriesData({ queryKey: queryKeys.users.lists() }, (oldData: any) => {
        if (!oldData || !Array.isArray(oldData)) return oldData;
        return oldData.map((user: User) => 
          user.userId === userId ? { ...user, ...data, updatedAt: new Date().toISOString() } : user
        );
      });

      queryClient.setQueryData(queryKeys.users.detail(userId), (oldUser: User | undefined) => {
        if (!oldUser) return oldUser;
        return { ...oldUser, ...data, updatedAt: new Date().toISOString() };
      });

      toast.success('Modification en cours...', { duration: 1500 });

      return { previousData };
    },

    onError: (error, { userId }, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      const errorMessage = handleQueryError(error);
      toast.error(`Échec de la modification: ${errorMessage}`);
    },

    onSuccess: (updatedUser) => {
      queryClient.setQueryData(queryKeys.users.detail(updatedUser.userId), updatedUser);
      
      if (updatedUser.roles.some(role => role.name === 'MERCHANT')) {
        queryClient.invalidateQueries({ queryKey: queryKeys.users.merchants() });
        queryClient.setQueryData(queryKeys.users.merchant(updatedUser.userId), updatedUser);
      }

      toast.success('Utilisateur modifié avec succès!');
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}

// Hook pour supprimer un utilisateur
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => apiService.users.delete(userId),

    onMutate: async (deletedUserId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.users.all });

      const previousData = queryClient.getQueriesData({ queryKey: queryKeys.users.all });

      // Retirer immédiatement l'utilisateur
      queryClient.setQueriesData({ queryKey: queryKeys.users.lists() }, (oldData: any) => {
        if (!oldData || !Array.isArray(oldData)) return oldData;
        return oldData.filter((user: User) => user.userId !== deletedUserId);
      });

      queryClient.removeQueries({ queryKey: queryKeys.users.detail(deletedUserId) });
      queryClient.removeQueries({ queryKey: queryKeys.users.merchant(deletedUserId) });

      toast.success('Utilisateur supprimé', { duration: 2000 });

      return { previousData };
    },

    onError: (error, deletedUserId, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      const errorMessage = handleQueryError(error);
      toast.error(`Échec de la suppression: ${errorMessage}`);
    },

    onSuccess: () => {
      toast.success('Utilisateur supprimé définitivement!');
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.merchants() });
    },
  });
}

// Hook pour précharger un utilisateur
export function usePrefetchUser() {
  const queryClient = useQueryClient();

  return (userId: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.users.detail(userId),
      queryFn: () => apiService.users.get(userId),
      staleTime: 5 * 60 * 1000,
    });
  };
}

// Hook pour précharger un marchand
export function usePrefetchMerchant() {
  const queryClient = useQueryClient();

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.users.merchant(id),
      queryFn: () => apiService.users.getMerchant(id),
      staleTime: 5 * 60 * 1000,
    });
  };
}