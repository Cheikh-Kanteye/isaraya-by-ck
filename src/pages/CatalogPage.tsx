import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { categoryService } from "@/services/categoryService";
import { ProductFilters } from "@/components/catalog/ProductFilters";
import { ProductCatalog } from "@/components/catalog/ProductCatalog";
import { CatalogStats } from "@/components/catalog/CatalogStats";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { useCatalogFilters } from "@/hooks/useCatalogFilters";
import { useProductSearch } from "@/hooks/useProductSearch";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Filter, X } from "lucide-react";
import { useProductStore } from "@/stores";

interface BreadcrumbItem {
  label: string;
  path: string;
}

export default function CatalogPage() {
  const { category: categoryId, subcategory: subcategoryId } = useParams<{
    category?: string;
    subcategory?: string;
  }>();

  const [dynamicBreadcrumbs, setDynamicBreadcrumbs] = useState<
    BreadcrumbItem[]
  >([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const {
    context,
    filters,
    filteredAvailableCategories,
    availableBrands,
    handleFiltersChange,
    handleClearFilters,
    isLoading,
    error,
    pageTitle,
    pageDescription,
  } = useCatalogFilters();
  const { products } = useProductStore();

  const {
    searchQuery,
    sortBy,
    filteredProducts,
    totalProducts,
    clearSearch,
    resetAll,
  } = useProductSearch({
    products: products,
    defaultSortBy: "name-asc",
    defaultViewMode: "grid",
  });

  useEffect(() => {
    const fetchBreadcrumbs = async () => {
      const baseItems: BreadcrumbItem[] = [
        { label: "Accueil", path: "/" },
        { label: "Catalogue", path: "/catalog" },
      ];

      if (categoryId) {
        try {
          const categoryPath = await categoryService.getCategoryPath(
            categoryId
          );
          const categoryBreadcrumbs = categoryPath.map((cat) => ({
            label: cat.name,
            path: `/catalog/${cat.id}`,
          }));

          if (subcategoryId && subcategoryId !== categoryId) {
            const subcategoryPath = await categoryService.getCategoryPath(
              subcategoryId
            );
            const subcategory = subcategoryPath[subcategoryPath.length - 1];
            if (subcategory) {
              categoryBreadcrumbs.push({
                label: subcategory.name,
                path: `/catalog/${categoryId}/${subcategoryId}`,
              });
            }
          }

          setDynamicBreadcrumbs([...baseItems, ...categoryBreadcrumbs]);
        } catch (error) {
          console.error("Error fetching breadcrumb path:", error);
          setDynamicBreadcrumbs(baseItems);
        }
      } else {
        setDynamicBreadcrumbs(baseItems);
      }
    };

    fetchBreadcrumbs();
  }, [categoryId, subcategoryId]);

  const handleRefresh = async () => {
    try {
      window.location.reload();
    } catch (error) {
      console.error("Error refreshing catalog:", error);
    }
  };

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  // Close drawer on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        closeDrawer();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isDrawerOpen]);

  return (
    <div className="container mx-auto px-4 py-8 bg-white">
      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-gray-600">Chargement du catalogue...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-100 border border-red-300 rounded-lg p-6 mb-6">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-red-900 font-medium mb-2">
                Erreur de chargement
              </h3>
              <p className="text-red-800 text-sm mb-4">{error}</p>
              <Button
                onClick={handleRefresh}
                size="sm"
                variant="outline"
                className="border-red-400 text-red-800 hover:bg-red-200"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Réessayer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumbs */}
      <Breadcrumbs items={dynamicBreadcrumbs} />

      {/* Page Header */}
      <header className="my-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-2 text-gray-900">
          {pageTitle}
        </h1>
        <p className="text-lg text-gray-600 mb-4">{pageDescription}</p>

        <div className="flex justify-center space-x-2">
          {context.isSubcategory && (
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-50 text-green-900 text-sm">
              <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
              Sous-catégorie spécialisée
            </div>
          )}

          {context.id && !context.isSubcategory && (
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/5 text-primary text-sm">
              <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
              Catégorie sélectionnée
            </div>
          )}

          {!context.id && (
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-50 text-gray-900 text-sm">
              <span className="w-2 h-2 bg-gray-600 rounded-full mr-2"></span>
              Catalogue complet
            </div>
          )}
        </div>
      </header>

      {/* Catalog Stats */}
      <CatalogStats
        totalProducts={totalProducts}
        filteredProducts={filteredProducts.length}
        filters={filters}
        loading={isLoading}
        categoryName={context.name}
        isSubcategory={context.isSubcategory}
      />

      {/* Filter Button for MD screens */}
      <div className="md:block lg:hidden mb-6">
        <Button
          onClick={toggleDrawer}
          variant="outline"
          className="w-full sm:w-auto border-gray-300 text-gray-800 hover:bg-gray-100"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filtres
        </Button>
      </div>

      {/* Drawer Overlay */}
      {isDrawerOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:block lg:hidden"
          onClick={closeDrawer}
        />
      )}

      {/* Slide Drawer for MD screens */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 z-50 md:block lg:hidden overflow-y-auto ${
          isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Filtres</h2>
            <Button
              onClick={closeDrawer}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="p-4">
          <ProductFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
            availableCategories={filteredAvailableCategories}
            availableBrands={availableBrands}
            currentCategoryId={context.id}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Filters Sidebar - Hidden on MD, Visible on LG+ */}
        <aside className="hidden lg:block lg:col-span-1 sticky top-20 overflow-y-auto max-h-[80vh]">
          <div className="sticky top-20">
            <ProductFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearFilters={handleClearFilters}
              availableCategories={filteredAvailableCategories}
              availableBrands={availableBrands}
              currentCategoryId={context.id}
            />
          </div>
        </aside>

        {/* Product Catalog */}
        <main className="col-span-1 lg:col-span-3">
          {/* Empty State */}
          {!isLoading && filteredProducts.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Aucun produit trouvé
              </h3>
              <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                {searchQuery
                  ? `Aucun produit ne correspond à votre recherche "${searchQuery}".`
                  : "Aucun produit ne correspond à vos critères de filtre actuels."}
              </p>
              <div className="flex justify-center space-x-4">
                {searchQuery && (
                  <Button
                    onClick={clearSearch}
                    variant="outline"
                    className="border-gray-300 text-gray-800 hover:bg-gray-100"
                  >
                    Effacer la recherche
                  </Button>
                )}
                <Button
                  onClick={handleClearFilters}
                  variant="outline"
                  className="border-gray-300 text-gray-800 hover:bg-gray-100"
                >
                  Effacer les filtres
                </Button>
                <Button
                  onClick={resetAll}
                  className="bg-primary/90 text-white hover:bg-primary"
                >
                  Tout réinitialiser
                </Button>
              </div>
            </div>
          )}

          {/* Product Grid/List */}
          {!isLoading && filteredProducts.length > 0 && <ProductCatalog />}
        </main>
      </div>
    </div>
  );
}