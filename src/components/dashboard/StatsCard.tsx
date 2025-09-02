import React from "react";
import {
  LucideIcon,
  ShoppingCart,
  Package,
  DollarSign,
  Package2,
  TrendingUp,
  Eye,
} from "lucide-react";

interface Trend {
  icon: "TrendingUp" | "Eye";
  text: string;
}

interface StatsCardProps {
  title: string;
  value: string | number;
  trend: Trend;
  icon: "ShoppingCart" | "Package" | "DollarSign" | "Package2";
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, trend, icon }) => {
  const icons: Record<string, LucideIcon> = {
    ShoppingCart,
    Package,
    DollarSign,
    Package2,
  };
  const Icon = icons[icon];

  const trendIcons: Record<string, LucideIcon> = {
    TrendingUp,
    Eye,
  };
  const TrendIcon = trendIcons[trend.icon];

  return (
    <div className="group glass-card p-6 rounded-2xl border border-border/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          <div className="flex items-center space-x-1 text-xs text-green-500">
            <TrendIcon className="h-3 w-3" />
            <span>{trend.text}</span>
          </div>
        </div>
        <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
