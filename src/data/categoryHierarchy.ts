// Structure hiérarchique des catégories pour un filtrage cohérent

import { categoryService } from "@/services/categoryService";
import type { ExtendedCategory } from "@/services/categoryService";

// Interface pour la compatibilité avec le code existant
export interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
  children?: CategoryNode[];
  level: number;
}

// Fonction pour obtenir tous les descendants d'une catégorie (version pour les données plates)
async function getAllDescendants(
  categoryId: string,
  allCategories: ExtendedCategory[]
): Promise<string[]> {
  const descendants = new Set<string>();

  const findDescendants = (parentId: string) => {
    const children = allCategories.filter((cat) => cat.parentId === parentId);
    children.forEach((child) => {
      descendants.add(child.id);
      findDescendants(child.id);
    });
  };

  findDescendants(categoryId);
  return Array.from(descendants);
}

// Fonction pour obtenir tous les ancêtres d'une catégorie (version pour les données plates)
async function getAllAncestors(
  categoryId: string,
  allCategories: ExtendedCategory[]
): Promise<string[]> {
  const ancestors = new Set<string>();

  const findAncestors = (currentId: string) => {
    const category = allCategories.find((cat) => cat.id === currentId);
    if (category?.parentId) {
      ancestors.add(category.parentId);
      findAncestors(category.parentId);
    }
  };

  findAncestors(categoryId);
  return Array.from(ancestors);
}

// Fonction pour obtenir les catégories compatibles avec une sélection
export async function getCompatibleCategories(
  selectedCategories: string[]
): Promise<string[]> {
  if (selectedCategories.length === 0) {
    return [];
  }

  try {
    // Récupérer toutes les catégories depuis le service
    const allCategories = await categoryService.getAllCategories();
    const compatibleCategories = new Set<string>();

    // Pour chaque catégorie sélectionnée, ajouter ses ancêtres et ses descendants
    for (const categoryId of selectedCategories) {
      // Ajouter la catégorie elle-même
      compatibleCategories.add(categoryId);

      // Ajouter tous les ancêtres de la catégorie
      const ancestors = await getAllAncestors(categoryId, allCategories);
      ancestors.forEach((id) => compatibleCategories.add(id));

      // Ajouter tous les descendants de la catégorie
      const descendants = await getAllDescendants(categoryId, allCategories);
      descendants.forEach((id) => compatibleCategories.add(id));
    }

    return Array.from(compatibleCategories);
  } catch (error) {
    console.error("Error in getCompatibleCategories:", error);
    return selectedCategories; // En cas d'erreur, retourner uniquement les catégories sélectionnées
  }
}

// Fonction utilitaire pour obtenir une catégorie par son ID
export async function getCategoryById(
  categoryId: string
): Promise<ExtendedCategory | null> {
  try {
    const allCategories = await categoryService.getAllCategories();
    return allCategories.find((cat) => cat.id === categoryId) || null;
  } catch (error) {
    console.error("Error in getCategoryById:", error);
    return null;
  }
}

// Fonction pour obtenir le chemin hiérarchique d'une catégorie
export async function getCategoryPath(
  categoryId: string
): Promise<ExtendedCategory[]> {
  const path: ExtendedCategory[] = [];

  const buildPath = async (currentId: string) => {
    const category = await getCategoryById(currentId);
    if (category) {
      path.unshift(category);
      if (category.parentId) {
        await buildPath(category.parentId);
      }
    }
  };

  await buildPath(categoryId);
  return path;
}

// Fonction pour obtenir toutes les catégories à plat
export async function getFlatCategories(): Promise<ExtendedCategory[]> {
  try {
    return await categoryService.getAllCategories();
  } catch (error) {
    console.error("Error in getFlatCategories:", error);
    return [];
  }
}

// Fonction pour vérifier si une catégorie est un ancêtre d'une autre
export async function isAncestor(
  ancestorId: string,
  descendantId: string
): Promise<boolean> {
  try {
    const allCategories = await categoryService.getAllCategories();
    const ancestors = await getAllAncestors(descendantId, allCategories);
    return ancestors.includes(ancestorId);
  } catch (error) {
    console.error("Error in isAncestor:", error);
    return false;
  }
}

// Fonction pour vérifier si une catégorie est un descendant d'une autre
export async function isDescendant(
  descendantId: string,
  ancestorId: string
): Promise<boolean> {
  try {
    const allCategories = await categoryService.getAllCategories();
    const descendants = await getAllDescendants(ancestorId, allCategories);
    return descendants.includes(descendantId);
  } catch (error) {
    console.error("Error in isDescendant:", error);
    return false;
  }
}
