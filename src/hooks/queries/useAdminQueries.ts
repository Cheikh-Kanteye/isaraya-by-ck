import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/services/api";
import { useAuthStore } from "@/stores";
import type { AdminStats, AdminUser, Order } from "@/types";

// Hook pour récupérer les statistiques admin
export function useAdminStats() {
  const { user } = useAuthStore();
  
  // Vérifier que l'utilisateur a le rôle ADMIN
  const isAdmin = user?.roles?.some(role => role.name === "ADMIN");

  return useQuery<AdminStats>({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const response = await apiService.users.getAdminStats();
      return response.data;
    },
    enabled: !!user && isAdmin,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2, // Limiter les tentatives de retry
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Backoff exponentiel
    refetchOnWindowFocus: false, // Désactiver le refetch au focus
    refetchOnMount: true,
    refetchOnReconnect: false, // Désactiver le refetch à la reconnexion
  });
}

// Hook pour récupérer les utilisateurs admin
export function useAdminUsers() {
  const { user } = useAuthStore();
  
  // Vérifier que l'utilisateur a le rôle ADMIN
  const isAdmin = user?.roles?.some(role => role.name === "ADMIN");

  return useQuery<AdminUser[]>({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const response = await apiService.users.getAdminUsers();
      return response.data;
    },
    enabled: !!user && isAdmin,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: false,
  });
}

// Hook pour récupérer toutes les commandes (admin)
export function useOrders() {
  const { user } = useAuthStore();
  
  // Vérifier que l'utilisateur a le rôle ADMIN
  const isAdmin = user?.roles?.some(role => role.name === "ADMIN");

  return useQuery<Order[]>({
    queryKey: ["admin", "orders"],
    queryFn: async () => {
      return await apiService.orders.getAllOrders();
    },
    enabled: !!user && isAdmin,
    staleTime: 2 * 60 * 1000, // 2 minutes (plus court car les commandes changent plus souvent)
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: false,
  });
}
