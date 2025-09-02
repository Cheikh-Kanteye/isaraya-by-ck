import { useState, useMemo } from "react";
import { ChevronDown, ChevronRight, Folder, FolderOpen } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { Category } from "@/types";

interface HierarchicalCategoryFilterProps {
  selectedCategories: string[];
  onCategoryChange: (categoryId: string, checked: boolean) => void;
  availableCategories: Category[];
  currentCategoryId?: string;
  maxHeight?: string;
}

interface CategoryNode extends Category {
  children: CategoryNode[];
  level: number;
}

export function HierarchicalCategoryFilter({
  selectedCategories,
  onCategoryChange,
  availableCategories,
  currentCategoryId,
  maxHeight = "max-h-64",
}: HierarchicalCategoryFilterProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  const [showAll, setShowAll] = useState(false);

  // Build hierarchical tree structure
  const categoryTree = useMemo(() => {
    const categoryMap = new Map<string, CategoryNode>();
    const rootCategories: CategoryNode[] = [];

    // First pass: create all nodes
    availableCategories.forEach((category) => {
      categoryMap.set(category.id, {
        ...category,
        children: [],
        level: 0,
      });
    });

    // Second pass: build hierarchy
    availableCategories.forEach((category) => {
      const node = categoryMap.get(category.id)!;

      if (category.parentId && categoryMap.has(category.parentId)) {
        const parent = categoryMap.get(category.parentId)!;
        node.level = parent.level + 1;
        parent.children.push(node);
      } else {
        rootCategories.push(node);
      }
    });

    return rootCategories;
  }, [availableCategories]);

  // Get categories to display (limited or all)
  const displayCategories = useMemo(() => {
    if (showAll) return categoryTree;
    return categoryTree.slice(0, 5); // Show first 5 by default
  }, [categoryTree, showAll]);

  const toggleExpanded = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleCategoryToggle = (categoryId: string, checked: boolean) => {
    onCategoryChange(categoryId, checked);

    // Auto-expand parent categories when selecting a child
    if (checked) {
      const category = availableCategories.find((cat) => cat.id === categoryId);
      if (category?.parentId) {
        setExpandedCategories((prev) => new Set([...prev, category.parentId!]));
      }
    }
  };

  const renderCategoryNode = (node: CategoryNode): React.ReactNode => {
    const isSelected = selectedCategories.includes(node.id);
    const isExpanded = expandedCategories.has(node.id);
    const hasChildren = node.children.length > 0;
    const isCurrentCategory = currentCategoryId === node.id;
    const selectedChildrenCount = node.children.filter((child) =>
      selectedCategories.includes(child.id)
    ).length;

    return (
      <div key={node.id} className="space-y-1">
        <div
          className={`flex items-center space-x-2 py-1 px-2 rounded-md transition-colors ${
            isCurrentCategory ? "text-primary" : ""
          } ${isSelected ? "text-primary" : "hover:text-primary/60"}`}
          style={{ paddingLeft: `${0.5 + node.level * 1.5}rem` }}
        >
          {hasChildren ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={() => toggleExpanded(node.id)}
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </Button>
          ) : (
            <div className="w-4" /> // Spacer for alignment
          )}

          <div className="flex items-center space-x-2 flex-1">
            {hasChildren ? (
              isExpanded ? (
                <FolderOpen className="h-4 w-4 text-primary" />
              ) : (
                <Folder className="h-4 w-4 text-gray-500" />
              )
            ) : (
              <div className="w-4 h-4 rounded-full bg-primary" />
            )}

            <Checkbox
              id={`category-${node.id}`}
              checked={isSelected}
              onCheckedChange={(checked) =>
                handleCategoryToggle(node.id, !!checked)
              }
              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />

            <Label
              htmlFor={`category-${node.id}`}
              className={`flex-1 cursor-pointer text-sm ${
                isSelected ? "font-medium text-primary" : ""
              } ${isCurrentCategory ? "font-semibold text-primary" : ""}`}
            >
              {node.name}
              {isCurrentCategory && (
                <span className="ml-1 text-xs text-primary/70">(actuelle)</span>
              )}
              {selectedChildrenCount > 0 && (
                <span className="ml-2 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                  {selectedChildrenCount}
                </span>
              )}
            </Label>
          </div>
        </div>

        {/* Render children if expanded */}
        {hasChildren && isExpanded && (
          <div className="space-y-1">
            {node.children.map((child) => renderCategoryNode(child))}
          </div>
        )}
      </div>
    );
  };

  // Count total selected categories
  const totalSelected = selectedCategories.length;
  const hasMoreCategories = categoryTree.length > 5;

  if (categoryTree.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-4">
        Aucune catégorie disponible
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold">
          {currentCategoryId ? "Sous-catégories" : "Catégories"}
          {totalSelected > 0 && (
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({totalSelected} sélectionnée{totalSelected > 1 ? "s" : ""})
            </span>
          )}
        </h4>

        {totalSelected > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              selectedCategories.forEach((catId) => {
                onCategoryChange(catId, false);
              });
            }}
            className="text-xs h-6 px-2"
          >
            Tout désélectionner
          </Button>
        )}
      </div>

      <div className={`space-y-1 pr-2 overflow-y-auto ${maxHeight}`}>
        {displayCategories.map((node) => renderCategoryNode(node))}
      </div>

      {/* Show more/less button */}
      {hasMoreCategories && (
        <div className="mt-3 text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAll(!showAll)}
            className="text-xs h-7"
          >
            {showAll ? (
              <>Voir moins ({categoryTree.length - 5} masquées)</>
            ) : (
              <>Voir plus (+{categoryTree.length - 5} autres)</>
            )}
          </Button>
        </div>
      )}

      {/* Quick actions */}
      {categoryTree.length > 0 && (
        <div className="mt-4 p-2 bg-gray-50 rounded-md">
          <div className="flex justify-between text-xs text-gray-600">
            <span>
              {categoryTree.length} catégorie
              {categoryTree.length > 1 ? "s" : ""} disponible
              {categoryTree.length > 1 ? "s" : ""}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                // Expand all categories with children
                const allParentIds = categoryTree
                  .filter((node) => node.children.length > 0)
                  .map((node) => node.id);
                setExpandedCategories(new Set(allParentIds));
              }}
              className="text-xs h-5 px-1 hover:bg-gray-200"
            >
              Tout développer
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
