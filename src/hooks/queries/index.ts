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

// Hooks pour les statistiques
export * from './useStatsQueries';

// Hooks pour l'administration
export { useOrders } from './useAdminQueries';

// Export du client et des clés de requête
export { queryClient, queryKeys } from '@/services/queryClient';
