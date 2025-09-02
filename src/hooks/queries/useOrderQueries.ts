import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { queryKeys, handleQueryError } from '@/lib/queryClient';
import { toast } from 'sonner';
import type { Order, CreateOrderDto } from '@/types';

// Hook pour récupérer toutes les commandes
export function useOrders(params: any = {}) {
  return useQuery({
    queryKey: queryKeys.orders.list(params),
    queryFn: () => apiService.orders.getAll(params),
    staleTime: 1 * 60 * 1000, // 1 minute pour les commandes
    select: (data) => data || [],
    meta: {
      errorMessage: 'Erreur lors du chargement des commandes',
    },
  });
}

// Hook pour récupérer une commande par ID
export function useOrder(id: string) {
  return useQuery({
    queryKey: queryKeys.orders.detail(id),
    queryFn: () => apiService.orders.get(id),
    enabled: !!id,
    staleTime: 30 * 1000, // 30 secondes pour une commande spécifique
  });
}

// Hook pour récupérer les commandes d'un utilisateur
export function useOrdersByUser(userId: string) {
  return useQuery({
    queryKey: queryKeys.orders.byUser(userId),
    queryFn: () => apiService.orders.getAll({ userId }),
    enabled: !!userId,
    staleTime: 1 * 60 * 1000,
    select: (data) => data || [],
  });
}

// Hook pour récupérer les commandes d'un marchand
export function useOrdersByMerchant(merchantId: string) {
  return useQuery({
    queryKey: queryKeys.orders.byMerchant(merchantId),
    queryFn: async () => {
      const response = await apiService.orders.getMerchantOrders(merchantId);
      return response.data;
    },
    enabled: !!merchantId,
    staleTime: 1 * 60 * 1000,
    select: (data) => data || [],
  });
}

// Hook pour créer une commande avec optimistic update
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) =>
      apiService.orders.createOrder(order),

    onMutate: async (newOrder) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.orders.all });

      const previousData = queryClient.getQueriesData({ queryKey: queryKeys.orders.all });

      // Créer une commande temporaire
      const tempOrder: Order = {
        ...newOrder,
        id: `temp-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Ajouter la commande temporaire aux listes
      queryClient.setQueriesData({ queryKey: queryKeys.orders.lists() }, (oldData: any) => {
        if (!oldData) return [tempOrder];
        if (Array.isArray(oldData)) {
          return [tempOrder, ...oldData];
        }
        return oldData;
      });

      toast.success('Commande en cours de création...', { duration: 2000 });

      return { previousData, tempOrder };
    },

    onError: (error, newOrder, context) => {
      // Rollback
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      const errorMessage = handleQueryError(error);
      toast.error(`Échec de la création de commande: ${errorMessage}`);
    },

    onSuccess: (response, variables, context) => {
      // Remplacer la commande temporaire par la vraie commande
      if (context?.tempOrder && response.data?.data) {
        const realOrder = response.data.data;
        
        queryClient.setQueriesData({ queryKey: queryKeys.orders.lists() }, (oldData: any) => {
          if (!oldData || !Array.isArray(oldData)) return oldData;
          return oldData.map((order: Order) => 
            order.id === context.tempOrder.id ? realOrder : order
          );
        });

        // Ajouter au cache de détail
        queryClient.setQueryData(queryKeys.orders.detail(realOrder.id), realOrder);
      }

      toast.success('Commande créée avec succès!');
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
    },
  });
}

// Hook pour mettre à jour le statut d'une commande
export function useUpdateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Order> }) =>
      apiService.orders.update(id, data),

    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.orders.all });

      const previousData = queryClient.getQueriesData({ queryKey: queryKeys.orders.all });

      // Mettre à jour optimiste du statut
      queryClient.setQueriesData({ queryKey: queryKeys.orders.lists() }, (oldData: any) => {
        if (!oldData || !Array.isArray(oldData)) return oldData;
        return oldData.map((order: Order) => 
          order.id === id ? { ...order, ...data, updatedAt: new Date().toISOString() } : order
        );
      });

      // Mettre à jour le cache de détail
      queryClient.setQueryData(queryKeys.orders.detail(id), (oldOrder: Order | undefined) => {
        if (!oldOrder) return oldOrder;
        return { ...oldOrder, ...data, updatedAt: new Date().toISOString() };
      });

      toast.success('Statut mis à jour...', { duration: 1500 });

      return { previousData };
    },

    onError: (error, { id }, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      const errorMessage = handleQueryError(error);
      toast.error(`Échec de la mise à jour: ${errorMessage}`);
    },

    onSuccess: (updatedOrder) => {
      queryClient.setQueryData(queryKeys.orders.detail(updatedOrder.id), updatedOrder);
      toast.success('Statut mis à jour avec succès!');
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
    },
  });
}

// Hook pour supprimer une commande
export function useDeleteOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiService.orders.delete(id),

    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.orders.all });

      const previousData = queryClient.getQueriesData({ queryKey: queryKeys.orders.all });

      // Retirer immédiatement la commande
      queryClient.setQueriesData({ queryKey: queryKeys.orders.lists() }, (oldData: any) => {
        if (!oldData || !Array.isArray(oldData)) return oldData;
        return oldData.filter((order: Order) => order.id !== deletedId);
      });

      queryClient.removeQueries({ queryKey: queryKeys.orders.detail(deletedId) });

      toast.success('Commande supprimée', { duration: 2000 });

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
      toast.success('Commande supprimée définitivement!');
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
    },
  });
}

// Hook pour précharger une commande
export function usePrefetchOrder() {
  const queryClient = useQueryClient();

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.orders.detail(id),
      queryFn: () => apiService.orders.get(id),
      staleTime: 30 * 1000,
    });
  };
}

// Hook pour les statistiques de commandes
export function useOrderStats(merchantId?: string) {
  return useQuery({
    queryKey: queryKeys.orders.stats(merchantId),
    queryFn: async () => {
      const orders = merchantId 
        ? await apiService.orders.getAll({ merchantId })
        : await apiService.orders.getAll();

      // Calculer les statistiques
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
      const pendingOrders = orders.filter(order => order.status === 'PENDING').length;
      const completedOrders = orders.filter(order => order.status === 'DELIVERED').length;

      return {
        totalOrders,
        totalRevenue,
        pendingOrders,
        completedOrders,
      };
    },
    staleTime: 2 * 60 * 1000,
    enabled: true,
  });
}