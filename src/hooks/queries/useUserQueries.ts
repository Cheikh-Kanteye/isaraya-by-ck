import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { queryKeys } from '@/services/queryClient';
import type { User, MerchantProfile } from '@/types'; // Import MerchantProfile

// Interface pour les paramètres de filtrage des utilisateurs
interface UsersParams {
  role?: "CLIENT" | "MERCHANT" | "ADMIN"; // Specific roles
  status?: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED"; // For merchant profiles
  _limit?: number;
  _page?: number;
  _sort?: string;
  _order?: "asc" | "desc";
}

// Hook pour récupérer tous les utilisateurs (could be a mix of User and MerchantProfile in practice)
export function useUsers(params: UsersParams = {}) {
  return useQuery<User[]>({ // Explicitly type as User[] for now, will refine if necessary
    queryKey: queryKeys.users.list(params),
    queryFn: () => apiService.users.getAll(params) as Promise<User[]>, // Cast as User[]
  });
}

// Hook pour récupérer un utilisateur par ID
export function useUser(id: string) {
  return useQuery<User | MerchantProfile>({ // Can return either User or MerchantProfile
    queryKey: queryKeys.users.detail(id),
    queryFn: () => apiService.users.get(id) as Promise<User | MerchantProfile>, // Cast
    enabled: !!id,
  });
}

// Hook pour récupérer tous les merchants (MerchantProfiles)
export function useMerchants() {
  return useQuery<MerchantProfile[]>({ // Returns MerchantProfile[]
    queryKey: queryKeys.users.merchants(),
    queryFn: () => apiService.users.getMerchants(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook pour récupérer un merchant par ID (MerchantProfile)
export function useMerchant(id: string) {
  return useQuery<MerchantProfile>({ // Returns MerchantProfile
    queryKey: queryKeys.users.merchant(id),
    queryFn: () => apiService.users.getMerchant(id),
    enabled: !!id,
  });
}

// Hook pour récupérer l'utilisateur actuel (si authentifié)
export function useCurrentUser() {
  return useQuery<User | null>({
    queryKey: queryKeys.users.current(),
    queryFn: async () => {
      // This should ideally call apiService.auth.getProfile() or similar
      // For now, it might rely on authStore's getCurrentUser
      return null; // Keep as null for now, or integrate with authStore
    },
    enabled: false, // Disabled for now
  });
}

// Hook pour créer un utilisateur
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation<User, Error, Omit<User, "userId" | "createdAt" | "updatedAt">, unknown>({
    mutationFn: (user: Omit<User, "userId" | "createdAt" | "updatedAt">) =>
      apiService.users.create(user),
    onSuccess: (newUser) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
      queryClient.setQueryData(queryKeys.users.detail(newUser.userId), newUser); // Use userId
      if (newUser.roles.some(role => role.name === "MERCHANT")) {
        queryClient.invalidateQueries({ queryKey: queryKeys.users.merchants() });
      }
    },
  });
}

// Hook pour mettre à jour un utilisateur
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation<User, Error, { userId: string; data: Partial<User> }, unknown>({
    mutationFn: ({ userId, data }: { userId: string; data: Partial<User> }) =>
      apiService.users.update(userId, data),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(queryKeys.users.detail(updatedUser.userId), updatedUser); // Use userId
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
      if (updatedUser.roles.some(role => role.name === "MERCHANT")) {
        queryClient.invalidateQueries({ queryKey: queryKeys.users.merchants() });
        queryClient.setQueryData(queryKeys.users.merchant(updatedUser.userId), updatedUser);
      }
    },
  });
}

// Hook pour supprimer un utilisateur
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string, unknown>({
    mutationFn: (userId: string) => apiService.users.delete(userId),
    onSuccess: (_, deletedUserId) => {
      queryClient.removeQueries({ queryKey: queryKeys.users.detail(deletedUserId) });
      queryClient.removeQueries({ queryKey: queryKeys.users.merchant(deletedUserId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
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

// Hook pour précharger un merchant
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

