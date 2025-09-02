import React, { useState, useMemo } from "react";
import { SearchableSelect } from "./searchable-select";
import { useCategories, useSubcategories } from "@/hooks/queries";
import type { Category } from "@/types";

interface CategorySelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function CategorySelect({
  value,
  onValueChange,
  placeholder = "Sélectionner une catégorie",
  disabled = false,
  className,
}: CategorySelectProps) {
  const [selectedMainCategory, setSelectedMainCategory] = useState<string>("");

  const { data: allCategories = [], isLoading: isLoadingCategories } =
    useCategories();
  const { data: subcategories = [], isLoading: isLoadingSubcategories } =
    useSubcategories(selectedMainCategory);

  // Séparer les catégories principales (sans parentId) des sous-catégories
  const mainCategories = useMemo(() => {
    return allCategories.filter((cat) => !cat.parentId);
  }, [allCategories]);

  // Options pour le select principal
  const mainCategoryOptions = useMemo(() => {
    return mainCategories.map((category) => ({
      value: category.id,
      label: category.name,
    }));
  }, [mainCategories]);

  // Options pour le select des sous-catégories
  const subcategoryOptions = useMemo(() => {
    return subcategories.map((category) => ({
      value: category.id,
      label: category.name,
    }));
  }, [subcategories]);

  // Déterminer la catégorie principale sélectionnée basée sur la valeur actuelle
  React.useEffect(() => {
    if (value) {
      const selectedCategory = allCategories.find((cat) => cat.id === value);
      if (selectedCategory) {
        if (selectedCategory.parentId) {
          // C'est une sous-catégorie, définir la catégorie parent
          setSelectedMainCategory(selectedCategory.parentId);
        } else {
          // C'est une catégorie principale
          setSelectedMainCategory(selectedCategory.id);
        }
      }
    }
  }, [value, allCategories]);

  const handleMainCategoryChange = (categoryId: string) => {
    setSelectedMainCategory(categoryId);
    // Si on sélectionne une catégorie principale et qu'elle n'a pas de sous-catégories,
    // on peut directement la sélectionner
    const category = mainCategories.find((cat) => cat.id === categoryId);
    if (category) {
      onValueChange(categoryId);
    }
  };

  const handleSubcategoryChange = (subcategoryId: string) => {
    onValueChange(subcategoryId);
  };

  if (isLoadingCategories) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-gray-200 animate-pulse rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Catégorie principale
        </label>
        <SearchableSelect
          options={mainCategoryOptions}
          value={selectedMainCategory}
          onValueChange={handleMainCategoryChange}
          placeholder="Sélectionner une catégorie principale"
          searchPlaceholder="Rechercher une catégorie..."
          disabled={disabled}
          className={className}
        />
      </div>

      {selectedMainCategory && subcategoryOptions.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sous-catégorie
          </label>
          <SearchableSelect
            options={subcategoryOptions}
            value={
              value && subcategories.find((sub) => sub.id === value)
                ? value
                : ""
            }
            onValueChange={handleSubcategoryChange}
            placeholder="Sélectionner une sous-catégorie"
            searchPlaceholder="Rechercher une sous-catégorie..."
            disabled={disabled || isLoadingSubcategories}
            className={className}
          />
        </div>
      )}
    </div>
  );
}
