import {
  Home,
  Package2,
  ShoppingBag,
  BarChart3,
  Users,
  Settings,
  LucideIcon,
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Badge } from "@/components/ui/badge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getStatusColor = (status: string): string => {
  switch (status) {
    case "DELIVERED":
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
    case "SHIPPED":
      return "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary";
    case "EN_PREPARATION":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
    case "CANCELLED":
      return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
  }
};

export const getStatusLabel = (status: string): string => {
  switch (status) {
    case "DELIVERED":
      return "Livré";
    case "SHIPPED":
      return "Expédié";
    case "EN_PREPARATION":
      return "En préparation";
    case "CANCELLED":
      return "Annulé";
    default:
      return status;
  }
};

export const iconMapper: Record<string, LucideIcon> = {
  Home,
  Package2,
  ShoppingBag,
  BarChart3,
  Users,
  Settings,
};

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    minimumFractionDigits: 0,
  }).format(price);
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const sortByItems = [
  { label: "Pertinence", value: "produit" },
  { label: "Prix croissant", value: "produit:price:asc" },
  { label: "Prix décroissant", value: "produit:price:desc" },
  { label: "Nom A-Z", value: "produit:name:asc" },
  { label: "Nom Z-A", value: "produit:name:desc" },
];
