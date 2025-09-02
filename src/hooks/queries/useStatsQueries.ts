import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { queryKeys } from '@/lib/queryClient';
import type { DashboardStats, MerchantStats, AdminStats } from '@/types';

// Hook pour récupérer les statistiques du dashboard général
export function useDashboardStats() {
  return useQuery({
    queryKey: queryKeys.stats.dashboard(),
    queryFn: async (): Promise<DashboardStats> => {
      // Récupérer les données nécessaires
      const [products, orders] = await Promise.all([
        apiService.products.getAll(),
        apiService.orders.getAll(),
      ]);

      // Calculer les statistiques
      const totalProducts = products.length;
      const totalOrders = orders.length;
      const pendingOrders = orders.filter(order => order.status === 'PENDING').length;
      const totalRevenue = orders
        .filter(order => order.status !== 'CANCELLED')
        .reduce((sum, order) => sum + (order.total || 0), 0);

      return {
        totalRevenue,
        totalProducts,
        totalOrders,
        pendingOrders,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch toutes les 10 minutes
  });
}

// Hook pour récupérer les statistiques d'un marchand
export function useMerchantStats(merchantId?: string) {
  return useQuery({
    queryKey: queryKeys.stats.merchant(merchantId || 'current'),
    queryFn: async (): Promise<MerchantStats> => {
      if (!merchantId) {
        throw new Error('Merchant ID is required');
      }
      const response = await apiService.users.getMerchantStats(merchantId);
      return response.data;
    },
    enabled: !!merchantId,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
  });
}

// Hook pour récupérer les statistiques admin
export function useAdminStats() {
  return useQuery({
    queryKey: queryKeys.stats.admin(),
    queryFn: async (): Promise<AdminStats> => {
      const response = await apiService.users.getAdminStats();
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000, // Refetch toutes les 15 minutes
  });
}

// Hook pour récupérer les statistiques en temps réel
export function useRealTimeStats(merchantId?: string) {
  return useQuery({
    queryKey: [...queryKeys.stats.merchant(merchantId || 'current'), 'realtime'],
    queryFn: async () => {
      // Récupérer les données en temps réel
      const [products, orders] = await Promise.all([
        merchantId 
          ? apiService.products.getAll({ merchantId })
          : apiService.products.getAll(),
        merchantId
          ? apiService.orders.getAll({ merchantId })
          : apiService.orders.getAll(),
      ]);

      // Calculer les métriques en temps réel
      const activeProducts = products.filter(p => p.status === 'disponible').length;
      const lowStockProducts = products.filter(p => p.stock < 10).length;
      const todayOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        const today = new Date();
        return orderDate.toDateString() === today.toDateString();
      }).length;

      return {
        activeProducts,
        lowStockProducts,
        todayOrders,
        lastUpdated: new Date().toISOString(),
      };
    },
    enabled: true,
    staleTime: 30 * 1000, // 30 secondes pour les stats temps réel
    refetchInterval: 60 * 1000, // Refetch chaque minute
  });
}