import { useState } from "react";
import { ProductCard } from "@/components/products/ProductCard";
import { Loader2 } from "lucide-react";
import { useProducts } from "@/hooks/queries";
import { QueryErrorBoundary } from "@/components/shared/QueryErrorBoundary";

const ProductGrid = () => {
  const { data: products = [], isLoading, error } = useProducts({ _limit: 8 });
  const [displayedCount, setDisplayedCount] = useState(8);
  const [loadingMore, setLoadingMore] = useState(false);

  console.log("ProductGrid: products:", products.length);

  const handleLoadMore = async () => {
    setLoadingMore(true);

    // Simulate loading delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setDisplayedCount((prev) => Math.min(prev + 8, products.length));
    setLoadingMore(false);
  };

  if (isLoading) {
    return (
      <section className="py-12 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center text-red-500">
            <p>Erreur lors du chargement des produits: {error.message}</p>
          </div>
        </div>
      </section>
    );
  }

  const displayedProducts = products.slice(0, displayedCount);
  const hasMoreProducts = displayedCount < products.length;

  return (
    <QueryErrorBoundary>
    <section className="py-12 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-foreground">
            Tous les produits
          </h2>
          <button className="text-primary hover:text-primary/80 font-medium">
            Voir tout →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Load More Section */}
        {hasMoreProducts && (
          <div className="text-center mt-12">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="bg-card hover:bg-card/80 text-card-foreground border border-border px-8 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Chargement...
                </>
              ) : (
                "Charger plus de produits"
              )}
            </button>
          </div>
        )}

        {/* Products count indicator */}
        <div className="text-center mt-4 text-sm text-muted-foreground">
          Affichage de {displayedCount} sur {products.length} produits
        </div>
      </div>
    </section>
    </QueryErrorBoundary>
  );
};

export default ProductGrid;
