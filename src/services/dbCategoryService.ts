import { apiService } from "./api";
import type { Category } from "@/types";

export interface DbCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl: string;
  isActive: boolean;
  order: number;
  type?: string;
  parentId?: string | null;
}

export class DbCategoryService {
  private categories: DbCategory[] = [];
  private categoriesLoaded = false;

  async loadCategories(): Promise<void> {
    if (this.categoriesLoaded) return;
    
    try {
      this.categories = await apiService.getCategories();
      this.categoriesLoaded = true;
    } catch (error) {
      console.error("Failed to load categories:", error);
      throw error;
    }
  }

  async getCategories(): Promise<DbCategory[]> {
    await this.loadCategories();
    return this.categories;
  }

  async getMainCategories(): Promise<DbCategory[]> {
    await this.loadCategories();
    return this.categories.filter(cat => !cat.parentId || cat.parentId === null);
  }

  async getSubCategories(parentId: string): Promise<DbCategory[]> {
    await this.loadCategories();
    return this.categories.filter(cat => cat.parentId === parentId);
  }

  async getCategoryById(id: string): Promise<DbCategory | null> {
    await this.loadCategories();
    return this.categories.find(cat => cat.id === id) || null;
  }

  // Obtenir toutes les sous-catégories d'une catégorie parent (récursif)
  async getAllSubCategories(parentId: string): Promise<string[]> {
    await this.loadCategories();
    const subCategories: string[] = [];
    
    const findSubs = (pid: string) => {
      const subs = this.categories.filter(cat => cat.parentId === pid);
      for (const sub of subs) {
        subCategories.push(sub.id);
        findSubs(sub.id); // Récursif pour les sous-sous-catégories
      }
    };
    
    findSubs(parentId);
    return subCategories;
  }

  // Obtenir les catégories compatibles pour le filtrage
  async getCompatibleCategories(selectedCategories: string[]): Promise<string[]> {
    if (selectedCategories.length === 0) return [];
    
    await this.loadCategories();
    const compatible = new Set<string>();
    
    for (const categoryId of selectedCategories) {
      // Ajouter la catégorie elle-même
      compatible.add(categoryId);
      
      // Si c'est une catégorie parent, ajouter ses enfants
      const subCategories = await this.getAllSubCategories(categoryId);
      subCategories.forEach(id => compatible.add(id));
    }
    
    return Array.from(compatible);
  }

  // Vérifier si une catégorie est un parent (pas de parentId)
  isMainCategory(categoryId: string): boolean {
    const category = this.categories.find(cat => cat.id === categoryId);
    return category ? (!category.parentId || category.parentId === null) : false;
  }

  // Obtenir le chemin de navigation pour une catégorie
  async getCategoryPath(categoryId: string): Promise<DbCategory[]> {
    await this.loadCategories();
    const path: DbCategory[] = [];
    
    let currentId: string | null = categoryId;
    while (currentId) {
      const category = this.categories.find(cat => cat.id === currentId);
      if (category) {
        path.unshift(category);
        currentId = category.parentId || null;
      } else {
        break;
      }
    }
    
    return path;
  }
}

export const dbCategoryService = new DbCategoryService();