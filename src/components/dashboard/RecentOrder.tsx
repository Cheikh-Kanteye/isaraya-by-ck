import React, { useMemo } from "react";
import { useAuthStore } from "@/stores";
import { useDashboardStats, useUsers } from "@/hooks/queries";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { UserDisplay } from "@/components/dashboard/shared/UserDisplay";
import type { RecentOrderStats, Stats, User, Order } from "@/types"; // Import Order

interface RecentOrderWithUser extends Order { // Changed to extend Order
  user: User | null;
}

const RecentOrder = ({ className }: { className?: string }) => {
  const { data: statsData, isLoading } = useDashboardStats();
  const stats = statsData as Stats | undefined;
  const { data: users, isLoading: isLoadingUsers } = useUsers();

  const ordersWithUsers = useMemo<RecentOrderWithUser[]>(() => {
    if (!stats || !stats.recentOrders || !users) return [];

    const usersMap = new Map(users.map((u) => [u.userId, u])); // Changed u.id to u.userId

    return stats.recentOrders.map((order) => ({
      ...order,
      user: usersMap.get(order.userId) || null, // order.userId is now `clientId` for API orders
    }));
  }, [stats, users]);

  if (isLoading || isLoadingUsers) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Commandes Récentes</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Chargement...</p>
        </CardContent>
      </Card>
    );
  }

  if (!stats || !stats.recentOrders || stats.recentOrders.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Commandes Récentes</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Aucune commande récente.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Commandes Récentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {ordersWithUsers.map((order) => (
            <div key={order.id} className="flex items-center gap-4">
              <Avatar className="hidden sm:flex h-12 w-12">
                <AvatarImage
                  src={order.user?.avatarUrl || "/placeholder-user.jpg"}
                  alt="Avatar"
                />
                <AvatarFallback>
                  {order.user?.firstName?.[0]} // Corrected from firstname
                  {order.user?.lastName?.[0]}  // Corrected from lastname
                </AvatarFallback>
              </Avatar>
              <div className="grid gap-1 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium leading-none">
                    {order.user ? (
                      <UserDisplay userId={order.user.userId} /> // Pass userId
                    ) : (
                      "Client inconnu"
                    )}
                  </p>
                  <p className="text-sm text-foreground">
                    {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <p className="text-sm text-foreground">Commande #{order.id}</p> {/* Display order ID */}
              </div>
              <div className="font-medium text-right">
                {formatPrice(order.total)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentOrder;
