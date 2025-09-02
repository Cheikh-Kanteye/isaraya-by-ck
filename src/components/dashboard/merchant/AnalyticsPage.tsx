import React, { useState } from "react";
import { TrendingUp, TrendingDown, DollarSign, Package, Users, ShoppingCart, Truck, Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts";
import { formatPrice } from "@/lib/utils";
import { useMerchantStats } from "@/hooks/queries/useMerchantQueries";

const AnalyticsPage: React.FC = () => {
  const [chartType, setChartType] = useState("area");
  const { data: stats, isLoading, error } = useMerchantStats();

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82ca9d", "#ffc658"];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-64 w-full" />
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

  // Préparer les données pour les graphiques
  const statusData = Object.entries(stats.orders.byStatus)
    .filter(([, count]) => count > 0)
    .map(([status, count]) => ({
      status: status.toLowerCase().replace('_', ' '),
      count,
      name: status.toLowerCase().replace('_', ' ')
    }));

  // Données de comparaison mensuelle
  const monthlyComparison = [
    {
      period: "Mois dernier",
      revenue: stats.revenue.lastMonth,
      orders: stats.orders.lastMonth,
      customers: stats.customers.total - stats.customers.newCustomers
    },
    {
      period: "Ce mois",
      revenue: stats.revenue.thisMonth,
      orders: stats.orders.thisMonth,
      customers: stats.customers.newCustomers
    }
  ];

  // Données de performance des produits
  const productPerformance = stats.topProducts.map((product, index) => ({
    ...product,
    rank: index + 1,
    performance: Math.max(20, 100 - (index * 15)) // Score simulé basé sur le rang
  }));

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            Analyse approfondie des performances de votre boutique
          </p>
        </div>
        <ToggleGroup
          type="single"
          value={chartType}
          onValueChange={(value) => value && setChartType(value)}
        >
          <ToggleGroupItem value="area">Area</ToggleGroupItem>
          <ToggleGroupItem value="line">Line</ToggleGroupItem>
          <ToggleGroupItem value="bar">Bar</ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Statistiques principales avec indicateurs de croissance */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produits Actifs</CardTitle>
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

      {/* Cartes de statut secondaires */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Taux de conversion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.customers.total > 0 ? ((stats.orders.total / stats.customers.total) * 100).toFixed(1) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Commandes par client
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques principaux */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Comparaison mensuelle */}
        <Card>
          <CardHeader>
            <CardTitle>Comparaison Mensuelle</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === "area" ? (
                  <AreaChart data={monthlyComparison}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip formatter={(value) => [formatPrice(Number(value)), "Revenus"]} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stackId="1"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                ) : chartType === "line" ? (
                  <LineChart data={monthlyComparison}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip formatter={(value) => [formatPrice(Number(value)), "Revenus"]} />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#8884d8"
                      strokeWidth={2}
                    />
                  </LineChart>
                ) : (
                  <BarChart data={monthlyComparison}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip formatter={(value) => [formatPrice(Number(value)), "Revenus"]} />
                    <Bar dataKey="revenue" fill="#8884d8" />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Répartition des commandes par statut */}
        <Card>
          <CardHeader>
            <CardTitle>Commandes par Statut</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="status"
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {statusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance des produits et commandes récentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top produits avec performance */}
        <Card>
          <CardHeader>
            <CardTitle>Performance des Produits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={productPerformance}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'quantity' ? `${value} vendus` : `${value}% performance`,
                      name === 'quantity' ? 'Quantité' : 'Performance'
                    ]}
                  />
                  <Bar dataKey="quantity" fill="#8884d8" name="quantity" />
                  <Bar dataKey="performance" fill="#82ca9d" name="performance" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Commandes récentes avec détails */}
        <Card>
          <CardHeader>
            <CardTitle>Activité Récente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentOrders.map((order, index) => (
                <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm">#{order.id.slice(0, 8)}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.date).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">Nouvelle</Badge>
                </div>
              ))}
              
              {/* Métriques supplémentaires */}
              <div className="mt-6 pt-4 border-t">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      {stats.customers.returning}
                    </p>
                    <p className="text-xs text-muted-foreground">Clients fidèles</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600">
                      {stats.products.total}
                    </p>
                    <p className="text-xs text-muted-foreground">Total produits</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statuts détaillés des commandes */}
      <Card>
        <CardHeader>
          <CardTitle>Détail des Statuts de Commandes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(stats.orders.byStatus).map(([status, count]) => (
              <div key={status} className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-sm text-muted-foreground capitalize">
                  {status.toLowerCase().replace('_', ' ')}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsPage;
