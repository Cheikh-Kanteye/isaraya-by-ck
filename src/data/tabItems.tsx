import { Bell, Heart, Settings, ShoppingBag, User } from "lucide-react";

export const tabItems = (stats: { [k: string]: number }) => [
  {
    value: "overview",
    label: "Vue d'ensemble",
    icon: <User className="h-4 w-4" />,
  },
  {
    value: "orders",
    label: "Mes commandes",
    icon: <ShoppingBag className="h-4 w-4" />,
  },
  {
    value: "favorites",
    label: "Mes favoris",
    icon: <Heart className="h-4 w-4" />,
  },
  {
    value: "profile",
    label: "Mon profil",
    icon: <Settings className="h-4 w-4" />,
  },
  {
    value: "notifications",
    label: "Notifications",
    icon: <Bell className="h-4 w-4" />,
    badge: stats.unreadNotifications > 0 ? stats.unreadNotifications : null,
  },
];
