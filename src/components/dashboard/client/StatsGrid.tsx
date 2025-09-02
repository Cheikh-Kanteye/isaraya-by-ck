import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { Package, CreditCard, Heart, Bell } from "lucide-react";

interface Stats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalSpent: number;
  favoriteItems: number;
  unreadNotifications: number;
}

const statsList = (stats: Stats) => [
  {
    title: "Total commandes",
    value: stats.totalOrders,
    subtitle: `${stats.pendingOrders} en cours`,
    icon: Package,
  },
  {
    title: "Total dépensé",
    value: formatPrice(stats.totalSpent),
    subtitle: "Depuis votre inscription",
    icon: CreditCard,
  },
  {
    title: "Articles favoris",
    value: stats.favoriteItems,
    subtitle: "Dans votre liste",
    icon: Heart,
  },
  {
    title: "Notifications",
    value: stats.unreadNotifications,
    subtitle: "Non lues",
    icon: Bell,
  },
];

interface StatsGridProps {
  stats: Stats;
}

const StatsGrid = ({ stats }: StatsGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsList(stats).map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          subtitle={stat.subtitle}
          icon={stat.icon}
        />
      ))}
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
}

const StatCard = ({ title, value, subtitle, icon: Icon }: StatCardProps) => {
  return (
    <Card className="bg-background/60 backdrop-blur-lg border border-border/50 shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-primary">{value}</div>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </CardContent>
    </Card>
  );
};

export default StatsGrid;
