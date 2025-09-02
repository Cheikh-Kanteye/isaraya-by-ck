import { useMerchantStats } from '@/hooks/queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, DollarSign, Package, ShoppingCart, TrendingUp } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface StatsCardsProps {
  merchantId: string;
  className?: string;
}

export function StatsCards({ merchantId, className = "" }: StatsCardsProps) {
  const { data: stats, isLoading, error } = useMerchantStats(merchantId);

  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-3 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Erreur lors du chargement des statistiques : {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (!stats) {
    return null;
  }

  const statsData = [
    {
      title: "Chiffre d'Affaires",
      value: formatPrice(stats.totalRevenue),
      icon: DollarSign,
      trend: "+15% ce mois",
      trendIcon: TrendingUp,
    },
    {
      title: "Commandes",
      value: stats.totalOrders.toString(),
      icon: ShoppingCart,
      trend: "+8% ce mois",
      trendIcon: TrendingUp,
    },
    {
      title: "Produits",
      value: stats.totalProducts.toString(),
      icon: Package,
      trend: "23 vues/jour",
      trendIcon: TrendingUp,
    },
    {
      title: "Commandes en attente",
      value: stats.pendingOrders.toString(),
      icon: Package,
      trend: "À traiter",
      trendIcon: AlertCircle,
    },
  ];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {statsData.map((stat, index) => {
        const Icon = stat.icon;
        const TrendIcon = stat.trendIcon;
        
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendIcon className="h-3 w-3 mr-1" />
                {stat.trend}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

