import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Package,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Clock,
  Activity,
  Zap,
  DollarSign,
  UserCheck,
  Store,
  WifiOff,
} from "lucide-react";
import { useAdminStats } from "@/hooks/queries/useAdminQueries";
import {
  useMemo,
  useState,
  useEffect,
  ReactNode,
  FC,
  ElementType,
} from "react";
import { formatPrice } from "@/lib/utils";

// Interfaces pour les props des composants
interface CountUpAnimationProps {
  end: number;
  duration?: number;
  suffix?: string;
  decimals?: number;
}

interface StatCardProps {
  title: string;
  value: ReactNode;
  subtitle: string;
  icon: ElementType;
  trend?: boolean;
  growth?: number;
  isLoading: boolean;
}

interface AlertsCardProps {
  pendingMerchants: number;
  reportedProducts: number;
  pendingOrders: number;
}

// Component pour l'animation de compteur
const CountUpAnimation: FC<CountUpAnimationProps> = ({
  end,
  duration = 2.5,
  suffix = "",
  decimals = 0,
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | undefined;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);

      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = end * easeOutQuart;

      setCount(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [end, duration]);

  const formatNumber = (num: number) => {
    return decimals > 0
      ? num.toFixed(decimals)
      : Math.floor(num).toLocaleString();
  };

  return (
    <span>
      {formatNumber(count)}
      {suffix}
    </span>
  );
};

// Component pour les statistiques
const StatCard: FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  growth,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="h-8 bg-muted animate-pulse rounded" />
          <div className="h-3 bg-muted animate-pulse rounded mt-2 w-3/4" />
        </CardContent>
      </Card>
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
    <Card className="relative overflow-hidden border-l-4 border-l-primary/20 hover:border-l-primary transition-all duration-300 hover:shadow-lg group">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium transition-colors group-hover:text-primary">
          {title}
        </CardTitle>
        <div className="relative">
          <Icon className="h-4 w-4 text-muted-foreground transition-all duration-300 group-hover:text-primary group-hover:scale-110" />
          {trend && (
            <div className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full animate-pulse" />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground mb-1 transition-transform group-hover:scale-105">
          {value}
        </div>
        <div className={`text-xs flex items-center gap-1 ${growth !== undefined ? getGrowthColor(growth) : 'text-muted-foreground'}`}>
          {growth !== undefined && getGrowthIcon(growth)}
          {subtitle}
        </div>
      </CardContent>
    </Card>
  );
};

