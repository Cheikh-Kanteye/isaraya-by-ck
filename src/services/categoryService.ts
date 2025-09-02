import { apiService } from "./api";
import type { Category } from "@/types";

// Interface étendue pour les besoins spécifiques du frontend
export interface ExtendedCategory extends Category {
  isActive: boolean;
  order: number;
  type: "main" | "promo";
  parentId: string | null; // parentId peut être null pour les catégories principales
  children?: ExtendedCategory[]; // Ajout de la propriété children
}

export interface FormattedCategory {
  id: string;
  title: string;
  slug: string;
  description?: string;
  image?: string;
  subcategories: Array<{
    id: string;
    name: string;
    slug: string;
    image?: string;
  }>;
}

// Cache global pour éviter les requêtes répétées
class CategoryCache {
  private cache: ExtendedCategory[] | null = null;
  private lastFetch: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes en millisecondes
  private pendingRequest: Promise<ExtendedCategory[]> | null = null;

  async getCategories(): Promise<ExtendedCategory[]> {
    const now = Date.now();

    // Si on a un cache valide, le retourner
    if (this.cache && now - this.lastFetch < this.CACHE_DURATION) {
      return this.cache;
    }

    // Si une requête est déjà en cours, attendre son résultat
    if (this.pendingRequest) {
      return this.pendingRequest;
    }

    // Créer une nouvelle requête
    this.pendingRequest = this.fetchCategories();

    try {
      const categories = await this.pendingRequest;
      this.cache = categories;
      this.lastFetch = now;
      return categories;
    } catch (error) {
      console.error("Error fetching categories:", error);
      // En cas d'erreur, retourner le cache s'il existe, sinon un tableau vide
      return this.cache || [];
    } finally {
      this.pendingRequest = null;
    }
  }

  private async fetchCategories(): Promise<ExtendedCategory[]> {
    const categories =
      (await apiService.categories.getAll()) as ExtendedCategory[];
    // Assurer la cohérence des données
    return categories.map((cat) => ({
      ...cat,
      isActive: cat.isActive ?? true,
      order: cat.order ?? 0,
      type: cat.type ?? "main",
      parentId: cat.parentId ?? null,
    }));
  }

  // Méthode pour invalider le cache manuellement si nécessaire
  invalidate(): void {
    this.cache = null;
    this.lastFetch = 0;
    this.pendingRequest = null;
  }

  // Méthode pour forcer le rafraîchissement
  async refresh(): Promise<ExtendedCategory[]> {
    this.invalidate();
    return this.getCategories();
  }
}

// Instance unique du cache
const categoryCache = new CategoryCache();

