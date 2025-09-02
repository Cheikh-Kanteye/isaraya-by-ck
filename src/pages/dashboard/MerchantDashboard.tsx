import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMerchantStats } from '@/hooks/queries/useMerchantQueries';
import { 
  TrendingUp, 
  TrendingDown, 
  ShoppingCart, 
  Users, 
  Package,
  DollarSign,
  Clock,
  Truck,
  Bell
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';

const MerchantDashboard: React.FC = () => {
  const { data: stats, isLoading, error } = useMerchantStats();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Erreur lors du chargement des statistiques</p>
      </div>
    );
  }

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <TrendingUp className="h-4 w-4" />;
    if (growth < 0) return <TrendingDown className="h-4 w-4" />;
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Cartes de statistiques principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Revenus */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(stats.revenue.total)}</div>
            <div className={`text-xs flex items-center gap-1 ${getGrowthColor(stats.revenue.growth)}`}>
              {getGrowthIcon(stats.revenue.growth)}
              {stats.revenue.growth > 0 ? '+' : ''}{stats.revenue.growth.toFixed(1)}% ce mois
            </div>
          </CardContent>
        </Card>

        {/* Commandes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commandes</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.orders.total}</div>
            <div className={`text-xs flex items-center gap-1 ${getGrowthColor(stats.orders.growth)}`}>
              {getGrowthIcon(stats.orders.growth)}
              {stats.orders.growth > 0 ? '+' : ''}{stats.orders.growth.toFixed(1)}% ce mois
            </div>
          </CardContent>
        </Card>

        {/* Clients */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.customers.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.customers.newCustomers} nouveaux ce mois
            </p>
          </CardContent>
        </Card>

        {/* Produits */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produits</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.products.active}</div>
            <p className="text-xs text-muted-foreground">
              {stats.products.lowStock} en stock faible
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cartes secondaires */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Livraisons */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Livraisons</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">En attente</span>
                <span className="font-medium">{stats.deliveries.pending}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Terminées</span>
                <span className="font-medium">{stats.deliveries.completed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Échouées</span>
                <span className="font-medium text-red-600">{stats.deliveries.failed}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.notifications.unread}</div>
            <p className="text-xs text-muted-foreground">
              {stats.notifications.total} total
            </p>
          </CardContent>
        </Card>

        {/* Statut des commandes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Commandes par statut</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(stats.orders.byStatus).map(([status, count]) => (
                count > 0 && (
                  <div key={status} className="flex justify-between items-center">
                    <span className="text-sm capitalize">{status.toLowerCase().replace('_', ' ')}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                )
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Produits les plus vendus */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Produits les plus vendus</CardTitle>
            <CardDescription>Top 5 des produits par quantité vendue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{product.name}</p>
                    </div>
                  </div>
                  <Badge variant="outline">{product.quantity} vendus</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Commandes récentes */}
        <Card>
          <CardHeader>
            <CardTitle>Commandes récentes</CardTitle>
            <CardDescription>Dernières commandes reçues</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">#{order.id.slice(0, 8)}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.date).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MerchantDashboard;
