import { QueryClient } from '@tanstack/react-query';

// Configuration optimisée du QueryClient
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache pendant 5 minutes par défaut
      staleTime: 5 * 60 * 1000,
      // Garde en cache pendant 30 minutes
      gcTime: 30 * 60 * 1000,
      // Retry 3 fois en cas d'erreur avec backoff exponentiel
      retry: (failureCount, error: any) => {
        // Ne pas retry pour les erreurs 4xx (client errors)
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Optimisations pour l'UX
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: true,
    },
    mutations: {
      // Retry une fois pour les mutations
      retry: 1,
      // Timeout pour les mutations
      networkMode: 'online',
    },
  },
});

// Clés de requête centralisées et typées
export const queryKeys = {
  // Produits
  products: {
    all: ['products'] as const,
    lists: () => [...queryKeys.products.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.products.lists(), filters] as const,
    details: () => [...queryKeys.products.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.products.details(), id] as const,
    byCategory: (categoryId: string) => [...queryKeys.products.all, 'category', categoryId] as const,
    byMerchant: (merchantId: string) => [...queryKeys.products.all, 'merchant', merchantId] as const,
    search: (query: string) => [...queryKeys.products.all, 'search', query] as const,
    infinite: (filters: Record<string, any>) => [...queryKeys.products.all, 'infinite', filters] as const,
  },

  // Catégories
  categories: {
    all: ['categories'] as const,
    lists: () => [...queryKeys.categories.all, 'list'] as const,
    list: (filters?: Record<string, any>) => [...queryKeys.categories.lists(), filters] as const,
    details: () => [...queryKeys.categories.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.categories.details(), id] as const,
    main: () => [...queryKeys.categories.all, 'main'] as const,
    subcategories: (parentId: string) => [...queryKeys.categories.all, 'subcategories', parentId] as const,
    hierarchy: () => [...queryKeys.categories.all, 'hierarchy'] as const,
  },

  // Utilisateurs
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters?: Record<string, any>) => [...queryKeys.users.lists(), filters] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
    merchants: () => [...queryKeys.users.all, 'merchants'] as const,
    merchant: (id: string) => [...queryKeys.users.merchants(), id] as const,
    current: () => [...queryKeys.users.all, 'current'] as const,
    profile: () => [...queryKeys.users.all, 'profile'] as const,
  },

  // Commandes
  orders: {
    all: ['orders'] as const,
    lists: () => [...queryKeys.orders.all, 'list'] as const,
    list: (filters?: Record<string, any>) => [...queryKeys.orders.lists(), filters] as const,
    details: () => [...queryKeys.orders.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.orders.details(), id] as const,
    byUser: (userId: string) => [...queryKeys.orders.all, 'user', userId] as const,
    byMerchant: (merchantId: string) => [...queryKeys.orders.all, 'merchant', merchantId] as const,
    recent: () => [...queryKeys.orders.all, 'recent'] as const,
    stats: (merchantId?: string) => [...queryKeys.orders.all, 'stats', merchantId] as const,
  },

  // Marques
  brands: {
    all: ['brands'] as const,
    lists: () => [...queryKeys.brands.all, 'list'] as const,
    list: (filters?: Record<string, any>) => [...queryKeys.brands.lists(), filters] as const,
    details: () => [...queryKeys.brands.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.brands.details(), id] as const,
  },

  // Statistiques
  stats: {
    all: ['stats'] as const,
    dashboard: () => [...queryKeys.stats.all, 'dashboard'] as const,
    merchant: (merchantId: string) => [...queryKeys.stats.all, 'merchant', merchantId] as const,
    admin: () => [...queryKeys.stats.all, 'admin'] as const,
  },

  // Panier
  cart: {
    all: ['cart'] as const,
    items: () => [...queryKeys.cart.all, 'items'] as const,
    total: () => [...queryKeys.cart.all, 'total'] as const,
  },
} as const;

// Types pour les clés de requête
export type QueryKeys = typeof queryKeys;

// Utilitaires pour la gestion des erreurs
export const handleQueryError = (error: any) => {
  console.error('Query error:', error);
  
  if (error?.response?.status === 401) {
    // Rediriger vers la page de connexion
    window.location.href = '/auth';
    return;
  }
  
  if (error?.response?.status === 403) {
    // Accès refusé
    return 'Accès refusé. Vous n\'avez pas les permissions nécessaires.';
  }
  
  if (error?.response?.status >= 500) {
    return 'Erreur serveur. Veuillez réessayer plus tard.';
  }
  
  return error?.message || 'Une erreur inattendue s\'est produite.';
};

// Configuration pour les mutations optimistes
export const optimisticUpdateConfig = {
  // Délai avant de considérer qu'une mutation a échoué
  mutationTimeout: 10000,
  // Délai avant de rollback en cas d'échec
  rollbackDelay: 1000,
};