export const categoryService = {
  // Récupérer toutes les catégories principales (sans parent)
  async getMainCategories(): Promise<ExtendedCategory[]> {
    try {
      const allCategories = await categoryCache.getCategories();
      const mainCategories = allCategories
        .filter((cat) => !cat.parentId && cat.isActive !== false)
        .sort((a, b) => (a.order || 0) - (b.order || 0));

      // Hydrater les catégories principales avec leurs sous-catégories
      return mainCategories.map((mainCat) => ({
        ...mainCat,
        children: allCategories
          .filter((cat) => cat.parentId === mainCat.id && cat.isActive !== false)
          .sort((a, b) => (a.order || 0) - (b.order || 0)),
      }));
    } catch (error) {
      console.error("Error fetching main categories:", error);
      return [];
    }
  },

  // Récupérer les sous-catégories d'une catégorie
  async getSubcategories(parentId: string): Promise<ExtendedCategory[]> {
    try {
      if (!parentId) return [];

      const allCategories = await categoryCache.getCategories();
      return allCategories
        .filter((cat) => cat.parentId === parentId)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
    } catch (error) {
      console.error(
        `Error fetching subcategories for category ${parentId}:`,
        error
      );
      return [];
    }
  },

  // Récupérer une catégorie par son slug
  async getCategoryBySlug(slug: string): Promise<ExtendedCategory | null> {
    try {
      if (!slug) return null;

      const allCategories = await categoryCache.getCategories();
      return allCategories.find((cat) => cat.slug === slug) || null;
    } catch (error) {
      console.error(`Error fetching category with slug ${slug}:`, error);
      return null;
    }
  },

  // Récupérer toutes les catégories (pour le sitemap, etc.)
  async getAllCategories(): Promise<ExtendedCategory[]> {
    try {
      return await categoryCache.getCategories();
    } catch (error) {
      console.error("Error fetching all categories:", error);
      return [];
    }
  },

  // Formater une catégorie pour l'affichage dans le composant CatalogShowcase
  async getFormattedCategories(): Promise<FormattedCategory[]> {
    try {
      // Récupérer toutes les catégories depuis le cache
      const allCategories = await categoryCache.getCategories();

      // Créer une Map pour un accès plus rapide
      const categoriesMap = new Map(allCategories.map((cat) => [cat.id, cat]));

      // Filtrer les catégories principales (sans parent)
      const mainCategories = allCategories.filter(
        (cat) => !cat.parentId && cat.isActive !== false
      );

      // Formater les catégories principales avec leurs sous-catégories
      const formattedCategories = mainCategories.map((mainCat) => {
        // Trouver les sous-catégories pour cette catégorie principale
        const subcategories = allCategories.filter(
          (cat) => cat.parentId === mainCat.id && cat.isActive !== false
        );

        return {
          id: mainCat.id,
          title: mainCat.name,
          slug: mainCat.slug,
          description: mainCat.description,
          image: mainCat.imageUrl || "/placeholder.svg",
          subcategories: subcategories
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map((sub) => ({
              id: sub.id,
              name: sub.name,
              slug: sub.slug,
              image: sub.imageUrl || "/placeholder.svg",
            })),
        };
      });

      return formattedCategories.sort((a, b) => {
        const aCat = categoriesMap.get(a.id);
        const bCat = categoriesMap.get(b.id);
        return (aCat?.order || 0) - (bCat?.order || 0);
      });
    } catch (error) {
      console.error("Error formatting categories:", error);
      return [];
    }
  },

  // Vérifier si une catégorie est une catégorie principale
  isMainCategory(category: ExtendedCategory): boolean {
    return !category.parentId;
  },

  // Vérifier si une catégorie est une sous-catégorie
  isSubcategory(category: ExtendedCategory): boolean {
    return !!category.parentId;
  },

  // Obtenir le chemin hiérarchique d'une catégorie (pour le fil d'Ariane)
  async getCategoryPath(categoryId: string): Promise<ExtendedCategory[]> {
    try {
      if (!categoryId) return [];

      const path: ExtendedCategory[] = [];
      let currentId: string | null = categoryId;
      const allCategories = await categoryCache.getCategories();
      const categoriesMap = new Map(allCategories.map((cat) => [cat.id, cat]));

      // Éviter les boucles infinies avec un compteur de sécurité
      let depth = 0;
      const MAX_DEPTH = 10;

      while (currentId && depth < MAX_DEPTH) {
        const category = categoriesMap.get(currentId);
        if (!category) break;

        path.unshift(category);
        currentId = category.parentId || null;
        depth++;
      }

      return path;
    } catch (error) {
      console.error(`Error getting category path for ${categoryId}:`, error);
      return [];
    }
  },

  // Récupérer une catégorie par son ID
  async getCategoryById(id: string): Promise<ExtendedCategory | null> {
    try {
      if (!id) return null;

      const allCategories = await categoryCache.getCategories();
      return allCategories.find((cat) => cat.id === id) || null;
    } catch (error) {
      console.error(`Error fetching category with ID ${id}:`, error);
      return null;
    }
  },

  // Récupérer les catégories promotionnelles
  async getPromoCategories(): Promise<ExtendedCategory[]> {
    try {
      const allCategories = await categoryCache.getCategories();
      return allCategories
        .filter((cat) => cat.type === "promo" && cat.isActive !== false)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
    } catch (error) {
      console.error("Error fetching promo categories:", error);
      return [];
    }
  },

  // Méthodes utilitaires pour la gestion du cache
  cache: {
    // Invalider le cache
    invalidate(): void {
      categoryCache.invalidate();
    },

    // Forcer le rafraîchissement du cache
    async refresh(): Promise<ExtendedCategory[]> {
      return categoryCache.refresh();
    },

    // Vérifier si le cache est valide
    isValid(): boolean {
      return (
        categoryCache["cache"] !== null &&
        Date.now() - categoryCache["lastFetch"] <
        categoryCache["CACHE_DURATION"]
      );
    },
  },

  // Recherche optimisée dans les catégories
  async searchCategories(query: string): Promise<ExtendedCategory[]> {
    try {
      if (!query || query.trim().length === 0) return [];

      const allCategories = await categoryCache.getCategories();
      const searchTerm = query.toLowerCase().trim();

      return allCategories
        .filter(
          (cat) =>
            cat.name.toLowerCase().includes(searchTerm) ||
            (cat.description &&
              cat.description.toLowerCase().includes(searchTerm)) ||
            cat.slug.toLowerCase().includes(searchTerm)
        )
        .sort((a, b) => {
          // Prioriser les correspondances exactes en début de nom
          const aStartsWith = a.name.toLowerCase().startsWith(searchTerm);
          const bStartsWith = b.name.toLowerCase().startsWith(searchTerm);

          if (aStartsWith && !bStartsWith) return -1;
          if (!aStartsWith && bStartsWith) return 1;

          return (a.order || 0) - (b.order || 0);
        });
    } catch (error) {
      console.error("Error searching categories:", error);
      return [];
    }
  },

  // Obtenir les statistiques des catégories
  async getCategoryStats(): Promise<{
    total: number;
    mainCategories: number;
    subcategories: number;
    activeCategories: number;
    promoCategories: number;
  }> {
    try {
      const allCategories = await categoryCache.getCategories();

      return {
        total: allCategories.length,
        mainCategories: allCategories.filter((cat) => !cat.parentId).length,
        subcategories: allCategories.filter((cat) => !!cat.parentId).length,
        activeCategories: allCategories.filter((cat) => cat.isActive !== false)
          .length,
        promoCategories: allCategories.filter((cat) => cat.type === "promo")
          .length,
      };
    } catch (error) {
      console.error("Error getting category stats:", error);
      return {
        total: 0,
        mainCategories: 0,
        subcategories: 0,
        activeCategories: 0,
        promoCategories: 0,
      };
    }
  },
};
