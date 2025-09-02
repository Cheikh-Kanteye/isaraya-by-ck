import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, ChevronDown, Grid, Package } from "lucide-react";
import { categoryService, Category } from "../../services/categoryService";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { Badge } from "../ui/badge";

interface CategoryNavigationProps {
  selectedCategoryId?: string;
  onCategorySelect: (categoryId: string | null) => void;
  showProductCount?: boolean;
  collapsible?: boolean;
  className?: string;
}

interface CategoryNode extends Omit<Category, "children"> {
  children: CategoryNode[];
  productCount: number;
}

export function CategoryNavigation({
  selectedCategoryId,
  onCategorySelect,
  showProductCount = true,
  collapsible = true,
  className = "",
}: CategoryNavigationProps) {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const data = await categoryService.getAllCategories();
        setCategories(data);
      } catch (err) {
        console.error("Failed to load categories", err);
        setError("Failed to load categories");
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const buildCategoryTree = (categories: Category[]): CategoryNode[] => {
    const categoryMap = new Map<string, CategoryNode>();
    const rootCategories: CategoryNode[] = [];

    // Créer les nœuds de catégorie
    categories.forEach((category) => {
      categoryMap.set(category.id, {
        ...category,
        children: [],
        productCount: 0, // À implémenter si nécessaire
      });
    });

    // Construire l'arbre
    categoryMap.forEach((category) => {
      if (
        category.parentCategoryId &&
        categoryMap.has(category.parentCategoryId)
      ) {
        const parent = categoryMap.get(category.parentCategoryId)!;
        parent.children.push(category);
      } else {
        rootCategories.push(category);
      }
    });

    // Trier les catégories par ordre
    const sortCategories = (nodes: CategoryNode[]): CategoryNode[] => {
      return nodes
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map((node) => ({
          ...node,
          children: sortCategories(node.children),
        }));
    };

    return sortCategories(rootCategories);
  };

  const renderCategoryNode = (category: CategoryNode, level = 0) => {
    const hasChildren = category.children.length > 0;
    const isExpanded = expandedCategories.has(category.id);
    const isSelected = selectedCategoryId === category.id;

    return (
      <div key={category.id} className="space-y-1">
        <div
          className={`flex items-center justify-between rounded-md hover:bg-accent ${
            isSelected ? "bg-accent" : ""
          }`}
        >
          <button
            className={`flex items-center flex-1 text-left py-2 px-3 text-sm font-medium ${
              isSelected ? "text-primary" : "text-foreground"
            }`}
            onClick={() => {
              onCategorySelect(category.id);
              navigate(`/catalog/${category.slug}`);
            }}
          >
            <span className="truncate">{category.name}</span>
            {showProductCount && category.productCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {category.productCount}
              </Badge>
            )}
          </button>
          {hasChildren && collapsible && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                toggleCategory(category.id);
              }}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
        {hasChildren && (isExpanded || !collapsible) && (
          <div className="ml-4 border-l border-border pl-2">
            {category.children.map((child) =>
              renderCategoryNode(child, level + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid className="h-5 w-5" />
            Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid className="h-5 w-5" />
            Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-destructive text-sm">{error}</div>
        </CardContent>
      </Card>
    );
  }

  const categoryTree = buildCategoryTree(categories);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Grid className="h-5 w-5" />
          Categories
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {categoryTree.length > 0 ? (
            categoryTree.map((category) => renderCategoryNode(category))
          ) : (
            <div className="text-muted-foreground text-sm py-2">
              No categories found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
