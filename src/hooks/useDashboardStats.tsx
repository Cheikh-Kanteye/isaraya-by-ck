import { useState, useEffect } from "react";

interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalSpent: number;
  favoriteItems: number;
  unreadNotifications: number;
}

export const useDashboardStats = (): DashboardStats => {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 12,
    pendingOrders: 2,
    completedOrders: 8,
    cancelledOrders: 2,
    totalSpent: 2450000,
    favoriteItems: 15,
    unreadNotifications: 3,
  });

  useEffect(() => {
    // TODO: Récupérer les vraies statistiques depuis l'API
    // fetchDashboardStats().then(setStats);
  }, []);

  return stats;
};
