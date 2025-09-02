// Export centralisé de tous les hooks de requête React Query

// Hooks pour les produits
export * from './useProductQueries';

// Hooks pour les catégories
export * from './useCategoryQueries';

// Hooks pour les utilisateurs
export * from './useUserQueries';

// Hooks pour les commandes
export * from './useOrderQueries';

// Hooks pour les marques
export * from './useBrandQueries';

// Hooks pour le panier
export * from './useCartQueries';

// Hooks pour les statistiques
export * from './useStatsQueries';

// Export du client et des clés de requête
export { queryClient, queryKeys } from '@/lib/queryClient';