// Component pour les alertes
const AlertsCard: FC<AlertsCardProps> = ({
  pendingMerchants,
  reportedProducts,
  pendingOrders,
}) => {
  type AlertVariant = "destructive" | "secondary";
  const alerts: {
    label: string;
    value: number;
    variant: AlertVariant;
    icon: ElementType;
  }[] = [
    {
      label: "Merchants en attente",
      value: pendingMerchants,
      variant: "destructive",
      icon: Clock,
    },
    {
      label: "Produits signalés",
      value: reportedProducts,
      variant: "destructive",
      icon: AlertTriangle,
    },
    {
      label: "Commandes en attente",
      value: pendingOrders,
      variant: "secondary",
      icon: Package,
    },
  ];

  return (
    <Card className="border-l-4 border-l-destructive/20 hover:border-l-destructive transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="relative">
            <AlertTriangle className="h-5 w-5 text-destructive animate-pulse" />
            <div className="absolute inset-0 rounded-full bg-destructive/20 animate-ping" />
          </div>
          Actions requises
        </CardTitle>
        <CardDescription>Éléments nécessitant votre attention</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.map((alert, index) => (
          <div
            key={alert.label}
            className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-muted/30 to-transparent hover:from-muted/50 transition-all duration-300 group"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center gap-2">
              <alert.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="text-sm group-hover:text-foreground transition-colors">
                {alert.label}
              </span>
            </div>
            <Badge
              variant={alert.variant}
              className="transition-transform group-hover:scale-105"
            >
              {alert.value}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

// Component pour le statut système
const SystemStatusCard: FC<{ systemHealth?: any }> = ({ systemHealth }) => {
  const systems = [
    { 
      name: "API Gateway", 
      status: systemHealth?.apiStatus || "operational", 
      icon: Zap 
    },
    { 
      name: "Base de données", 
      status: systemHealth?.databaseStatus || "operational", 
      icon: Activity 
    },
    { 
      name: "Paiements", 
      status: systemHealth?.paymentStatus || "operational", 
      icon: CheckCircle 
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'bg-green-500/20 text-green-700';
      case 'degraded': return 'bg-yellow-500/20 text-yellow-700';
      case 'down': return 'bg-red-500/20 text-red-700';
      default: return 'bg-gray-500/20 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'operational': return 'Opérationnel';
      case 'degraded': return 'Dégradé';
      case 'down': return 'Hors service';
      default: return 'Inconnu';
    }
  };

  return (
    <Card className="border-l-4 border-l-primary/20 hover:border-l-primary transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="relative">
            <CheckCircle className="h-5 w-5 text-primary" />
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse" />
          </div>
          Statut système
        </CardTitle>
        <CardDescription>État général de la plateforme</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {systems.map((system, index) => (
          <div
            key={system.name}
            className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-primary/5 to-transparent hover:from-primary/10 transition-all duration-300 group"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center gap-2">
              <system.icon className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
              <span className="text-sm group-hover:text-foreground transition-colors">
                {system.name}
              </span>
            </div>
            <Badge
              className={`${getStatusColor(system.status)} transition-all group-hover:scale-105`}
            >
              {getStatusLabel(system.status)}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

// Component principal
const AdminDashboard: FC = () => {
  const { data: stats, isLoading, error } = useAdminStats();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="relative">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="flex items-center gap-3 text-muted-foreground">
          <WifiOff className="h-8 w-8" />
          <div className="text-center">
            <p className="text-lg font-medium">Connexion au serveur impossible</p>
            <p className="text-sm">Vérifiez que l'API backend est démarrée sur le port 3000</p>
          </div>
        </div>
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground space-y-2">
              <p><strong>Solutions possibles :</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Démarrer le serveur backend</li>
                <li>Vérifier la configuration API dans .env</li>
                <li>Vérifier que le port 3000 n'est pas utilisé</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Aucune donnée disponible</p>
      </div>
    );
  }

  const statsConfig = [
    {
      title: "Utilisateurs",
      value: <CountUpAnimation end={stats.users.total} duration={2.5} />,
      subtitle: `${stats.users.growth > 0 ? '+' : ''}${stats.users.growth.toFixed(1)}% ce mois`,
      icon: Users,
      trend: Math.abs(stats.users.growth) > 0,
      growth: stats.users.growth,
    },
    {
      title: "Merchants",
      value: <CountUpAnimation end={stats.merchants.total} duration={2.5} />,
      subtitle: `${stats.merchants.pending} en attente d'approbation`,
      icon: Store,
      trend: stats.merchants.pending > 0,
      growth: stats.merchants.growth,
    },
    {
      title: "Commandes",
      value: <CountUpAnimation end={stats.orders.total} duration={2.5} />,
      subtitle: `${stats.orders.growth > 0 ? '+' : ''}${stats.orders.growth.toFixed(1)}% ce mois`,
      icon: ShoppingCart,
      trend: Math.abs(stats.orders.growth) > 0,
      growth: stats.orders.growth,
    },
    {
      title: "Chiffre d'affaires",
      value: (
        <CountUpAnimation
          end={stats.revenue.total}
          duration={2.5}
          suffix=" FCFA"
        />
      ),
      subtitle: `${stats.revenue.growth > 0 ? '+' : ''}${stats.revenue.growth.toFixed(1)}% ce mois`,
      icon: TrendingUp,
      trend: Math.abs(stats.revenue.growth) > 0,
      growth: stats.revenue.growth,
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in-0 duration-700">
      {/* Header avec animation */}
      <div className="animate-in slide-in-from-top-4 duration-500">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Administration
        </h1>
        <p className="text-muted-foreground mt-2">
          Gérez votre plateforme et surveillez les performances
        </p>
      </div>

      {/* Grille de statistiques */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-in slide-in-from-bottom-4 duration-700 delay-200">
        {statsConfig.map((stat, index) => (
          <div
            key={stat.title}
            className="animate-in fade-in-0 duration-500"
            style={{ animationDelay: `${300 + index * 100}ms` }}
          >
            <StatCard {...stat} isLoading={isLoading} />
          </div>
        ))}
      </div>

      {/* Section des alertes et statuts */}
      <div className="grid gap-4 md:grid-cols-2 animate-in slide-in-from-bottom-4 duration-700 delay-500">
        <div className="animate-in slide-in-from-left-4 duration-500 delay-700">
          <AlertsCard
            pendingMerchants={stats.merchants.pending}
            reportedProducts={stats.products.reported}
            pendingOrders={Object.values(stats.orders.byStatus).reduce((acc, count) => 
              acc + (count || 0), 0) - (stats.orders.byStatus.DELIVERED || 0) - (stats.orders.byStatus.CANCELLED || 0)}
          />
        </div>
        <div className="animate-in slide-in-from-right-4 duration-500 delay-800">
          <SystemStatusCard systemHealth={stats.systemHealth} />
        </div>
      </div>

      {/* Section des top performers */}
      <div className="grid gap-4 md:grid-cols-2 animate-in slide-in-from-bottom-4 duration-700 delay-600">
        {/* Top Merchants */}
        <Card>
          <CardHeader>
            <CardTitle>Top Merchants</CardTitle>
            <CardDescription>Marchands avec le plus de revenus</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topMerchants.map((merchant, index) => (
                <div key={merchant.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{merchant.businessName}</p>
                      <p className="text-xs text-muted-foreground">
                        {merchant.orders} commandes • {merchant.products} produits
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">{formatPrice(merchant.revenue)}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Produits populaires</CardTitle>
            <CardDescription>Produits les plus vendus</CardDescription>
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
                      <p className="text-xs text-muted-foreground">
                        par {product.merchantName}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">{product.totalSold} vendus</Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatPrice(product.revenue)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activité récente */}
      <Card className="animate-in slide-in-from-bottom-4 duration-700 delay-700">
        <CardHeader>
          <CardTitle>Activité récente</CardTitle>
          <CardDescription>Dernières actions sur la plateforme</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <div className="flex-1">
                  <p className="text-sm">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(activity.timestamp).toLocaleString('fr-FR')}
                  </p>
                </div>
                <Badge variant="secondary" className="capitalize">
                  {activity.type}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
