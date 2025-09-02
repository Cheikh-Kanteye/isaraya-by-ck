import { useParams } from 'react-router-dom';
import { useCategories, useCategory } from '@/hooks/queries';
import { CategoryList } from '@/components/categories/CategoryList';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import FallbackImage from "@/components/shared/FallbackImage"; // Importation du composant FallbackImage
import { ProductGrid } from '@/components/products/ProductGrid';

export default function CatalogPageRefactored() {
  const { category: categorySlug, subcategory: subcategorySlug } = useParams();
  
  // Récupérer toutes les catégories pour la navigation
  const { data: allCategories, isLoading: categoriesLoading } = useCategories();
  
  // Trouver la catégorie actuelle par slug
  const currentCategory = allCategories?.find(cat => cat.slug === categorySlug);
  const currentSubcategory = subcategorySlug 
    ? allCategories?.find(cat => cat.slug === subcategorySlug && cat.parentId === currentCategory?.id)
    : null;

  // ID de la catégorie pour filtrer les produits
  const activeCategoryId = currentSubcategory?.id || currentCategory?.id;

  if (categoriesLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="space-y-4">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-6 w-1/4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Si aucune catégorie n'est spécifiée, afficher toutes les catégories
  if (!categorySlug) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Catalogue</h1>
            <p className="text-muted-foreground mt-2">
              Découvrez tous nos produits par catégorie
            </p>
          </div>
          
          <CategoryList showSubcategories={true} />
        </div>
      </div>
    );
  }

  // Si la catégorie n'existe pas
  if (!currentCategory) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Catégorie "{categorySlug}" introuvable.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Construire le breadcrumb
  const breadcrumbItems = [
    { label: 'Accueil', href: '/' },
    { label: 'Catalogue', href: '/catalog' },
    { label: currentCategory.name, href: `/catalog/${currentCategory.slug}` },
  ];

  if (currentSubcategory) {
    breadcrumbItems.push({
      label: currentSubcategory.name,
      href: `/catalog/${currentCategory.slug}/${currentSubcategory.slug}`,
    });
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbItems.map((item, index) => (
              <div key={index} className="flex items-center">
                {index > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  {index === breadcrumbItems.length - 1 ? (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={item.href}>
                      {item.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </div>
            ))}
          </BreadcrumbList>
        </Breadcrumb>

        {/* En-tête de la catégorie */}
        <div>
          <h1 className="text-3xl font-bold">
            {currentSubcategory?.name || currentCategory.name}
          </h1>
          {(currentSubcategory?.description || currentCategory.description) && (
            <p className="text-muted-foreground mt-2">
              {currentSubcategory?.description || currentCategory.description}
            </p>
          )}
        </div>

        {/* Sous-catégories si on est dans une catégorie principale */}
        {!currentSubcategory && currentCategory.children && currentCategory.children.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Sous-catégories</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
              {currentCategory.children.map((subcategory) => (
                <a
                  key={subcategory.id}
                  href={`/catalog/${currentCategory.slug}/${subcategory.slug}`}
                  className="block p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="text-center">
                    <FallbackImage
                      src={subcategory.imageUrl || '/placeholder.svg'}
                      alt={subcategory.name}
                      className="w-16 h-16 mx-auto mb-2 object-cover rounded"
                    />
                    <h3 className="font-medium text-sm">{subcategory.name}</h3>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Grille de produits */}
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Produits {currentSubcategory ? `en ${currentSubcategory.name}` : `en ${currentCategory.name}`}
          </h2>
          <ProductGrid categoryId={activeCategoryId} />
        </div>
      </div>
    </div>
  );
}

