import { useMainCategories, usePrefetchSubcategories } from '@/hooks/queries';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import FallbackImage from "@/components/shared/FallbackImage"; // Importation du composant FallbackImage
// import type { ExtendedCategory } from "@/services/categoryService"; // Supprimé

interface CategoryListProps {
  className?: string;
  showSubcategories?: boolean;
}

export function CategoryList({ className = "", showSubcategories = false }: CategoryListProps) {
  const { data: categories, isLoading, error } = useMainCategories();
  const prefetchSubcategories = usePrefetchSubcategories();

  const handleCategoryHover = (categoryId: string) => {
    if (showSubcategories) {
      prefetchSubcategories(categoryId);
    }
  };

  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="space-y-3">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Erreur lors du chargement des catégories : {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <p className="text-muted-foreground text-lg">
          Aucune catégorie disponible.
        </p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {categories.map((category) => (
        <Link
          key={category.id}
          to={`/catalog/${category.slug}`}
          onMouseEnter={() => handleCategoryHover(category.id)}
        >
          <Card className="group hover:shadow-lg transition-shadow duration-200 h-full">
            <CardContent className="p-0">
              <div className="relative overflow-hidden rounded-t-lg">
                <FallbackImage // Remplacement de <img> par <FallbackImage>
                  src={category.imageUrl || '/placeholder.svg'}
                  alt={category.name}
                  className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-200"
                  loading="lazy"
                />
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {category.description}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                
                {showSubcategories && category.children && category.children.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-muted-foreground mb-2">
                      Sous-catégories :
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {category.children.slice(0, 3).map((subcategory) => (
                        <span
                          key={subcategory.id}
                          className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded"
                        >
                          {subcategory.name}
                        </span>
                      ))}
                      {category.children.length > 3 && (
                        <span className="text-xs text-muted-foreground">
                          +{category.children.length - 3} autres
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

