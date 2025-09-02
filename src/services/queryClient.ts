import { QueryClient } from "@tanstack/react-query";

// Configuration centralisée du QueryClient
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache pendant 5 minutes par défaut
      staleTime: 5 * 60 * 1000,
      // Garde en cache pendant 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry 3 fois en cas d'erreur
      retry: 3,
      // Retry avec un délai exponentiel
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch automatiquement quand la fenêtre reprend le focus
      refetchOnWindowFocus: false,
      // Refetch automatiquement lors de la reconnexion
      refetchOnReconnect: true,
    },
    mutations: {
      // Retry une fois pour les mutations
      retry: 1,
    },
  },
});

// Clés de requête centralisées pour éviter les erreurs de typage
export const queryKeys = {
  // Produits
  products: {
    all: ["produit"] as const, // Changé de 'products' à 'produit'
    lists: () => [...queryKeys.products.all, "list"] as const,
    list: (filters: Record<string, any>) =>
      [...queryKeys.products.lists(), filters] as const,
    details: () => [...queryKeys.products.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.products.details(), id] as const,
    byCategory: (categoryId: string) =>
      [...queryKeys.products.all, "category", categoryId] as const,
    byMerchant: (merchantId: string) =>
      [...queryKeys.products.all, "merchant", merchantId] as const,
    search: (query: string) =>
      [...queryKeys.products.all, "search", query] as const,
  },

  // Catégories
  categories: {
    all: ["categories"] as const,
    lists: () => [...queryKeys.categories.all, "list"] as const,
    list: (filters?: Record<string, any>) =>
      [...queryKeys.categories.lists(), filters] as const,
    details: () => [...queryKeys.categories.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.categories.details(), id] as const,
    main: () => [...queryKeys.categories.all, "main"] as const,
    subcategories: (parentId: string) =>
      [...queryKeys.categories.all, "subcategories", parentId] as const,
    hierarchy: () => [...queryKeys.categories.all, "hierarchy"] as const,
  },

  // Utilisateurs
  users: {
    all: ["users"] as const,
    lists: () => [...queryKeys.users.all, "list"] as const,
    list: (filters?: Record<string, any>) =>
      [...queryKeys.users.lists(), filters] as const,
    details: () => [...queryKeys.users.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
    merchants: () => [...queryKeys.users.all, "merchants"] as const,
    merchant: (id: string) => [...queryKeys.users.merchants(), id] as const,
    current: () => [...queryKeys.users.all, "current"] as const,
  },

  // Commandes
  orders: {
    all: ["orders"] as const,
    lists: () => [...queryKeys.orders.all, "list"] as const,
    list: (filters?: Record<string, any>) =>
      [...queryKeys.orders.lists(), filters] as const,
    details: () => [...queryKeys.orders.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.orders.details(), id] as const,
    byUser: (userId: string) =>
      [...queryKeys.orders.all, "user", userId] as const,
    byMerchant: (merchantId: string) =>
      [...queryKeys.orders.all, "merchant", merchantId] as const,
    recent: () => [...queryKeys.orders.all, "recent"] as const,
  },

  // Marques
  brands: {
    all: ["brands"] as const,
    lists: () => [...queryKeys.brands.all, "list"] as const,
    list: (filters?: Record<string, any>) =>
      [...queryKeys.brands.lists(), filters] as const,
    details: () => [...queryKeys.brands.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.brands.details(), id] as const,
  },

  // Attributs
  attributes: {
    all: ["attributes"] as const,
    lists: () => [...queryKeys.attributes.all, "list"] as const,
    list: (filters?: Record<string, any>) =>
      [...queryKeys.attributes.lists(), filters] as const,
    details: () => [...queryKeys.attributes.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.attributes.details(), id] as const,
  },

  // Statistiques
  stats: {
    all: ["stats"] as const,
    dashboard: () => [...queryKeys.stats.all, "dashboard"] as const,
    merchant: (merchantId: string) =>
      [...queryKeys.stats.all, "merchant", merchantId] as const,
    admin: () => [...queryKeys.stats.all, "admin"] as const,
  },

  // Marchands
  merchants: {
    all: ["merchants"] as const,
    stats: () => [...queryKeys.merchants.all, "stats"] as const,
    profiles: () => [...queryKeys.merchants.all, "profiles"] as const,
    profile: (id: string) => [...queryKeys.merchants.profiles(), id] as const,
  },
} as const;

// Types pour les clés de requête
export type QueryKeys = typeof queryKeys;
